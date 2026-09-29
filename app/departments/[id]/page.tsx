"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Project } from "@/lib/types";
import { ProjectStatusBadge } from "@/components/Badges";
import { Spinner } from "@/components/Toast";

interface DepartmentDetail {
  departmentID: number; departmentName: string; departmentDescription?: string;
  isActive: boolean; projects: Project[];
}

export default function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [dept, setDept] = useState<DepartmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<DepartmentDetail>(`/departments/${id}`).then(setDept).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!dept) return <p className="text-red-600">Department not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">{dept.departmentName}</h1>
      <p className="text-gray-600 mt-2 mb-6">{dept.departmentDescription}</p>

      <h2 className="text-xl font-semibold mb-4">Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dept.projects.map((p) => (
          <Link key={p.projectID} href={`/projects/${p.projectID}`}
            className="bg-white rounded-xl shadow hover:shadow-md transition p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{p.projectName}</h3>
              <ProjectStatusBadge status={p.status} />
            </div>
            <p className="text-sm text-gray-500 line-clamp-2">{p.description}</p>
          </Link>
        ))}
        {dept.projects.length === 0 && <p className="text-gray-500">No projects in this department.</p>}
      </div>
    </div>
  );
}
