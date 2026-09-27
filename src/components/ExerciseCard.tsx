import React from 'react';
import { ChevronUp, ChevronDown, MoreVertical, Plus, Copy, Trash2, History } from 'lucide-react';
import { ActiveExerciseItem, ActiveSet } from '../types/database';
import { SetRow } from './SetRow';

interface ExerciseCardProps {
  exerciseItem: ActiveExerciseItem;
  exerciseIndex: number;
  totalExercises: number;
  onUpdateSet: (setIndex: number, updated: Partial<ActiveSet>) => void;
  onAddSet: () => void;
  onDuplicateLastSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onToggleCompleteSet: (setIndex: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemoveExercise: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exerciseItem,
  exerciseIndex,
  totalExercises,
  onUpdateSet,
  onAddSet,
  onDuplicateLastSet,
  onRemoveSet,
  onToggleCompleteSet,
  onMoveUp,
  onMoveDown,
  onRemoveExercise,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div className="bg-[#11141c] border border-[#202636] rounded-2xl p-3.5 sm:p-4 mb-4 shadow-lg transition-all">
      {/* Exercise Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#1b212f] text-zinc-400 text-xs font-bold flex items-center justify-center tabular-nums">
              {exerciseIndex + 1}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
              {exerciseItem.exercise.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1 pl-7">
            <span className="text-[#00f59b] font-medium">{exerciseItem.exercise.muscle_group}</span>
            <span aria-hidden="true">·</span>
            <span>{exerciseItem.exercise.equipment}</span>
          </div>
        </div>

        {/* Reordering and Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={exerciseIndex === 0}
            onClick={onMoveUp}
            className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-400 rounded-lg hover:bg-[#1b212f] transition-colors"
            title="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={exerciseIndex === totalExercises - 1}
            onClick={onMoveDown}
            className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-400 rounded-lg hover:bg-[#1b212f] transition-colors"
            title="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-[#1b212f] transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 z-30 w-44 bg-[#181d28] border border-[#2b3346] rounded-xl shadow-xl py-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onDuplicateLastSet();
                    }}
                    className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-[#222838] flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5 text-zinc-400" /> Duplicate set
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onRemoveExercise();
                    }}
                    className="w-full px-3 py-2 text-left text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove exercise
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Previous Performance Banner */}
      {exerciseItem.previousSetsSummary && (
        <div className="flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-lg bg-[#161a24] border border-[#242b3b] text-xs text-zinc-300">
          <History className="w-3.5 h-3.5 text-[#00f59b] shrink-0" />
          <span className="text-zinc-400">Previous:</span>
          <span className="font-mono text-zinc-200 truncate tabular-nums">
            {exerciseItem.previousSetsSummary}
          </span>
        </div>
      )}

      {/* Sets Column Header */}
      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
        <div className="w-6 text-center">Set</div>
        <div className="hidden xs:block w-14 sm:w-16 text-center">Prev</div>
        <div className="flex-1 text-center">Weight</div>
        <div className="w-24 sm:w-28 text-center">Reps</div>
        <div className="min-w-[44px] text-center">Done</div>
        <div className="w-8" />
      </div>

      {/* Set Rows */}
      <div className="space-y-1.5">
        {exerciseItem.sets.map((set, setIdx) => (
          <SetRow
            key={set.id}
            set={set}
            index={setIdx}
            onUpdate={(updated) => onUpdateSet(setIdx, updated)}
            onRemove={() => onRemoveSet(setIdx)}
            onToggleComplete={() => onToggleCompleteSet(setIdx)}
          />
        ))}
      </div>

      {/* Exercise Actions: Add Set & Duplicate Set */}
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#1d2230]">
        <button
          type="button"
          onClick={onAddSet}
          className="flex-1 h-10 rounded-xl bg-[#171c26] hover:bg-[#202735] text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#283042] transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-[#00f59b]" />
          Add Set
        </button>
        {exerciseItem.sets.length > 0 && (
          <button
            type="button"
            onClick={onDuplicateLastSet}
            className="h-10 px-3 rounded-xl bg-[#171c26] hover:bg-[#202735] text-zinc-400 hover:text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 border border-[#283042] transition-colors"
            title="Duplicate last set weight and reps"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>
        )}
      </div>
    </div>
  );
};
