export type EnrollmentStatus = 'active' | 'completed' | 'withdrawn';

export interface InternCompany {
  _id: string;
  name: string;
  industry?: string;
  logo?: { public_id?: string; secure_url?: string } | null;
}

export interface InternEnrollment {
  _id: string;
  companyId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  internshipStartDate: string;
  internshipEndDate: string | null;
  totalPoints: number;
  company?: InternCompany;
}

export interface InternProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profilePicture?: { public_id?: string; secure_url?: string } | null;
}

export interface InternMePicker {
  profile: InternProfile;
  enrollments: InternEnrollment[];
}

export type AttendanceStatus = 'attended' | 'missed' | 'late' | 'excused';

export interface InternAttendance {
  _id: string;
  internId: string;
  companyId: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
  pointsAwarded?: boolean;
}

export interface InternAttendanceList {
  attendance: InternAttendance[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}