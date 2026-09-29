"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiSend } from "@/lib/api";
import { Tag } from "@/lib/types";
import { Modal, ConfirmDialog } from "@/components/Modal";
import { Spinner, Toast } from "@/components/Toast";
import { TagChip } from "@/components/Badges";

export default function TagManagePage() {
  const [items, setItems] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [form, setForm] = useState({ tagName: "", color: "#6b7280" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    apiGet<Tag[]>("/tags").then(setItems).finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const filteredItems = useMemo(() => {
    const value = query.trim().toLowerCase();
    return items.filter((tag) => `${tag.tagName} ${tag.color ?? ""}`.toLowerCase().includes(value));
  }, [items, query]);

  const openCreate = () => {
    setEditing(null);
    setForm({ tagName: "", color: "#6b7280" });
    setErrors({});
    setModalOpen(true);
  };
  const openEdit = (t: Tag) => {
    setEditing(t);
    setForm({ tagName: t.tagName, color: t.color ?? "#6b7280" });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.tagName.trim()) e.tagName = "Tag name is required";
    else if (form.tagName.length > 50) e.tagName = "Max 50 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    try {
      if (editing) await apiSend(`/tags/${editing.tagID}`, "PUT", form);
      else await apiSend("/tags", "POST", form);
      setModalOpen(false);
      setToast({ message: editing ? "Tag updated" : "Tag created", type: "success" });
      load();
    } catch (err) {
      setToast({ message: (err as Error).message, type: "error" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiSend(`/tags/${deleteTarget.tagID}`, "DELETE");
      setToast({ message: "Tag deleted", type: "success" });
    } catch (err) {
      setToast({ message: (err as Error).message, type: "error" });
    }
    setDeleteTarget(null);
    load();
  };

  if (loading) return <Spinner />;

  const input = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100";

  return (
    <div className="space-y-6">
      <section className="glass-card overflow-hidden rounded-[28px] bg-gradient-to-br from-rose-600 via-pink-700 to-fuchsia-800 p-7 text-white">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-rose-100">Organization</p>
            <h1 className="text-3xl font-black md:text-4xl">Tag Management</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-rose-100">Create a clear visual language for task categories.</p>
          </div>
          <button onClick={openCreate} className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-rose-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-rose-50">
            + New Tag
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {[
          { label: "Total tags", value: items.length, tone: "bg-rose-50 text-rose-700" },
          { label: "Custom colors", value: items.filter((tag) => Boolean(tag.color)).length, tone: "bg-pink-50 text-pink-700" },
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
            <h2 className="text-xl font-bold text-slate-800">Tag directory</h2>
            <p className="text-sm text-slate-500">Showing {filteredItems.length} of {items.length} tags</p>
          </div>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tags or colors..." aria-label="Search tags" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100 sm:max-w-sm" />
        </div>
        <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-200"><th className="px-4 py-3">ID</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Preview</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {filteredItems.map((t) => (
              <tr key={t.tagID} className="border-b border-slate-100 transition hover:bg-slate-50/80">
                <td className="px-4 py-4 text-slate-500">#{t.tagID}</td>
                <td className="px-4 py-4 font-semibold text-slate-800">{t.tagName}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="h-5 w-5 rounded-md border border-black/10 shadow-sm" style={{ backgroundColor: t.color || "#6b7280" }} />
                    <TagChip name={t.tagName} color={t.color} />
                    <span className="font-mono text-xs text-slate-400">{t.color || "#6b7280"}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <button onClick={() => openEdit(t)} className="mr-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-800 transition hover:bg-rose-100">Edit</button>
                  <button onClick={() => setDeleteTarget(t)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100">Delete</button>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-500">No tags match this search.</td></tr>}
          </tbody>
        </table>
        </div>
      </section>

      <Modal open={modalOpen} title={editing ? "Edit Tag" : "New Tag"} onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input className={input} value={form.tagName} onChange={(e) => setForm({ ...form, tagName: e.target.value })} />
            {errors.tagName && <p className="text-red-600 text-xs mt-1">{errors.tagName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <input type="color" className="h-10 w-16 border rounded-lg" value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
            <button onClick={submit} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">Save</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} message={`Delete tag "${deleteTarget?.tagName}"?`}
        onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
