import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Dumbbell, Flame, CheckCircle, ArrowRight } from 'lucide-react';
import { CompletedWorkoutDetail, PersonalRecord } from '../types/database';

interface WorkoutCompleteModalProps {
  workout: CompletedWorkoutDetail | null;
  newPRs: PersonalRecord[];
  isOpen: boolean;
  onDone: () => void;
}

export const WorkoutCompleteModal: React.FC<WorkoutCompleteModalProps> = ({
  workout,
  newPRs,
  isOpen,
  onDone,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f59b', '#ffffff', '#22c55e', '#38bdf8'],
        });
      } catch (e) {
        // Fallback gracefully
      }
    }
  }, [isOpen]);

  if (!isOpen || !workout) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#11141c] border border-[#242b3b] rounded-3xl p-6 shadow-2xl text-center">
        {/* Victory Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#00f59b]/20 border border-[#00f59b]/40 flex items-center justify-center mx-auto mb-3 shadow-[0_0_24px_rgba(0,245,155,0.3)]">
          <Trophy className="w-8 h-8 text-[#00f59b]" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-white tracking-tight">
          Workout Complete 💪
        </h2>
        <p className="text-sm font-semibold text-zinc-400 mt-1">
          {workout.name}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 my-5">
          <div className="bg-[#171b26] border border-[#273042] rounded-2xl p-3 flex flex-col items-center justify-center">
            <Clock className="w-4 h-4 text-sky-400 mb-1" />
            <span className="text-xl font-extrabold text-white tabular-nums">
              {workout.duration_minutes}
            </span>
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Minutes
            </span>
          </div>

          <div className="bg-[#171b26] border border-[#273042] rounded-2xl p-3 flex flex-col items-center justify-center">
            <Dumbbell className="w-4 h-4 text-[#00f59b] mb-1" />
            <span className="text-xl font-extrabold text-white tabular-nums">
              {workout.total_exercises}
            </span>
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Exercises
            </span>
          </div>

          <div className="bg-[#171b26] border border-[#273042] rounded-2xl p-3 flex flex-col items-center justify-center">
            <CheckCircle className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-xl font-extrabold text-white tabular-nums">
              {workout.total_sets}
            </span>
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Sets
            </span>
          </div>
        </div>

        {/* Total Volume Highlight */}
        <div className="bg-gradient-to-r from-[#141d24] to-[#162420] border border-[#00f59b]/30 rounded-2xl p-3.5 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-[#00f59b]/15 text-[#00f59b] flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Total Volume Lifted
              </div>
              <div className="text-lg font-black text-white tabular-nums">
                {workout.total_volume.toLocaleString()} <span className="text-sm font-medium text-zinc-400">kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* PRs Achieved (if any) */}
        {newPRs.length > 0 && (
          <div className="mb-5 text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-2 uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>Personal Records Smashed ({newPRs.length})</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {newPRs.map((pr) => (
                <div
                  key={pr.exerciseId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs"
                >
                  <span className="font-bold text-white truncate mr-2">
                    {pr.exerciseName}
                  </span>
                  <span className="font-mono font-extrabold text-amber-300 tabular-nums shrink-0">
                    {pr.maxWeight} kg × {pr.repsAtMaxWeight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exercises list summary */}
        <div className="text-left mb-6">
          <div className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
            Completed Exercises
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto divide-y divide-[#1b212f]">
            {workout.exercises.map((item) => {
              const completedCount = item.sets.filter((s) => s.completed).length;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-1.5 text-xs"
                >
                  <span className="font-medium text-zinc-200 truncate">
                    {item.exercise.name}
                  </span>
                  <span className="text-zinc-400 font-mono tabular-nums shrink-0 ml-2">
                    {completedCount} sets
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onDone}
          className="w-full h-12 rounded-2xl bg-[#00f59b] hover:bg-[#00e08f] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,245,155,0.3)] transition-all active:scale-[0.98]"
        >
          <span>Done</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
