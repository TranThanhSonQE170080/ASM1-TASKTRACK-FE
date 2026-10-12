"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Summary } from "@/lib/types";
import { Spinner } from "@/components/Toast";

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Summary>("/summary")
      .then(setSummary)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-8 text-white shadow-[0_30px_70px_rgba(79,70,229,0.35)]">
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">Admin Dashboard</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
          Manage departments, projects, tasks, tags, and user accounts from here.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Departments", value: summary?.departmentCount ?? 0, href: "/admin/departments/manage" },
          { label: "Projects", value: summary?.projectCount ?? 0, href: "/admin/projects/manage" },
          { label: "Tasks", value: summary?.taskCount ?? 0, href: "/admin/tasks/manage" },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="glass-card group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-3 inline-flex rounded-xl bg-blue-50 p-2">
              <span className="text-3xl font-black text-blue-600">{card.value}</span>
            </div>
            <div className="text-sm font-medium text-slate-500">{card.label}</div>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/accounts"
          className="glass-card group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <h2 className="text-lg font-bold text-slate-800 group-hover:text-blue-700">Manage Accounts</h2>
          <p className="mt-1 text-sm text-slate-500">View, edit, and delete user accounts.</p>
        </Link>
        <Link
          href="/admin/departments/manage"
          className="glass-card group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <h2 className="text-lg font-bold text-slate-800 group-hover:text-blue-700">Manage Departments</h2>
          <p className="mt-1 text-sm text-slate-500">Create, edit, and delete departments.</p>
        </Link>
      </section>
    </div>
  );
}
