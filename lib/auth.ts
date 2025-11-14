import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { headers } from "next/headers";
import db from "../db";
import * as schema from "../db/schema";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  user: {
    additionalFields: {
      contactNumber: {
        type: "string",
        required: false,
      },
      address: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [admin()],
});

/**
 * Get the current user session
 */
export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin() {
  const session = await getSession();
  return session?.user.role === "admin";
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}
