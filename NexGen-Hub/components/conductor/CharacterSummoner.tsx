
import React, { useState } from 'react';
import { summonCharacter, generateActorPortrait } from '../../services/geminiService';
import { Character } from '../../types';

interface CharacterSummonerProps {
  onSummon: (char: Partial<Character>) => void;
  onClose: () => void;
}

export const CharacterSummoner: React.FC<CharacterSummonerProps> = ({ onSummon, onClose }) => {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<'idle' | 'summoning' | 'imaging'>('idle');

  const handleSummon = async () => {
    if (!prompt.trim()) return;
    setStatus('summoning');
    try {
      const char = await summonCharacter(prompt);
      setStatus('imaging');
      const avatarUrl = await generateActorPortrait(`${char.name}: ${char.description}`);
      onSummon({ ...char, avatarUrl });
      onClose();
    } catch (e) {
      console.error(e);
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-[2.5rem] p-10 shadow-[0_0_100px_rgba(79,70,229,0.15)] animate-in zoom-in-95 duration-300 border-t-white/10">
        <div className="mb-8">
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 leading-none">Summon Actor</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">Neural Casting Agency v2.0</p>
        </div>

        <div className="relative mb-10 group">
          <textarea
            autoFocus
            className="w-full bg-black/60 border-2 border-slate-800 rounded-3xl p-6 text-slate-100 text-lg focus:border-indigo-500 outline-none min-h-[160px] transition-all placeholder:text-slate-700"
            placeholder="Describe the actor's archetype and vocal qualities..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={status !== 'idle'}
          />
          {status !== 'idle' && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                {status === 'summoning' ? 'Analyzing Voice Bio...' : 'Rendering Neural Portrait...'}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-5 px-4 rounded-2xl bg-slate-800 text-slate-400 font-black uppercase text-[11px] tracking-widest hover:bg-slate-700 transition-all border border-slate-700/50"
          >
            Cancel
          </button>
          <button
            onClick={handleSummon}
            disabled={status !== 'idle' || !prompt.trim()}
            className="flex-1 py-5 px-4 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[11px] tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/40 disabled:opacity-50 neural-pulse"
          >
            Initiate Casting
          </button>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {[1, 2, 3].map(i => <div key={i} className={`w-1 h-1 rounded-full ${status !== 'idle' ? 'bg-indigo-500 animate-bounce' : 'bg-slate-800'}`} style={{ animationDelay: `${i * 0.2}s` }}></div>)}
        </div>
      </div>
    </div>
  );
};
