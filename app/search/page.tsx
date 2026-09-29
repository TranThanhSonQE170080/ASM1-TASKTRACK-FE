"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Project, Tag, Task, TASK_STATUS, TASK_PRIORITY } from "@/lib/types";
import { TaskStatusBadge, PriorityBadge, TagChip } from "@/components/Badges";
import { Spinner } from "@/components/Toast";

// Search page: filters update results as they change (bonus: status filter included)
export default function SearchPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [projectId, setProjectId] = useState("");
  const [tagId, setTagId] = useState("");

  useEffect(() => {
    Promise.all([apiGet<Project[]>("/projects"), apiGet<Tag[]>("/tags")])
      .then(([p, t]) => { setProjects(p); setTags(t); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (title) params.set("title", title);
    if (status !== "") params.set("status", status);
    if (priority !== "") params.set("priority", priority);
    if (projectId) params.set("projectId", projectId);
    if (tagId) params.set("tagId", tagId);
    const t = setTimeout(() => {
      apiGet<Task[]>(`/tasks/search?${params.toString()}`).then(setTasks).catch(() => setTasks([]));
    }, 300); // debounce
    return () => clearTimeout(t);
  }, [title, status, priority, projectId, tagId]);

  if (loading) return <Spinner />;

  const select = "border rounded-lg px-3 py-2 text-sm bg-white";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Search Tasks</h1>

      <div className="bg-white rounded-xl shadow p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <input className={select} placeholder="Title contains..." value={title}
          onChange={(e) => setTitle(e.target.value)} />
        <select className={select} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {TASK_STATUS.map((s, i) => <option key={i} value={i}>{s}</option>)}
        </select>
        <select className={select} value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          {TASK_PRIORITY.map((p, i) => <option key={i} value={i}>{p}</option>)}
        </select>
        <select className={select} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          <option value="">All projects</option>
          {projects.map((p) => <option key={p.projectID} value={p.projectID}>{p.projectName}</option>)}
        </select>
        <select className={select} value={tagId} onChange={(e) => setTagId(e.target.value)}>
          <option value="">All tags</option>
          {tags.map((t) => <option key={t.tagID} value={t.tagID}>{t.tagName}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {tasks.map((t) => (
          <Link key={t.taskID} href={`/tasks/${t.taskID}`}
            className="block bg-white rounded-xl shadow hover:shadow-md transition p-4">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-medium">{t.title}</span>
              <TaskStatusBadge status={t.status} />
              <PriorityBadge priority={t.priority} />
              {t.tags.map((tag) => <TagChip key={tag.tagID} name={tag.tagName} color={tag.color} />)}
            </div>
            <p className="text-sm text-gray-500">{t.projectName}</p>
          </Link>
        ))}
        {tasks.length === 0 && <p className="text-gray-500">No tasks match your filters.</p>}
      </div>
    </div>
  );
}
