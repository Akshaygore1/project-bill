import Link from "next/link";

import { getSession, isAdmin } from "@/lib/auth";
import { signOutAction } from "../../action/auth";
import { Button } from "@/components/ui/button";
import UserManagement from "@/components/user-management";

export default async function AdminDashboard() {
  const session = await getSession();
  const userIsAdmin = await isAdmin();

  // This should never happen due to middleware, but just in case
  if (!session || !userIsAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-4xl font-bold text-red-600">Access Denied</h1>
        <p className="text-lg">
          You don't have permission to access this page.
        </p>
        <Button>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen gap-4 p-4">
      <h1 className="text-4xl font-bold">Admin Dashboard</h1>
      <UserManagement />
    </div>
  );
}
