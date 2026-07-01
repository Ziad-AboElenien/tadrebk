import api from '@/lib/axios';

export interface Application {
  _id: string;
  userId: string;
  internshipId: string;
  companyId: string;
  status: 'pending' | 'accepted' | 'rejected';
  coverLetter?: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
  internship?: {
    _id: string;
    title: string;
    location: string;
    workingTime: string;
  };
}

interface ApplicationListResponse {
  data: {
    applications: Application[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  msg: string;
}

interface ApplicationResponse {
  data: {
    application: Application;
  };
  msg: string;
}

interface UserApplicationsParams {
  status?: 'pending' | 'accepted' | 'rejected';
  page?: number;
  limit?: number;
}

interface CompanyApplicationsParams {
  status?: 'pending' | 'accepted' | 'rejected';
  page?: number;
  limit?: number;
}

interface ApplyPayload {
  coverLetter?: string;
}

interface ReviewPayload {
  status: 'accepted' | 'rejected';
  notes?: string;
}

export const applicationService = {
  async apply(
    companyId: string,
    internId: string,
    payload?: ApplyPayload,
  ): Promise<Application> {
    const { data } = await api.post<ApplicationResponse>(
      `/company/${companyId}/internships/${internId}/applications`,
      payload || {},
    );
    return data.data.application;
  },

  async getCompanyApplications(
    companyId: string,
    internId: string,
    params?: CompanyApplicationsParams,
  ): Promise<{
    applications: Application[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const { data } = await api.get<ApplicationListResponse>(
      `/company/${companyId}/internships/${internId}/applications`,
      { params },
    );
    return {
      applications: data.data.applications,
      pagination: data.data.pagination,
    };
  },

  async reviewApplication(
    companyId: string,
    internId: string,
    applicationId: string,
    payload: ReviewPayload,
  ): Promise<Application> {
    const { data } = await api.patch<ApplicationResponse>(
      `/company/${companyId}/internships/${internId}/applications/${applicationId}`,
      payload,
    );
    return data.data.application;
  },

  async cancelApplication(
    companyId: string,
    internId: string,
    applicationId: string,
  ): Promise<void> {
    await api.delete(
      `/company/${companyId}/internships/${internId}/applications/${applicationId}`,
    );
  },

  async getUserApplications(
    userId: string,
    params?: UserApplicationsParams,
  ): Promise<{
    applications: Application[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const { data } = await api.get<ApplicationListResponse>(
      `/user/${userId}/applications`,
      { params },
    );
    return {
      applications: data.data.applications,
      pagination: data.data.pagination,
    };
  },
};
