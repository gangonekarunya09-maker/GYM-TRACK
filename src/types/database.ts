export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Legs'
  | 'Abs'
  | 'Forearms';

export type Equipment =
  | 'Barbell'
  | 'Dumbbell'
  | 'Cable'
  | 'Machine'
  | 'Bodyweight'
  | 'Other';

export interface Profile {
  id: string;
  name: string;
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscle_group: MuscleGroup;
  equipment: Equipment;
  is_custom?: boolean;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  created_at: string;
  exercise_ids?: string[];
}

export interface TemplateExercise {
  id: string;
  template_id: string;
  exercise_id: string;
  order_index: number;
}

export interface Workout {
  id: string;
  name: string;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
}

export interface WorkoutSet {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  weight: number;
  reps: number;
  completed: boolean;
}

// Active workout models for high-performance mobile tracking
export interface ActiveSet {
  id: string;
  set_number: number;
  weight: number;
  reps: number;
  completed: boolean;
  previousWeight?: number;
  previousReps?: number;
}

export interface ActiveExerciseItem {
  id: string; // workout_exercise_id
  exercise: Exercise;
  order_index: number;
  sets: ActiveSet[];
  previousSetsSummary?: string;
}

export interface ActiveWorkoutState {
  id: string;
  name: string;
  started_at: string;
  exercises: ActiveExerciseItem[];
  templateId?: string;
}

// Completed workout with full tree representation for views
export interface CompletedWorkoutDetail {
  id: string;
  name: string;
  started_at: string;
  completed_at: string;
  duration_minutes: number;
  exercises: {
    id: string;
    exercise: Exercise;
    sets: WorkoutSet[];
  }[];
  total_sets: number;
  total_volume: number;
  total_exercises: number;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  maxWeight: number;
  repsAtMaxWeight: number;
  estimated1RM: number;
  achievedAt: string;
  workoutName: string;
}

export interface ProgressDataPoint {
  date: string;
  formattedDate: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  volume: number;
  workoutName: string;
}
