import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Timer,
  CheckCircle,
  X,
  Edit2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ActiveWorkoutState,
  ActiveExerciseItem,
  ActiveSet,
  Exercise,
  CompletedWorkoutDetail,
  PersonalRecord,
} from '../types/database';
import { ExerciseCard } from '../components/ExerciseCard';
import { ExerciseSelectorModal } from '../components/ExerciseSelectorModal';
import { workoutService } from '../services/workoutService';

interface ActiveWorkoutViewProps {
  workout: ActiveWorkoutState;
  onUpdateWorkout: (updated: ActiveWorkoutState) => void;
  onFinishWorkout: (completed: CompletedWorkoutDetail, newPRs: PersonalRecord[]) => void;
  onCancelWorkout: () => void;
  onTriggerRestTimer: (seconds?: number) => void;
  availableExercises: Exercise[];
  onAddCustomExercise: (exercise: Omit<Exercise, 'id'>) => Promise<Exercise>;
  allCompletedWorkouts: CompletedWorkoutDetail[];
  isRestTimerActive: boolean;
  restTimerSecondsRemaining: number | null;
  onOpenRestTimerModal: () => void;
}

export const ActiveWorkoutView: React.FC<ActiveWorkoutViewProps> = ({
  workout,
  onUpdateWorkout,
  onFinishWorkout,
  onCancelWorkout,
  onTriggerRestTimer,
  availableExercises,
  onAddCustomExercise,
  allCompletedWorkouts,
  isRestTimerActive,
  restTimerSecondsRemaining,
  onOpenRestTimerModal,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(workout.name);
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSavingLocal, setIsSavingLocal] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute live elapsed time
  useEffect(() => {
    const startTime = new Date(workout.started_at).getTime();

    const updateElapsed = () => {
      const diff = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      setElapsedSeconds(diff);
    };

    updateElapsed();
    timerRef.current = setInterval(updateElapsed, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [workout.started_at]);

  const formatElapsed = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to trigger save & visual feedback
  const triggerAutoSave = (updated: ActiveWorkoutState) => {
    setIsSavingLocal(true);
    onUpdateWorkout(updated);
    setTimeout(() => setIsSavingLocal(false), 500);
  };

  const handleTitleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = titleInput.trim() || 'Custom Workout';
    setTitleInput(clean);
    setIsEditingTitle(false);
    triggerAutoSave({ ...workout, name: clean });
  };

  // Add Exercise to Workout
  const handleSelectExercise = (exercise: Exercise) => {
    // Check previous performance for this exercise
    const prev = workoutService.getPreviousPerformance(exercise.id, allCompletedWorkouts);

    // Initial default set
    const defaultWeight = prev?.sets[0]?.weight ?? 20;
    const defaultReps = prev?.sets[0]?.reps ?? 10;

    const newExerciseItem: ActiveExerciseItem = {
      id: `we-active-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      exercise,
      order_index: workout.exercises.length,
      previousSetsSummary: prev?.summary,
      sets: [
        {
          id: `set-${Date.now()}-1`,
          set_number: 1,
          weight: defaultWeight,
          reps: defaultReps,
          completed: false,
          previousWeight: prev?.sets[0]?.weight,
          previousReps: prev?.sets[0]?.reps,
        },
      ],
    };

    const updated = {
      ...workout,
      exercises: [...workout.exercises, newExerciseItem],
    };
    triggerAutoSave(updated);
  };

  // Set updates
  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    updatedSet: Partial<ActiveSet>
  ) => {
    const updatedExercises = [...workout.exercises];
    const targetEx = { ...updatedExercises[exerciseIndex] };
    const targetSets = [...targetEx.sets];

    targetSets[setIndex] = {
      ...targetSets[setIndex],
      ...updatedSet,
    };

    targetEx.sets = targetSets;
    updatedExercises[exerciseIndex] = targetEx;

    triggerAutoSave({
      ...workout,
      exercises: updatedExercises,
    });
  };

  // Add Set to Exercise
  const handleAddSet = (exerciseIndex: number) => {
    const updatedExercises = [...workout.exercises];
    const targetEx = { ...updatedExercises[exerciseIndex] };
    const sets = targetEx.sets;
    const lastSet = sets[sets.length - 1];

    // Grab previous performance if available for this set number
    const prev = workoutService.getPreviousPerformance(targetEx.exercise.id, allCompletedWorkouts);
    const nextSetIndex = sets.length;
    const prevSetForThisSlot = prev?.sets[nextSetIndex];

    const newSet: ActiveSet = {
      id: `set-${Date.now()}-${sets.length + 1}`,
      set_number: sets.length + 1,
      weight: lastSet ? lastSet.weight : prevSetForThisSlot?.weight ?? 20,
      reps: lastSet ? lastSet.reps : prevSetForThisSlot?.reps ?? 10,
      completed: false,
      previousWeight: prevSetForThisSlot?.weight,
      previousReps: prevSetForThisSlot?.reps,
    };

    targetEx.sets = [...sets, newSet];
    updatedExercises[exerciseIndex] = targetEx;
    triggerAutoSave({ ...workout, exercises: updatedExercises });
  };

  // Duplicate Last Set
  const handleDuplicateLastSet = (exerciseIndex: number) => {
    const targetEx = workout.exercises[exerciseIndex];
    if (!targetEx || targetEx.sets.length === 0) return;
    const lastSet = targetEx.sets[targetEx.sets.length - 1];

    const newSet: ActiveSet = {
      id: `set-${Date.now()}-${targetEx.sets.length + 1}`,
      set_number: targetEx.sets.length + 1,
      weight: lastSet.weight,
      reps: lastSet.reps,
      completed: false,
    };

    const updatedExercises = [...workout.exercises];
    updatedExercises[exerciseIndex] = {
      ...targetEx,
      sets: [...targetEx.sets, newSet],
    };
    triggerAutoSave({ ...workout, exercises: updatedExercises });
  };

  // Remove Set
  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...workout.exercises];
    const targetEx = { ...updatedExercises[exerciseIndex] };
    const remaining = targetEx.sets.filter((_, idx) => idx !== setIndex);

    // Re-number
    targetEx.sets = remaining.map((s, idx) => ({ ...s, set_number: idx + 1 }));
    updatedExercises[exerciseIndex] = targetEx;
    triggerAutoSave({ ...workout, exercises: updatedExercises });
  };

  // Toggle complete set & trigger rest timer
  const handleToggleComplete = (exerciseIndex: number, setIndex: number) => {
    const current = workout.exercises[exerciseIndex].sets[setIndex];
    const nextCompleted = !current.completed;

    handleUpdateSet(exerciseIndex, setIndex, { completed: nextCompleted });

    if (nextCompleted) {
      // Trigger rest timer default (90 seconds)
      onTriggerRestTimer(90);
    }
  };

  // Reorder exercises
  const handleMoveExercise = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= workout.exercises.length) return;
    const updated = [...workout.exercises];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    const reindexed = updated.map((e, idx) => ({ ...e, order_index: idx }));
    triggerAutoSave({ ...workout, exercises: reindexed });
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    const updated = workout.exercises.filter((_, idx) => idx !== exerciseIndex);
    triggerAutoSave({ ...workout, exercises: updated });
  };

  // Finish Workout
  const handleFinish = () => {
    // Validate if any exercises or completed sets exist
    let totalCompletedSets = 0;
    let totalVolume = 0;

    workout.exercises.forEach((e) => {
      e.sets.forEach((s) => {
        if (s.completed && s.weight > 0 && s.reps > 0) {
          totalCompletedSets++;
          totalVolume += s.weight * s.reps;
        }
      });
    });

    if (workout.exercises.length === 0) {
      alert('Please add at least one exercise before finishing.');
      return;
    }

    if (totalCompletedSets === 0) {
      const confirmFinish = confirm(
        'You have not checked off any sets as completed. Do you still want to finish and save this workout?'
      );
      if (!confirmFinish) return;
    }

    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const completedAt = new Date().toISOString();

    // Map to CompletedWorkoutDetail
    const completedDetail: CompletedWorkoutDetail = {
      id: workout.id,
      name: workout.name,
      started_at: workout.started_at,
      completed_at: completedAt,
      duration_minutes: durationMinutes,
      total_exercises: workout.exercises.length,
      total_sets: totalCompletedSets,
      total_volume: Math.round(totalVolume),
      exercises: workout.exercises.map((e) => ({
        id: e.id,
        exercise: e.exercise,
        sets: e.sets.map((s) => ({
          id: s.id,
          workout_exercise_id: e.id,
          set_number: s.set_number,
          weight: s.weight,
          reps: s.reps,
          completed: s.completed,
        })),
      })),
    };

    // Calculate existing PRs prior to this workout
    const existingPRs = workoutService.calculatePersonalRecords(allCompletedWorkouts);
    const existingPRMap = new Map(existingPRs.map((p) => [p.exerciseId, p.maxWeight]));

    // Check for newly achieved PRs in this session!
    const newPRs: PersonalRecord[] = [];
    completedDetail.exercises.forEach((item) => {
      item.sets.forEach((s) => {
        if (s.completed && s.weight > 0) {
          const currentBest = existingPRMap.get(item.exercise.id) || 0;
          if (s.weight > currentBest) {
            existingPRMap.set(item.exercise.id, s.weight);
            const e1RM = s.reps > 1 ? Math.round(s.weight * (1 + s.reps / 30) * 10) / 10 : s.weight;
            newPRs.push({
              exerciseId: item.exercise.id,
              exerciseName: item.exercise.name,
              muscleGroup: item.exercise.muscle_group,
              maxWeight: s.weight,
              repsAtMaxWeight: s.reps,
              estimated1RM: e1RM,
              achievedAt: completedAt,
              workoutName: workout.name,
            });
          }
        }
      });
    });

    onFinishWorkout(completedDetail, newPRs);
  };

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-150">
      {/* Sticky Header inside Workout screen */}
      <div className="bg-[#12151e] border border-[#202636] rounded-2xl p-4 shadow-md sticky top-16 z-20">
        <div className="flex items-center justify-between gap-3">
          {/* Editable Title */}
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <form onSubmit={handleTitleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={() => handleTitleSubmit()}
                  autoFocus
                  className="bg-[#181d28] border border-[#2e374d] rounded-lg px-2.5 py-1 text-base font-bold text-white focus:outline-none focus:border-[#00f59b] w-full"
                />
              </form>
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="flex items-center gap-2 text-left group max-w-full"
              >
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight truncate group-hover:text-[#00f59b] transition-colors">
                  {workout.name}
                </h2>
                <Edit2 className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 shrink-0" />
              </button>
            )}

            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
              <span className="flex items-center gap-1 text-[#00f59b] font-mono font-bold tabular-nums">
                <Clock className="w-3.5 h-3.5 text-[#00f59b]" />
                {formatElapsed(elapsedSeconds)}
              </span>
              <span aria-hidden="true">·</span>
              <span>{workout.exercises.length} exercises</span>
              {isSavingLocal && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[10px] text-zinc-400">Saving...</span>
                </>
              )}
            </div>
          </div>

          {/* Rest Timer Button */}
          <button
            type="button"
            onClick={onOpenRestTimerModal}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              isRestTimerActive && restTimerSecondsRemaining !== null && restTimerSecondsRemaining > 0
                ? 'bg-[#00f59b] text-black shadow-[0_0_16px_rgba(0,245,155,0.4)] animate-pulse'
                : 'bg-[#181d28] border border-[#262c3d] text-zinc-300 hover:text-white hover:bg-[#202737]'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span className="tabular-nums font-mono">
              {isRestTimerActive && restTimerSecondsRemaining !== null && restTimerSecondsRemaining > 0
                ? `${Math.floor(restTimerSecondsRemaining / 60)}:${(restTimerSecondsRemaining % 60).toString().padStart(2, '0')}`
                : 'Rest'}
            </span>
          </button>
        </div>
      </div>

      {/* Exercises List */}
      {workout.exercises.length === 0 ? (
        <div className="bg-[#12151e] border border-[#202636] rounded-3xl p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#181d28] border border-[#273042] flex items-center justify-center mx-auto mb-3 text-[#00f59b]">
            <Plus className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">No exercises added yet</h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-1 mb-5">
            Select exercises from the library or create a custom exercise to begin logging your sets.
          </p>
          <button
            type="button"
            onClick={() => setIsExerciseSelectorOpen(true)}
            className="h-12 px-6 rounded-2xl bg-[#00f59b] hover:bg-[#00e08f] text-black font-extrabold text-sm inline-flex items-center gap-2 shadow-lg shadow-[#00f59b]/25 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add First Exercise
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {workout.exercises.map((exItem, exIdx) => (
            <ExerciseCard
              key={exItem.id}
              exerciseItem={exItem}
              exerciseIndex={exIdx}
              totalExercises={workout.exercises.length}
              onUpdateSet={(setIdx, updated) => handleUpdateSet(exIdx, setIdx, updated)}
              onAddSet={() => handleAddSet(exIdx)}
              onDuplicateLastSet={() => handleDuplicateLastSet(exIdx)}
              onRemoveSet={(setIdx) => handleRemoveSet(exIdx, setIdx)}
              onToggleCompleteSet={(setIdx) => handleToggleComplete(exIdx, setIdx)}
              onMoveUp={() => handleMoveExercise(exIdx, exIdx - 1)}
              onMoveDown={() => handleMoveExercise(exIdx, exIdx + 1)}
              onRemoveExercise={() => handleRemoveExercise(exIdx)}
            />
          ))}

          {/* Add Another Exercise Button */}
          <button
            type="button"
            onClick={() => setIsExerciseSelectorOpen(true)}
            className="w-full h-13 rounded-2xl bg-[#141822] hover:bg-[#1a202d] border border-dashed border-[#2b3447] text-zinc-200 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4 text-[#00f59b]" />
            Add Exercise
          </button>
        </div>
      )}

      {/* Fixed Sticky Action Bar at the Bottom for mobile gym reach zone */}
      <div className="fixed bottom-16 left-0 right-0 z-30 p-3 bg-gradient-to-t from-[#0b0d11] via-[#0b0d11]/95 to-transparent backdrop-blur-sm">
        <div className="max-w-md mx-auto flex items-center gap-2">
          {/* Cancel Workout Button */}
          <button
            type="button"
            onClick={() => {
              if (confirm('Cancel and discard this active workout?')) {
                onCancelWorkout();
              }
            }}
            className="h-12 px-4 rounded-2xl bg-[#1b202c] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-[#2b3346] transition-colors"
            title="Discard workout"
          >
            <X className="w-4 h-4" />
            <span className="hidden xs:inline">Cancel</span>
          </button>

          {/* Finish Workout CTA */}
          <button
            type="button"
            onClick={handleFinish}
            className="flex-1 h-12 rounded-2xl bg-[#00f59b] hover:bg-[#00e08f] text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(0,245,155,0.4)] transition-all active:scale-[0.98]"
          >
            <CheckCircle className="w-5 h-5 stroke-[2.5]" />
            <span>Finish Workout</span>
          </button>
        </div>
      </div>

      {/* Exercise Selector Modal */}
      <ExerciseSelectorModal
        isOpen={isExerciseSelectorOpen}
        onClose={() => setIsExerciseSelectorOpen(false)}
        exercises={availableExercises}
        onSelectExercise={handleSelectExercise}
        onAddCustomExercise={onAddCustomExercise}
        selectedExerciseIds={workout.exercises.map((e) => e.exercise.id)}
      />
    </div>
  );
};
