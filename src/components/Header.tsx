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
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
          <Fuel className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">FuelTracker PH</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300">
              km/L · ₱
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            Multi-vehicle mileage, fuel economy (km/L), and expense tracking
          </p>
        </div>
      </div>

      {/* BelBros-style Action Buttons + PWA Install */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
        <PWAInstallButton />

        <button
          type="button"
          onClick={onOpenVehicleModal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow cursor-pointer whitespace-nowrap"
        >
          <CarFront className="w-3.5 h-3.5 text-slate-400" />
          <span>Garage ({vehicleCount})</span>
        </button>

        <button
          type="button"
          onClick={onExportBackup}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow cursor-pointer whitespace-nowrap"
          title="Download all vehicles and fill-up records as a JSON file"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Backup (JSON)</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow cursor-pointer whitespace-nowrap"
          title="Restore previous JSON backup file"
        >
          <Upload className="w-3.5 h-3.5 text-slate-400" />
          <span>Import / Restore</span>
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
