import React from 'react';
import { Search, Bell, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface TopNavProps {
  activeTab?: string;
  onNavigate?: (tab: string) => void;
  user?: UserProfile | null;
  onSignOut?: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ activeTab = 'dashboard', onNavigate, user, onSignOut }) => {
  return (
    <div className="h-14 bg-gradient-to-r from-brand-blue to-[#0a3d74] flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50 text-white shadow-md">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => onNavigate?.('dashboard')}>
           <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center font-bold border border-white/10 group-hover:bg-white/20 transition-colors">T</div>
           <div className="flex items-center">
             <span className="font-bold text-lg tracking-tight">TND-OPC</span>
           </div>
        </div>
        
        {/* Search */}
        <div className="relative group hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white/80 transition-colors" />
            <input 
                type="text" 
                placeholder="Search anything" 
                className="bg-black/20 border border-transparent text-sm rounded-md pl-9 pr-4 py-1.5 focus:outline-none focus:bg-black/30 focus:border-white/10 text-white placeholder-white/40 w-64 transition-all"
            />
        </div>
      </div>

      <div className="flex items-center space-x-5">
         <div className="flex items-center space-x-1 relative">
             <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-brand-blue"></span>
             <Bell className="w-5 h-5 text-white/70 hover:text-white cursor-pointer transition-colors" />
         </div>
         
         {user ? (
           <div className="flex items-center space-x-3 pl-5 border-l border-white/10">
               <img 
                 src={user.avatar_url || "https://i.pravatar.cc/150?u=default"} 
                 alt="Profile" 
                 className="w-8 h-8 rounded-full border border-white/10 shadow-sm bg-white/20" 
               />
               <div className="flex flex-col items-start">
                 <span className="text-sm font-medium text-white/90 hidden md:block leading-tight">{user.full_name || user.email}</span>
                 <span className="text-[10px] text-white/50 hidden md:block uppercase">{user.role || 'Sales Agent'}</span>
               </div>
               <button onClick={onSignOut} className="ml-2 text-white/50 hover:text-white transition-colors" title="Sign Out">
                 <LogOut className="w-4 h-4" />
               </button>
           </div>
         ) : (
           <div className="flex items-center space-x-3 pl-5 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
           </div>
         )}
      </div>
    </div>
  );
};

export default TopNav;