import React from 'react';
import { ProcessedBusService } from '../types/lta';
import { BusLoadBadge } from './BusLoadBadge';
import { BusDeckBadge } from './BusDeckBadge';
import {
  X,
  Bus,
  Clock,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Share2,
} from 'lucide-react';

interface BusServiceModalProps {
  service: ProcessedBusService | null;
  onClose: () => void;
  currentStopCode: string;
}

export const BusServiceModal: React.FC<BusServiceModalProps> = ({
  service,
  onClose,
  currentStopCode,
}) => {
  if (!service) return null;

  // Realistic sample route segments for the service
  const sampleStops = [
    { code: 'Origin', name: 'Service Terminal', passed: true },
    { code: '08138', name: 'Somerset MRT Station', passed: true },
    { code: currentStopCode, name: 'Current Bus Stop', isCurrent: true },
    { code: '09048', name: 'Orchard Stn / Lucky Plaza', passed: false },
    { code: '09038', name: 'Opp Mandarin Orchard', passed: false },
    { code: 'Terminus', name: service.destination, isTerminus: true },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-emerald-600 text-white font-mono font-extrabold text-2xl rounded-xl shadow-md shadow-emerald-950/40">
              {service.serviceNo}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">{service.operatorName}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="font-mono text-emerald-400">{service.operator}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1 mt-0.5">
                <Navigation className="w-3.5 h-3.5 text-slate-400" />
                To {service.destination}
              </h3>
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

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* 3 Arrival Predictions Breakdown */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Live Arrival Timings at this Stop
            </h4>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: 'Next Bus', bus: service.nextBus },
                { label: '2nd Bus', bus: service.nextBus2 },
                { label: '3rd Bus', bus: service.nextBus3 },
              ].map(({ label, bus }, idx) => (
                <div
                  key={idx}
                  className="flex flex-col p-3 rounded-xl bg-slate-950/70 border border-slate-800/80"
                >
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {label}
                  </span>

                  {bus ? (
                    <>
                      <div className="flex items-baseline gap-1 my-1.5">
                        <span className="font-mono text-xl font-bold text-emerald-400">
                          {bus.formattedCountdown}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/80">
                        <BusLoadBadge load={bus.load} showText />
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400 flex items-center justify-between">
                        <BusDeckBadge
                          type={bus.type}
                          isWheelchairAccessible={bus.isWheelchairAccessible}
                        />
                        <span className="font-mono text-slate-500">{bus.typeLabel}</span>
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-600 font-mono">
                      No Data
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Service Profile & Operating Specs */}
          <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/60 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Operating Hours
              </span>
              <span className="font-mono text-slate-200">05:30 - 23:45 Daily</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Bus className="w-3.5 h-3.5 text-slate-500" />
                Typical Frequency
              </span>
              <span className="font-mono text-emerald-400">5 – 12 mins</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                Fleet Standard
              </span>
              <span className="text-slate-300">100% Wheelchair Accessible</span>
            </div>
          </div>

          {/* Route Progression Timeline */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Route Progression
            </h4>
            <div className="space-y-3 relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {sampleStops.map((st, i) => (
                <div key={i} className="relative flex items-center justify-between text-xs">
                  <div
                    className={`absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      st.isCurrent
                        ? 'bg-emerald-500 border-emerald-300 text-white'
                        : st.passed
                        ? 'bg-slate-800 border-slate-600'
                        : 'bg-slate-900 border-slate-700'
                    }`}
                  >
                    {st.isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span
                      className={`font-medium ${
                        st.isCurrent
                          ? 'text-emerald-400 font-bold'
                          : st.passed
                          ? 'text-slate-500 line-through'
                          : 'text-slate-300'
                      }`}
                    >
                      {st.name} {st.isCurrent && '(You are here)'}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {st.code}
                    </span>
                  </div>

                  {st.isCurrent && (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      BOARD HERE
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Source: LTA DataMall BusArrivalv2 specification
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
