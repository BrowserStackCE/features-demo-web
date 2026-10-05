import { createHmac, timingSafeEqual } from "node:crypto";

export type PollTokenPayload = {
  runId: number;
  workflow: string;
};

function getSecret(): string {
  const secret = process.env.TOKEN_SECRET || process.env.GITHUB_TOKEN;
  if (!secret) {
    throw new Error("TOKEN_SECRET or GITHUB_TOKEN is required to sign poll tokens");
  }
  return secret;
}

function base64UrlEncode(value: string | Buffer): string {
  const buf = typeof value === "string" ? Buffer.from(value, "utf8") : value;
  return buf.toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payloadB64: string): string {
  return createHmac("sha256", getSecret()).update(payloadB64).digest("base64url");
}

export function mintPollToken(payload: PollTokenPayload): string {
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

export function verifyPollToken(token: string): PollTokenPayload {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) {
    throw new Error("Invalid token format");
  }

  const expected = sign(payloadB64);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid token signature");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(base64UrlDecode(payloadB64));
  } catch {
    throw new Error("Invalid token payload");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    typeof (parsed as PollTokenPayload).runId !== "number" ||
    typeof (parsed as PollTokenPayload).workflow !== "string"
  ) {
    throw new Error("Invalid token payload");
  }

  return parsed as PollTokenPayload;
}
