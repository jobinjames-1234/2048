import React from 'react';
import { motion } from 'motion/react';

interface ScoreProps {
  label: string;
  score: number;
}

export function ScoreBoard({ label, score }: ScoreProps) {
  return (
    <div className="bg-slate-800 p-3 rounded-lg flex flex-col items-center min-w-[100px] border border-slate-700">
      <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">{label}</span>
      <motion.span 
        key={score}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-2xl font-bold text-white tabular-nums"
      >
        {score}
      </motion.span>
    </div>
  );
}
