import { Exercise, WorkoutTemplate, CompletedWorkoutDetail } from '../types/database';

export const INITIAL_EXERCISES: Exercise[] = [
  // Chest
  { id: 'ex-bench-press', name: 'Bench Press', muscle_group: 'Chest', equipment: 'Barbell' },
  { id: 'ex-incline-bench', name: 'Incline Bench Press', muscle_group: 'Chest', equipment: 'Barbell' },
  { id: 'ex-db-bench', name: 'Dumbbell Bench Press', muscle_group: 'Chest', equipment: 'Dumbbell' },
  { id: 'ex-incline-db-bench', name: 'Incline Dumbbell Press', muscle_group: 'Chest', equipment: 'Dumbbell' },
  { id: 'ex-cable-fly', name: 'Cable Fly', muscle_group: 'Chest', equipment: 'Cable' },
  { id: 'ex-pec-deck', name: 'Pec Deck', muscle_group: 'Chest', equipment: 'Machine' },
  { id: 'ex-dips-chest', name: 'Chest Dips', muscle_group: 'Chest', equipment: 'Bodyweight' },
  { id: 'ex-pushups', name: 'Push Ups', muscle_group: 'Chest', equipment: 'Bodyweight' },

  // Back
  { id: 'ex-lat-pulldown', name: 'Lat Pulldown', muscle_group: 'Back', equipment: 'Cable' },
  { id: 'ex-pullups', name: 'Pull Ups', muscle_group: 'Back', equipment: 'Bodyweight' },
  { id: 'ex-barbell-row', name: 'Barbell Row', muscle_group: 'Back', equipment: 'Barbell' },
  { id: 'ex-cable-row', name: 'Seated Cable Row', muscle_group: 'Back', equipment: 'Cable' },
  { id: 'ex-t-bar-row', name: 'T-Bar Row', muscle_group: 'Back', equipment: 'Machine' },
  { id: 'ex-deadlift', name: 'Deadlift', muscle_group: 'Back', equipment: 'Barbell' },
  { id: 'ex-single-arm-db-row', name: 'Single Arm Dumbbell Row', muscle_group: 'Back', equipment: 'Dumbbell' },

  // Shoulders
  { id: 'ex-ohp', name: 'Overhead Press', muscle_group: 'Shoulders', equipment: 'Barbell' },
  { id: 'ex-db-shoulder-press', name: 'Dumbbell Shoulder Press', muscle_group: 'Shoulders', equipment: 'Dumbbell' },
  { id: 'ex-lateral-raise', name: 'Lateral Raise', muscle_group: 'Shoulders', equipment: 'Dumbbell' },
  { id: 'ex-front-raise', name: 'Front Raise', muscle_group: 'Shoulders', equipment: 'Dumbbell' },
  { id: 'ex-rear-delt-fly', name: 'Rear Delt Fly', muscle_group: 'Shoulders', equipment: 'Dumbbell' },
  { id: 'ex-face-pull', name: 'Face Pull', muscle_group: 'Shoulders', equipment: 'Cable' },
  { id: 'ex-arnold-press', name: 'Arnold Press', muscle_group: 'Shoulders', equipment: 'Dumbbell' },

  // Biceps
  { id: 'ex-barbell-curl', name: 'Barbell Curl', muscle_group: 'Biceps', equipment: 'Barbell' },
  { id: 'ex-db-curl', name: 'Dumbbell Curl', muscle_group: 'Biceps', equipment: 'Dumbbell' },
  { id: 'ex-hammer-curl', name: 'Hammer Curl', muscle_group: 'Biceps', equipment: 'Dumbbell' },
  { id: 'ex-preacher-curl', name: 'Preacher Curl', muscle_group: 'Biceps', equipment: 'Machine' },
  { id: 'ex-cable-curl', name: 'Cable Bicep Curl', muscle_group: 'Biceps', equipment: 'Cable' },

  // Triceps
  { id: 'ex-tricep-pushdown', name: 'Tricep Pushdown', muscle_group: 'Triceps', equipment: 'Cable' },
  { id: 'ex-skull-crushers', name: 'Skull Crushers', muscle_group: 'Triceps', equipment: 'Barbell' },
  { id: 'ex-overhead-tricep-ext', name: 'Overhead Cable Tricep Extension', muscle_group: 'Cable' as any, equipment: 'Cable' },
  { id: 'ex-tricep-dips', name: 'Tricep Dips', muscle_group: 'Triceps', equipment: 'Bodyweight' },
  { id: 'ex-close-grip-bench', name: 'Close-Grip Bench Press', muscle_group: 'Triceps', equipment: 'Barbell' },

  // Legs
  { id: 'ex-squat', name: 'Squat', muscle_group: 'Legs', equipment: 'Barbell' },
  { id: 'ex-leg-press', name: 'Leg Press', muscle_group: 'Legs', equipment: 'Machine' },
  { id: 'ex-rdl', name: 'Romanian Deadlift', muscle_group: 'Legs', equipment: 'Barbell' },
  { id: 'ex-leg-extension', name: 'Leg Extension', muscle_group: 'Legs', equipment: 'Machine' },
  { id: 'ex-leg-curl', name: 'Leg Curl', muscle_group: 'Legs', equipment: 'Machine' },
  { id: 'ex-calf-raise', name: 'Calf Raise', muscle_group: 'Legs', equipment: 'Machine' },
  { id: 'ex-lunges', name: 'Walking Lunges', muscle_group: 'Legs', equipment: 'Dumbbell' },

  // Abs
  { id: 'ex-hanging-leg-raise', name: 'Hanging Leg Raise', muscle_group: 'Abs', equipment: 'Bodyweight' },
  { id: 'ex-cable-crunch', name: 'Cable Crunch', muscle_group: 'Abs', equipment: 'Cable' },
  { id: 'ex-plank', name: 'Plank', muscle_group: 'Abs', equipment: 'Bodyweight' },
  { id: 'ex-ab-wheel', name: 'Ab Wheel Rollout', muscle_group: 'Abs', equipment: 'Other' },

  // Forearms
  { id: 'ex-wrist-curl', name: 'Wrist Curl', muscle_group: 'Forearms', equipment: 'Barbell' },
  { id: 'ex-reverse-wrist-curl', name: 'Reverse Wrist Curl', muscle_group: 'Forearms', equipment: 'Barbell' },
  { id: 'ex-farmer-walk', name: "Farmer's Walk", muscle_group: 'Forearms', equipment: 'Dumbbell' },
];

