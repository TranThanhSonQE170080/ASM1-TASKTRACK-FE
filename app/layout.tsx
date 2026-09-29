import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskTrack – Task & Team Management",
  description: "PRN232 Assignment 1 – Public CRUD app",
};

const nav = [
  { href: "/", label: "Home" },
  { href: "/departments", label: "Departments" },
  { href: "/search", label: "Search" },
  { href: "/departments/manage", label: "Manage Depts" },
  { href: "/projects/manage", label: "Manage Projects" },
  { href: "/tasks/manage", label: "Manage Tasks" },
  { href: "/tags/manage", label: "Manage Tags" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
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
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
