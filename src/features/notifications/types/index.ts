export interface NotificationData {
  applicationId?: string;
  internshipId?: string;
  internshipTitle?: string;
  status?: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  type: string;
  title: string;
  message: string;
  data?: NotificationData;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface UnreadCountResponse {
  data: {
    count: number;
  };
}
