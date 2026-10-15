import React, { useState, useEffect } from 'react';
import { LocationCoordinates } from '../types/lta';
import {
  Bus,
  MapPin,
  Clock,
  Server,
  Search,
  Radar,
  Star,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { getApiConfiguration } from '../services/ltaService';

interface HeaderProps {
  currentLocation: LocationCoordinates;
  onOpenLocationPicker: () => void;
  onOpenBackendGuide: () => void;
  onOpenSearch: () => void;
  activeNavTab: 'nearby' | 'radar' | 'saved';
  onSelectNavTab: (tab: 'nearby' | 'radar' | 'saved') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onOpenLocationPicker,
  onOpenBackendGuide,
  onOpenSearch,
  activeNavTab,
  onSelectNavTab,
}) => {
  const [sgtTime, setSgtTime] = useState<string>('');
  const config = getApiConfiguration();

  // Singapore Clock (SGT is UTC+8)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-SG', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setSgtTime(timeStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/90 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-950/60 font-black">
              <Bus className="w-5 h-5 text-white" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-100 tracking-tight text-base sm:text-lg">
                  SG BUS <span className="text-emerald-400">ARRIVALS</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span>LTA DataMall Real-Time</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="flex items-center gap-1 text-slate-400 font-mono">
                  <Clock className="w-3 h-3 text-emerald-400/80" />
                  {sgtTime || '00:00:00'} SGT
                </span>
              </div>
            </div>
          </div>

          {/* Center / Right Location Switcher & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Location selector button */}
            <button
              type="button"
              onClick={onOpenLocationPicker}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-all group"
              title="Change Singapore location or request device GPS"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              <span className="font-semibold text-slate-200 max-w-[110px] sm:max-w-[160px] truncate">
                {currentLocation.locationName}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {/* Search Stop Button */}
            <button
              type="button"
              onClick={onOpenSearch}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Search Singapore bus stops"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Backend Integration Guide Modal Trigger */}
            <button
              type="button"
              onClick={onOpenBackendGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs transition-colors"
              title="Configure Backend Connection & LTA API"
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline text-slate-300 font-medium">
                {config.useBackend ? 'Backend: Connected' : 'Backend Guide'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  config.useBackend ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sub-nav tabs */}
        <div className="flex items-center justify-between pb-3 pt-1 border-t border-slate-900">
          <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800/80 text-xs">
            <button
              type="button"
              onClick={() => onSelectNavTab('nearby')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 font-medium rounded-lg transition-all ${
                activeNavTab === 'nearby'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>5 Nearest Stops</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectNavTab('radar')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 font-medium rounded-lg transition-all ${
                activeNavTab === 'radar'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radar className="w-3.5 h-3.5" />
              <span>Proximity Radar</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectNavTab('saved')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 font-medium rounded-lg transition-all ${
                activeNavTab === 'saved'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Saved</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span>5 Nearest Stops Stream</span>
            <span aria-hidden="true">·</span>
            <span>Auto-Refresh: 15s</span>
          </div>
        </div>
      </div>
    </header>
  );
};
