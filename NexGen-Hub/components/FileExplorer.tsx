
import React, { useState } from 'react';
import {
    Folder,
    FolderOpen,
    FileCode,
    FileJson,
    FileText,
    Image as ImageIcon,
    Music as AudioIcon,
    ChevronRight,
    ChevronDown
} from 'lucide-react';
import { FileNode } from '../types';

interface FileExplorerProps {
    tree: FileNode[];
    onFileClick: (file: FileNode) => void;
    activeFile?: FileNode | null;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ tree, onFileClick, activeFile }) => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    const toggleFolder = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newHandle = new Set(expandedFolders);
        if (newHandle.has(id)) newHandle.delete(id);
        else newHandle.add(id);
        setExpandedFolders(newHandle);
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'nx': return <FileCode size={14} className="text-cyan-400 animate-flicker-sm" />;
            case 'json': return <FileJson size={14} className="text-amber-400 animate-flicker-sm" />;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'svg': return <ImageIcon size={14} className="text-purple-400 animate-flicker-sm" />;
            case 'wav':
            case 'mp3':
            case 'ogg': return <AudioIcon size={14} className="text-pink-400 animate-flicker-sm" />;
            default: return <FileText size={14} className="text-slate-400 animate-flicker-sm" />;
        }
    };

    const renderTree = (nodes: FileNode[], depth = 0) => {
        return nodes.map(node => {
            const isExpanded = expandedFolders.has(node.id);
            const isActive = activeFile?.id === node.id;

            if (node.kind === 'directory') {
                return (
                    <div key={node.id} className="flex flex-col">
                        <div
                            onClick={(e) => toggleFolder(node.id, e)}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 cursor-pointer rounded-lg group transition-colors"
                            style={{ paddingLeft: `${depth * 12 + 8}px` }}
                        >
                            {isExpanded ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                            {isExpanded ? <FolderOpen size={16} className="text-cyan-500/70" /> : <Folder size={16} className="text-cyan-500/70" />}
                            <span className="text-[11px] font-bold text-slate-300 group-hover:text-white truncate uppercase tracking-wider">{node.name}</span>
                        </div>
                        {isExpanded && node.children && (
                            <div className="flex flex-col">
                                {renderTree(node.children, depth + 1)}
                            </div>
                        )}
                    </div>
                );
            }

            return (
                <div
                    key={node.id}
                    onClick={() => onFileClick(node)}
                    className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-lg transition-all group ${isActive ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                        }`}
                    style={{ paddingLeft: `${depth * 12 + 24}px` }}
                >
                    {getFileIcon(node.name)}
                    <span className="text-[11px] font-medium truncate tracking-wide">{node.name}</span>
                    {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,1)]" />}
                </div>
            );
        });
    };

    return (
        <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1 px-2">
            <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Project Explorer</span>
            </div>
            {tree.length > 0 ? (
                renderTree(tree)
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900/10 rounded-[2rem] border border-dashed border-white/5 mx-2 my-4 group/empty relative overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-500/[0.02] opacity-0 group-hover/empty:opacity-100 transition-opacity duration-1000" />

                    {/* Interactive Wireframe Graphic */}
                    <div className="relative w-16 h-16 mb-6 animate-wireframe-spin preserve-3d">
                        <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full" />
                        <div className="absolute inset-2 border border-cyan-500/40 rounded-full" />
                        <div className="absolute inset-[30%] border-[3px] border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Folder size={20} className="text-cyan-400/40" />
                        </div>
                    </div>

                    <div className="relative space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 group-hover/empty:text-cyan-400 transition-colors duration-500">
                            Neural Index Offline
                        </p>
                        <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-600 leading-relaxed max-w-[120px] mx-auto">
                            Scan System Assets to activate persistent project environment
                        </p>
                    </div>

                    {/* Decorative Pulse */}
                    <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-cyan-500/5 blur-3xl rounded-full group-hover/empty:bg-cyan-500/10 transition-colors" />
                </div>
            )}
        </div>
    );
};

export default FileExplorer;
