"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "@/components/Toast";

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/accounts", label: "Accounts" },
  { href: "/admin/departments/manage", label: "Departments" },
  { href: "/admin/projects/manage", label: "Projects" },
  { href: "/admin/tasks/manage", label: "Tasks" },
  { href: "/admin/tags/manage", label: "Tags" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { account, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!account || account.role !== 1)) {
      router.replace("/login");
    }
  }, [account, loading, router]);

  if (loading || !account || account.role !== 1) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex h-14 max-w-6xl items-center gap-2 overflow-x-auto px-4">
          <Link href="/" className="mr-5 text-lg font-black tracking-tight text-blue-600">
            TaskTrack Admin
          </Link>
          {adminNav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 lg:px-8">{children}</main>
    </div>
  );
}
