
import React from 'react';
import { Settings as SettingsIcon, Monitor, Cpu, Globe, Shield, Save, RefreshCw } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="text-cyan-400" /> Hub Settings
        </h2>
        <p className="text-slate-400 mt-1">Configure your workspace environment and engine integrations.</p>
      </header>

      <div className="grid gap-6">
        {/* Engine Paths Section */}
        <section className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Cpu className="text-purple-400" size={20} />
            <h3 className="text-lg font-bold uppercase tracking-widest text-slate-200">Engine SDK Paths</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Unreal Engine 5.x', path: 'C:/Program Files/Epic Games/UE_5.4' },
              { label: 'Unity Hub', path: 'C:/Program Files/Unity Hub/Unity Hub.exe' },
              { label: 'Godot Engine', path: 'D:/Engines/Godot_v4.2.exe' },
            ].map((engine, i) => (
              <div key={i} className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{engine.label}</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    defaultValue={engine.path}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-400 focus:outline-none focus:border-cyan-500/50"
                  />
                  <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors">Browse</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Global Hub Preferences */}
        <section className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Monitor className="text-cyan-400" size={20} />
            <h3 className="text-lg font-bold uppercase tracking-widest text-slate-200">Workspace Preferences</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50">
              <div>
                <p className="text-sm font-bold">Hardware Acceleration</p>
                <p className="text-[10px] text-slate-500">Enable GPU rendering for the UI</p>
              </div>
              <div className="w-12 h-6 bg-cyan-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50">
              <div>
                <p className="text-sm font-bold">Auto-Sync Nexus</p>
                <p className="text-[10px] text-slate-500">Keep assets linked in background</p>
              </div>
              <div className="w-12 h-6 bg-slate-700 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-sm font-bold transition-all">
            <RefreshCw size={18} /> Discard Changes
          </button>
          <button className="flex items-center gap-2 px-8 py-3 bg-cyan-500 text-slate-950 rounded-2xl text-sm font-black transition-all hover:bg-cyan-400 shadow-lg shadow-cyan-500/20">
            <Save size={18} /> Save Configurations
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
