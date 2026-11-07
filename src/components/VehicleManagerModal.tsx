/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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

  React.useEffect(() => {
    if (isOpen && vehicles.length === 0) {
      setIsAdding(true);
    }
  }, [isOpen, vehicles.length]);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setPlateNumber('');
    setType('suv');
    setFuelType(FUEL_TYPES[0]);
    setColor(COLOR_OPTIONS[0].value);
    setEditingId(null);
    setIsAdding(vehicles.length === 0);
  };

  const handleStartEdit = (veh: Vehicle) => {
    setEditingId(veh.id);
    setName(veh.name);
    setPlateNumber(veh.plateNumber);
    setType(veh.type);
    setFuelType(veh.fuelType);
    setColor(veh.color || COLOR_OPTIONS[0].value);
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      onUpdateVehicle({
        id: editingId,
        name: name.trim(),
        plateNumber: plateNumber.trim().toUpperCase() || 'UNREGISTERED',
        type,
        fuelType,
        color,
      });
    } else {
      onAddVehicle({
        name: name.trim(),
        plateNumber: plateNumber.trim().toUpperCase() || 'UNREGISTERED',
        type,
        fuelType,
        color,
        isDefault: vehicles.length === 0,
      });
    }

    resetForm();
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              🚗 Manage Vehicle Garage
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Each vehicle has isolated odometer tracking and fuel economy calculations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
                  resetForm();
                  setIsAdding(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Vehicle</span>
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 transition hover:border-slate-600"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: v.color || '#059669' }}
                  >
                    {renderIcon(v.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{v.name}</span>
                      {v.isDefault && (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="font-mono text-emerald-400 font-medium">
                        {v.plateNumber}
                      </span>
                      <span>·</span>
                      <span>{v.fuelType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!v.isDefault && (
                    <button
                      type="button"
                      onClick={() => onSetDefault(v.id)}
                      title="Set as primary vehicle"
                      className="p-1.5 text-xs text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50 rounded-lg transition"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(v)}
                    title="Edit vehicle"
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {vehicles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteVehicle(v.id)}
                      title="Delete vehicle"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {vehicles.length === 0 && (
              <div className="p-3 text-center text-xs text-slate-500 bg-slate-800/40 border border-dashed border-slate-700/60 rounded-xl">
                No vehicles registered in your garage yet.
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
                {editingId ? 'Edit Vehicle Details' : 'Add New Vehicle'}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Vehicle Name / Model *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toyota Hilux, Honda City"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Vehicle Category
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as Vehicle['type'])}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Badge Color
              </label>
              <div className="flex items-center gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-6 h-6 rounded-full transition flex items-center justify-center ${
                      color === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  >
                    {color === c.value && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow"
              >
                {editingId ? 'Save Changes' : 'Register Vehicle'}
              </button>
            </div>
          </form>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
