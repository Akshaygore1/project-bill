import Link from "next/link";

export default async function Home() {
  return (
    <div className="flex font-bold text-5xl flex-col items-center justify-center h-screen gap-4">
      <Link className="text-black underline" href="/signin">
        Sign In
      </Link>
    </div>
  );
}
