
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Monitor, Cpu, Globe, Shield, Save, RefreshCw, Key, Eye, EyeOff, CheckCircle, Sparkles } from 'lucide-react';

const Settings: React.FC = () => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [savedApiKey, setSavedApiKey] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  // Toggle States
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true);
  const [autoSyncNexus, setAutoSyncNexus] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('nexgen_api_key');
    if (storedKey) {
      setSavedApiKey(storedKey);
      setApiKeyInput(storedKey);
    }

    // Load toggle settings
    const storedHwAccel = localStorage.getItem('nexgen_hardware_acceleration');
    if (storedHwAccel !== null) {
      setHardwareAcceleration(storedHwAccel === 'true');
    }

    const storedAutoSync = localStorage.getItem('nexgen_auto_sync');
    if (storedAutoSync !== null) {
      setAutoSyncNexus(storedAutoSync === 'true');
    }
  }, []);

  const handleSaveSettings = () => {
    // Save API Key
    if (apiKeyInput.trim()) {
      localStorage.setItem('nexgen_api_key', apiKeyInput.trim());
      setSavedApiKey(apiKeyInput.trim());
      (window as any).__NEXGEN_API_KEY__ = apiKeyInput.trim();
    }

    // Save toggle settings
    localStorage.setItem('nexgen_hardware_acceleration', String(hardwareAcceleration));
    localStorage.setItem('nexgen_auto_sync', String(autoSyncNexus));

    // Update global flags for runtime access
    (window as any).__NEXGEN_HW_ACCEL__ = hardwareAcceleration;
    (window as any).__NEXGEN_AUTO_SYNC__ = autoSyncNexus;

    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleDiscardChanges = () => {
    // Reload from localStorage
    const storedKey = localStorage.getItem('nexgen_api_key');
    setApiKeyInput(storedKey || '');

    const storedHwAccel = localStorage.getItem('nexgen_hardware_acceleration');
    setHardwareAcceleration(storedHwAccel === 'true' || storedHwAccel === null);

    const storedAutoSync = localStorage.getItem('nexgen_auto_sync');
    setAutoSyncNexus(storedAutoSync === 'true');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="text-cyan-400" /> Hub Settings
        </h2>
        <p className="text-slate-400 mt-1">Configure your workspace environment and engine integrations.</p>
      </header>

      <div className="grid gap-6">
        {/* AI / API Configuration Section */}
        <section className="glass-panel p-8 rounded-3xl border border-purple-500/20 bg-purple-500/5 space-y-6">
          <div className="flex items-center gap-3 border-b border-purple-500/20 pb-4">
            <Sparkles className="text-purple-400" size={20} />
            <h3 className="text-lg font-bold uppercase tracking-widest text-slate-200">AI Configuration</h3>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter flex items-center gap-2">
                <Key size={12} /> Gemini API Key
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Enter your Gemini API key..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-400 focus:outline-none focus:border-purple-500/50 pr-10"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-600">
                Get your API key from{' '}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                  Google AI Studio
                </a>
                . This key enables AI features like sprite generation, audio synthesis, and the AI assistant.
              </p>
              {savedApiKey && (
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle size={14} className="text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">API Key Configured</span>
                </div>
              )}
            </div>
          </div>
        </section>

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
            {/* Hardware Acceleration Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50">
              <div>
                <p className="text-sm font-bold">Hardware Acceleration</p>
                <p className="text-[10px] text-slate-500">Enable GPU rendering for the UI</p>
              </div>
              <button
                onClick={() => setHardwareAcceleration(!hardwareAcceleration)}
                className={`w-12 h-6 rounded-full relative transition-colors ${hardwareAcceleration ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all ${hardwareAcceleration ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            {/* Auto-Sync Nexus Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50">
              <div>
                <p className="text-sm font-bold">Auto-Sync Nexus</p>
                <p className="text-[10px] text-slate-500">Keep assets linked in background</p>
              </div>
              <button
                onClick={() => setAutoSyncNexus(!autoSyncNexus)}
                className={`w-12 h-6 rounded-full relative transition-colors ${autoSyncNexus ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all ${autoSyncNexus ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4">
          <button
            onClick={handleDiscardChanges}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-sm font-bold transition-all"
          >
            <RefreshCw size={18} /> Discard Changes
          </button>
          <button
            onClick={handleSaveSettings}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-black transition-all shadow-lg ${saveStatus === 'saved'
              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-500/20'
              }`}
          >
            {saveStatus === 'saved' ? <CheckCircle size={18} /> : <Save size={18} />}
            {saveStatus === 'saved' ? 'Saved!' : 'Save Configurations'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
