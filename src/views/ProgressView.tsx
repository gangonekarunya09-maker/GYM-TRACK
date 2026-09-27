import React, { useState, useMemo } from 'react';
import {
  Trophy,
  TrendingUp,
  Dumbbell,
  Target,
  Calendar,
  ChevronDown,
  Flame,
} from 'lucide-react';
import {
  CompletedWorkoutDetail,
  Exercise,
  PersonalRecord,
} from '../types/database';
import { ProgressChart } from '../components/ProgressChart';
import { PRCard } from '../components/PRCard';
import { workoutService } from '../services/workoutService';

interface ProgressViewProps {
  workouts: CompletedWorkoutDetail[];
  exercises: Exercise[];
  personalRecords: PersonalRecord[];
  onSelectExerciseToLog?: (exercise: Exercise) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  workouts,
  exercises,
  personalRecords,
}) => {
  // Find which exercises have logged data
  const exercisesWithData = useMemo(() => {
    const ids = new Set<string>();
    workouts.forEach((w) =>
      w.exercises.forEach((e) => {
        if (e.sets.some((s) => s.completed && s.weight > 0)) {
          ids.add(e.exercise.id);
        }
      })
    );

    const available = exercises.filter((e) => ids.has(e.id));
    return available.length > 0 ? available : exercises.slice(0, 10);
  }, [workouts, exercises]);

  // Selected exercise for detailed chart
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    exercisesWithData[0]?.id || 'ex-bench-press'
  );

  const selectedExercise = useMemo(() => {
    return exercises.find((e) => e.id === selectedExerciseId) || exercises[0];
  }, [exercises, selectedExerciseId]);

  // Progression history for selected exercise
  const progressionData = useMemo(() => {
    return workoutService.getExerciseProgression(selectedExerciseId, workouts);
  }, [selectedExerciseId, workouts]);

  // Exercise specific stats
  const exerciseStats = useMemo(() => {
    let bestWeight = 0;
    let bestRepsAtWeight = 0;
    let maxEstimated1RM = 0;
    let totalSets = 0;
    let totalVolume = 0;

    progressionData.forEach((p) => {
      totalSets += p.reps > 0 ? 1 : 0;
      totalVolume += p.volume;
      if (p.weight > bestWeight) {
        bestWeight = p.weight;
        bestRepsAtWeight = p.reps;
      }
      if (p.estimated1RM > maxEstimated1RM) {
        maxEstimated1RM = p.estimated1RM;
      }
    });

    // Also look through all sets of this exercise in workouts for total sets
    let totalAllSets = 0;
    workouts.forEach((w) => {
      const match = w.exercises.find((e) => e.exercise.id === selectedExerciseId);
      if (match) {
        totalAllSets += match.sets.filter((s) => s.completed).length;
      }
    });

    return {
      bestWeight: bestWeight || 0,
      bestReps: bestRepsAtWeight || 0,
      estimated1RM: maxEstimated1RM || 0,
      totalSets: totalAllSets || totalSets,
      totalVolume: Math.round(totalVolume),
    };
  }, [progressionData, workouts, selectedExerciseId]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-[#12151e] border border-[#202636] rounded-3xl p-5 shadow-lg">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Strength & Progress
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Track progressive overload and analyze your personal records.
        </p>

        {/* Exercise Selector Dropdown */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
            Select Exercise
          </label>
          <div className="relative">
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="w-full h-12 pl-4 pr-10 rounded-2xl bg-[#171b26] border border-[#283244] text-white text-sm font-bold appearance-none focus:outline-none focus:border-[#00f59b] transition-colors cursor-pointer"
            >
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.muscle_group})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Selected Exercise Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-[#00f59b]" />
            {selectedExercise?.name} Overview
          </h2>
          <span className="text-xs text-zinc-400">
            {selectedExercise?.muscle_group} · {selectedExercise?.equipment}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#12151e] border border-[#202636] rounded-2xl p-3.5">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Best Weight
            </span>
            <div className="text-2xl font-black text-white tabular-nums mt-1">
              {exerciseStats.bestWeight}{' '}
              <span className="text-xs font-semibold text-zinc-400">kg</span>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono mt-0.5 block">
              {exerciseStats.bestReps > 0 ? `× ${exerciseStats.bestReps} reps` : '—'}
            </span>
          </div>

          <div className="bg-[#12151e] border border-[#202636] rounded-2xl p-3.5">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Estimated 1RM
            </span>
            <div className="text-2xl font-black text-[#00f59b] tabular-nums mt-1">
              {exerciseStats.estimated1RM}{' '}
              <span className="text-xs font-semibold text-zinc-400">kg</span>
            </div>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">Epley formula</span>
          </div>

          <div className="bg-[#12151e] border border-[#202636] rounded-2xl p-3.5">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Total Sets
            </span>
            <div className="text-2xl font-black text-white tabular-nums mt-1">
              {exerciseStats.totalSets}
            </div>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">Completed</span>
          </div>

          <div className="bg-[#12151e] border border-[#202636] rounded-2xl p-3.5">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Total Volume
            </span>
            <div className="text-2xl font-black text-amber-400 tabular-nums mt-1">
              {exerciseStats.totalVolume.toLocaleString()}{' '}
              <span className="text-xs font-semibold text-zinc-400">kg</span>
            </div>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">All sessions</span>
          </div>
        </div>
      </div>

      {/* Responsive Line Chart */}
      <ProgressChart
        dataPoints={progressionData}
        exerciseName={selectedExercise?.name || 'Exercise'}
      />

      {/* Progression Log Points */}
      {progressionData.length > 0 && (
        <div className="bg-[#12151e] border border-[#202636] rounded-2xl p-4">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2.5">
            Top Set Progression Timeline
          </h3>
          <div className="space-y-1.5 divide-y divide-[#1c2230]">
            {progressionData
              .slice()
              .reverse()
              .map((point, index) => (
                <div
                  key={point.date + index}
                  className="flex items-center justify-between pt-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="font-medium text-white">{point.formattedDate}</span>
                    <span className="text-zinc-500 text-[11px]">({point.workoutName})</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-[#00f59b] tabular-nums">
                      {point.weight} kg × {point.reps} reps
                    </span>
                    <span className="text-zinc-400 text-[11px] tabular-nums">
                      ~{point.estimated1RM}kg 1RM
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Personal Records Hall of Fame */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            All Personal Records ({personalRecords.length})
          </h2>
        </div>

        {personalRecords.length === 0 ? (
          <div className="bg-[#12151e] border border-[#202636] rounded-2xl p-6 text-center">
            <Trophy className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
            <p className="text-sm text-zinc-400">No PRs recorded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {personalRecords.map((pr, idx) => (
              <PRCard
                key={pr.exerciseId}
                pr={pr}
                rank={idx + 1}
                onClick={() => setSelectedExerciseId(pr.exerciseId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
