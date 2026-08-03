import api from '@/lib/axios';
import { Company } from '@/features/company/types';

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

// Single, consistent interpretation of approval: missing field = NOT approved.
// (Previously listCompanies defaulted missing → true while detail endpoints
// defaulted → false, so the same company flipped between approved/pending
// depending on which call populated the store.)
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
};
