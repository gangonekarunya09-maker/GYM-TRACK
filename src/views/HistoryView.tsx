import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Dumbbell,
  Flame,
  Search,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { CompletedWorkoutDetail } from '../types/database';

interface HistoryViewProps {
  workouts: CompletedWorkoutDetail[];
  onSelectWorkout: (workout: CompletedWorkoutDetail) => void;
  onStartNewWorkout: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  workouts,
  onSelectWorkout,
  onStartNewWorkout,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Compute available months for filtering
  const months = useMemo(() => {
    const set = new Set<string>();
    workouts.forEach((w) => {
      const d = new Date(w.started_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      set.add(key);
    });
    return Array.from(set).sort().reverse();
  }, [workouts]);

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((w) => {
      const d = new Date(w.started_at);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const matchesMonth = selectedMonth === 'all' || monthKey === selectedMonth;

      const matchesSearch =
        searchTerm === '' ||
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.exercises.some((e) =>
          e.exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      return matchesMonth && matchesSearch;
    });
  }, [workouts, selectedMonth, searchTerm]);

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Header and Search */}
      <div className="bg-[#12151e] border border-[#202636] rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Workout History
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {workouts.length} total logged sessions
            </p>
          </div>
          <button
            onClick={onStartNewWorkout}
            className="h-10 px-4 rounded-xl bg-[#00f59b] hover:bg-[#00e08f] text-black font-extrabold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-[#00f59b]/20"
          >
            <Dumbbell className="w-4 h-4 stroke-[2.5]" />
            <span>New</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by workout name or exercise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#171b26] border border-[#262e3f] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#00f59b] transition-colors"
          />
        </div>

        {/* Month Filter Tabs */}
        {months.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <button
              onClick={() => setSelectedMonth('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedMonth === 'all'
                  ? 'bg-[#00f59b] text-black'
                  : 'bg-[#181d28] text-zinc-400 hover:text-white'
              }`}
            >
              All Time
            </button>
            {months.map((m) => {
              const [year, month] = m.split('-');
              const label = new Date(parseInt(year, 10), parseInt(month, 10) - 1).toLocaleDateString(
                'en-US',
                { month: 'short', year: 'numeric' }
              );
              return (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedMonth === m
                      ? 'bg-[#00f59b] text-black'
                      : 'bg-[#181d28] text-zinc-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Workouts List */}
      {filteredWorkouts.length === 0 ? (
        <div className="bg-[#12151e] border border-[#202636] rounded-3xl p-10 text-center">
          <Calendar className="w-10 h-10 text-zinc-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">No workouts found</h3>
          <p className="text-xs text-zinc-400 mt-1">
            {searchTerm ? 'Try a different search term.' : 'Complete a workout to build your history.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWorkouts.map((workout) => {
            const dateObj = new Date(workout.started_at);
            const dateStr = dateObj.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={workout.id}
                onClick={() => onSelectWorkout(workout)}
                className="bg-[#12151e] border border-[#202636] hover:border-[#00f59b]/40 rounded-2xl p-4 transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold text-white tracking-tight group-hover:text-[#00f59b] transition-colors truncate">
                      {workout.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        {dateStr}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 text-sky-400 font-mono tabular-nums">
                        <Clock className="w-3 h-3" />
                        {workout.duration_minutes} min
                      </span>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-[#181d28] border border-[#283143] text-zinc-400 group-hover:bg-[#00f59b] group-hover:text-black flex items-center justify-center transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Exercises Preview summary */}
                <div className="text-xs text-zinc-300 space-y-1 mb-3 pt-2 border-t border-[#1a202d]">
                  {workout.exercises.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className="truncate text-zinc-300 font-medium">
                        {item.exercise.name}
                      </span>
                      <span className="font-mono text-zinc-400 text-[11px] tabular-nums shrink-0 ml-2">
                        {item.sets.filter((s) => s.completed).length} sets
                      </span>
                    </div>
                  ))}
                  {workout.exercises.length > 3 && (
                    <div className="text-[11px] text-zinc-500 italic">
                      +{workout.exercises.length - 3} more exercises
                    </div>
                  )}
                </div>

                {/* Bottom stats pills */}
                <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400 pt-2 border-t border-[#1a202d]">
                  <div className="flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-[#00f59b]" />
                    <span>{workout.total_exercises} exercises</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>{workout.total_sets} sets</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-300 font-mono ml-auto">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>{workout.total_volume.toLocaleString()} kg</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
