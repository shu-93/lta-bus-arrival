import React from 'react';
import { BusLoad } from '../types/lta';

interface BusLoadBadgeProps {
  load: BusLoad;
  showText?: boolean;
}

export const BusLoadBadge: React.FC<BusLoadBadgeProps> = ({ load, showText = false }) => {
  let color = 'bg-emerald-500';
  let textColor = 'text-emerald-400';
  let text = 'Seats Avail';
  let title = 'Seats Available (SEA)';

  if (load === 'SDA') {
    color = 'bg-amber-400';
    textColor = 'text-amber-300';
    text = 'Standing Avail';
    title = 'Standing Available (SDA)';
  } else if (load === 'LSD') {
    color = 'bg-rose-500';
    textColor = 'text-rose-300';
    text = 'Limited Standing';
    title = 'Limited Standing (LSD)';
  }

  return (
    <div className="flex items-center gap-1.5" title={title}>
      <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
      {showText && <span className={`text-[10px] font-medium ${textColor}`}>{text}</span>}
    </div>
  );
};
