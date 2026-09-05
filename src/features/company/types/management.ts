export interface Program {
  _id: string;
  name: string;
  description?: string;
  companyId: string;
  status: 'upcoming' | 'active' | 'completed' | 'archived';
  startDate: string;
  endDate?: string | null;
  internIds: string[];
  maxInterns?: number;
  coverImage?: { public_id: string; secure_url: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  companyId: string;
  programId?: string | null;
  status: 'active' | 'completed' | 'archived';
  startDate?: string | null;
  endDate?: string | null;
  color?: string;
  internIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type InternStatus = 'active' | 'alumni' | 'all';
export type InternSort = 'recent' | 'name' | 'points';

export interface Intern {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: 'intern';
  isConfirmed: boolean;
  enrolledAt?: string;
  enrollmentCompanyId?: string;
  internshipStartDate?: string;
  internshipEndDate?: string | null;
  totalPoints: number;
  bio?: string;
  headline?: string;
  skills?: string[];
  profilePicture?: { public_id?: string; secure_url?: string } | null;
  [key: string]: unknown;
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'complete' | 'archived';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface TaskAttachment {
  public_id: string;
  secure_url: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  companyId: string;
  internId: string;
  projectId?: string | null;
  programId?: string | null;
  assignedBy: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  dueDate: string;
  attachments: TaskAttachment[];
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewerFeedback?: string | null;
  pointsAwarded?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ListResponse<T> {
  data: T[];
  pagination: Pagination;
}
