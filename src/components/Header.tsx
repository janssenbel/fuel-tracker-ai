/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Download, Upload, Fuel, CarFront, Settings } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  appName: string;
  appSubtitle: string;
  vehicleCount: number;
  onOpenVehicleModal: () => void;
  onOpenSettingsModal: () => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  appName,
  appSubtitle,
  vehicleCount,
  onOpenVehicleModal,
  onOpenSettingsModal,
  onExportBackup,
  onImportBackup,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="sticky top-0 z-30 header-frosted border-b border-slate-800/80 pb-3 px-3.5 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3.5">
        {/* Brand Identity */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Fuel className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white truncate">
                  {appName}
                </h1>
                <span className="text-[11px] sm:text-xs font-medium text-emerald-400 whitespace-nowrap shrink-0">
                  km/L · ₱
                </span>
              </div>
              <p className="text-slate-400 text-[11px] sm:text-xs truncate">
                {appSubtitle}
              </p>
            </div>
          </div>

          {/* Mobile Top-Right Settings & Install Buttons */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            <PWAInstallButton />
            <button
              type="button"
              onClick={onOpenSettingsModal}
              className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              title="App Settings"
              aria-label="App Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons + Desktop PWA Install */}
        <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="hidden md:flex items-center empty:hidden">
            <PWAInstallButton />
          </div>

          <button
            type="button"
            onClick={onOpenVehicleModal}
            className="min-h-[38px] sm:min-h-[36px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl sm:rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 active:scale-[0.98] text-slate-200 border border-slate-700 transition shadow cursor-pointer whitespace-nowrap"
          >
            <CarFront className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Garage ({vehicleCount})</span>
          </button>

          <button
            type="button"
            onClick={onExportBackup}
            className="min-h-[38px] sm:min-h-[36px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl sm:rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white transition shadow cursor-pointer whitespace-nowrap"
            title="Download all vehicles and fill-up records as a JSON file"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Backup</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[38px] sm:min-h-[36px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl sm:rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 active:scale-[0.98] text-slate-200 border border-slate-700 transition shadow cursor-pointer whitespace-nowrap"
            title="Restore previous JSON backup file"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Restore</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettingsModal}
            className="hidden md:flex min-h-[36px] items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 active:scale-[0.98] text-slate-200 border border-slate-700 transition shadow cursor-pointer whitespace-nowrap"
            title="App Settings"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Settings</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={(e) => {
              onImportBackup(e);
              if (e.target) e.target.value = '';
            }}
          />
        </div>
      </div>
    </header>
  );
};
