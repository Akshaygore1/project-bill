import { useSession } from "@/lib/auth-client";

/**
 * Hook to check if the current user is an admin
 * @returns boolean indicating if the user is an admin
 */
export function useIsAdmin() {
  const { data: session } = useSession();

  return session?.user.role === "admin";
}
