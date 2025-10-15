"use client";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/action/auth";
import Link from "next/link";

export function Navbar() {
  const handleLogout = async () => {
    await signOutAction();
  };

  return (
    <nav className="border-b bg-background px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="font-semibold">App</div>
          <Link href="/customers" className="hover:text-blue-600">
            Customers
          </Link>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </nav>
  );
}
