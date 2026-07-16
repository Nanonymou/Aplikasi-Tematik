"use client";

import { AnimatePresence, motion } from "framer-motion";

/**
 * Popup konfirmasi ramah anak. Dipakai a.l. untuk konfirmasi keluar akun
 * (Switch User) supaya tidak keluar karena kepencet.
 */
export default function ConfirmDialog({
  open,
  emoji = "🤔",
  title,
  message,
  confirmLabel,
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  emoji?: string;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-night/40 px-6"
          onClick={onCancel}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ scale: 0.7, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 10, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.4 }}
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl" aria-hidden>
              {emoji}
            </div>
            <h2 className="mt-3 text-2xl font-extrabold text-night">{title}</h2>
            <p className="mt-2 font-semibold text-night/60">{message}</p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                autoFocus
                className="btn-pop flex-1 bg-sky hover:bg-sky-deep"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="btn-pop flex-1 bg-coral hover:bg-coral-deep"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
