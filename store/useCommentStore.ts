import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  maxComments: number;
  addComment: (comment: Comment) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearComments: () => void;
  setMaxComments: (value: number) => Promise<void>;
  initializeMaxComments: () => Promise<void>;
}

const DEFAULT_MAX_COMMENTS = 1000;
const STORAGE_KEY = 'max-comments';

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],
  isLoading: false,
  error: null,
  maxComments: DEFAULT_MAX_COMMENTS,

  addComment: (comment) =>
    set((state) => {
      const newComments = [...state.comments, comment];
      if (newComments.length > state.maxComments) {
        return { comments: newComments.slice(-state.maxComments) };
      }
      return { comments: newComments };
    }),
    
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearComments: () => set({ comments: [] }),

  setMaxComments: async (value: number) => {
    await AsyncStorage.setItem(STORAGE_KEY, value.toString());
    set((state) => {
      if (state.comments.length > value) {
        return {
          maxComments: value,
          comments: state.comments.slice(-value)
        };
      }
      return { maxComments: value };
    });
  },

  initializeMaxComments: async () => {
    try {
      const savedValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedValue) {
        const maxComments = parseInt(savedValue);
        set((state) => {
          if (state.comments.length > maxComments) {
            return {
              maxComments,
              comments: state.comments.slice(-maxComments)
            };
          }
          return { maxComments };
        });
      }
    } catch (error) {
      console.error('Error loading maxComments:', error);
    }
  },
}));

// Khởi tạo giá trị khi app starts
useCommentStore.getState().initializeMaxComments(); 