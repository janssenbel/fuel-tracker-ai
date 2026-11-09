/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vehicle, FuelLog, ComputedFuelLog, PeriodSummary, BackupData } from '../types';

export const DEFAULT_VEHICLES: Vehicle[] = [];

export const SAMPLE_LOGS: FuelLog[] = [];

export const FUEL_STATIONS = [
  'Petron',
  'Shell',
  'Caltex',
  'Seaoil',
  'Cleanfuel',
  'Phoenix',
  'Unioil',
  'PTT',
  'Total',
  'Flying V',
  'Other',
];

export const FUEL_TYPES = [
  'Diesel',
  'Premium Diesel',
  'Gasoline 91 (Regular / Unleaded)',
  'Gasoline 95 (Premium)',
  'Gasoline 97+ (High Octane)',
  'AutoLPG',
  'Electric (kWh equivalent)',
];

export function formatPHP(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₱0.00';
  }
  return (
    '₱' +
    Number(amount).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function formatKm(distance: number): string {
  if (isNaN(distance) || distance === null || distance === undefined) return '0 km';
  return (
    Number(distance).toLocaleString('en-PH', {
      maximumFractionDigits: 1,
    }) + ' km'
  );
}

export function formatLitres(volume: number): string {
  if (isNaN(volume) || volume === null || volume === undefined) return '0.00 L';
  return (
    Number(volume).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' L'
  );
}

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getWeekRangeLabel(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const day = dateObj.getDay();
    // Monday as start of week
    const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(dateObj.getFullYear(), dateObj.getMonth(), diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const f = (dt: Date) =>
      dt.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
    return `${f(monday)} – ${f(sunday)}, ${monday.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export function getMonthLabel(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Calculates isolated odometer distance and fuel efficiency strictly per vehicle.
 * Ensures Vehicle A's odometer readings never collide with Vehicle B's.
 */
export function computeVehicleIsolatedLogs(
  logs: FuelLog[],
  selectedVehicleId: string = 'all'
): ComputedFuelLog[] {
  // 1. Group logs by vehicle
  const logsByVehicle = new Map<string, FuelLog[]>();

  logs.forEach((log) => {
    const list = logsByVehicle.get(log.vehicleId) || [];
    list.push(log);
    logsByVehicle.set(log.vehicleId, list);
  });

  const allComputed: ComputedFuelLog[] = [];

  // 2. Compute within each vehicle's stream chronologically
  logsByVehicle.forEach((vehLogs) => {
    // Sort ascending by odometer, then date
    const sorted = [...vehLogs].sort((a, b) => {
      if (a.odometer !== b.odometer) return a.odometer - b.odometer;
      return a.date.localeCompare(b.date);
    });

    let prevOdo: number | null = null;

    sorted.forEach((log, index) => {
      let deltaDist = 0;
      let economy: number | null = null;
      let costPerDist: number | null = null;
      const pricePerLiter =
        typeof log.pricePerLiter === 'number' && log.pricePerLiter > 0
          ? log.pricePerLiter
          : log.volume > 0
          ? log.cost / log.volume
          : 0;

      if (index > 0 && prevOdo !== null) {
        deltaDist = log.odometer - prevOdo;
        if (deltaDist > 0) {
          if (log.volume > 0) {
            // km / L (Higher is better)
            economy = deltaDist / log.volume;
          }
          costPerDist = log.cost / deltaDist;
        }
      }

      prevOdo = log.odometer;

      allComputed.push({
        ...log,
        deltaDist,
        economy,
        costPerDist,
        pricePerLiter,
      });
    });
  });

  // Filter if a specific vehicle is selected
  const filtered =
    selectedVehicleId === 'all'
      ? allComputed
      : allComputed.filter((l) => l.vehicleId === selectedVehicleId);

  // Return sorted newest first by date & odometer for display
  return filtered.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.odometer - a.odometer;
  });
}

/**
 * Computes weekly or monthly aggregated summaries from computed logs
 */
export function computeSummaries(
  computedLogs: ComputedFuelLog[],
  periodType: 'weekly' | 'monthly'
): PeriodSummary[] {
  if (computedLogs.length === 0) return [];

  // Chronological order for grouping
  const chronological = [...computedLogs].reverse();
  const groups = new Map<string, { label: string; logs: ComputedFuelLog[] }>();

  chronological.forEach((log) => {
    const key =
      periodType === 'weekly' ? getWeekRangeLabel(log.date) : getMonthLabel(log.date);

    if (!groups.has(key)) {
      groups.set(key, { label: key, logs: [] });
    }
    groups.get(key)!.logs.push(log);
  });

  const summaries: PeriodSummary[] = [];

  groups.forEach((val, key) => {
    let totalDist = 0;
    let totalFuel = 0;
    let totalCost = 0;
    const validEconomies: number[] = [];

    val.logs.forEach((item) => {
      if (item.deltaDist > 0) totalDist += item.deltaDist;
      totalFuel += item.volume;
      totalCost += item.cost;
      if (item.economy !== null && item.economy > 0) {
        validEconomies.push(item.economy);
      }
    });

    let avgEconomy: number | null = null;
    if (validEconomies.length > 0) {
      avgEconomy =
        validEconomies.reduce((a, b) => a + b, 0) / validEconomies.length;
    } else if (totalDist > 0 && totalFuel > 0) {
      avgEconomy = totalDist / totalFuel;
    }

    const avgCostPerKm = totalDist > 0 ? totalCost / totalDist : null;
    const avgFuelPrice = totalFuel > 0 ? totalCost / totalFuel : null;

    summaries.push({
      periodKey: key,
      periodLabel: val.label,
      totalDistance: totalDist,
      totalFuel,
      totalCost,
      avgEconomy,
      avgCostPerKm,
      avgFuelPrice,
      count: val.logs.length,
    });
  });

  // Return newest period first
  return summaries.reverse();
}

/**
 * BelBros Export Method:
 * Creates Blob -> URL.createObjectURL -> dynamic anchor -> a.click() -> cleanup with 1000ms timeout
 */
export function exportBackupJSON(
  vehicles: Vehicle[],
  logs: FuelLog[],
  isAuto = false,
  customAppName = 'FuelTracker PH'
): boolean {
  if (logs.length === 0 && vehicles.length === 0) {
    if (!isAuto) {
      alert('No vehicle records or fuel logs to export.');
    }
    return false;
  }

  try {
    const payload: BackupData = {
      version: 2,
      appName: customAppName || 'FuelTracker PH',
      exportedAt: new Date().toISOString(),
      vehicles,
      logs,
    };

    const dataStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = getTodayString();
    a.href = url;
    a.download = `fueltracker-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);

    return true;
  } catch (err) {
    console.error('Export failed:', err);
    return false;
  }
}
