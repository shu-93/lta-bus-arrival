import React, { useState, useMemo } from 'react';
import { SINGAPORE_BUS_STOPS } from '../data/singaporeBusStops';
import { BusStopRecord } from '../types/lta';
import { X, Search, MapPin, Bus, ChevronRight } from 'lucide-react';

interface SearchStopsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStop: (stop: BusStopRecord) => void;
}

export const SearchStopsModal: React.FC<SearchStopsModalProps> = ({
  isOpen,
  onClose,
  onSelectStop,
}) => {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return SINGAPORE_BUS_STOPS.slice(0, 10);
    }
    const q = query.toLowerCase().trim();
    return SINGAPORE_BUS_STOPS.filter(
      (s) =>
        s.busStopCode.includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.roadName.toLowerCase().includes(q) ||
        s.neighborhood?.toLowerCase().includes(q) ||
        s.services.some((svc) => svc.toLowerCase() === q)
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              Search Singapore Bus Stops
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by 5-digit code (e.g. 09048), road, or bus service..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-2 divide-y divide-slate-800/40">
          {searchResults.length > 0 ? (
            searchResults.map((stop) => (
              <button
                key={stop.busStopCode}
                type="button"
                onClick={() => {
                  onSelectStop(stop);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-800/70 transition-colors group pt-2.5"
              >
                <div className="flex items-start gap-3">
                  <div className="font-mono text-xs font-bold text-emerald-400 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 shrink-0">
                    {stop.busStopCode}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                      {stop.description}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {stop.roadName} {stop.neighborhood && `· ${stop.neighborhood}`}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono mt-1">
                      <Bus className="w-2.5 h-2.5 text-slate-500" />
                      <span>{stop.services.slice(0, 8).join(', ')}</span>
                      {stop.services.length > 8 && <span>+{stop.services.length - 8} more</span>}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 shrink-0 ml-2" />
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No bus stops found matching &quot;{query}&quot;. Try searching for &quot;Orchard&quot;, &quot;Lucky Plaza&quot;, or &quot;190&quot;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
