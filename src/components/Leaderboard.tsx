import React from 'react';
import { motion } from 'motion/react';
import type { ScoreEntry } from '../types';
import { Trophy } from 'lucide-react';

interface LeaderboardProps {
  scores: ScoreEntry[];
  loading?: boolean;
}

export function Leaderboard({ scores, loading }: LeaderboardProps) {
  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 w-full max-w-md">
      <div className="p-4 bg-slate-700/50 flex items-center gap-2 border-bottom border-slate-600">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h2 className="font-bold text-white uppercase tracking-wider text-sm">Global Leaderboard</h2>
      </div>
      <div className="divide-y divide-slate-700">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
          </div>
        ) : scores.length === 0 ? (
          <div className="p-8 text-center text-slate-500 italic text-sm">No scores yet. Be the first!</div>
        ) : (
          scores.map((entry, index) => (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              key={entry.id} 
              className="p-3 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  "w-6 text-center font-mono text-sm",
                  index === 0 ? "text-yellow-400 font-bold" : 
                  index === 1 ? "text-slate-300" :
                  index === 2 ? "text-orange-400" : "text-slate-500"
                )}>
                  {index + 1}
                </span>
                <span className="text-white font-medium">{entry.username}</span>
              </div>
              <span className="text-yellow-400 font-mono font-bold">{entry.score}</span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
