"use client";

import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SignInPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function SignInPage({ searchParams }: SignInPageProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle search params on client side
  searchParams.then((params) => {
    const errorParam = typeof params.error === "string" ? params.error : null;
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  });

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "An error occurred during sign in");
      } else {
        // Successful sign in - redirect to home
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Sign In</h1>
      {error && (
        <div className="text-red-500 text-sm text-center max-w-64">{error}</div>
      )}
      <form action={handleSubmit} className="flex flex-col gap-3 w-64">
        <Input type="email" name="email" placeholder="Email" required />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
