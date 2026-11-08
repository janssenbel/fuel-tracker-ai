/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Vehicle, FuelLog, ComputedFuelLog } from './types';
import {
  computeVehicleIsolatedLogs,
  exportBackupJSON,
  formatPHP,
  formatKm,
} from './utils/helpers';
import { Header } from './components/Header';
import { LogEntryForm } from './components/LogEntryForm';
import { SummarySection } from './components/SummarySection';
import { HistoryTable } from './components/HistoryTable';
import { VehicleManagerModal } from './components/VehicleManagerModal';
import { EditLogModal } from './components/EditLogModal';
import { Toast } from './components/Toast';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  Car,
  Fuel,
  Gauge,
  DollarSign,
  TrendingUp,
  Settings,
  PlusCircle,
  BarChart3,
  History,
} from 'lucide-react';

const STORAGE_KEYS = {
  VEHICLES: 'fueltracker_vehicles_v2',
  LOGS: 'fueltracker_logs_v2',
  OLD_LOGS: 'fuel_logs_ph',
  AUTO_BACKUP: 'fueltracker_autobackup_v2',
  ACTIVE_FILTER: 'fueltracker_filter_v2',
};

function sanitizeVehicles(raw: unknown): Vehicle[] {
  if (!Array.isArray(raw)) return [];
  const valid = raw
    .filter((v): v is Record<string, any> => Boolean(v && typeof v === 'object' && v.id && v.name))
    .map((v) => ({
      id: String(v.id),
      name: String(v.name),
      plateNumber: String(v.plateNumber || 'UNREGISTERED'),
      type: (v.type || 'suv') as Vehicle['type'],
      fuelType: String(v.fuelType || 'Diesel'),
      color: String(v.color || '#059669'),
      isDefault: Boolean(v.isDefault),
    }));

  // Purge old preloaded sample vehicles if only samples exist
  const isSample =
    valid.length > 0 &&
    valid.every((v) => v.id === 'veh-fortuner' || v.id === 'veh-click');
  return isSample ? [] : valid;
}

function sanitizeLogs(raw: unknown): FuelLog[] {
  if (!Array.isArray(raw)) return [];
  const valid = raw
    .filter(
      (l): l is Record<string, any> =>
        Boolean(
          l &&
            typeof l === 'object' &&
            l.date &&
            !isNaN(Number(l.odometer)) &&
            !isNaN(Number(l.volume))
        )
    )
    .map((l, idx) => ({
      id: String(l.id || `log-${Date.now()}-${idx}`),
      vehicleId: String(l.vehicleId || 'default'),
      date: String(l.date),
      odometer: Number(l.odometer),
      volume: Number(l.volume),
      cost: Number(l.cost || 0),
      isFullTank: l.isFullTank !== false,
      station: l.station ? String(l.station) : undefined,
      notes: l.notes ? String(l.notes) : undefined,
      createdAt: l.createdAt ? String(l.createdAt) : undefined,
    }));

  const isSample =
    valid.length > 0 &&
    valid.every(
      (l) =>
        l.vehicleId === 'veh-fortuner' ||
        l.vehicleId === 'veh-click' ||
        /^log-[1-7]$/.test(l.id)
    );
  return isSample ? [] : valid;
}

