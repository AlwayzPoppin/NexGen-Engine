import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Play, Pause, RotateCcw, Monitor, Sparkles, Sliders, Terminal, Zap, Activity,
    Map, Target, Music, Code2, Save, Trash2, Eye, EyeOff, X, Database, Workflow
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { generateEntityLogic, generateSprite } from '../services/geminiService';
import BootSequence from './BootSequence';
import { GlobalGameState, NexusAsset, GameEntity2D, GenesisNode, WireConnection } from '../types';

// --- NexGen Engine Types ---
type EntityType = 'sprite' | 'rect' | 'circle' | 'video';
type ArtStyle = 'none' | 'pixel' | 'hd-pixel' | 'vector' | 'sketch' | 'isometric' | 'vibrant';

interface Transform {
    x: number; y: number; rotation: number; scaleX: number; scaleY: number;
}

interface Physics {
    enabled: boolean; isStatic: boolean; vx: number; vy: number; mass: number; friction: number; restitution: number;
}

interface LightSource {
    enabled: boolean; color: string; radius: number; intensity: number; flicker: boolean; castShadows: boolean;
}

interface Particle {
    x: number; y: number; vx: number; vy: number; life: number; color: string; size: number;
}

interface LogEntry {
    id: string;
    text: string;
    type: 'info' | 'warn' | 'error' | 'ai';
    timestamp: string;
}

interface Entity {
    id: string; name: string; type: EntityType; transform: Transform; physics: Physics; light?: LightSource; color?: string; assetData?: string; zIndex: number; script?: string; linkedLogicId?: string; internalState: Record<string, any>;
}

interface RuntimeState {
    global: Record<string, any>; entities: Entity[]; selectedEntityId: string | null; isPaused: boolean; gravity: number; ambienceColor: string; bloomEnabled: boolean; logs: LogEntry[]; isLiveActive: boolean; raycastDebug: boolean;
    shakeIntensity: number; gridEnabled: boolean;
}

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

interface NexGenEngineProps {
    initialEntities?: Entity[];
    assets?: NexusAsset[];
    gameState: GlobalGameState;
}

