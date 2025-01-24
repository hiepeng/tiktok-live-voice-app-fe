export interface ProfileResponse {
    data: {
      _id: string;
      email: string;
      avatar: string;
      subscription?: {
        packageId: string;
        startDate: string;
        endDate: string;
        status: 'active' | 'expired' | 'cancelled';
      };
    }
  }