import React, { useState, useMemo } from 'react';
import { NearbyBusStop, ProcessedBusService } from '../types/lta';
import { useBusArrivals } from '../hooks/useBusArrivals';
import { BusServiceRow } from './BusServiceRow';
import {
  Copy,
  Check,
  RefreshCw,
  Search,
  ExternalLink,
  Accessibility,
  Layers,
  Star,
  Compass,
  AlertCircle,
} from 'lucide-react';

interface BusStopCardProps {
  stop: NearbyBusStop;
  onSelectService: (service: ProcessedBusService) => void;
  compact?: boolean;
}

export const BusStopCard: React.FC<BusStopCardProps> = ({
  stop,
  onSelectService,
  compact = false,
}) => {
  const {
    services,
    isLoading,
    isRefreshing,
    isSimulated,
    lastUpdated,
    refreshCountdown,
    manualRefresh,
    toggleBookmark,
  } = useBusArrivals(stop.busStopCode);

  const [copiedCode, setCopiedCode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWabOnly, setFilterWabOnly] = useState(false);
  const [filterDdOnly, setFilterDdOnly] = useState(false);
  const [filterBookmarkedOnly, setFilterBookmarkedOnly] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(stop.busStopCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesNo = svc.serviceNo.toLowerCase().includes(query);
        const matchesDest = svc.destination.toLowerCase().includes(query);
        if (!matchesNo && !matchesDest) return false;
      }

      if (filterBookmarkedOnly && !svc.isBookmarked) {
        return false;
      }

      if (filterWabOnly) {
        const nextWab = svc.nextBus?.isWheelchairAccessible;
        const next2Wab = svc.nextBus2?.isWheelchairAccessible;
        if (!nextWab && !next2Wab) return false;
      }

      if (filterDdOnly) {
        const nextDd = svc.nextBus?.type === 'DD';
        const next2Dd = svc.nextBus2?.type === 'DD';
        if (!nextDd && !next2Dd) return false;
      }

      return true;
    });
  }, [services, searchQuery, filterBookmarkedOnly, filterWabOnly, filterDdOnly]);

  return (
    <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-start gap-3.5">
          {/* Stop Code Pill with Copy */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-mono text-sm font-bold rounded-lg border border-slate-700/80 hover:border-emerald-500/50 transition-all shrink-0"
            title="Click to copy bus stop code"
          >
            <span>{stop.busStopCode}</span>
            {copiedCode ? (
              <Check className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-300" />
            )}
          </button>

          <div className="flex flex-col">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              {stop.description}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="text-slate-300 font-medium">{stop.roadName}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-emerald-400 font-medium">
                {stop.distanceMeters < 1000
                  ? `${stop.distanceMeters}m away`
                  : `${(stop.distanceMeters / 1000).toFixed(1)}km away`}
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Compass className="w-3 h-3 text-slate-500" />
                {stop.compassDirection} (~{stop.walkingMinutes} min walk)
              </span>
            </div>
          </div>
        </div>

        {/* Right action tools: External map & refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${stop.latitude},${stop.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700/60 transition-colors"
            title="Open in Google Maps for walking directions"
          >
            <ExternalLink className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">Directions</span>
          </a>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={manualRefresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-750 active:bg-slate-700 rounded-lg border border-slate-700/80 transition-all disabled:opacity-50"
            title="Refresh arrival timings now"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-emerald-400 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            <span className="font-mono text-[11px] text-slate-400">
              {refreshCountdown}s
            </span>
          </button>
        </div>
      </div>

      {/* Filter and search toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 py-3 border-b border-slate-800/60">
        {/* Search input */}
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter bus (e.g. 190, 7)..."
            className="w-full bg-slate-950/70 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-emerald-500/70 placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick filter buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterBookmarkedOnly(!filterBookmarkedOnly)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border transition-colors ${
              filterBookmarkedOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Show only bookmarked services"
          >
            <Star className="w-3 h-3" />
            <span>Saved</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterWabOnly(!filterWabOnly)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border transition-colors ${
              filterWabOnly
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Wheelchair Accessible Buses only"
          >
            <Accessibility className="w-3 h-3" />
            <span>WAB</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterDdOnly(!filterDdOnly)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border transition-colors ${
              filterDdOnly
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-800/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Double Deck Buses only"
          >
            <Layers className="w-3 h-3" />
            <span>Double Deck</span>
          </button>
        </div>
      </div>

      {/* Services List / Skeleton */}
      <div className="flex flex-col gap-2.5 mt-3">
        {isLoading ? (
          <div className="flex flex-col gap-2.5 py-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 bg-slate-800/40 animate-pulse rounded-xl border border-slate-800"
              />
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <BusServiceRow
              key={service.serviceNo}
              service={service}
              onSelectService={onSelectService}
              onToggleBookmark={toggleBookmark}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <AlertCircle className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-300">
              No bus services match the active filters.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Try clearing the search query or reset filter options.
            </p>
            {(searchQuery || filterWabOnly || filterDdOnly || filterBookmarkedOnly) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterWabOnly(false);
                  setFilterDdOnly(false);
                  setFilterBookmarkedOnly(false);
                }}
                className="mt-3 text-xs text-emerald-400 hover:underline"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer / Legend bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-3 border-t border-slate-800/60 text-[11px] text-slate-400">
        {/* LTA crowd occupancy legend */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-500 font-medium">LTA Crowd:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Seats Avail</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-300">Standing Avail</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-300">Limited Standing</span>
          </div>
        </div>

        {/* Data stream status */}
        <div className="flex items-center gap-2 text-slate-500">
          <span>
            Updated{' '}
            {lastUpdated.toLocaleTimeString('en-SG', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {isSimulated ? (
              <span className="text-emerald-400/90 font-mono">
                LTA Spec (Simulated)
              </span>
            ) : (
              <span className="text-emerald-400 font-mono font-semibold">
                LTA Live DataMall
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
