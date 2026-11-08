/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types';
import { FUEL_TYPES } from '../utils/helpers';
import { X, Plus, Trash2, Edit2, Check, Car, Bike, Truck, ShieldCheck } from 'lucide-react';

interface VehicleManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  onAddVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  onSetDefault: (id: string) => void;
}

const COLOR_OPTIONS = [
  { name: 'Emerald', value: '#059669' },
  { name: 'Sky Blue', value: '#0284c7' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Cyan', value: '#0891b2' },
  { name: 'Slate', value: '#475569' },
];

export const VehicleManagerModal: React.FC<VehicleManagerModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onSetDefault,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [type, setType] = useState<Vehicle['type']>('suv');
  const [fuelType, setFuelType] = useState(FUEL_TYPES[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);
  const [isAdding, setIsAdding] = useState(vehicles.length === 0);

  useEffect(() => {
    if (isOpen && vehicles.length === 0) {
      setIsAdding(true);
    }
  }, [isOpen, vehicles.length]);

  if (!isOpen) return null;

  const resetForm = (closeAddSection = true) => {
    setName('');
    setPlateNumber('');
    setType('suv');
    setFuelType(FUEL_TYPES[0]);
    setColor(COLOR_OPTIONS[0].value);
    setEditingId(null);
    if (closeAddSection) {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (veh: Vehicle) => {
    setEditingId(veh.id);
    setName(veh.name || '');
    setPlateNumber(veh.plateNumber || '');
    setType(veh.type || 'suv');
    setFuelType(veh.fuelType || FUEL_TYPES[0]);
    setColor(veh.color || COLOR_OPTIONS[0].value);
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const wasEmpty = vehicles.length === 0;

    if (editingId) {
      onUpdateVehicle({
        id: editingId,
        name: name.trim(),
        plateNumber: plateNumber.trim().toUpperCase() || 'UNREGISTERED',
        type,
        fuelType,
        color,
      });
      resetForm(true);
    } else {
      onAddVehicle({
        name: name.trim(),
        plateNumber: plateNumber.trim().toUpperCase() || 'UNREGISTERED',
        type,
        fuelType,
        color,
        isDefault: wasEmpty,
      });
      resetForm(true);
      // If the user just registered their very first vehicle, close the modal automatically so they can start logging
      if (wasEmpty) {
        onClose();
      }
    }
  };

  const renderIcon = (vType: Vehicle['type']) => {
    switch (vType) {
      case 'motorcycle':
        return <Bike className="w-4 h-4" />;
      case 'pickup':
      case 'van':
        return <Truck className="w-4 h-4" />;
      default:
        return <Car className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden">
        {/* Mobile Bottom Sheet Drag Handle */}
        <div className="w-10 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-4 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Manage Vehicle Garage
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Each vehicle has isolated odometer tracking and km/L calculations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm(true);
              onClose();
            }}
            className="min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Existing Vehicles List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Registered Vehicles ({vehicles.length})
              </span>
              {!isAdding && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm(false);
                    setIsAdding(true);
                  }}
                  className="min-h-[40px] sm:min-h-[34px] flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-xl sm:rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white transition shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  <span>Add Vehicle</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-0.5">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 transition hover:border-slate-600"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: v.color || '#059669' }}
                    >
                      {renderIcon(v.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white truncate">
                          {v.name}
                        </span>
                        {v.isDefault && (
                          <span className="text-[11px] text-slate-400 font-normal shrink-0">
                            · Primary
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 truncate">
                        <span className="font-mono text-emerald-400 font-medium">
                          {v.plateNumber || 'UNREGISTERED'}
                        </span>
                        <span>·</span>
                        <span className="truncate">{v.fuelType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {!v.isDefault && (
                      <button
                        type="button"
                        onClick={() => onSetDefault(v.id)}
                        title="Set as primary vehicle"
                        className="min-w-[40px] min-h-[40px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50 rounded-lg transition cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(v)}
                      title="Edit vehicle"
                      className="min-w-[40px] min-h-[40px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {vehicles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteVehicle(v.id)}
                        title="Delete vehicle"
                        className="min-w-[40px] min-h-[40px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {vehicles.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-800/40 border border-dashed border-slate-700/60 rounded-xl">
                  No vehicles registered in your garage yet. Fill out the form below to register your first vehicle.
                </div>
              )}
            </div>
          </div>

          {/* Add/Edit Form Section */}
          {isAdding && (
            <form
              onSubmit={handleSubmit}
              className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {editingId ? 'Edit Vehicle Details' : 'Register New Vehicle'}
                </h3>
                {vehicles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => resetForm(true)}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Vehicle Name / Model *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toyota Hilux, Honda Click"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full min-h-[44px] sm:min-h-[38px] bg-slate-900 border border-slate-700 rounded-xl sm:rounded-lg px-3 py-2 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Plate Number / Conduction Sticker
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NDO 5821"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    className="w-full min-h-[44px] sm:min-h-[38px] bg-slate-900 border border-slate-700 rounded-xl sm:rounded-lg px-3 py-2 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Vehicle Category
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Vehicle['type'])}
                    className="w-full min-h-[44px] sm:min-h-[38px] bg-slate-900 border border-slate-700 rounded-xl sm:rounded-lg px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="suv">SUV / Crossover</option>
                    <option value="sedan">Sedan</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="motorcycle">Motorcycle / Scooter</option>
                    <option value="pickup">Pickup Truck</option>
                    <option value="van">Van / MPV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Default Fuel Type
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full min-h-[44px] sm:min-h-[38px] bg-slate-900 border border-slate-700 rounded-xl sm:rounded-lg px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {FUEL_TYPES.map((ft) => (
                      <option key={ft} value={ft}>
                        {ft}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Color Swatch */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Vehicle Color Accent
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-8 h-8 sm:w-7 sm:h-7 rounded-full transition flex items-center justify-center cursor-pointer ${
                        color === c.value
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105'
                          : ''
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    >
                      {color === c.value && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                {vehicles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => resetForm(true)}
                    className="min-h-[44px] sm:min-h-[36px] px-4 py-2 rounded-xl sm:rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="min-h-[46px] sm:min-h-[38px] px-5 py-2.5 sm:py-2 rounded-xl sm:rounded-lg text-sm sm:text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white transition shadow cursor-pointer"
                >
                  {editingId ? 'Save Vehicle Changes' : 'Save & Register Vehicle'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 sm:px-6 border-t border-slate-800 flex justify-end pb-safe shrink-0 bg-slate-900">
          <button
            type="button"
            onClick={() => {
              resetForm(true);
              onClose();
            }}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-[38px] px-5 py-2 rounded-xl sm:rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
