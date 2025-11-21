import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { SessionPayload } from "@/lib/definitions";
import db from "./prisma";
import { Role } from "@/generated/prisma/enums";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    // Return null if session is empty or undefined
    if (!session) return null;

    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error: unknown) {
    console.log("Failed to verify session:", error);
    return null;
  }
}

export async function createSession(user: { id: string; role: Role }) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const data = await db.session.create({
    data: {
      userId: user.id,
      expiresAt,
    },
  });

  const sessionId = data.id;

  // Encrypt the session ID and userId
  const session = await encrypt({
    userId: user.id,
    sessionId,
    role: user.role,
    expiresAt,
  });

  // Store the session in cookies for optimistic auth checks
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}