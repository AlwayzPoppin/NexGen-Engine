
import React, { useState } from 'react';
import {
    Plus,
    Sparkles,
    Map as MapIcon,
    Play,
    BookOpen,
    Mic,
    ChevronRight,
    RefreshCcw,
    Zap,
    Activity
} from 'lucide-react';
import { ConductorCharacter, ConductorScript, DialogueLine } from '../../types';
import { ScriptLine } from './ScriptLine';
import { FaceVisualizer } from './FaceVisualizer';

interface ScriptStudioProps {
    characters: ConductorCharacter[];
    script: ConductorScript | null;
    setScript: (script: ConductorScript) => void;
    isScripting: boolean;
    onGenerateScript: (prompt: string) => void;
    onAddLine: () => void;
    onGenerateTake: (lineId: string) => void;
    onPlayTake: (url: string) => void;
    onSetActiveTake: (lineId: string, index: number) => void;
    onDeleteTake: (lineId: string, index: number) => void;
    onOpenSpatialMap: () => void;
    onTableRead: () => void;
    isTableReading: boolean;
    activePlaybackLineId: string | null;
}

export const ScriptStudio: React.FC<ScriptStudioProps> = ({
    characters,
    script,
    setScript,
    isScripting,
    onGenerateScript,
    onAddLine,
    onGenerateTake,
    onPlayTake,
    onSetActiveTake,
    onDeleteTake,
    onOpenSpatialMap,
    onTableRead,
    isTableReading,
    activePlaybackLineId
}) => {
    const [scriptPrompt, setScriptPrompt] = useState('');
    const [activeAnalysis, setActiveAnalysis] = useState('SCRIPT');
    const [playbackStartTime, setPlaybackStartTime] = useState(0);

    // Track playback start time when activePlaybackLineId changes to non-null
    React.useEffect(() => {
        if (activePlaybackLineId) {
            setPlaybackStartTime(Date.now());
        }
    }, [activePlaybackLineId]);

    const activeLineForVisemes = script?.lines.find(l => l.id === activePlaybackLineId);
    const activeTakeForVisemes = activeLineForVisemes?.takes[activeLineForVisemes.activeTakeIndex];

    const handleUpdateLine = (lineId: string, text: string) => {
        if (!script) return;
        const updatedLines = script.lines.map(l =>
            l.id === lineId ? { ...l, text } : l
        );
        setScript({ ...script, lines: updatedLines });
    };

    const handleUpdatePitch = (lineId: string, pitch: number) => {
        if (!script) return;
        const updatedLines = script.lines.map(l =>
            l.id === lineId ? { ...l, pitch } : l
        );
        setScript({ ...script, lines: updatedLines });
    };

    const handleRemoveLine = (lineId: string) => {
        if (!script) return;
        const updatedLines = script.lines.filter(l => l.id !== lineId);
        setScript({ ...script, lines: updatedLines });
    };

    const handleMoveLine = (lineId: string, direction: 'UP' | 'DOWN') => {
        if (!script) return;
        const index = script.lines.findIndex(l => l.id === lineId);
        if (index === -1) return;

        const newLines = [...script.lines];
        const targetIndex = direction === 'UP' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newLines.length) {
            [newLines[index], newLines[targetIndex]] = [newLines[targetIndex], newLines[index]];
            setScript({ ...script, lines: newLines });
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-950/40 animate-in fade-in duration-700">
            {/* Script Header Bar */}
            <header className="h-20 border-b border-white/5 flex items-center px-8 bg-slate-900/60 backdrop-blur-xl justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">Script Studio</h2>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Narrative Performance Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onOpenSpatialMap}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 border border-white/5 rounded-xl text-[10px] font-black text-slate-400 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest"
                    >
                        <MapIcon size={14} /> Spatial Map
                    </button>

                    <div className="h-6 w-px bg-white/5 mx-2" />

                    <button
                        onClick={onTableRead}
                        disabled={isTableReading || !script || script.lines.length === 0}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isTableReading ? 'bg-pink-600 animate-pulse text-white' : 'bg-slate-800/40 border border-white/5 text-slate-400 hover:text-white hover:border-white/20'}`}
                    >
                        <Play size={14} /> {isTableReading ? 'Reading...' : 'Table Read'}
                    </button>

                    <button
                        onClick={onAddLine}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600/10 border border-indigo-500/30 rounded-xl text-[10px] font-black text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest"
                    >
                        <Plus size={14} /> Add Line
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Script View */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Summon Script Input */}
                        <div className="glass-panel p-8 rounded-[2.5rem] border border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden group">
                            {/* Sub-Layer Pulse Overlay */}
                            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none px-12">
                                <div className="h-full w-full flex items-center justify-between gap-1">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32].map(i => (
                                        <div
                                            key={i}
                                            className={`w-1 rounded-full transition-all duration-300 ${isScripting ? 'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)]' : 'bg-slate-800'}`}
                                            style={{
                                                height: isScripting ? `${15 + Math.random() * 70}%` : '4px',
                                                animation: isScripting ? `pulse-height 1.5s ease-in-out infinite alternate ${i * 0.05}s` : 'none'
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-indigo-400/20 uppercase tracking-[0.5em] animate-pulse">
                                    {isScripting ? 'Synthesizing Neural Layers' : 'Sub-Layer Pulse Standby'}
                                </div>
                            </div>

                            <style dangerouslySetInnerHTML={{
                                __html: `
                                @keyframes pulse-height {
                                    from { height: 20%; }
                                    to { height: 80%; }
                                }
                            `}} />

                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Sparkles size={120} />
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Sparkles size={16} /> Neural Scripting Module
                                </h3>
                                <div className="flex gap-4">
                                    <textarea
                                        value={scriptPrompt}
                                        onChange={(e) => setScriptPrompt(e.target.value)}
                                        placeholder="Describe a scene or dialogue prompt (e.g., 'A tense confrontation between the Captain and the AI')..."
                                        className="flex-1 h-24 bg-black/40 border border-white/5 rounded-2xl p-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 resize-none transition-all"
                                    />
                                    <button
                                        onClick={() => onGenerateScript(scriptPrompt)}
                                        disabled={isScripting || !scriptPrompt.trim()}
                                        className="w-40 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl flex flex-col items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 shadow-xl shadow-indigo-900/40"
                                    >
                                        {isScripting ? (
                                            <RefreshCcw size={20} className="animate-spin" />
                                        ) : (
                                            <Zap size={20} />
                                        )}
                                        {isScripting ? 'Scripting...' : 'Summon Script'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Script Lines */}
                        <div className="space-y-6">
                            {script?.lines && script.lines.length > 0 ? (
                                script.lines.map((line, idx) => (
                                    <ScriptLine
                                        key={line.id}
                                        line={line}
                                        character={characters.find(c => c.id === line.characterId)}
                                        isFirst={idx === 0}
                                        isLast={idx === script.lines.length - 1}
                                        onUpdate={handleUpdateLine}
                                        onUpdatePitch={handleUpdatePitch}
                                        onRemove={handleRemoveLine}
                                        onMoveUp={(id) => handleMoveLine(id, 'UP')}
                                        onMoveDown={(id) => handleMoveLine(id, 'DOWN')}
                                        onGenerate={onGenerateTake}
                                        onPlay={onPlayTake}
                                        onSetActiveTake={onSetActiveTake}
                                        onDeleteTake={onDeleteTake}
                                        isActiveInPlayback={activePlaybackLineId === line.id}
                                    />
                                ))
                            ) : (
                                <div className="h-96 flex flex-col items-center justify-center text-center gap-6 opacity-30 py-20">
                                    <div className="w-20 h-20 rounded-[2rem] border-2 border-dashed border-slate-700 flex items-center justify-center">
                                        <Mic size={32} className="text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-slate-500 uppercase tracking-widest">No Takes Recorded Yet</p>
                                        <p className="text-xs text-slate-600 mt-2">Generate a script or add lines manually to begin performance capture.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-32" /> {/* Bottom Spacer */}
                    </div>
                </div>

                {/* Script Sidebar for analysis/oracle */}
                <aside className="w-80 border-l border-white/5 bg-black/20 p-8 space-y-10 overflow-y-auto scrollbar-none flex-none">
                    <section className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Performance Hud</h4>
                        <div className="space-y-4">
                            <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-slate-900/40 flex flex-col items-center justify-center gap-4 group hover:border-pink-500/20 transition-all min-h-[120px]">
                                {activePlaybackLineId && activeTakeForVisemes ? (
                                    <div className="w-full h-16 flex items-center justify-center">
                                        <FaceVisualizer
                                            isPlaying={true}
                                            startTime={playbackStartTime}
                                            visemes={activeTakeForVisemes.visemes}
                                            scale={0.8}
                                            color="#ec4899"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-10 flex items-center justify-center opacity-20">
                                        <div className="w-8 h-8 rounded-full border-2 border-slate-600 flex items-center justify-center">
                                            <Activity size={14} className="text-slate-600" />
                                        </div>
                                    </div>
                                )}
                                <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${activePlaybackLineId ? 'bg-pink-500 animate-pulse' : 'bg-slate-700'}`}></div>
                                    Lip-Sync Feed
                                </span>
                            </div>

                            <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-slate-900/40 flex items-center justify-between group hover:border-indigo-500/20 transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
                                        <Mic size={14} />
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Vocal Matrix</span>
                                </div>
                                <ChevronRight size={14} className="text-slate-600" />
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
};
