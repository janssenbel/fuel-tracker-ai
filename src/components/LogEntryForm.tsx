/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useId } from 'react';
import { Vehicle, FuelLog } from '../types';
import { FUEL_STATIONS, formatPHP, getTodayString } from '../utils/helpers';
import { PlusCircle, Fuel, Zap, HelpCircle } from 'lucide-react';

interface LogEntryFormProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  latestOdometerMap: Record<string, number>;
  onAddLog: (log: Omit<FuelLog, 'id'>, autoBackup: boolean) => void;
  autoBackupDefault: boolean;
  onToggleAutoBackup: (enabled: boolean) => void;
  onOpenVehicleModal?: () => void;
}

export const LogEntryForm: React.FC<LogEntryFormProps> = ({
  vehicles,
  selectedVehicleId,
  latestOdometerMap,
  onAddLog,
  autoBackupDefault,
  onToggleAutoBackup,
  onOpenVehicleModal,
}) => {
  const formId = useId();
  const [vehicleId, setVehicleId] = useState<string>(() => {
    if (selectedVehicleId !== 'all') return selectedVehicleId;
    return vehicles[0]?.id || '';
  });
  const [date, setDate] = useState(getTodayString());
  const [odometer, setOdometer] = useState<string>('');
  const [volume, setVolume] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [isFullTank, setIsFullTank] = useState(true);
  const [station, setStation] = useState<string>('Petron');
  const [notes, setNotes] = useState<string>('');

  // Keep vehicleId in sync if selectedVehicleId changes from external filter
  React.useEffect(() => {
    if (selectedVehicleId !== 'all') {
      setVehicleId(selectedVehicleId);
    } else if (!vehicleId && vehicles.length > 0) {
      setVehicleId(vehicles[0].id);
    }
  }, [selectedVehicleId, vehicles]);

  const currentVehicleLatestOdo = vehicleId ? latestOdometerMap[vehicleId] : null;

  // Real-time calculation of fuel price per liter
  const numVolume = parseFloat(volume);
  const numCost = parseFloat(cost);
  const livePricePerLiter =
    numVolume > 0 && numCost > 0 ? numCost / numVolume : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const odoNum = parseFloat(odometer);
    const volNum = parseFloat(volume);
    const costNum = parseFloat(cost);

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

    if (currentVehicleLatestOdo && odoNum <= currentVehicleLatestOdo) {
      const confirmLower = confirm(
        `The odometer reading (${odoNum.toLocaleString()} km) is lower than or equal to the previous logged reading (${currentVehicleLatestOdo.toLocaleString()} km) for this vehicle.\n\nProceed anyway?`
      );
      if (!confirmLower) return;
    }

    onAddLog(
      {
        vehicleId: vehicleId || vehicles[0]?.id || 'default',
        date,
        odometer: odoNum,
        volume: volNum,
        cost: costNum,
        isFullTank,
        station,
        notes: notes.trim() || undefined,
      },
      autoBackupDefault
    );

    // Reset entry inputs but keep date & vehicle
    setOdometer('');
    setVolume('');
    setCost('');
    setNotes('');
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
          <p className="text-xs text-slate-400 leading-relaxed">
            Please register your vehicle to begin logging fill-ups, calculating fuel consumption (km/L), and tracking expenses in Philippine Pesos (₱).
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenVehicleModal}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs rounded-lg text-white transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
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
    <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <PlusCircle className="w-4 h-4" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            Record New Fill-Up
          </h2>
        </div>
        {livePricePerLiter !== null && (
          <div className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-300">
            Price / Liter:{' '}
            <span className="font-semibold text-emerald-400 font-mono">
              {formatPHP(livePricePerLiter)}/L
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Grid: 5 responsive columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
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
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
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
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>

          {/* Odometer */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor={`${formId}-odometer`}
                className="text-xs font-semibold text-slate-400"
              >
                Odometer (km)
              </label>
              {currentVehicleLatestOdo !== null && (
                <span className="text-[10px] text-slate-500 font-mono">
                  prev: {currentVehicleLatestOdo.toLocaleString()}
                </span>
              )}
            </div>
            <input
              id={`${formId}-odometer`}
              type="number"
              step="any"
              min="0"
              required
              placeholder={
                currentVehicleLatestOdo
                  ? `e.g. ${(currentVehicleLatestOdo + 450).toString()}`
                  : 'e.g. 15450'
              }
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono tabular-nums"
            />
          </div>

          {/* Fuel Volume */}
          <div>
            <label
              htmlFor={`${formId}-volume`}
              className="block text-xs font-semibold text-slate-400 mb-1"
            >
              Fuel Added (Liters)
            </label>
            <input
              id={`${formId}-volume`}
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="e.g. 42.50"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono tabular-nums"
            />
          </div>

          {/* Total Cost in PHP */}
          <div>
            <label
              htmlFor={`${formId}-cost`}
              className="block text-xs font-semibold text-slate-400 mb-1"
            >
              Total Paid (₱)
            </label>
            <input
              id={`${formId}-cost`}
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="e.g. 2650.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono tabular-nums"
            />
          </div>
        </div>

        {/* Secondary Row: Station & Notes */}
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
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
              placeholder="e.g. City driving with heavy traffic, full aircon, SLEX tollway run"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Action Row: Checkboxes & Submit Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFullTank}
                onChange={(e) => setIsFullTank(e.target.checked)}
                className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs text-slate-300 font-medium">
                Full Tank (recommended for precise km/L calculation)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoBackupDefault}
                onChange={(e) => onToggleAutoBackup(e.target.checked)}
                className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-emerald-400/20" />
                Auto-download backup file (JSON) on save
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs sm:text-sm rounded-lg text-white transition-all shadow-md hover:shadow-emerald-900/30 cursor-pointer whitespace-nowrap self-end sm:self-auto"
          >
            Save Fill-Up Record
          </button>
        </div>
      </form>
    </section>
  );
};