// Ensure correct muscle groups
INITIAL_EXERCISES.forEach(e => {
  if (e.id === 'ex-overhead-tricep-ext') {
    e.muscle_group = 'Triceps';
  }
});

export const INITIAL_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'tmpl-push',
    name: 'Push',
    created_at: '2026-09-01T08:00:00.000Z',
    exercise_ids: ['ex-bench-press', 'ex-incline-db-bench', 'ex-lateral-raise', 'ex-tricep-pushdown'],
  },
  {
    id: 'tmpl-pull',
    name: 'Pull',
    created_at: '2026-09-01T08:00:00.000Z',
    exercise_ids: ['ex-lat-pulldown', 'ex-cable-row', 'ex-face-pull', 'ex-db-curl'],
  },
  {
    id: 'tmpl-legs',
    name: 'Legs',
    created_at: '2026-09-01T08:00:00.000Z',
    exercise_ids: ['ex-squat', 'ex-leg-press', 'ex-leg-extension', 'ex-leg-curl', 'ex-calf-raise'],
  },
  {
    id: 'tmpl-chest-triceps',
    name: 'Chest & Triceps',
    created_at: '2026-09-01T08:00:00.000Z',
    exercise_ids: ['ex-bench-press', 'ex-incline-db-bench', 'ex-cable-fly', 'ex-tricep-pushdown'],
  },
  {
    id: 'tmpl-back-biceps',
    name: 'Back & Biceps',
    created_at: '2026-09-01T08:00:00.000Z',
    exercise_ids: ['ex-lat-pulldown', 'ex-pullups', 'ex-barbell-row', 'ex-barbell-curl', 'ex-hammer-curl'],
  },
];

