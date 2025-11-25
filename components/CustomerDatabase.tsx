
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Filter, Users, Eye, EyeOff, Tag, CheckSquare, Square, MoreHorizontal, UserCheck, Loader2, RefreshCw
} from 'lucide-react';
import { Contact, CustomerStatus } from '../types';
import { fetchContacts, bulkUpdateContacts, createContact, updateContact } from '../services/supabaseService';
import { MOCK_AGENTS } from '../constants';
import AddContactModal from './AddContactModal';
import ContactDetails from './ContactDetails';

const CustomerDatabase: React.FC = () => {
  const [customers, setCustomers] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtering
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterVisibility, setFilterVisibility] = useState<string>('All'); 

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkAgentModalOpen, setIsBulkAgentModalOpen] = useState(false);
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<string | null>(null);

  // Bulk Values
  const [selectedAgentForBulk, setSelectedAgentForBulk] = useState(MOCK_AGENTS[0].name);
  const [selectedPriceGroupForBulk, setSelectedPriceGroupForBulk] = useState('AA');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
        const data = await fetchContacts();
        console.log("Loaded contacts:", data);
        setCustomers(data || []);
    } catch (e) {
        console.error("Failed to load customers", e);
        setCustomers([]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleHardReset = () => {
      if(window.confirm("This will wipe all local changes and reset to default mock data. Continue?")) {
          localStorage.clear();
          window.location.reload();
      }
  }

  const filteredCustomers = useMemo(() => {
    if (!customers || !Array.isArray(customers)) return [];
    
    return customers.filter(c => {
      // Defensive checks
      if (!c) return false;

      const companyName = (c.company || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      
      const contactPersonMatch = c.contactPersons && Array.isArray(c.contactPersons) 
        ? c.contactPersons.some(p => (p && p.name ? p.name.toLowerCase().includes(query) : false))
        : false;
      
      const legacyNameMatch = (c.name || '').toLowerCase().includes(query);

      const matchSearch = 
        companyName.includes(query) || 
        contactPersonMatch || 
        legacyNameMatch;
      
      // Case insensitive status match
      const currentStatus = c.status ? c.status.toLowerCase() : 'active'; // default
      const filterStatusLower = filterStatus.toLowerCase();
      const matchStatus = filterStatus === 'All' || currentStatus === filterStatusLower;
      
      const matchVisibility = 
        filterVisibility === 'All' ? true :
        filterVisibility === 'Hidden' ? !!c.isHidden :
        !c.isHidden;

      return matchSearch && matchStatus && matchVisibility;
    });
  }, [customers, searchQuery, filterStatus, filterVisibility]);

  // Selection Logic
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCustomers.map(c => c.id)));
    }
  };

  // Bulk Handlers
  const handleBulkVisibility = async (isHidden: boolean) => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Set ${selectedIds.size} customers to ${isHidden ? 'Hidden' : 'Unhidden'}?`)) return;
    
    await bulkUpdateContacts(Array.from(selectedIds), { isHidden });
    setSelectedIds(new Set());
    loadData();
  };

  const handleBulkAssignAgent = async () => {
    if (selectedIds.size === 0) return;
    await bulkUpdateContacts(Array.from(selectedIds), { salesman: selectedAgentForBulk, assignedAgent: selectedAgentForBulk });
    setIsBulkAgentModalOpen(false);
    setSelectedIds(new Set());
    loadData();
  };

  const handleBulkAssignPriceGroup = async () => {
    if (selectedIds.size === 0) return;
    await bulkUpdateContacts(Array.from(selectedIds), { priceGroup: selectedPriceGroupForBulk });
    setIsBulkPriceModalOpen(false);
    setSelectedIds(new Set());
    loadData();
  };

  // Single CRUD Handlers
  const handleCreateContact = async (data: Omit<Contact, 'id'>) => {
      await createContact(data);
      loadData();
  };
  
  const handleUpdateContact = async (updated: Contact) => {
      await updateContact(updated.id, updated);
      setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  if (selectedCustomerForDetail) {
      const customer = customers.find(c => c.id === selectedCustomerForDetail);
      if (customer) {
          return (
              <ContactDetails 
                contact={customer}
                onClose={() => setSelectedCustomerForDetail(null)}
                onUpdate={handleUpdateContact}
              />
          )
      }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 p-6 animate-fadeIn relative">
       
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-blue" />
            Customer Database
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your client base, assign agents, and track status.
          </p>
        </div>
        <div className="flex items-center gap-3">
             <button 
                onClick={handleHardReset}
                className="flex items-center gap-2 px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium"
                title="Fix blank page issues"
             >
                <RefreshCw className="w-3.5 h-3.5" /> Reset DB
             </button>
             <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-lg shadow-sm font-medium transition-colors"
             >
               <Plus className="w-4 h-4" /> Add Customer
             </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 mb-6 sticky top-0 z-20">
         
         {/* Search */}
         <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search company, contact person..." 
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:border-brand-blue outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
             {/* Status Filter */}
             <div className="relative">
                 <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-lg pl-3 pr-8 py-2 appearance-none outline-none focus:border-brand-blue"
                 >
                     <option value="All">All Status</option>
                     {Object.values(CustomerStatus).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
                 <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
             </div>

             {/* Visibility Filter */}
             <div className="relative">
                 <select 
                    value={filterVisibility}
                    onChange={(e) => setFilterVisibility(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-lg pl-3 pr-8 py-2 appearance-none outline-none focus:border-brand-blue"
                 >
                     <option value="All">All Visibility</option>
                     <option value="Unhidden">Unhidden</option>
                     <option value="Hidden">Hidden</option>
                 </select>
                 <Eye className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
             </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
          <div className="bg-brand-blue text-white p-3 rounded-lg shadow-md mb-4 flex items-center justify-between animate-fadeIn">
              <span className="font-bold text-sm px-2">{selectedIds.size} customers selected</span>
              <div className="flex items-center gap-3">
                  <button onClick={() => setIsBulkAgentModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs font-medium transition-colors">
                      <UserCheck className="w-3.5 h-3.5" /> Assign Agent
                  </button>
                  <button onClick={() => setIsBulkPriceModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs font-medium transition-colors">
                      <Tag className="w-3.5 h-3.5" /> Set Price Group
                  </button>
                  <button onClick={() => handleBulkVisibility(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs font-medium transition-colors">
                      <EyeOff className="w-3.5 h-3.5" /> Hide
                  </button>
                  <button onClick={() => handleBulkVisibility(false)} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs font-medium transition-colors">
                      <Eye className="w-3.5 h-3.5" /> Unhide
                  </button>
                  <button onClick={() => setSelectedIds(new Set())} className="ml-4 text-xs underline opacity-80 hover:opacity-100">
                      Clear
                  </button>
              </div>
          </div>
      )}

      {/* Main Table */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
         <div className="h-full overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10 shadow-sm">
                    <tr className="text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                        <th className="p-4 w-10">
                            <button onClick={toggleAll} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                {selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0 ? <CheckSquare className="w-4 h-4 text-brand-blue" /> : <Square className="w-4 h-4" />}
                            </button>
                        </th>
                        <th className="p-4">Customer Name</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Visibility</th>
                        <th className="p-4">Area / Address</th>
                        <th className="p-4">Sales Agent</th>
                        <th className="p-4">Price Group</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {isLoading ? (
                        <tr><td colSpan={8} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-blue" /></td></tr>
                    ) : filteredCustomers.length === 0 ? (
                        <tr><td colSpan={8} className="p-8 text-center text-slate-500 italic">No customers found.</td></tr>
                    ) : (
                        filteredCustomers.map(c => {
                            // Render Guard
                            if (!c) return null;
                            const contactName = c.contactPersons && c.contactPersons.length > 0 ? c.contactPersons[0].name : c.name;

                            return (
                                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-4">
                                        <button onClick={() => toggleSelection(c.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                            {selectedIds.has(c.id) ? <CheckSquare className="w-4 h-4 text-brand-blue" /> : <Square className="w-4 h-4" />}
                                        </button>
                                    </td>
                                    <td className="p-4 cursor-pointer" onClick={() => setSelectedCustomerForDetail(c.id)}>
                                        <div className="font-bold text-slate-800 dark:text-white">{c.company || 'Unknown Company'}</div>
                                        <div className="text-xs text-slate-500">{contactName || 'No Contact'}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                            c.status === CustomerStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900' :
                                            c.status === CustomerStatus.INACTIVE ? 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700' :
                                            c.status === CustomerStatus.BLACKLISTED ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900' :
                                            'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900'
                                        }`}>
                                            {c.status || 'Prospective'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {c.isHidden ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-emerald-500" />}
                                            <span className={`text-xs ${c.isHidden ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{c.isHidden ? 'Hidden' : 'Visible'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                        <div className="font-medium">{c.area || '-'}</div>
                                        <div className="text-xs text-slate-400 truncate max-w-[150px]" title={c.address}>{c.address || '-'}</div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                        {c.salesman || '-'}
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                                            {c.priceGroup || '-'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => setSelectedCustomerForDetail(c.id)} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-slate-800 rounded transition-colors">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
         </div>
      </div>

      <AddContactModal 
         isOpen={isAddModalOpen} 
         onClose={() => setIsAddModalOpen(false)}
         onSubmit={handleCreateContact}
      />

      {/* Bulk Agent Modal */}
      {isBulkAgentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl w-full max-w-sm border border-slate-200 dark:border-slate-800">
                 <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Assign Agent to {selectedIds.size} Customers</h3>
                 <div className="mb-4">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Sales Agent</label>
                     <select 
                        value={selectedAgentForBulk}
                        onChange={(e) => setSelectedAgentForBulk(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                     >
                        {MOCK_AGENTS.map(agent => (
                            <option key={agent.id} value={agent.name}>{agent.name}</option>
                        ))}
                     </select>
                 </div>
                 <div className="flex justify-end gap-3">
                     <button onClick={() => setIsBulkAgentModalOpen(false)} className="px-3 py-2 text-sm text-slate-500">Cancel</button>
                     <button onClick={handleBulkAssignAgent} className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold">Assign</button>
                 </div>
             </div>
          </div>
      )}

      {/* Bulk Price Group Modal */}
      {isBulkPriceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl w-full max-w-sm border border-slate-200 dark:border-slate-800">
                 <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Set Price Group for {selectedIds.size} Customers</h3>
                 <div className="mb-4">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Price Group</label>
                     <select 
                        value={selectedPriceGroupForBulk}
                        onChange={(e) => setSelectedPriceGroupForBulk(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                     >
                        {['AA', 'BB', 'CC', 'DD', 'VIP1', 'VIP2'].map(pg => (
                            <option key={pg} value={pg}>{pg}</option>
                        ))}
                     </select>
                 </div>
                 <div className="flex justify-end gap-3">
                     <button onClick={() => setIsBulkPriceModalOpen(false)} className="px-3 py-2 text-sm text-slate-500">Cancel</button>
                     <button onClick={handleBulkAssignPriceGroup} className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold">Set Group</button>
                 </div>
             </div>
          </div>
      )}

    </div>
  );
};

export default CustomerDatabase;
