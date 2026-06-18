"use client";

import { useCallback, useRef, useState } from "react";
import { set, unset, useClient, type ObjectInputProps } from "sanity";

import { apiVersion } from "../env";

/**
 * Custom object input for `portalFile`. Uploads a proprietary file (PDF, deck,
 * spreadsheet, video…) straight from the Studio to the PRIVATE R2 bucket and
 * stores only the object key + metadata — never a public URL.
 *
 * Flow mirrors R2VideoInput but targets `/api/portal/upload-presign` (which
 * PUTs into R2_PRIVATE_BUCKET). The file is then served to logged-in portal
 * users via `/api/portal/download`, which mints a short-lived signed GET.
 */
type PortalFileValue = {
  _type?: string;
  key?: string;
  originalFilename?: string;
  contentType?: string;
  size?: number;
};

const MAX_BYTES = 500 * 1024 * 1024; // 500 MB

export function R2PortalFileInput(props: ObjectInputProps) {
  const value = props.value as PortalFileValue | undefined;
  const { onChange } = props;

  const client = useClient({ apiVersion });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      if (file.size > MAX_BYTES) {
        setError("File exceeds the 500 MB limit.");
        return;
      }
      const token = client.config().token;
      if (!token) {
        setError(
          "Could not read your Studio session — reload and sign in again.",
        );
        return;
      }

      setUploading(true);
      setProgress(0);
      try {
        const presignRes = await fetch("/api/portal/upload-presign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type || "application/octet-stream",
            size: file.size,
          }),
        });
        if (!presignRes.ok) {
          const { error: msg } = (await presignRes
            .json()
            .catch(() => ({}))) as { error?: string };
          throw new Error(msg || `Presign failed (${presignRes.status})`);
        }
        const { uploadUrl, key } = (await presignRes.json()) as {
          uploadUrl: string;
          key: string;
        };

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader(
            "Content-Type",
            file.type || "application/octet-stream",
          );
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
                "Upload failed — check the private R2 bucket's CORS allows PUT from this site.",
              ),
            );
          xhr.send(file);
        });

        onChange(
          set({
            _type: "portalFile",
            key,
            originalFilename: file.name,
            contentType: file.type || "application/octet-stream",
            size: file.size,
          }),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setUploading(false);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [client, onChange],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {value?.key ? (
        <div
          style={{
            fontSize: 13,
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid var(--card-border-color, #e5e7eb)",
            background: "var(--card-muted-bg-color, #f9fafb)",
          }}
        >
          <div style={{ fontWeight: 600 }}>
            {value.originalFilename ?? value.key}
          </div>
          <div style={{ color: "var(--card-muted-fg-color, #6b7280)" }}>
            {value.contentType ?? "file"}
            {typeof value.size === "number"
              ? ` · ${(value.size / 1024 / 1024).toFixed(1)} MB`
              : ""}
          </div>
          <div
            style={{
              fontSize: 11,
              wordBreak: "break-all",
              color: "var(--card-muted-fg-color, #9ca3af)",
              marginTop: 4,
            }}
          >
            {value.key}
          </div>
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
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
            : value?.key
              ? "Replace file"
              : "Upload file to private storage"}
        </button>
        {value?.key && !uploading ? (
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
    </div>
  );
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
