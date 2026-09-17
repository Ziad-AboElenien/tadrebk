import api from '@/lib/axios';
import { Pagination } from '@/features/company/types/management';

export interface EvaluationPeriod {
  start: string;
  end: string;
}

export interface Evaluation {
  _id: string;
  internId: string;
  companyId: string;
  evaluatorId: string;
  period: EvaluationPeriod;
  attendanceRate: number;
  skillRating: number;
  teamworkRating: number;
  overallScore: number;
  strengths?: string;
  improvements?: string;
  privateNotes?: string;
  evaluatedAt: string;
  sharedWithIntern: boolean;
  sharedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationDashboard {
  kpis: {
    avgAttendance: number;
    avgSkillRating: number;
    avgOverallScore: number;
    evaluationsThisMonth: number;
  };
  chart: { month: string; presentDays: number; totalDays: number; rate: number }[];
}

export interface EvaluationAlerts {
  lowAttendance: {
    intern: { _id: string; firstName: string; lastName: string; email: string; profilePicture?: string | null };
    attendanceRate: number;
    windowDays: number;
  }[];
  evaluationOverdue: {
    intern: { _id: string; firstName: string; lastName: string; email: string; profilePicture?: string | null };
    lastEvaluatedAt: string | null;
  }[];
}

export interface CreateEvaluationPayload {
  internId: string;
  period: EvaluationPeriod;
  skillRating: number;
  teamworkRating: number;
  strengths?: string;
  improvements?: string;
  privateNotes?: string;
}

export interface UpdateEvaluationPayload {
  skillRating?: number;
  teamworkRating?: number;
  strengths?: string;
  improvements?: string;
  privateNotes?: string;
}

interface ListEnvelope {
  data?: { evaluations?: Evaluation[]; pagination?: Pagination };
  evaluations?: Evaluation[];
  pagination?: Pagination;
  msg?: string;
}

interface SingleEnvelope {
  data?: { evaluation?: Evaluation };
  evaluation?: Evaluation;
  msg?: string;
}

function emptyPagination(): Pagination {
  return { page: 1, limit: 0, pages: 1, total: 0 };
}

export const evaluationService = {
  async listEvaluations(
    companyId: string,
    params?: { internId?: string; period?: string; page?: number; limit?: number },
  ): Promise<{ evaluations: Evaluation[]; pagination: Pagination }> {
    const { data } = await api.get<ListEnvelope>(`/company/${companyId}/evaluations`, { params });
    const evaluations = data?.data?.evaluations ?? data?.evaluations ?? [];
    const pagination = data?.data?.pagination ?? data?.pagination ?? emptyPagination();
    return { evaluations, pagination };
  },

  async getEvaluation(companyId: string, evaluationId: string): Promise<Evaluation> {
    const { data } = await api.get<SingleEnvelope>(`/company/${companyId}/evaluations/${evaluationId}`);
    return data?.data?.evaluation ?? data?.evaluation as Evaluation;
  },

  async createEvaluation(
    companyId: string,
    internId: string,
    payload: CreateEvaluationPayload,
  ): Promise<Evaluation> {
    const { data } = await api.post<SingleEnvelope>(
      `/company/${companyId}/interns/${internId}/evaluations`,
      payload,
    );
    return data?.data?.evaluation ?? data?.evaluation as Evaluation;
  },

  async updateEvaluation(
    companyId: string,
    evaluationId: string,
    payload: UpdateEvaluationPayload,
  ): Promise<Evaluation> {
    const { data } = await api.patch<SingleEnvelope>(
      `/company/${companyId}/evaluations/${evaluationId}`,
      payload,
    );
    return data?.data?.evaluation ?? data?.evaluation as Evaluation;
  },

  async shareEvaluation(companyId: string, evaluationId: string): Promise<Evaluation> {
    const { data } = await api.patch<SingleEnvelope>(
      `/company/${companyId}/evaluations/${evaluationId}/share`,
    );
    return data?.data?.evaluation ?? data?.evaluation as Evaluation;
  },

  async getDashboard(companyId: string): Promise<EvaluationDashboard> {
    const { data } = await api.get<{ data?: EvaluationDashboard } & EvaluationDashboard>(
      `/company/${companyId}/evaluations/dashboard`,
    );
    return (data?.data ?? data) as EvaluationDashboard;
  },

  async getAlerts(companyId: string): Promise<EvaluationAlerts> {
    const { data } = await api.get<{ data?: EvaluationAlerts } & EvaluationAlerts>(
      `/company/${companyId}/evaluations/alerts`,
    );
    const nested = (data?.data ?? data) as EvaluationAlerts;
    return {
      lowAttendance: nested?.lowAttendance ?? [],
      evaluationOverdue: nested?.evaluationOverdue ?? [],
    };
  },
};
