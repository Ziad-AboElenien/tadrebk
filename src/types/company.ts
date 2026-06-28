// Matches actual Swagger API schema
export interface Company {
  _id: string;
  name: string;
  description?: string;
  industry?: string;
  address?: string;
  companyEmail?: string;
  numberOfEmployees?: string;  // API returns as string
  createdBy: string;           // API uses "createdBy" not "ownerId"
  logo?: string;
  coverPicture?: string;
  approvedByAdmin: boolean;
  bannedAt?: string;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyRequest {
  name: string;
  description: string;
  industry: string;
  address: string;
  numberOfEmployees: string;
  companyEmail: string;
  legalAttachment: File;       // multipart/form-data
}

export interface UpdateCompanyRequest {
  name?: string;
  description?: string;
  industry?: string;
  address?: string;
  companyEmail?: string;
  numberOfEmployees?: string;
}

// For the companies listing response
export interface CompaniesListResponse {
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
