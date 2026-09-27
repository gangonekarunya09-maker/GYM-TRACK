import React, { useState } from 'react';
import { Database, X, Check, Copy, AlertCircle, RefreshCw } from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  SUPABASE_SQL_SCHEMA,
  SupabaseConfig,
} from '../lib/supabase';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
  onResetData: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
  onResetData,
}) => {
  const [config, setConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());
  const [copied, setCopied] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSupabaseConfig(config);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
    onConfigChanged();
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#11141c] border border-[#242b3b] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top grab bar */}
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2533]">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#00f59b]" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Database & Cloud Sync
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-[#1a202d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status Banner */}
          <div className="p-3.5 rounded-2xl bg-[#161a25] border border-[#252c3d] flex items-start gap-3">
            <div
              className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                config.enabled && config.url && config.anonKey
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            <div className="text-xs">
              <span className="font-bold text-white block">
                {config.enabled && config.url && config.anonKey
                  ? 'Supabase Cloud Sync Configured'
                  : 'Local High-Speed Storage Mode Active'}
              </span>
              <span className="text-zinc-400 mt-0.5 block leading-relaxed">
                Workouts are always saved safely in your browser. Connect your Supabase project below for cross-device cloud persistence.
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Supabase Project URL
              </label>
              <input
                type="url"
                placeholder="https://xyzcompany.supabase.co"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value.trim() })}
                className="w-full h-11 px-3.5 rounded-xl bg-[#171b26] border border-[#273042] text-white text-xs font-mono focus:outline-none focus:border-[#00f59b] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Supabase Anon Public Key
              </label>
              <input
                type="text"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={config.anonKey}
                onChange={(e) => setConfig({ ...config, anonKey: e.target.value.trim() })}
                className="w-full h-11 px-3.5 rounded-xl bg-[#171b26] border border-[#273042] text-white text-xs font-mono focus:outline-none focus:border-[#00f59b] transition-colors"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#171b26] border border-[#273042]">
              <span className="text-xs font-medium text-zinc-300">
                Enable Supabase Live Connection
              </span>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="w-5 h-5 rounded accent-[#00f59b] cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-[#00f59b] hover:bg-[#00e08f] text-black text-xs font-bold transition-all shadow-md"
              >
                {savedMessage ? 'Settings Saved! ✓' : 'Save Connection'}
              </button>
            </div>
          </form>

          {/* Copy SQL Schema Box */}
          <div className="pt-3 border-t border-[#1f2533]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-300">
                Supabase PostgreSQL Tables Schema
              </span>
              <button
                type="button"
                onClick={handleCopySQL}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1c2230] hover:bg-[#252c3c] text-xs font-semibold text-zinc-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#00f59b]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied SQL!' : 'Copy SQL'}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#0c0e14] border border-[#1e2433] text-[10px] font-mono text-zinc-400 overflow-x-auto max-h-36">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>

          {/* Reset Demo Data Button */}
          <div className="pt-3 border-t border-[#1f2533] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-300 block">
                Reset Demo Data
              </span>
              <span className="text-[11px] text-zinc-400">
                Re-seeds initial templates, exercises & workouts
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset to initial sample workouts and templates?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
