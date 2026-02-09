/**
 * Short-lived JWT for WebSocket auth. The client sends this in the "identify" message.
 * Signed with AUTH_SECRET so the gateway (or our WS proxy) can verify it.
 */
import * as jose from "jose";

const ALG = "HS256";
const EXPIRY = "1h";

export async function createChatToken(agentId: string): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  const key = new TextEncoder().encode(secret);
  return await new jose.SignJWT({ agentId })
    .setProtectedHeader({ alg: ALG })
    .setExpirationTime(EXPIRY)
    .setIssuedAt()
    .sign(key);
}

export async function verifyChatToken(
  token: string
): Promise<{ agentId: string } | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jose.jwtVerify(token, key);
    const agentId = payload.agentId as string;
    return agentId ? { agentId } : null;
  } catch {
    return null;
  }
}
