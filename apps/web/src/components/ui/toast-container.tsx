"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Info,
  Loader2,
  X,
} from "lucide-react";
import { useRitualUiStore, type ToastItem } from "@/stores/ritual-ui-store";

export function ToastContainer() {
  const { toasts, dispopToast } = useRitualUiStore();

  return (
    <div
      className="toast-viewport"
      aria-live="polite"
      aria-atomic="false"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => dispopToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  const iconMap = {
    success: <CheckCircle2 className="toast-icon toast-icon-success" size={20} />,
    error: <AlertCircle className="toast-icon toast-icon-error" size={20} />,
    info: <Info className="toast-icon toast-icon-info" size={20} />,
    loading: <Loader2 className="toast-icon toast-icon-loading animate-spin" size={20} />,
  };

  const explorerUrl = toast.txHash
    ? `https://explorer.testnet.near.org/transactions/${encodeURIComponent(toast.txHash)}`
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`toast-item toast-${toast.type} glass`}
      role="status"
    >
      <div className="toast-lead">{iconMap[toast.type]}</div>
      <div className="toast-content">
        <div className="toast-title">{toast.title}</div>
        {toast.message && <p className="toast-message">{toast.message}</p>}
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="toast-link"
          >
            <span>View on Explorer</span>
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="toast-close"
        aria-label="Dismiss notification"
      >
        <X size={15} aria-hidden="true" />
      </button>
    </motion.div>
  );
}
