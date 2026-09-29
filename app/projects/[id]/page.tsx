"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Task } from "@/lib/types";
import { ProjectStatusBadge, TaskStatusBadge, PriorityBadge, TagChip } from "@/components/Badges";
import { Spinner } from "@/components/Toast";

interface ProjectDetail {
  projectID: number; projectName: string; description?: string;
  startDate: string; endDate?: string; status: number;
  departmentName?: string; tasks: Task[];
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<ProjectDetail>(`/projects/${id}`).then(setProject).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!project) return <p className="text-red-600">Project not found.</p>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold">{project.projectName}</h1>
        <ProjectStatusBadge status={project.status} />
      </div>
      <p className="text-gray-600 mb-1">{project.description}</p>
      <p className="text-sm text-gray-500 mb-6">
        {project.startDate} → {project.endDate ?? "…"} · Department: {project.departmentName}
      </p>

      <h2 className="text-xl font-semibold mb-4">Tasks</h2>
      <div className="space-y-3">
        {project.tasks.map((t) => (
          <Link key={t.taskID} href={`/tasks/${t.taskID}`}
            className="block bg-white rounded-xl shadow hover:shadow-md transition p-4">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-medium">{t.title}</span>
              <TaskStatusBadge status={t.status} />
              <PriorityBadge priority={t.priority} />
              {t.tags.map((tag) => <TagChip key={tag.tagID} name={tag.tagName} color={tag.color} />)}
            </div>
            <p className="text-sm text-gray-500">{t.description}</p>
            {t.dueDate && <p className="text-xs text-gray-400 mt-1">Due: {t.dueDate}</p>}
          </Link>
        ))}
        {project.tasks.length === 0 && <p className="text-gray-500">No tasks in this project.</p>}
      </div>
    </div>
  );
}
