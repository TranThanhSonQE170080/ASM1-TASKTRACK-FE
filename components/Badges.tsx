// Colored badges for status / priority (requirement: never show raw numbers)
const projectStatusStyles = [
  "bg-slate-100 text-slate-700",      // Not Started
  "bg-blue-100 text-blue-700",        // In Progress
  "bg-green-100 text-green-700",      // Completed
  "bg-amber-100 text-amber-700",      // On Hold
];
const taskStatusStyles = [
  "bg-slate-100 text-slate-700",      // To Do
  "bg-blue-100 text-blue-700",        // In Progress
  "bg-green-100 text-green-700",      // Done
  "bg-rose-100 text-rose-700",        // Cancelled
];
const priorityStyles = [
  "bg-emerald-100 text-emerald-700",  // Low
  "bg-sky-100 text-sky-700",          // Medium
  "bg-orange-100 text-orange-700",    // High
  "bg-red-100 text-red-700",          // Critical
];

export function ProjectStatusBadge({ status }: { status: number }) {
  const labels = ["Not Started", "In Progress", "Completed", "On Hold"];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${projectStatusStyles[status]}`}>{labels[status]}</span>;
}
export function TaskStatusBadge({ status }: { status: number }) {
  const labels = ["To Do", "In Progress", "Done", "Cancelled"];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${taskStatusStyles[status]}`}>{labels[status]}</span>;
}
export function PriorityBadge({ priority }: { priority: number }) {
  const labels = ["Low", "Medium", "High", "Critical"];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityStyles[priority]}`}>{labels[priority]}</span>;
}
export function TagChip({ name, color }: { name: string; color?: string | null }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: color || "#6b7280" }}>{name}</span>
  );
}
