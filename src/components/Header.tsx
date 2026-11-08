/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Download, Upload, Fuel, CarFront } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  vehicleCount: number;
  onOpenVehicleModal: () => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  vehicleCount,
  onOpenVehicleModal,
  onExportBackup,
  onImportBackup,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 pb-4 border-b border-slate-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
          <Fuel className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white whitespace-nowrap">
              FuelTracker PH
            </h1>
            <span className="text-xs font-medium text-emerald-400 whitespace-nowrap">
              km/L · ₱
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            Multi-vehicle mileage, fuel economy, and expense tracker
          </p>
        </div>
      </div>

      {/* Action Buttons + PWA Install */}
      <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full md:w-auto justify-end">
        <div className="col-span-3 sm:col-span-1 flex justify-end empty:hidden">
          <PWAInstallButton />
        </div>

        <button
          type="button"
          onClick={onOpenVehicleModal}
          className="min-h-[42px] sm:min-h-[36px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl sm:rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 border border-slate-700 transition shadow cursor-pointer whitespace-nowrap"
        >
          <CarFront className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Garage ({vehicleCount})</span>
        </button>

        <button
          type="button"
          onClick={onExportBackup}
          className="min-h-[42px] sm:min-h-[36px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl sm:rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white transition shadow cursor-pointer whitespace-nowrap"
          title="Download all vehicles and fill-up records as a JSON file"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>Backup</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="min-h-[42px] sm:min-h-[36px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl sm:rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 border border-slate-700 transition shadow cursor-pointer whitespace-nowrap"
          title="Restore previous JSON backup file"
        >
          <Upload className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Restore</span>
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
    </header>
  );
};
