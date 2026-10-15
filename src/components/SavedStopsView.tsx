import React from 'react';
import { getBookmarkedKeys, toggleBookmarkKey } from '../services/ltaService';
import { SINGAPORE_BUS_STOPS } from '../data/singaporeBusStops';
import { Star, Bus, Trash2, ArrowRight } from 'lucide-react';

interface SavedStopsViewProps {
  onSelectStop: (code: string) => void;
}

export const SavedStopsView: React.FC<SavedStopsViewProps> = ({ onSelectStop }) => {
  const [bookmarks, setBookmarks] = React.useState<string[]>(() => getBookmarkedKeys());

  const handleRemove = (key: string) => {
    toggleBookmarkKey(key);
    setBookmarks(getBookmarkedKeys());
  };

  const parsedBookmarks = bookmarks.map((key) => {
    const [stopCode, serviceNo] = key.split('_');
    const stop = SINGAPORE_BUS_STOPS.find((s) => s.busStopCode === stopCode) || {
      busStopCode: stopCode,
      description: `Bus Stop ${stopCode}`,
      roadName: 'Singapore',
    };
    return { key, stopCode, serviceNo, stop };
  });

  if (parsedBookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/60 border border-slate-800 rounded-2xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 border border-amber-500/20">
          <Star className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-100">No Saved Bus Services Yet</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Tap the star icon next to any bus arrival (e.g. Bus 190, 65, 14) to pin your daily commute routes here for one-tap tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          Saved Commuter Services ({parsedBookmarks.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {parsedBookmarks.map(({ key, stopCode, serviceNo, stop }) => (
          <div
            key={key}
            className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-10 rounded-lg bg-emerald-600 text-white font-mono font-bold flex items-center justify-center text-lg shadow-sm">
                {serviceNo}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {stop.description}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Stop #{stopCode} · {stop.roadName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelectStop(stopCode)}
                className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors"
                title="View stop arrivals"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleRemove(key)}
                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Remove from saved"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
