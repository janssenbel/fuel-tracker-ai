/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw, Settings, Sliders, Fuel } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  appSubtitle: string;
  defaultFullTank: boolean;
  autoBackupEnabled: boolean;
  onSaveSettings: (settings: {
    appName: string;
    appSubtitle: string;
    defaultFullTank: boolean;
    autoBackupEnabled: boolean;
  }) => void;
}

export const DEFAULT_APP_NAME = 'FuelTracker PH';
export const DEFAULT_APP_SUBTITLE =
  'Multi-vehicle mileage, fuel economy, and expense tracker';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  appName,
  appSubtitle,
  defaultFullTank,
  autoBackupEnabled,
  onSaveSettings,
}) => {
  const [nameInput, setNameInput] = useState(appName);
  const [subtitleInput, setSubtitleInput] = useState(appSubtitle);
  const [fullTankPref, setFullTankPref] = useState(defaultFullTank);
  const [autoBackupPref, setAutoBackupPref] = useState(autoBackupEnabled);

  useEffect(() => {
    if (isOpen) {
      setNameInput(appName);
      setSubtitleInput(appSubtitle);
      setFullTankPref(defaultFullTank);
      setAutoBackupPref(autoBackupEnabled);
    }
  }, [isOpen, appName, appSubtitle, defaultFullTank, autoBackupEnabled]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedName = nameInput.trim() || DEFAULT_APP_NAME;
    const cleanedSubtitle = subtitleInput.trim() || DEFAULT_APP_SUBTITLE;

    onSaveSettings({
      appName: cleanedName,
      appSubtitle: cleanedSubtitle,
      defaultFullTank: fullTankPref,
      autoBackupEnabled: autoBackupPref,
    });
    onClose();
  };

  const handleResetDefaults = () => {
    setNameInput(DEFAULT_APP_NAME);
    setSubtitleInput(DEFAULT_APP_SUBTITLE);
    setFullTankPref(false);
    setAutoBackupPref(false);
  };

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Mobile Bottom Sheet Drag Handle */}
        <div className="w-10 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                App Settings
              </h2>
              <p className="text-xs text-slate-400">
                Customize application branding and default fill-up options
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 pb-safe"
        >
          {/* Live Header Preview */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Fuel className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-sm sm:text-base font-bold text-white truncate">
                  {nameInput.trim() || DEFAULT_APP_NAME}
                </span>
                <span className="text-[11px] font-medium text-emerald-400 shrink-0">
                  km/L · ₱
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {subtitleInput.trim() || DEFAULT_APP_SUBTITLE}
              </p>
            </div>
          </div>

          {/* Branding Section */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Application Branding
              </h3>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Application Name
              </label>
              <input
                type="text"
                required
                maxLength={40}
                placeholder="e.g. FuelTracker PH"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full min-h-[44px] sm:min-h-[38px] bg-slate-800 border border-slate-700 rounded-xl sm:rounded-lg px-3 py-2 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
              <span className="block text-[11px] text-slate-500 mt-1">
                Displayed in the top header, browser title, and exported JSON backups.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Header Subtitle / Tagline
              </label>
              <input
                type="text"
                maxLength={80}
                placeholder={DEFAULT_APP_SUBTITLE}
                value={subtitleInput}
                onChange={(e) => setSubtitleInput(e.target.value)}
                className="w-full min-h-[44px] sm:min-h-[38px] bg-slate-800 border border-slate-700 rounded-xl sm:rounded-lg px-3 py-2 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Default Fill-Up Preferences */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Default Fill-Up Form Options</span>
            </h3>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={fullTankPref}
                onChange={(e) => setFullTankPref(e.target.checked)}
                className="mt-0.5 w-5 h-5 sm:w-4 sm:h-4 text-emerald-500 rounded bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer shrink-0"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-200 block">
                  Check &ldquo;Full Tank&rdquo; by default
                </span>
                <span className="text-slate-400 text-[11px]">
                  When unchecked, the Full Tank box starts unchecked on new fill-ups.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoBackupPref}
                onChange={(e) => setAutoBackupPref(e.target.checked)}
                className="mt-0.5 w-5 h-5 sm:w-4 sm:h-4 text-emerald-500 rounded bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer shrink-0"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-200 block">
                  Auto-download backup file (JSON) on save
                </span>
                <span className="text-slate-400 text-[11px]">
                  Automatically downloads a JSON backup file every time you save a new fill-up.
                </span>
              </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] sm:min-h-[38px] px-4 py-2 rounded-xl sm:rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[46px] sm:min-h-[38px] px-5 py-2.5 sm:py-2 rounded-xl sm:rounded-lg text-sm sm:text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