function NexGenEngine({ initialEntities = [], assets = [], gameState }: NexGenEngineProps) {
    const [engineState, setEngineState] = useState<RuntimeState>({
        global: { score: 0 },
        entities: [
            ...initialEntities, // Inject forged entities
            {
                id: 'ground', name: 'Floor', type: 'rect', transform: { x: 0, y: 720, rotation: 0, scaleX: CANVAS_WIDTH, scaleY: 80 },
                physics: { enabled: true, isStatic: true, vx: 0, vy: 0, mass: 10, friction: 0.5, restitution: 0.1 },
                color: '#080808', zIndex: 0, internalState: {}
            }
        ],
        selectedEntityId: null, isPaused: false, // Auto-play on load
        gravity: 0.5, ambienceColor: '#030303', bloomEnabled: true,
        logs: [
            { id: '1', text: "Kernel V9.0_LUMEN-X Loaded.", type: 'info', timestamp: new Date().toLocaleTimeString() },
            { id: '2', text: "Kinetic Physics Kernel Online.", type: 'ai', timestamp: new Date().toLocaleTimeString() }
        ],
        isLiveActive: false, raycastDebug: false, shakeIntensity: 0, gridEnabled: true
    });


    const [proGenPrompt, setProGenPrompt] = useState("");
    const [assetPrompt, setAssetPrompt] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isSynthesizing, setIsSynthesizing] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const lineDashOffset = useRef(0);
    const dragRef = useRef<{ id: string, offsetX: number, offsetY: number, lastMouseX: number, lastMouseY: number, vx: number, vy: number } | null>(null);
    const textureCache = useRef<Record<string, HTMLImageElement>>({});
    const mousePos = useRef({ x: 0, y: 0 });
    const [isBooting, setIsBooting] = useState(true);
    const [dialogData, setDialogData] = useState<{ text: string, speaker: string } | null>(null);
    const [activeQuests, setActiveQuests] = useState<string[]>([]);
    const [nowPlaying, setNowPlaying] = useState<string | null>(null);

    const addLog = (text: string, type: LogEntry['type'] = 'info') => {
        setEngineState(prev => ({
            ...prev,
            logs: [{ id: Math.random().toString(), text, type, timestamp: new Date().toLocaleTimeString() }, ...prev.logs].slice(0, 50)
        }));
    };

    const spawnSparks = (x: number, y: number, color: string = '#00f2ff', count: number = 10) => {
        for (let i = 0; i < count; i++) {
            particles.current.push({
                x, y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 1.0, color, size: 1 + Math.random() * 2
            });
        }
    };

    useEffect(() => {
        let lastTime = performance.now();
        const render = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Physics & Scroll Update
            if (!engineState.isPaused) {
                const now = performance.now();
                const dt = Math.min((now - lastTime) / 1000, 0.1); // Cap dt to avoid teleporting
                lastTime = now;

                lineDashOffset.current = (lineDashOffset.current + 1) % 48;
                setEngineState(prev => ({
                    ...prev,
                    entities: prev.entities.map(e => {
                        let { x, y, rotation } = e.transform;
                        let { vx, vy } = e.physics;

                        // 1. NODE LOGIC INTERPRETER
                        if (e.linkedLogicId) {
                            const entryNode = gameState.nodes.find(n => n.id === e.linkedLogicId);
                            if (entryNode && entryNode.type === 'Event') {
                                gameState.wires
                                    .filter(w => w.fromNode === entryNode.id && w.fromPin.includes('exec'))
                                    .forEach(wire => {
                                        const nextNode = gameState.nodes.find(n => n.id === wire.toNode);
                                        if (!nextNode) return;

                                        // MOVEMENT ACTIONS
                                        if (nextNode.type === 'Action') {
                                            const speed = 400;
                                            if (nextNode.label === 'Move Right') x += speed * dt;
                                            if (nextNode.label === 'Move Left') x -= speed * dt;
                                            if (nextNode.label === 'Move Up') y -= speed * dt;
                                            if (nextNode.label === 'Move Down') y += speed * dt;
                                        }

                                        // NARRATIVE/CONDUCTOR
                                        if (nextNode.type === 'Narrative' || nextNode.type === 'Conductor') {
                                            if (nextNode.label === 'Show Dialog' && !dialogData) {
                                                setDialogData({
                                                    text: nextNode.data?.text || "Neural connection established.",
                                                    speaker: nextNode.data?.actor || "NEXUS"
                                                });
                                            }
                                        }

                                        // SYNAPSE AI
                                        if (nextNode.type === 'Synapse') {
                                            if (nextNode.label === 'Chase Player') {
                                                const player = prev.entities.find(ent => ent.name.toLowerCase().includes('player'));
                                                if (player) {
                                                    const dx = player.transform.x - e.transform.x;
                                                    const dy = player.transform.y - e.transform.y;
                                                    const dist = Math.sqrt(dx * dx + dy * dy);
                                                    if (dist > 5) {
                                                        x += (dx / dist) * 200 * dt;
                                                        y += (dy / dist) * 200 * dt;
                                                    }
                                                }
                                            }
                                        }
                                    });
                            }
                        }

                        if (e.physics.enabled && !e.physics.isStatic) {
                            // Simple Gravity Physics
                            vy += prev.gravity;
                            x += vx;
                            y += vy;

                            // Ground Collision
                            if (y + e.transform.scaleY > 720) {
                                y = 720 - e.transform.scaleY;
                                vy = -vy * e.physics.restitution;
                                vx *= e.physics.friction;
                                if (Math.abs(vy) < 0.5) vy = 0;
                            }
                        }

                        // 2. LEGACY NEXUS SCRIPT (Lumen/Ollama)
                        if (e.script) {
                            try {
                                const scriptCtx = {
                                    entity: e,
                                    state: prev,
                                    dt,
                                    time: Date.now(),
                                    spawnSparks: (x: number, y: number, color?: string) => spawnSparks(x, y, color),
                                    addLog: (text: string, type?: LogEntry['type']) => addLog(text, type)
                                };
                                const updateFn = new Function('ctx', e.script);
                                updateFn(scriptCtx);
                            } catch (err) { }
                        }

                        return { ...e, transform: { ...e.transform, x, y }, physics: { ...e.physics, vx, vy } };
                    })
                }));
            }

            // --- DRAW PASS ---
            ctx.fillStyle = engineState.ambienceColor;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // 1. Grid Pass
            if (engineState.gridEnabled) {
                ctx.save();
                ctx.setLineDash([5, 5]);
                ctx.lineDashOffset = -lineDashOffset.current;
                ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
                ctx.lineWidth = 1;

                for (let x = 0; x < CANVAS_WIDTH; x += 48) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, CANVAS_HEIGHT);
                    ctx.stroke();
                }
                for (let y = 0; y < CANVAS_HEIGHT; y += 48) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(CANVAS_WIDTH, y);
                    ctx.stroke();
                }
                ctx.restore();
            }

            // 2. Entity Pass
            engineState.entities.sort((a, b) => a.zIndex - b.zIndex).forEach(e => {
                ctx.save();
                ctx.translate(e.transform.x + e.transform.scaleX / 2, e.transform.y + e.transform.scaleY / 2);
                ctx.rotate(e.transform.rotation);

                if (e.type === 'rect') {
                    ctx.fillStyle = e.color || '#fff';
                    if (engineState.bloomEnabled) {
                        ctx.shadowColor = e.color || '#fff';
                        ctx.shadowBlur = 15;
                    }
                    ctx.fillRect(-e.transform.scaleX / 2, -e.transform.scaleY / 2, e.transform.scaleX, e.transform.scaleY);
                } else if (e.type === 'sprite' && e.assetData) {
                    if (!textureCache.current[e.id]) {
                        const img = new Image();
                        img.src = e.assetData;
                        img.onload = () => { textureCache.current[e.id] = img; };
                    }
                    const img = textureCache.current[e.id];
                    if (img && img.complete) {
                        ctx.drawImage(img, -e.transform.scaleX / 2, -e.transform.scaleY / 2, e.transform.scaleX, e.transform.scaleY);
                    }
                }
                ctx.restore();

                // Selection Ring
                if (e.id === engineState.selectedEntityId) {
                    ctx.strokeStyle = '#00f2ff';
                    ctx.setLineDash([2, 4]);
                    ctx.lineWidth = 2;
                    ctx.strokeRect(e.transform.x - 4, e.transform.y - 4, e.transform.scaleX + 8, e.transform.scaleY + 8);
                    ctx.setLineDash([]);
                }
            });

            // 3. Particle Pass
            particles.current = particles.current.filter(p => p.life > 0);
            particles.current.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;

            requestAnimationFrame(render);
        };
        const frame = requestAnimationFrame(render);
        return () => cancelAnimationFrame(frame);
    }, [engineState.isPaused, engineState.entities, engineState.gridEnabled, engineState.bloomEnabled]);

    const onMouseDown = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
        const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

        // Find clicked entity (Z-order top)
        const clicked = [...engineState.entities].sort((a, b) => b.zIndex - a.zIndex).find(ent => {
            return x >= ent.transform.x && x <= ent.transform.x + ent.transform.scaleX &&
                y >= ent.transform.y && y <= ent.transform.y + ent.transform.scaleY;
        });

        if (clicked) {
            setEngineState(p => ({ ...p, selectedEntityId: clicked.id }));
            dragRef.current = {
                id: clicked.id,
                offsetX: x - clicked.transform.x,
                offsetY: y - clicked.transform.y,
                lastMouseX: x,
                lastMouseY: y,
                vx: 0, vy: 0
            };
            spawnSparks(x, y, '#fff', 5);
        } else {
            setEngineState(p => ({ ...p, selectedEntityId: null }));
        }
    };

    const onMouseMove = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
        const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
        mousePos.current = { x, y };

        if (dragRef.current) {
            const drag = dragRef.current;
            const vx = x - drag.lastMouseX;
            const vy = y - drag.lastMouseY;
            drag.vx = vx;
            drag.vy = vy;
            drag.lastMouseX = x;
            drag.lastMouseY = y;

            setEngineState(prev => ({
                ...prev,
                entities: prev.entities.map(ent =>
                    ent.id === drag.id
                        ? { ...ent, transform: { ...ent.transform, x: x - drag.offsetX, y: y - drag.offsetY }, physics: { ...ent.physics, vx, vy } }
                        : ent
                )
            }));
        }
    };

    const onMouseUp = () => {
        dragRef.current = null;
    };

    const selectedEntity = useMemo(() =>
        engineState.entities.find(e => e.id === engineState.selectedEntityId),
        [engineState.entities, engineState.selectedEntityId]
    );







    const [activeLeftTab, setActiveLeftTab] = useState<'lumen' | 'nexus' | 'chronos'>('lumen');
    const [isOmniVoiceActive, setIsOmniVoiceActive] = useState(false);

    // --- RENDERERS ---

    const renderGlobalHeader = () => (
        <div className="h-16 bg-slate-950 border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-50">
            <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${isAiLoading ? 'bg-purple-500 animate-pulse shadow-[0_0_10px_#a855f7]' : 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]'}`} />
                <h1 className="text-sm font-black text-white uppercase tracking-widest">NexGen Engine <span className="text-slate-600">/</span> Core</h1>
            </div>

            <div className="flex items-center gap-6">
                {/* OMNI VOICE */}
                <button
                    onClick={() => setIsOmniVoiceActive(!isOmniVoiceActive)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${isOmniVoiceActive ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'}`}
                >
                    <div className={`w-2 h-2 rounded-full ${isOmniVoiceActive ? 'bg-purple-500 animate-ping' : 'bg-slate-500'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Voice Assistant</span>
                </button>
            </div>
        </div>
    );

    const renderLeftSidebar = () => (
        <div className="w-80 bg-slate-950/80 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0">
            <div className="flex border-b border-white/5">
                {[
                    { id: 'lumen', label: 'SCENE', icon: Sparkles, color: 'text-amber-400' },
                    { id: 'nexus', label: 'LOGIC', icon: Sliders, color: 'text-cyan-400' },
                    { id: 'chronos', label: 'TIMELINE', icon: Activity, color: 'text-purple-400' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveLeftTab(tab.id as any)}
                        className={`flex-1 py-4 flex flex-col items-center gap-1 border-b-2 transition-all ${activeLeftTab === tab.id ? 'border-cyan-500 bg-slate-900' : 'border-transparent text-slate-600 hover:bg-slate-900/50'}`}
                    >
                        <tab.icon size={16} className={activeLeftTab === tab.id ? tab.color : 'text-slate-600'} />
                        <span className={`text-[8px] font-bold uppercase tracking-widest ${activeLeftTab === tab.id ? 'text-white' : 'text-slate-600'}`}>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeLeftTab === 'lumen' && (
                    <div className="flex flex-col h-full justify-center items-center text-center opacity-40">
                        <Sparkles size={48} className="mb-4 text-amber-500" />
                        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">Monitor Standby</h3>
                        <p className="text-[10px] text-slate-400 max-w-[200px]">Scene monitor awaiting simulation.</p>
                    </div>
                )}

                {activeLeftTab === 'nexus' && (
                    <div className="space-y-6">
                        <div className="p-4 bg-slate-900 border border-cyan-500/20 rounded-xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                            <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Monitor size={12} /> Behavior Scripting
                            </h4>
                            <textarea
                                value={proGenPrompt}
                                onChange={e => setProGenPrompt(e.target.value)}
                                placeholder="Describe object behavior (e.g., 'Make it oscillate up and down like a float')..."
                                className="w-full h-32 bg-black/50 border border-white/10 rounded-lg p-3 text-[10px] text-white placeholder:text-slate-600 focus:border-cyan-500/50 outline-none resize-none mb-3"
                            />
                            <button
                                onClick={async () => {
                                    if (!selectedEntity) {
                                        addLog("No entity selected for Script Generation.", "error");
                                        return;
                                    }
                                    if (!proGenPrompt.trim()) {
                                        addLog("Please enter a behavior description.", "warn");
                                        return;
                                    }

                                    setIsAiLoading(true);
                                    addLog(`Generating logic for ${selectedEntity.name}...`, "ai");

                                    try {
                                        const responseStr = await generateEntityLogic(proGenPrompt, selectedEntity.type);
                                        const logicData = JSON.parse(responseStr);

                                        setEngineState(prev => ({
                                            ...prev,
                                            entities: prev.entities.map(ent => {
                                                if (ent.id !== selectedEntity.id) return ent;
                                                return {
                                                    ...ent,
                                                    script: logicData.onUpdate || ent.script,
                                                    physics: { ...ent.physics, ...logicData.physics },
                                                    transform: { ...ent.transform, ...logicData.transform }
                                                };
                                            })
                                        }));

                                        addLog("Logic successfully applied.", "info");
                                        setProGenPrompt("");
                                    } catch (e) {
                                        addLog("Script Generation Failed: " + (e as Error).message, "error");
                                    } finally {
                                        setIsAiLoading(false);
                                    }
                                }}
                                disabled={isAiLoading || !selectedEntity}
                                className={`w-full py-2 bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-cyan-600/30 transition-all flex items-center justify-center gap-2 ${isAiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Zap size={12} className={isAiLoading ? 'animate-spin' : ''} /> {isAiLoading ? 'Generating...' : 'Apply Script'}
                            </button>
                            {!selectedEntity && <p className="text-[8px] text-red-500 mt-2 text-center uppercase">Select an entity first</p>}
                        </div>
                    </div>
                )}

                {activeLeftTab === 'chronos' && (
                    <div className="flex flex-col h-full justify-center items-center text-center opacity-40">
                        <Activity size={48} className="mb-4 text-purple-500" />
                        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">Timeline Standby</h3>
                        <p className="text-[10px] text-slate-400 max-w-[200px]">Timeline manipulation and state rewinding currently offline.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderRightInspector = () => {
        if (!selectedEntity) return <div className="w-0 transition-all duration-300" />;

        return (
            <div className="w-72 bg-slate-950/90 backdrop-blur-xl border-l border-white/5 flex flex-col shrink-0 animate-in slide-in-from-right-10 duration-300">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inspector</span>
                    <button onClick={() => setEngineState(p => ({ ...p, selectedEntityId: null }))}>
                        <X size={14} className="text-slate-500 hover:text-white" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {/* Entity Identity Block */}
                    <div className="p-4 bg-slate-900 border border-white/5 rounded-xl">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Properties</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-[8px] text-slate-600 uppercase">UID</span>
                                <span className="text-[8px] font-mono text-slate-300 bg-slate-800 px-1 rounded">{selectedEntity.id.split('_')[1] || selectedEntity.id.slice(0, 8)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[8px] text-slate-600 uppercase">Type</span>
                                <span className="text-[8px] font-mono text-cyan-400 uppercase">{selectedEntity.type}</span>
                            </div>
                        </div>
                    </div>

                    {/* Asset Synthesis */}
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={12} /> Asset Generation
                        </h4>
                        <textarea
                            value={assetPrompt}
                            onChange={(e) => setAssetPrompt(e.target.value)}
                            placeholder="Describe visual appearance (e.g., 'A red cybernetic drone')..."
                            className="w-full h-24 bg-slate-900 border border-white/10 rounded-lg p-3 text-[10px] text-white placeholder:text-slate-600 focus:border-purple-500/50 outline-none resize-none"
                        />
                        <button
                            onClick={async () => {
                                if (!assetPrompt.trim()) return;
                                setIsSynthesizing(true);
                                addLog(`Synthesizing asset: ${assetPrompt}...`, "ai");

                                try {
                                    // Defaulting to 'pixel' style for game fit, allow config later
                                    const assetUri = await generateSprite(assetPrompt, 'pixel');

                                    if (assetUri) {
                                        setEngineState(prev => ({
                                            ...prev,
                                            entities: prev.entities.map(ent =>
                                                ent.id === selectedEntity.id
                                                    ? { ...ent, assetData: assetUri, type: 'sprite' } // Force type to sprite
                                                    : ent
                                            )
                                        }));
                                        addLog("Asset synthesized and applied.", "info");
                                        setAssetPrompt("");
                                    } else {
                                        addLog("Synthesis returned no data.", "error");
                                    }
                                } catch (e) {
                                    addLog("Synthesis Error: " + (e as Error).message, "error");
                                } finally {
                                    setIsSynthesizing(false);
                                }
                            }}
                            disabled={isSynthesizing}
                            className={`w-full py-3 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-purple-600/30 transition-all flex items-center justify-center gap-2 ${isSynthesizing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Sparkles size={12} className={isSynthesizing ? 'animate-spin' : ''} /> {isSynthesizing ? 'Generating...' : 'Generate Sprite'}
                        </button>
                    </div>

                    {/* Actions */}
                    <button
                        onClick={() => {
                            setEngineState(prev => ({
                                ...prev,
                                entities: prev.entities.filter(e => e.id !== selectedEntity.id),
                                selectedEntityId: null
                            }));
                            addLog(`Purged entity: ${selectedEntity.id}`, 'warn');
                        }}
                        className="w-full py-3 bg-red-900/10 border border-red-500/20 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-900/20 transition-all flex items-center justify-center gap-2 mt-auto"
                    >
                        <Trash2 size={12} /> Delete Entity
                    </button>
                </div>
            </div>
        );
    };

    const renderBottomTerminal = () => (
        <div className="h-48 bg-[#0a0f1a] border-t border-white/10 flex flex-col shrink-0">
            <div className="px-4 py-2 border-b border-white/5 flex items-center gap-3">
                <Terminal size={12} className="text-slate-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Console Logs</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-1 custom-scrollbar">
                {engineState.logs.map(log => (
                    <div key={log.id} className="flex gap-4 opacity-80 hover:opacity-100 transition-opacity">
                        <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                        <span className={`
                            ${log.type === 'error' ? 'text-red-500' : ''}
                            ${log.type === 'warn' ? 'text-amber-500' : ''}
                            ${log.type === 'ai' ? 'text-purple-400' : ''}
                            ${log.type === 'info' ? 'text-cyan-400' : ''}
                        `}>
                            {log.type === 'ai' && '> '}
                            {log.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="w-full h-full relative bg-[#020202] flex flex-col overflow-hidden font-sans selection:bg-cyan-500/30">
            <BootSequence isBooting={isBooting} onComplete={() => setIsBooting(false)} />

            {renderGlobalHeader()}

            <div className="flex-1 flex overflow-hidden">
                {renderLeftSidebar()}

                {/* CENTER CANVAS AREA */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        className="w-full h-full object-contain cursor-crosshair"
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                    />

                    {/* Viewport Overlay: Play/Pause Controls (Floating) */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <button
                            onClick={() => setEngineState(p => ({ ...p, isPaused: !p.isPaused }))}
                            className={`p-2 rounded-lg border backdrop-blur-md transition-all ${engineState.isPaused ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}
                        >
                            {engineState.isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
                        </button>
                    </div>

                    {renderBottomTerminal()}
                </div>

                {renderRightInspector()}
            </div>
        </div>
    );
}

export default NexGenEngine;

