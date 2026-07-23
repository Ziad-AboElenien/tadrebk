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
  gender?: 'male' | 'female' | 'other';
  address?: string;
  profilePicture?: string;
  coverPicture?: string;
  resume?: string;
  education?: any[];
  experience?: any[];
}

interface UploadResponse {
  data: {
    url: string;
  };
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

    return data.data.url;
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

    return data.data.url;
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

    return data.data.url;
  },

  async deleteAccount(userId: string): Promise<void> {
    await api.delete(`/user/${userId}`);
  },
};
