/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ComputedFuelLog } from '../types';
import { computeSummaries, formatPHP, formatKm, formatLitres } from '../utils/helpers';
import { Calendar, BarChart3 } from 'lucide-react';

interface SummarySectionProps {
  computedLogs: ComputedFuelLog[];
  selectedVehicleName: string;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  computedLogs,
  selectedVehicleName,
}) => {
  const [summaryView, setSummaryView] = useState<'weekly' | 'monthly'>('weekly');

  const summaries = computeSummaries(computedLogs, summaryView);

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Aggregated Summary
            </h2>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              · {selectedVehicleName}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Periodic consumption, spending, and fuel efficiency trends
          </p>
        </div>

        {/* Weekly / Monthly Segmented Toggle */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            type="button"
            onClick={() => setSummaryView('weekly')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              summaryView === 'weekly'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setSummaryView('monthly')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              summaryView === 'monthly'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-[11px] uppercase text-slate-400 font-semibold border-b border-slate-800 tracking-wider">
            <tr>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3 text-right">Trips</th>
              <th className="px-4 py-3 text-right">Distance</th>
              <th className="px-4 py-3 text-right">Total Fuel</th>
              <th className="px-4 py-3 text-right">Total Spent</th>
              <th className="px-4 py-3 text-right">Avg. Efficiency</th>
              <th className="px-4 py-3 text-right">Avg. Cost / km</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {summaries.map((item) => (
              <tr
                key={item.periodKey}
                className="hover:bg-slate-800/40 transition duration-150"
              >
                <td className="px-4 py-3 font-sans font-semibold text-white whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{item.periodLabel}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-slate-400 tabular-nums">
                  {item.count}
                </td>
                <td className="px-4 py-3 text-right text-slate-200 tabular-nums">
                  {item.totalDistance > 0 ? formatKm(item.totalDistance) : '—'}
                </td>
                <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                  {formatLitres(item.totalFuel)}
                </td>
                <td className="px-4 py-3 text-right text-emerald-400 font-semibold tabular-nums">
                  {formatPHP(item.totalCost)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {item.avgEconomy !== null && item.avgEconomy > 0 ? (
                    <span className="text-emerald-400 font-semibold">
                      {item.avgEconomy.toFixed(2)} km/L
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                  {item.avgCostPerKm !== null ? (
                    `${formatPHP(item.avgCostPerKm)}/km`
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {summaries.length === 0 && (
        <div className="p-8 text-center text-slate-500 text-xs">
          No records logged yet for {selectedVehicleName}. Add fill-ups above to compute periodic summaries.
        </div>
      )}
    </section>
  );
};
