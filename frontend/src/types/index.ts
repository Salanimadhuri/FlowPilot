export type UserRole = "ADMIN" | "MEMBER";
export type WorkspaceRole = "ADMIN" | "MEMBER";
export type ProjectStatus = "PLANNING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ActivityType =
  | "TASK_CREATED" | "TASK_UPDATED" | "TASK_MOVED" | "TASK_DELETED"
  | "TASK_ASSIGNED" | "PROJECT_CREATED" | "PROJECT_UPDATED"
  | "MEMBER_ADDED" | "MEMBER_REMOVED" | "STATUS_CHANGED";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  gradientFrom: string;
  gradientTo: string;
  slug: string;
  memberCount: number;
  projectCount: number;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  user: User;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  color: string;
  dueDate: string | null;
  owner: User | null;
  taskCount: number;
  completedTaskCount: number;
  overdueTaskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  position: number;
  assignee: User | null;
  reporter: User | null;
  projectId: string;
  projectName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  type: ActivityType;
  message: string;
  actor: User | null;
  entityId: string | null;
  entityType: string | null;
  createdAt: string;
}

export interface RiskAlert {
  projectId: string;
  projectName: string;
  overdueCount: number;
  riskLevel: "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
  focusMeter: number;
  dailyMomentum: number;
  riskAlerts: RiskAlert[];
  recentActivity: ActivityLog[];
}

export interface MemberDashboardStats {
  assignedTasks: number;
  completedTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
  focusMeter: number;
  upcomingDeadlines: Task[];
  recentActivity: ActivityLog[];
}
