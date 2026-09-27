import React from 'react';
import { Database, Zap, Timer } from 'lucide-react';
import { NavTab } from './BottomNavigation';

interface TopHeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenSettings: () => void;
  isSupabaseConnected: boolean;
  restTimerSecondsRemaining: number | null;
  onOpenRestTimer: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
  isSupabaseConnected,
  restTimerSecondsRemaining,
  onOpenRestTimer,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0b0d11]/90 backdrop-blur-md border-b border-[#1b202c] px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Zone 1: Single Wordmark */}
        <button
          onClick={() => onTabChange('home')}
          className="flex items-center gap-2 text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#00f59b] flex items-center justify-center text-black font-extrabold text-base tracking-tighter shadow-[0_0_12px_rgba(0,245,155,0.3)]">
            <Zap className="w-5 h-5 fill-black stroke-black" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-[#00f59b] transition-colors">
            GymTrack
          </span>
        </button>

        {/* Zone 2: Desktop Navigation Links (Clean text links, single row) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onTabChange('home')}
            className={`transition-colors ${
              activeTab === 'home' ? 'text-[#00f59b]' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onTabChange('workout')}
            className={`transition-colors ${
              activeTab === 'workout' ? 'text-[#00f59b]' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Workout
          </button>
          <button
            onClick={() => onTabChange('history')}
            className={`transition-colors ${
              activeTab === 'history' ? 'text-[#00f59b]' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            History
          </button>
          <button
            onClick={() => onTabChange('progress')}
            className={`transition-colors ${
              activeTab === 'progress' ? 'text-[#00f59b]' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Progress & PRs
          </button>
          <button
            onClick={() => onTabChange('templates')}
            className={`transition-colors ${
              activeTab === 'templates' ? 'text-[#00f59b]' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Templates
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          {/* Active Rest Timer Floating Pill */}
          {restTimerSecondsRemaining !== null && restTimerSecondsRemaining > 0 && (
            <button
              onClick={onOpenRestTimer}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#00f59b]/15 border border-[#00f59b]/40 text-[#00f59b] text-xs font-semibold tabular-nums animate-pulse hover:bg-[#00f59b]/25 transition-colors"
              title="Rest Timer Running"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>{formatTime(restTimerSecondsRemaining)}</span>
            </button>
          )}

          {/* Cloud Database Sync Status */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161a23] border border-[#262c3c] text-zinc-300 text-xs font-medium hover:border-zinc-500 hover:text-white transition-colors"
            title="Database & Supabase Settings"
          >
            <Database className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">
              {isSupabaseConnected ? 'Supabase Synced' : 'Local Storage'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
