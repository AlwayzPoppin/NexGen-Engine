import React, { useState } from 'react';
import {
    Rocket,
    GitBranch,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Database,
    Layers,
    GitMerge,
    Activity,
    Monitor,
    Cloud,
    Download,
    RefreshCcw,
    Terminal,
    Zap,
    BarChart3,
    ArrowRight,
    Play,
    Settings,
    Globe
} from 'lucide-react';
import { GlobalGameState, NexusAsset, Project } from '../types';

interface AirlockProps {
    projectName?: string;
    gameState?: GlobalGameState;
    assets?: NexusAsset[];
}

const Airlock: React.FC<AirlockProps> = ({ projectName = "NEXGEN PROJECT", gameState, assets = [] }) => {
    const [isDeploying, setIsDeploying] = useState(false);
    const [logs, setLogs] = useState([
        { time: '00:00:01', type: 'SYSTEM', message: 'Airlock initialized.' },
        { time: '00:00:02', type: 'SYNC', message: 'Repository connection established.' },
        { time: '00:00:03', type: 'CHECK', message: 'Pre-flight validation complete.' },
    ]);

    // Dynamic project stats from props
    const entityCount = gameState?.entities?.length || 0;
    const nodeCount = gameState?.nodes?.length || 0;
    const assetCount = assets.length;
    const spriteCount = assets.filter(a => a.type === 'Sprite').length;

    const projectStats = [
        { label: 'Total Entities', value: entityCount, icon: Layers, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
        { label: 'Asset Library', value: assetCount, icon: Database, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
        { label: 'Logic Nodes', value: nodeCount, icon: GitMerge, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        { label: 'Sprites', value: spriteCount, icon: Monitor, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    ];

    // Dynamic pre-flight checks based on project state
    const preflightChecks = [
        { label: 'Spawn Points', status: entityCount > 0 ? 'pass' : 'fail', detail: entityCount > 0 ? `${entityCount} entities defined` : 'No entities found' },
        { label: 'Workspace Link', status: 'warn', detail: 'No remote configured' },
        { label: 'Logic Integrity', status: nodeCount > 0 ? 'pass' : 'warn', detail: nodeCount > 0 ? `${nodeCount} nodes validated` : 'No logic nodes' },
        { label: 'Asset Manifest', status: assetCount > 0 ? 'pass' : 'fail', detail: assetCount > 0 ? `${assetCount} assets indexed` : 'Library is empty' },
    ];

    const exportTargets = [
        { label: 'Windows (x64)', status: 'ready', icon: Monitor },
        { label: 'Web (HTML5)', status: 'ready', icon: Globe },
        { label: 'Cloud Deploy', status: 'pending', icon: Cloud },
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pass': return <CheckCircle size={16} className="text-emerald-500" />;
            case 'warn': return <AlertTriangle size={16} className="text-amber-500" />;
            case 'fail': return <XCircle size={16} className="text-red-500" />;
            default: return <Activity size={16} className="text-slate-500" />;
        }
    };

    const handlePrepareRelease = () => {
        setIsDeploying(true);
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: 'BUILD', message: 'Preparing release bundle...' }]);
        setTimeout(() => {
            setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: 'BUILD', message: 'Release package ready for export.' }]);
            setIsDeploying(false);
        }, 2000);
    };

    return (
        <div className="space-y-8 flex flex-col h-[calc(100vh-140px)] animate-in slide-in-from-right-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <div>
                    <h2 className="text-4xl font-black font-orbitron text-white tracking-tighter flex items-center gap-4">
                        <Rocket size={40} className="text-orange-500" /> AIRLOCK <span className="text-orange-500/50">DEPLOY</span>
                    </h2>
                    <p className="text-[10px] text-slate-500 font-black tracking-[0.4em] uppercase mt-2">Build Pipeline & Project Health</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-6 py-3 bg-slate-900/40 border border-white/5 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-cyan-500/30 hover:text-cyan-400 transition-all flex items-center gap-2">
                        <GitBranch size={14} /> Repo Sync
                    </button>
                    <button
                        onClick={handlePrepareRelease}
                        disabled={isDeploying}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isDeploying
                            ? 'bg-orange-500/20 text-orange-400 cursor-wait'
                            : 'bg-orange-600 text-white hover:bg-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)]'
                            }`}
                    >
                        <Play size={14} className={isDeploying ? 'animate-pulse' : ''} />
                        {isDeploying ? 'Building...' : 'Prepare Release'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-0 grid grid-cols-3 gap-6">
                {/* Left Column: Stats & Checks */}
                <div className="col-span-2 flex flex-col gap-6">
                    {/* Project Stats */}
                    <div className="grid grid-cols-4 gap-4">
                        {projectStats.map(stat => (
                            <div key={stat.label} className={`glass-panel rounded-2xl border p-6 ${stat.bg} flex flex-col items-center gap-3`}>
                                <stat.icon size={24} className={stat.color} />
                                <span className="text-3xl font-black text-white">{stat.value}</span>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Pre-flight Checks */}
                    <div className="glass-panel rounded-3xl border border-white/10 bg-slate-950/40 p-6 flex-1">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-6">
                            <Zap size={14} className="text-amber-500" /> Pre-Flight Checks
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {preflightChecks.map(check => (
                                <div
                                    key={check.label}
                                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all ${check.status === 'pass'
                                        ? 'bg-emerald-500/5 border-emerald-500/20'
                                        : check.status === 'warn'
                                            ? 'bg-amber-500/5 border-amber-500/20'
                                            : 'bg-red-500/5 border-red-500/20'
                                        }`}
                                >
                                    {getStatusIcon(check.status)}
                                    <div className="flex-1">
                                        <span className="text-[12px] font-black text-white block">{check.label}</span>
                                        <span className="text-[9px] font-mono text-slate-500">{check.detail}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Process Log */}
                    <div className="glass-panel rounded-3xl border border-white/10 bg-slate-950/40 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Terminal size={14} className="text-cyan-500" /> Process Log
                            </h3>
                            <button className="p-2 bg-slate-900/40 rounded-xl hover:bg-cyan-500/10 text-slate-500 hover:text-cyan-400 transition-all">
                                <RefreshCcw size={14} />
                            </button>
                        </div>
                        <div className="bg-slate-950 rounded-2xl p-4 h-32 overflow-y-auto custom-scrollbar font-mono text-[11px] space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="text-slate-600">[{log.time}]</span>
                                    <span className={`font-black ${log.type === 'SYSTEM' ? 'text-cyan-400' : log.type === 'BUILD' ? 'text-orange-400' : 'text-emerald-400'}`}>
                                        [{log.type}]
                                    </span>
                                    <span className="text-slate-300">{log.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Analytics & Export */}
                <div className="flex flex-col gap-6">
                    {/* Neural Bundle Generator */}
                    <div className="glass-panel rounded-3xl border border-orange-500/20 bg-orange-500/5 p-6 space-y-4">
                        <h3 className="text-[11px] font-black text-orange-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Layers size={14} /> Neural Bundle
                        </h3>
                        <p className="text-[10px] text-slate-400">Aggregate all session assets, logic graphs, and narrative paths into a unified deployment manifest.</p>

                        <div className="space-y-2 py-2">
                            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                <span>Manifest Integrity</span>
                                <span className="text-orange-400">Stable</span>
                            </div>
                            <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full w-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                const bundle = {
                                    projectName,
                                    timestamp: new Date().toISOString(),
                                    stats: {
                                        entities: entityCount,
                                        nodes: nodeCount,
                                        assets: assetCount
                                    },
                                    gameState,
                                    assets: assets.map(a => ({ id: a.id, name: a.name, type: a.type, status: a.status }))
                                };
                                const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${projectName.replace(/\s+/g, '_')}_Neural_Bundle.json`;
                                a.click();
                                URL.revokeObjectURL(url);
                                setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: 'EXPORT', message: 'Neural Bundle Manifest generated and downloaded.' }]);
                            }}
                            className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-orange-900/40 flex items-center justify-center gap-3 group"
                        >
                            <Download size={16} className="group-hover:translate-y-0.5 transition-transform" /> Generate Bundle
                        </button>
                    </div>

                    {/* Pro Analytics */}
                    <div className="glass-panel rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-6 flex-1">
                        <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-6">
                            <BarChart3 size={14} /> Pro Analytics
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black text-slate-500 uppercase">Project Complexity</span>
                                    <span className="text-[10px] font-black text-indigo-400">Level 7</span>
                                </div>
                                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                    <div className="h-full w-[70%] bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full" />
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                Consider adding more choice points in Act 2 to increase player agency and engagement.
                            </p>
                            <button className="w-full py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2">
                                See Full Report <ArrowRight size={12} />
                            </button>
                        </div>
                    </div>

                    {/* Export Targets */}
                    <div className="glass-panel rounded-3xl border border-white/10 bg-slate-950/40 p-6">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-6">
                            <Download size={14} className="text-emerald-500" /> Export Targets
                        </h3>
                        <div className="space-y-3">
                            {exportTargets.map(target => (
                                <div
                                    key={target.label}
                                    className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all group"
                                >
                                    <target.icon size={18} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                    <div className="flex-1">
                                        <span className="text-[12px] font-black text-white block">{target.label}</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${target.status === 'ready'
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'bg-amber-500/10 text-amber-400'
                                        }`}>
                                        {target.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Airlock;
