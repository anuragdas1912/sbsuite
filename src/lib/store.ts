import { create } from 'zustand';

interface AppState {
  isReady: boolean;
}

export const useAppStore = create<AppState>(() => ({
  isReady: true,
}));
