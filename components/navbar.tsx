"use client";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/action/auth";

export function Navbar() {
  const handleLogout = async () => {
    await signOutAction();
  };

  return (
    <nav className="border-b bg-background px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold">App</div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </nav>
  );
}
