import type { Company } from '@/features/company/types';
import type { Education } from '@/features/student/types';

// Matches actual Swagger API schema
export type InternshipLocation = 'on-site' | 'remote' | 'hybrid';
export type InternshipType = 'full-time' | 'part-time';

export interface MCQQuestion {
  type: 'mcq';
  prompt: string;
  options: string[];
}

export interface WritingQuestion {
  type: 'writing';
  prompt: string;
}

export type InternshipQuestion = MCQQuestion | WritingQuestion;

export interface Internship {
  _id: string;
  title: string;
  description: string;
  location: InternshipLocation;
  workingTime?: InternshipType;
  softSkills?: string[];
  technicalSkills?: string[];
  questions?: InternshipQuestion[];
  preKnowledge?: string[];
  track?: string[];
  requiredEducation?: Education[];
  categories?: string[];
  universities?: string[];
  companyId: string | Company;
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

/** Extract the company _id from an Internship's companyId field (string or populated object) */
export function getCompanyIdFromInternship(internship: Internship): string | null {
  if (typeof internship.companyId === 'string' && internship.companyId) return internship.companyId;
  if (internship.companyId && typeof internship.companyId === 'object' && internship.companyId._id) return internship.companyId._id;
  return null;
}

/** Extract the track list from an Internship (supports array or comma-separated string, falls back to categories) */
export function getInternshipTracks(internship: Internship): string[] {
  if (Array.isArray(internship.track) && internship.track.length) return internship.track;
  const trackStr = internship.track as unknown as string | undefined;
  if (typeof trackStr === 'string' && trackStr.trim()) {
    return trackStr.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (Array.isArray(internship.categories) && internship.categories.length) return internship.categories;
  return [];
}

export interface CreateInternshipRequest {
  title: string;
  description: string;
  location: InternshipLocation;
  workingTime?: InternshipType;
  softSkills?: string[];
  technicalSkills?: string[];
  questions?: InternshipQuestion[];
  preKnowledge?: string[];
  track?: string[];
  requiredEducation?: Education[];
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
