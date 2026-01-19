
import React, { useState, useEffect } from 'react';
import { DialogueLine, Character, AudioTake } from '../../types';
import { WaveformDisplay } from './WaveformDisplay';
import { FaceVisualizer } from './FaceVisualizer';

interface ScriptLineProps {
  line: DialogueLine;
  character?: Character;
  isFirst: boolean;
  isLast: boolean;
  isActiveInPlayback?: boolean;
  onUpdate: (id: string, text: string) => void;
  onUpdatePitch: (id: string, pitch: number) => void;
  onGenerate: (id: string) => void;
  onPlay: (url: string) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onSetActiveTake: (lineId: string, index: number) => void;
  onDeleteTake: (lineId: string, index: number) => void;
}

export const ScriptLine: React.FC<ScriptLineProps> = ({
  line,
  character,
  isFirst,
  isLast,
  isActiveInPlayback,
  onUpdate,
  onUpdatePitch,
  onGenerate,
  onPlay,
  onRemove,
  onMoveUp,
  onMoveDown,
  onSetActiveTake,
  onDeleteTake
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playStartTime, setPlayStartTime] = useState(0);
  const [showCritique, setShowCritique] = useState(false);

  const activeTake: AudioTake | null = line.takes[line.activeTakeIndex] || null;
  const linePitch = line.pitch ?? character?.pitch ?? 1.0;

  useEffect(() => {
    if (isActiveInPlayback && activeTake) {
      handlePlay();
    }
  }, [isActiveInPlayback]);

  const handlePlay = () => {
    if (activeTake) {
      setPlayStartTime(Date.now());
      setIsPlaying(true);
      onPlay(activeTake.audioUrl);

      const audio = new Audio(activeTake.audioUrl);
      audio.addEventListener('loadedmetadata', () => {
        setTimeout(() => setIsPlaying(false), audio.duration * 1000);
      });
    }
  };

  return (
    <div className={`group relative bg-slate-900/60 border rounded-3xl p-8 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl ${isActiveInPlayback ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-slate-800/80' : 'border-slate-800/80 hover:border-indigo-500/50'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-700/50 flex items-center justify-center overflow-hidden shadow-lg relative">
            {character?.avatarUrl ? (
              <img src={character.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-black text-slate-400 uppercase">{character?.name.substring(0, 2) || "??"}</span>
            )}
            {isPlaying && activeTake && (
              <div className="absolute inset-0 bg-indigo-600/60 backdrop-blur-sm flex items-center justify-center">
                <FaceVisualizer isPlaying={isPlaying} startTime={playStartTime} visemes={activeTake.visemes} scale={0.6} color="white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white uppercase tracking-tighter leading-none">{character?.name || 'Unknown Character'}</span>
              {line.emotion && (
                <span className="text-[8px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {line.emotion}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{character?.voice} // {character?.style}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {activeTake?.critique && (
            <button
              onClick={() => setShowCritique(!showCritique)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${activeTake.critique.score > 80 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Take Critique: {activeTake.critique.score}%
            </button>
          )}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onMoveUp(line.id)} disabled={isFirst} className={`p-2 transition-colors ${isFirst ? 'text-slate-800 cursor-not-allowed' : 'text-slate-600 hover:text-indigo-400'}`}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z" /></svg></button>
            <button onClick={() => onMoveDown(line.id)} disabled={isLast} className={`p-2 transition-colors ${isLast ? 'text-slate-800 cursor-not-allowed' : 'text-slate-600 hover:text-indigo-400'}`}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z" /></svg></button>
            <button onClick={() => onRemove(line.id)} className="p-2 text-slate-600 hover:text-red-400 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" /><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" /></svg></button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <textarea
          className="w-full bg-transparent text-slate-100 text-xl font-medium focus:outline-none resize-none min-h-[60px] leading-relaxed placeholder:text-slate-800"
          value={line.text}
          onChange={(e) => onUpdate(line.id, e.target.value)}
          placeholder="Dialogue line..."
        />
        {showCritique && activeTake?.critique && (
          <div className="mt-4 p-5 bg-black/40 border border-indigo-500/20 rounded-2xl animate-in slide-in-from-top-2 duration-300">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Neural Directing Insight</span>
              <button onClick={() => setShowCritique(false)} className="text-slate-600 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" /></svg></button>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">{activeTake.critique.feedback}</p>
            <div className="flex items-start gap-3 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
              <span className="text-indigo-400">💡</span>
              <p className="text-[11px] text-indigo-200 font-bold">{activeTake.critique.suggestion}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-8 bg-black/40 rounded-2xl p-4 border border-slate-800/50">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[9px] uppercase font-black text-slate-500 tracking-[0.2em]">Vocal Pitch</label>
              <span className="text-[9px] font-mono text-indigo-400">{linePitch.toFixed(2)}x</span>
            </div>
            <input
              type="range" min="0.5" max="1.5" step="0.05"
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              value={linePitch}
              onChange={(e) => onUpdatePitch(line.id, parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="w-48 h-12 bg-slate-950 rounded-xl overflow-hidden border border-slate-800/50 shadow-inner relative">
          {activeTake && activeTake.pcmData ? (
            <WaveformDisplay pcmData={activeTake.pcmData} color="#6366f1" height={48} />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-20">
              <div className="w-full flex gap-1 px-4">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="flex-1 h-1 bg-slate-700 rounded-full"></div>)}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeTake ? (
            <button
              onClick={handlePlay}
              className={`w-12 h-12 rounded-2xl ${isPlaying ? 'bg-red-600' : 'bg-indigo-600'} text-white shadow-xl hover:bg-indigo-500 transition-all flex items-center justify-center`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                {isPlaying ? <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z" /> : <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />}
              </svg>
            </button>
          ) : null}
          <button
            onClick={() => onGenerate(line.id)}
            disabled={line.isGenerating}
            className={`w-12 h-12 rounded-2xl ${line.isGenerating ? 'bg-slate-800' : 'bg-emerald-600 text-white'} transition-all flex items-center justify-center relative`}
            title="Generate Take"
          >
            {line.isGenerating ? (
              <div className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11 5.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1z" /><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10 0H4v12h8V2z" />
                </svg>
                {line.takes.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-indigo-600 text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-indigo-600 shadow-sm">+</span>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {line.takes.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3 overflow-x-auto scrollbar-none">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 shrink-0">Dailies Tray:</span>
          {line.takes.map((take, idx) => (
            <div key={take.id} className="relative group/take shrink-0">
              <button
                onClick={() => onSetActiveTake(line.id, idx)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all border ${line.activeTakeIndex === idx ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-800 border-white/5 text-slate-500 hover:text-slate-300'}`}
              >
                T{idx + 1}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteTake(line.id, idx); }}
                className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover/take:opacity-100 transition-opacity text-[8px]"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
