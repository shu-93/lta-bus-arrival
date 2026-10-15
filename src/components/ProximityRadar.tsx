import React from 'react';
import { NearbyBusStop } from '../types/lta';
import { Compass, Navigation } from 'lucide-react';

interface ProximityRadarProps {
  stops: NearbyBusStop[];
  selectedStopCode: string | null;
  onSelectStop: (code: string) => void;
  userLocationName: string;
}

export const ProximityRadar: React.FC<ProximityRadarProps> = ({
  stops,
  selectedStopCode,
  onSelectStop,
  userLocationName,
}) => {
  // Center is (160, 160) in a 320x320 viewport
  const cx = 160;
  const cy = 160;
  const maxRadius = 130; // 500m map limit

  // Maximum distance among the 5 stops, min 300m for good scale
  const maxStopDistance = Math.max(
    300,
    ...stops.map((s) => s.distanceMeters)
  );

  return (
    <div className="flex flex-col items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>Proximity Radar (5 Nearest Stops)</span>
        </div>
        <span className="text-[11px] text-slate-400">
          Centered on: <strong className="text-emerald-400">{userLocationName}</strong>
        </span>
      </div>

      {/* Interactive Radar SVG Container */}
      <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center my-2">
        <svg
          viewBox="0 0 320 320"
          className="w-full h-full overflow-visible select-none"
        >
          <defs>
            {/* Radar scanner sweep gradient */}
            <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </radialGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background circles / range rings */}
          <circle cx={cx} cy={cy} r={maxRadius} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={maxRadius * 0.66} fill="none" stroke="#1e293b" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={maxRadius * 0.33} fill="none" stroke="#1e293b" strokeWidth="1" />

          {/* Radar background sweep area */}
          <circle cx={cx} cy={cy} r={maxRadius} fill="url(#radarSweep)" />

          {/* Axis lines */}
          <line x1={cx} y1={cy - maxRadius - 10} x2={cx} y2={cy + maxRadius + 10} stroke="#1e293b" strokeWidth="1" />
          <line x1={cx - maxRadius - 10} y1={cy} x2={cx + maxRadius + 10} y2={cy} stroke="#1e293b" strokeWidth="1" />

          {/* Cardinal direction labels */}
          <text x={cx} y={cy - maxRadius - 14} textAnchor="middle" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">N</text>
          <text x={cx + maxRadius + 18} y={cy + 3} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">E</text>
          <text x={cx} y={cy + maxRadius + 22} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">S</text>
          <text x={cx - maxRadius - 18} y={cy + 3} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">W</text>

          {/* Distance markers */}
          <text x={cx + 4} y={cy - (maxRadius * 0.33) + 3} fill="#475569" fontSize="8" fontFamily="monospace">
            {Math.round(maxStopDistance * 0.33)}m
          </text>
          <text x={cx + 4} y={cy - (maxRadius * 0.66) + 3} fill="#475569" fontSize="8" fontFamily="monospace">
            {Math.round(maxStopDistance * 0.66)}m
          </text>
          <text x={cx + 4} y={cy - maxRadius + 3} fill="#475569" fontSize="8" fontFamily="monospace">
            {Math.round(maxStopDistance)}m
          </text>

          {/* User epicenter with pulsing rings */}
          <circle cx={cx} cy={cy} r="14" fill="#10b981" fillOpacity="0.15" className="animate-ping" style={{ transformOrigin: 'center' }} />
          <circle cx={cx} cy={cy} r="6" fill="#10b981" stroke="#047857" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="2" fill="#ffffff" />

          {/* Plotted Stops */}
          {stops.map((stop, index) => {
            // Convert bearing and distance to Cartesian coordinates
            // Bearing: 0 = North (up, negative Y), 90 = East (right, positive X)
            const angleRad = ((stop.bearingDegrees - 90) * Math.PI) / 180;
            const normalizedDist = (stop.distanceMeters / maxStopDistance) * maxRadius;
            // Clamp within bounds
            const radius = Math.min(maxRadius - 8, Math.max(25, normalizedDist));

            const stopX = cx + radius * Math.cos(angleRad);
            const stopY = cy + radius * Math.sin(angleRad);
            const isSelected = stop.busStopCode === selectedStopCode;

            return (
              <g
                key={stop.busStopCode}
                className="cursor-pointer group"
                onClick={() => onSelectStop(stop.busStopCode)}
              >
                {/* Connecting hairline to user */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={stopX}
                  y2={stopY}
                  stroke={isSelected ? '#10b981' : '#334155'}
                  strokeWidth={isSelected ? '1.5' : '0.75'}
                  strokeDasharray={isSelected ? 'none' : '2 2'}
                  opacity={isSelected ? 0.9 : 0.4}
                />

                {/* Stop node circle */}
                <circle
                  cx={stopX}
                  cy={stopY}
                  r={isSelected ? '12' : '9'}
                  fill={isSelected ? '#059669' : '#1e293b'}
                  stroke={isSelected ? '#34d399' : '#475569'}
                  strokeWidth={isSelected ? '2' : '1.5'}
                  filter={isSelected ? 'url(#glow)' : undefined}
                  className="transition-all duration-300"
                />

                {/* Index label inside node */}
                <text
                  x={stopX}
                  y={stopY + 3.5}
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : '#94a3b8'}
                  fontSize={isSelected ? '10' : '9'}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {index + 1}
                </text>

                {/* Stop code tag near node */}
                <text
                  x={stopX}
                  y={stopY - 14}
                  textAnchor="middle"
                  fill={isSelected ? '#34d399' : '#64748b'}
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  #{stop.busStopCode}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend & quick switcher below radar */}
      <div className="w-full flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-800 text-xs">
        {stops.map((stop, idx) => {
          const isSelected = stop.busStopCode === selectedStopCode;
          return (
            <button
              key={stop.busStopCode}
              type="button"
              onClick={() => onSelectStop(stop.busStopCode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-slate-900/60 flex items-center justify-center text-[10px]">
                {idx + 1}
              </span>
              <span>{stop.busStopCode}</span>
              <span className="text-[10px] opacity-75">({stop.distanceMeters}m)</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
