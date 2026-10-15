import React from 'react';
import { ProcessedBusInfo, ProcessedBusService } from '../types/lta';
import { BusLoadBadge } from './BusLoadBadge';
import { BusDeckBadge } from './BusDeckBadge';
import { Star, ChevronRight, Bus } from 'lucide-react';

interface BusServiceRowProps {
  service: ProcessedBusService;
  onSelectService: (service: ProcessedBusService) => void;
  onToggleBookmark: (serviceNo: string) => void;
}

export const BusServiceRow: React.FC<BusServiceRowProps> = ({
  service,
  onSelectService,
  onToggleBookmark,
}) => {
  const renderArrivalBox = (
    bus: ProcessedBusInfo | null,
    isPrimary: boolean,
    label: string
  ) => {
    if (!bus) {
      return (
        <div className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[82px] py-2 px-2 bg-slate-900/40 rounded-lg border border-slate-800/60 opacity-40">
          <span className="text-[10px] text-slate-500 font-medium">{label}</span>
          <span className="text-xs text-slate-600 font-mono mt-0.5">—</span>
        </div>
      );
    }

    const isArriving = bus.secondsRemaining <= 60;
    const isImminent = bus.secondsRemaining <= 180;

    let timeBadgeBg = 'bg-slate-900/80 border-slate-800';
    let timeTextColor = 'text-slate-200';

    if (isArriving) {
      timeBadgeBg = 'bg-emerald-950/60 border-emerald-500/40';
      timeTextColor = 'text-emerald-300 font-bold';
    } else if (isImminent) {
      timeBadgeBg = 'bg-cyan-950/50 border-cyan-700/40';
      timeTextColor = 'text-cyan-200';
    }

    return (
      <div
        className={`flex flex-col items-center min-w-[70px] sm:min-w-[84px] py-1.5 px-2 rounded-lg border transition-all ${timeBadgeBg} ${
          isPrimary ? 'ring-1 ring-emerald-500/20' : ''
        }`}
      >
        <div className="w-full flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-mono text-[9px] uppercase tracking-wider">{label}</span>
          <BusLoadBadge load={bus.load} />
        </div>

        <div className="flex items-baseline gap-1 my-0.5">
          <span
            className={`font-mono text-sm sm:text-base font-bold tracking-tight ${timeTextColor}`}
          >
            {bus.formattedCountdown}
          </span>
          {isArriving && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
          )}
        </div>

        <div className="w-full flex items-center justify-center pt-0.5 border-t border-slate-800/60">
          <BusDeckBadge
            type={bus.type}
            isWheelchairAccessible={bus.isWheelchairAccessible}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={() => onSelectService(service)}
      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700/90 rounded-xl transition-all cursor-pointer"
    >
      {/* Left side: Service No, operator, destination */}
      <div className="flex items-center gap-3.5 min-w-[170px]">
        {/* Bookmark star */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(service.serviceNo);
          }}
          className="p-1.5 -ml-1 text-slate-500 hover:text-amber-400 transition-colors focus:outline-none"
          title={service.isBookmarked ? 'Remove bookmark' : 'Bookmark this bus service'}
        >
          <Star
            className={`w-4 h-4 transition-colors ${
              service.isBookmarked
                ? 'fill-amber-400 text-amber-400'
                : 'stroke-[1.5] hover:stroke-amber-400'
            }`}
          />
        </button>

        {/* Large Service Number Display */}
        <div className="flex items-center justify-center w-14 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-mono font-extrabold text-xl rounded-lg shadow-sm shadow-emerald-950/40 tracking-tight shrink-0">
          {service.serviceNo}
        </div>

        {/* Service Details & Destination */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">{service.operatorName}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono text-[10px] text-slate-500">{service.operator}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium truncate mt-0.5">
            <Bus className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate" title={`Destination: ${service.destination}`}>
              {service.destination}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: 3 Next Bus timings */}
      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {renderArrivalBox(service.nextBus, true, 'Next')}
          {renderArrivalBox(service.nextBus2, false, '2nd')}
          {renderArrivalBox(service.nextBus3, false, '3rd')}
        </div>

        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5 shrink-0 hidden sm:block ml-1" />
      </div>
    </div>
  );
};
