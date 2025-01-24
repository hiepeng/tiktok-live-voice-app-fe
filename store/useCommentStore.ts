import { MAX_COMMENTS } from '@/constants/config';
import { create } from 'zustand';

interface Comment {
  id: string;
  text: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: number;
}

interface CommentState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  addComment: (comment: Comment) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearComments: () => void;
}

export const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  isLoading: false,
  error: null,

  addComment: (comment) =>
    set((state) => {
      const newComments = [...state.comments, comment];
      // Nếu số lượng comments vượt quá MAX_COMMENTS, xóa những comments cũ nhất
      if (newComments.length > MAX_COMMENTS) {
        return { comments: newComments.slice(-MAX_COMMENTS) };
      }
      return { comments: newComments };
    }),
    
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearComments: () => set({ comments: [] }),
})); 