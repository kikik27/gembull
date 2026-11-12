import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "loading";

export type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  txHash?: string;
  durationMs?: number;
};

export type PopToastOptions = {
  type?: ToastType;
  title: string;
  message?: string;
  txHash?: string;
  durationMs?: number;
};

type RitualUiState = {
  historyLimit: number;
  busyAction: string | null;
  notice: string | null;
  actionError: string | null;
  toasts: ToastItem[];
  showOlder: () => void;
  showThroughDay: (lastDay: number, day: number) => void;
  setBusyAction: (value: string | null) => void;
  setNotice: (value: string | null) => void;
  setActionError: (value: string | null) => void;
  popToast: (options: PopToastOptions) => string;
  dispopToast: (id: string) => void;
  clearToasts: () => void;
};

let toastCounter = 0;

export const useRitualUiStore = create<RitualUiState>((set, get) => ({
  historyLimit: 7,
  busyAction: null,
  notice: null,
  actionError: null,
  toasts: [],

  showOlder: () => set((state) => ({ historyLimit: state.historyLimit + 7 })),

  showThroughDay: (lastDay, day) =>
    set((state) => ({
      historyLimit: Math.max(state.historyLimit, lastDay - day + 1),
    })),

  setBusyAction: (busyAction) => set({ busyAction }),

  setNotice: (notice) => {
    set({ notice });
    if (notice) {
      get().popToast({
        type: "success",
        title: "Confirmed",
        message: notice,
      });
    }
  },

  setActionError: (actionError) => {
    set({ actionError });
    if (actionError) {
      get().popToast({
        type: "error",
        title: "Action Failed",
        message: actionError,
      });
    }
  },

  popToast: (options: PopToastOptions) => {
    const id = `toast-${Date.now()}-${++toastCounter}`;
    const newToast: ToastItem = {
      id,
      type: options.type ?? "info",
      title: options.title,
      message: options.message,
      txHash: options.txHash,
      durationMs: options.durationMs ?? 5000,
    };

    set((state) => ({
      toasts: [newToast, ...state.toasts].slice(0, 5),
    }));

    if (newToast.durationMs && newToast.durationMs > 0) {
      setTimeout(() => {
        get().dispopToast(id);
      }, newToast.durationMs);
    }

    return id;
  },

  dispopToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => set({ toasts: [] }),
}));
