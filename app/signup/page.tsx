"use client";

import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle search params on client side
  searchParams.then((params) => {
    if (params.error) {
      setError(decodeURIComponent(params.error));
    }
  });

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || "An error occurred during sign up");
      } else {
        // Successful sign up - redirect to home
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      <form action={handleSubmit} className="flex flex-col gap-3 w-64">
        <Input type="text" name="name" placeholder="Name" required />
        <Input type="email" name="email" placeholder="Email" required />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        {error && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </Button>
      </form>
    </div>
  );
}
