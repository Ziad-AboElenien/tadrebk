import api from '@/lib/axios';
import {
  InternMePicker,
  InternEnrollment,
  InternProfile,
  InternAttendance,
  InternAttendanceList,
} from '@/features/intern/types';
import { Program, Pagination } from '@/features/company/types/management';

interface PickerEnvelope {
  data?: InternMePicker | { profile: InternProfile; enrollments: InternEnrollment[] };
  profile?: InternProfile;
  enrollments?: InternEnrollment[];
  msg?: string;
}

interface PerCompanyEnvelope {
  data?: Record<string, unknown>;
  msg?: string;
}

interface ProgramEnvelope {
  data?: Program | { program?: Program };
  program?: Program;
  msg?: string;
}

interface AttendanceEnvelope {
  data?: InternAttendance[] | { attendance?: InternAttendance[]; pagination?: Pagination } | { attendance: InternAttendance[]; pagination?: Pagination };
  attendance?: InternAttendance[];
  pagination?: Pagination;
  msg?: string;
}

export const internMeService = {
  async getPicker(): Promise<InternMePicker> {
    const { data } = await api.get<PickerEnvelope>('/intern/me');
    const raw = data?.data as { profile?: InternProfile; enrollments?: InternEnrollment[] } | undefined;
    return {
      profile: raw?.profile ?? data?.profile ?? ({} as InternProfile),
      enrollments: raw?.enrollments ?? data?.enrollments ?? [],
    };
  },

  async getCompanyView(companyId: string): Promise<Record<string, unknown>> {
    const { data } = await api.get<PerCompanyEnvelope>(`/intern/me/${companyId}`);
    return (data?.data as Record<string, unknown>) ?? {};
  },

  async getProgram(companyId: string): Promise<Program | undefined> {
    const { data } = await api.get<ProgramEnvelope>(`/intern/me/${companyId}/program`);
    const raw = Array.isArray(data?.data)
      ? undefined
      : (data?.data as Program | { program?: Program } | undefined);
    if (!raw) return undefined;
    return 'program' in raw ? (raw as { program?: Program }).program : (raw as Program);
  },

  async getSupervisor(companyId: string): Promise<Record<string, unknown>> {
    const { data } = await api.get<PerCompanyEnvelope>(`/intern/me/${companyId}/supervisor`);
    return (data?.data as Record<string, unknown>) ?? {};
  },

  async getAttendance(
    companyId: string,
    params?: { from?: string; to?: string; page?: number; limit?: number },
  ): Promise<InternAttendanceList> {
    const { data } = await api.get<AttendanceEnvelope>(`/intern/me/${companyId}/attendance`, { params });
    const nested = Array.isArray(data?.data)
      ? { attendance: data.data as InternAttendance[], pagination: data.pagination }
      : (data?.data as { attendance?: InternAttendance[]; pagination?: Pagination } | undefined);
    const attendance = nested?.attendance ?? data?.attendance ?? [];
    const pagination = nested?.pagination ?? data?.pagination;
    return {
      attendance,
      pagination: pagination
        ? { ...pagination, total: pagination.total ?? attendance.length }
        : { page: 1, limit: attendance.length, pages: 1, total: attendance.length },
    };
  },

  async getEvaluations(
    companyId: string,
    params?: { page?: number; limit?: number; sort?: string },
  ): Promise<Record<string, unknown>> {
    const { data } = await api.get<PerCompanyEnvelope>(
      `/intern/me/${companyId}/evaluations`,
      { params },
    );
    return (data?.data as Record<string, unknown>) ?? {};
  },

  async getCompanyFromEnrollments(enrollments: InternEnrollment[], companyId: string): Promise<InternEnrollment | undefined> {
    return enrollments.find((e) => e.companyId === companyId);
  },
};