// Matches actual Swagger API schema
export type InternshipLocation = 'on-site' | 'remote' | 'hybrid';
export type InternshipType = 'full-time' | 'part-time';

export interface Internship {
  _id: string;
  title: string;
  description: string;
  location: InternshipLocation;
  workingTime?: InternshipType;
  softSkills?: string[];
  technicalSkills?: string[];
  companyId: string;
  addedBy?: string;    // API returns addedBy
  updatedBy?: string;  // API returns updatedBy
  closed: boolean;     // API uses "closed" not "isClosed"
  createdAt?: string;
  updatedAt?: string;
  // Populated company data (when fetched with company info)
  company?: {
    _id: string;
    name: string;
    logo?: string;
    industry?: string;
    address?: string;
  };
}

export interface CreateInternshipRequest {
  title: string;
  description: string;
  location: InternshipLocation;
  workingTime?: InternshipType;
  softSkills?: string[];
  technicalSkills?: string[];
}

export interface UpdateInternshipRequest extends Partial<CreateInternshipRequest> {
  closed?: boolean;
}

export interface InternshipsFilters {
  title?: string;
  location?: InternshipLocation;
  companyId?: string;
  type?: InternshipType;         // "type" is the query param for workingTime filter
  closed?: boolean;
  page?: number;
  limit?: number;
}

// Matches actual API response shape
export interface InternshipsListResponse {
  data: {
    internships: Internship[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  msg: string;
}

export interface InternshipResponse {
  data: { internship: Internship };
  msg: string;
}
