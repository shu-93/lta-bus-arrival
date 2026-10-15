import React from 'react';
import { BusType } from '../types/lta';
import { Accessibility, Layers } from 'lucide-react';

interface BusDeckBadgeProps {
  type: BusType;
  isWheelchairAccessible?: boolean;
}

export const BusDeckBadge: React.FC<BusDeckBadgeProps> = ({
  type,
  isWheelchairAccessible = true,
}) => {
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
      {type === 'DD' && (
        <span
          className="flex items-center gap-0.5 text-sky-400 font-mono font-semibold"
          title="Double Deck bus (DD)"
        >
          <Layers className="w-2.5 h-2.5" />
          DD
        </span>
      )}
      {type === 'BD' && (
        <span
          className="text-amber-400 font-mono font-semibold"
          title="Articulated Bendy bus (BD)"
        >
          BD
        </span>
      )}
      {type === 'SD' && (
        <span className="text-slate-500 font-mono" title="Single Deck bus (SD)">
          SD
        </span>
      )}

      {isWheelchairAccessible && (
        <span title="Wheelchair Accessible Bus (WAB)" className="text-emerald-400">
          <Accessibility className="w-2.5 h-2.5" />
        </span>
      )}
    </div>
  );
};
