
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Activity, Cpu, HardDrive, Clock, ExternalLink } from 'lucide-react';

const buildData = [
  { name: 'Mon', time: 45 },
  { name: 'Tue', time: 52 },
  { name: 'Wed', time: 38 },
  { name: 'Thu', time: 65 },
  { name: 'Fri', time: 48 },
  { name: 'Sat', time: 20 },
  { name: 'Sun', time: 15 },
];

const cpuData = [
  { time: '10:00', usage: 24 },
  { time: '10:05', usage: 45 },
  { time: '10:10', usage: 32 },
  { time: '10:15', usage: 78 },
  { time: '10:20', usage: 56 },
  { time: '10:25', usage: 34 },
  { time: '10:30', usage: 42 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold">Welcome back, Dev</h2>
          <p className="text-slate-400 mt-1">Here is what's happening across your engine instances.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20">
          <Activity size={16} />
          <span>System Online</span>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Projects', value: '12', icon: HardDrive, color: 'text-blue-400' },
          { label: 'CPU Usage', value: '42%', icon: Cpu, color: 'text-cyan-400' },
          { label: 'Avg Build Time', value: '4.2m', icon: Clock, color: 'text-purple-400' },
          { label: 'Build Success', value: '98.5%', icon: Activity, color: 'text-emerald-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start">
              <span className="text-slate-400 text-sm font-medium">{stat.label}</span>
              <stat.icon className={stat.color} size={20} />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className="text-xs text-emerald-400 font-medium">+2.1%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Build Time Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-semibold mb-6 flex items-center justify-between">
            Weekly Build Performance
            <span className="text-xs font-normal text-slate-500">Minutes per day</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buildData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#06b6d4' }}
                />
                <Bar dataKey="time" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Usage Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-semibold mb-6 flex items-center justify-between">
            Live CPU Load
            <span className="text-xs font-normal text-slate-500">Real-time telemetrics</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuData}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                   itemStyle={{ color: '#8b5cf6' }}
                />
                <Area type="monotone" dataKey="usage" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUsage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Latest Hub Operations</h3>
          <button className="text-cyan-400 text-sm hover:underline">View All Logs</button>
        </div>
        <div className="divide-y divide-slate-800">
          {[
            { action: 'Build Complete', project: 'Project Arrakis', time: '2 mins ago', status: 'Success' },
            { action: 'Asset Imported', project: 'Neon City 2077', time: '15 mins ago', status: 'Notice' },
            { action: 'Git Push', project: 'Space Drifter', time: '1 hour ago', status: 'Success' },
            { action: 'Compile Error', project: 'Legacy Engine', time: '2 hours ago', status: 'Failed' },
          ].map((item, i) => (
            <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-900/40 transition-colors">
              <div className={`w-2 h-2 rounded-full ${item.status === 'Success' ? 'bg-emerald-400' : item.status === 'Failed' ? 'bg-red-400' : 'bg-cyan-400'}`} />
              <div className="flex-1">
                <p className="font-medium text-slate-200">{item.action}</p>
                <p className="text-xs text-slate-500">{item.project}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-mono">{item.time}</p>
              </div>
              <button className="text-slate-600 hover:text-slate-300">
                <ExternalLink size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
