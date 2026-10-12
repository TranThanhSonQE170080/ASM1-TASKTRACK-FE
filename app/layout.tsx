import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "TaskTrack – Task & Team Management",
  description: "PRN232 Assignment 2 – JWT auth & role-based authorization",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
