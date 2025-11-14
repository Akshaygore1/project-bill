"use server";

import { auth } from "@/lib/auth";

export async function createWorker({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });
  } catch (error) {
    console.error("Error creating worker:", error);
    throw new Error("Failed to create worker");
  }
}
