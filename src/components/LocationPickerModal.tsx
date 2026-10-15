import React, { useState } from 'react';
import { SINGAPORE_LOCATION_PRESETS } from '../data/singaporeBusStops';
import { LocationCoordinates } from '../types/lta';
import {
  X,
  Crosshair,
  MapPin,
  Check,
  Compass,
  AlertCircle,
} from 'lucide-react';
import { isWithinSingapore } from '../utils/geo';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationCoordinates;
  onSelectPreset: (presetId: string) => void;
  onRequestGps: () => void;
  isLocating: boolean;
  gpsError: string | null;
  onSetCustomCoords: (lat: number, lng: number, name: string) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectPreset,
  onRequestGps,
  isLocating,
  gpsError,
  onSetCustomCoords,
}) => {
  const [showCustomCoords, setShowCustomCoords] = useState(false);
  const [customLat, setCustomLat] = useState('1.3040');
  const [customLng, setCustomLng] = useState('103.8340');
  const [customError, setCustomError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);

    if (isNaN(lat) || isNaN(lng)) {
      setCustomError('Please enter valid numeric latitude and longitude.');
      return;
    }

    if (!isWithinSingapore(lat, lng)) {
      setCustomError('Coordinates must be located within Singapore (Lat: 1.15 to 1.48, Lng: 103.58 to 104.10).');
      return;
    }

    onSetCustomCoords(lat, lng, `Custom GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Change Transit Location
              </h3>
              <p className="text-xs text-slate-400">
                Pick a Singapore district or use your device GPS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* GPS Button */}
          <button
            type="button"
            onClick={() => {
              onRequestGps();
            }}
            disabled={isLocating}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-700/50 hover:bg-emerald-900/40 text-emerald-200 transition-all group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              </div>
              <div className="text-left">
                <span className="font-semibold block text-sm text-emerald-300">
                  {isLocating ? 'Acquiring GPS Signal...' : 'Use My Live Device GPS'}
                </span>
                <span className="text-[11px] text-emerald-400/80">
                  Calculates real-time 5 nearest bus stops around you
                </span>
              </div>
            </div>
            {currentLocation.source === 'gps' && (
              <span className="flex items-center gap-1 font-mono text-emerald-300 font-bold text-xs">
                <Check className="w-4 h-4" />
                Active
              </span>
            )}
          </button>

          {/* GPS error or notice */}
          {gpsError && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Singapore District Presets */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Popular Singapore Transit Precincts
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SINGAPORE_LOCATION_PRESETS.map((preset) => {
                const isSelected =
                  currentLocation.source === 'preset' &&
                  currentLocation.locationName === preset.name;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onSelectPreset(preset.id);
                      onClose();
                    }}
                    className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500/80 text-white ring-1 ring-emerald-500/40'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-xs text-slate-100">
                        {preset.name}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      {preset.landmark}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                      {preset.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Coordinate expander */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowCustomCoords(!showCustomCoords)}
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{showCustomCoords ? 'Hide Custom Coordinates' : 'Enter Custom SG Coordinates'}</span>
            </button>

            {showCustomCoords && (
              <form onSubmit={handleCustomSubmit} className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Latitude</label>
                    <input
                      type="text"
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      placeholder="1.3040"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Longitude</label>
                    <input
                      type="text"
                      value={customLng}
                      onChange={(e) => setCustomLng(e.target.value)}
                      placeholder="103.8340"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-200"
                    />
                  </div>
                </div>

                {customError && (
                  <p className="text-[11px] text-rose-400">{customError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
                >
                  Locate 5 Nearest Stops
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
