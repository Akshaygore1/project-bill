"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import db from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    redirect("/orders");
  } catch (error) {
    console.log(error);
    redirect(`/signup`);
  }
}

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // Call the auth API - if successful, it may handle redirects internally
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    // If we get here, authentication succeeded but no redirect was thrown
    // This means we need to redirect manually
  } catch (error) {
    console.error("Sign in error:", error);

    redirect(`/signin?error="${error}"`);
  }
}

export async function signOutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/");
}

export async function deleteUserAction(userId: string) {
  try {
    // Check if the current user is an admin
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized: Only admins can delete users",
      };
    }

    // Prevent admin from deleting themselves
    if (session.user.id === userId) {
      return { success: false, error: "Cannot delete your own admin account" };
    }

    // Delete the user from the database
    // This will also delete related sessions due to CASCADE constraint
    await db.delete(user).where(eq(user.id, userId));

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message || "Failed to delete user" };
  }
}
