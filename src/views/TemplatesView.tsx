import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Play,
  Trash2,
  Dumbbell,
  Check,
  X,
} from 'lucide-react';
import { WorkoutTemplate, Exercise } from '../types/database';
import { ExerciseSelectorModal } from '../components/ExerciseSelectorModal';

interface TemplatesViewProps {
  templates: WorkoutTemplate[];
  exercises: Exercise[];
  onStartFromTemplate: (template: WorkoutTemplate) => void;
  onCreateTemplate: (name: string, exerciseIds: string[]) => Promise<void>;
  onDeleteTemplate: (templateId: string) => Promise<void>;
  onAddCustomExercise: (exercise: Omit<Exercise, 'id'>) => Promise<Exercise>;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  templates,
  exercises,
  onStartFromTemplate,
  onCreateTemplate,
  onDeleteTemplate,
  onAddCustomExercise,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [selectedExIds, setSelectedExIds] = useState<string[]>([]);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const exMap = new Map(exercises.map((e) => [e.id, e]));

  const handleOpenCreate = () => {
    setTemplateName('');
    setSelectedExIds([]);
    setIsCreateModalOpen(true);
  };

  const handleToggleExerciseInTemplate = (ex: Exercise) => {
    if (selectedExIds.includes(ex.id)) {
      setSelectedExIds(selectedExIds.filter((id) => id !== ex.id));
    } else {
      setSelectedExIds([...selectedExIds, ex.id]);
    }
  };

  const handleSaveNewTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || selectedExIds.length === 0) return;

    try {
      setIsSubmitting(true);
      await onCreateTemplate(templateName.trim(), selectedExIds);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#12151e] border border-[#202636] rounded-3xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Workout Templates
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Pre-built routines to launch your training in one tap.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="h-11 px-4 rounded-xl bg-[#00f59b] hover:bg-[#00e08f] text-black font-extrabold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-[#00f59b]/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New</span>
        </button>
      </div>

      {/* Templates List */}
      <div className="space-y-3.5">
        {templates.map((template) => {
          const templateExercises = (template.exercise_ids || [])
            .map((id) => exMap.get(id))
            .filter(Boolean) as Exercise[];

          return (
            <div
              key={template.id}
              className="bg-[#12151e] border border-[#202636] hover:border-[#2d364c] rounded-2xl p-4 sm:p-5 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#171b26] border border-[#262c3e] flex items-center justify-center text-[#00f59b] shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                      {template.name}
                    </h3>
                    <span className="text-xs text-zinc-400">
                      {templateExercises.length} exercises
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm(`Delete template "${template.name}"?`)) {
                        onDeleteTemplate(template.id);
                      }
                    }}
                    className="p-2 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Delete template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onStartFromTemplate(template)}
                    className="h-10 px-4 rounded-xl bg-[#00f59b] hover:bg-[#00e08f] text-black font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#00f59b]/25 transition-all active:scale-[0.98]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start</span>
                  </button>
                </div>
              </div>

              {/* Exercises in Template */}
              <div className="space-y-1.5 pt-2 border-t border-[#1b202e]">
                {templateExercises.map((ex, idx) => (
                  <div
                    key={ex.id || idx}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[#161a25]"
                  >
                    <span className="font-medium text-zinc-200">{ex.name}</span>
                    <span className="text-zinc-400 font-mono text-[11px]">
                      {ex.muscle_group}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Template Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#11141c] border border-[#232938] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2533]">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#00f59b]" />
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Create Workout Template
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-[#1a202d] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewTemplate} className="p-5 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Upper Body Strength"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#171b26] border border-[#273042] text-white text-sm focus:outline-none focus:border-[#00f59b] transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Exercises ({selectedExIds.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsExercisePickerOpen(true)}
                    className="text-xs font-bold text-[#00f59b] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Exercise
                  </button>
                </div>

                {selectedExIds.length === 0 ? (
                  <div className="p-6 border border-dashed border-[#293245] rounded-2xl text-center">
                    <p className="text-zinc-400 text-xs">No exercises selected yet</p>
                    <button
                      type="button"
                      onClick={() => setIsExercisePickerOpen(true)}
                      className="mt-2 text-xs font-bold text-[#00f59b] hover:underline"
                    >
                      Browse Exercise Library
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedExIds.map((id, idx) => {
                      const ex = exMap.get(id);
                      if (!ex) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between p-2 rounded-xl bg-[#171b26] border border-[#252d3f] text-xs"
                        >
                          <span className="font-semibold text-white">
                            {idx + 1}. {ex.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedExIds(selectedExIds.filter((item) => item !== id))}
                            className="text-zinc-500 hover:text-rose-400 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-[#1b202c] text-zinc-300 text-xs font-semibold hover:bg-[#252c3c] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !templateName.trim() || selectedExIds.length === 0}
                  className="flex-1 h-11 rounded-xl bg-[#00f59b] text-black text-xs font-bold hover:bg-[#00e08f] disabled:opacity-50 transition-colors shadow-lg shadow-[#00f59b]/20"
                >
                  {isSubmitting ? 'Creating...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exercise Picker Modal for Template */}
      <ExerciseSelectorModal
        isOpen={isExercisePickerOpen}
        onClose={() => setIsExercisePickerOpen(false)}
        exercises={exercises}
        onSelectExercise={handleToggleExerciseInTemplate}
        onAddCustomExercise={onAddCustomExercise}
        selectedExerciseIds={selectedExIds}
      />
    </div>
  );
};
