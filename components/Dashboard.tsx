
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Briefcase, Trophy, Activity, Filter, Crown, CheckCircle, XCircle, BarChart2 } from 'lucide-react';
import MetricsCard from './MetricsCard';
import { REPORT_PIE_DATA, TOP_PRODUCTS_DATA } from '../constants';

const data = [
  { name: 'Jan', revenue: 640258.00, lastYear: 0 },
  { name: 'Feb', revenue: 899332.20, lastYear: 0 },
  { name: 'Mar', revenue: 1223654.00, lastYear: 0 },
  { name: 'Apr', revenue: 1194761.80, lastYear: 0 },
  { name: 'May', revenue: 1051973.20, lastYear: 0 },
  { name: 'Jun', revenue: 2361373.60, lastYear: 0 },
  { name: 'Jul', revenue: 2140157.00, lastYear: 0 },
  { name: 'Aug', revenue: 1676042.40, lastYear: 0 },
  { name: 'Sep', revenue: 1968572.60, lastYear: 0 },
  { name: 'Oct', revenue: 2265326.60, lastYear: 0 },
  { name: 'Nov', revenue: 1622740.00, lastYear: 0 },
  { name: 'Dec', revenue: 0.00, lastYear: 0 },
];

const topCustomersData = [
  { name: 'JRLT CALIBRATION', value: 100445.00 },
  { name: 'R AND M CALIBRATION', value: 89510.00 },
  { name: 'VENDIESEL CRDI', value: 52350.00 },
  { name: 'CORPUZ ENGINE', value: 38810.00 },
  { name: 'SULTAN KUDARAT', value: 38000.00 },
  { name: 'ESTANCIA CALIB.', value: 33120.00 },
  { name: 'CUIZON DIESEL', value: 31620.00 },
  { name: 'JRM DIESEL', value: 29320.00 },
  { name: 'CM CALIBRATION', value: 26100.00 },
  { name: 'RENA DIESEL', value: 25440.00 },
];

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Hide small labels

  return (
    <text x={x} y={y} fill="#94a3b8" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10}>
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

