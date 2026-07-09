import api from '@/lib/axios';
import type {
  PurchaseRequest,
  PurchaseResponse,
  CreditsResponse,
  ConfirmPaymentRequest,
} from '@/features/billing/types';

export const billingService = {
  async purchasePlan(companyId: string, payload: PurchaseRequest): Promise<{ paymentUrl: string; paymentOrderId: string }> {
    const { data } = await api.post<PurchaseResponse>(`/company/${companyId}/billing/plans/purchase`, payload);
    return data.data;
  },

  async getCredits(companyId: string): Promise<number> {
    const { data } = await api.get<CreditsResponse>(`/company/${companyId}/billing/credits`);
    return data.data.internshipCredits;
  },

  async confirmPayment(companyId: string, payload: ConfirmPaymentRequest): Promise<void> {
    await api.post(`/company/${companyId}/billing/payment/confirm`, payload);
  },
};
