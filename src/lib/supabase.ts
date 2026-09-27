import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Local storage keys
export const STORAGE_KEYS = {
  EXERCISES: 'gymtrack_exercises_v1',
  TEMPLATES: 'gymtrack_templates_v1',
  WORKOUTS: 'gymtrack_workouts_v1',
  ACTIVE_WORKOUT: 'gymtrack_active_workout_v1',
  SUPABASE_CONFIG: 'gymtrack_supabase_config_v1',
  SETTINGS: 'gymtrack_settings_v1',
};

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  enabled: boolean;
}

export const getStoredSupabaseConfig = (): SupabaseConfig => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        url: parsed.url || envUrl,
        anonKey: parsed.anonKey || envKey,
        enabled: parsed.enabled ?? (Boolean(envUrl) && Boolean(envKey)),
      };
    }
  } catch (err) {
    console.warn('Error reading Supabase config from localStorage:', err);
  }

  return {
    url: envUrl,
    anonKey: envKey,
    enabled: Boolean(envUrl) && Boolean(envKey),
  };
};

export const saveStoredSupabaseConfig = (config: SupabaseConfig) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Supabase config', e);
  }
};

let cachedClient: SupabaseClient | null = null;
let currentClientKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getStoredSupabaseConfig();
  if (!config.enabled || !config.url || !config.anonKey) {
    return null;
  }

  const key = `${config.url}_${config.anonKey}`;
  if (cachedClient && currentClientKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    currentClientKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

// SQL Schema for users who connect to Supabase
export const SUPABASE_SQL_SCHEMA = `-- GymTrack Supabase PostgreSQL Database Schema
-- Run this in your Supabase SQL Editor to initialize all tables and relationships

-- 1. Profiles
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Athlete',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Exercises
create table if not exists public.exercises (
  id text primary key,
  name text not null,
  muscle_group text not null,
  equipment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Workout Templates
create table if not exists public.workout_templates (
  id text primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Template Exercises
create table if not exists public.template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id text references public.workout_templates(id) on delete cascade not null,
  exercise_id text references public.exercises(id) on delete cascade not null,
  order_index integer not null default 0
);

-- 5. Workouts
create table if not exists public.workouts (
  id text primary key,
  name text not null,
  started_at timestamp with time zone not null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Workout Exercises
create table if not exists public.workout_exercises (
  id text primary key,
  workout_id text references public.workouts(id) on delete cascade not null,
  exercise_id text references public.exercises(id) on delete cascade not null,
  order_index integer not null default 0
);

-- 7. Sets
create table if not exists public.sets (
  id text primary key,
  workout_exercise_id text references public.workout_exercises(id) on delete cascade not null,
  set_number integer not null,
  weight numeric not null default 0,
  reps integer not null default 0,
  completed boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create helpful query indexes
create index if not exists idx_workouts_started_at on public.workouts(started_at desc);
create index if not exists idx_workout_exercises_workout on public.workout_exercises(workout_id);
create index if not exists idx_sets_workout_exercise on public.sets(workout_exercise_id);
create index if not exists idx_exercises_muscle on public.exercises(muscle_group);

-- Enable RLS (open read/write for guest MVP demo)
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_templates enable row level security;
alter table public.template_exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.sets enable row level security;

create policy "Allow all operations for anon" on public.profiles for all using (true) with check (true);
create policy "Allow all operations for anon" on public.exercises for all using (true) with check (true);
create policy "Allow all operations for anon" on public.workout_templates for all using (true) with check (true);
create policy "Allow all operations for anon" on public.template_exercises for all using (true) with check (true);
create policy "Allow all operations for anon" on public.workouts for all using (true) with check (true);
create policy "Allow all operations for anon" on public.workout_exercises for all using (true) with check (true);
create policy "Allow all operations for anon" on public.sets for all using (true) with check (true);
`;
