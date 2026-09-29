export interface Department {
  departmentID: number;
  departmentName: string;
  departmentDescription?: string | null;
  isActive: boolean;
}
export interface Project {
  projectID: number;
  projectName: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  status: number;            // 0 NotStarted 1 InProgress 2 Completed 3 OnHold
  departmentID: number;
  departmentName?: string | null;
  isActive: boolean;
  createdDate: string;
}
export interface Tag {
  tagID: number;
  tagName: string;
  color?: string | null;
}
export interface Task {
  taskID: number;
  title: string;
  description?: string | null;
  status: number;            // 0 ToDo 1 InProgress 2 Done 3 Cancelled
  priority: number;          // 0 Low 1 Medium 2 High 3 Critical
  dueDate?: string | null;
  projectID: number;
  projectName?: string | null;
  isActive: boolean;
  createdDate: string;
  modifiedDate?: string | null;
  tags: Tag[];
}
export interface Summary {
  departmentCount: number;
  projectCount: number;
  taskCount: number;
}
export const PROJECT_STATUS = ["Not Started", "In Progress", "Completed", "On Hold"];
export const TASK_STATUS = ["To Do", "In Progress", "Done", "Cancelled"];
export const TASK_PRIORITY = ["Low", "Medium", "High", "Critical"];
