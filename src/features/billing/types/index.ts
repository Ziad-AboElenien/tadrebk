export type PlanId = 'starter' | 'growth' | 'enterprise';

export interface PlanDetails {
  planId: PlanId;
  name: string;
  price: number;
  credits: number;
  icon: string;
  color: string;
  popular?: boolean;
}

export const PLAN_DETAILS: Record<PlanId, PlanDetails> = {
  starter: {
    planId: 'starter',
    name: 'Starter',
    price: 29,
    credits: 5,
    icon: 'fas fa-seedling',
    color: 'from-emerald-400 to-emerald-600',
  },
  growth: {
    planId: 'growth',
    name: 'Growth',
    price: 79,
    credits: 20,
    icon: 'fas fa-chart-line',
    color: 'from-violet-400 to-purple-600',
    popular: true,
  },
  enterprise: {
    planId: 'enterprise',
    name: 'Enterprise',
    price: 199,
    credits: 60,
    icon: 'fas fa-crown',
    color: 'from-amber-400 to-orange-600',
  },
};

export interface PurchaseRequest {
  planId: PlanId;
}

export interface PurchaseResponse {
  data: { paymentUrl: string; paymentOrderId: string };
  msg: string;
}

export interface CreditsResponse {
  data: { internshipCredits: number };
  msg: string;
}

export interface ConfirmPaymentRequest {
  paymentOrderId: string;
}