const Dashboard: React.FC = () => {
  // Calculate total revenue from the 2025 monthly data
  const totalRevenue2025 = data.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalTopRevenue = topCustomersData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Welcome back, here's what's happening today.</p>
        </div>
        
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <button className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors">Last 7 Days</button>
          <button className="px-3 py-1.5 text-sm font-medium text-brand-blue dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-md shadow-sm">Last 30 Days</button>
          <button className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors">This Quarter</button>
        </div>
      </div>

      {/* High Level Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard 
          title="Total Revenue (2025)" 
          value={`₱${totalRevenue2025.toLocaleString()}`} 
          trend={12.5} 
          icon={DollarSign} 
        />
        <MetricsCard 
          title="Active Deals" 
          value="45" 
          trend={-2.4} 
          icon={Briefcase} 
        />
        <MetricsCard 
          title="Win Rate" 
          value="68%" 
          trend={5.1} 
          icon={Trophy} 
        />
        <MetricsCard 
          title="Pipeline Value" 
          value="₱120.4M" 
          trend={8.2} 
          icon={Activity} 
        />
      </div>

      {/* Deal Flow Status Cards (Moved from Reports) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
             <div>
                 <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Closed-Won Deals</p>
                 <h4 className="text-3xl font-bold text-slate-800 dark:text-white">64</h4>
             </div>
             <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                 <CheckCircle className="w-6 h-6" />
             </div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
             <div>
                 <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Closed-Lost Deals</p>
                 <h4 className="text-3xl font-bold text-slate-800 dark:text-white">15</h4>
             </div>
             <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                 <XCircle className="w-6 h-6" />
             </div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
             <div>
                 <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Deals in Pipeline</p>
                 <h4 className="text-3xl font-bold text-slate-800 dark:text-white">311</h4>
             </div>
             <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                 <BarChart2 className="w-6 h-6" />
             </div>
         </div>
      </div>

      {/* Charts Row 1: Financials & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Trajectory */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Monthly Sales for 2025</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Revenue performance vs last year</p>
            </div>
            <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <Filter className="w-4 h-4" />
            </button>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F5298" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0F5298" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" vertical={false} opacity={0.1} />
                <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10} 
                    tick={{fontSize: 12, fill: '#94a3b8'}}
                />
                <YAxis 
                    stroke="#64748b" 
                    axisLine={false} 
                    tickLine={false} 
                    dx={-10} 
                    tickFormatter={(value) => `₱${value/1000}k`} 
                    tick={{fontSize: 12, fill: '#94a3b8'}}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121212', borderColor: '#262626', color: '#f8fafc', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)' }} 
                  itemStyle={{ fontWeight: 500 }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
                  cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }}
                  formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Sales']}
                />
                <Legend 
                    iconType="circle" 
                    verticalAlign="top" 
                    height={36} 
                    align="right"
                    wrapperStyle={{ fontSize: '12px', fontWeight: 500, paddingBottom: '10px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="2025 Sales"
                  stroke="#0F5298" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  activeDot={{ r: 6, fill: '#0F5298', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deals Size Distribution (Integrated from Reports) */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm flex flex-col">
             <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Deal Distribution</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">By region/segment</p>
                </div>
             </div>
             
             <div className="flex-1 min-h-[200px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                              data={REPORT_PIE_DATA}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                              label={CustomPieLabel}
                          >
                              {REPORT_PIE_DATA.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                              ))}
                          </Pie>
                          <Tooltip 
                              contentStyle={{ backgroundColor: '#121212', borderRadius: '8px', border: 'none', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)' }}
                              formatter={(value: number) => `${value}%`}
                          />
                      </PieChart>
                  </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                  {REPORT_PIE_DATA.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{entry.name}</span>
                      </div>
                  ))}
              </div>
        </div>
      </div>

      {/* Charts Row 2: Breakdown & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Selling Products */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm flex flex-col min-h-[300px]">
             <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Top Selling Products</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Highest revenue generating items</p>
                </div>
             </div>
             <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={TOP_PRODUCTS_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false}
                            tick={{fontSize: 11, fill: '#94a3b8'}}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 10, fill: '#94a3b8'}} 
                            tickFormatter={(val) => `${val / 1000000}M`}
                        />
                        <Tooltip 
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            contentStyle={{ backgroundColor: '#121212', borderRadius: '8px', border: 'none', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)' }}
                            formatter={(value: any) => `₱${value.toLocaleString()}`}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={100} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Top Customers (Updated with Data from Screenshot) */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="mb-6 flex justify-between items-start">
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Top 10 Customers</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">November Leaders</p>
            </div>
            <div className="text-right">
                 <div className="flex items-center justify-end gap-2 text-brand-blue dark:text-blue-400">
                     <Crown className="w-4 h-4" />
                     <span className="text-xl font-bold">₱{(totalTopRevenue / 1000).toFixed(0)}k</span>
                 </div>
                 <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Total Contribution</p>
            </div>
          </div>
          
          <div className="flex-1 min-h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCustomersData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" horizontal={true} vertical={false} opacity={0.2} />
                <XAxis type="number" stroke="#64748b" hide />
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#64748b" 
                    width={110} 
                    tick={{fontSize: 10, fontWeight: 500, fill: '#94a3b8'}} 
                    axisLine={false} 
                    tickLine={false} 
                    interval={0}
                />
                <Tooltip
                   cursor={{fill: 'rgba(255,255,255,0.05)'}}
                   contentStyle={{ backgroundColor: '#121212', borderColor: '#262626', color: '#f8fafc', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)' }}
                   formatter={(value: number) => `₱${value.toLocaleString()}`}
                />
                <Bar 
                    dataKey="value" 
                    fill="#0F5298" 
                    radius={[0, 4, 4, 0]} 
                    barSize={18} 
                    background={{ fill: 'rgba(148, 163, 184, 0.1)', radius: [0, 4, 4, 0] }}
                />
              </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
