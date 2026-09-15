import api from '@/lib/axios';
import {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceDayRule,
  Pagination,
} from '@/features/company/types/management';

export interface AttendanceListEnvelope {
  data?: AttendanceRecord[] | { results?: AttendanceRecord[]; pagination?: Pagination };
  results?: AttendanceRecord[];
  records?: AttendanceRecord[];
  pagination?: Pagination;
  msg?: string;
}

export interface BulkMarkResult {
  matched: number;
  modified: number;
  skipped: { internId: string; reason: string }[];
}

export interface BulkMarkEnvelope {
  data?: BulkMarkResult & { results?: { internId: string; status: AttendanceStatus; skipped?: boolean; reason?: string }[] };
  msg?: string;
}

export interface AttendanceScheduleResponse {
  data?: {
    rules: AttendanceDayRule[];
    timezone: string;
    programId?: string;
  };
  rules?: AttendanceDayRule[];
  timezone?: string;
  msg?: string;
}

export const attendanceService = {
  async listAttendance(
    companyId: string,
    params: {
      date?: string;
      programId?: string;
      internId?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: AttendanceRecord[]; pagination: Pagination }> {
    const { data } = await api.get<AttendanceListEnvelope>(`/company/${companyId}/attendance`, {
      params,
    });
    const nested = Array.isArray(data?.data)
      ? { results: data.data as AttendanceRecord[], pagination: data.pagination }
      : (data?.data as { results?: AttendanceRecord[]; pagination?: Pagination } | undefined);
    const list = nested?.results ?? data?.results ?? data?.records ?? [];
    const pagination = nested?.pagination ?? data?.pagination;
    return {
      data: list,
      pagination: pagination
        ? { ...pagination, total: pagination.total ?? list.length }
        : { page: 1, limit: list.length, pages: 1, total: list.length },
    };
  },

  async markAttendance(
    companyId: string,
    payload: { internId: string; date: string; status: AttendanceStatus; note?: string },
  ): Promise<AttendanceRecord> {
    const { data } = await api.post<{ data: AttendanceRecord; msg?: string }>(
      `/company/${companyId}/attendance/mark`,
      payload,
    );
    return data.data;
  },

  async bulkMark(
    companyId: string,
    payload: {
      date: string;
      programId?: string;
      records: { internId: string; status: AttendanceStatus }[];
    },
  ): Promise<BulkMarkResult> {
    const { data } = await api.post<BulkMarkEnvelope>(
      `/company/${companyId}/attendance/bulk-mark`,
      payload,
    );
    return {
      matched: data?.data?.matched ?? 0,
      modified: data?.data?.modified ?? 0,
      skipped: data?.data?.skipped ?? [],
    };
  },

  async getSchedule(
    companyId: string,
    params?: { programId?: string },
  ): Promise<{ rules: AttendanceDayRule[]; timezone: string; programId?: string }> {
    const { data } = await api.get<AttendanceScheduleResponse>(
      `/company/${companyId}/attendance/schedule`,
      { params },
    );
    const nested = data?.data;
    return {
      rules: nested?.rules ?? data?.rules ?? [],
      timezone: nested?.timezone ?? data?.timezone ?? 'Africa/Cairo',
      programId: nested?.programId,
    };
  },

  async updateSchedule(
    companyId: string,
    payload: { programId?: string; rules: AttendanceDayRule[]; timezone?: string },
  ): Promise<{ rules: AttendanceDayRule[]; timezone: string }> {
    const { data } = await api.put<AttendanceScheduleResponse>(
      `/company/${companyId}/attendance/schedule`,
      payload,
    );
    const nested = data?.data;
    return {
      rules: nested?.rules ?? data?.rules ?? [],
      timezone: nested?.timezone ?? data?.timezone ?? 'Africa/Cairo',
    };
  },
};

export const BULK_MARK_MAX_ROWS = 500;