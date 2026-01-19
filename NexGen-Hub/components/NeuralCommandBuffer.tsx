import React from 'react';
import { NeuralAction } from '../types';
import { Shield, Play, X, Check, Clock, AlertTriangle } from 'lucide-react';

interface NeuralCommandBufferProps {
    actions: NeuralAction[];
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onApproveAll: () => void;
    onRejectAll: () => void;
}

const NeuralCommandBuffer: React.FC<NeuralCommandBufferProps> = ({
    actions,
    onApprove,
    onReject,
    onApproveAll,
    onRejectAll
}) => {
    if (actions.length === 0) return null;

    return (
        <div className="fixed bottom-24 right-6 w-96 bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[60vh] animate-in slide-in-from-bottom-5 fade-in duration-300">
            {/* Header */}
            <div className="p-3 bg-slate-950/80 border-b border-cyan-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-bold text-cyan-100 uppercase tracking-wider">Neural Buffer</span>
                    <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded-full border border-cyan-500/30">
                        {actions.length}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onRejectAll}
                        className="text-[10px] text-red-400 hover:text-red-300 px-2 py-1 hover:bg-red-500/10 rounded transition-colors"
                    >
                        REJECT ALL
                    </button>
                    <button
                        onClick={onApproveAll}
                        className="text-[10px] bg-cyan-600 hover:bg-cyan-500 text-white px-2 py-1 rounded shadow-lg shadow-cyan-900/20 transition-all"
                    >
                        APPROVE ALL
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {actions.map((action) => (
                    <div
                        key={action.id}
                        className="bg-slate-800/50 border border-slate-700 hover:border-cyan-500/30 rounded-lg p-3 transition-all group relative"
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${action.type === 'CREATE_FILE' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                                    action.type === 'GENERATE_SPRITE' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                                        'bg-slate-700/50 text-slate-400 border-slate-600'
                                }`}>
                                {action.type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(action.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>

                        <p className="text-sm text-slate-200 font-medium leading-snug mb-2">
                            {action.description}
                        </p>

                        {action.type === 'CREATE_FILE' && (
                            <div className="text-[10px] font-mono text-slate-400 bg-slate-950/50 p-1.5 rounded mb-2 overflow-hidden text-ellipsis whitespace-nowrap">
                                {action.data.path}
                            </div>
                        )}

                        <div className="flex gap-2 mt-1">
                            <button
                                onClick={() => onReject(action.id)}
                                className="flex-1 flex items-center justify-center gap-1 bg-slate-700 hover:bg-red-900/20 hover:text-red-300 hover:border-red-500/30 border border-transparent py-1.5 rounded text-xs text-slate-400 transition-all"
                            >
                                <X className="w-3.5 h-3.5" />
                                Dismiss
                            </button>
                            <button
                                onClick={() => onApprove(action.id)}
                                className="flex-1 flex items-center justify-center gap-1 bg-cyan-600/20 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 py-1.5 rounded text-xs transition-all shadow-sm"
                            >
                                <Play className="w-3.5 h-3.5" />
                                Execute
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NeuralCommandBuffer;
