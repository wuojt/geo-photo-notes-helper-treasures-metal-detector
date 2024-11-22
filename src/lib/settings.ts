import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  showNotifications: boolean;
  toggleNotifications: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      showNotifications: true,
      toggleNotifications: () => set((state) => ({ showNotifications: !state.showNotifications })),
    }),
    {
      name: 'settings-storage',
    }
  )
);