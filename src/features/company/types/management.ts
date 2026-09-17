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
  attachment?: TaskAttachment | null;
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
  categories?: string[];
  profilePicture?: { public_id?: string; secure_url?: string } | null;
  coverPicture?: { public_id?: string; secure_url?: string } | null;
  resume?: { public_id?: string; secure_url?: string } | null;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  education?: {
    institution?: string;
    degree?: string;
    field?: string;
    grade?: string;
    startDate?: string;
    endDate?: string;
  }[];
  experience?: {
    internshipTitle?: string;
    companyName?: string;
    completedAt?: string;
    rating?: number;
    feedback?: string;
  }[];
  courses?: {
    name?: string;
    certificate?: { public_id?: string; secure_url?: string };
  }[];
  ratingCount?: number;
  ratingSum?: number;
  [key: string]: unknown;
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'complete' | 'archived';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskTarget = 'company' | 'program' | 'project' | 'intern';

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
  taskGroupId?: string | null;
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

export interface TaskBroadcastResult {
  task?: Task;
  tasks?: Task[];
  count?: number;
  groupId?: string;
  target?: TaskTarget;
  members?: number;
}

export type AttendanceStatus = 'attended' | 'missed' | 'late' | 'excused';

export interface AttendanceRecord {
  _id: string;
  internId: string;
  companyId: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
  markedBy?: string;
  pointsAwarded?: boolean;
}

export interface AttendanceDayRule {
  day: 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  startTime: string;
  endTime: string | null;
  workday: boolean;
}

export interface AttendanceScheduleEntry {
  programId: string;
  rules: AttendanceDayRule[];
  timezone: string;
}
