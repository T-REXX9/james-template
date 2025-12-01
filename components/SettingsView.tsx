import React from 'react';
import { Database, Server, FileText, KeyRound } from 'lucide-react';

const SettingsView: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto animate-fadeIn pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <Server className="w-8 h-8 text-brand-blue" />
          System Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Manage database connections and understand how Supabase is configured for this app.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Database Connection</h3>
                <p className="text-xs text-slate-500">Supabase PostgreSQL</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Connected
            </span>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-950/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Project URL</label>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-2 text-slate-600 dark:text-slate-300 font-mono text-xs truncate">
                  {import.meta.env.VITE_SUPABASE_URL || 'Set VITE_SUPABASE_URL in your .env file'}
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Anon Key</label>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-2 text-slate-600 dark:text-slate-300 font-mono text-xs truncate">
                  {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Missing' }
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-brand-blue dark:text-blue-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Secrets stay in .env</h3>
              <p className="text-xs text-slate-500">Client uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY only.</p>
            </div>
          </div>
          <div className="p-6 text-sm text-slate-600 dark:text-slate-300 space-y-3">
            <p>
              Service-role keys are not exposed in the frontend. Use the CLI seeding script in <code>scripts/seedSupabase.ts</code> with the service role key to import legacy data into Supabase.
            </p>
            <p>
              See the README for step-by-step setup, including applying <code>supabase_schema.sql</code> and running the migration script.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Migration docs</h3>
              <p className="text-xs text-slate-500">Configured in README with Supabase-only flows.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
