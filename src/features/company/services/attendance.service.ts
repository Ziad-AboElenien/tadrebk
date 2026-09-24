import api, { getErrorStatus } from '@/lib/axios';
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
  marked: { internId: string; status: AttendanceStatus }[];
  skipped: { internId: string; reason: string }[];
  modified: number;
}

export interface BulkMarkEnvelope {
  data?: {
    marked?: { internId: string; status: AttendanceStatus }[];
    skipped?: { internId: string; reason: string }[];
    matched?: number;
    modified?: number;
    results?: { internId: string; status: AttendanceStatus; skipped?: boolean; reason?: string }[];
  };
  marked?: { internId: string; status: AttendanceStatus }[];
  skipped?: { internId: string; reason: string }[];
  matched?: number;
  modified?: number;
  msg?: string;
}

export interface AttendanceScheduleResponse {
  data?: {
    schedule?: {
      weeklyPattern?: Record<string, boolean | { workday: boolean; startTime: string; endTime: string | null }>;
      timezone?: string;
      programId?: string;
      effectiveFrom?: string | null;
      effectiveTo?: string | null;
    };
    rules?: AttendanceDayRule[];
    weeklyPattern?: Record<string, boolean | { workday: boolean; startTime: string; endTime: string | null }>;
    timezone?: string;
    startTime?: string;
    endTime?: string | null;
    programId?: string;
  };
  rules?: AttendanceDayRule[];
  weeklyPattern?: Record<string, boolean | { workday: boolean; startTime: string; endTime: string | null }>;
  timezone?: string;
  startTime?: string;
  endTime?: string | null;
  msg?: string;
}

function weeklyPatternToRules(
  weeklyPattern: Record<string, boolean | { workday: boolean; startTime: string; endTime: string | null }> | undefined,
  fallbackStart = '09:00',
  fallbackEnd: string | null = '17:00',
): AttendanceDayRule[] {
  if (!weeklyPattern || typeof weeklyPattern !== 'object') return [];
  const days: AttendanceDayRule['day'][] = [
    'saturday',
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
  ];
  return days
    .filter((d) => weeklyPattern[d] !== undefined)
    .map((d) => {
      const v = weeklyPattern[d];
      if (typeof v === 'boolean') {
        return { day: d, workday: v, startTime: fallbackStart, endTime: v ? fallbackEnd : null };
      }
      return {
        day: d,
        workday: !!v.workday,
        startTime: v.startTime ?? fallbackStart,
        endTime: v.endTime ?? (v.workday ? fallbackEnd : null),
      };
    });
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
      : (data?.data as
          | {
              results?: AttendanceRecord[];
              attendance?: AttendanceRecord[];
              pagination?: Pagination;
            }
          | undefined);
    const list =
      nested?.results ?? nested?.attendance ?? data?.results ?? data?.records ?? [];
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
    const { internId, ...body } = payload;
    // Prefer the single-mark route; fall back to bulk-mark with one row.
    try {
      const { data } = await api.post<{ data: AttendanceRecord }>(
        `/company/${companyId}/interns/${internId}/attendance`,
        { date: body.date, status: body.status, ...(body.note ? { note: body.note } : {}) },
      );
      if (data?.data) return data.data;
    } catch (err) {
      if (getErrorStatus(err) !== 404) throw err;
      // single-mark not deployed — fall through to bulk-mark
    }
    const res = await attendanceService.bulkMark(companyId, {
      rows: [{ internId, date: body.date, status: body.status, note: body.note }],
    });
    const skip = res.skipped.find((s) => s.internId === internId);
    if (skip) {
      throw new Error(skip.reason || 'Row skipped by server');
    }
    const marked = res.marked.find((m) => m.internId === internId);
    if (!marked && res.modified === 0) {
      throw new Error('Server did not confirm the saved row');
    }
    return {
      _id: '',
      internId,
      companyId,
      date: body.date,
      status: marked?.status ?? body.status,
    };
  },

  async bulkMark(
    companyId: string,
    payload: {
      rows: { internId: string; date: string; status: AttendanceStatus; note?: string }[];
    },
  ): Promise<BulkMarkResult> {
    const { data } = await api.post<BulkMarkEnvelope>(
      `/company/${companyId}/attendance/bulk-mark`,
      { rows: payload.rows },
    );
    const nested = data?.data;
    const rawResults = nested?.results ?? [];
    const fromResults = rawResults.filter((r) => !r.skipped);
    const marked = nested?.marked ?? data?.marked ?? fromResults;
    const skipped: { internId: string; reason: string }[] = [
      ...(nested?.skipped ?? data?.skipped ?? []),
      ...(nested?.results ?? [])
        .filter((r) => r.skipped)
        .map((r) => ({ internId: r.internId, reason: r.reason || 'Skipped' })),
    ];
    const modified =
      marked.length ||
      nested?.modified ||
      nested?.matched ||
      data?.modified ||
      data?.matched ||
      0;
    if (modified === 0 && skipped.length === 0 && payload.rows.length > 0) {
      throw new Error('Server did not confirm any saved row');
    }
    return { marked, skipped, modified };
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
    const sched = nested?.schedule;
    const rawPattern = sched?.weeklyPattern ?? nested?.weeklyPattern ?? data?.weeklyPattern;
    const fromPattern = weeklyPatternToRules(rawPattern);
    const rules = nested?.rules ?? data?.rules ?? fromPattern;
    return {
      rules,
      timezone: sched?.timezone ?? nested?.timezone ?? data?.timezone ?? 'Africa/Cairo',
      programId: sched?.programId ?? nested?.programId,
    };
  },

  async updateSchedule(
    companyId: string,
    payload: { programId?: string; rules: AttendanceDayRule[]; timezone?: string },
  ): Promise<{ rules: AttendanceDayRule[]; timezone: string }> {
    const weeklyPattern: Record<string, boolean> = {};
    payload.rules.forEach((r) => {
      weeklyPattern[r.day] = !!r.workday;
    });
    const { data } = await api.put<AttendanceScheduleResponse>(
      `/company/${companyId}/attendance/schedule`,
      {
        programId: payload.programId,
        weeklyPattern,
      },
    );
    const nested = data?.data;
    const sched = nested?.schedule;
    const rawPattern = sched?.weeklyPattern ?? nested?.weeklyPattern ?? data?.weeklyPattern;
    const fromPattern = weeklyPatternToRules(rawPattern);
    const rules = nested?.rules ?? data?.rules ?? fromPattern;
    return {
      rules,
      timezone: sched?.timezone ?? nested?.timezone ?? data?.timezone ?? payload.timezone ?? 'Africa/Cairo',
    };
  },
};

export const BULK_MARK_MAX_ROWS = 500;