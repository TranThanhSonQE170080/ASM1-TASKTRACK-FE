"use client";
import { useCallback, useEffect, useState } from "react";
import { apiGet, apiSend } from "@/lib/api";
import { Account, AccountUpdateDTO } from "@/lib/types";
import { Modal, ConfirmDialog } from "@/components/Modal";
import { Spinner, Toast } from "@/components/Toast";

export default function AccountsPage() {
  const [items, setItems] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [form, setForm] = useState({ fullName: "", role: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    apiGet<Account[]>("/accounts").then(setItems).finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const filteredItems = items.filter((a) =>
    `${a.fullName} ${a.email}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  const openEdit = (a: Account) => {
    setEditing(a);
    setForm({ fullName: a.fullName, role: a.role });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    try {
      const dto: AccountUpdateDTO = { fullName: form.fullName, role: form.role };
      await apiSend<Account>(`/accounts/${editing!.accountID}`, "PUT", dto);
      setModalOpen(false);
      setToast({ message: "Account updated", type: "success" });
      load();
    } catch (err) {
      setToast({ message: (err as Error).message, type: "error" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiSend(`/accounts/${deleteTarget.accountID}`, "DELETE");
      setToast({ message: "Account deleted", type: "success" });
    } catch (err) {
      setToast({ message: (err as Error).message, type: "error" });
    }
    setDeleteTarget(null);
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 p-7 text-white">
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">Account Management</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">Manage all system accounts (Admin only).</p>
      </section>

      <section className="glass-card rounded-[24px] p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Accounts</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search accounts..."
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((a) => (
                <tr key={a.accountID} className="border-b border-slate-100 transition hover:bg-slate-50/80">
                  <td className="px-4 py-4 text-slate-500">#{a.accountID}</td>
                  <td className="px-4 py-4 font-semibold text-slate-800">{a.fullName}</td>
                  <td className="px-4 py-4 text-slate-500">{a.email}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${a.role === 1 ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {a.role === 1 ? "Admin" : "Staff"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-500">{new Date(a.createdDate).toLocaleDateString()}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(a)}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(a)}
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
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No accounts match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={modalOpen} title="Edit Account" onClose={() => setModalOpen(false)}>
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: Number(e.target.value) })}
            >
              <option value={0}>Staff</option>
              <option value={1}>Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="soft-button">
              Cancel
            </button>
            <button
              onClick={submit}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5"
            >
              Save changes
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message={`Delete account "${deleteTarget?.fullName}"? This action cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
