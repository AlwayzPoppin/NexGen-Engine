
import React, { useState, useEffect } from 'react';
import {
    X,
    Save,
    Zap,
    Terminal,
    ShieldAlert,
    CheckCircle2,
    BrainCircuit,
    MessageSquare,
    Play
} from 'lucide-react';
import { FileNode } from '../types';

interface Tab {
    file: FileNode;
    content: string;
    isDirty: boolean;
}

interface NexScriptEditorProps {
    openFiles: FileNode[];
    activeFile: FileNode | null;
    onSetActive: (file: FileNode) => void;
    onCloseFile: (fileId: string) => void;
    onSave: (file: FileNode, content: string) => void;
}

const NexScriptEditor: React.FC<NexScriptEditorProps> = ({
    openFiles,
    activeFile,
    onSetActive,
    onCloseFile,
    onSave
}) => {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeContent, setActiveContent] = useState('');
    const [isLinterRunning, setIsLinterRunning] = useState(false);
    const [linterResults, setLinterResults] = useState<{ msg: string, type: 'error' | 'success' } | null>(null);

    // Load file content when active file changes
    useEffect(() => {
        const loadContent = async () => {
            if (activeFile) {
                // Check if already in tabs
                const existingTab = tabs.find(t => t.file.id === activeFile.id);
                if (existingTab) {
                    setActiveContent(existingTab.content);
                } else {
                    try {
                        const file = await activeFile.handle.getFile();
                        const text = await file.text();
                        setTabs(prev => [...prev, { file: activeFile, content: text, isDirty: false }]);
                        setActiveContent(text);
                    } catch (e) {
                        console.error('Failed to read file:', e);
                    }
                }
            }
        };
        loadContent();
    }, [activeFile]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setActiveContent(val);
        setTabs(prev => prev.map(t => t.file.id === activeFile?.id ? { ...t, content: val, isDirty: true } : t));
    };

    const handleSave = () => {
        if (activeFile) {
            onSave(activeFile, activeContent);
            setTabs(prev => prev.map(t => t.file.id === activeFile.id ? { ...t, isDirty: false } : t));
        }
    };

    const runAILinter = () => {
        setIsLinterRunning(true);
        setLinterResults(null);

        // Simulate AI Linter
        setTimeout(() => {
            const hasErrors = activeContent.toLowerCase().includes('error') || activeContent.length < 10;
            setLinterResults(hasErrors
                ? { msg: "Syntax Error: Unresolved module hook at line 12. Suggesting [Fix with AI].", type: 'error' }
                : { msg: "Syntax Check Passed: All NexScript protocols synchronized.", type: 'success' }
            );
            setIsLinterRunning(false);
        }, 1500);
    };

    if (openFiles.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20 bg-slate-950/20 rounded-[2.5rem] border border-white/5 mx-4 my-8">
                <Terminal size={64} />
                <p className="mt-4 font-black uppercase tracking-[0.4em] text-xs">Awaiting Source Data</p>
                <p className="mt-2 text-[10px] font-bold">Select a file from the explorer to begin editing</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-950/20 rounded-[2.5rem] border border-white/5 mx-4 my-8 overflow-hidden shadow-2xl">
            {/* Tab Bar */}
            <div className="flex items-center gap-1 bg-slate-900/40 border-b border-white/5 px-4 pt-4 overflow-x-auto custom-scrollbar">
                {openFiles.map(file => {
                    const isActive = activeFile?.id === file.id;
                    const isDirty = tabs.find(t => t.file.id === file.id)?.isDirty;
                    return (
                        <div
                            key={file.id}
                            onClick={() => onSetActive(file)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-t-xl cursor-pointer transition-all border-t border-x ${isActive
                                    ? 'bg-[#0a0f1a] border-cyan-500/30 text-cyan-400'
                                    : 'bg-transparent border-transparent text-slate-500 hover:bg-white/5'
                                }`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-wider truncate max-w-[120px]">{file.name}</span>
                            {isDirty && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                            <button
                                onClick={(e) => { e.stopPropagation(); onCloseFile(file.id); }}
                                className="hover:text-red-400 transition-colors ml-2"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Editor Content */}
            <div className="flex-1 flex min-h-0">
                <div className="flex-1 relative bg-[#0a0f1a]">
                    <textarea
                        value={activeContent}
                        onChange={handleContentChange}
                        spellCheck={false}
                        className="w-full h-full bg-transparent p-8 font-mono text-sm text-slate-300 focus:outline-none resize-none custom-scrollbar"
                        placeholder="Write NexScript logic here..."
                    />

                    {/* Action Overlay */}
                    <div className="absolute bottom-10 right-10 flex gap-4">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20"
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>

                {/* AI Linter Sidebar */}
                <div className="w-80 border-l border-white/5 bg-slate-900/30 backdrop-blur-3xl flex flex-col p-6 gap-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-400">
                            <BrainCircuit size={18} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">AI Assistant</span>
                    </div>

                    <button
                        onClick={runAILinter}
                        disabled={isLinterRunning}
                        className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border ${isLinterRunning
                                ? 'bg-slate-800 border-slate-700 text-slate-600'
                                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                            }`}
                    >
                        {isLinterRunning ? <Zap size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
                        {isLinterRunning ? 'Analyzing...' : 'Check Syntax'}
                    </button>

                    {linterResults && (
                        <div className={`p-4 rounded-2xl border animate-in slide-in-from-top duration-500 ${linterResults.type === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            <div className="flex items-start gap-3">
                                {linterResults.type === 'success' ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                                <p className="text-[11px] font-bold leading-relaxed">{linterResults.msg}</p>
                            </div>
                            {linterResults.type === 'error' && (
                                <button className="mt-4 w-full py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-500/30 transition-all flex items-center justify-center gap-2">
                                    <Zap size={10} /> Fix with AI
                                </button>
                            )}
                        </div>
                    )}

                    <div className="flex-1 flex flex-col gap-4">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Editor Insight</div>
                        <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-3">
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <MessageSquare size={12} className="text-cyan-500" />
                                <span>Explain this logic</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <Play size={12} className="text-emerald-500" />
                                <span>Run in Sandbox</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NexScriptEditor;
