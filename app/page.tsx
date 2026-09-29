"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Project, Summary } from "@/lib/types";
import { ProjectStatusBadge } from "@/components/Badges";
import { Spinner } from "@/components/Toast";

export default function Home() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet<Summary>("/summary"),
      apiGet<Project[]>("/projects"),
    ]).then(([s, p]) => { setSummary(s); setProjects(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8">
      <section className="glass-card animate-fade-up relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-8 text-white shadow-[0_30px_70px_rgba(79,70,229,0.35)]">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-8 h-24 w-24 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-100">Task & Team Management</p>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">Welcome to TaskTrack</h1>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.2em] text-blue-100">Live overview</div>
            <div className="mt-1 text-2xl font-bold">{summary ? summary.taskCount : 0} tasks</div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Departments", value: summary?.departmentCount ?? 0, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Projects", value: summary?.projectCount ?? 0, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Tasks", value: summary?.taskCount ?? 0, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((item, index) => (
          <div
            key={item.label}
            className="glass-card animate-fade-up rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className={`mb-3 inline-flex rounded-xl ${item.bg} p-2`}>
              <div className={`text-3xl font-black ${item.color}`}>{item.value}</div>
            </div>
            <div className="text-sm font-medium text-slate-500">{item.label}</div>
          </div>
        ))}
      </section>

      <section className="animate-fade-up">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Active Projects</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{projects.length} items</span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.projectID}
              href={`/projects/${p.projectID}`}
              className="glass-card group rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="line-clamp-1 text-lg font-semibold text-slate-800">{p.projectName}</h3>
                <ProjectStatusBadge status={p.status} />
              </div>
              <p className="line-clamp-2 text-sm leading-6 text-slate-500">{p.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Department</span>
                <span className="text-sm font-semibold text-slate-700">{p.departmentName ?? "—"}</span>
              </div>
            </Link>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="glass-card rounded-2xl p-8 text-center text-slate-500">No active projects.</div>
        )}
      </section>
    </div>
  );
}
