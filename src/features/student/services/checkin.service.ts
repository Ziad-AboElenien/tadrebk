import api from '@/lib/axios';

export interface CheckinStreakState {
  count: number;
  /** UTC timestamp of the most recent check-in, or null. */
  last: string | null;
}

interface CheckinEnvelope {
  data: { streak: CheckinStreakState };
  msg: string;
}

export const checkinService = {
  async getCheckin(userId: string): Promise<CheckinStreakState> {
    const { data } = await api.get<CheckinEnvelope>(`/user/${userId}/checkin`);
    return data.data.streak;
  },

  async postCheckin(userId: string): Promise<CheckinStreakState> {
    const { data } = await api.post<CheckinEnvelope>(`/user/${userId}/checkin`);
    return data.data.streak;
  },
};

/** UTC date part (YYYY-MM-DD) of an ISO timestamp. */
export function utcDay(iso?: string | null): string {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}
