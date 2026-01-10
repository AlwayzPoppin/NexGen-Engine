import React, { useState } from 'react';
import {
    Layout,
    Monitor,
    Map,
    Menu,
    Palette,
    Search,
    Wand2,
    Layers,
    Eye,
    Download,
    Sparkles,
    Target,
    Heart,
    Zap,
    Compass,
    Grid3X3,
    Save,
    RefreshCcw
} from 'lucide-react';

type AtlasTab = 'HUD_FORGE' | 'MAP_MAKER' | 'MENU_BUILDER';

interface AtlasUIProps {
    // Future: Accept gameState for context-aware generation
}

const AtlasUI: React.FC<AtlasUIProps> = () => {
    const [activeTab, setActiveTab] = useState<AtlasTab>('HUD_FORGE');
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        setGeneratedPreview(null);

        try {
            // Real Gemini API call for HUD generation
            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({ apiKey: (import.meta as any).env?.VITE_API_KEY || process.env.API_KEY || '' });

            const hudPrompt = `Create a sleek, modern game HUD element design: ${prompt}. 
            Style: Clean, minimalistic, suitable for a video game interface. 
            Requirements: Dark background, glowing accents, semi-transparent elements.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-preview-image-generation',
                contents: [{ parts: [{ text: hudPrompt }] }],
                config: { responseModalities: ['image', 'text'] },
            });

            // Extract image from response
            if (response.candidates && response.candidates[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData?.mimeType?.startsWith('image/')) {
                        setGeneratedPreview(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                        break;
                    }
                }
            }

            if (!generatedPreview) {
                setGeneratedPreview('generated'); // Fallback indicator
            }
        } catch (error) {
            console.error('HUD generation error:', error);
            setGeneratedPreview('error');
        } finally {
            setIsGenerating(false);
        }
    };

    const hudElements = [
        { id: 'health', label: 'Health Bar', icon: Heart, color: 'text-red-400' },
        { id: 'stamina', label: 'Stamina Wheel', icon: Zap, color: 'text-yellow-400' },
        { id: 'ammo', label: 'Ammo Counter', icon: Target, color: 'text-cyan-400' },
        { id: 'minimap', label: 'Mini Map', icon: Compass, color: 'text-emerald-400' },
    ];

    const renderHudForge = () => (
        <div className="h-full flex gap-8">
            {/* Left Panel: Element Library */}
            <aside className="w-80 glass-panel rounded-3xl border border-indigo-500/20 bg-indigo-500/5 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Layers size={14} /> HUD Element Library
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {hudElements.map(el => (
                        <div
                            key={el.id}
                            className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 cursor-pointer transition-all group"
                        >
                            <div className={`w-10 h-10 rounded-xl bg-slate-950/40 flex items-center justify-center ${el.color}`}>
                                <el.icon size={20} />
                            </div>
                            <div className="flex-1">
                                <span className="text-[12px] font-black text-white tracking-tight block">{el.label}</span>
                                <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">DRAG TO CANVAS</span>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Center: Canvas Preview */}
            <main className="flex-1 glass-panel rounded-3xl border border-white/10 bg-slate-950/40 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">HUD Canvas</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 bg-slate-900/40 rounded-xl hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-400 transition-all">
                            <Grid3X3 size={16} />
                        </button>
                        <button className="p-2 bg-slate-900/40 rounded-xl hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-400 transition-all">
                            <Eye size={16} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 relative flex items-center justify-center bg-[#020617]/60 overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)',
                            backgroundSize: '32px 32px'
                        }}
                    />
                    {generatedPreview ? (
                        <div className="w-96 h-64 border-2 border-indigo-500/30 rounded-3xl bg-indigo-500/5 flex items-center justify-center">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">GENERATED HUD PREVIEW</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-6 opacity-20">
                            <Monitor size={80} />
                            <p className="text-sm font-black uppercase tracking-[0.5em]">Canvas Ready</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Right Panel: AI Generation */}
            <aside className="w-96 glass-panel rounded-3xl border border-indigo-500/20 bg-indigo-500/5 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Wand2 size={14} /> AI Forge
                    </h3>
                </div>
                <div className="flex-1 p-6 space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Describe Your HUD</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., Cyberpunk health bar with neon glow, hexagonal stamina meter..."
                            className="w-full h-32 bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-[12px] text-white focus:outline-none focus:border-indigo-500/50 resize-none placeholder:text-slate-700"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Style Preset</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Minimal', 'Cyberpunk', 'Fantasy', 'Retro'].map(style => (
                                <button
                                    key={style}
                                    className="px-4 py-3 bg-slate-900/60 border border-white/5 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-indigo-500/30 hover:text-indigo-400 transition-all"
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt}
                        className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${isGenerating
                            ? 'bg-indigo-500/20 text-indigo-400 cursor-wait'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.3)]'
                            }`}
                    >
                        <Sparkles size={16} className={isGenerating ? 'animate-spin' : ''} />
                        {isGenerating ? 'Forging...' : 'Generate HUD'}
                    </button>
                </div>
                <div className="p-6 border-t border-white/5 flex gap-3">
                    <button className="flex-1 py-3 bg-slate-900/40 border border-white/5 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2">
                        <Save size={14} /> Save
                    </button>
                    <button className="flex-1 py-3 bg-slate-900/40 border border-white/5 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2">
                        <Download size={14} /> Export
                    </button>
                </div>
            </aside>
        </div>
    );

    const renderMapMaker = () => {
        const tileTypes = [
            { id: 'grass', label: 'Grass', color: 'bg-emerald-500' },
            { id: 'dirt', label: 'Dirt', color: 'bg-amber-700' },
            { id: 'water', label: 'Water', color: 'bg-blue-500' },
            { id: 'stone', label: 'Stone', color: 'bg-slate-500' },
            { id: 'sand', label: 'Sand', color: 'bg-yellow-300' },
            { id: 'lava', label: 'Lava', color: 'bg-orange-600' },
        ];

        return (
            <div className="h-full flex gap-6">
                {/* Left: Tile Palette */}
                <aside className="w-64 glass-panel rounded-3xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-white/5">
                        <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Palette size={14} /> Tile Palette
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {tileTypes.map(tile => (
                            <div
                                key={tile.id}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/40 border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all group"
                            >
                                <div className={`w-8 h-8 rounded-lg ${tile.color} shadow-lg`} />
                                <span className="text-[11px] font-black text-white uppercase tracking-tight">{tile.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-white/5 space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Brush Size</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map(size => (
                                <button key={size} className="flex-1 py-2 bg-slate-900/60 border border-white/5 rounded-lg text-[10px] font-black text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400 transition-all">
                                    {size}x{size}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Center: Map Canvas */}
                <main className="flex-1 glass-panel rounded-3xl border border-white/10 bg-slate-950/40 flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Map Canvas</span>
                            <span className="text-[9px] font-mono text-slate-600 ml-4">32x32 TILES</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 bg-slate-900/40 border border-white/5 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all flex items-center gap-2">
                                <Grid3X3 size={12} /> Grid
                            </button>
                            <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-2">
                                <Save size={12} /> Save Map
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 relative overflow-auto custom-scrollbar p-8 bg-[#020617]/60">
                        <div
                            className="grid gap-[1px] mx-auto"
                            style={{
                                gridTemplateColumns: 'repeat(16, 24px)',
                                gridTemplateRows: 'repeat(12, 24px)',
                                background: 'rgba(71, 85, 105, 0.2)'
                            }}
                        >
                            {Array.from({ length: 16 * 12 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-6 h-6 bg-slate-900 hover:bg-emerald-500/30 cursor-crosshair transition-colors border border-transparent hover:border-emerald-500/50"
                                />
                            ))}
                        </div>
                    </div>
                </main>

                {/* Right: Layers & Properties */}
                <aside className="w-72 glass-panel rounded-3xl border border-white/10 bg-slate-950/40 flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-white/5">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Layers size={14} /> Layers
                        </h3>
                    </div>
                    <div className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                        {['Foreground', 'Objects', 'Terrain', 'Background'].map((layer, i) => (
                            <div key={layer} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${i === 2 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}>
                                <Eye size={14} className={i === 2 ? 'text-emerald-400' : 'text-slate-600'} />
                                <span className={`text-[11px] font-black uppercase tracking-tight ${i === 2 ? 'text-emerald-400' : 'text-slate-400'}`}>{layer}</span>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-white/5">
                        <button className="w-full py-3 bg-slate-900/60 border border-dashed border-white/10 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">
                            + Add Layer
                        </button>
                    </div>
                </aside>
            </div>
        );
    };

    const renderMenuBuilder = () => {
        const menuTemplates = [
            { id: 'main', label: 'Main Menu', desc: 'Title, Play, Settings, Quit' },
            { id: 'pause', label: 'Pause Menu', desc: 'Resume, Options, Exit' },
            { id: 'settings', label: 'Settings Panel', desc: 'Audio, Video, Controls' },
            { id: 'inventory', label: 'Inventory Grid', desc: 'Item slots, Stats' },
        ];

        const menuElements = [
            { id: 'button', label: 'Button', icon: Target },
            { id: 'slider', label: 'Slider', icon: Zap },
            { id: 'checkbox', label: 'Checkbox', icon: Eye },
            { id: 'dropdown', label: 'Dropdown', icon: Menu },
        ];

        return (
            <div className="h-full flex gap-6">
                {/* Left: Template Gallery */}
                <aside className="w-72 glass-panel rounded-3xl border border-purple-500/20 bg-purple-500/5 flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-white/5">
                        <h3 className="text-[11px] font-black text-purple-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Layout size={14} /> Templates
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {menuTemplates.map((template, i) => (
                            <div
                                key={template.id}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer ${i === 0 ? 'bg-purple-500/10 border-purple-500/30' : 'bg-slate-900/40 border-white/5 hover:border-purple-500/30'}`}
                            >
                                <span className={`text-[12px] font-black block ${i === 0 ? 'text-purple-400' : 'text-white'}`}>{template.label}</span>
                                <span className="text-[9px] text-slate-500 uppercase tracking-tight">{template.desc}</span>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-white/5">
                        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Elements</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {menuElements.map(el => (
                                <div key={el.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/60 border border-white/5 hover:border-purple-500/30 cursor-pointer transition-all">
                                    <el.icon size={12} className="text-purple-400" />
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">{el.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Center: Menu Preview */}
                <main className="flex-1 glass-panel rounded-3xl border border-white/10 bg-slate-950/40 flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            <span className="text-[11px] font-black text-purple-400 uppercase tracking-widest">Menu Preview</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 bg-slate-900/40 border border-white/5 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all flex items-center gap-2">
                                <Eye size={12} /> Preview
                            </button>
                            <button className="px-4 py-2 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all flex items-center gap-2">
                                <Download size={12} /> Export
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 relative flex items-center justify-center bg-[#020617]/60 overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                            style={{
                                backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
                                backgroundSize: '24px 24px'
                            }}
                        />
                        {/* Mock Main Menu Preview */}
                        <div className="w-80 bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-4 shadow-2xl">
                            <h2 className="text-2xl font-black text-center text-white uppercase tracking-wider mb-6">GAME TITLE</h2>
                            {['New Game', 'Continue', 'Settings', 'Quit'].map((btn, i) => (
                                <button key={btn} className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-purple-600 text-white' : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:border-purple-500/30'}`}>
                                    {btn}
                                </button>
                            ))}
                        </div>
                    </div>
                </main>

                {/* Right: Properties */}
                <aside className="w-64 glass-panel rounded-3xl border border-white/10 bg-slate-950/40 flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-white/5">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Palette size={14} /> Style
                        </h3>
                    </div>
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Background</label>
                            <div className="flex gap-2">
                                {['#020617', '#1e1b4b', '#0f172a', '#18181b'].map(color => (
                                    <div key={color} className="w-8 h-8 rounded-lg cursor-pointer border-2 border-white/10 hover:border-purple-500" style={{ background: color }} />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Accent Color</label>
                            <div className="flex gap-2">
                                {['#a855f7', '#06b6d4', '#10b981', '#f59e0b'].map(color => (
                                    <div key={color} className="w-8 h-8 rounded-lg cursor-pointer border-2 border-white/10 hover:border-white" style={{ background: color }} />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Button Style</label>
                            <div className="space-y-2">
                                {['Rounded', 'Sharp', 'Pill'].map(style => (
                                    <button key={style} className="w-full py-2 bg-slate-900/60 border border-white/5 rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:border-purple-500/30 transition-all">
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-white/5">
                        <button className="w-full py-3 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all flex items-center justify-center gap-2">
                            <Save size={14} /> Save Menu
                        </button>
                    </div>
                </aside>
            </div>
        );
    };

    return (
        <div className="space-y-8 flex flex-col h-[calc(100vh-140px)] animate-in slide-in-from-right-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <div>
                    <h2 className="text-4xl font-black font-orbitron text-white tracking-tighter flex items-center gap-4">
                        <Layout size={40} className="text-indigo-500" /> ATLAS <span className="text-indigo-500/50">UI</span>
                    </h2>
                    <p className="text-[10px] text-slate-500 font-black tracking-[0.4em] uppercase mt-2">Game UI Design & Generation Lab</p>
                </div>
                <div className="flex items-center gap-4">
                    {(['HUD_FORGE', 'MAP_MAKER', 'MENU_BUILDER'] as AtlasTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === tab
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                                : 'bg-slate-900/40 text-slate-500 hover:text-slate-200 border border-white/5'
                                }`}
                        >
                            {tab.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0">
                {activeTab === 'HUD_FORGE' && renderHudForge()}
                {activeTab === 'MAP_MAKER' && renderMapMaker()}
                {activeTab === 'MENU_BUILDER' && renderMenuBuilder()}
            </div>
        </div>
    );
};

export default AtlasUI;
