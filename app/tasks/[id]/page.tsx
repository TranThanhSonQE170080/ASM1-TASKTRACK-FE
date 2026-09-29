"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import { Task } from "@/lib/types";
import { TaskStatusBadge, PriorityBadge, TagChip } from "@/components/Badges";
import { Spinner } from "@/components/Toast";

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Task>(`/tasks/${id}`).then(setTask).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!task) return <p className="text-red-600">Task not found.</p>;

  const field = (label: string, value: React.ReactNode) => (
    <div className="py-3 grid grid-cols-3 gap-2">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="col-span-2 text-sm">{value}</dd>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold">{task.title}</h1>
        <TaskStatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>
      <div className="bg-white rounded-xl shadow p-6 divide-y">
        {field("Description", task.description)}
        {field("Project", task.projectName)}
        {field("Due date", task.dueDate)}
        {field("Tags", <span className="flex gap-2 flex-wrap">{task.tags.map(t => <TagChip key={t.tagID} name={t.tagName} color={t.color} />)}</span>)}
        {field("Created", new Date(task.createdDate).toLocaleString())}
        {field("Modified", task.modifiedDate ? new Date(task.modifiedDate).toLocaleString() : "—")}
      </div>
    </div>
  );
}
