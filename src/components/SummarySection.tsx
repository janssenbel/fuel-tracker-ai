/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ComputedFuelLog } from '../types';
import { computeSummaries, formatPHP, formatKm, formatLitres } from '../utils/helpers';
import { Calendar, BarChart3, Fuel, TrendingUp } from 'lucide-react';

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

  // Overall Fuel Cost Over Time analytics
  const fuelCostStats = useMemo(() => {
    let totalCost = 0;
    let totalFuel = 0;
    const validPrices: number[] = [];

    computedLogs.forEach((l) => {
      totalCost += Number(l.cost || 0);
      totalFuel += Number(l.volume || 0);
      if (typeof l.pricePerLiter === 'number' && l.pricePerLiter > 0) {
        validPrices.push(l.pricePerLiter);
      }
    });

    const avgFuelPrice = totalFuel > 0 ? totalCost / totalFuel : null;
    const latestFuelPrice = computedLogs[0]?.pricePerLiter || null;
    const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;
    const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : null;

    return {
      avgFuelPrice,
      latestFuelPrice,
      minPrice,
      maxPrice,
      hasData: computedLogs.length > 0,
    };
  }, [computedLogs]);

  return (
    <section
      id="section-summary"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
    >
      <div className="p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Aggregated Summary & Fuel Cost Trends
            </h2>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              · {selectedVehicleName}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Periodic consumption, average cost of fuel over time, and fuel efficiency trends
          </p>
        </div>

        {/* Weekly / Monthly Segmented Toggle (Touch-friendly on iPhone) */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl sm:rounded-lg border border-slate-700 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSummaryView('weekly')}
            className={`flex-1 sm:flex-initial min-h-[38px] sm:min-h-[30px] px-4 sm:px-3 py-1.5 rounded-lg sm:rounded-md text-xs font-semibold transition cursor-pointer ${
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
            className={`flex-1 sm:flex-initial min-h-[38px] sm:min-h-[30px] px-4 sm:px-3 py-1.5 rounded-lg sm:rounded-md text-xs font-semibold transition cursor-pointer ${
              summaryView === 'monthly'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Fuel Cost Over Time Analytics Bar */}
      {fuelCostStats.hasData && fuelCostStats.avgFuelPrice !== null && (
        <div className="bg-slate-950/60 border-b border-slate-800 px-4 py-3 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                <Fuel className="w-3 h-3 text-emerald-400" />
                Avg Fuel Cost Over Time
              </span>
              <p className="text-base sm:text-lg font-bold text-emerald-400 font-mono tabular-nums mt-0.5">
                {formatPHP(fuelCostStats.avgFuelPrice)}/L
              </p>
              <span className="text-[10px] text-slate-500">
                Weighted all-time average
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-slate-400" />
                Latest Fill-Up Price
              </span>
              <p className="text-base sm:text-lg font-bold text-slate-200 font-mono tabular-nums mt-0.5">
                {fuelCostStats.latestFuelPrice !== null
                  ? `${formatPHP(fuelCostStats.latestFuelPrice)}/L`
                  : '--'}
              </p>
              <span className="text-[10px] text-slate-500">
                Most recent noted price
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Lowest Price Noted
              </span>
              <p className="text-base sm:text-lg font-bold text-slate-300 font-mono tabular-nums mt-0.5">
                {fuelCostStats.minPrice !== null
                  ? `${formatPHP(fuelCostStats.minPrice)}/L`
                  : '--'}
              </p>
              <span className="text-[10px] text-slate-500">
                Best price logged
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Highest Price Noted
              </span>
              <p className="text-base sm:text-lg font-bold text-slate-300 font-mono tabular-nums mt-0.5">
                {fuelCostStats.maxPrice !== null
                  ? `${formatPHP(fuelCostStats.maxPrice)}/L`
                  : '--'}
              </p>
              <span className="text-[10px] text-slate-500">
                Peak price logged
              </span>
            </div>
          </div>
        </div>
      )}

      {/* iPhone & Mobile Card List (< 640px) */}
      <div className="sm:hidden divide-y divide-slate-800/80">
        {summaries.map((item) => (
          <div key={item.periodKey} className="p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-semibold text-white text-sm">
                <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{item.periodLabel}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {item.count} {item.count === 1 ? 'fill-up' : 'fill-ups'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-xs font-mono tabular-nums">
              {/* Total Spent */}
              <div className="bg-slate-800/40 rounded-xl p-2.5 border border-slate-800">
                <span className="block text-[10px] font-sans uppercase text-slate-500">
                  Total Spent
                </span>
                <span className="text-emerald-400 font-bold text-sm block truncate">
                  {formatPHP(item.totalCost)}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5 truncate">
                  {formatLitres(item.totalFuel)}
                </span>
              </div>

              {/* Avg Fuel Price Over This Period */}
              <div className="bg-slate-800/40 rounded-xl p-2.5 border border-slate-800">
                <span className="block text-[10px] font-sans uppercase text-slate-500">
                  Avg Fuel Price
                </span>
                <span className="text-slate-100 font-bold text-sm block truncate">
                  {item.avgFuelPrice !== null
                    ? `${formatPHP(item.avgFuelPrice)}/L`
                    : '—'}
                </span>
                <span className="block text-[10px] text-slate-500 mt-0.5 truncate">
                  Period cost/L
                </span>
              </div>

              {/* Avg Efficiency */}
              <div className="bg-slate-800/40 rounded-xl p-2.5 border border-slate-800">
                <span className="block text-[10px] font-sans uppercase text-slate-500">
                  Avg Economy
                </span>
                {item.avgEconomy !== null && item.avgEconomy > 0 ? (
                  <span className="text-emerald-400 font-bold text-sm block truncate">
                    {item.avgEconomy.toFixed(2)} km/L
                  </span>
                ) : (
                  <span className="text-slate-500 text-sm block">—</span>
                )}
                <span className="block text-[10px] text-slate-400 mt-0.5 truncate">
                  {item.totalDistance > 0 ? formatKm(item.totalDistance) : '0 km'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tablet & Desktop Table View (>= 640px) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-[11px] uppercase text-slate-400 font-semibold border-b border-slate-800 tracking-wider">
            <tr>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3 text-right">Trips</th>
              <th className="px-4 py-3 text-right">Distance</th>
              <th className="px-4 py-3 text-right">Total Fuel</th>
              <th className="px-4 py-3 text-right">Total Spent</th>
              <th className="px-4 py-3 text-right">Avg. Fuel Price</th>
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
                {/* Average Fuel Price for this period */}
                <td className="px-4 py-3 text-right text-slate-100 font-semibold tabular-nums">
                  {item.avgFuelPrice !== null ? (
                    `${formatPHP(item.avgFuelPrice)}/L`
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
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
