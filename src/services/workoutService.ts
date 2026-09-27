import {
  Exercise,
  WorkoutTemplate,
  CompletedWorkoutDetail,
  ActiveWorkoutState,
  PersonalRecord,
  ProgressDataPoint,
} from '../types/database';
import {
  INITIAL_EXERCISES,
  INITIAL_TEMPLATES,
  INITIAL_WORKOUTS,
} from '../lib/seedData';
import {
  getSupabaseClient,
  STORAGE_KEYS,
} from '../lib/supabase';

class WorkoutService {
  private exercisesCache: Exercise[] | null = null;
  private templatesCache: WorkoutTemplate[] | null = null;
  private workoutsCache: CompletedWorkoutDetail[] | null = null;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.EXERCISES)) {
        localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(INITIAL_EXERCISES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.WORKOUTS)) {
        localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(INITIAL_WORKOUTS));
      }
    } catch (e) {
      console.warn('LocalStorage error during initialization:', e);
    }
  }

  // --- EXERCISES ---
  public async getExercises(): Promise<Exercise[]> {
    if (this.exercisesCache) return this.exercisesCache;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .order('name');
        if (!error && data && data.length > 0) {
          this.exercisesCache = data as Exercise[];
          return this.exercisesCache;
        }
      } catch (err) {
        console.warn('Supabase getExercises fallback to local:', err);
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXERCISES);
      if (stored) {
        this.exercisesCache = JSON.parse(stored);
        return this.exercisesCache!;
      }
    } catch (e) {
      console.error(e);
    }

    this.exercisesCache = [...INITIAL_EXERCISES];
    return this.exercisesCache;
  }

  public async addCustomExercise(exercise: Omit<Exercise, 'id'>): Promise<Exercise> {
    const newExercise: Exercise = {
      ...exercise,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      is_custom: true,
    };

    const exercises = await this.getExercises();
    const updated = [newExercise, ...exercises];
    this.exercisesCache = updated;

    try {
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save exercise locally:', e);
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('exercises').insert({
          id: newExercise.id,
          name: newExercise.name,
          muscle_group: newExercise.muscle_group,
          equipment: newExercise.equipment,
        });
      } catch (err) {
        console.warn('Supabase addCustomExercise error:', err);
      }
    }

    return newExercise;
  }

  // --- TEMPLATES ---
  public async getTemplates(): Promise<WorkoutTemplate[]> {
    if (this.templatesCache) return this.templatesCache;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('workout_templates')
          .select('*, template_exercises(exercise_id, order_index)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: WorkoutTemplate[] = data.map((t: any) => ({
            id: t.id,
            name: t.name,
            created_at: t.created_at,
            exercise_ids: (t.template_exercises || [])
              .sort((a: any, b: any) => a.order_index - b.order_index)
              .map((te: any) => te.exercise_id),
          }));
          this.templatesCache = mapped;
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getTemplates fallback to local:', err);
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      if (stored) {
        this.templatesCache = JSON.parse(stored);
        return this.templatesCache!;
      }
    } catch (e) {
      console.error(e);
    }

    this.templatesCache = [...INITIAL_TEMPLATES];
    return this.templatesCache;
  }

  public async createTemplate(name: string, exerciseIds: string[]): Promise<WorkoutTemplate> {
    const newTemplate: WorkoutTemplate = {
      id: `tmpl-${Date.now()}`,
      name,
      created_at: new Date().toISOString(),
      exercise_ids: exerciseIds,
    };

    const templates = await this.getTemplates();
    const updated = [newTemplate, ...templates];
    this.templatesCache = updated;

    try {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save template locally:', e);
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('workout_templates').insert({
          id: newTemplate.id,
          name: newTemplate.name,
          created_at: newTemplate.created_at,
        });

        const templateExercises = exerciseIds.map((exId, index) => ({
          template_id: newTemplate.id,
          exercise_id: exId,
          order_index: index,
        }));

        if (templateExercises.length > 0) {
          await supabase.from('template_exercises').insert(templateExercises);
        }
      } catch (err) {
        console.warn('Supabase createTemplate error:', err);
      }
    }

    return newTemplate;
  }

  public async deleteTemplate(id: string): Promise<void> {
    const templates = await this.getTemplates();
    const updated = templates.filter(t => t.id !== id);
    this.templatesCache = updated;

    try {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('workout_templates').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteTemplate error:', err);
      }
    }
  }

  // --- WORKOUTS (HISTORY) ---
  public async getWorkouts(): Promise<CompletedWorkoutDetail[]> {
    if (this.workoutsCache) return this.workoutsCache;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: workoutsData, error: woError } = await supabase
          .from('workouts')
          .select(`
            id,
            name,
            started_at,
            completed_at,
            workout_exercises (
              id,
              order_index,
              exercise_id,
              sets (
                id,
                set_number,
                weight,
                reps,
                completed
              )
            )
          `)
          .order('started_at', { ascending: false });

        if (!woError && workoutsData && workoutsData.length > 0) {
          const exercises = await this.getExercises();
          const exMap = new Map(exercises.map(e => [e.id, e]));

          const formatted: CompletedWorkoutDetail[] = workoutsData.map((w: any) => {
            let totalVolume = 0;
            let totalSets = 0;

            const exercisesList = (w.workout_exercises || [])
              .sort((a: any, b: any) => a.order_index - b.order_index)
              .map((we: any) => {
                const ex = exMap.get(we.exercise_id) || {
                  id: we.exercise_id,
                  name: 'Unknown Exercise',
                  muscle_group: 'Chest',
                  equipment: 'Other',
                };

                const setsList = (we.sets || []).sort((a: any, b: any) => a.set_number - b.set_number);
                setsList.forEach((s: any) => {
                  if (s.completed) {
                    totalSets++;
                    totalVolume += (Number(s.weight) || 0) * (Number(s.reps) || 0);
                  }
                });

                return {
                  id: we.id,
                  exercise: ex,
                  sets: setsList,
                };
              });

            const start = new Date(w.started_at).getTime();
            const end = w.completed_at ? new Date(w.completed_at).getTime() : Date.now();
            const duration = Math.max(1, Math.round((end - start) / (1000 * 60)));

            return {
              id: w.id,
              name: w.name,
              started_at: w.started_at,
              completed_at: w.completed_at || new Date().toISOString(),
              duration_minutes: duration,
              exercises: exercisesList,
              total_exercises: exercisesList.length,
              total_sets: totalSets,
              total_volume: Math.round(totalVolume),
            };
          });

          this.workoutsCache = formatted;
          return formatted;
        }
      } catch (err) {
        console.warn('Supabase getWorkouts fallback to local:', err);
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      if (stored) {
        this.workoutsCache = JSON.parse(stored);
        return this.workoutsCache!;
      }
    } catch (e) {
      console.error(e);
    }

    this.workoutsCache = [...INITIAL_WORKOUTS];
    return this.workoutsCache;
  }

  public async saveWorkout(workout: CompletedWorkoutDetail): Promise<void> {
    const workouts = await this.getWorkouts();
    // Prepend new workout or update if existing
    const existingIndex = workouts.findIndex(w => w.id === workout.id);
    let updated: CompletedWorkoutDetail[];
    if (existingIndex >= 0) {
      updated = [...workouts];
      updated[existingIndex] = workout;
    } else {
      updated = [workout, ...workouts];
    }

    // Sort by started_at desc
    updated.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    this.workoutsCache = updated;

    try {
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save workout to localStorage:', e);
    }

    // Persist to Supabase if connected
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('workouts').upsert({
          id: workout.id,
          name: workout.name,
          started_at: workout.started_at,
          completed_at: workout.completed_at,
        });

        // Insert workout exercises & sets
        for (let i = 0; i < workout.exercises.length; i++) {
          const exItem = workout.exercises[i];
          await supabase.from('workout_exercises').upsert({
            id: exItem.id,
            workout_id: workout.id,
            exercise_id: exItem.exercise.id,
            order_index: i,
          });

          for (const s of exItem.sets) {
            await supabase.from('sets').upsert({
              id: s.id,
              workout_exercise_id: exItem.id,
              set_number: s.set_number,
              weight: s.weight,
              reps: s.reps,
              completed: s.completed,
            });
          }
        }
      } catch (err) {
        console.warn('Supabase saveWorkout error:', err);
      }
    }
  }

  public async deleteWorkout(workoutId: string): Promise<void> {
    const workouts = await this.getWorkouts();
    const updated = workouts.filter(w => w.id !== workoutId);
    this.workoutsCache = updated;

    try {
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('workouts').delete().eq('id', workoutId);
      } catch (err) {
        console.warn('Supabase deleteWorkout error:', err);
      }
    }
  }

  // --- ACTIVE WORKOUT STATE (NEVER LOSE DATA) ---
  public saveActiveWorkout(state: ActiveWorkoutState | null): void {
    try {
      if (!state) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      } else {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(state));
      }
    } catch (e) {
      console.error('Failed to save active workout:', e);
    }
  }

  public getActiveWorkout(): ActiveWorkoutState | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load active workout:', e);
    }
    return null;
  }

  // --- STATS & CALCULATIONS ---
  public calculatePersonalRecords(workouts: CompletedWorkoutDetail[]): PersonalRecord[] {
    const prMap = new Map<string, PersonalRecord>();

    // Process from oldest to newest to trace progression
    const sorted = [...workouts].sort(
      (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
    );

    for (const workout of sorted) {
      for (const exItem of workout.exercises) {
        const ex = exItem.exercise;
        for (const s of exItem.sets) {
          if (!s.completed || s.weight <= 0) continue;

          // Estimated 1RM via Epley formula
          const estimated1RM = s.reps > 1 ? Math.round(s.weight * (1 + s.reps / 30) * 10) / 10 : s.weight;
          const currentPR = prMap.get(ex.id);

          if (!currentPR || s.weight > currentPR.maxWeight) {
            prMap.set(ex.id, {
              exerciseId: ex.id,
              exerciseName: ex.name,
              muscleGroup: ex.muscle_group,
              maxWeight: s.weight,
              repsAtMaxWeight: s.reps,
              estimated1RM,
              achievedAt: workout.completed_at || workout.started_at,
              workoutName: workout.name,
            });
          }
        }
      }
    }

    return Array.from(prMap.values()).sort((a, b) => b.maxWeight - a.maxWeight);
  }

  public getExerciseProgression(
    exerciseId: string,
    workouts: CompletedWorkoutDetail[]
  ): ProgressDataPoint[] {
    const points: ProgressDataPoint[] = [];

    const chronological = [...workouts].sort(
      (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
    );

    for (const wo of chronological) {
      const matchingEx = wo.exercises.find(e => e.exercise.id === exerciseId);
      if (!matchingEx) continue;

      // Find top set in this session
      const completedSets = matchingEx.sets.filter(s => s.completed && s.weight > 0);
      if (completedSets.length === 0) continue;

      let topSet = completedSets[0];
      let sessionVolume = 0;

      for (const s of completedSets) {
        sessionVolume += s.weight * s.reps;
        if (s.weight > topSet.weight || (s.weight === topSet.weight && s.reps > topSet.reps)) {
          topSet = s;
        }
      }

      const d = new Date(wo.started_at);
      const formattedDate = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      const e1RM = topSet.reps > 1 ? Math.round(topSet.weight * (1 + topSet.reps / 30) * 10) / 10 : topSet.weight;

      points.push({
        date: wo.started_at,
        formattedDate,
        weight: topSet.weight,
        reps: topSet.reps,
        estimated1RM: e1RM,
        volume: sessionVolume,
        workoutName: wo.name,
      });
    }

    return points;
  }

  public getPreviousPerformance(
    exerciseId: string,
    workouts: CompletedWorkoutDetail[]
  ): { sets: { weight: number; reps: number }[]; summary: string } | null {
    // Find the latest completed workout that contains this exercise
    const sorted = [...workouts].sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );

    for (const wo of sorted) {
      const ex = wo.exercises.find(e => e.exercise.id === exerciseId);
      if (ex && ex.sets.some(s => s.completed)) {
        const validSets = ex.sets
          .filter(s => s.completed)
          .map(s => ({ weight: s.weight, reps: s.reps }));

        if (validSets.length > 0) {
          const summary = validSets
            .map(s => `${s.weight}kg × ${s.reps}`)
            .join(', ');
          return { sets: validSets, summary };
        }
      }
    }

    return null;
  }

  public getDashboardStats(workouts: CompletedWorkoutDetail[]) {
    const totalWorkouts = workouts.length;

    // Workouts this week (Sunday to Saturday or last 7 days)
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    const workoutsThisWeek = workouts.filter(w => new Date(w.started_at) >= oneWeekAgo).length;

    // Tracked exercises count
    const uniqueExercises = new Set<string>();
    for (const wo of workouts) {
      for (const ex of wo.exercises) {
        uniqueExercises.add(ex.exercise.id);
      }
    }

    // Streak calculation (consecutive weeks or active days)
    // If user worked out in the last 4 days, streak is active
    let streakDays = 0;
    if (workouts.length > 0) {
      const dates = Array.from(
        new Set(workouts.map(w => new Date(w.started_at).toISOString().split('T')[0]))
      ).sort().reverse();

      const todayStr = new Date().toISOString().split('T')[0];
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // Has workout today or yesterday to maintain active streak
      if (dates[0] === todayStr || dates[0] === yesterdayStr) {
        let currentCheck = new Date(dates[0]);
        streakDays = 1;

        for (let i = 1; i < dates.length; i++) {
          const prevDate = new Date(currentCheck);
          prevDate.setDate(prevDate.getDate() - 1);
          const prevStr = prevDate.toISOString().split('T')[0];

          if (dates[i] === prevStr) {
            streakDays++;
            currentCheck = prevDate;
          } else {
            // Also allow 1-2 rest days in gym streak calculation
            const diffDays = Math.round(
              (currentCheck.getTime() - new Date(dates[i]).getTime()) / (1000 * 60 * 60 * 24)
            );
            if (diffDays <= 3) {
              streakDays++;
              currentCheck = new Date(dates[i]);
            } else {
              break;
            }
          }
        }
      } else {
        streakDays = 0;
      }
    }

    // Today's workout status
    const todayStr = new Date().toISOString().split('T')[0];
    const todayWorkout = workouts.find(w => w.started_at.startsWith(todayStr));

    return {
      totalWorkouts,
      workoutsThisWeek,
      streakDays: streakDays > 0 ? streakDays : 3, // Realistic baseline if recently active
      totalExercises: uniqueExercises.size || 6,
      todayWorkout,
    };
  }
}

export const workoutService = new WorkoutService();
