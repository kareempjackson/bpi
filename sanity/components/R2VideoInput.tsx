"use client";

import { useCallback, useRef, useState } from "react";
import { set, unset, useClient, type StringInputProps } from "sanity";

import { apiVersion } from "../env";
import { getStudioToken } from "../lib/studioToken";

/**
 * Custom input for the `externalVideoUrl` field. Lets editors upload a video
 * straight from the Studio to Cloudflare R2 — they never see Cloudflare or
 * touch a URL. The flow:
 *   1. ask `/api/r2/presign` (authenticated with the editor's Sanity token)
 *      for a short-lived PUT URL,
 *   2. PUT the file directly to R2 (browser → R2, with progress),
 *   3. store the resulting public URL as the field value.
 *
 * GROQ coalesces this URL over any Sanity upload, so the site plays the video
 * from R2 and the bytes never bill against Sanity bandwidth.
 */
type R2MediaInputProps = StringInputProps & { mediaKind?: "video" | "audio" };

function R2MediaInput(props: R2MediaInputProps) {
  const { value, onChange, mediaKind: mediaKindProp } = props;
  const mediaKind = mediaKindProp ?? "video";
  const isAudio = mediaKind === "audio";
  const accept = isAudio
    ? "audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/aac,audio/x-m4a"
    : "video/mp4,video/webm,video/quicktime";
  const noun = isAudio ? "audio" : "video";

  const client = useClient({ apiVersion });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      if (!file.type.startsWith(`${mediaKind}/`)) {
        setError(
          isAudio
            ? "Please choose an audio file (MP3, M4A, WAV, etc.)."
            : "Please choose a video file (MP4 or WebM).",
        );
        return;
      }
      const token = getStudioToken(client);
      if (!token) {
        setError(
          "Could not read your Studio session — try reloading and signing in again.",
        );
        return;
      }

      setUploading(true);
      setProgress(0);
      try {
        // 1. Get a presigned PUT URL.
        const presignRes = await fetch("/api/r2/presign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            size: file.size,
          }),
        });
        if (!presignRes.ok) {
          const { error: msg } = (await presignRes.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(msg || `Presign failed (${presignRes.status})`);
        }
        const { uploadUrl, publicUrl, cacheControl } =
          (await presignRes.json()) as {
            uploadUrl: string;
            publicUrl: string;
            cacheControl?: string;
          };

        // 2. PUT straight to R2, with upload progress (XHR — fetch can't report it).
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          // Must match the Cache-Control the server signed, or R2 rejects the
          // PUT with a signature mismatch. Bakes a 1-year immutable cache onto
          // the object so browsers never re-fetch it after the first load.
          if (cacheControl) xhr.setRequestHeader("Cache-Control", cacheControl);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          };
          xhr.onload = () =>
            xhr.status >= 200 && xhr.status < 300
              ? resolve()
              : reject(new Error(`Upload failed (${xhr.status})`));
          xhr.onerror = () =>
            reject(
              new Error(
                "Upload failed — check the R2 bucket's CORS policy allows PUT from this site.",
              ),
            );
          xhr.send(file);
        });

        // 3. Store the public URL.
        onChange(set(publicUrl));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setUploading(false);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [client, onChange, mediaKind, isAudio],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {value ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {isAudio ? (
            <audio src={value} controls style={{ width: "100%" }} />
          ) : (
            <video
              src={value}
              muted
              playsInline
              controls
              style={{
                width: "100%",
                maxHeight: 220,
                borderRadius: 6,
                background: "#000",
              }}
            />
          )}
          <div
            style={{
              fontSize: 12,
              wordBreak: "break-all",
              color: "var(--card-muted-fg-color, #6b7280)",
            }}
          >
            {value}
          </div>
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        disabled={uploading}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          style={buttonStyle(uploading)}
        >
          {uploading
            ? `Uploading… ${progress}%`
            : value
              ? `Replace ${noun}`
              : `Upload ${noun} to R2`}
        </button>
        {value && !uploading ? (
          <button
            type="button"
            onClick={() => onChange(unset())}
            style={{ ...buttonStyle(false), background: "transparent" }}
          >
            Remove
          </button>
        ) : null}
      </div>

      {uploading ? (
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: "var(--card-border-color, #e5e7eb)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "var(--card-focus-ring-color, #2563eb)",
              transition: "width 120ms linear",
            }}
          />
        </div>
      ) : null}

      {error ? (
        <div style={{ color: "#dc2626", fontSize: 12 }}>{error}</div>
      ) : null}

      {/* Keep the raw URL field available as a manual fallback. renderDefault
          carries Sanity's focus/ref/aria wiring (elementProps), so we don't
          spread those ourselves and risk a duplicate id/ref. */}
      <details style={{ fontSize: 12 }}>
        <summary style={{ cursor: "pointer" }}>Or paste a URL manually</summary>
        <div style={{ marginTop: 6 }}>{props.renderDefault(props)}</div>
      </details>
    </div>
  );
}

/** Field-input wrappers — Sanity instantiates these with no extra props, so the
 *  media kind is baked in here rather than read from schema options. */
export function R2VideoInput(props: StringInputProps) {
  return <R2MediaInput {...props} mediaKind="video" />;
}
export function R2AudioInput(props: StringInputProps) {
  return <R2MediaInput {...props} mediaKind="audio" />;
}

function buttonStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: "6px 12px",
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 6,
    border: "1px solid var(--card-border-color, #d1d5db)",
    background: disabled
      ? "var(--card-muted-bg-color, #f3f4f6)"
      : "var(--card-bg-color, #fff)",
    color: "var(--card-fg-color, #111827)",
    cursor: disabled ? "default" : "pointer",
  };
}
