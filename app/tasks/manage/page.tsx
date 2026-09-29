"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiSend } from "@/lib/api";
import { Project, Tag, Task, TASK_STATUS, TASK_PRIORITY } from "@/lib/types";
import { Modal, ConfirmDialog } from "@/components/Modal";
import { Spinner, Toast } from "@/components/Toast";
import { TaskStatusBadge, PriorityBadge, TagChip } from "@/components/Badges";

const emptyForm = {
  title: "", description: "", status: 0, priority: 0,
  dueDate: "", projectID: 0, tagIDs: [] as number[],
};

export default function TaskManagePage() {
  const [items, setItems] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiGet<Task[]>("/tasks"), apiGet<Project[]>("/projects"), apiGet<Tag[]>("/tags")])
      .then(([t, p, g]) => { setItems(t); setProjects(p); setTags(g); })
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const filteredItems = useMemo(() => {
    const value = query.trim().toLowerCase();
    return items.filter((task) => `${task.title} ${task.description ?? ""} ${task.projectName ?? ""} ${task.tags.map((tag) => tag.tagName).join(" ")}`.toLowerCase().includes(value));
  }, [items, query]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, projectID: projects[0]?.projectID ?? 0 });
    setErrors({});
    setModalOpen(true);
  };
  const openEdit = (t: Task) => {
    setEditing(t);
    setForm({
      title: t.title, description: t.description ?? "",
      status: t.status, priority: t.priority,
      dueDate: t.dueDate?.slice(0, 10) ?? "",
      projectID: t.projectID, tagIDs: t.tags.map((x) => x.tagID),
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    else if (form.title.length > 200) e.title = "Max 200 characters";
    if (!form.projectID) e.projectID = "Project is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    const payload = { ...form, dueDate: form.dueDate || null, description: form.description || null };
    try {
      if (editing) await apiSend(`/tasks/${editing.taskID}`, "PUT", payload);
      else await apiSend("/tasks", "POST", payload);
      setModalOpen(false);
      setToast({ message: editing ? "Task updated" : "Task created", type: "success" });
      load();
    } catch (err) {
      setToast({ message: (err as Error).message, type: "error" });
    }
  };

  // soft delete (IsActive = false)
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiSend(`/tasks/${deleteTarget.taskID}`, "DELETE");
      setToast({ message: "Task deleted (soft)", type: "success" });
    } catch (err) {
      setToast({ message: (err as Error).message, type: "error" });
    }
    setDeleteTarget(null);
    load();
  };

  if (loading) return <Spinner />;

  const input = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-amber-300 focus:bg-white focus:ring-4 focus:ring-amber-100";

  return (
    <div className="space-y-6">
      <section className="glass-card overflow-hidden rounded-[28px] bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700 p-7 text-white">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-100">Delivery</p>
            <h1 className="text-3xl font-black md:text-4xl">Task Management</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-amber-100">Keep work, priorities and project assignments moving.</p>
          </div>
          <button onClick={openCreate} className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-orange-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-50">
            + New Task
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total tasks", value: items.length, tone: "bg-amber-50 text-amber-700" },
          { label: "In progress", value: items.filter((task) => task.status === 1).length, tone: "bg-orange-50 text-orange-700" },
          { label: "High priority", value: items.filter((task) => task.priority >= 2).length, tone: "bg-rose-50 text-rose-700" },
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
            <h2 className="text-xl font-bold text-slate-800">Task list</h2>
            <p className="text-sm text-slate-500">Showing {filteredItems.length} of {items.length} tasks</p>
          </div>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks, projects, tags..." aria-label="Search tasks" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-amber-300 focus:bg-white focus:ring-4 focus:ring-amber-100 sm:max-w-sm" />
        </div>
        <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-200"><th className="px-4 py-3">ID</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Status</th><th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Tags</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {filteredItems.map((t) => (
              <tr key={t.taskID} className="border-b border-slate-100 transition hover:bg-slate-50/80">
                <td className="px-4 py-4 text-slate-500">#{t.taskID}</td>
                <td className="px-4 py-4 font-semibold text-slate-800">{t.title}</td>
                <td className="px-4 py-4 text-slate-600">{t.projectName}</td>
                <td className="px-4 py-4"><TaskStatusBadge status={t.status} /></td>
                <td className="px-4 py-4"><PriorityBadge priority={t.priority} /></td>
                <td className="px-4 py-4">
                  <span className="flex gap-1 flex-wrap">
                    {t.tags.map((tag) => <TagChip key={tag.tagID} name={tag.tagName} color={tag.color} />)}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button onClick={() => openEdit(t)} className="mr-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100">Edit</button>
                  <button onClick={() => setDeleteTarget(t)} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100">Delete</button>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">No tasks match this search.</td></tr>}
          </tbody>
        </table>
        </div>
      </section>

      <Modal open={modalOpen} title={editing ? "Edit Task" : "New Task"} onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className={input} rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className={input} value={form.status}
                onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}>
                {TASK_STATUS.map((s, i) => <option key={i} value={i}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select className={input} value={form.priority}
                onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}>
                {TASK_PRIORITY.map((p, i) => <option key={i} value={i}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Due date</label>
              <input type="date" className={input} value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project *</label>
              <select className={input} value={form.projectID}
                onChange={(e) => setForm({ ...form, projectID: Number(e.target.value) })}>
                <option value={0}>-- select --</option>
                {projects.map((p) => <option key={p.projectID} value={p.projectID}>{p.projectName}</option>)}
              </select>
              {errors.projectID && <p className="text-red-600 text-xs mt-1">{errors.projectID}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags (multi-select)</label>
            <div className="flex flex-wrap gap-2 border rounded-lg p-2">
              {tags.map((t) => (
                <label key={t.tagID}
                  className={`px-2 py-1 rounded-full text-xs cursor-pointer border ${form.tagIDs.includes(t.tagID)
                    ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600"}`}>
                  <input type="checkbox" className="hidden" checked={form.tagIDs.includes(t.tagID)}
                    onChange={(e) => setForm({
                      ...form,
                      tagIDs: e.target.checked
                        ? [...form.tagIDs, t.tagID]
                        : form.tagIDs.filter((id) => id !== t.tagID),
                    })} />
                  {t.tagName}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
            <button onClick={submit} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">Save</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} message={`Soft-delete task "${deleteTarget?.title}"? It will be hidden (IsActive = false).`}
        onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
