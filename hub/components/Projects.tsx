
import React, { useState, useEffect } from 'react';
import { Project, NavTab } from '../../types';
import { Plus, Search, Filter, FolderOpen, MoreVertical, Clock, ExternalLink, Trash2 } from 'lucide-react';

interface ProjectsProps {
  setActiveTab: (tab: NavTab) => void;
}

// Detect engine type from project files
const detectEngine = (files: string[]): 'Unreal' | 'Unity' | 'Godot' | 'NexGen-Native' | 'Bevy' => {
  const fileList = files.map(f => f.toLowerCase());
  // Check NexGen/Bevy (Rust) first - Cargo.toml is definitive
  if (fileList.some(f => f === 'cargo.toml')) return 'NexGen-Native';
  if (fileList.some(f => f.endsWith('.uproject'))) return 'Unreal';
  if (fileList.some(f => f === 'project.godot' || f.endsWith('.gd'))) return 'Godot';
  // Unity check - only if no Cargo.toml (both have assets folders)
  if (fileList.some(f => f.endsWith('.unity') || (f === 'assets' && fileList.includes('projectsettings')))) return 'Unity';
  return 'NexGen-Native';
};

const Projects: React.FC<ProjectsProps> = ({ setActiveTab }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Unreal' | 'Unity' | 'Godot' | 'NexGen-Native'>('All');
  const [projects, setProjects] = useState<Project[]>(() => {
    // Load from localStorage on init
    const saved = localStorage.getItem('nexgen-projects');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever projects change
  useEffect(() => {
    localStorage.setItem('nexgen-projects', JSON.stringify(projects));
  }, [projects]);

  // Migrate existing projects to new thumbnail
  useEffect(() => {
    setProjects(prev => prev.map(p => {
      if (p.thumbnail && p.thumbnail.includes('picsum.photos')) {
        return { ...p, thumbnail: '/default_project_thumb.png' };
      }
      return p;
    }));
  }, []);

  // Add new project from file system
  const handleAddProject = async () => {
    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      const files: string[] = [];

      // Scan root files for engine detection
      for await (const entry of dirHandle.values()) {
        files.push(entry.name);
      }

      const engine = detectEngine(files);
      const newProject: Project = {
        id: `proj_${Date.now()}`,
        name: dirHandle.name,
        engine,
        lastModified: 'Just now',
        status: 'Development',
        thumbnail: '/default_project_thumb.png',
        progress: 0,
        path: dirHandle.name
      };

      setProjects(prev => [newProject, ...prev]);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Failed to add project:', error);
      }
    }
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || p.engine === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Project Library</h2>
          <p className="text-slate-400 mt-1">Manage and launch your engine instances.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 w-64 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-300 hover:text-white transition-colors">
            <Filter size={16} />
            Filter
          </button>
          <button onClick={handleAddProject} className="flex items-center gap-2 px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 active:scale-95">
            <Plus size={18} strokeWidth={3} />
            Create New
          </button>
        </div>
      </header>

      {/* Engine Filters */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
        {['All', 'Unreal', 'Unity', 'Godot', 'NexGen-Native'].map((eng) => (
          <button
            key={eng}
            onClick={() => setFilter(eng as any)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === eng
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
          >
            {eng}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="group glass-panel rounded-3xl border border-slate-800/50 overflow-hidden flex flex-col hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(6,182,212,0.05)] transition-all duration-500"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={project.thumbnail}
                alt={project.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-cyan-400 border border-cyan-500/30">
                  {project.engine}
                </span>
                <span className={`px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest border ${project.status === 'Production' ? 'text-emerald-400 border-emerald-500/30' :
                  project.status === 'Alpha' ? 'text-amber-400 border-amber-500/30' :
                    'text-purple-400 border-purple-500/30'
                  }`}>
                  {project.status}
                </span>
              </div>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                <button className="p-2.5 bg-cyan-500 text-slate-950 rounded-xl shadow-xl hover:bg-cyan-400 active:scale-95 transition-all">
                  <FolderOpen size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-slate-100 tracking-tight group-hover:text-cyan-400 transition-colors">{project.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-slate-500">
                    <Clock size={12} />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Modified {project.lastModified}</span>
                  </div>
                </div>
                <button onClick={() => handleDeleteProject(project.id)} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors" title="Remove project">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">Deployment Progress</span>
                  <span className="text-cyan-400">{project.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                      <img src={`https://picsum.photos/24/24?seed=user${i + (project.id === 'p1' ? 10 : 20)}`} alt="User" />
                    </div>
                  ))}
                  <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400">
                    +5
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab(NavTab.NEXUS)}
                  className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Configure <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State with Guidance */}
        {projects.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <FolderOpen size={40} className="text-cyan-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">No Projects Yet</h3>
              <p className="text-slate-400 max-w-md">Add your game projects to manage them from NexGen Hub.</p>
            </div>
            <div className="glass-panel rounded-2xl border border-cyan-500/20 p-6 max-w-lg space-y-4 text-left">
              <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest">Getting Started</h4>
              <ol className="space-y-3 text-sm text-slate-300">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                  <span>Create a <code className="text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">Projects</code> folder in your NexGen Engine directory</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                  <span>Move or create your game projects inside that folder</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                  <span>Click <strong className="text-white">Create New</strong> and select your project folder</span>
                </li>
              </ol>
            </div>
            <button onClick={handleAddProject} className="flex items-center gap-2 px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 active:scale-95 mt-4">
              <Plus size={18} strokeWidth={3} />
              Add Existing Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
