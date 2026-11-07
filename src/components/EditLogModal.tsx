/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Vehicle, FuelLog, ComputedFuelLog } from '../types';
import { FUEL_STATIONS, formatPHP } from '../utils/helpers';
import { X, Check } from 'lucide-react';

interface EditLogModalProps {
  log: ComputedFuelLog | null;
  vehicles: Vehicle[];
  onClose: () => void;
  onSave: (updatedLog: FuelLog) => void;
}

export const EditLogModal: React.FC<EditLogModalProps> = ({
  log,
  vehicles,
  onClose,
  onSave,
}) => {
  const [vehicleId, setVehicleId] = useState('');
  const [date, setDate] = useState('');
  const [odometer, setOdometer] = useState('');
  const [volume, setVolume] = useState('');
  const [cost, setCost] = useState('');
  const [isFullTank, setIsFullTank] = useState(true);
  const [station, setStation] = useState('Petron');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (log) {
      setVehicleId(log.vehicleId);
      setDate(log.date);
      setOdometer(log.odometer.toString());
      setVolume(log.volume.toString());
      setCost(log.cost.toString());
      setIsFullTank(log.isFullTank);
      setStation(log.station || 'Petron');
      setNotes(log.notes || '');
    }
  }, [log]);

  if (!log) return null;

  const numVol = parseFloat(volume);
  const numCost = parseFloat(cost);
  const livePricePerLiter = numVol > 0 && numCost > 0 ? numCost / numVol : null;

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
      alert('Please enter valid fuel added in liters.');
      return;
    }
    if (isNaN(costNum) || costNum <= 0) {
      alert('Please enter valid total cost.');
      return;
    }

    onSave({
      id: log.id,
      vehicleId,
      date,
      odometer: odoNum,
      volume: volNum,
      cost: costNum,
      isFullTank,
      station,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            ✏️ Edit Fill-Up Record
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Vehicle
              </label>
              <select
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

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Odometer Reading (km)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Fuel Added (Liters)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Total Paid (₱)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Fuel Station
              </label>
              <select
                value={station}
                onChange={(e) => setStation(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {FUEL_STATIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {livePricePerLiter !== null && (
            <div className="text-xs bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-300">
              Calculated Fuel Price:{' '}
              <span className="font-semibold text-emerald-400 font-mono">
                {formatPHP(livePricePerLiter)} / Liter
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Traffic, trip destination"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={isFullTank}
              onChange={(e) => setIsFullTank(e.target.checked)}
              className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
            />
            <span className="text-xs text-slate-300 font-medium">
              Filled tank to full (used for km/L efficiency calculation)
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
