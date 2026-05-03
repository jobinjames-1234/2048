import React from 'react';
import { Tile } from './Tile';
import type { Grid as GridType } from '../types';

interface GridProps {
  grid: GridType;
}

export function Grid({ grid }: GridProps) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl shadow-2xl aspect-square w-full max-w-[400px] grid grid-cols-4 grid-rows-4 gap-3 border-4 border-slate-700">
      {grid.map((row, r) => 
        row.map((val, c) => (
          <Tile key={`${r}-${c}`} value={val} />
        ))
      )}
    </div>
  );
}