export default function App() {
  // --- Vehicles State ---
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      if (stored) {
        return sanitizeVehicles(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to parse vehicles from localStorage', e);
    }
    return [];
  });

  // --- Logs State ---
  const [logs, setLogs] = useState<FuelLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (stored) {
        return sanitizeLogs(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to parse logs from localStorage', e);
    }
    return [];
  });

  // --- Auto-Backup Checkbox Preference ---
  const [autoBackupEnabled, setAutoBackupEnabled] = useState<boolean>(() => {
    const val = localStorage.getItem(STORAGE_KEYS.AUTO_BACKUP);
    return val !== null ? val === 'true' : true;
  });

  // --- Selected Vehicle Filter ('all' or vehicleId) ---
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_FILTER) || 'all';
  });

  // --- Modal & Toast States ---
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<ComputedFuelLog | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'summary' | 'history'>('form');
  const [toast, setToast] = useState<{ message: string | null; isError: boolean }>({
    message: null,
    isError: false,
  });

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast((prev) => (prev.message === message ? { message: null, isError: false } : prev));
    }, 4000);
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTO_BACKUP, String(autoBackupEnabled));
  }, [autoBackupEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_FILTER, selectedVehicleId);
  }, [selectedVehicleId]);

  // Ensure selectedVehicleId is valid if a vehicle gets deleted or not found
  useEffect(() => {
    if (
      selectedVehicleId !== 'all' &&
      !vehicles.some((v) => v.id === selectedVehicleId)
    ) {
      setSelectedVehicleId('all');
    }
  }, [vehicles, selectedVehicleId]);

  // --- Isolated Calculations per vehicle ---
  const displayComputedLogs = useMemo(() => {
    const validFilter =
      selectedVehicleId === 'all' || vehicles.some((v) => v.id === selectedVehicleId)
        ? selectedVehicleId
        : 'all';
    return computeVehicleIsolatedLogs(logs, validFilter);
  }, [logs, selectedVehicleId, vehicles]);

  // Map latest odometer reading for each vehicle safely
  const latestOdometerMap = useMemo(() => {
    const map: Record<string, number> = {};
    vehicles.forEach((v) => {
      const vLogs = logs.filter(
        (l) => l.vehicleId === v.id && typeof l.odometer === 'number' && !isNaN(l.odometer)
      );
      if (vLogs.length > 0) {
        map[v.id] = Math.max(...vLogs.map((l) => l.odometer));
      }
    });
    return map;
  }, [vehicles, logs]);

  // Selected vehicle object or null if 'all'
  const activeVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || null;
  }, [vehicles, selectedVehicleId]);

  // --- Top KPI Computations for the active filter ---
  const kpis = useMemo(() => {
    let totalDist = 0;
    let totalCost = 0;
    const validEconomies: number[] = [];

    displayComputedLogs.forEach((l) => {
      if (l.deltaDist > 0) totalDist += l.deltaDist;
      totalCost += Number(l.cost || 0);
      if (l.economy !== null && !isNaN(l.economy) && l.economy > 0) {
        validEconomies.push(l.economy);
      }
    });

    const avgEconomy =
      validEconomies.length > 0
        ? validEconomies.reduce((a, b) => a + b, 0) / validEconomies.length
        : null;

    const avgCostPerDist = totalDist > 0 ? totalCost / totalDist : null;

    return {
      totalDist,
      totalCost,
      avgEconomy,
      avgCostPerDist,
    };
  }, [displayComputedLogs]);

  // --- Handlers: Logs CRUD ---
  const handleAddLog = (newLogData: Omit<FuelLog, 'id'>, shouldAutoBackup: boolean) => {
    const newLog: FuelLog = {
      ...newLogData,
      id: 'log-' + Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);

    if (shouldAutoBackup) {
      exportBackupJSON(vehicles, updatedLogs, true);
      showToast('✔ Fill-up saved and backup JSON file auto-downloaded!');
    } else {
      showToast('✔ Fill-up record saved successfully!');
    }
  };

  const handleUpdateLog = (updatedLog: FuelLog) => {
    setLogs((prev) => prev.map((l) => (l.id === updatedLog.id ? updatedLog : l)));
    showToast('✔ Record updated successfully!');
  };

  const handleDeleteLog = (id: string) => {
    if (confirm('Are you sure you want to delete this fill-up record?')) {
      setLogs((prev) => prev.filter((l) => l.id !== id));
      showToast('Record deleted.');
    }
  };

  const handleClearAll = () => {
    const confirmed = confirm(
      'Are you sure you want to delete ALL fuel fill-up records?\n\nTip: You can download a Backup (JSON) first to prevent data loss.'
    );
    if (confirmed) {
      setLogs([]);
      showToast('All fuel records cleared.');
    }
  };

  // --- Handlers: Vehicles CRUD ---
  const handleAddVehicle = (newVehData: Omit<Vehicle, 'id'>) => {
    const newVeh: Vehicle = {
      ...newVehData,
      id: 'veh-' + Date.now().toString(),
    };
    setVehicles((prev) => [...prev, newVeh]);
    setSelectedVehicleId(newVeh.id);
    showToast(`✔ Added vehicle "${newVeh.name}"!`);
  };

  const handleUpdateVehicle = (updatedVeh: Vehicle) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === updatedVeh.id ? updatedVeh : v))
    );
    showToast(`✔ Updated vehicle "${updatedVeh.name}".`);
  };

  const handleDeleteVehicle = (id: string) => {
    const veh = vehicles.find((v) => v.id === id);
    if (!veh) return;

    const countLogs = logs.filter((l) => l.vehicleId === id).length;
    const confirmMsg =
      countLogs > 0
        ? `Delete "${veh.name}"?\n\nThis vehicle has ${countLogs} associated fill-up record(s). Deleting the vehicle will also remove those records.`
        : `Delete "${veh.name}"?`;

    if (confirm(confirmMsg)) {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      setLogs((prev) => prev.filter((l) => l.vehicleId !== id));
      if (selectedVehicleId === id) {
        setSelectedVehicleId('all');
      }
      showToast(`Vehicle "${veh.name}" removed.`);
    }
  };

  const handleSetDefaultVehicle = (id: string) => {
    setVehicles((prev) =>
      prev.map((v) => ({
        ...v,
        isDefault: v.id === id,
      }))
    );
    showToast('Primary vehicle updated.');
  };

  // --- Handlers: BelBros Backup & Restore ---
  const handleExportBackup = () => {
    const ok = exportBackupJSON(vehicles, logs, false);
    if (ok) {
      showToast('✔ Backup JSON downloaded successfully!');
    }
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        // Check if v2 format with vehicles and logs
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.logs)) {
          const importedVehicles: Vehicle[] = Array.isArray(parsed.vehicles)
            ? sanitizeVehicles(parsed.vehicles)
            : vehicles;
          const importedLogs: FuelLog[] = sanitizeLogs(parsed.logs);

          const confirmed = confirm(
            `Restore Backup File:\n\n` +
              `• Found ${importedVehicles.length} vehicle(s)\n` +
              `• Found ${importedLogs.length} fill-up record(s)\n\n` +
              `Click OK to restore this backup. (Existing records will be merged/restored).`
          );

          if (!confirmed) return;

          // Merge vehicles
          const mergedVehicles = [...vehicles];
          importedVehicles.forEach((iv) => {
            if (!mergedVehicles.some((v) => v.id === iv.id)) {
              mergedVehicles.push(iv);
            }
          });

          // Merge logs
          const mergedLogs = [...logs];
          importedLogs.forEach((il) => {
            const idx = mergedLogs.findIndex(
              (l) =>
                l.id === il.id ||
                (l.vehicleId === il.vehicleId &&
                  l.odometer === il.odometer &&
                  l.date === il.date)
            );
            if (idx !== -1) {
              mergedLogs[idx] = il;
            } else {
              mergedLogs.push(il);
            }
          });

          setVehicles(mergedVehicles);
          setLogs(mergedLogs);
          showToast(`✔ Backup restored: ${importedLogs.length} records processed!`);
          return;
        }

        // Check if legacy raw array of logs
        if (Array.isArray(parsed)) {
          const valid = parsed.every(
            (item) => item.odometer !== undefined && item.volume !== undefined && item.date
          );
          if (!valid) {
            alert('File does not match the required fuel log format.');
            return;
          }

          let targetVehicles = [...vehicles];
          if (targetVehicles.length === 0) {
            targetVehicles = [
              {
                id: 'veh-restored-1',
                name: 'Primary Vehicle',
                plateNumber: 'RESTORED',
                type: 'suv',
                fuelType: 'Diesel',
                color: '#059669',
                isDefault: true,
              },
            ];
          }

          const confirmed = confirm(
            `Import Legacy Backup:\n\nFound ${parsed.length} record(s).\n\nAssign these records to "${targetVehicles[0].name}"?`
          );
          if (!confirmed) return;

          const defaultVehId = targetVehicles[0].id;
          const normalizedLogs: FuelLog[] = parsed.map((item: any, idx: number) => ({
            id: String(item.id || `imported-${Date.now()}-${idx}`),
            vehicleId: String(item.vehicleId || defaultVehId),
            date: String(item.date),
            odometer: Number(item.odometer),
            volume: Number(item.volume),
            cost: Number(item.cost || 0),
            isFullTank: item.isFullTank !== false,
            station: item.station || 'Station',
            notes: item.notes || '',
          }));

          setVehicles(targetVehicles);
          setLogs(normalizedLogs);
          showToast(`✔ Restored ${normalizedLogs.length} records into your garage!`);
          return;
        }

        alert('Invalid backup file structure.');
      } catch (err: any) {
        showToast('Error reading backup file: ' + err.message, true);
      }
    };
    reader.readAsText(file);
  };

  const scrollToSection = (id: string, tab: 'form' | 'summary' | 'history') => {
    setActiveMobileTab(tab);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const selectedVehicleName =
    selectedVehicleId === 'all'
      ? 'All Vehicles (Combined)'
      : activeVehicle
      ? `${activeVehicle.name} (${activeVehicle.plateNumber})`
      : 'Selected Vehicle';

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 pt-4 pb-24 md:py-6 px-3.5 sm:px-6 lg:px-8">
      <div id="section-top" className="max-w-5xl mx-auto space-y-5 sm:space-y-6">
        {/* Top Header with BelBros Backup / Restore */}
        <Header
          vehicleCount={vehicles.length}
          onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
        />

        {/* Vehicle Filter Bar & Quick Switcher */}
        <section className="bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap flex items-center gap-1.5">
              <Car className="w-4 h-4 text-emerald-400 shrink-0" />
              Active Vehicle:
            </span>
            {vehicles.length > 0 ? (
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="min-h-[44px] sm:min-h-[38px] bg-slate-800 border border-slate-700 rounded-xl sm:rounded-lg px-3 py-2 sm:py-1.5 text-base sm:text-sm font-semibold text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-72 cursor-pointer"
              >
                <option value="all">All Vehicles ({vehicles.length})</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} · {v.plateNumber} ({v.fuelType})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-slate-400 font-medium py-1">
                No vehicles registered yet
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
            <div className="text-xs text-slate-400 font-mono">
              Records:{' '}
              <span className="text-white font-semibold tabular-nums">
                {displayComputedLogs.length}
              </span>
            </div>
            {vehicles.length === 0 ? (
              <button
                type="button"
                onClick={() => setIsVehicleModalOpen(true)}
                className="min-h-[40px] sm:min-h-[36px] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl sm:rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white transition cursor-pointer shadow"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>+ Add First Vehicle</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsVehicleModalOpen(true)}
                className="min-h-[40px] sm:min-h-[36px] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl sm:rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Manage Garage</span>
              </button>
            )}
          </div>
        </section>

        {/* Top 4 KPI Metric Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Avg Economy (km/L) */}
          <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl sm:rounded-xl border border-slate-800 shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                Avg Economy
              </p>
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl font-bold mt-1 text-emerald-400 font-mono tabular-nums">
              {kpis.avgEconomy !== null && kpis.avgEconomy > 0
                ? `${kpis.avgEconomy.toFixed(2)}`
                : '--'}
            </p>
            <span className="text-[11px] text-slate-500 block truncate">
              km/L (Higher is better)
            </span>
          </div>

          {/* 2. Total Distance (km) */}
          <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl sm:rounded-xl border border-slate-800 shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                Total Distance
              </p>
              <Gauge className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl font-bold mt-1 text-slate-100 font-mono tabular-nums">
              {formatKm(kpis.totalDist)}
            </p>
            <span className="text-[11px] text-slate-500 block truncate">
              Calculated Trip Dist
            </span>
          </div>

          {/* 3. Total Spent in Philippine Pesos (₱) */}
          <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl sm:rounded-xl border border-slate-800 shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                Total Spent
              </p>
              <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl font-bold mt-1 text-emerald-400 font-mono tabular-nums">
              {formatPHP(kpis.totalCost)}
            </p>
            <span className="text-[11px] text-slate-500 block truncate">
              Philippine Pesos (₱)
            </span>
          </div>

          {/* 4. Cost per km (₱/km) */}
          <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl sm:rounded-xl border border-slate-800 shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                Avg Cost / Dist
              </p>
              <Fuel className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl font-bold mt-1 text-slate-100 font-mono tabular-nums">
              {kpis.avgCostPerDist !== null
                ? `${formatPHP(kpis.avgCostPerDist)}/km`
                : '--'}
            </p>
            <span className="text-[11px] text-slate-500 block truncate">
              ₱ / Kilometer driven
            </span>
          </div>
        </section>

        {/* Fill-Up Entry Form */}
        <div id="section-form">
          <LogEntryForm
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            latestOdometerMap={latestOdometerMap}
            onAddLog={handleAddLog}
            autoBackupDefault={autoBackupEnabled}
            onToggleAutoBackup={setAutoBackupEnabled}
            onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
          />
        </div>

        {/* Periodic Aggregated Summary (Weekly / Monthly) */}
        <SummarySection
          computedLogs={displayComputedLogs}
          selectedVehicleName={selectedVehicleName}
        />

        {/* Fill-Up History Table */}
        <HistoryTable
          computedLogs={displayComputedLogs}
          vehicles={vehicles}
          onDeleteLog={handleDeleteLog}
          onEditLog={(log) => setEditingLog(log)}
          onClearAll={handleClearAll}
        />

        {/* Footer info */}
        <footer className="text-center text-xs text-slate-500 pt-2 pb-6 space-y-1">
          <p>
            FuelTracker PH · Kilometer per Liter (km/L) & Philippine Peso (₱) Expense Ledger
          </p>
          <p className="text-[11px] text-slate-600">
            Trip distances and fuel economy are strictly isolated per vehicle odometer stream.
          </p>
        </footer>
      </div>

      {/* iPhone & Mobile Thumb-Zone Bottom Tab Bar */}
      <nav
        aria-label="Mobile quick navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe-nav"
      >
        <div className="grid grid-cols-4 items-center h-14 max-w-md mx-auto px-2">
          <button
            type="button"
            onClick={() => scrollToSection('section-top', 'form')}
            className={`flex flex-col items-center justify-center h-full transition cursor-pointer ${
              activeMobileTab === 'form' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5">Log Fill-Up</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('section-summary', 'summary')}
            className={`flex flex-col items-center justify-center h-full transition cursor-pointer ${
              activeMobileTab === 'summary'
                ? 'text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5">Summary</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('section-history', 'history')}
            className={`flex flex-col items-center justify-center h-full transition cursor-pointer ${
              activeMobileTab === 'history'
                ? 'text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5">
              Records ({displayComputedLogs.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsVehicleModalOpen(true)}
            className="flex flex-col items-center justify-center h-full text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <Car className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5">
              Garage ({vehicles.length})
            </span>
          </button>
        </div>
      </nav>

      {/* Vehicle Manager Modal */}
      <VehicleManagerModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        vehicles={vehicles}
        onAddVehicle={handleAddVehicle}
        onUpdateVehicle={handleUpdateVehicle}
        onDeleteVehicle={handleDeleteVehicle}
        onSetDefault={handleSetDefaultVehicle}
      />

      {/* Edit Log Modal */}
      <EditLogModal
        log={editingLog}
        vehicles={vehicles}
        onClose={() => setEditingLog(null)}
        onSave={handleUpdateLog}
      />

      {/* Offline Mode Status Banner */}
      <OfflineIndicator />

      {/* Notification Toast */}
      <Toast
        message={toast.message}
        isError={toast.isError}
        onClose={() => setToast({ message: null, isError: false })}
      />
    </div>
  );
}
