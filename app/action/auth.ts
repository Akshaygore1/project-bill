"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

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

    redirect("/");
  } catch (error: any) {
    const errorMessage = error.message || "An error occurred during sign up";
    redirect(`/signup?error=${encodeURIComponent(errorMessage)}`);
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
  } catch (error: any) {
    console.log("Sign in error:", error);

    // If it's a redirect error (successful auth), let it propagate
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    // For actual authentication errors, redirect back with error message
    const errorMessage = error.message || "An error occurred during sign in";
    redirect(`/signin?error=${encodeURIComponent(errorMessage)}`);
  }
}

export async function signOutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/");
}
