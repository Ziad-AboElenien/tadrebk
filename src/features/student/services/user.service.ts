import api from '@/lib/axios';
import { User } from '@/features/student/types';

interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  headline?: string;
  skills?: string[];
  categories?: string[];
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  address?: string;
  education?: any[];
  courses?: { name: string }[];
  profilePicture?: string;
  coverPicture?: string;
  resume?: string;
}

interface UploadResponse {
  data?: {
    url?: string;
    secure_url?: string;
  };
  url?: string;
  msg: string;
}

interface UserResponse {
  data: {
    user: User;
  };
}

export const userService = {
  async getUserProfile(userId: string): Promise<User> {
    const { data } = await api.get<UserResponse>(`/user/${userId}`);
    return data.data.user;
  },

  async updateProfile(userId: string, payload: UpdateUserPayload): Promise<User> {
    const { data } = await api.patch<UserResponse>(`/user/${userId}`, payload);
    return data.data.user;
  },

  async uploadProfilePicture(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<UploadResponse>(
      `/user/upload/profilePicture`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Upload persists the picture server-side; the response URL is only used
    // for an optimistic UI update before the profile is refetched.
    return data?.data?.url ?? data?.url ?? data?.data?.secure_url ?? '';
  },

  async deleteProfilePicture(): Promise<void> {
    await api.delete(`/user/profilePicture`);
  },

  async uploadCoverPicture(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<UploadResponse>(
      `/user/upload/coverPicture`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data?.data?.url ?? data?.url ?? data?.data?.secure_url ?? '';
  },

  async deleteCoverPicture(): Promise<void> {
    await api.delete(`/user/coverPicture`);
  },

  async uploadResume(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<UploadResponse>(
      `/user/upload/resume`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data?.data?.url ?? data?.url ?? data?.data?.secure_url ?? '';
  },

  async uploadCourseCertificate(courseIndex: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<UploadResponse>(
      `/user/upload/course-certificate/${courseIndex}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data?.data?.url ?? data?.url ?? data?.data?.secure_url ?? '';
  },

  async deleteAccount(userId: string): Promise<void> {
    await api.delete(`/user/${userId}`);
  },
};
