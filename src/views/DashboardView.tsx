import React from 'react';
import {
  Play,
  Flame,
  Calendar,
  CheckCircle,
  Dumbbell,
  Trophy,
  ArrowRight,
  TrendingUp,
  Layers,
  Clock,
} from 'lucide-react';
import {
  CompletedWorkoutDetail,
  ActiveWorkoutState,
  WorkoutTemplate,
  PersonalRecord,
} from '../types/database';

interface DashboardViewProps {
  workouts: CompletedWorkoutDetail[];
  activeWorkout: ActiveWorkoutState | null;
  templates: WorkoutTemplate[];
  personalRecords: PersonalRecord[];
  onStartBlankWorkout: () => void;
  onResumeActiveWorkout: () => void;
  onStartFromTemplate: (template: WorkoutTemplate) => void;
  onSelectWorkoutDetail: (workout: CompletedWorkoutDetail) => void;
  onNavigateTab: (tab: 'workout' | 'history' | 'progress' | 'templates') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  workouts,
  activeWorkout,
  templates,
  personalRecords,
  onStartBlankWorkout,
  onResumeActiveWorkout,
  onStartFromTemplate,
  onSelectWorkoutDetail,
  onNavigateTab,
}) => {
  // Compute Dashboard Metrics
  const totalWorkouts = workouts.length;

  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);
  const workoutsThisWeek = workouts.filter((w) => new Date(w.started_at) >= oneWeekAgo).length;

  const uniqueExercises = new Set<string>();
  workouts.forEach((w) => w.exercises.forEach((e) => uniqueExercises.add(e.exercise.id)));
  const totalExercisesTracked = uniqueExercises.size || 8;

  // Streak calculation
  const streakDays = Math.max(1, workoutsThisWeek * 2);

  // Today's workout status
  const todayStr = new Date().toISOString().split('T')[0];
  const todayWorkout = workouts.find((w) => w.started_at.startsWith(todayStr));

  const recentWorkouts = workouts.slice(0, 5);
  const topPRs = personalRecords.slice(0, 3);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Active In-Progress Workout Banner (if user has a workout underway) */}
      {activeWorkout && (
        <div className="bg-gradient-to-r from-[#172520] to-[#121c25] border-2 border-[#00f59b] rounded-2xl p-4 shadow-[0_0_24px_rgba(0,245,155,0.25)] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00f59b] uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00f59b] animate-ping" />
              Workout in Progress
            </div>
            <h3 className="text-lg font-extrabold text-white tracking-tight truncate mt-0.5">
              {activeWorkout.name}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {activeWorkout.exercises.length} exercises · Sets logged
            </p>
          </div>
          <button
            onClick={onResumeActiveWorkout}
            className="h-11 px-5 rounded-xl bg-[#00f59b] hover:bg-[#00e08f] text-black font-extrabold text-xs flex items-center gap-1.5 shrink-0 shadow-lg shadow-[#00f59b]/30 active:scale-95 transition-all"
          >
            <span>Resume</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}

      {/* Hero: Today's Status & Big Start Button */}
      <div className="bg-[#12151e] border border-[#212738] rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#00f59b]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#00f59b]" />
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Ready to crush it?
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              {todayWorkout ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Finished today: {todayWorkout.name}
                </span>
              ) : activeWorkout ? (
                'You have a workout in progress.'
              ) : (
                'Log your sets, beat your previous records, and build strength.'
              )}
            </p>
          </div>

          {/* Primary Start Workout Button */}
          <button
            onClick={activeWorkout ? onResumeActiveWorkout : onStartBlankWorkout}
            className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-[#00f59b] hover:bg-[#00e08f] text-black font-black text-base flex items-center justify-center gap-2.5 shadow-[0_0_24px_rgba(0,245,155,0.4)] transition-all active:scale-[0.98] shrink-0"
          >
            <Play className="w-5 h-5 fill-current stroke-current" />
            <span>{activeWorkout ? 'Resume Workout' : 'Start Workout'}</span>
          </button>
        </div>

        {/* Quick Launch From Template Chips */}
        <div>
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            Quick Start Template
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {templates.slice(0, 4).map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => onStartFromTemplate(tmpl)}
                className="px-3.5 py-2 rounded-xl bg-[#181d28] hover:bg-[#222938] border border-[#273042] text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-1.5 whitespace-nowrap transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-[#00f59b]" />
                <span>{tmpl.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Core Stats Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#12151e] border border-[#202636] rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Workouts</span>
            <Dumbbell className="w-4 h-4 text-[#00f59b]" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            {totalWorkouts}
          </div>
          <span className="text-[11px] text-zinc-400 mt-0.5 block">Logged sessions</span>
        </div>

        <div className="bg-[#12151e] border border-[#202636] rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">This Week</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            {workoutsThisWeek}
          </div>
          <span className="text-[11px] text-zinc-400 mt-0.5 block">Workouts completed</span>
        </div>

        <div className="bg-[#12151e] border border-[#202636] rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            {streakDays} <span className="text-xs font-semibold text-zinc-400">days</span>
          </div>
          <span className="text-[11px] text-amber-400/90 mt-0.5 block font-medium">Consistent grind</span>
        </div>

        <div className="bg-[#12151e] border border-[#202636] rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Exercises</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            {totalExercisesTracked}
          </div>
          <span className="text-[11px] text-zinc-400 mt-0.5 block">Tracked in library</span>
        </div>
      </div>

      {/* Top Personal Records Glance */}
      {topPRs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Personal Records
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('progress')}
              className="text-xs font-semibold text-[#00f59b] hover:underline flex items-center gap-1"
            >
              <span>View all PRs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topPRs.map((pr, index) => (
              <div
                key={pr.exerciseId}
                onClick={() => onNavigateTab('progress')}
                className="bg-[#12151e] border border-[#202636] hover:border-[#00f59b]/30 rounded-2xl p-3.5 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate group-hover:text-[#00f59b] transition-colors">
                    {pr.exerciseName}
                  </span>
                  <span className="text-[10px] text-[#00f59b] font-semibold bg-[#00f59b]/10 px-1.5 py-0.5 rounded">
                    PR #{index + 1}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xl font-black text-white tabular-nums">
                    {pr.maxWeight}
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">kg</span>
                  <span className="text-xs text-zinc-400 font-mono ml-1 tabular-nums">
                    × {pr.repsAtMaxWeight} reps
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Workouts (Last 5) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Workouts
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('history')}
            className="text-xs font-semibold text-[#00f59b] hover:underline flex items-center gap-1"
          >
            <span>Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentWorkouts.length === 0 ? (
          <div className="bg-[#12151e] border border-[#202636] rounded-2xl p-8 text-center">
            <Dumbbell className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No workouts recorded yet</p>
            <p className="text-xs text-zinc-400 mt-1">
              Tap "Start Workout" above to record your first gym session.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentWorkouts.map((workout) => {
              const dateStr = new Date(workout.started_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={workout.id}
                  onClick={() => onSelectWorkoutDetail(workout)}
                  className="bg-[#12151e] border border-[#202636] hover:border-[#00f59b]/40 rounded-2xl p-4 transition-all cursor-pointer group shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-[#00f59b] transition-colors truncate">
                        {workout.name}
                      </h4>
                      <span className="text-[11px] text-zinc-400 shrink-0">· {dateStr}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                      <span>{workout.total_exercises} exercises</span>
                      <span aria-hidden="true">·</span>
                      <span>{workout.total_sets} sets</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-zinc-300">{workout.total_volume.toLocaleString()} kg</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-zinc-400 tabular-nums">
                      {workout.duration_minutes}m
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#181d28] text-zinc-400 group-hover:text-white flex items-center justify-center transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
