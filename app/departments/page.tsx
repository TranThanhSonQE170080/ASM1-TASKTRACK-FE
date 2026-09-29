"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Department } from "@/lib/types";
import { Spinner } from "@/components/Toast";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Department[]>("/departments").then(setDepartments).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Departments</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((d) => (
          <Link key={d.departmentID} href={`/departments/${d.departmentID}`}
            className="bg-white rounded-xl shadow hover:shadow-md transition p-5">
            <h2 className="font-semibold text-lg">{d.departmentName}</h2>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{d.departmentDescription}</p>
          </Link>
        ))}
        {departments.length === 0 && <p className="text-gray-500">No departments.</p>}
      </div>
    </div>
  );
}
