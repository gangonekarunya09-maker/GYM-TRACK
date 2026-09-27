import React from 'react';
import { X, Calendar, Clock, Dumbbell, Flame, Play, Trash2 } from 'lucide-react';
import { CompletedWorkoutDetail } from '../types/database';

interface WorkoutDetailModalProps {
  workout: CompletedWorkoutDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onRepeatWorkout: (workout: CompletedWorkoutDetail) => void;
  onDeleteWorkout: (workoutId: string) => void;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  workout,
  isOpen,
  onClose,
  onRepeatWorkout,
  onDeleteWorkout,
}) => {
  if (!isOpen || !workout) return null;

  const dateFormatted = new Date(workout.started_at).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#11141c] border border-[#232938] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top grab bar for mobile */}
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-[#1f2533]">
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              {workout.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                {dateFormatted}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-[#1a202d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Metrics Bar */}
        <div className="grid grid-cols-3 gap-2 px-5 py-3 bg-[#151923] border-b border-[#202737]">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-medium">Duration</span>
              <span className="font-bold text-white tabular-nums">{workout.duration_minutes} min</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Dumbbell className="w-3.5 h-3.5 text-[#00f59b] shrink-0" />
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-medium">Exercises</span>
              <span className="font-bold text-white tabular-nums">{workout.total_exercises} ({workout.total_sets} sets)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-medium">Volume</span>
              <span className="font-bold text-white tabular-nums">{workout.total_volume.toLocaleString()} kg</span>
            </div>
          </div>
        </div>

        {/* Exercises & Sets Breakdown */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {workout.exercises.map((item, idx) => (
            <div
              key={item.id || idx}
              className="bg-[#161a24] border border-[#242c3d] rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1e2433] text-zinc-400 text-xs font-bold flex items-center justify-center tabular-nums">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {item.exercise.name}
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span className="text-[#00f59b] font-medium">{item.exercise.muscle_group}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.exercise.equipment}</span>
                </div>
              </div>

              {/* Sets List */}
              <div className="space-y-1.5 pt-1">
                {item.sets.map((set, sIdx) => (
                  <div
                    key={set.id || sIdx}
                    className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-[#11141c] text-xs font-mono"
                  >
                    <span className="text-zinc-400 font-sans font-medium text-[11px]">
                      Set {set.set_number || sIdx + 1}
                    </span>
                    <span className="font-bold text-white tabular-nums">
                      {set.weight} kg × {set.reps} reps
                    </span>
                    {set.completed ? (
                      <span className="text-[#00f59b] font-sans font-semibold text-[11px]">
                        ✓ Completed
                      </span>
                    ) : (
                      <span className="text-zinc-500 font-sans text-[11px]">
                        Skipped
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#1f2533] bg-[#0f1219] flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to delete this workout from history?')) {
                onDeleteWorkout(workout.id);
                onClose();
              }
            }}
            className="h-11 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 border border-rose-500/20 transition-colors"
            title="Delete workout"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onRepeatWorkout(workout);
              onClose();
            }}
            className="flex-1 h-11 rounded-xl bg-[#00f59b] hover:bg-[#00e08f] text-black text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#00f59b]/20"
          >
            <Play className="w-4 h-4 fill-current" />
            Repeat This Workout
          </button>
        </div>
      </div>
    </div>
  );
};
