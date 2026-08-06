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

const BLANK_COMPANY_MARKERS_KEY = 'tadrebk_blank_company_markers';

// Compare Cloudinary URLs ignoring protocol (http/https) and query string, so
// the upload response URL matches the secure_url returned on later fetches.
function normalizeMarkerUrl(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/[?#].*$/, '').toLowerCase();
}

function readBlankMarkers(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(BLANK_COMPANY_MARKERS_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeBlankMarkers(markers: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(BLANK_COMPANY_MARKERS_KEY, JSON.stringify([...markers]));
  } catch {
    // storage may be full/unavailable — ignore
  }
}

/**
 * Remember a Cloudinary URL that represents a "blank" image uploaded in place
 * of a removed one (the backend has no delete endpoint, so removal is done by
 * overwriting with a transparent marker image). Any company logo/cover whose
 * URL matches a remembered marker is treated as "no image".
 */
export function rememberBlankCompanyMarker(url: string): void {
  if (!url) return;
  const normalized = normalizeMarkerUrl(url);
  const markers = readBlankMarkers();
  if (markers.has(normalized)) return;
  markers.add(normalized);
  writeBlankMarkers(markers);
}

function isBlankCompanyMarker(img: string | CloudinaryResource | null | undefined): boolean {
  const url = getImgUrl(img);
  if (!url) return false;
  return readBlankMarkers().has(normalizeMarkerUrl(url));
}

/** Extract a URL, treating remembered blank markers as "no image". */
export function getCompanyImgUrl(img: string | CloudinaryResource | null | undefined): string | null {
  return isBlankCompanyMarker(img) ? null : getImgUrl(img);
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
