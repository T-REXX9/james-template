import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  ChevronDown, Plus, Search, ChevronRight, Loader2
} from 'lucide-react';
import { fetchDeals } from '../services/supabaseService';
import { PIPELINE_COLUMNS } from '../constants';
import { PipelineDeal } from '../types';

const PipelineView: React.FC = () => {
  const [deals, setDeals] = useState<PipelineDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDeals = async () => {
      setIsLoading(true);
      const data = await fetchDeals();
      setDeals(data);
      setIsLoading(false);
    };
    loadDeals();
  }, []);

  // Helper to get deals for a column
  const getDealsForStage = (stageId: string) => deals.filter(d => d.stageId === stageId);

  // Calculate column stats
  const getColumnStats = (stageId: string) => {
    const stageDeals = getDealsForStage(stageId);
    const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
    return { count: stageDeals.length, value: totalValue };
  };

  // Calculate Total Pipeline Stats
  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-slate-950 w-full">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-slate-950 overflow-hidden font-sans w-full animate-fadeIn">
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Toolbar */}
        <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-5 flex flex-col gap-4 shadow-sm z-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button className="bg-brand-blue hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center shadow-sm transition-all transform active:scale-95">
                        <Plus className="w-4 h-4 mr-1.5" /> Add deal
                    </button>
                    <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 shadow-sm cursor-pointer hover:border-gray-300 dark:hover:border-slate-600 transition-colors group">
                         <div className="w-1 h-5 bg-gray-300 dark:bg-slate-600 mr-3 rounded-full group-hover:bg-gray-400 transition-colors"></div>
                         <span className="text-sm font-bold text-gray-700 dark:text-slate-200 mr-2">B2B PH Sales Pipeline</span>
                         <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                         <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 mx-3"></div>
                         <button className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors">
                            <Settings className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                         </button>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-slate-400 gap-3 ml-2 bg-gray-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-gray-100 dark:border-slate-700">
                        <span className="font-semibold text-gray-700 dark:text-slate-300">{totalDeals} deals</span>
                        <span className="text-gray-300 dark:text-slate-600">|</span>
                        <span>Total: <span className="font-semibold text-gray-700 dark:text-slate-300">₱{totalValue.toLocaleString()}</span></span>
                        <span className="text-gray-300 dark:text-slate-600">|</span>
                        <span>Projected: <span className="font-semibold text-gray-700 dark:text-slate-300">₱{totalValue.toLocaleString()}</span></span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-white transition-colors">
                        Visible deals <ChevronDown className="w-3 h-3" />
                    </button>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Quick filter deals" 
                            className="pl-3 pr-9 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none w-56 transition-all shadow-sm" 
                        />
                        <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-white transition-colors">
                        Advanced filters <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-hidden p-6 bg-gray-50 dark:bg-slate-950">
            <div className="flex h-full w-full">
                {PIPELINE_COLUMNS.map((column, index) => {
                    const { count, value } = getColumnStats(column.id);
                    const columnDeals = getDealsForStage(column.id);
                    
                    return (
                        <div key={column.id} className="flex-1 min-w-0 flex flex-col h-full mr-4 last:mr-0">
                            {/* Column Header */}
                            <div className="relative h-14 mb-4 filter drop-shadow-sm group flex-shrink-0">
                                <div 
                                    className="absolute inset-0 bg-white dark:bg-slate-900 flex items-center px-4 transition-transform hover:scale-[1.02]"
                                    style={{
                                        clipPath: 'polygon(0% 0%, 92% 0%, 100% 50%, 92% 100%, 0% 100%, 8% 50%)',
                                        marginLeft: index === 0 ? '0' : '-22px',
                                        paddingLeft: index === 0 ? '16px' : '38px',
                                        zIndex: 10 - index,
                                        // For the first element, remove the left cut
                                        ...(index === 0 ? { clipPath: 'polygon(0% 0%, 92% 0%, 100% 50%, 92% 100%, 0% 100%)' } : {})
                                    }}
                                >
                                    <div className="flex flex-col w-full truncate">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${column.color.replace('text-', 'bg-')}`}></div>
                                            <span className={`font-bold text-sm truncate ${column.color}`}>{column.title}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-slate-500 font-medium">
                                            <span className="truncate">₱{value.toLocaleString()}</span>
                                            <span className="flex-shrink-0 ml-1">• {count} deals</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cards Container */}
                            <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-3 custom-scrollbar">
                                {columnDeals.map(deal => (
                                    <div 
                                        key={deal.id} 
                                        className={`bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-100 dark:border-slate-700 shadow-card group hover:shadow-card-hover transition-all duration-200 cursor-pointer relative ${deal.isWarning ? 'bg-rose-50/30 dark:bg-rose-900/10' : ''}`}
                                    >
                                        {deal.isWarning && (
                                            <div className="absolute inset-0 bg-rose-50 dark:bg-rose-900 opacity-30 dark:opacity-10 pointer-events-none rounded-lg"></div>
                                        )}
                                        <div className="relative z-10">
                                            <div className="mb-3">
                                                <h4 className="font-bold text-sm text-gray-800 dark:text-white leading-snug mb-1 group-hover:text-brand-blue dark:group-hover:text-blue-400 transition-colors">{deal.title}</h4>
                                                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">{deal.company}</p>
                                            </div>
                                            
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <img src={deal.avatar} alt="" className="w-6 h-6 rounded-full border border-white dark:border-slate-600 shadow-sm" />
                                                    <span className="text-xs font-medium text-gray-600 dark:text-slate-300">{deal.ownerName}</span>
                                                </div>
                                                {deal.isOverdue && (
                                                    <span className="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                        {deal.daysInStage}d overdue
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-gray-700 dark:text-slate-200">₱{deal.value.toLocaleString()}</span>
                                                </div>
                                                <button className="text-gray-300 hover:text-gray-500 dark:hover:text-slate-400 transition-colors">
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="h-12"></div> {/* Bottom spacer */}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineView;