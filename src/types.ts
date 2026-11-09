/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  type: 'sedan' | 'suv' | 'motorcycle' | 'pickup' | 'van' | 'hatchback';
  fuelType: string;
  color: string;
  isDefault?: boolean;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string; // YYYY-MM-DD
  odometer: number; // km
  volume: number; // Liters
  cost: number; // PHP (₱)
  isFullTank: boolean;
  pricePerLiter?: number; // Noted fuel price in ₱/L
  station?: string;
  notes?: string;
  createdAt?: string;
}

export interface ComputedFuelLog extends FuelLog {
  deltaDist: number; // km driven since previous fill-up of same vehicle
  economy: number | null; // km/L (higher is better)
  costPerDist: number | null; // ₱/km
  pricePerLiter: number; // ₱/L
}

export interface PeriodSummary {
  periodKey: string;
  periodLabel: string;
  totalDistance: number;
  totalFuel: number;
  totalCost: number;
  avgEconomy: number | null;
  avgCostPerKm: number | null;
  avgFuelPrice: number | null; // Average fuel cost in ₱/L over time
  count: number;
}

export interface BackupData {
  version: number;
  appName: string;
  exportedAt: string;
  vehicles: Vehicle[];
  logs: FuelLog[];
}
