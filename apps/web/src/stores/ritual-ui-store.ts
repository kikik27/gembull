import { create } from "zustand";

type RitualUiState = {
  historyLimit: number;
  busyAction: string | null;
  notice: string | null;
  actionError: string | null;
  showOlder: () => void;
  showThroughDay: (lastDay: number, day: number) => void;
  setBusyAction: (value: string | null) => void;
  setNotice: (value: string | null) => void;
  setActionError: (value: string | null) => void;
};

export const useRitualUiStore = create<RitualUiState>((set) => ({
  historyLimit: 7,
  busyAction: null,
  notice: null,
  actionError: null,
  showOlder: () => set((state) => ({ historyLimit: state.historyLimit + 7 })),
  showThroughDay: (lastDay, day) => set((state) => ({ historyLimit: Math.max(state.historyLimit, lastDay - day + 1) })),
  setBusyAction: (busyAction) => set({ busyAction }),
  setNotice: (notice) => set({ notice }),
  setActionError: (actionError) => set({ actionError }),
}));
