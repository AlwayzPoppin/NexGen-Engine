
import React from 'react';
import { NavTab } from '../../types';
import {
  FolderKanban,
  Settings,
  LogOut,
  Zap,
  GitBranch,
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  // Stripped down navigation to focus on the Core Launcher and Nexus Tool
  const navItems = [
    { id: NavTab.PROJECTS, label: 'Projects', icon: FolderKanban },
    { id: NavTab.NEXUS, label: 'Nexus Core', icon: GitBranch },
    { id: NavTab.SETTINGS, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-full bg-slate-950/40 backdrop-blur-xl border-r border-slate-800/50 flex flex-col z-30">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          <Zap size={24} fill="currentColor" />
        </div>
        <h1 className="font-orbitron text-xl font-bold tracking-wider text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">NEXGEN</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${activeTab === item.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
              }`}
          >
            <item.icon size={18} className={activeTab === item.id ? 'text-cyan-400' : 'group-hover:text-slate-100'} />
            <span className="font-medium tracking-wide text-sm">{item.label}</span>
            {activeTab === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,1)]" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800/50">
        <div className="flex items-center gap-3 p-3 bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800/50">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-600">
            <img src="https://picsum.photos/32/32?seed=dev_user" alt="User" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-slate-200">Senior Dev</p>
            <p className="text-[9px] text-slate-500 truncate uppercase font-bold tracking-tighter">Enterprise Mode</p>
          </div>
          <button className="text-slate-500 hover:text-red-400 transition-colors">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
