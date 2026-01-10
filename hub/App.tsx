
import React, { useState } from 'react';
import { NavTab } from './types';
import Sidebar from './components/Sidebar';
import Projects from './components/Projects';
import Settings from './components/Settings';
import NexusPlugin from './components/NexusPlugin';
import BackgroundVideo from './components/BackgroundVideo';
import NexHubInit from './components/NexHubInit';
import { Search, Bell, HelpCircle, Zap, Terminal, Layers, ChevronRight, Home as HomeIcon } from 'lucide-react';

interface BootCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  status: string;
  color: string;
  onClick?: () => void;
}

const BootCard: React.FC<BootCardProps> = ({ icon: Icon, title, value, status, color, onClick }) => (
  <div
    onClick={onClick}
    className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 text-left transition-all hover:border-cyan-500/40 hover:bg-slate-900/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] cursor-pointer overflow-hidden max-w-sm mx-auto w-full"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 blur-3xl rounded-full -mr-8 -mt-8 group-hover:bg-cyan-500/20 transition-all`} />
    <div className="flex items-start justify-between mb-4 relative z-10">
      <div className={`p-3 rounded-xl bg-slate-950/50 border border-white/5 text-${color}-400 group-hover:text-cyan-400 transition-colors`}>
        <Icon size={24} />
      </div>
      <ChevronRight size={16} className="text-slate-700 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors">{value}</h3>
      <div className="mt-3 flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full bg-${color}-500 animate-pulse`} />
        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">{status}</span>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>(NavTab.PROJECTS);
  const [isInitialized, setIsInitialized] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case NavTab.PROJECTS:
        return <Projects setActiveTab={setActiveTab} />;
      case NavTab.NEXUS:
        return <NexusPlugin />;
      case NavTab.SETTINGS:
        return <Settings />;
      default:
        return <Projects setActiveTab={setActiveTab} />;
    }
  };

  if (!isInitialized) {
    return <NexHubInit onInitialize={() => setIsInitialized(true)} />;
  }

  return (
    <div className="relative h-screen w-full text-slate-100 overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <BackgroundVideo isInitialized={isInitialized} />

      <div className="relative z-10 flex h-full w-full bg-transparent">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 flex flex-col min-w-0 bg-transparent relative scanline-effect">
          <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 z-20 backdrop-blur-2xl sticky top-0 bg-slate-950/40">
            <div className="flex items-center gap-4 text-slate-400 text-xs font-bold tracking-widest uppercase">
              <span className="hover:text-cyan-400 cursor-pointer transition-colors" onClick={() => setIsInitialized(false)}>Core</span>
              <span className="text-slate-700">/</span>
              <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                {activeTab.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-8">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="COMMAND SEARCH (CTRL + P)"
                  className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-xl pl-12 pr-4 py-2.5 text-[11px] font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/50 w-72 transition-all placeholder:text-slate-700 uppercase"
                />
              </div>

              <div className="flex items-center gap-5 text-slate-500">
                <button className="hover:text-cyan-400 transition-colors relative">
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full border-2 border-slate-950 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                </button>
                <button className="hover:text-white transition-colors">
                  <HelpCircle size={20} />
                </button>
                <div className="h-6 w-[1px] bg-white/10 mx-2" />
                <div className="flex items-center gap-3 bg-slate-900/40 py-1.5 px-3 rounded-lg border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-bold text-slate-300">SYNCED</span>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto z-10 custom-scrollbar bg-transparent p-10">
            <div className="max-w-[1600px] mx-auto">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
