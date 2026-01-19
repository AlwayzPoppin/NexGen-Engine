
import React, { useState } from 'react';
import { Character, VoiceName } from '../../types';

interface CharacterCardProps {
  character: Character;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Character>) => void;
  onDelete: (id: string) => void;
  onSample: (id: string) => void;
}

interface VoicePreset {
  name: string;
  voice: VoiceName;
  pitch: number;
  timbre: number;
  style: string;
  emotion?: string;
  category: 'Heroic' | 'Villainous' | 'Ethereal' | 'Utility';
}

const VOICES: VoiceName[] = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr', 'Aoide', 'Eos', 'Orpheus'];
const EMOTIONS = ['Neutral', 'Happy', 'Sad', 'Angry', 'Surprised', 'Excited', 'Grumpy', 'Whispering', 'Fearful', 'Sarcastic'];
const STYLES = ['Standard', 'Gravelly', 'Breathy', 'Nasal', 'Theatrical', 'Monotone', 'Vocal Fry', 'Smooth', 'Aged', 'Youthful'];

const VOICE_PRESETS: VoicePreset[] = [
  { name: 'Paladin Captain', voice: 'Fenrir', pitch: 0.85, timbre: 0.9, style: 'Theatrical', category: 'Heroic' },
  { name: 'High Sage', voice: 'Aoide', pitch: 1.0, timbre: 0.7, style: 'Smooth', category: 'Ethereal' },
  { name: 'Rogue Infiltrator', voice: 'Kore', pitch: 1.1, timbre: 0.4, style: 'Breathy', category: 'Heroic' },
  { name: 'Ancient Lich', voice: 'Charon', pitch: 0.4, timbre: 0.2, style: 'Gravelly', category: 'Villainous' },
  { name: 'Solar Herald', voice: 'Eos', pitch: 1.2, timbre: 0.8, style: 'Youthful', category: 'Heroic' },
  { name: 'Cackling Imp', voice: 'Puck', pitch: 1.6, timbre: 0.3, style: 'Nasal', category: 'Villainous' },
  { name: 'Deep Space AI', voice: 'Orpheus', pitch: 0.6, timbre: 0.5, style: 'Monotone', category: 'Utility' },
  { name: 'Forest Spirit', voice: 'Zephyr', pitch: 1.0, timbre: 0.8, style: 'Smooth', category: 'Ethereal' },
  { name: 'Noir Detective', voice: 'Charon', pitch: 0.75, timbre: 0.6, style: 'Vocal Fry', category: 'Heroic' },
];

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onSample
}) => {
  const [showPresets, setShowPresets] = useState(false);

  const applyPreset = (preset: VoicePreset) => {
    onUpdate(character.id, {
      voice: preset.voice,
      pitch: preset.pitch,
      timbre: preset.timbre,
      style: preset.style,
      ...(preset.emotion && { emotion: preset.emotion })
    });
    setShowPresets(false);
  };

  return (
    <div
      className={`group relative p-5 rounded-2xl border-2 transition-all cursor-pointer select-none overflow-hidden ${isSelected
          ? 'border-indigo-500 bg-indigo-900/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
          : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
        }`}
      onClick={() => onSelect(character.id)}
    >
      <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>

      <button
        onClick={(e) => { e.stopPropagation(); onDelete(character.id); }}
        className="absolute top-3 right-3 p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10 z-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" /><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" /></svg>
      </button>

      <div className="flex items-center gap-4 mb-5">
        <div className="relative">
          <img src={character.avatarUrl} className="w-12 h-12 rounded-xl border border-white/5 object-cover" />
          <button
            onClick={(e) => { e.stopPropagation(); onSample(character.id); }}
            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${character.isSampling ? 'bg-amber-500 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-500'} shadow-lg border border-black/20`}
          >
            {character.isSampling ? (
              <div className="w-2 h-2 bg-white rounded-full"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" /></svg>
            )}
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <input
            className="bg-transparent font-black text-white text-base focus:outline-none w-full border-b border-transparent focus:border-indigo-500 transition-all uppercase tracking-tighter"
            value={character.name}
            onChange={(e) => onUpdate(character.id, { name: e.target.value })}
            onClick={(e) => e.stopPropagation()}
          />
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">{character.voice} // {character.style}</p>
        </div>
      </div>

      <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block">Actor Base</label>
            <select
              className="w-full bg-black/40 border border-slate-700/50 rounded-lg p-1.5 text-[10px] text-slate-300 outline-none"
              value={character.voice}
              onChange={(e) => onUpdate(character.id, { voice: e.target.value as VoiceName })}
            >
              {VOICES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block">Texture</label>
            <select
              className="w-full bg-black/40 border border-slate-700/50 rounded-lg p-1.5 text-[10px] text-slate-300 outline-none"
              value={character.style}
              onChange={(e) => onUpdate(character.id, { style: e.target.value })}
            >
              {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block">Performance Emotion</label>
          <select
            className="w-full bg-black/40 border border-slate-700/50 rounded-lg p-1.5 text-[10px] text-indigo-400 font-bold outline-none hover:border-indigo-500/30 transition-colors"
            value={character.emotion}
            onChange={(e) => onUpdate(character.id, { emotion: e.target.value })}
          >
            {EMOTIONS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest">Spectral Pitch</label>
              <span className="text-[9px] font-mono text-indigo-400">{character.pitch.toFixed(1)}x</span>
            </div>
            <input type="range" min="0.5" max="1.5" step="0.1" value={character.pitch} onChange={(e) => onUpdate(character.id, { pitch: parseFloat(e.target.value) })} className="w-full h-1 bg-slate-800 accent-indigo-500 rounded appearance-none cursor-pointer" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest">Resonant Timbre</label>
              <span className="text-[9px] font-mono text-emerald-400">{Math.round(character.timbre * 100)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.05" value={character.timbre} onChange={(e) => onUpdate(character.id, { timbre: parseFloat(e.target.value) })} className="w-full h-1 bg-slate-800 accent-emerald-500 rounded appearance-none cursor-pointer" />
          </div>
        </div>

        <button
          onClick={() => setShowPresets(!showPresets)}
          className={`w-full py-2 border rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${showPresets ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'}`}
        >
          {showPresets ? 'Close Presets' : 'Actor Presets'}
        </button>

        {showPresets && (
          <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto pr-1 scrollbar-none">
            {VOICE_PRESETS.map(p => (
              <button key={p.name} onClick={() => applyPreset(p)} className="text-[9px] text-left p-2 bg-black/40 hover:bg-indigo-500/20 rounded-lg border border-slate-800/50 transition-colors">
                <span className="block font-black text-slate-300 uppercase tracking-tighter">{p.name}</span>
                <span className="text-[7px] text-slate-600 font-bold uppercase">{p.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
