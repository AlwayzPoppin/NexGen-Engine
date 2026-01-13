
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Monitor, Cpu, Globe, Shield, Save, RefreshCw, Key, Eye, EyeOff, CheckCircle, Sparkles, Bot, Loader2, AlertCircle } from 'lucide-react';

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

const Settings: React.FC = () => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [savedApiKey, setSavedApiKey] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  // Toggle States
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true);
  const [autoSyncNexus, setAutoSyncNexus] = useState(false);

  // Ollama States
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [selectedOllamaModel, setSelectedOllamaModel] = useState<string>('');
  const [ollamaStatus, setOllamaStatus] = useState<'idle' | 'detecting' | 'connected' | 'error'>('idle');
  const [ollamaEnabled, setOllamaEnabled] = useState(false);

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

    // Load Ollama settings
    const storedOllamaEnabled = localStorage.getItem('nexgen_ollama_enabled');
    const storedOllamaModel = localStorage.getItem('nexgen_ollama_model');
    if (storedOllamaEnabled === 'true') {
      setOllamaEnabled(true);
      if (storedOllamaModel) setSelectedOllamaModel(storedOllamaModel);
    }
  }, []);

  // Detect Ollama models
  const detectOllamaModels = async () => {
    setOllamaStatus('detecting');
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
      });
      if (response.ok) {
        const data = await response.json();
        setOllamaModels(data.models || []);
        setOllamaStatus('connected');
        if (data.models?.length > 0 && !selectedOllamaModel) {
          setSelectedOllamaModel(data.models[0].name);
        }
      } else {
        setOllamaStatus('error');
      }
    } catch (e) {
      console.error('Ollama detection failed:', e);
      setOllamaStatus('error');
    }
  };

  // Auto-detect on enable
  useEffect(() => {
    if (ollamaEnabled && ollamaStatus === 'idle') {
      detectOllamaModels();
    }
  }, [ollamaEnabled]);

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

    // Save Ollama settings
    localStorage.setItem('nexgen_ollama_enabled', String(ollamaEnabled));
    localStorage.setItem('nexgen_ollama_model', selectedOllamaModel);
    (window as any).__NEXGEN_OLLAMA_ENABLED__ = ollamaEnabled;
    (window as any).__NEXGEN_OLLAMA_MODEL__ = selectedOllamaModel;

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
          <div className="space-y-6">
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
              </p>
              {savedApiKey && (
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle size={14} className="text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">API Key Configured</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-purple-500/10">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter flex items-center gap-2">
                  <Monitor size={12} /> USD Budget Limit ($)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={localStorage.getItem('nexgen_neural_usage') ? JSON.parse(localStorage.getItem('nexgen_neural_usage')!).usdBudgetLimit : 0}
                    onChange={(e) => {
                      const usageData = localStorage.getItem('nexgen_neural_usage') || '{"totalTokens":0,"estimatedCost":0,"usdBudgetLimit":0}';
                      const usage = JSON.parse(usageData);
                      usage.usdBudgetLimit = parseFloat(e.target.value) || 0;
                      localStorage.setItem('nexgen_neural_usage', JSON.stringify(usage));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-400 focus:outline-none focus:border-purple-500/50"
                    placeholder="0.00 = Unlimited"
                  />
                </div>
                <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">
                  Set to 0.00 for no limit. Safety block triggers when burn reaches limit.
                </p>
              </div>
              <div className="flex flex-col gap-2 justify-end">
                <button
                  onClick={() => {
                    if (confirm('Reset all session usage stats and budget burn?')) {
                      localStorage.setItem('nexgen_neural_usage', JSON.stringify({ totalTokens: 0, estimatedCost: 0, usdBudgetLimit: 0 }));
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2.5 bg-pink-500/10 border border-pink-500/30 rounded-xl text-[10px] font-black text-pink-400 hover:bg-pink-500/20 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} /> Reset Neural Pulse
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Ollama Local AI Section */}
        <section className="glass-panel p-8 rounded-3xl border border-cyan-500/20 bg-cyan-500/5 space-y-6">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
            <div className="flex items-center gap-3">
              <Bot className="text-cyan-400" size={20} />
              <h3 className="text-lg font-bold uppercase tracking-widest text-slate-200">Local AI (Ollama)</h3>
            </div>
            <button
              onClick={() => setOllamaEnabled(!ollamaEnabled)}
              className={`relative w-12 h-6 rounded-full transition-all ${ollamaEnabled ? 'bg-cyan-500' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${ollamaEnabled ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>

          {ollamaEnabled && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${ollamaStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                  ollamaStatus === 'detecting' ? 'bg-amber-500 animate-pulse' :
                    ollamaStatus === 'error' ? 'bg-red-500' : 'bg-slate-600'
                  }`} />
                <span className="text-xs text-slate-400">
                  {ollamaStatus === 'connected' && `Connected - ${ollamaModels.length} models found`}
                  {ollamaStatus === 'detecting' && 'Detecting Ollama...'}
                  {ollamaStatus === 'error' && 'Ollama not running (start with: ollama serve)'}
                  {ollamaStatus === 'idle' && 'Not connected'}
                </span>
                <button
                  onClick={detectOllamaModels}
                  disabled={ollamaStatus === 'detecting'}
                  className="ml-auto px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-[10px] font-bold text-cyan-400 hover:bg-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {ollamaStatus === 'detecting' ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  Detect
                </button>
              </div>

              {ollamaModels.length > 0 && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Select Model</label>
                  <select
                    value={selectedOllamaModel}
                    onChange={(e) => setSelectedOllamaModel(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50"
                  >
                    {ollamaModels.map((model) => (
                      <option key={model.name} value={model.name}>
                        {model.name} ({(model.size / 1e9).toFixed(1)}GB)
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-600">
                    Used for code generation to save Gemini API tokens. Recommended: codellama, deepseek-coder, qwen2.5-coder
                  </p>
                </div>
              )}

              {ollamaStatus === 'error' && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertCircle size={14} className="text-red-400" />
                  <p className="text-[10px] text-red-400">
                    Make sure Ollama is installed and running. Run <code className="bg-red-500/20 px-1 rounded">ollama serve</code> in a terminal.
                  </p>
                </div>
              )}
            </div>
          )}

          {!ollamaEnabled && (
            <p className="text-[10px] text-slate-600">
              Enable to use local AI models for code generation (saves Gemini API tokens). Requires{' '}
              <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Ollama</a> installed locally.
            </p>
          )}
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
      </div >
    </div >
  );
};

export default Settings;
