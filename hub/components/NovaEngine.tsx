import React, { useState } from 'react';
import {
    Play,
    Pause,
    Square,
    RotateCcw,
    Layers,
    Info,
    Camera,
    User,
    Settings,
    Search,
    Monitor,
    Maximize,
    Save,
    MousePointer2,
    Move,
    RotateCw,
    Scaling,
    Eye,
    Terminal as ConsoleIcon,
    Link as LinkIcon,
    Image as ImageIcon,
    Zap,
    Ghost,
    Target,
    Wind,
    Map,
    Music,
    BrainCircuit
} from 'lucide-react';
import { GlobalGameState, GameEntity2D } from '../../types';

// --- RUNTIME SIMULATION ---
const GameCanvas: React.FC<{ gameState: GlobalGameState; isPlaying: boolean }> = ({ gameState, isPlaying }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [entities, setEntities] = React.useState(gameState.entities);

    // Runtime UI State
    const [dialogData, setDialogData] = React.useState<{ text: string, speaker: string } | null>(null);
    const [activeQuests, setActiveQuests] = React.useState<string[]>([]);
    const [currentZone, setCurrentZone] = React.useState<string>("Zone_01");
    const [nowPlaying, setNowPlaying] = React.useState<string | null>(null);




    // Sync entities from global state when not playing (Editor Mode reset)
    React.useEffect(() => {
        if (!isPlaying) {
            setEntities(gameState.entities);
            setDialogData(null);
            setActiveQuests([]);
            setCurrentZone("Zone_01");
            setNowPlaying(null);
        }
    }, [gameState.entities, isPlaying]);

    // Game Loop
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!isPlaying || !canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let lastTime = performance.now();

        // LOGIC INTERPRETER
        const executeLogic = (entity: GameEntity2D, dt: number) => {
            if (!entity.linkedLogicId) return entity;

            const entryNode = gameState.nodes.find(n => n.id === entity.linkedLogicId);
            // Only execute if linked to an "Event" type node (like On Update)
            if (!entryNode || entryNode.type !== 'Event') return entity;

            let updates: any = {};
            let localX = entity.x;

            // Simple Interpreter: Traverse from Event Node
            // 1. Find wires from this node's 'Exec' output
            gameState.wires
                .filter(w => w.fromNode === entryNode.id && w.fromPin.includes('exec'))
                .forEach(wire => {
                    const nextNode = gameState.nodes.find(n => n.id === wire.toNode);
                    if (!nextNode) return;

                    // ACTION: Movement
                    if (nextNode.type === 'Action') {
                        const speed = 200;
                        if (nextNode.label === 'Move Right') localX += speed * dt;
                        if (nextNode.label === 'Move Left') localX -= speed * dt;
                        if (nextNode.label === 'Move Up') updates.y = (entity.y) - (speed * dt);
                    }

                    // NARRATIVE: Dialog
                    if (nextNode.type === 'Narrative' && nextNode.label === 'Show Dialog') {
                        setDialogData({
                            text: "Greetings, Traveler! The system is online.",
                            speaker: "System AI"
                        });
                    }

                    // QUEST: Start
                    if (nextNode.type === 'Quest' && nextNode.label === 'Start Quest') {
                        if (!activeQuests.includes('quest_01')) {
                            setActiveQuests(prev => [...prev, 'quest_01']);
                        }
                    }

                    // ATLAS: Load Map
                    if (nextNode.type === 'Atlas' && nextNode.label === 'Load Map') {
                        setCurrentZone("Map_Ancient_Ruins");
                    }
                    if (nextNode.type === 'Atlas' && nextNode.label === 'Show HUD') {
                        // Mock HUD
                    }

                    // ECHO: Play Music
                    if (nextNode.type === 'Echo' && nextNode.label === 'Play Music') {
                        setNowPlaying("Theme_Epic_01.mp3");
                    }

                    // SYNAPSE: AI
                    if (nextNode.type === 'Synapse' && nextNode.label === 'Load Behavior') {
                        // Mock Behavior Load
                    }
                });

            if (localX !== entity.x) updates.x = localX;

            return { ...entity, ...updates };
        };

        const render = (time: number) => {
            const dt = (time - lastTime) / 1000;
            lastTime = time;

            // 1. UPDATE STATE
            let activeEntities = [...entities];
            // @ts-ignore
            activeEntities = activeEntities.map(ent => executeLogic(ent, dt));
            setEntities(activeEntities);

            // 2. RENDER
            // Clear
            ctx.fillStyle = '#0f172a'; // slate-900
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Grid
            ctx.strokeStyle = '#1e293b'; // slate-800
            ctx.lineWidth = 1;
            const gridSize = 50;
            const offsetX = (canvas.width / 2) - 4000; // Center the 8000x8000 world
            const offsetY = (canvas.height / 2) - 4000;

            // Draw Entities
            activeEntities.forEach(ent => {
                if (!ent.visible) return;
                ctx.save();

                // World to Screen
                const screenX = ent.x + offsetX;
                const screenY = ent.y + offsetY;

                ctx.translate(screenX, screenY);

                // Draw Selection Ring
                // if (ent.id === selectedEntityId) ... (need to pass selection prop)

                // Draw Body
                ctx.fillStyle = ent.type === 'Player' ? '#10b981' :
                    ent.type === 'Sprite' ? '#06b6d4' : '#64748b';
                ctx.shadowColor = ent.type === 'Player' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(6, 182, 212, 0.5)';
                ctx.shadowBlur = 20;

                ctx.beginPath();
                if (ent.type === 'Player') {
                    // Triangle for player
                    ctx.moveTo(0, -20);
                    ctx.lineTo(15, 15);
                    ctx.lineTo(-15, 15);
                    ctx.closePath();
                } else {
                    // Circle for others
                    ctx.arc(0, 0, 15 * ent.scale, 0, Math.PI * 2);
                }
                ctx.fill();

                // Label
                ctx.shadowBlur = 0;
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.font = '10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(ent.name, 0, -30);

                ctx.restore();
            });

            animationFrameId = window.requestAnimationFrame(render);
        };

        render(performance.now());

        return () => window.cancelAnimationFrame(animationFrameId);
    }, [isPlaying, gameState]);

    return (
        <div className="flex-1 relative bg-slate-950 overflow-hidden flex items-center justify-center">
            {/* Grid Background (CSS fallback) */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)',
                    backgroundSize: '48px 48px'
                }}
            />
            <canvas
                ref={canvasRef}
                width={1200}
                height={800}
                className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-slate-600">
                RENDER_ENGINE::WEBGL_Polyfill
            </div>

            {/* UI OVERLAY */}
            {dialogData && (
                <div className="absolute bottom-10 left-10 right-10 bg-slate-900/90 border border-white/10 p-6 rounded-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5">
                    <h4 className="text-emerald-400 font-black uppercase tracking-widest text-xs mb-2">{dialogData.speaker}</h4>
                    <p className="text-white text-lg font-bold">{dialogData.text}</p>
                </div>
            )}

            {activeQuests.length > 0 && (
                <div className="absolute top-10 right-10 w-64 bg-slate-900/80 border border-amber-500/20 p-4 rounded-xl backdrop-blur-xl">
                    <h4 className="text-amber-500 font-black uppercase tracking-widest text-[10px] mb-3 flex items-center gap-2">
                        <Target size={12} /> Active Quests
                    </h4>
                    {activeQuests.map(q => (
                        <div key={q} className="text-xs text-slate-300 font-bold bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/10">
                            {q}
                        </div>
                    ))}
                </div>
            )}

            {/* ATLAS INFO */}
            <div className="absolute top-10 left-10 flex gap-4">
                <div className="bg-slate-900/80 border border-emerald-500/20 px-4 py-2 rounded-lg backdrop-blur-xl flex items-center gap-3">
                    <Map size={14} className="text-emerald-500" />
                    <div>
                        <div className="text-[9px] text-emerald-500/50 font-bold uppercase tracking-widest">CURRENT MAP</div>
                        <div className="text-xs text-white font-bold">{currentZone}</div>
                    </div>
                </div>
            </div>

            {/* ECHO PLAYER */}
            {nowPlaying && (
                <div className="absolute top-10 left-64 bg-slate-900/80 border border-pink-500/20 px-4 py-2 rounded-lg backdrop-blur-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <Music size={14} className="text-pink-500 animate-pulse" />
                    <div>
                        <div className="text-[9px] text-pink-500/50 font-bold uppercase tracking-widest">NOW PLAYING</div>
                        <div className="text-xs text-white font-bold">{nowPlaying}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface NovaEngineProps {
    gameState: GlobalGameState;
    updateGameState: (updater: (prev: GlobalGameState) => GlobalGameState) => void;
}

const NovaEngine: React.FC<NovaEngineProps> = ({ gameState, updateGameState }) => {
    const [activeSubPage, setActiveSubPage] = useState<'STAGE' | 'HIERARCHY' | 'LINKER'>('STAGE');
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(gameState.entities[1]?.id || null);

    const selectedEntity = gameState.entities.find(e => e.id === selectedEntityId);

    const updateEntityProperty = (id: string, updates: Partial<GameEntity2D>) => {
        updateGameState(prev => ({
            ...prev,
            entities: prev.entities.map(e => e.id === id ? { ...e, ...updates } : e)
        }));
    };

    const renderSubNavigation = () => (
        <div className="flex items-center gap-1 bg-slate-950/40 p-1 rounded-2xl border border-white/5">
            {[
                { id: 'STAGE', label: 'Stage Preview', icon: Monitor },
                { id: 'HIERARCHY', label: 'Hierarchy', icon: Layers },
                { id: 'LINKER', label: 'Linker', icon: LinkIcon },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveSubPage(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${activeSubPage === tab.id
                        ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                >
                    <tab.icon size={14} />
                    {tab.label}
                </button>
            ))}
        </div>
    );

    return (
        <div className="h-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="h-16 glass-panel rounded-3xl border border-white/5 flex items-center justify-between px-8 bg-slate-900/60 shadow-2xl backdrop-blur-3xl">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <Monitor size={20} />
                        </div>
                        <div>
                            <span className="font-orbitron font-black text-xs tracking-widest text-white block uppercase">NEXGEN <span className="text-emerald-400">ENGINE</span></span>
                            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">NGE CORE v1.0.0</span>
                        </div>
                    </div>

                    <div className="w-[1px] h-8 bg-white/10" />

                    {renderSubNavigation()}

                    <div className="w-[1px] h-8 bg-white/10" />

                    <div className="flex items-center gap-1.5 bg-slate-950/40 p-1.5 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={`p-2.5 rounded-xl transition-all ${isPlaying ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-slate-800 text-slate-400 hover:text-emerald-400'}`}
                        >
                            {isPlaying ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                        </button>
                        <button className="p-2.5 bg-slate-800 text-slate-400 rounded-xl hover:text-emerald-400 transition-all"><Pause size={18} fill="currentColor" /></button>
                        <button className="p-2.5 bg-slate-800 text-slate-400 rounded-xl hover:text-emerald-400 transition-all"><RotateCcw size={18} /></button>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-emerald-400 font-mono tracking-tighter">NGE LATENCY: 0.1ms</span>
                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">NEXGEN BIDIRECTIONAL</span>
                    </div>
                    <button className="p-3 bg-slate-800 text-slate-400 rounded-2xl hover:text-white transition-all shadow-xl"><Maximize size={18} /></button>
                </div>
            </div>

            <div className="flex-1 min-h-0 relative">
                {activeSubPage === 'HIERARCHY' && (
                    <aside className="absolute inset-0 z-20 glass-panel rounded-[2.5rem] border border-white/5 bg-slate-950/90 backdrop-blur-3xl flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2"><Layers size={14} /> Stage Hierarchy</h3>
                            <button onClick={() => setActiveSubPage('STAGE')} className="p-2 bg-white/5 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 transition-all text-slate-600"><RotateCcw size={14} /></button>
                        </div>

                        <div className="p-4 max-w-2xl mx-auto w-full">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                <input type="text" placeholder="FILTER STAGE..." className="w-full bg-slate-900/60 border border-white/5 rounded-xl pl-9 pr-4 py-3 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-emerald-500/30" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar max-w-4xl mx-auto w-full">
                            {['UI', 'Game', 'Background'].map(layer => (
                                <div key={layer} className="space-y-3">
                                    <div className="flex items-center gap-4 px-2 py-1 mb-2">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">{layer} Layer</span>
                                        <div className="flex-1 h-[1px] bg-white/5" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {gameState.entities.filter(e => e.layer === layer).map(entity => (
                                            <div
                                                key={entity.id}
                                                onClick={() => {
                                                    setSelectedEntityId(entity.id);
                                                    setActiveSubPage('STAGE');
                                                }}
                                                className={`group flex items-center gap-4 px-6 py-4 rounded-2xl transition-all cursor-pointer border ${selectedEntityId === entity.id ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg' : 'bg-slate-900/40 border-white/5 text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedEntityId === entity.id ? 'bg-emerald-500/20' : 'bg-slate-950/40'}`}>
                                                    {entity.type === 'Player' && <User size={18} />}
                                                    {entity.type === 'Sprite' && <ImageIcon size={18} />}
                                                    {entity.type === 'Camera' && <Camera size={18} />}
                                                    {entity.type === 'Emitter' && <Zap size={18} />}
                                                    {entity.type === 'Trigger' && <Target size={18} />}
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-[12px] font-black tracking-tight block">{entity.name}</span>
                                                    <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">{entity.type} // {entity.id.slice(-4)}</span>
                                                </div>
                                                <Eye
                                                    size={14}
                                                    className={`${entity.visible ? 'text-emerald-500' : 'text-slate-800'} hover:text-emerald-400 transition-colors cursor-pointer`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateEntityProperty(entity.id, { visible: !entity.visible });
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>
                )}

                {activeSubPage === 'LINKER' && (
                    <aside className="absolute inset-0 z-20 glass-panel rounded-[2.5rem] border border-white/5 bg-slate-950/90 backdrop-blur-3xl flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2"><Info size={14} /> Property Linker</h3>
                            <div className="flex gap-4">
                                <Save size={16} className="text-slate-600 hover:text-emerald-400 cursor-pointer" />
                                <button onClick={() => setActiveSubPage('STAGE')} className="p-1 px-3 bg-white/5 rounded-lg text-slate-500 text-[9px] font-bold uppercase hover:bg-white/10 transition-all">Close</button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                            {selectedEntity ? (
                                <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-white/5">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visibility Link</span>
                                                <div
                                                    onClick={() => updateEntityProperty(selectedEntity.id, { visible: !selectedEntity.visible })}
                                                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${selectedEntity.visible ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-700'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${selectedEntity.visible ? 'right-1' : 'left-1'}`} />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Entity Alias</label>
                                                <input
                                                    type="text"
                                                    value={selectedEntity.name}
                                                    onChange={(e) => updateEntityProperty(selectedEntity.id, { name: e.target.value })}
                                                    className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-[13px] font-black text-white focus:outline-none focus:border-emerald-500/50 shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] border-b border-white/5 pb-3">Engine Transforms</h4>
                                            {['Position', 'Scale'].map(label => (
                                                <div key={label} className="space-y-3">
                                                    <label className="text-[9px] font-black text-slate-500 uppercase flex justify-between tracking-widest">{label}</label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {['X', 'Y'].map(axis => (
                                                            <div key={axis} className="flex items-center gap-3 bg-slate-900 border border-white/5 rounded-2xl p-4 shadow-inner">
                                                                <span className="text-[10px] font-black text-emerald-500">{axis}</span>
                                                                <input type="text" defaultValue="0.0" className="bg-transparent text-[12px] font-mono text-white w-full focus:outline-none" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black text-amber-500/40 uppercase tracking-[0.4em] border-b border-amber-500/10 pb-3 flex items-center justify-between">
                                                NEXGEN LOGIC SYNC
                                                <LinkIcon size={12} className="text-amber-500" />
                                            </h4>
                                            <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-[3rem] space-y-6 shadow-2xl">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Linked Logic Node</label>
                                                    <select
                                                        value={selectedEntity.linkedLogicId || ''}
                                                        onChange={(e) => updateEntityProperty(selectedEntity.id, { linkedLogicId: e.target.value })}
                                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-[12px] font-black text-amber-400 focus:outline-none focus:border-amber-500/30 appearance-none cursor-pointer"
                                                    >
                                                        <option value="">No Logic Attached</option>
                                                        {gameState.nodes.map(node => (
                                                            <option key={node.id} value={node.id}>{node.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <p className="text-[9px] text-slate-500 uppercase leading-relaxed font-black tracking-tighter">
                                                    Linking an entity to a GENESIS node allows NOVA to execute that node's logic during testing.
                                                </p>
                                                <button
                                                    onClick={() => window.dispatchEvent(new CustomEvent('nav-to-nexus'))}
                                                    className="w-full py-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl"
                                                >
                                                    Edit Logic In Genesis
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-10 text-center gap-8 p-20">
                                    <Zap size={80} className="text-cyan-500 animate-pulse" />
                                    <p className="text-sm font-black uppercase tracking-[0.5em] leading-relaxed max-w-sm">Awaiting neural selection link from Stage.</p>
                                </div>
                            )}
                        </div>
                    </aside>
                )}

                <main className="h-full glass-panel rounded-[3.5rem] border border-white/10 bg-slate-950/20 flex flex-col overflow-hidden relative group shadow-inner">
                    <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
                        <div className="bg-slate-950/80 backdrop-blur-2xl px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-8 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">{isPlaying ? 'RUNTIME ACTIVE' : 'EDITOR MODE'}</span>
                            </div>
                            <div className="w-[1px] h-4 bg-white/10" />
                            <div className="flex items-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <span className="text-white flex items-center gap-2"><Layers size={12} className="text-slate-600" /> {gameState.entities.length} Entities</span>
                                <span className="text-white flex items-center gap-2"><LinkIcon size={12} className="text-slate-600" /> {gameState.nodes.length} Logic Links</span>
                            </div>
                        </div>
                    </div>

                    <GameCanvas gameState={gameState} isPlaying={isPlaying} />

                    <div className="h-16 border-t border-white/5 bg-slate-900/80 backdrop-blur-xl flex items-center px-10 justify-between">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-3">
                                <ConsoleIcon size={16} className="text-emerald-500" />
                                <span className="text-[11px] font-black font-mono text-slate-400 uppercase tracking-widest">NGE_RUNTIME</span>
                            </div>
                            <div className="h-6 w-[1px] bg-white/10" />
                            <span className="text-[11px] font-mono text-emerald-400/80 truncate max-w-2xl font-bold">
                                {isPlaying ? 'EXECUTION_LOOP: RUNNING // TICK_RATE: 60Hz' : 'KERNEL_READY // AWAITING_INPUT'}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Live Sync</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default NovaEngine;
