import React from 'react';
import { NearbyBusStop } from '../types/lta';
import { MapPin, Navigation, Compass, Bus } from 'lucide-react';

interface NearbyStopsTabsProps {
  stops: NearbyBusStop[];
  selectedStopCode: string | null;
  onSelectStop: (code: string) => void;
  viewMode: 'focus' | 'all';
  onToggleViewMode: (mode: 'focus' | 'all') => void;
}

export const NearbyStopsTabs: React.FC<NearbyStopsTabsProps> = ({
  stops,
  selectedStopCode,
  onSelectStop,
  viewMode,
  onToggleViewMode,
}) => {
  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header bar of 5 nearest stops control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              5 Stops Near You
              <span className="text-xs font-normal text-slate-400">
                · Sorted by walking distance
              </span>
            </h2>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onToggleViewMode('focus')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              viewMode === 'focus'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tabbed Focus
          </button>
          <button
            type="button"
            onClick={() => onToggleViewMode('all')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              viewMode === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All 5 Stops Overview
          </button>
        </div>
      </div>

      {/* 5 Stops Horizontal List / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {stops.map((stop, index) => {
          const isSelected = stop.busStopCode === selectedStopCode;

          return (
            <button
              key={stop.busStopCode}
              type="button"
              onClick={() => onSelectStop(stop.busStopCode)}
              className={`relative flex flex-col text-left p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-slate-800/95 border-emerald-500/60 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700/80'
              }`}
            >
              {/* Top ranking badge & distance */}
              <div className="flex items-center justify-between text-xs mb-1.5 w-full">
                <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-400">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                  #{stop.busStopCode}
                </span>

                <span className="flex items-center gap-1 text-[11px] font-mono text-slate-300">
                  <Navigation className="w-2.5 h-2.5 text-slate-400" />
                  {stop.distanceMeters < 1000
                    ? `${stop.distanceMeters}m`
                    : `${(stop.distanceMeters / 1000).toFixed(1)}km`}
                </span>
              </div>

              {/* Stop description & road */}
              <h3 className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-white">
                {stop.description}
              </h3>

              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                {stop.roadName}
              </div>

              {/* Walking time & bearing footer */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Compass className="w-3 h-3 text-emerald-400/80" />
                  <span>{stop.compassDirection}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>~{stop.walkingMinutes}m walk</span>
                </span>

                <span className="flex items-center gap-0.5 text-slate-400 font-mono">
                  <Bus className="w-2.5 h-2.5" />
                  {stop.services.length}
                </span>
              </div>

              {/* Active stop bottom glow indicator */}
              {isSelected && (
                <div className="absolute -bottom-[1px] left-3 right-3 h-[2px] bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
