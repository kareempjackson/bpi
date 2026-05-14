"use client";

import { useCallback, type ChangeEvent } from "react";
import { set, unset, type StringInputProps } from "sanity";

/**
 * Pairs a native HTML color swatch with the existing string input, so
 * editors can pick visually or paste an exact hex value. The underlying
 * value stays a 6-digit hex string, keeping the `hexColor` regex
 * validation (and all consumers) working without migration.
 */
function normalizeForPicker(value: string | undefined): string {
  if (!value) return "#cdffe6";
  const hex = value.startsWith("#") ? value : `#${value}`;
  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  return "#cdffe6";
}

export function HexColorInput(props: StringInputProps) {
  const { value, onChange, elementProps } = props;

  const emit = useCallback(
    (next: string) => {
      onChange(next ? set(next.toUpperCase()) : unset());
    },
    [onChange],
  );

  const handlePicker = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => emit(e.target.value),
    [emit],
  );

  const handleText = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.trim();
      if (!raw) {
        onChange(unset());
        return;
      }
      onChange(set(raw));
    },
    [onChange],
  );

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input
        type="color"
        aria-label="Color picker"
        value={normalizeForPicker(value)}
        onChange={handlePicker}
        style={{
          width: 44,
          height: 35,
          padding: 2,
          border: "1px solid var(--card-border-color, #e6e8eb)",
          borderRadius: 3,
          background: "transparent",
          cursor: "pointer",
          flexShrink: 0,
        }}
      />
      <input
        {...(elementProps as object)}
        type="text"
        value={value ?? ""}
        onChange={handleText}
        placeholder="#CAF1FF"
        style={{
          flex: 1,
          height: 35,
          padding: "0 12px",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: 13,
          color: "var(--card-fg-color, inherit)",
          background: "var(--card-bg-color, transparent)",
          border: "1px solid var(--card-border-color, #e6e8eb)",
          borderRadius: 3,
          outline: "none",
        }}
      />
    </div>
  );
}

export default HexColorInput;
