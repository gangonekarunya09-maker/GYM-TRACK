import React, { useState, useMemo } from 'react';
import { Search, X, Plus, Dumbbell, Check } from 'lucide-react';
import { Exercise, MuscleGroup, Equipment } from '../types/database';

interface ExerciseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
  onAddCustomExercise: (exercise: Omit<Exercise, 'id'>) => Promise<Exercise>;
  selectedExerciseIds?: string[];
}

const MUSCLE_GROUPS: (MuscleGroup | 'All')[] = [
  'All',
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Abs',
  'Forearms',
];

const EQUIPMENT_OPTIONS: Equipment[] = [
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Bodyweight',
  'Other',
];

export const ExerciseSelectorModal: React.FC<ExerciseSelectorModalProps> = ({
  isOpen,
  onClose,
  exercises,
  onSelectExercise,
  onAddCustomExercise,
  selectedExerciseIds = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<MuscleGroup | 'All'>('All');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  // New Custom Exercise Form
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>('Chest');
  const [customEquipment, setCustomEquipment] = useState<Equipment>('Barbell');
  const [isSaving, setIsSaving] = useState(false);

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesCategory =
        activeCategory === 'All' || ex.muscle_group === activeCategory;
      const matchesSearch =
        searchTerm === '' ||
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.muscle_group.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.equipment.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [exercises, activeCategory, searchTerm]);

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    try {
      setIsSaving(true);
      const created = await onAddCustomExercise({
        name: customName.trim(),
        muscle_group: customMuscle,
        equipment: customEquipment,
      });
      setCustomName('');
      setIsCreatingCustom(false);
      onSelectExercise(created);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#11141c] border border-[#232938] rounded-t-3xl sm:rounded-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top grab bar for mobile */}
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1f2533]">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[#00f59b]" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {isCreatingCustom ? 'Create New Exercise' : 'Select Exercise'}
            </h3>
          </div>
          <button
            onClick={() => {
              setIsCreatingCustom(false);
              onClose();
            }}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-[#1a202d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isCreatingCustom ? (
          /* Custom Exercise Form */
          <form onSubmit={handleCreateCustom} className="p-5 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Exercise Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bulgarian Split Squat"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#171b26] border border-[#273042] text-white text-sm focus:outline-none focus:border-[#00f59b] transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Muscle Group
              </label>
              <select
                value={customMuscle}
                onChange={(e) => setCustomMuscle(e.target.value as MuscleGroup)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#171b26] border border-[#273042] text-white text-sm focus:outline-none focus:border-[#00f59b] transition-colors"
              >
                {MUSCLE_GROUPS.filter((m) => m !== 'All').map((mg) => (
                  <option key={mg} value={mg}>
                    {mg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Equipment
              </label>
              <select
                value={customEquipment}
                onChange={(e) => setCustomEquipment(e.target.value as Equipment)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#171b26] border border-[#273042] text-white text-sm focus:outline-none focus:border-[#00f59b] transition-colors"
              >
                {EQUIPMENT_OPTIONS.map((eq) => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingCustom(false)}
                className="flex-1 h-11 rounded-xl bg-[#1b202c] text-zinc-300 text-xs font-semibold hover:bg-[#252c3c] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !customName.trim()}
                className="flex-1 h-11 rounded-xl bg-[#00f59b] text-black text-xs font-bold hover:bg-[#00e08f] disabled:opacity-50 transition-colors shadow-lg shadow-[#00f59b]/20"
              >
                {isSaving ? 'Creating...' : 'Save & Select'}
              </button>
            </div>
          </form>
        ) : (
          /* Exercise List View */
          <>
            {/* Search Input */}
            <div className="p-3.5 pb-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search exercise, muscle, or equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#161a24] border border-[#242c3d] text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[#00f59b] transition-colors"
                />
              </div>
            </div>

            {/* Muscle Group Filter Tabs (Interactive Segmented Bar) */}
            <div className="px-3.5 pb-2 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
              {MUSCLE_GROUPS.map((mg) => {
                const isActive = activeCategory === mg;
                return (
                  <button
                    key={mg}
                    type="button"
                    onClick={() => setActiveCategory(mg)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-[#00f59b] text-black'
                        : 'bg-[#171b26] text-zinc-400 hover:text-white hover:bg-[#202636]'
                    }`}
                  >
                    {mg}
                  </button>
                );
              })}
            </div>

            {/* Exercise Items List */}
            <div className="flex-1 overflow-y-auto px-3.5 py-1 divide-y divide-[#1b202c]">
              {filteredExercises.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <p className="text-zinc-400 text-sm">No exercises found</p>
                  <p className="text-zinc-500 text-xs mt-1">
                    Try another search or create this exercise custom.
                  </p>
                  <button
                    onClick={() => {
                      setCustomName(searchTerm);
                      setIsCreatingCustom(true);
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00f59b]/15 text-[#00f59b] text-xs font-semibold hover:bg-[#00f59b]/25 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create "{searchTerm || 'Custom Exercise'}"
                  </button>
                </div>
              ) : (
                filteredExercises.map((ex) => {
                  const isAlreadySelected = selectedExerciseIds.includes(ex.id);
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => {
                        onSelectExercise(ex);
                        onClose();
                      }}
                      className="w-full py-3 px-2 flex items-center justify-between text-left hover:bg-[#181d29] rounded-xl transition-colors group"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-[#00f59b] transition-colors">
                          {ex.name}
                        </div>
                        <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                          <span className="text-[#00f59b] font-medium">{ex.muscle_group}</span>
                          <span aria-hidden="true">·</span>
                          <span>{ex.equipment}</span>
                        </div>
                      </div>

                      {isAlreadySelected ? (
                        <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium bg-[#1d2331] px-2 py-1 rounded-md">
                          <Check className="w-3 h-3 text-[#00f59b]" /> In workout
                        </span>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#181d28] border border-[#2b3345] group-hover:bg-[#00f59b] group-hover:text-black text-zinc-400 flex items-center justify-center transition-colors">
                          <Plus className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Bottom Add Custom Exercise Button */}
            <div className="p-3.5 border-t border-[#1f2533] bg-[#0f1219]">
              <button
                type="button"
                onClick={() => setIsCreatingCustom(true)}
                className="w-full h-11 rounded-xl bg-[#191e2b] hover:bg-[#22293b] text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 border border-[#273042] transition-colors"
              >
                <Plus className="w-4 h-4 text-[#00f59b]" />
                Create Custom Exercise
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
