
import React from 'react';
import { ProductionContext } from '../../types';

interface DirectingOracleProps {
  context: ProductionContext | null;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const DirectingOracle: React.FC<DirectingOracleProps> = ({ context, onAnalyze, isAnalyzing }) => {
  return (
    <div className="w-80 border-l border-white/5 bg-slate-900/40 flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
      <div className="p-8 border-b border-white/5 bg-indigo-600/5 flex flex-col gap-1">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Conductor's Oracle</h3>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Neural Production Bible</p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-none">
        {!context ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-6 opacity-40 py-20">
            <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-slate-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" /><path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683z" /></svg>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Awaiting script analysis...</p>
          </div>
        ) : (
          <>
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" />
                <h4 className="text-[9px] font-black uppercase tracking-widest text-white">The Vision</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium italic">"{context.vision}"</p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" />
                <h4 className="text-[9px] font-black uppercase tracking-widest text-white">Tone Mapping</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{context.toneMap}</p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)]" />
                <h4 className="text-[9px] font-black uppercase tracking-widest text-white">Pacing Protocols</h4>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-[11px] text-slate-300 leading-relaxed border-l-amber-500/50 border-l-4 shadow-xl">
                {context.pacingAdvice}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,1)]" />
                <h4 className="text-[9px] font-black uppercase tracking-widest text-white">Cast Chemistry</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{context.characterDynamic}</p>
            </section>
          </>
        )}
      </div>

      <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-3xl">
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-4 rounded-2xl transition-all shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-3 group uppercase tracking-widest text-[10px] disabled:opacity-50"
        >
          {isAnalyzing ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1a6 6 0 1 1 0 12A6 6 0 0 1 8 2z" /><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3.5a.5.5 0 0 1-.5-.5v-3.5A.5.5 0 0 1 8 4z" /></svg>
          )}
          Analyze Production
        </button>
      </div>
    </div>
  );
};
