import React, { useState, useRef, useEffect } from 'react';
import {
    Zap,
    Play,
    Square,
    Plus,
    Trash2,
    ZoomIn,
    ZoomOut,
    Move,
    Search,
    Binary,
    ArrowRight
} from 'lucide-react';
import { GlobalGameState, GenesisNode, WireConnection, NodePin } from '../types';

interface GenesisEditorProps {
    gameState: GlobalGameState;
    updateGameState: (updater: (prev: GlobalGameState) => GlobalGameState) => void;
}

const PIN_COLORS = {
    Exec: '#ffffff',
    Boolean: '#ef4444',
    Int: '#10b981',
    Float: '#3b82f6',
    String: '#f59e0b',
    Vec2: '#fcd34d',
    Entity: '#8b5cf6'
};

const GenesisEditor: React.FC<GenesisEditorProps> = ({ gameState, updateGameState }) => {
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Node Dragging
    const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

    // Wire Creation
    const [tempWire, setTempWire] = useState<{ nodeId: string, pinId: string, x: number, y: number } | null>(null);

    const canvasRef = useRef<HTMLDivElement>(null);

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setScale(s => Math.min(Math.max(s * delta, 0.5), 2));
        } else {
            setOffset(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
        }
    };

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (e.button === 1 || e.altKey) { // Middle click or Alt+Click
            setIsDraggingCanvas(true);
            setDragStart({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDraggingCanvas) {
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            setOffset(p => ({ x: p.x + dx, y: p.y + dy }));
            setDragStart({ x: e.clientX, y: e.clientY });
        }

        if (draggingNodeId) {
            updateGameState(prev => ({
                ...prev,
                nodes: prev.nodes.map(n =>
                    n.id === draggingNodeId
                        ? { ...n, x: n.x + e.movementX / scale, y: n.y + e.movementY / scale }
                        : n
                )
            }));
        }

        if (tempWire) {
            // Just force re-render for temp wire line
            setTempWire(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
        }
    };

    const handleMouseUp = () => {
        setIsDraggingCanvas(false);
        setDraggingNodeId(null);
        setTempWire(null);
    };

    const addNode = (type: GenesisNode['type'], label: string) => {
        const newNode: GenesisNode = {
            id: crypto.randomUUID(),
            x: -offset.x / scale + 100,
            y: -offset.y / scale + 100,
            label,
            type,
            inputs: type === 'Event' ? [] : [{ id: 'in_exec', name: '', type: 'Exec', direction: 'Input' }],
            outputs: [{ id: 'out_exec', name: '', type: 'Exec', direction: 'Output' }],
        };

        // Custom config per type
        if (type === 'Action' && label === 'Play Sound') {
            newNode.inputs.push({ id: 'sound_name', name: 'Sound', type: 'String', direction: 'Input' });
        }
        if (type === 'Branch') {
            newNode.inputs.push({ id: 'cond', name: 'Condition', type: 'Boolean', direction: 'Input' });
            newNode.outputs = [
                { id: 'true', name: 'True', type: 'Exec', direction: 'Output' },
                { id: 'false', name: 'False', type: 'Exec', direction: 'Output' }
            ];
        }

        updateGameState(prev => ({
            ...prev,
            nodes: [...prev.nodes, newNode]
        }));
    };

    // Generate Code Button
    const generateCode = () => {
        console.log("Generating NexScript...");
        // This would be where we traverse graph and build string
        // For UI demo, we can just log or show a toast
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-white overflow-hidden relative"
            onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>

            {/* Toolbar */}
            <div className="h-14 border-b border-white/10 bg-slate-900/80 backdrop-blur flex items-center px-6 gap-4 z-20 shadow-lg">
                <div className="flex items-center gap-2 text-amber-500 mr-4">
                    <Zap size={20} fill="currentColor" />
                    <span className="font-orbitron font-bold tracking-widest text-sm">GENESIS LOGIC</span>
                </div>

                <div className="flex bg-slate-800 rounded-lg p-1">
                    <button onClick={() => addNode('Event', 'On Update')} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-md text-xs font-bold uppercase transition-colors">
                        <Play size={14} /> Event
                    </button>
                    <button onClick={() => addNode('Action', 'Play Sound')} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-md text-xs font-bold uppercase transition-colors">
                        <Binary size={14} /> Action
                    </button>
                    <button onClick={() => addNode('Branch', 'Branch')} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-md text-xs font-bold uppercase transition-colors">
                        <ArrowRight size={14} /> Branch
                    </button>
                </div>

                <div className="flex-1" />

                <button onClick={generateCode} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/20">
                    <Binary size={14} /> Compile Code
                </button>
            </div>

            {/* Canvas */}
            <div
                ref={canvasRef}
                className="flex-1 relative cursor-crosshair active:cursor-grabbing"
                onMouseDown={handleCanvasMouseDown}
                onWheel={handleWheel}
                style={{
                    backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
                    backgroundSize: `${20 * scale}px ${20 * scale}px`,
                    backgroundPosition: `${offset.x}px ${offset.y}px`,
                    backgroundColor: '#020617'
                }}
            >
                <div style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transformOrigin: '0 0' }} className="absolute inset-0 w-full h-full pointer-events-none">

                    {/* Wires (SVG Layer) */}
                    <svg className="absolute top-0 left-0 w-[10000px] h-[10000px] overflow-visible pointer-events-none">
                        {gameState.wires && gameState.wires.map(wire => {
                            // Basic line for now. Real impl needs port coordinates calc.
                            const startNode = gameState.nodes.find(n => n.id === wire.fromNode);
                            const endNode = gameState.nodes.find(n => n.id === wire.toNode);
                            if (!startNode || !endNode) return null;

                            return (
                                <path
                                    key={wire.id}
                                    d={`M ${startNode.x + 150} ${startNode.y + 40} C ${startNode.x + 200} ${startNode.y + 40}, ${endNode.x - 50} ${endNode.y + 40}, ${endNode.x} ${endNode.y + 40}`}
                                    stroke="white"
                                    strokeWidth="2"
                                    fill="none"
                                />
                            );
                        })}
                    </svg>

                    {/* Nodes */}
                    {gameState.nodes && gameState.nodes.map(node => (
                        <div
                            key={node.id}
                            style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                            className={`absolute w-40 bg-slate-900 rounded-xl border-2 shadow-2xl pointer-events-auto flex flex-col overflow-hidden group hover:border-white/50 transition-colors ${node.type === 'Event' ? 'border-red-500/50' :
                                    node.type === 'Branch' ? 'border-slate-500/50' : 'border-blue-500/50'
                                }`}
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                setDraggingNodeId(node.id);
                            }}
                        >
                            {/* Node Header */}
                            <div className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest flex items-center justify-between ${node.type === 'Event' ? 'bg-red-500/20 text-red-400' :
                                    node.type === 'Branch' ? 'bg-slate-700/50 text-slate-300' : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                {node.label}
                                {node.type === 'Event' && <Play size={10} fill="currentColor" />}
                            </div>

                            {/* Pins */}
                            <div className="p-3 space-y-2">
                                {node.inputs.map(pin => (
                                    <div key={pin.id} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: PIN_COLORS[pin.type] }} />
                                        <span className="text-[9px] text-slate-400 font-bold uppercase">{pin.name || pin.type}</span>
                                    </div>
                                ))}
                                <div className="h-[1px] bg-white/5 my-1" />
                                {node.outputs.map(pin => (
                                    <div key={pin.id} className="flex items-center justify-end gap-2">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase">{pin.name || pin.type}</span>
                                        <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: PIN_COLORS[pin.type] }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="absolute bottom-6 right-6 flex gap-2">
                <div className="bg-slate-900 border border-white/10 rounded-lg p-1 flex">
                    <button onClick={() => setScale(s => Math.min(s + 0.1, 2))} className="p-2 hover:bg-white/10 rounded-md"><ZoomIn size={16} /></button>
                    <button onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} className="p-2 hover:bg-white/10 rounded-md"><ZoomOut size={16} /></button>
                </div>
            </div>
        </div>
    );
};

export default GenesisEditor;
