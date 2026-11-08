/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  isError?: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, isError = false, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-20 md:bottom-5 left-3.5 right-3.5 sm:left-auto sm:right-5 z-50 sm:max-w-md animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium ${
          isError
            ? 'bg-rose-950/90 border-rose-800 text-rose-200'
            : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
        }`}
      >
        {isError ? (
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        )}
        <span className="flex-1 text-xs sm:text-sm">{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/20 text-slate-400 hover:text-white transition"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
