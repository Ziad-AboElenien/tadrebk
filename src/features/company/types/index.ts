export interface CloudinaryResource {
  secure_url: string;
  public_id?: string;
  _id?: string;
}

// Matches actual API response — logo/coverPicture can be a URL string OR Cloudinary object
export interface Company {
  _id: string;
  name: string;
  description?: string;
  industry?: string;
  address?: string;
  location?: { lat: number; lng: number };
  googleMapsUrl?: string;
  companyEmail?: string;
  numberOfEmployees?: string;  // API returns as string
  createdBy: string;           // API uses "createdBy" not "ownerId"
  logo?: string | CloudinaryResource;
  coverPicture?: string | CloudinaryResource;
  approvedByAdmin: boolean;
  bannedAt?: string;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Parse optional latitude/longitude inputs into a backend location object */
export function parseLocation(lat?: string, lng?: string): { lat: number; lng: number } | undefined {
  if (!lat?.trim() || !lng?.trim()) return undefined;
  const la = Number(lat);
  const ln = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return undefined;
  return { lat: la, lng: ln };
}

/** Extract a URL string from either a plain URL or a Cloudinary resource object */
export function getImgUrl(img: string | CloudinaryResource | null | undefined): string | null {
  if (!img) return null;
  if (typeof img === 'string') return img || null;
  return img.secure_url || null;
}

export interface CreateCompanyRequest {
  name: string;
  description: string;
  industry: string;
  address: string;
  location?: { lat: number; lng: number };
  numberOfEmployees: string;
  companyEmail: string;
  legalAttachment: File;       // multipart/form-data
}

export interface UpdateCompanyRequest {
  name?: string;
  description?: string;
  industry?: string;
  address?: string;
  location?: { lat: number; lng: number };
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
