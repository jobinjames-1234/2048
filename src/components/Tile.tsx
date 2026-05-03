import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface TileProps {
  value: number | null;
  key?: string;
}

const TILE_COLORS: Record<number, string> = {
  2: 'bg-slate-200 text-slate-800',
  4: 'bg-slate-300 text-slate-800',
  8: 'bg-orange-200 text-orange-900',
  16: 'bg-orange-300 text-orange-950',
  32: 'bg-orange-400 text-white',
  64: 'bg-orange-500 text-white',
  128: 'bg-yellow-200 text-yellow-900 shadow-[0_0_10px_rgba(250,204,21,0.4)]',
  256: 'bg-yellow-300 text-yellow-950 shadow-[0_0_15px_rgba(250,204,21,0.5)]',
  512: 'bg-yellow-400 text-white shadow-[0_0_20px_rgba(250,204,21,0.6)]',
  1024: 'bg-yellow-500 text-white shadow-[0_0_25px_rgba(250,204,21,0.7)]',
  2048: 'bg-yellow-600 text-white shadow-[0_0_30px_rgba(250,204,21,0.8)]',
};

export function Tile({ value }: TileProps) {
  if (value === null) {
    return <div className="w-full h-full bg-slate-700/50 rounded-lg" />;
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        "w-full h-full rounded-lg flex items-center justify-center text-2xl font-bold transition-colors",
        TILE_COLORS[value] || 'bg-slate-900 text-white'
      )}
    >
      {value}
    </motion.div>
  );
}
