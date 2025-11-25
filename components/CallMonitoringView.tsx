
import React, { useState, useRef, useEffect } from 'react';
import { 
  Phone, PhoneIncoming, PhoneOutgoing, Search, Filter, 
  Calendar, Target, ArrowUpRight, Send, MessageSquare
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { MOCK_CALL_LOGS, MOCK_AGENTS } from '../constants';

// Mock Chat Data
interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  message: string;
  time: string;
  isMe: boolean;
}

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'James Quek', avatar: 'https://i.pravatar.cc/150?u=james', message: '@Sarah excellent handling of the objection on the Banawe Auto call earlier. That is exactly how we want to position the Q4 promo.', time: '10:30 AM', isMe: true },
  { id: '2', sender: 'Sarah Sales', avatar: 'https://i.pravatar.cc/150?u=sarah', message: 'Thanks Sir James! I remembered the training points from Monday.', time: '10:32 AM', isMe: false },
  { id: '3', sender: 'James Quek', avatar: 'https://i.pravatar.cc/150?u=james', message: '@Team remember we have a spiff on the Motul synthetic line today. Push for those add-ons!', time: '11:00 AM', isMe: true },
  { id: '4', sender: 'Esther Van', avatar: 'https://i.pravatar.cc/150?u=esther', message: 'Noted boss. I have two dealers interested in bulk orders.', time: '11:15 AM', isMe: false },
];

