"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiSend } from "@/lib/api";
import { Department, Project, PROJECT_STATUS } from "@/lib/types";
import { Modal, ConfirmDialog } from "@/components/Modal";
import { Spinner, Toast } from "@/components/Toast";
import { ProjectStatusBadge } from "@/components/Badges";

const emptyForm = {
  projectName: "", description: "", startDate: "", endDate: "",
  status: 0, departmentID: 0, isActive: true,
};

export default function ProjectManagePage() {
  const [items, setItems] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiGet<Project[]>("/projects"), apiGet<Department[]>("/departments")])
      .then(([p, d]) => { setItems(p); setDepartments(d); })
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const filteredItems = useMemo(() => {
    const value = query.trim().toLowerCase();
    return items.filter((project) => `${project.projectName} ${project.description ?? ""} ${project.departmentName ?? ""}`.toLowerCase().includes(value));
  }, [items, query]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, departmentID: departments[0]?.departmentID ?? 0 });
    setErrors({});
    setModalOpen(true);
  };
  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({
      projectName: p.projectName, description: p.description ?? "",
      startDate: p.startDate?.slice(0, 10) ?? "", endDate: p.endDate?.slice(0, 10) ?? "",
      status: p.status, departmentID: p.departmentID, isActive: p.isActive,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.projectName.trim()) e.projectName = "Project name is required";
    if (!form.startDate) e.startDate = "Start date is required";
    if (!form.departmentID) e.departmentID = "Department is required";
    if (form.endDate && form.startDate && form.endDate < form.startDate)
      e.endDate = "End date must be after start date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    const payload = {
      ...form,
      description: form.description || null,
      endDate: form.endDate || null,
    };
    try {
      if (editing) await apiSend(`/projects/${editing.projectID}`, "PUT", payload);
      else await apiSend("/projects", "POST", payload);
      setModalOpen(false);
      setToast({ message: editing ? "Project updated" : "Project created", type: "success" });
      load();
    } catch (err) {
      setToast({ message: (err as Error).message, type: "error" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiSend(`/projects/${deleteTarget.projectID}`, "DELETE");
      setToast({ message: "Project deleted", type: "success" });
    } catch (err) {
      setToast({ message: (err as Error).message, type: "error" });
    }
    setDeleteTarget(null);
    load();
  };

  if (loading) return <Spinner />;

  const input = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100";

  return (
    <div className="space-y-6">
      <section className="glass-card overflow-hidden rounded-[28px] bg-gradient-to-br from-cyan-700 via-teal-700 to-emerald-800 p-7 text-white">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-teal-100">Portfolio</p>
            <h1 className="text-3xl font-black md:text-4xl">Project Management</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-teal-100">Track ownership, delivery status and project timelines.</p>
          </div>
          <button onClick={openCreate} className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-teal-50">
            + New Project
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total projects", value: items.length, tone: "bg-cyan-50 text-cyan-700" },
          { label: "In progress", value: items.filter((project) => project.status === 1).length, tone: "bg-blue-50 text-blue-700" },
          { label: "Completed", value: items.filter((project) => project.status === 2).length, tone: "bg-emerald-50 text-emerald-700" },
        ].map((metric) => (
          <div key={metric.label} className="glass-card rounded-2xl p-5">
            <div className={`inline-flex rounded-xl px-3 py-2 text-2xl font-black ${metric.tone}`}>{metric.value}</div>
            <p className="mt-3 text-sm font-medium text-slate-500">{metric.label}</p>
          </div>
        ))}
      </section>

      <section className="glass-card overflow-hidden rounded-[24px] p-4 md:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Project directory</h2>
            <p className="text-sm text-slate-500">Showing {filteredItems.length} of {items.length} projects</p>
          </div>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." aria-label="Search projects" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal-300 focus:bg-white focus:ring-4 focus:ring-teal-100 sm:max-w-sm" />
        </div>
        <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-200"><th className="px-4 py-3">ID</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Status</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {filteredItems.map((p) => (
              <tr key={p.projectID} className="border-b border-slate-100 transition hover:bg-slate-50/80">
                <td className="px-4 py-4 text-slate-500">#{p.projectID}</td>
                <td className="px-4 py-4 font-semibold text-slate-800">{p.projectName}</td>
                <td className="px-4 py-4 text-slate-600">{p.departmentName}</td>
                <td className="px-4 py-4"><ProjectStatusBadge status={p.status} /></td>
                <td className="px-4 py-4 text-xs text-slate-500">{p.startDate} → {p.endDate ?? "…"}</td>
                <td className="px-4 py-4 text-right">
                  <button onClick={() => openEdit(p)} className="mr-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-800 transition hover:bg-teal-100">Edit</button>
                  <button onClick={() => setDeleteTarget(p)} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100">Delete</button>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">No projects match this search.</td></tr>}
          </tbody>
        </table>
        </div>
      </section>

      <Modal open={modalOpen} title={editing ? "Edit Project" : "New Project"} onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input className={input} value={form.projectName}
              onChange={(e) => setForm({ ...form, projectName: e.target.value })} />
            {errors.projectName && <p className="text-red-600 text-xs mt-1">{errors.projectName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className={input} rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start date *</label>
              <input type="date" className={input} value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              {errors.startDate && <p className="text-red-600 text-xs mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End date</label>
              <input type="date" className={input} value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              {errors.endDate && <p className="text-red-600 text-xs mt-1">{errors.endDate}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className={input} value={form.status}
                onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}>
                {PROJECT_STATUS.map((s, i) => <option key={i} value={i}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Department *</label>
              <select className={input} value={form.departmentID}
                onChange={(e) => setForm({ ...form, departmentID: Number(e.target.value) })}>
                <option value={0}>-- select --</option>
                {departments.map((d) => <option key={d.departmentID} value={d.departmentID}>{d.departmentName}</option>)}
              </select>
              {errors.departmentID && <p className="text-red-600 text-xs mt-1">{errors.departmentID}</p>}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
            <button onClick={submit} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">Save</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} message={`Delete project "${deleteTarget?.projectName}"? This cannot be undone.`}
        onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
