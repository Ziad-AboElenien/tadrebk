import api from '@/lib/axios';
import { User } from '@/features/student/types';
import { rememberBlankPictureMarker } from '@/features/student/types';

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

// The backend has no DELETE endpoint for profile/cover pictures, so "removing"
// a picture is done by re-uploading a blank 1x1 transparent PNG over the old one.
function createEmptyImageFile(): File {
  const base64 =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY/j//z8DAAj8Av6IXwbgAAAAAElFTkSuQmCC';
  const byteString = atob(base64.split(',')[1]);
  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i);
  return new File([bytes], 'blank.png', { type: 'image/png' });
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

  async clearProfilePicture(): Promise<string> {
    const url = await this.uploadProfilePicture(createEmptyImageFile());
    rememberBlankPictureMarker(url);
    return url;
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

  async clearCoverPicture(): Promise<string> {
    const url = await this.uploadCoverPicture(createEmptyImageFile());
    rememberBlankPictureMarker(url);
    return url;
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

  async addCourse(name: string, file?: File): Promise<void> {
    const formData = new FormData();
    formData.append('name', name);
    if (file) formData.append('file', file);

    await api.post('/user/courses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async updateCourse(courseIndex: number, name?: string, file?: File): Promise<void> {
    const formData = new FormData();
    if (name !== undefined) formData.append('name', name);
    if (file) formData.append('file', file);

    await api.patch(`/user/courses/${courseIndex}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async deleteAccount(userId: string): Promise<void> {
    await api.delete(`/user/${userId}`);
  },
};
