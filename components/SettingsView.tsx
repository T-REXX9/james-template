
import React, { useState } from 'react';
import { Database, Save, Server, Shield, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { resetAndSeedDatabase } from '../services/supabaseService';

const SettingsView: React.FC = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleMigration = async () => {
    if (!window.confirm("This will inject mock data into your Supabase database. Continue?")) {
        return;
    }

    setIsMigrating(true);
    setMigrationStatus('idle');
    
    const result = await resetAndSeedDatabase();
    
    setIsMigrating(false);
    if (result.success) {
        setMigrationStatus('success');
    } else {
        setMigrationStatus('error');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fadeIn pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <Server className="w-8 h-8 text-brand-blue" />
          System Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Manage database connections, security, and application preferences.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Database Connection Card */}
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
                            {process.env.REACT_APP_SUPABASE_URL || 'https://fevdccbmjejkzyofzwpx.supabase.co'}
                        </div>
                    </div>
                    <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Status</label>
                        <div className="text-emerald-600 dark:text-emerald-400 font-medium p-2">
                            Operational
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Data Migration Tool */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-brand-blue dark:text-blue-400">
                        <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">Data Migration</h3>
                        <p className="text-xs text-slate-500">Seed your database with initial data</p>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 max-w-2xl leading-relaxed">
                    Use this tool to push the local mock data (Contacts, Products, and Deals) into your connected Supabase database. 
                    This is useful for initializing a new environment. 
                    <br/><br/>
                    <strong className="text-amber-600 dark:text-amber-500">Note:</strong> Duplicate records may be created if run multiple times without clearing the tables first.
                </p>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleMigration}
                        disabled={isMigrating}
                        className={`px-5 py-2.5 rounded-lg text-white font-medium shadow-sm flex items-center gap-2 transition-all ${
                            isMigrating ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-blue hover:bg-blue-700'
                        }`}
                    >
                        {isMigrating ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" /> Migrating...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" /> Push Mock Data to DB
                            </>
                        )}
                    </button>

                    {migrationStatus === 'success' && (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-bold animate-fadeIn">
                            <CheckCircle className="w-5 h-5" /> Migration Successful!
                        </div>
                    )}
                    
                    {migrationStatus === 'error' && (
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-sm font-bold animate-fadeIn">
                            <AlertTriangle className="w-5 h-5" /> Migration Failed. Check console.
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Security Placeholder */}
        <div className="opacity-50 pointer-events-none">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Security & Access</h3>
                            <p className="text-xs text-slate-500">Manage API keys and user roles</p>
                        </div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Coming Soon</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsView;
