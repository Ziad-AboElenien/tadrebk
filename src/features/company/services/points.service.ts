import api from '@/lib/axios';
import type { Pagination } from '@/features/company/types/management';

export type PointsCategory = 'attendance' | 'tasks' | 'performance' | 'community';
export type PointsFrequency = 'daily' | 'weekly' | 'per_task' | 'one_time';
export type PointsStatus = 'active' | 'inactive';

export interface PointsRule {
  _id: string;
  companyId?: string;
  title: string;
  category: PointsCategory;
  points: number;
  frequency: PointsFrequency;
  status: PointsStatus;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePointsRulePayload {
  title: string;
  category: PointsCategory;
  points: number;
  frequency: PointsFrequency;
  description?: string;
}

export interface UpdatePointsRulePayload {
  title?: string;
  category?: PointsCategory;
  points?: number;
  frequency?: PointsFrequency;
  status?: PointsStatus;
  description?: string;
}

export interface PointsMilestone {
  _id: string;
  companyId?: string;
  title: string;
  threshold: number;
  reward: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePointsMilestonePayload {
  title: string;
  threshold: number;
  reward: string;
}

export interface UpdatePointsMilestonePayload {
  title?: string;
  threshold?: number;
  reward?: string;
}

export interface PointsStats {
  activeRules: number;
  avgPointsPerMonth: number;
  totalRedemptions: number;
  systemHealth: 'operational' | 'degraded';
}

export const pointsService = {
  async listRules(
    companyId: string,
    params?: { page?: number; limit?: number },
  ): Promise<{ rules: PointsRule[]; pagination: Pagination }> {
    const { data } = await api.get<{
      data: { rules: PointsRule[]; pagination: Pagination };
    }>(`/company/${companyId}/points/rules`, { params });
    return data.data;
  },

  async createRule(companyId: string, payload: CreatePointsRulePayload): Promise<PointsRule> {
    const { data } = await api.post<{ data: { rule: PointsRule } }>(
      `/company/${companyId}/points/rules`,
      payload,
    );
    return data.data.rule;
  },

  async updateRule(companyId: string, ruleId: string, payload: UpdatePointsRulePayload): Promise<PointsRule> {
    const { data } = await api.patch<{ data: { rule: PointsRule } }>(
      `/company/${companyId}/points/rules/${ruleId}`,
      payload,
    );
    return data.data.rule;
  },

  async deleteRule(companyId: string, ruleId: string): Promise<void> {
    await api.delete(`/company/${companyId}/points/rules/${ruleId}`);
  },

  async getStats(companyId: string): Promise<PointsStats> {
    const { data } = await api.get<{ data: PointsStats }>(`/company/${companyId}/points/stats`);
    return data.data;
  },

  async listMilestones(
    companyId: string,
    params?: { page?: number; limit?: number },
  ): Promise<{ milestones: PointsMilestone[]; pagination: Pagination }> {
    const { data } = await api.get<{
      data: { milestones: PointsMilestone[]; pagination: Pagination };
    }>(`/company/${companyId}/points/milestones`, { params });
    return data.data;
  },

  async createMilestone(companyId: string, payload: CreatePointsMilestonePayload): Promise<PointsMilestone> {
    const { data } = await api.post<{ data: { milestone: PointsMilestone } }>(
      `/company/${companyId}/points/milestones`,
      payload,
    );
    return data.data.milestone;
  },

  async updateMilestone(
    companyId: string,
    milestoneId: string,
    payload: UpdatePointsMilestonePayload,
  ): Promise<PointsMilestone> {
    const { data } = await api.patch<{ data: { milestone: PointsMilestone } }>(
      `/company/${companyId}/points/milestones/${milestoneId}`,
      payload,
    );
    return data.data.milestone;
  },

  async deleteMilestone(companyId: string, milestoneId: string): Promise<void> {
    await api.delete(`/company/${companyId}/points/milestones/${milestoneId}`);
  },
};
