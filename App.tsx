
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import ContactDetails from './components/ContactDetails';
import AddContactModal from './components/AddContactModal';
import PipelineView from './components/PipelineView';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import StaffView from './components/StaffView';
import CallMonitoringView from './components/CallMonitoringView';
import ProductDatabase from './components/ProductDatabase';
import { fetchContacts, createContact } from './services/supabaseService';
import { supabase } from './lib/supabaseClient';
import { Contact, DealStage, UserProfile, CustomerStatus } from './types';
import { Search, Filter, Plus, MoreHorizontal, Loader2, Eye, EyeOff } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [appLoading, setAppLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState<string>('All');
  
  // Add Contact Modal State
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  // 1. Auth Logic
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchUserProfile(session.user.id);
      else setAppLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchUserProfile(session.user.id);
      else {
        setUserProfile(null);
        setAppLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        setUserProfile(data);
      } else {
        // Fallback if profile doesn't exist yet
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
             setUserProfile({
                 id: user.id,
                 email: user.email || '',
                 full_name: user.user_metadata?.full_name,
                 avatar_url: user.user_metadata?.avatar_url,
                 role: 'sales_agent'
             });
        }
      }
    } catch (e) {
      console.error('Error fetching profile', e);
    } finally {
      setAppLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserProfile(null);
  };

  // 2. Data Logic
  const loadData = async () => {
    setIsLoadingContacts(true);
    const data = await fetchContacts();
    setContacts(data);
    setIsLoadingContacts(false);
  };

  useEffect(() => {
    if (session) {
        loadData();
    }
  }, [session]);

  const handleContactUpdate = (updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
  };

  const handleCreateContact = async (newContactData: Omit<Contact, 'id'>) => {
      await createContact(newContactData);
      await loadData(); // Refresh list
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            contact.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStage === 'All' || contact.stage === filterStage;
      return matchesSearch && matchesFilter;
    });
  }, [contacts, searchQuery, filterStage]);

  const selectedContact = useMemo(() => 
    contacts.find(c => c.id === selectedContactId), 
  [contacts, selectedContactId]);


  // 3. Render Logic
  if (appLoading) {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
            <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
        </div>
    );
  }

  if (!session) {
      return <Login />;
  }

  const renderContactsView = () => {
    if (isLoadingContacts) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
            </div>
        )
    }

    if (selectedContactId && selectedContact) {
        return (
            <ContactDetails 
                contact={selectedContact} 
                currentUser={userProfile}
                onClose={() => setSelectedContactId(null)} 
                onUpdate={handleContactUpdate} 
            />
        );
    }

    return (
    <div className="p-8 max-w-7xl mx-auto animate-fadeIn space-y-6">
      <AddContactModal 
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        onSubmit={handleCreateContact}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Contacts</h1>
        <div className="flex space-x-2 w-full md:w-auto">
           <button 
             onClick={() => setIsAddContactOpen(true)}
             className="flex items-center px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
           >
             <Plus className="w-4 h-4 mr-2" /> Add Contact
           </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search contacts, companies..." 
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm rounded-lg pl-10 pr-4 py-1 focus:border-brand-blue outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="text-slate-500 dark:text-slate-400 w-4 h-4" />
          <select 
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-lg p-2 outline-none focus:border-brand-blue"
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
          >
            <option value="All">All Stages</option>
            {Object.values(DealStage).map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Area</th>
                <th className="p-4 font-medium">Salesman</th>
                <th className="p-4 font-medium">Debt Type</th>
                <th className="p-4 font-medium text-right">Total Sales</th>
                <th className="p-4 font-medium text-right">Balance</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredContacts.map((contact) => (
                <tr 
                  key={contact.id} 
                  onClick={() => setSelectedContactId(contact.id)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">
                         {contact.company.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1" title={contact.company}>{contact.company}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{contact.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                      {contact.area || '-'}
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                      {contact.salesman || contact.assignedAgent || '-'}
                  </td>
                  <td className="p-4 text-sm">
                      {contact.debtType ? (
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                              contact.debtType === 'Good' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900' 
                              : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900'
                          }`}>
                              {contact.debtType}
                          </span>
                      ) : '-'}
                  </td>
                  <td className="p-4 text-right text-slate-700 dark:text-slate-200 font-mono text-sm">
                    {contact.totalSales ? `₱${contact.totalSales.toLocaleString()}` : '-'}
                  </td>
                  <td className="p-4 text-right font-mono text-sm">
                     <span className={`${(contact.balance || 0) > 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500'}`}>
                        {contact.balance ? `₱${contact.balance.toLocaleString()}` : '-'}
                     </span>
                  </td>
                  <td className="p-4">
                     <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        contact.status === CustomerStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredContacts.length === 0 && (
           <div className="p-12 text-center text-slate-500 dark:text-slate-400">
             No contacts found matching your filters.
           </div>
        )}
      </div>
    </div>
  )};

  const renderComingSoon = (title: string) => (
     <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center">
           <Filter className="w-10 h-10 text-slate-400 dark:text-slate-600 opacity-50" /> 
        </div>
        <h2 className="text-2xl font-bold text-slate-400 dark:text-slate-500">{title}</h2>
        <p className="text-slate-400 dark:text-slate-500 max-w-md">This module is currently under development.</p>
     </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col">
      <TopNav 
        activeTab={activeTab} 
        onNavigate={setActiveTab} 
        user={userProfile} 
        onSignOut={handleSignOut} 
      />
      
      <div className="flex flex-1 overflow-hidden pt-14">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <main className="flex-1 ml-16 overflow-hidden flex flex-col relative bg-slate-100 dark:bg-slate-950">
              {activeTab === 'dashboard' && (
                  <div className="p-8 h-full overflow-y-auto bg-slate-100 dark:bg-slate-950">
                    <Dashboard />
                  </div>
              )}
              
              {activeTab === 'pipelines' && <PipelineView />}
              
              {activeTab === 'staff' && <StaffView />}
              
              {activeTab === 'products' && (
                <div className="h-full overflow-y-auto">
                  <ProductDatabase />
                </div>
              )}

              {/* Reports view removed and integrated into Dashboard */}
              
              {activeTab === 'contacts' && (
                  <div className="h-full overflow-y-auto">
                      {renderContactsView()}
                  </div>
              )}
              
              {activeTab === 'calls' && <CallMonitoringView />}

              {activeTab === 'mail' && renderComingSoon('Inbox')}
              {activeTab === 'calendar' && renderComingSoon('Calendar')}
              {activeTab === 'tasks' && renderComingSoon('Tasks')}
              {activeTab === 'settings' && renderComingSoon('Settings')}
          </main>
      </div>
    </div>
  );
};

export default App;
