type SessionPayload = {
  exp: number;
  v: number;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const getCrypto = () => {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto is not available.");
  }
  return globalThis.crypto.subtle;
};

const toBase64Url = (bytes: Uint8Array) => {
  let base64: string;
  if (typeof Buffer !== "undefined") {
    base64 = Buffer.from(bytes).toString("base64");
  } else {
    base64 = btoa(String.fromCharCode(...bytes));
  }
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const fromBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(padded, "base64"));
  }
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const sign = async (data: string, secret: string) => {
  const cryptoSubtle = getCrypto();
  const key = await cryptoSubtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const signature = await cryptoSubtle.sign("HMAC", key, encoder.encode(data));
  return toBase64Url(new Uint8Array(signature));
};

const verify = async (data: string, signature: string, secret: string) => {
  const cryptoSubtle = getCrypto();
  const key = await cryptoSubtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  return cryptoSubtle.verify(
    "HMAC",
    key,
    fromBase64Url(signature),
    encoder.encode(data)
  );
};

export async function createSessionToken(secret: string, ttlMs: number) {
  const payload: SessionPayload = {
    exp: Date.now() + ttlMs,
    v: 1,
  };
  const data = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await sign(data, secret);
  return `${data}.${signature}`;
}

export async function verifySessionToken(token: string, secret: string) {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;
    const valid = await verify(data, signature, secret);
    if (!valid) return null;
    const payload = JSON.parse(decoder.decode(fromBase64Url(data))) as SessionPayload;
    if (!payload?.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
