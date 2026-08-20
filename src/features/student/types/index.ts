// Matches the actual API schema from Swagger
export interface Education {
  institution: string;
  degree?: string;
  field?: string;
  grade?: string;
  startDate?: string;
  endDate?: string;
}

export interface Experience {
  applicationId: string;
  internshipId: string;
  internshipTitle: string;
  companyId: string;
  companyName: string;
  completedAt: string;
  rating: number | null;
  feedback: string | null;
  feedbackCreatedAt: string | null;
}

export interface CourseCertificate {
  secure_url?: string;
  certificateUrl?: string;
  public_id?: string;
}

export interface Course {
  _id?: string;
  name: string;
  link?: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'pdf';
  certificate?: CourseCertificate;
}

export interface CloudinaryResource {
  secure_url: string;
  public_id?: string;
  _id?: string;
}

function extractUrl(img: string | CloudinaryResource | null | undefined): string | null {
  if (!img) return null;
  if (typeof img === 'string') return img || null;
  return img.secure_url || null;
}

const BLANK_PICTURE_MARKERS_KEY = 'tadrebk_blank_picture_markers';

// Compare Cloudinary URLs ignoring protocol (http/https) and query string, so
// the upload response URL matches the secure_url returned on later fetches.
function normalizeMarkerUrl(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/[?#].*$/, '').toLowerCase();
}

function readBlankMarkers(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(BLANK_PICTURE_MARKERS_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeBlankMarkers(markers: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(BLANK_PICTURE_MARKERS_KEY, JSON.stringify([...markers]));
  } catch {
    // storage may be full/unavailable — ignore
  }
}

/**
 * Remember a Cloudinary URL that represents a "blank" picture uploaded in
 * place of a removed one (the backend has no delete endpoint, so removal is
 * done by overwriting with a transparent marker image). Any profile picture
 * whose URL matches a remembered marker is treated as "no picture".
 */
export function rememberBlankPictureMarker(url: string): void {
  if (!url) return;
  const normalized = normalizeMarkerUrl(url);
  const markers = readBlankMarkers();
  if (markers.has(normalized)) return;
  markers.add(normalized);
  writeBlankMarkers(markers);
}

function isBlankPictureMarker(img: string | CloudinaryResource | null | undefined): boolean {
  const url = extractUrl(img);
  if (!url) return false;
  return readBlankMarkers().has(normalizeMarkerUrl(url));
}

export type Category =
  | 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'uiux' | 'devops'
  | 'data_science' | 'ai_ml' | 'cybersecurity' | 'qa_testing'
  | 'marketing' | 'sales' | 'hr' | 'finance' | 'design'
  | 'content_writing' | 'project_management' | 'other';

export const CATEGORY_LABELS: Record<Category, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  fullstack: 'Fullstack',
  mobile: 'Mobile',
  uiux: 'UI/UX',
  devops: 'DevOps',
  data_science: 'Data Science',
  ai_ml: 'AI / ML',
  cybersecurity: 'Cybersecurity',
  qa_testing: 'QA / Testing',
  marketing: 'Marketing',
  sales: 'Sales',
  hr: 'HR',
  finance: 'Finance',
  design: 'Design',
  content_writing: 'Content Writing',
  project_management: 'Project Management',
  other: 'Other',
};

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isConfirmed: boolean;
  provider: 'system' | 'google' | 'facebook';
  profilePicture?: string | CloudinaryResource;
  coverPicture?: string | CloudinaryResource;
  bio?: string;
  headline?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  resume?: string | CloudinaryResource;
  skills?: string[];
  categories?: Category[];
  education?: Education[];
  experience?: Experience[];
  courses?: Course[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  headline?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  skills?: string[];
  categories?: Category[];
  education?: Education[];
  courses?: Course[];
}

/** Extract a URL string from either a plain URL or a Cloudinary resource object */
export function getUserImgUrl(img: string | CloudinaryResource | null | undefined): string | null {
  return isBlankPictureMarker(img) ? null : extractUrl(img);
}