// Seed realistic workout history so charts, streak, and PRs are demonstrated immediately
export const INITIAL_WORKOUTS: CompletedWorkoutDetail[] = [
  {
    id: 'wo-1',
    name: 'Chest & Triceps',
    started_at: '2026-09-25T17:15:00.000Z',
    completed_at: '2026-09-25T18:10:00.000Z',
    duration_minutes: 55,
    total_exercises: 4,
    total_sets: 13,
    total_volume: 7280,
    exercises: [
      {
        id: 'we-1-1',
        exercise: INITIAL_EXERCISES.find(e => e.id === 'ex-bench-press')!,
        sets: [
          { id: 's-1-1', workout_exercise_id: 'we-1-1', set_number: 1, weight: 65, reps: 8, completed: true },
          { id: 's-1-2', workout_exercise_id: 'we-1-1', set_number: 2, weight: 67.5, reps: 8, completed: true },
          { id: 's-1-3', workout_exercise_id: 'we-1-1', set_number: 3, weight: 70, reps: 6, completed: true },
        ],
      },
      {
        id: 'we-1-2',
        exercise: INITIAL_EXERCISES.find(e => e.id === 'ex-incline-db-bench')!,
        sets: [
          { id: 's-1-4', workout_exercise_id: 'we-1-2', set_number: 1, weight: 22, reps: 10, completed: true },
          { id: 's-1-5', workout_exercise_id: 'we-1-2', set_number: 2, weight: 22, reps: 10, completed: true },
          { id: 's-1-6', workout_exercise_id: 'we-1-2', set_number: 3, weight: 24, reps: 8, completed: true },
        ],
      },
      {
        id: 'we-1-3',
        exercise: INITIAL_EXERCISES.find(e => e.id === 'ex-cable-fly')!,
        sets: [
          { id: 's-1-7', workout_exercise_id: 'we-1-3', set_number: 1, weight: 15, reps: 12, completed: true },
          { id: 's-1-8', workout_exercise_id: 'we-1-3', set_number: 2, weight: 17.5, reps: 10, completed: true },
          { id: 's-1-9', workout_exercise_id: 'we-1-3', set_number: 3, weight: 17.5, reps: 10, completed: true },
        ],
      },
      {
        id: 'we-1-4',
        exercise: INITIAL_EXERCISES.find(e => e.id === 'ex-tricep-pushdown')!,
        sets: [
          { id: 's-1-10', workout_exercise_id: 'we-1-4', set_number: 1, weight: 27.5, reps: 12, completed: true },
          { id: 's-1-11', workout_exercise_id: 'we-1-4', set_number: 2, weight: 30, reps: 10, completed: true },
          { id: 's-1-12', workout_exercise_id: 'we-1-4', set_number: 3, weight: 32.5, reps: 8, completed: true },
          { id: 's-1-13', workout_exercise_id: 'we-1-4', set_number: 4, weight: 32.5, reps: 8, completed: true },
        ],
      },
    ],
  },
  {
    id: 'wo-2',
    name: 'Back & Biceps',
    started_at: '2026-09-23T16:30:00.000Z',
    completed_at: '2026-09-23T17:22:00.000Z',
    duration_minutes: 52,
    total_exercises: 4,
    total_sets: 12,
    total_volume: 8140,
    exercises: [
      {
        id: 'we-2-1',
        exercise: INITIAL_EXERCISES.find(e => e.id === 'ex-deadlift')!,
        sets: [
          { id: 's-2-1', workout_exercise_id: 'we-2-1', set_number: 1, weight: 100, reps: 6, completed: true },
          { id: 's-2-2', workout_exercise_id: 'we-2-1', set_number: 2, weight: 110, reps: 5, completed: true },
          { id: 's-2-3', workout_exercise_id: 'we-2-1', set_number: 3, weight: 120, reps: 5, completed: true },
        ],
      },
      {
        id: 'we-2-2',
        exercise: INITIAL_EXERCISES.find(e => e.id === 'ex-lat-pulldown')!,
        sets: [
          { id: 's-2-4', workout_exercise_id: 'we-2-2', set_number: 1, weight: 65, reps: 10, completed: true },
          { id: 's-2-5', workout_exercise_id: 'we-2-2', set_number: 2, weight: 70, reps: 8, completed: true },
          { id: 's-2-6', workout_exercise_id: 'we-2-2', set_number: 3, weight: 75, reps: 8, completed: true },
        ],
      },
      {
        id: 'we-2-3',
        exercise: INITIAL_EXERCISES.find(e => e.id === 'ex-cable-row')!,
        sets: [
          { id: 's-2-7', workout_exercise_id: 'we-2-3', set_number: 1, weight: 60, reps: 10, completed: true },
          { id: 's-2-8', workout_exercise_id: 'we-2-3', set_number: 2, weight: 65, reps: 8, completed: true },
          { id: 's-2-9', workout_exercise_id: 'we-2-3', set_number: 3, weight: 65, reps: 8, completed: true },
        ],
      },
      {
        id: 'we-2-4',
        exercise: INITIAL_EXERCISES.find(e => e.id === 'ex-barbell-curl')!,
        sets: [
          { id: 's-2-10', workout_exercise_id: 'we-2-4', set_number: 1, weight: 30, reps: 10, completed: true },
          { id: 's-2-11', workout_exercise_id: 'we-2-4', set_number: 2, weight: 32.5, reps: 8, completed: true },
          { id: 's-2-12', workout_exercise_id: 'we-2-4', set_number: 3, weight: 35, reps: 6, completed: true },
        ],
      },
    ],
  },
  {
    id: 'wo-3',
    name: 'Leg Day',
    started_at: '2026-09-20T10:00:00.000Z',
    completed_at: '2026-09-20T11:00:00.000Z',
    duration_minutes: 60,
    total_exercises: 4,
    total_sets: 13,
    total_volume: 9800,
    exercises: [
      {
        id: 'we-3-1',
        exercise: INITIAL_EXERCISES.find(e => e.id === 'ex-squat')!,
        sets: [
          { id: 's-3-1', workout_exercise_id: 'we-3-1', set_number: 1, weight: 85, reps: 8, completed: true },
          { id: 's-3-2', workout_exercise_id: 'we-3-1', set_number: 2, weight: 95, reps: 6, completed: true },
          { id: 's-3-3', workout_exercise_id: 'we-3-1', set_number: 3, weight: 100, reps: 5, completed: true },
        ],
      },
      {
        id: 'we-3-2',
        exercise: INITIAL_EXERCISES.find(e => e.id === 'ex-leg-press')!,
        sets: [
          { id: 's-3-4', workout_exercise_id: 'we-3-2', set_number: 1, weight: 140, reps: 10, completed: true },
          { id: 's-3-5', workout_exercise_id: 'we-3-2', set_number: 2, weight: 160, reps: 10, completed: true },
          { id: 's-3-6', workout_exercise_id: 'we-3-2', set_number: 3, weight: 180, reps: 8, completed: true },
        ],
      },
      {
        id: 'we-3-3',
        exercise: INITIAL_EXERCISES.find(e => e.id === 'ex-leg-extension')!,
        sets: [
          { id: 's-3-7', workout_exercise_id: 'we-3-3', set_number: 1, weight: 50, reps: 12, completed: true },
          { id: 's-3-8', workout_exercise_id: 'we-3-3', set_number: 2, weight: 55, reps: 10, completed: true },
          { id: 's-3-9', workout_exercise_id: 'we-3-3', set_number: 3, weight: 60, reps: 10, completed: true },
        ],
      },
      {
        id: 'we-3-4',
        exercise: INITIAL_EXERCISES.find(e => e.id === 'ex-calf-raise')!,
        sets: [
          { id: 's-3-10', workout_exercise_id: 'we-3-4', set_number: 1, weight: 60, reps: 15, completed: true },
          { id: 's-3-11', workout_exercise_id: 'we-3-4', set_number: 2, weight: 70, reps: 15, completed: true },
          { id: 's-3-12', workout_exercise_id: 'we-3-4', set_number: 3, weight: 75, reps: 12, completed: true },
          { id: 's-3-13', workout_exercise_id: 'we-3-4', set_number: 4, weight: 75, reps: 12, completed: true },
        ],
      },
    ],
  },
  {
    id: 'wo-4',
    name: 'Chest & Triceps',
    started_at: '2026-09-17T17:00:00.000Z',
    completed_at: '2026-09-17T17:50:00.000Z',
    duration_minutes: 50,
    total_exercises: 3,
    total_sets: 9,
    total_volume: 5350,
    exercises: [
      {
        id: 'we-4-1',
        exercise: INITIAL_EXERCISES.find(e => e.id === 'ex-bench-press')!,
        sets: [
          { id: 's-4-1', workout_exercise_id: 'we-4-1', set_number: 1, weight: 60, reps: 8, completed: true },
          { id: 's-4-2', workout_exercise_id: 'we-4-1', set_number: 2, weight: 62.5, reps: 8, completed: true },
          { id: 's-4-3', workout_exercise_id: 'we-4-1', set_number: 3, weight: 65, reps: 6, completed: true },
        ],
      },
      {
        id: 'we-4-2',
        exercise: INITIAL_EXERCISES.find(e => e.id === 'ex-incline-db-bench')!,
        sets: [
          { id: 's-4-4', workout_exercise_id: 'we-4-2', set_number: 1, weight: 20, reps: 10, completed: true },
          { id: 's-4-5', workout_exercise_id: 'we-4-2', set_number: 2, weight: 20, reps: 9, completed: true },
          { id: 's-4-6', workout_exercise_id: 'we-4-2', set_number: 3, weight: 22, reps: 8, completed: true },
        ],
      },
      {
        id: 'we-4-3',
        exercise: INITIAL_EXERCISES.find(e => e.id === 'ex-tricep-pushdown')!,
        sets: [
          { id: 's-4-7', workout_exercise_id: 'we-4-3', set_number: 1, weight: 25, reps: 12, completed: true },
          { id: 's-4-8', workout_exercise_id: 'we-4-3', set_number: 2, weight: 27.5, reps: 10, completed: true },
          { id: 's-4-9', workout_exercise_id: 'we-4-3', set_number: 3, weight: 30, reps: 8, completed: true },
        ],
      },
    ],
  },
  {
    id: 'wo-5',
    name: 'Chest & Triceps',
    started_at: '2026-09-10T17:00:00.000Z',
    completed_at: '2026-09-10T17:48:00.000Z',
    duration_minutes: 48,
    total_exercises: 2,
    total_sets: 6,
    total_volume: 3420,
    exercises: [
      {
        id: 'we-5-1',
        exercise: INITIAL_EXERCISES.find(e => e.id === 'ex-bench-press')!,
        sets: [
          { id: 's-5-1', workout_exercise_id: 'we-5-1', set_number: 1, weight: 60, reps: 8, completed: true },
          { id: 's-5-2', workout_exercise_id: 'we-5-1', set_number: 2, weight: 60, reps: 8, completed: true },
          { id: 's-5-3', workout_exercise_id: 'we-5-1', set_number: 3, weight: 62.5, reps: 7, completed: true },
        ],
      },
      {
        id: 'we-5-2',
        exercise: INITIAL_EXERCISES.find(e => e.id === 'ex-incline-db-bench')!,
        sets: [
          { id: 's-5-4', workout_exercise_id: 'we-5-2', set_number: 1, weight: 18, reps: 10, completed: true },
          { id: 's-5-5', workout_exercise_id: 'we-5-2', set_number: 2, weight: 20, reps: 8, completed: true },
          { id: 's-5-6', workout_exercise_id: 'we-5-2', set_number: 3, weight: 20, reps: 8, completed: true },
        ],
      },
    ],
  },
];
