import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  console.log(session);
  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl font-bold">Cosden Solutions</h1>
      <div className="mt-8 text-center">
        <p className="text-lg mb-4">User ID: {session.user.id}</p>
      </div>
    </div>
  );
}
