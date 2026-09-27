import React from 'react';
import { Check, Trash2, Plus, Minus } from 'lucide-react';
import { ActiveSet } from '../types/database';

interface SetRowProps {
  set: ActiveSet;
  index: number;
  onUpdate: (updated: Partial<ActiveSet>) => void;
  onRemove: () => void;
  onToggleComplete: () => void;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  index,
  onUpdate,
  onRemove,
  onToggleComplete,
}) => {
  const handleWeightDelta = (delta: number) => {
    const current = Number(set.weight) || 0;
    const next = Math.max(0, Math.round((current + delta) * 10) / 10);
    onUpdate({ weight: next });
  };

  const handleRepsDelta = (delta: number) => {
    const current = Number(set.reps) || 0;
    const next = Math.max(0, current + delta);
    onUpdate({ reps: next });
  };

  return (
    <div
      className={`flex items-center gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 rounded-xl transition-all duration-150 ${
        set.completed
          ? 'bg-[#00f59b]/10 border border-[#00f59b]/25 text-white'
          : 'bg-[#151923] border border-[#23293a] text-zinc-200'
      }`}
    >
      {/* Set Number */}
      <div className="w-6 text-center font-bold text-xs text-zinc-400 tabular-nums shrink-0">
        {index + 1}
      </div>

      {/* Previous Performance Reference */}
      <div className="hidden xs:flex flex-col items-center justify-center w-14 sm:w-16 text-center shrink-0">
        <span className="text-[10px] text-zinc-400 font-mono tabular-nums leading-none">
          {set.previousWeight !== undefined && set.previousReps !== undefined
            ? `${set.previousWeight}kg × ${set.previousReps}`
            : '—'}
        </span>
      </div>

      {/* Weight Input + Steppers */}
      <div className="flex-1 flex items-center justify-center min-w-0 bg-[#0d1017] rounded-lg border border-[#2b3347] p-0.5">
        <button
          type="button"
          onClick={() => handleWeightDelta(-2.5)}
          className="w-7 h-9 flex items-center justify-center text-zinc-400 hover:text-white active:bg-zinc-800 rounded transition-colors shrink-0"
          title="-2.5 kg"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 flex items-center justify-center min-w-0 px-1">
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            min="0"
            value={set.weight === 0 ? '' : set.weight}
            placeholder="0"
            onChange={(e) => {
              const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
              onUpdate({ weight: isNaN(val) ? 0 : val });
            }}
            className="w-full text-center bg-transparent text-sm sm:text-base font-bold text-white focus:outline-none tabular-nums"
          />
          <span className="text-[10px] text-zinc-500 font-medium ml-0.5">kg</span>
        </div>
        <button
          type="button"
          onClick={() => handleWeightDelta(2.5)}
          className="w-7 h-9 flex items-center justify-center text-zinc-400 hover:text-white active:bg-zinc-800 rounded transition-colors shrink-0"
          title="+2.5 kg"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Reps Input + Steppers */}
      <div className="w-24 sm:w-28 flex items-center justify-center shrink-0 bg-[#0d1017] rounded-lg border border-[#2b3347] p-0.5">
        <button
          type="button"
          onClick={() => handleRepsDelta(-1)}
          className="w-7 h-9 flex items-center justify-center text-zinc-400 hover:text-white active:bg-zinc-800 rounded transition-colors shrink-0"
          title="-1 rep"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 flex items-center justify-center min-w-0 px-0.5">
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min="0"
            value={set.reps === 0 ? '' : set.reps}
            placeholder="0"
            onChange={(e) => {
              const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
              onUpdate({ reps: isNaN(val) ? 0 : val });
            }}
            className="w-full text-center bg-transparent text-sm sm:text-base font-bold text-white focus:outline-none tabular-nums"
          />
          <span className="text-[10px] text-zinc-500 font-medium ml-0.5">reps</span>
        </div>
        <button
          type="button"
          onClick={() => handleRepsDelta(1)}
          className="w-7 h-9 flex items-center justify-center text-zinc-400 hover:text-white active:bg-zinc-800 rounded transition-colors shrink-0"
          title="+1 rep"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Complete Checkbox (Large minimum 44x44px touch target) */}
      <button
        type="button"
        onClick={onToggleComplete}
        className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all shrink-0 ${
          set.completed
            ? 'bg-[#00f59b] text-black shadow-[0_0_12px_rgba(0,245,155,0.4)]'
            : 'bg-[#1e2433] text-zinc-500 hover:text-zinc-200 border border-[#2e374d]'
        }`}
        title={set.completed ? 'Completed' : 'Mark complete'}
      >
        <Check className="w-5 h-5 stroke-[3]" />
      </button>

      {/* Delete Set */}
      <button
        type="button"
        onClick={onRemove}
        className="w-8 h-9 flex items-center justify-center text-zinc-500 hover:text-rose-400 transition-colors shrink-0"
        title="Remove set"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
