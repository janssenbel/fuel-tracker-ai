/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Vehicle, ComputedFuelLog } from '../types';
import { formatPHP, formatLitres } from '../utils/helpers';
import { Search, Trash2, Edit2, History, AlertTriangle } from 'lucide-react';

interface HistoryTableProps {
  computedLogs: ComputedFuelLog[];
  vehicles: Vehicle[];
  onDeleteLog: (id: string) => void;
  onEditLog: (log: ComputedFuelLog) => void;
  onClearAll: () => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  computedLogs,
  vehicles,
  onDeleteLog,
  onEditLog,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

  const filteredLogs = computedLogs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const veh = vehicleMap.get(log.vehicleId);
    return (
      log.date.includes(q) ||
      (log.station && log.station.toLowerCase().includes(q)) ||
      (log.notes && log.notes.toLowerCase().includes(q)) ||
      (veh && veh.name.toLowerCase().includes(q)) ||
      (veh && veh.plateNumber.toLowerCase().includes(q))
    );
  });

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Fill-Up Records ({filteredLogs.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological ledger of fuel top-ups with vehicle-isolated mileage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search station, notes, date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {computedLogs.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/60 transition whitespace-nowrap cursor-pointer"
              title="Clear all records"
            >
              Clear Records
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-[11px] uppercase text-slate-400 font-semibold border-b border-slate-800 tracking-wider">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3 text-right">Odometer</th>
              <th className="px-4 py-3 text-right">Trip Dist</th>
              <th className="px-4 py-3 text-right">Fuel Added</th>
              <th className="px-4 py-3 text-right">Price / L</th>
              <th className="px-4 py-3 text-right">Total Paid</th>
              <th className="px-4 py-3 text-right">Efficiency</th>
              <th className="px-4 py-3 text-right">Cost / km</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredLogs.map((log) => {
              const veh = vehicleMap.get(log.vehicleId);
              return (
                <tr
                  key={log.id}
                  className="hover:bg-slate-800/40 transition duration-150"
                >
                  {/* Date & Station */}
                  <td className="px-4 py-3 font-sans whitespace-nowrap">
                    <div className="font-semibold text-slate-100">{log.date}</div>
                    <div className="text-[11px] text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                      <span>{log.station || 'Station'}</span>
                      {log.notes && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[120px]" title={log.notes}>
                            {log.notes}
                          </span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Vehicle Tag */}
                  <td className="px-4 py-3 font-sans whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: veh?.color || '#059669' }}
                      />
                      <span className="font-medium text-slate-200">
                        {veh ? veh.name : 'Unknown'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono font-semibold uppercase mt-0.5">
                      {veh?.plateNumber || '—'}
                    </div>
                  </td>

                  {/* Odometer */}
                  <td className="px-4 py-3 text-right text-slate-200 tabular-nums font-semibold">
                    {log.odometer.toLocaleString()} km
                  </td>

                  {/* Delta Distance */}
                  <td className="px-4 py-3 text-right tabular-nums">
                    {log.deltaDist > 0 ? (
                      <span className="text-emerald-400 font-semibold">
                        +{log.deltaDist.toLocaleString()} km
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px] font-sans">
                        (Baseline)
                      </span>
                    )}
                  </td>

                  {/* Fuel Volume */}
                  <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                    {formatLitres(log.volume)}
                  </td>

                  {/* Price per Liter */}
                  <td className="px-4 py-3 text-right text-slate-400 tabular-nums">
                    {formatPHP(log.pricePerLiter)}/L
                  </td>

                  {/* Total Cost */}
                  <td className="px-4 py-3 text-right text-emerald-400 font-semibold tabular-nums">
                    {formatPHP(log.cost)}
                  </td>

                  {/* Efficiency (km/L) */}
                  <td className="px-4 py-3 text-right tabular-nums">
                    {log.economy !== null && log.economy > 0 ? (
                      <span className="text-emerald-400 font-semibold">
                        {log.economy.toFixed(2)} km/L
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  {/* Cost per km */}
                  <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                    {log.costPerDist !== null ? (
                      `${formatPHP(log.costPerDist)}/km`
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right font-sans whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEditLog(log)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                        title="Edit fill-up"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteLog(log.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredLogs.length === 0 && (
        <div className="p-8 text-center text-slate-500 text-xs">
          {searchQuery ? (
            <p>No fill-up records matched your search query &quot;{searchQuery}&quot;.</p>
          ) : (
            <p>No fill-up records found. Add your first fill-up above to start tracking!</p>
          )}
        </div>
      )}
    </section>
  );
};
