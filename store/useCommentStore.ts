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
    set((state) => ({ comments: [...state.comments, comment] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearComments: () => set({ comments: [] }),
})); 