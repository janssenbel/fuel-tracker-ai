/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useId, useEffect } from 'react';
import { Vehicle, FuelLog } from '../types';
import { FUEL_STATIONS, formatPHP, getTodayString } from '../utils/helpers';
import { PlusCircle, Fuel, Zap, Calculator } from 'lucide-react';

interface LogEntryFormProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  latestOdometerMap: Record<string, number>;
  onAddLog: (log: Omit<FuelLog, 'id'>, autoBackup: boolean) => void;
  defaultFullTank: boolean;
  autoBackupDefault: boolean;
  onToggleAutoBackup: (enabled: boolean) => void;
  onOpenVehicleModal?: () => void;
}

export const LogEntryForm: React.FC<LogEntryFormProps> = ({
  vehicles,
  selectedVehicleId,
  latestOdometerMap,
  onAddLog,
  defaultFullTank,
  autoBackupDefault,
  onToggleAutoBackup,
  onOpenVehicleModal,
}) => {
  const formId = useId();
  const [vehicleId, setVehicleId] = useState<string>(() => {
    if (selectedVehicleId !== 'all' && vehicles.some((v) => v.id === selectedVehicleId)) {
      return selectedVehicleId;
    }
    return vehicles[0]?.id || '';
  });
  const [date, setDate] = useState(getTodayString());
  const [odometer, setOdometer] = useState<string>('');
  const [pricePerLiter, setPricePerLiter] = useState<string>('');
  const [volume, setVolume] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [isFullTank, setIsFullTank] = useState<boolean>(defaultFullTank);
  const [station, setStation] = useState<string>('Petron');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    setIsFullTank(defaultFullTank);
  }, [defaultFullTank]);

  // Keep vehicleId synchronized when vehicles list or active filter changes
  useEffect(() => {
    if (selectedVehicleId !== 'all' && vehicles.some((v) => v.id === selectedVehicleId)) {
      setVehicleId(selectedVehicleId);
    } else if (!vehicles.some((v) => v.id === vehicleId)) {
      setVehicleId(vehicles[0]?.id || '');
    }
  }, [selectedVehicleId, vehicles, vehicleId]);

  // Guaranteed safe resolution of the selected vehicle and its latest odometer reading
  const activeVehId = vehicles.some((v) => v.id === vehicleId)
    ? vehicleId
    : vehicles[0]?.id || '';

  const rawLatestOdo =
    activeVehId && latestOdometerMap ? latestOdometerMap[activeVehId] : undefined;
  const currentVehicleLatestOdo: number | null =
    typeof rawLatestOdo === 'number' && !isNaN(rawLatestOdo) ? rawLatestOdo : null;

  // Smart 3-way bidirectional auto-calculation between Price/L, Liters, and Total Cost
  const handlePriceChange = (val: string) => {
    setPricePerLiter(val);
    const p = parseFloat(val);
    const v = parseFloat(volume);
    const c = parseFloat(cost);
    if (!isNaN(p) && p > 0) {
      if (!isNaN(v) && v > 0) {
        setCost((p * v).toFixed(2));
      } else if (!isNaN(c) && c > 0) {
        setVolume((c / p).toFixed(2));
      }
    }
  };

  const handleVolumeChange = (val: string) => {
    setVolume(val);
    const v = parseFloat(val);
    const p = parseFloat(pricePerLiter);
    const c = parseFloat(cost);
    if (!isNaN(v) && v > 0) {
      if (!isNaN(p) && p > 0) {
        setCost((v * p).toFixed(2));
      } else if (!isNaN(c) && c > 0) {
        setPricePerLiter((c / v).toFixed(2));
      }
    }
  };

  const handleCostChange = (val: string) => {
    setCost(val);
    const c = parseFloat(val);
    const p = parseFloat(pricePerLiter);
    const v = parseFloat(volume);
    if (!isNaN(c) && c > 0) {
      if (!isNaN(p) && p > 0) {
        setVolume((c / p).toFixed(2));
      } else if (!isNaN(v) && v > 0) {
        setPricePerLiter((c / v).toFixed(2));
      }
    }
  };

  // Real-time calculated price per liter display
  const numVolume = parseFloat(volume);
  const numCost = parseFloat(cost);
  const numPrice = parseFloat(pricePerLiter);
  const effectivePricePerLiter =
    !isNaN(numPrice) && numPrice > 0
      ? numPrice
      : numVolume > 0 && numCost > 0
      ? numCost / numVolume
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const odoNum = parseFloat(odometer);
    const volNum = parseFloat(volume);
    const costNum = parseFloat(cost);
    const priceNum =
      !isNaN(numPrice) && numPrice > 0
        ? numPrice
        : volNum > 0 && costNum > 0
        ? costNum / volNum
        : undefined;

    if (isNaN(odoNum) || odoNum <= 0) {
      alert('Please enter a valid odometer reading.');
      return;
    }
    if (isNaN(volNum) || volNum <= 0) {
      alert('Please enter fuel added in liters.');
      return;
    }
    if (isNaN(costNum) || costNum <= 0) {
      alert('Please enter the total cost in Philippine Peso (₱).');
      return;
    }

    if (currentVehicleLatestOdo !== null && odoNum <= currentVehicleLatestOdo) {
      const confirmLower = confirm(
        `The odometer reading (${odoNum.toLocaleString()} km) is lower than or equal to the previous logged reading (${currentVehicleLatestOdo.toLocaleString()} km) for this vehicle.\n\nProceed anyway?`
      );
      if (!confirmLower) return;
    }

    onAddLog(
      {
        vehicleId: activeVehId || 'default',
        date,
        odometer: odoNum,
        volume: volNum,
        cost: costNum,
        pricePerLiter: priceNum,
        isFullTank,
        station,
        notes: notes.trim() || undefined,
      },
      autoBackupDefault
    );

    // Reset entry inputs while keeping date & vehicle
    setOdometer('');
    setPricePerLiter('');
    setVolume('');
    setCost('');
    setNotes('');
    setIsFullTank(defaultFullTank);
  };

  if (vehicles.length === 0) {
    return (
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-xl">
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
            <Fuel className="w-6 h-6" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            Garage is Empty
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Register your vehicle first to start logging fill-ups, tracking fuel price per liter, and computing fuel economy (km/L).
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenVehicleModal}
              className="min-h-[44px] px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] font-semibold text-sm rounded-xl text-white transition-all shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Your Vehicle</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <PlusCircle className="w-4 h-4" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            Record New Fill-Up
          </h2>
        </div>
        {effectivePricePerLiter !== null && (
          <div className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-300 flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Noted Price:</span>
            <span className="font-semibold text-emerald-400 font-mono tabular-nums">
              {formatPHP(effectivePricePerLiter)}/L
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Vehicle, Date, Odometer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Vehicle Select */}
          <div>
            <label
              htmlFor={`${formId}-vehicle`}
              className="block text-xs font-semibold text-slate-400 mb-1"
            >
              Vehicle
            </label>
            <select
              id={`${formId}-vehicle`}
              value={activeVehId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
              className="w-full min-h-[44px] sm:min-h-[38px] bg-slate-800 border border-slate-700 rounded-xl sm:rounded-lg px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.plateNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor={`${formId}-date`}
              className="block text-xs font-semibold text-slate-400 mb-1"
            >
              Date
            </label>
            <input
              id={`${formId}-date`}
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full min-h-[44px] sm:min-h-[38px] bg-slate-800 border border-slate-700 rounded-xl sm:rounded-lg px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          {/* Odometer */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor={`${formId}-odometer`}
                className="text-xs font-semibold text-slate-400"
              >
                Odometer (km)
              </label>
              {currentVehicleLatestOdo !== null && (
                <span className="text-[11px] text-emerald-400/90 font-mono tabular-nums">
                  prev: {Number(currentVehicleLatestOdo).toLocaleString()}
                </span>
              )}
            </div>
            <input
              id={`${formId}-odometer`}
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              required
              placeholder={
                currentVehicleLatestOdo !== null
                  ? `e.g. ${(currentVehicleLatestOdo + 350).toString()}`
                  : 'e.g. 15450'
              }
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              className="w-full min-h-[44px] sm:min-h-[38px] bg-slate-800 border border-slate-700 rounded-xl sm:rounded-lg px-3 py-2 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tabular-nums"
            />
          </div>
        </div>

        {/* Row 2: Fuel Pricing & Quantities (Price/L, Liters, Total Paid with Auto-Calculation) */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5" />
              Fuel Price & Volume
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Fill any 2 fields to auto-calculate the third
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Price per Liter */}
            <div>
              <label
                htmlFor={`${formId}-price`}
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Price / Liter (₱/L)
              </label>
              <div className="relative">
                <input
                  id={`${formId}-price`}
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 64.50"
                  value={pricePerLiter}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="w-full min-h-[44px] sm:min-h-[38px] bg-slate-800 border border-slate-700 rounded-xl sm:rounded-lg px-3 py-2 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tabular-nums"
                />
              </div>
            </div>

            {/* Fuel Added */}
            <div>
              <label
                htmlFor={`${formId}-volume`}
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Fuel Added (Liters) *
              </label>
              <input
                id={`${formId}-volume`}
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                required
                placeholder="e.g. 42.50"
                value={volume}
                onChange={(e) => handleVolumeChange(e.target.value)}
                className="w-full min-h-[44px] sm:min-h-[38px] bg-slate-800 border border-slate-700 rounded-xl sm:rounded-lg px-3 py-2 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tabular-nums"
              />
            </div>

            {/* Total Paid */}
            <div>
              <label
                htmlFor={`${formId}-cost`}
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Total Paid (₱) *
              </label>
              <input
                id={`${formId}-cost`}
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                required
                placeholder="e.g. 2650.00"
                value={cost}
                onChange={(e) => handleCostChange(e.target.value)}
                className="w-full min-h-[44px] sm:min-h-[38px] bg-slate-800 border border-slate-700 rounded-xl sm:rounded-lg px-3 py-2 text-base sm:text-xs text-emerald-400 font-bold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Fuel Station & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          <div>
            <label
              htmlFor={`${formId}-station`}
              className="block text-xs font-semibold text-slate-400 mb-1"
            >
              Fuel Station (Optional)
            </label>
            <select
              id={`${formId}-station`}
              value={station}
              onChange={(e) => setStation(e.target.value)}
              className="w-full min-h-[44px] sm:min-h-[36px] bg-slate-800 border border-slate-700 rounded-xl sm:rounded-lg px-3 py-1.5 text-base sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {FUEL_STATIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3">
            <label
              htmlFor={`${formId}-notes`}
              className="block text-xs font-semibold text-slate-400 mb-1"
            >
              Trip or Driving Notes (Optional)
            </label>
            <input
              id={`${formId}-notes`}
              type="text"
              placeholder="e.g. City traffic, SLEX highway run"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[44px] sm:min-h-[36px] bg-slate-800 border border-slate-700 rounded-xl sm:rounded-lg px-3 py-1.5 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Action Row: Touch-friendly Checkboxes & Submit CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 min-h-[32px] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFullTank}
                onChange={(e) => setIsFullTank(e.target.checked)}
                className="w-5 h-5 sm:w-4 sm:h-4 text-emerald-500 rounded bg-slate-900 border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer shrink-0"
              />
              <span className="text-xs text-slate-300 font-medium">
                Full Tank (recommended for accurate km/L)
              </span>
            </label>

            <label className="flex items-center gap-2.5 min-h-[32px] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoBackupDefault}
                onChange={(e) => onToggleAutoBackup(e.target.checked)}
                className="w-5 h-5 sm:w-4 sm:h-4 text-emerald-500 rounded bg-slate-900 border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer shrink-0"
              />
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-emerald-400/20 shrink-0" />
                Auto-download backup file (JSON) on save
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto min-h-[48px] sm:min-h-[40px] px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] font-semibold text-sm rounded-xl sm:rounded-lg text-white transition-all shadow-md hover:shadow-emerald-900/30 cursor-pointer whitespace-nowrap"
          >
            Save Fill-Up Record
          </button>
        </div>
      </form>
    </section>
  );
};
