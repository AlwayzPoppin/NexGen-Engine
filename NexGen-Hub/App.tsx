
import React, { useState, useEffect, useRef } from 'react';
import { NavTab, Project } from './types';
import Sidebar from './components/Sidebar';
import Projects from './components/Projects';
import Settings from './components/Settings';
import NexusPlugin from './components/NexusPlugin';
import BackgroundVideo from './components/BackgroundVideo';
import NexHubInit from './components/NexHubInit';
import {
  Search,
  Bell,
  HelpCircle,
  Zap,
  Terminal,
  Layers,
  ChevronRight,
  Home as HomeIcon,
  Trash2,
  LogIn,
  X,
  Check,
  Github,
  Mail,
  Shield,
  FolderKanban,
  GitBranch,
  Settings as SettingsIcon,
  Database
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>(NavTab.PROJECTS);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [projectHandle, setProjectHandle] = useState<any>(null); // Global FileSystemDirectoryHandle

  // UI States
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; mode: string; avatar: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSelectProject = (project: Project) => {
    setActiveProject(project);
    setActiveTab(NavTab.NEXUS);
  };

  const handleClearSession = () => {
    window.dispatchEvent(new CustomEvent('nexgen:clear-session'));
    setIsClearConfirmOpen(false);
  };

  // Omisearch Commands
  const commands = [
    { id: 'nav_projects', label: 'Open Project Library', description: 'Switch to project management view', icon: FolderKanban, action: () => setActiveTab(NavTab.PROJECTS) },
    { id: 'nav_nexus', label: 'Launch Nexus Core', description: 'Open the main development suite', icon: GitBranch, action: () => setActiveTab(NavTab.NEXUS) },
    { id: 'nav_settings', label: 'Configure Settings', description: 'Adjust SDK paths and AI preferences', icon: SettingsIcon, action: () => setActiveTab(NavTab.SETTINGS) },
    { id: 'action_clear', label: 'Clear Session', description: 'Reset all active buffers and context', icon: Trash2, action: () => setIsClearConfirmOpen(true) },
    { id: 'action_help', label: 'Open Help', description: 'View shortcuts and documentation', icon: HelpCircle, action: () => setIsHelpOpen(true) },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCommandSelect = (cmd: any) => {
    cmd.action();
    setSearchQuery('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      handleCommandSelect(filteredCommands[selectedIndex]);
    } else if (e.key === 'Escape') {
      setSearchQuery('');
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('nexgen:toggle-ai-panel'));
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case NavTab.PROJECTS:
        return <Projects setActiveTab={setActiveTab} projectHandle={projectHandle} setProjectHandle={setProjectHandle} onSelectProject={handleSelectProject} />;
      case NavTab.NEXUS:
        return <NexusPlugin activeProject={activeProject} projectHandle={projectHandle} setProjectHandle={setProjectHandle} />;
      case NavTab.SETTINGS:
        return <Settings />;
      default:
        return <Projects setActiveTab={setActiveTab} projectHandle={projectHandle} setProjectHandle={setProjectHandle} onSelectProject={handleSelectProject} />;
    }
  };

  if (!isInitialized) {
    return <NexHubInit onInitialize={() => setIsInitialized(true)} />;
  }

  return (
    <div className="relative h-screen w-full text-slate-100 overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <BackgroundVideo isInitialized={isInitialized} />

      <div className="relative z-10 flex h-full w-full bg-transparent">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setIsSignInOpen={setIsSignInOpen}
          setIsLegalOpen={setIsLegalOpen}
          user={user}
          setUser={setUser}
        />

        <main className="flex-1 flex flex-col min-w-0 bg-transparent relative scanline-effect">
          <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 z-20 backdrop-blur-2xl sticky top-0 bg-slate-950/40">
            <div className="flex items-center gap-3 text-slate-400 text-xs font-bold tracking-widest uppercase">
              <span className="hover:text-cyan-400 cursor-pointer transition-colors" onClick={() => setIsInitialized(false)}>Core</span>
              <span className="text-slate-700">/</span>
              <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                {activeTab.replace('_', ' ')}
              </span>
              {activeProject && (
                <div className="flex items-center gap-2 ml-4 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl animate-in zoom-in slide-in-from-left-4 duration-500 group cursor-help transition-all hover:bg-cyan-500/20" title={`Active Project: ${activeProject.name}`}>
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,1)]" />
                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
                  </div>
                  <div className="flex flex-col -space-y-0.5">
                    <span className="text-cyan-400 text-[9px] font-black tracking-[0.2em] max-w-[200px] truncate uppercase">
                      {activeProject.name}
                    </span>
                    <span className="text-[7px] text-cyan-500/60 font-black tracking-widest uppercase">Target Database Synced</span>
                  </div>
                  <Database size={12} className="text-cyan-400 ml-1 group-hover:scale-110 transition-transform" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-8">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSelectedIndex(0); }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="COMMAND SEARCH (CTRL + P)"
                  className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-xl pl-12 pr-4 py-2.5 text-[11px] font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/50 w-72 transition-all placeholder:text-slate-700 uppercase"
                />

                {/* Omisearch Results Dropdown */}
                {searchQuery && (
                  <div className="absolute top-14 left-0 w-80 bg-[#0a0f1a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 space-y-1">
                      {filteredCommands.length > 0 ? (
                        filteredCommands.map((cmd, idx) => (
                          <button
                            key={cmd.id}
                            onClick={() => handleCommandSelect(cmd)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${idx === selectedIndex ? 'bg-cyan-500/20 border border-cyan-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                          >
                            <div className={`p-2 rounded-lg ${idx === selectedIndex ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                              <cmd.icon size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-[10px] font-black uppercase tracking-widest ${idx === selectedIndex ? 'text-white' : 'text-slate-200'}`}>{cmd.label}</p>
                              <p className="text-[9px] text-slate-500 truncate">{cmd.description}</p>
                            </div>
                            {idx === selectedIndex && (
                              <ChevronRight size={12} className="text-cyan-400" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Search size={24} className="text-slate-700 mx-auto mb-3 opacity-20" />
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No Commands Found</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-slate-950/50 border-t border-white/5 flex items-center justify-between text-[8px] font-bold text-slate-600 uppercase tracking-tighter">
                      <div className="flex gap-3">
                        <span><kbd className="bg-slate-800 px-1 rounded text-slate-400">↑↓</kbd> Navigate</span>
                        <span><kbd className="bg-slate-800 px-1 rounded text-slate-400">Enter</kbd> Select</span>
                      </div>
                      <span><kbd className="bg-slate-800 px-1 rounded text-slate-400">Esc</kbd> Close</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-5 text-slate-500">
                <button
                  onClick={() => setIsClearConfirmOpen(true)}
                  className="hover:text-red-400 transition-colors"
                  title="Clear Project Session"
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`hover:text-cyan-400 transition-colors relative ${isNotificationsOpen ? 'text-cyan-400' : ''}`}
                >
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full border-2 border-slate-950 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />

                  {isNotificationsOpen && (
                    <div className="absolute top-12 right-0 w-80 bg-[#0a0f1a] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        <Bell size={12} /> Recent Notifications
                      </h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                          <p className="text-[10px] font-bold text-white mb-1">Local AI Connected</p>
                          <p className="text-[9px] text-slate-400">Ollama instance detected on port 11434.</p>
                        </div>
                        <div className="p-3 bg-slate-900 border border-white/5 rounded-xl">
                          <p className="text-[10px] font-bold text-slate-300 mb-1">Assets Scanned</p>
                          <p className="text-[9px] text-slate-500">123 assets identified in the repository.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setIsHelpOpen(true)}
                  className="hover:text-white transition-colors"
                >
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

      {/* MODALS */}

      {/* Clear Session Confirmation */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#0a0f1a] border border-red-500/20 rounded-[2.5rem] w-[450px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Clear Session?</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-8">
                This will reset all temporary AI context, clear pending file edits, and unload current assets. This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsClearConfirmOpen(false)}
                  className="flex-1 py-4 bg-slate-900 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:text-white transition-all shadow-xl"
                >
                  Keep Working
                </button>
                <button
                  onClick={handleClearSession}
                  className="flex-1 py-4 bg-red-600 text-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-xl"
                >
                  Yes, Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#0a0f1a] border border-cyan-500/20 rounded-[3rem] w-[600px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400">
                    <HelpCircle size={28} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-widest leading-none">Command Center</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">Quick Reference & Shortcuts</p>
                  </div>
                </div>
                <button onClick={() => setIsHelpOpen(false)} className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="p-5 bg-slate-900/40 rounded-2xl border border-white/5">
                  <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4">AI Commands</h4>
                  <ul className="space-y-3">
                    <li className="flex justify-between items-center text-[10px] font-bold"><span className="text-slate-400">Navigate Module</span><span className="text-slate-100 font-mono bg-slate-800 px-2 py-0.5 rounded">Go to [module]</span></li>
                    <li className="flex justify-between items-center text-[10px] font-bold"><span className="text-slate-400">Apply Edits</span><span className="text-slate-100 font-mono bg-slate-800 px-2 py-0.5 rounded">Neural Logic</span></li>
                    <li className="flex justify-between items-center text-[10px] font-bold"><span className="text-slate-400">Generate Sprite</span><span className="text-slate-100 font-mono bg-slate-800 px-2 py-0.5 rounded">Build Sprite</span></li>
                  </ul>
                </div>
                <div className="p-5 bg-slate-900/40 rounded-2xl border border-white/5">
                  <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">Hotkeys</h4>
                  <ul className="space-y-3">
                    <li className="flex justify-between items-center text-[10px] font-bold"><span className="text-slate-400">Open Search</span><span className="text-slate-100 font-mono bg-slate-800 px-2 py-0.5 rounded">CTRL + P</span></li>
                    <li className="flex justify-between items-center text-[10px] font-bold"><span className="text-slate-400">AI Panel</span><span className="text-slate-100 font-mono bg-slate-800 px-2 py-0.5 rounded">CTRL + I</span></li>
                    <li className="flex justify-between items-center text-[10px] font-bold"><span className="text-slate-400">Sync Graph</span><span className="text-slate-100 font-mono bg-slate-800 px-2 py-0.5 rounded">CTRL + S</span></li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setIsHelpOpen(false)}
                className="w-full py-4 bg-cyan-500 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-xl"
              >
                Dismiss Reference
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign-In Modal */}
      {isSignInOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#0a0f1a] border border-cyan-500/20 rounded-[3rem] w-[480px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400 mx-auto mb-6 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                <LogIn size={40} />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">NexGen Identity</h2>
              <p className="text-sm text-slate-400 mb-10 font-bold uppercase tracking-widest opacity-60">Authentication Protocol</p>

              <div className="space-y-4 mb-10">
                <button
                  onClick={() => { setUser({ name: 'Nexus User', mode: 'Cloud Sync', avatar: 'https://picsum.photos/32/32?seed=google' }); setIsSignInOpen(false); }}
                  className="w-full py-4 bg-white text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-100 transition-all"
                >
                  <Mail size={18} /> Sign in with Google
                </button>
                <button
                  onClick={() => { setUser({ name: 'Git Master', mode: 'Repo Mode', avatar: 'https://picsum.photos/32/32?seed=github' }); setIsSignInOpen(false); }}
                  className="w-full py-4 bg-slate-900 border border-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all"
                >
                  <Github size={18} /> Sync with GitHub
                </button>
                <button
                  onClick={() => { setUser({ name: 'Local Dev', mode: 'Offline Mode', avatar: 'https://picsum.photos/32/32?seed=local' }); setIsSignInOpen(false); }}
                  className="w-full py-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-cyan-500/20 transition-all"
                >
                  <Terminal size={18} /> Continue as Guest
                </button>
              </div>

              <button onClick={() => setIsSignInOpen(false)} className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-all">
                Cancel Authentication
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Legal Modal */}
      {isLegalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#0a0f1a] border border-white/10 rounded-[3rem] w-[800px] h-[600px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                  <Shield size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-widest leading-none">Legal Documentation</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">NexGen Engine Compliance</p>
                </div>
              </div>
              <button onClick={() => setIsLegalOpen(false)} className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar text-xs text-slate-400 leading-relaxed font-mono">
              <section className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FileText size={14} className="text-cyan-400" /> Terms of Service
                  </h3>
                  <p>Welcome to NexGen Hub. By using this software, you agree to bound by the following terms...</p>
                  <p className="mt-2 text-[10px]">1. PROPRIETARY RIGHTS: The NexGen Engine and all associated tools are the sole property of NexGen Systems...</p>
                  <p className="mt-2 text-[10px]">2. USAGE LIMITS: Commercial deployment of projects built with NexGen Engine requires an active Enterprise License...</p>
                </div>

                <div className="h-px bg-white/5 w-full" />

                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Shield size={14} className="text-purple-400" /> Privacy Policy
                  </h3>
                  <p>Your privacy is paramount. NexGen Engine operates primarily in Local-First mode...</p>
                  <p className="mt-2 text-[10px]">DATA COLLECTION: We do not collect project data or source code. Telemetry is limited to crash reports and API usage if enabled...</p>
                </div>

                <div className="h-px bg-white/5 w-full" />

                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Layers size={14} className="text-amber-400" /> Open Source & Licenses
                  </h3>
                  <p>NexGen Hub utilizes several open-source libraries including React, Lucide, and TailwindCSS...</p>
                  <p className="mt-2 text-[10px]">Full license disclosures available at /legal/licenses.json</p>
                </div>
              </section>
            </div>

            <div className="p-8 border-t border-white/5 bg-slate-950/50 flex justify-end">
              <button
                onClick={() => setIsLegalOpen(false)}
                className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all border border-white/5"
              >
                Close Documentation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
