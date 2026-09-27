import React from 'react';
import { Trophy, Calendar } from 'lucide-react';
import { PersonalRecord } from '../types/database';

interface PRCardProps {
  pr: PersonalRecord;
  rank?: number;
  onClick?: () => void;
}

export const PRCard: React.FC<PRCardProps> = ({ pr, rank, onClick }) => {
  const dateFormatted = new Date(pr.achievedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      className="bg-[#11141c] border border-[#202636] hover:border-[#00f59b]/40 rounded-2xl p-4 transition-all group cursor-pointer shadow-md flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-[#171b26] border border-[#273042] flex items-center justify-center shrink-0 group-hover:bg-[#00f59b]/15 group-hover:border-[#00f59b]/30 transition-colors">
          {rank === 1 ? (
            <Trophy className="w-5 h-5 text-amber-400" />
          ) : rank === 2 ? (
            <Trophy className="w-5 h-5 text-zinc-300" />
          ) : rank === 3 ? (
            <Trophy className="w-5 h-5 text-amber-600" />
          ) : (
            <Trophy className="w-5 h-5 text-[#00f59b]" />
          )}
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-bold text-white tracking-tight truncate group-hover:text-[#00f59b] transition-colors">
            {pr.exerciseName}
          </h4>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
            <span className="text-[#00f59b] font-medium">{pr.muscleGroup}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-400" />
              {dateFormatted}
            </span>
          </div>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-lg font-black text-white tabular-nums">
          {pr.maxWeight} <span className="text-xs font-semibold text-zinc-400">kg</span>
        </div>
        <div className="text-[11px] text-zinc-400 font-mono tabular-nums">
          × {pr.repsAtMaxWeight} reps {pr.estimated1RM > pr.maxWeight && `(1RM ~${pr.estimated1RM}kg)`}
        </div>
      </div>
    </div>
  );
};
