import { create } from 'zustand';
import { api } from "@/services/api";
import { showToast } from "@/components/Toast";

export interface UrlItem {
  taskId: string;
  url: string;
  status: 'idle' | 'pending' | 'decoding' | 'running' | 'stop' | 'stopping';
  createdAt: Date;
  metadata?: {
    viewCount?: number;
    shareCount?: number;
    likeCount?: number;
  };
  key?: string;
}

interface CommentUrlState {
  urls: UrlItem[];
  setUrls: (urls: UrlItem[]) => void;
  addUrl: (url: UrlItem) => void;
  updateUrlStatus: (taskId: string, status: UrlItem['status']) => void;
  removeUrl: (taskId: string) => void;
  clearUrls: () => void;
  fetchActiveUrls: () => Promise<void>;
  startUrl: (url: string) => Promise<void>;
  stopUrl: (taskId: string) => Promise<void>;
}

export const useCommentUrlStore = create<CommentUrlState>((set, get) => ({
  urls: [],
  setUrls: (urls) => set({ urls }),
  addUrl: (url) => set((state) => ({ urls: [url, ...state.urls] })),
  updateUrlStatus: (taskId, status) => set((state) => ({
    urls: state.urls.map(item => item.taskId === taskId ? { ...item, status } : item),
  })),
  removeUrl: (taskId) => set((state) => ({
    urls: state.urls.filter(item => item.taskId !== taskId),
  })),
  clearUrls: () => set({ urls: [] }),

  fetchActiveUrls: async () => {
    try {
      console.log(1111)
      const response = await api.get<{ data: any[] }>("/comments/active");
      if (response && Array.isArray(response)) {
        const activeUrls = response.map(item => ({
          taskId: item._id,
          url: item.source,
          status: item.status,
          createdAt: new Date(item.createdAt),
        }));
        set({ urls: activeUrls });
      }
    } catch (error) {
      console.error("Failed to fetch active URLs:", error);
      showToast("Lỗi lấy danh sách phiên active", false, 3000);
    }
  },

  startUrl: async (url: string) => {
    try {
      const res = await api.post<{ taskId: string; createdAt: string }>("/comments/start", { url })
      // Gọi lại fetchActiveUrls để đảm bảo đồng bộ
      await get().fetchActiveUrls();
      showToast("Bắt đầu phiên mới thành công", true, 3000);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Lỗi khi bắt đầu phiên mới", false, 3000);
      throw error;
    }
  },

  stopUrl: async (taskId: string) => {
    try {
      await api.post("/comments/stop", { taskId });
      // Gọi lại fetchActiveUrls để đảm bảo đồng bộ
      await get().fetchActiveUrls();
      showToast("Đã dừng phiên thành công", true, 3000);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Lỗi khi dừng phiên", false, 3000);
      throw error;
    }
  },
}));
