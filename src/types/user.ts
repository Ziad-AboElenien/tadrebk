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

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;  // API uses "phoneNumber" not "phone"
  isConfirmed: boolean;  // API uses "isConfirmed" not "isEmailVerified"
  provider: 'system' | 'google';
  profilePicture?: string;
  coverPicture?: string;
  bio?: string;
  headline?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  resume?: string;
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
  skills?: string[];
  education?: Education[];
  experience?: Experience[];
}
