/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, ShieldCheck } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900/95 border border-emerald-500/40 px-3.5 py-2 text-xs font-medium text-slate-200 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
      <div className="w-2 h-2 rounded-full bg-emerald-400" />
      <WifiOff className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      <span>
        <strong>Offline Mode Active:</strong> Full features & local logs work without internet.
      </span>
    </div>
  );
};
