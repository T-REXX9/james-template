
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import PipelineView from './components/PipelineView';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import StaffView from './components/StaffView';
import CallMonitoringView from './components/CallMonitoringView';
import ProductDatabase from './components/ProductDatabase';
import CustomerDatabase from './components/CustomerDatabase'; // New Component
import { supabase } from './lib/supabaseClient';
import { UserProfile } from './types';
import { Filter, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [appLoading, setAppLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  
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

              {/* Swapped generic contacts with new Customer Database */}
              {activeTab === 'customers' && (
                  <div className="h-full overflow-y-auto">
                      <CustomerDatabase />
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
