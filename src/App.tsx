/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  CompletedWorkoutDetail,
  ActiveWorkoutState,
  Exercise,
  WorkoutTemplate,
  PersonalRecord,
  ActiveExerciseItem,
} from './types/database';
import { workoutService } from './services/workoutService';
import { getSupabaseClient } from './lib/supabase';
import { TopHeader } from './components/TopHeader';
import { BottomNavigation, NavTab } from './components/BottomNavigation';
import { DashboardView } from './views/DashboardView';
import { ActiveWorkoutView } from './views/ActiveWorkoutView';
import { HistoryView } from './views/HistoryView';
import { ProgressView } from './views/ProgressView';
import { TemplatesView } from './views/TemplatesView';
import { RestTimerModal } from './components/RestTimerModal';
import { WorkoutCompleteModal } from './components/WorkoutCompleteModal';
import { WorkoutDetailModal } from './components/WorkoutDetailModal';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Core Data States
  const [workouts, setWorkouts] = useState<CompletedWorkoutDetail[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active In-Progress Workout State
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(null);

  // Rest Timer State
  const [isRestTimerModalOpen, setIsRestTimerModalOpen] = useState(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState(90);
  const [restTimerTotalSeconds, setRestTimerTotalSeconds] = useState(90);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Modals
  const [selectedWorkoutDetail, setSelectedWorkoutDetail] = useState<CompletedWorkoutDetail | null>(null);
  const [isWorkoutCompleteModalOpen, setIsWorkoutCompleteModalOpen] = useState(false);
  const [lastFinishedWorkout, setLastFinishedWorkout] = useState<CompletedWorkoutDetail | null>(null);
  const [newlyAchievedPRs, setNewlyAchievedPRs] = useState<PersonalRecord[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Initial Load
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [fetchedExercises, fetchedTemplates, fetchedWorkouts] = await Promise.all([
        workoutService.getExercises(),
        workoutService.getTemplates(),
        workoutService.getWorkouts(),
      ]);

      setExercises(fetchedExercises);
      setTemplates(fetchedTemplates);
      setWorkouts(fetchedWorkouts);

      // Compute PRs
      const prs = workoutService.calculatePersonalRecords(fetchedWorkouts);
      setPersonalRecords(prs);

      // Restore active workout if any
      const restored = workoutService.getActiveWorkout();
      if (restored) {
        setActiveWorkout(restored);
      }

      // Check Supabase connection
      const client = getSupabaseClient();
      setIsSupabaseConnected(Boolean(client));
    } catch (err) {
      console.error('Failed to load GymTrack data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Rest Timer Countdown Worker
  useEffect(() => {
    if (isRestTimerActive) {
      restIntervalRef.current = setInterval(() => {
        setRestTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsRestTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    }

    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [isRestTimerActive]);

  const handleStartRestTimer = (seconds: number = 90) => {
    setRestTimerTotalSeconds(seconds);
    setRestTimerSeconds(seconds);
    setIsRestTimerActive(true);
    setIsRestTimerModalOpen(true);
  };

  const handleStopRestTimer = () => {
    setIsRestTimerActive(false);
    setRestTimerSeconds(0);
  };

  const handleTogglePauseRestTimer = () => {
    setIsRestTimerActive((prev) => !prev);
  };

  const handleAdjustRestTimer = (delta: number) => {
    setRestTimerSeconds((prev) => Math.max(0, prev + delta));
  };

  // Workout Creation Handlers
  const handleStartBlankWorkout = () => {
    const newActive: ActiveWorkoutState = {
      id: `wo-${Date.now()}`,
      name: 'Afternoon Workout',
      started_at: new Date().toISOString(),
      exercises: [],
    };

    setActiveWorkout(newActive);
    workoutService.saveActiveWorkout(newActive);
    setActiveTab('workout');
  };

  const handleStartFromTemplate = (template: WorkoutTemplate) => {
    const exMap = new Map(exercises.map((e) => [e.id, e]));

    const templateExercises: ActiveExerciseItem[] = (template.exercise_ids || [])
      .map((exId, idx) => {
        const ex = exMap.get(exId);
        if (!ex) return null;

        const prev = workoutService.getPreviousPerformance(ex.id, workouts);
        const defaultWeight = prev?.sets[0]?.weight ?? 20;
        const defaultReps = prev?.sets[0]?.reps ?? 10;

        return {
          id: `we-${Date.now()}-${idx}`,
          exercise: ex,
          order_index: idx,
          previousSetsSummary: prev?.summary,
          sets: [
            {
              id: `set-${Date.now()}-${idx}-1`,
              set_number: 1,
              weight: defaultWeight,
              reps: defaultReps,
              completed: false,
              previousWeight: prev?.sets[0]?.weight,
              previousReps: prev?.sets[0]?.reps,
            },
          ],
        };
      })
      .filter(Boolean) as ActiveExerciseItem[];

    const newActive: ActiveWorkoutState = {
      id: `wo-${Date.now()}`,
      name: template.name,
      started_at: new Date().toISOString(),
      templateId: template.id,
      exercises: templateExercises,
    };

    setActiveWorkout(newActive);
    workoutService.saveActiveWorkout(newActive);
    setActiveTab('workout');
  };

  const handleRepeatWorkout = (pastWorkout: CompletedWorkoutDetail) => {
    const exercisesForNew: ActiveExerciseItem[] = pastWorkout.exercises.map((item, idx) => {
      const prev = workoutService.getPreviousPerformance(item.exercise.id, workouts);

      return {
        id: `we-${Date.now()}-${idx}`,
        exercise: item.exercise,
        order_index: idx,
        previousSetsSummary: prev?.summary,
        sets: item.sets.map((s, sIdx) => ({
          id: `set-${Date.now()}-${idx}-${sIdx + 1}`,
          set_number: sIdx + 1,
          weight: s.weight,
          reps: s.reps,
          completed: false,
          previousWeight: s.weight,
          previousReps: s.reps,
        })),
      };
    });

    const newActive: ActiveWorkoutState = {
      id: `wo-${Date.now()}`,
      name: pastWorkout.name,
      started_at: new Date().toISOString(),
      exercises: exercisesForNew,
    };

    setActiveWorkout(newActive);
    workoutService.saveActiveWorkout(newActive);
    setActiveTab('workout');
  };

  const handleUpdateActiveWorkout = (updated: ActiveWorkoutState) => {
    setActiveWorkout(updated);
    workoutService.saveActiveWorkout(updated);
  };

  const handleCancelWorkout = () => {
    setActiveWorkout(null);
    workoutService.saveActiveWorkout(null);
    setActiveTab('home');
  };

  const handleFinishWorkout = async (
    completed: CompletedWorkoutDetail,
    prsAchieved: PersonalRecord[]
  ) => {
    // 1. Save completed workout
    await workoutService.saveWorkout(completed);

    // 2. Clear in-progress active workout
    setActiveWorkout(null);
    workoutService.saveActiveWorkout(null);

    // 3. Refresh list & PRs
    const updatedWorkouts = await workoutService.getWorkouts();
    setWorkouts(updatedWorkouts);
    const updatedPRs = workoutService.calculatePersonalRecords(updatedWorkouts);
    setPersonalRecords(updatedPRs);

    // 4. Open completion modal with celebration
    setLastFinishedWorkout(completed);
    setNewlyAchievedPRs(prsAchieved);
    setIsWorkoutCompleteModalOpen(true);
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    await workoutService.deleteWorkout(workoutId);
    const updatedWorkouts = await workoutService.getWorkouts();
    setWorkouts(updatedWorkouts);
    setPersonalRecords(workoutService.calculatePersonalRecords(updatedWorkouts));
  };

  const handleAddCustomExercise = async (exercise: Omit<Exercise, 'id'>) => {
    const created = await workoutService.addCustomExercise(exercise);
    const all = await workoutService.getExercises();
    setExercises(all);
    return created;
  };

  const handleCreateTemplate = async (name: string, exerciseIds: string[]) => {
    await workoutService.createTemplate(name, exerciseIds);
    const tmpls = await workoutService.getTemplates();
    setTemplates(tmpls);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    await workoutService.deleteTemplate(templateId);
    const tmpls = await workoutService.getTemplates();
    setTemplates(tmpls);
  };

  const handleResetData = () => {
    localStorage.clear();
    workoutService.saveActiveWorkout(null);
    setActiveWorkout(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#0b0d11] text-zinc-100 flex flex-col font-sans selection:bg-[#00f59b] selection:text-black">
      {/* 3-Zone Top Navigation Header */}
      <TopHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
        restTimerSecondsRemaining={isRestTimerActive ? restTimerSeconds : null}
        onOpenRestTimer={() => setIsRestTimerModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-4 pb-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-[#00f59b]/20 border-t-[#00f59b] rounded-full animate-spin mb-4" />
            <span className="text-sm font-semibold text-zinc-400">Loading GymTrack...</span>
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <DashboardView
                workouts={workouts}
                activeWorkout={activeWorkout}
                templates={templates}
                personalRecords={personalRecords}
                onStartBlankWorkout={handleStartBlankWorkout}
                onResumeActiveWorkout={() => setActiveTab('workout')}
                onStartFromTemplate={handleStartFromTemplate}
                onSelectWorkoutDetail={setSelectedWorkoutDetail}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'workout' && (
              activeWorkout ? (
                <ActiveWorkoutView
                  workout={activeWorkout}
                  onUpdateWorkout={handleUpdateActiveWorkout}
                  onFinishWorkout={handleFinishWorkout}
                  onCancelWorkout={handleCancelWorkout}
                  onTriggerRestTimer={handleStartRestTimer}
                  availableExercises={exercises}
                  onAddCustomExercise={handleAddCustomExercise}
                  allCompletedWorkouts={workouts}
                  isRestTimerActive={isRestTimerActive}
                  restTimerSecondsRemaining={restTimerSeconds}
                  onOpenRestTimerModal={() => setIsRestTimerModalOpen(true)}
                />
              ) : (
                <div className="bg-[#12151e] border border-[#202636] rounded-3xl p-8 sm:p-12 text-center max-w-md mx-auto my-8">
                  <div className="w-16 h-16 rounded-2xl bg-[#00f59b]/15 text-[#00f59b] flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🏋️</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    No active workout
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1 mb-6">
                    Start a fresh empty workout or launch from one of your saved templates.
                  </p>
                  <div className="space-y-2.5">
                    <button
                      onClick={handleStartBlankWorkout}
                      className="w-full h-12 rounded-2xl bg-[#00f59b] hover:bg-[#00e08f] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00f59b]/25 transition-all"
                    >
                      Start Empty Workout
                    </button>
                    <button
                      onClick={() => setActiveTab('templates')}
                      className="w-full h-12 rounded-2xl bg-[#171c26] hover:bg-[#202737] border border-[#273042] text-zinc-200 font-bold text-xs flex items-center justify-center transition-colors"
                    >
                      Browse Workout Templates
                    </button>
                  </div>
                </div>
              )
            )}

            {activeTab === 'history' && (
              <HistoryView
                workouts={workouts}
                onSelectWorkout={setSelectedWorkoutDetail}
                onStartNewWorkout={handleStartBlankWorkout}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressView
                workouts={workouts}
                exercises={exercises}
                personalRecords={personalRecords}
              />
            )}

            {activeTab === 'templates' && (
              <TemplatesView
                templates={templates}
                exercises={exercises}
                onStartFromTemplate={handleStartFromTemplate}
                onCreateTemplate={handleCreateTemplate}
                onDeleteTemplate={handleDeleteTemplate}
                onAddCustomExercise={handleAddCustomExercise}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasActiveWorkout={Boolean(activeWorkout)}
      />

      {/* Rest Timer Modal */}
      <RestTimerModal
        isOpen={isRestTimerModalOpen}
        onClose={() => setIsRestTimerModalOpen(false)}
        secondsRemaining={restTimerSeconds}
        totalSeconds={restTimerTotalSeconds}
        isActive={isRestTimerActive}
        onStart={handleStartRestTimer}
        onStop={handleStopRestTimer}
        onTogglePause={handleTogglePauseRestTimer}
        onAdjustSeconds={handleAdjustRestTimer}
      />

      {/* Workout Complete Summary Modal */}
      <WorkoutCompleteModal
        isOpen={isWorkoutCompleteModalOpen}
        workout={lastFinishedWorkout}
        newPRs={newlyAchievedPRs}
        onDone={() => {
          setIsWorkoutCompleteModalOpen(false);
          setActiveTab('home');
        }}
      />

      {/* Past Workout Details Modal */}
      <WorkoutDetailModal
        workout={selectedWorkoutDetail}
        isOpen={Boolean(selectedWorkoutDetail)}
        onClose={() => setSelectedWorkoutDetail(null)}
        onRepeatWorkout={handleRepeatWorkout}
        onDeleteWorkout={handleDeleteWorkout}
      />

      {/* Supabase & Cloud Storage Settings Modal */}
      <SupabaseSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigChanged={loadAllData}
        onResetData={handleResetData}
      />
    </div>
  );
}
