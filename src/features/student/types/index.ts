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

export interface Course {
  _id?: string;
  name: string;
  link?: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'pdf';
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
  return extractUrl(img);
}
