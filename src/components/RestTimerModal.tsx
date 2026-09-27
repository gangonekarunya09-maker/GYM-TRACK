import React, { useEffect } from 'react';
import { Timer, X, Minimize2, Play, Pause, Plus, Minus } from 'lucide-react';
import { playTimerBeep } from '../utils/audio';

interface RestTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  secondsRemaining: number;
  totalSeconds: number;
  isActive: boolean;
  onStart: (seconds: number) => void;
  onStop: () => void;
  onTogglePause: () => void;
  onAdjustSeconds: (delta: number) => void;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({
  isOpen,
  onClose,
  secondsRemaining,
  totalSeconds,
  isActive,
  onStart,
  onStop,
  onTogglePause,
  onAdjustSeconds,
}) => {
  useEffect(() => {
    if (isActive && secondsRemaining === 0) {
      playTimerBeep();
    }
  }, [isActive, secondsRemaining]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const progress = totalSeconds > 0 ? (secondsRemaining / totalSeconds) * 100 : 0;
  const circleRadius = 76;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#131720] border border-[#262c3e] rounded-3xl p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-[#00f59b]" />
            <h3 className="text-lg font-bold text-white tracking-tight">Rest Timer</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-[#1f2533] transition-colors"
              title="Minimize timer"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onStop();
                onClose();
              }}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-[#1f2533] transition-colors"
              title="Close & Stop"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Circular Countdown Display */}
        <div className="relative flex items-center justify-center my-6">
          <svg className="w-52 h-52 transform -rotate-90">
            <circle
              cx="104"
              cy="104"
              r={circleRadius}
              stroke="#222838"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="104"
              cy="104"
              r={circleRadius}
              stroke="#00f59b"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300 ease-linear"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-white tracking-tight tabular-nums font-mono">
              {timeFormatted}
            </span>
            <span className="text-xs text-zinc-400 font-medium mt-1">
              {secondsRemaining === 0 ? 'Rest Complete!' : isActive ? 'Resting...' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Quick Stepper Adjustment */}
        <div className="flex items-center justify-center gap-4 mb-5">
          <button
            onClick={() => onAdjustSeconds(-15)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1c2230] hover:bg-[#252d40] text-xs font-semibold text-zinc-300 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" /> 15s
          </button>
          <button
            onClick={onTogglePause}
            className={`p-3 rounded-full flex items-center justify-center transition-colors ${
              isActive
                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                : 'bg-[#00f59b] text-black hover:bg-[#00e08f]'
            }`}
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
          <button
            onClick={() => onAdjustSeconds(15)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1c2230] hover:bg-[#252d40] text-xs font-semibold text-zinc-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> 15s
          </button>
        </div>

        {/* Quick Presets Specified in Requirements */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#222838]">
          <button
            onClick={() => onStart(60)}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
              totalSeconds === 60 && isActive
                ? 'bg-[#00f59b] text-black'
                : 'bg-[#181d28] text-zinc-300 hover:bg-[#222838]'
            }`}
          >
            60 sec
          </button>
          <button
            onClick={() => onStart(90)}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
              totalSeconds === 90 && isActive
                ? 'bg-[#00f59b] text-black'
                : 'bg-[#181d28] text-zinc-300 hover:bg-[#222838]'
            }`}
          >
            90 sec
          </button>
          <button
            onClick={() => onStart(120)}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
              totalSeconds === 120 && isActive
                ? 'bg-[#00f59b] text-black'
                : 'bg-[#181d28] text-zinc-300 hover:bg-[#222838]'
            }`}
          >
            120 sec
          </button>
          <button
            onClick={() => {
              onStop();
              onClose();
            }}
            className="py-2 px-1 text-center rounded-xl text-xs font-bold bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition-all"
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
};
