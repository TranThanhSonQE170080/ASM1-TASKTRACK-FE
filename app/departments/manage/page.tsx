"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiSend } from "@/lib/api";
import { Department } from "@/lib/types";
import { Modal, ConfirmDialog } from "@/components/Modal";
import { Spinner, Toast } from "@/components/Toast";

export default function DepartmentManagePage() {
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState({ departmentName: "", departmentDescription: "", isActive: true });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    apiGet<Department[]>("/departments").then(setItems).finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const filteredItems = useMemo(() => {
    const value = query.trim().toLowerCase();
    return items.filter((department) => {
      const matchesQuery = !value || `${department.departmentName} ${department.departmentDescription ?? ""}`.toLowerCase().includes(value);
      const matchesStatus = statusFilter === "all" || department.isActive === (statusFilter === "active");
      return matchesQuery && matchesStatus;
    });
  }, [items, query, statusFilter]);

  const activeCount = items.filter((d) => d.isActive).length;
  const inactiveCount = items.length - activeCount;

  const openCreate = () => {
    setEditing(null);
    setForm({ departmentName: "", departmentDescription: "", isActive: true });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (d: Department) => {
    setEditing(d);
    setForm({ departmentName: d.departmentName, departmentDescription: d.departmentDescription ?? "", isActive: d.isActive });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.departmentName.trim()) e.departmentName = "Department name is required";
    else if (form.departmentName.length > 100) e.departmentName = "Max 100 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    try {
      if (editing) await apiSend(`/departments/${editing.departmentID}`, "PUT", form);
      else await apiSend("/departments", "POST", form);
      setModalOpen(false);
      setToast({ message: editing ? "Department updated" : "Department created", type: "success" });
      load();
    } catch (err) {
      setToast({ message: (err as Error).message, type: "error" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiSend(`/departments/${deleteTarget.departmentID}`, "DELETE");
      setToast({ message: "Department deleted", type: "success" });
    } catch (err) {
      setToast({ message: (err as Error).message, type: "error" });
    }
    setDeleteTarget(null);
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <section className="glass-card overflow-hidden rounded-[28px] bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 p-7 text-white">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-100">Operations</p>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">Department Management</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">Keep teams organized and their ownership details up to date.</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-blue-50"
          >
            + New Department
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total", value: items.length, tone: "text-blue-600 bg-blue-50" },
          { label: "Active", value: activeCount, tone: "text-emerald-600 bg-emerald-50" },
          { label: "Inactive", value: inactiveCount, tone: "text-slate-600 bg-slate-100" },
        ].map((card) => (
          <div key={card.label} className="glass-card rounded-2xl p-5">
            <div className={`inline-flex rounded-xl px-2.5 py-2 ${card.tone}`}>
              <span className="text-2xl font-black">{card.value}</span>
            </div>
            <div className="mt-4 text-sm font-medium text-slate-500">{card.label}</div>
          </div>
        ))}
      </section>

      <section className="glass-card rounded-[24px] p-4 md:p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Department directory</h2>
            <p className="text-sm text-slate-500">Showing {filteredItems.length} of {items.length} departments</p>
          </div>

          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Filter departments by status">
              {([
                ["all", `All ${items.length}`],
                ["active", `Active ${activeCount}`],
                ["inactive", `Inactive ${inactiveCount}`],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={statusFilter === value}
                  onClick={() => setStatusFilter(value)}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${statusFilter === value ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search departments..."
              aria-label="Search departments"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((d) => (
                <tr key={d.departmentID} className="border-b border-slate-100 transition hover:bg-slate-50/80">
                  <td className="px-4 py-4 text-slate-500">#{d.departmentID}</td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-800">{d.departmentName}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-500">
                    <div className="max-w-md line-clamp-2">{d.departmentDescription || "No description"}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${d.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                      {d.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(d)}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(d)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    <div className="font-semibold text-slate-700">No departments match these filters</div>
                    <p className="mt-1 text-sm">Try a different search or status.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={modalOpen} title={editing ? "Edit Department" : "New Department"} onClose={() => setModalOpen(false)}>
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Department name *</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              value={form.departmentName}
              onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
            />
            {errors.departmentName && <p className="mt-1 text-xs text-red-600">{errors.departmentName}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              value={form.departmentDescription}
              onChange={(e) => setForm({ ...form, departmentDescription: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Active department
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="soft-button">
              Cancel
            </button>
            <button onClick={submit} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5">
              Save changes
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message={`Delete department "${deleteTarget?.departmentName}"? This action cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
