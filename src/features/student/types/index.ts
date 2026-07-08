// Matches the actual API schema from Swagger
export interface Education {
  institution: string;
  degree?: string;
  field?: string;       // API uses "field" not "fieldOfStudy"
  startDate?: string;
  endDate?: string;
}

export interface Experience {
  company: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
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

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;  // API uses "phoneNumber" not "phone"
  isConfirmed: boolean;  // API uses "isConfirmed" not "isEmailVerified"
  provider: 'system' | 'google';
  profilePicture?: string | CloudinaryResource;
  coverPicture?: string | CloudinaryResource;
  bio?: string;
  headline?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  resume?: string | CloudinaryResource;
  skills?: string[];
  education?: Education[];
  experience?: Experience[];
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
  profilePicture?: string;
  coverPicture?: string;
  resume?: string;
  skills?: string[];
  education?: Education[];
  experience?: Experience[];
}

/** Extract a URL string from either a plain URL or a Cloudinary resource object */
export function getUserImgUrl(img: string | CloudinaryResource | null | undefined): string | null {
  return extractUrl(img);
}
