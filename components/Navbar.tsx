"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const nav = [
  { href: "/", label: "Home" },
  { href: "/departments", label: "Departments" },
  { href: "/search", label: "Search" },
];

export default function Navbar() {
  const { account, loading, logout } = useAuth();

  if (loading) return null;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-2 overflow-x-auto px-4">
        <Link href="/" className="mr-5 whitespace-nowrap text-lg font-black tracking-tight text-blue-600">
          TaskTrack
        </Link>
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
          >
            {n.label}
          </Link>
        ))}
        {account ? (
          <>
            {account.role === 1 && (
              <Link
                href="/admin"
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
              >
                Admin
              </Link>
            )}
            <button
              onClick={logout}
              className="ml-auto whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
            >
              Logout ({account.fullName})
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="ml-auto whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
            >
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
