// src/utils/idCode.ts
export function toCode(userId: string) {
  // URL-safe base64 (no padding)
  const b64 = btoa(userId).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return b64;
}

export function fromCode(code: string) {
  const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
  // pad base64
  const padded = b64 + "===".slice((b64.length + 3) % 4);
  return atob(padded);
}