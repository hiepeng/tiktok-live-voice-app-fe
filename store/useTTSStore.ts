import { create } from 'zustand';
import * as Speech from 'expo-speech';

interface TTSState {
  isSpeaking: boolean;
  autoRead: boolean;
  currentText: string | null;
  language: string;
  speak: (text: string, language?: string) => void;
  stop: () => void;
  toggleAutoRead: () => void;
}

export const useTTSStore = create<TTSState>((set, get) => ({
  isSpeaking: false,
  autoRead: false,
  currentText: null,
  language: 'vi-VN',
  speak: (text, language) => {
    Speech.stop();
    set({ isSpeaking: true, currentText: text, language: language || get().language });
    Speech.speak(text, {
      language: language || get().language,
      onDone: () => set({ isSpeaking: false, currentText: null }),
      onStopped: () => set({ isSpeaking: false, currentText: null }),
      onError: () => set({ isSpeaking: false, currentText: null }),
    });
  },
  stop: () => {
    Speech.stop();
    set({ isSpeaking: false, currentText: null });
  },
  toggleAutoRead: () => set((state) => ({ autoRead: !state.autoRead })),
}));