const CallMonitoringView: React.FC = () => {
  const [filterAgent, setFilterAgent] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  
  // Mention State
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewMessage(val);

    // Check if we are typing a mention
    const lastAt = val.lastIndexOf('@');
    if (lastAt !== -1) {
        const query = val.slice(lastAt + 1);
        // If query contains space, assume mention is finished or invalid for this simple picker
        if (!query.includes(' ')) {
            setMentionQuery(query);
            setShowMentions(true);
            setSelectedIndex(0);
            return;
        }
    }
    setShowMentions(false);
  };

  const insertMention = (agentName: string) => {
    const lastAt = newMessage.lastIndexOf('@');
    if (lastAt !== -1) {
        const prefix = newMessage.slice(0, lastAt);
        setNewMessage(`${prefix}@${agentName} `);
        setShowMentions(false);
        inputRef.current?.focus();
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'James Quek',
      avatar: 'https://i.pravatar.cc/150?u=james',
      message: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setChatMessages([...chatMessages, msg]);
    setNewMessage('');
    setShowMentions(false);
  };

  const filteredAgents = MOCK_AGENTS.filter(agent => 
      agent.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showMentions && filteredAgents.length > 0) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredAgents.length - 1));
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredAgents.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredAgents[selectedIndex].name);
        return;
      }
      if (e.key === 'Escape') {
          e.preventDefault();
          setShowMentions(false);
          return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- Metrics Calculation ---
  const totalCalls = MOCK_CALL_LOGS.length;
  const completedCalls = MOCK_CALL_LOGS.filter(c => c.status === 'Completed').length;
  const missedCalls = MOCK_CALL_LOGS.filter(c => c.status === 'Missed').length;
  const inProgressCalls = MOCK_CALL_LOGS.filter(c => c.status === 'In-Progress').length;
  
  // Mock duration parsing (simplified for demo)
  const parseDuration = (dur: string) => {
    if (dur === '-' || dur === '0s') return 0;
    const parts = dur.split(' ');
    let minutes = 0;
    parts.forEach(p => {
      if (p.includes('m')) minutes += parseInt(p);
    });
    return minutes;
  };
  
  const totalDurationMins = MOCK_CALL_LOGS.reduce((acc, curr) => acc + parseDuration(curr.duration), 0);

  const outcomeData = [
    { name: 'Successful', value: MOCK_CALL_LOGS.filter(c => c.outcome === 'Successful').length, color: '#10b981' },
    { name: 'Follow-up', value: MOCK_CALL_LOGS.filter(c => c.outcome === 'Follow-up Needed').length, color: '#f59e0b' },
    { name: 'Voicemail', value: MOCK_CALL_LOGS.filter(c => c.outcome === 'Voicemail').length, color: '#6366f1' },
    { name: 'No Answer', value: MOCK_CALL_LOGS.filter(c => c.outcome === 'No Answer').length, color: '#ef4444' },
  ];

  // --- Agent Chart Data ---
  const agentChartData = MOCK_AGENTS.map(agent => {
    const agentLogs = MOCK_CALL_LOGS.filter(log => log.agentName === agent.name);
    return {
      name: agent.name.split(' ')[0],
      calls: agentLogs.length,
      successful: agentLogs.filter(l => l.outcome === 'Successful').length
    };
  });

  // --- Filter Logic ---
  const filteredLogs = MOCK_CALL_LOGS.filter(log => {
    const matchesAgent = filterAgent === 'All' || log.agentName === filterAgent;
    const matchesType = filterType === 'All' || log.type === filterType;
    const matchesSearch = log.contactName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAgent && matchesType && matchesSearch;
  });

  const renderMessageText = (text: string) => {
     // Simple highlight for words starting with @
     return text.split(' ').map((word, i) => {
         if (word.startsWith('@')) {
             return <span key={i} className="font-bold text-brand-blue dark:text-blue-300">{word} </span>
         }
         return <span key={i}>{word} </span>
     });
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950 animate-fadeIn flex flex-col overflow-hidden">
      
      {/* Header / Toolbar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 z-10 shadow-sm">
          <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Phone className="w-6 h-6 text-brand-blue" />
                  Daily Call Monitoring
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Real-time tracking of team communication performance.
              </p>
          </div>
          <div className="flex items-center gap-3">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                      type="text" 
                      placeholder="Search call logs..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-brand-blue transition-colors w-64 text-slate-800 dark:text-white"
                  />
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                  <button className="p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500">
                      <Calendar className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 pr-2">Today</span>
              </div>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Total Calls */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-brand-blue">
                          <Phone className="w-5 h-5" />
                      </div>
                      <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                          <ArrowUpRight className="w-3 h-3 mr-1" /> 12%
                      </span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{totalCalls}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total calls today</p>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><PhoneIncoming className="w-3 h-3" /> In: 45%</span>
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><PhoneOutgoing className="w-3 h-3" /> Out: 55%</span>
                  </div>
              </div>

              {/* Missed Calls */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-600">
                          <PhoneIncoming className="w-5 h-5" />
                      </div>
                      {missedCalls > 0 && (
                          <span className="flex items-center text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-full">
                              Action Needed
                          </span>
                      )}
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{missedCalls}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Missed calls</p>
                   <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                       <span className="text-rose-500 font-bold">{inProgressCalls}</span> calls currently in-progress
                  </div>
              </div>

              {/* Daily Target */}
              <div className="bg-gradient-to-br from-brand-blue to-indigo-700 p-5 rounded-xl border border-blue-800 shadow-md text-white relative overflow-hidden">
                  <Target className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10" />
                  <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                          <div className="p-2 bg-white/20 rounded-lg text-white">
                              <Target className="w-5 h-5" />
                          </div>
                      </div>
                      <h3 className="text-3xl font-bold mb-1">85%</h3>
                      <p className="text-sm text-blue-100">Daily Call Target Hit</p>
                      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-blue-100 flex justify-between">
                          <span>Actual: {totalCalls}</span>
                          <span>Target: 120</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT COLUMN: Charts & Table */}
              <div className="lg:col-span-2 space-y-6">
                   {/* Agent Activity Chart (Replaces List) */}
                   <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                      <h3 className="font-bold text-slate-800 dark:text-white mb-6">Agent Activity</h3>
                      <div className="h-80 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={agentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.1} />
                                  <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 12, fill: '#94a3b8'}} 
                                    dy={10} 
                                    interval={0}
                                  />
                                  <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 12, fill: '#94a3b8'}} 
                                    allowDecimals={false}
                                  />
                                  <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)' }}
                                  />
                                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                  <Bar dataKey="calls" name="Total Calls" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                                  <Bar dataKey="successful" name="Successful" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  {/* Individual Call Records Table */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                          <h3 className="font-bold text-slate-800 dark:text-white">Individual Call Records</h3>
                          <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                  <Filter className="w-4 h-4 text-slate-400" />
                                  <select 
                                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded p-1.5 outline-none text-slate-700 dark:text-slate-300"
                                      value={filterAgent}
                                      onChange={(e) => setFilterAgent(e.target.value)}
                                  >
                                      <option value="All">All Agents</option>
                                      {[...new Set(MOCK_CALL_LOGS.map(c => c.agentName))].map(agent => (
                                          <option key={agent} value={agent}>{agent}</option>
                                      ))}
                                  </select>
                              </div>
                              <div className="flex items-center gap-2">
                                  <select 
                                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded p-1.5 outline-none text-slate-700 dark:text-slate-300"
                                      value={filterType}
                                      onChange={(e) => setFilterType(e.target.value)}
                                  >
                                      <option value="All">All Types</option>
                                      <option value="Inbound">Inbound</option>
                                      <option value="Outbound">Outbound</option>
                                  </select>
                              </div>
                          </div>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                              <thead>
                                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500 dark:text-slate-400">
                                      <th className="p-4 font-semibold w-24">Time</th>
                                      <th className="p-4 font-semibold">Agent</th>
                                      <th className="p-4 font-semibold">Customer</th>
                                      <th className="p-4 font-semibold">Type</th>
                                      <th className="p-4 font-semibold">Dur.</th>
                                      <th className="p-4 font-semibold">Outcome</th>
                                      <th className="p-4 font-semibold w-1/3">Notes</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {filteredLogs.map((log) => (
                                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                          <td className="p-4 text-sm font-mono text-slate-500 dark:text-slate-400">
                                              {log.time}
                                          </td>
                                          <td className="p-4">
                                              <div className="flex items-center gap-2">
                                                  <img src={log.agentAvatar} className="w-6 h-6 rounded-full" alt="" />
                                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[100px]">{log.agentName}</span>
                                              </div>
                                          </td>
                                          <td className="p-4">
                                              <div>
                                                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[120px]">{log.contactName}</p>
                                                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{log.company}</p>
                                              </div>
                                          </td>
                                          <td className="p-4">
                                              <span className={`flex items-center gap-1 text-xs font-bold ${
                                                  log.type === 'Inbound' ? 'text-emerald-600' : 'text-blue-600'
                                              }`}>
                                                  {log.type === 'Inbound' ? <PhoneIncoming className="w-3 h-3" /> : <PhoneOutgoing className="w-3 h-3" />}
                                                  {log.type}
                                              </span>
                                          </td>
                                          <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-mono">
                                              {log.duration}
                                          </td>
                                          <td className="p-4">
                                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                  log.status === 'Missed' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                                                  log.status === 'In-Progress' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse' :
                                                  log.outcome === 'Successful' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                                  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                              }`}>
                                                  {log.status === 'Missed' ? 'Missed' : log.outcome}
                                              </span>
                                          </td>
                                          <td className="p-4 text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">
                                              {log.notes}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                          {filteredLogs.length === 0 && (
                              <div className="p-8 text-center text-slate-400 text-sm italic">
                                  No call logs match your filters.
                              </div>
                          )}
                      </div>
                  </div>
              </div>

              {/* RIGHT COLUMN: Pie & Chat */}
              <div className="lg:col-span-1 space-y-6">
                  
                  {/* Outcome Distribution Chart */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                      <h3 className="font-bold text-slate-800 dark:text-white mb-4">Call Outcomes</h3>
                      <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                      data={outcomeData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={80}
                                      paddingAngle={5}
                                      dataKey="value"
                                  >
                                      {outcomeData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                      ))}
                                  </Pie>
                                  <Tooltip contentStyle={{borderRadius: '8px', border:'none', backgroundColor: '#1e293b', color: '#fff'}} />
                              </PieChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-4">
                          {outcomeData.map((item) => (
                              <div key={item.name} className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                  <span className="text-xs text-slate-600 dark:text-slate-300">{item.name}</span>
                                  <span className="text-xs font-bold text-slate-800 dark:text-white ml-auto">{item.value}</span>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Live Coaching Chat */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col h-[600px]">
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-t-xl">
                          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold">
                              <MessageSquare className="w-5 h-5 text-brand-blue" />
                              <h3>Live Coaching Channel</h3>
                          </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                          {chatMessages.map((msg) => (
                              <div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                                  <div className="flex-shrink-0">
                                      <img 
                                        src={msg.avatar} 
                                        className={`w-8 h-8 rounded-full border-2 ${msg.isMe ? 'border-brand-blue' : 'border-slate-200 dark:border-slate-600'}`}
                                        alt={msg.sender} 
                                      />
                                  </div>
                                  <div className={`flex flex-col max-w-[85%] ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                      <div className="flex items-center gap-2 mb-1">
                                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{msg.sender}</span>
                                          <span className="text-[10px] text-slate-400">{msg.time}</span>
                                      </div>
                                      <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                                          msg.isMe 
                                          ? 'bg-brand-blue text-white rounded-tr-none' 
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none'
                                      }`}>
                                          {renderMessageText(msg.message)}
                                      </div>
                                  </div>
                              </div>
                          ))}
                          <div ref={chatEndRef} />
                      </div>

                      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
                          <div className="relative">
                              {/* Suggestion Box */}
                              {showMentions && filteredAgents.length > 0 && (
                                <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-50 animate-fadeIn">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        Mention Team Member
                                    </div>
                                    <div className="max-h-48 overflow-y-auto">
                                        {filteredAgents.map((agent, index) => (
                                            <button 
                                                key={agent.id} 
                                                onClick={() => insertMention(agent.name)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={`w-full text-left p-2 flex items-center gap-3 transition-colors ${
                                                    index === selectedIndex 
                                                    ? 'bg-blue-50 dark:bg-blue-900/40 border-l-2 border-brand-blue' 
                                                    : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 border-l-2 border-transparent'
                                                }`}
                                            >
                                                <img src={agent.avatar} className="w-8 h-8 rounded-full" alt={agent.name} />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{agent.name}</p>
                                                    <p className="text-[10px] text-slate-500">{agent.role}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                              )}

                              <input
                                  ref={inputRef}
                                  type="text"
                                  value={newMessage}
                                  onChange={handleInputChange}
                                  onKeyDown={handleKeyDown}
                                  placeholder="Message @Agent or Team..."
                                  className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all shadow-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                              />
                              <button 
                                  onClick={handleSendMessage}
                                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${newMessage.trim() ? 'bg-brand-blue text-white' : 'text-slate-300 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                              >
                                  <Send className="w-4 h-4" />
                              </button>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-2 px-1 text-center">
                              Type '@' to mention an agent
                          </div>
                      </div>
                  </div>

              </div>
          </div>

      </div>
    </div>
  );
};

export default CallMonitoringView;
