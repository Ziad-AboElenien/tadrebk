import api from '@/lib/axios';
import { Company, rememberBlankCompanyMarker } from '@/features/company/types';

interface CreateCompanyPayload {
  name: string;
  description: string;
  industry: string;
  address: string;
  location?: { lat: number; lng: number };
  numberOfEmployees: string;
  companyEmail: string;
  legalAttachment: File;
}

interface UpdateCompanyPayload {
  name?: string;
  description?: string;
  industry?: string;
  address?: string;
  location?: { lat: number; lng: number };
  numberOfEmployees?: string;
  companyEmail?: string;
  website?: string;
  linkedin?: string;
  headline?: string;
  foundedYear?: number;
  logo?: string;
  coverPicture?: string;
}

interface ListCompaniesParams {
  name?: string;
  industry?: string;
  address?: string;
  companyEmail?: string;
  approvedByAdmin?: boolean;
  page?: number;
  limit?: number;
}

interface CompanyListResponse {
  data: {
    companies: Company[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  msg: string;
}

interface CompanyResponse {
  data: {
    company: Company;
  };
  msg: string;
}

interface UploadResponse {
  data: {
    url: string;
  };
  msg: string;
}

// The backend has no DELETE endpoint for company logo/cover, so "removing"
// an image is done by re-uploading a blank 1x1 transparent PNG over the old
// one; its URL is remembered as a marker so it renders as "no image".
function createEmptyImageFile(): File {
  const base64 =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY/j//z8DAAj8Av6IXwbgAAAAAElFTkSuQmCC';
  const byteString = atob(base64.split(',')[1]);
  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i);
  return new File([bytes], 'blank.png', { type: 'image/png' });
}

// Single, consistent interpretation of approval: missing field = NOT approved.
// (Previously listCompanies defaulted missing → true while detail endpoints
// defaulted → false, so the same company flipped between approved/pending
// depending on which call populated the store.)
export interface CompanyRatingReview {
  student?: string;
  track?: string;
  rating?: number;
  date?: string;
  body?: string;
}

export interface CompanyRatingHistogramBucket {
  stars: number;
  pct: number;
}

export interface CompanyRatings {
  avg: number | null;
  count: number;
  histogram: CompanyRatingHistogramBucket[];
  reviews: CompanyRatingReview[];
}

interface CompanyRatingsResponse {
  data?: {
    avg?: number | null;
    count?: number;
    histogram?: { stars?: number; pct?: number }[];
    reviews?: CompanyRatingReview[];
  };
  msg?: string;
}

export interface CompanyInvite {
  _id?: string;
  internshipId?: string;
  studentId?: string;
  status?: string;
  createdAt?: string;
}

function withApproval(c: Company): Company {
  return { ...c, approvedByAdmin: c.approvedByAdmin ?? false };
}

export const companyService = {
  async listCompanies(params?: ListCompaniesParams): Promise<{
    companies: Company[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const { data } = await api.get<CompanyListResponse>('/company/', { params });
    const companies = data.data.companies.map(withApproval) as Company[];
    return {
      companies,
      pagination: data.data.pagination,
    };
  },

  async getCompanyById(companyId: string): Promise<Company> {
    const { data } = await api.get<CompanyResponse>(`/company/${companyId}`);
    return withApproval(data.data.company);
  },

  async getCompanyByName(name: string): Promise<Company> {
    const { data } = await api.get<CompanyResponse>(`/company/name/${name}`);
    return withApproval(data.data.company);
  },

  async createCompany(payload: CreateCompanyPayload): Promise<Company> {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('description', payload.description);
    formData.append('industry', payload.industry);
    formData.append('address', payload.address);
    formData.append('numberOfEmployees', payload.numberOfEmployees);
    formData.append('companyEmail', payload.companyEmail);
    formData.append('legalAttachment', payload.legalAttachment);
    if (payload.location) {
      formData.append('location', JSON.stringify(payload.location));
    }

    const { data } = await api.post<CompanyResponse>('/company/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data.data.company;
  },

  async updateCompany(companyId: string, payload: UpdateCompanyPayload): Promise<Company> {
    const { data } = await api.patch<CompanyResponse>(`/company/${companyId}`, payload);
    return data.data.company;
  },

  async uploadLogo(companyId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<UploadResponse>(
      `/company/${companyId}/logo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data.data.url;
  },

  async uploadCoverPicture(companyId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<UploadResponse>(
      `/company/${companyId}/coverPicture`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data.data.url;
  },

  async clearLogo(companyId: string): Promise<string> {
    const url = await this.uploadLogo(companyId, createEmptyImageFile());
    rememberBlankCompanyMarker(url);
    return url;
  },

  async clearCoverPicture(companyId: string): Promise<string> {
    const url = await this.uploadCoverPicture(companyId, createEmptyImageFile());
    rememberBlankCompanyMarker(url);
    return url;
  },

  async getCompanyRatings(companyId: string): Promise<CompanyRatings> {
    const { data } = await api.get<CompanyRatingsResponse>(`/company/${companyId}/ratings`);
    const d = data?.data ?? {};
    const histogram = Array.isArray(d.histogram)
      ? d.histogram
          .filter((b) => typeof b?.stars === 'number')
          .map((b) => ({ stars: b.stars as number, pct: typeof b.pct === 'number' ? b.pct : 0 }))
      : [];
    return {
      avg: typeof d.avg === 'number' ? d.avg : null,
      count: typeof d.count === 'number' ? d.count : 0,
      histogram,
      reviews: Array.isArray(d.reviews) ? d.reviews : [],
    };
  },

  async saveCompany(companyId: string): Promise<void> {
    await api.post(`/companies/${companyId}/save`);
  },

  async unsaveCompany(companyId: string): Promise<void> {
    await api.delete(`/companies/${companyId}/save`);
  },

  async getSavedCompanies(page = 1, limit = 20): Promise<{
    companies: Company[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const { data } = await api.get<CompanyListResponse>('/companies/saved', { params: { page, limit } });
    return {
      companies: (data.data.companies || []).map(withApproval) as Company[],
      pagination: data.data.pagination,
    };
  },

  async listInvites(companyId: string, internshipId: string): Promise<CompanyInvite[]> {
    const { data } = await api.get<{ data?: { invites?: CompanyInvite[] } | CompanyInvite[] }>(
      `/company/${companyId}/internships/${internshipId}/invites`,
    );
    const d = data?.data;
    if (Array.isArray(d)) return d;
    return d?.invites ?? [];
  },

  async sendInvite(companyId: string, internshipId: string, studentId: string): Promise<CompanyInvite> {
    const { data } = await api.post<{ data?: { invite?: CompanyInvite } | CompanyInvite }>(
      `/company/${companyId}/internships/${internshipId}/invites`,
      { studentId },
    );
    const d = data?.data;
    if (d && !Array.isArray(d) && (d as { invite?: CompanyInvite }).invite) {
      return (d as { invite?: CompanyInvite }).invite as CompanyInvite;
    }
    return (d as CompanyInvite) ?? {};
  },

  async revokeInvite(companyId: string, internshipId: string, inviteId: string): Promise<void> {
    await api.delete(`/company/${companyId}/internships/${internshipId}/invites/${inviteId}`);
  },
};
