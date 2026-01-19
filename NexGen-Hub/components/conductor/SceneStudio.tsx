
import React, { useState, useRef } from 'react';
import { ConductorScene, ConductorCharacter } from '../../types';
import { generateSceneAcoustics, generateCharacterDialogue } from '../../services/geminiService';
import { createImpulseResponse, pcmToWav } from '../../services/audioUtils';

interface SceneStudioProps {
  scenes: ConductorScene[];
  characters: ConductorCharacter[];
  onUpdate: (id: string, updates: Partial<ConductorScene>) => void;
  onAdd: (scene?: Partial<ConductorScene>) => void;
}

export const SceneStudio: React.FC<SceneStudioProps> = ({ scenes, characters, onUpdate, onAdd }) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCharId, setSelectedCharId] = useState<string>(characters[0]?.id || "");
  const [isTesting, setIsTesting] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const handleAiGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const blueprint = await generateSceneAcoustics(prompt);
      onAdd({ ...blueprint, description: prompt });
      setPrompt("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSoundCheck = async (scene: ConductorScene) => {
    const char = characters.find(c => c.id === selectedCharId);
    if (!char) return;

    setIsTesting(scene.id);
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      // Generate a context-aware test phrase
      const testPhrase = `Testing the acoustics of the ${scene.name}. How does my voice sound in this space?`;
      const { pcmData } = await generateCharacterDialogue(testPhrase, char.voice, char.emotion, char.pitch, char.style, char.timbre);

      const buffer = await ctx.decodeAudioData(pcmData.buffer.slice(0));
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // FX Chain
      const lowPass = ctx.createBiquadFilter();
      lowPass.type = 'lowpass';
      lowPass.frequency.value = scene.lowPassFreq;

      const convolver = ctx.createConvolver();
      convolver.buffer = createImpulseResponse(ctx, scene.reverbSize * 4, scene.reverbDecay);

      const dryGain = ctx.createGain();
      const wetGain = ctx.createGain();
      dryGain.gain.value = 1 - scene.wetMix;
      wetGain.gain.value = scene.wetMix;

      source.connect(lowPass);
      lowPass.connect(dryGain);
      lowPass.connect(convolver);
      convolver.connect(wetGain);
      dryGain.connect(ctx.destination);
      wetGain.connect(ctx.destination);

      source.start();
      source.onended = () => setIsTesting(null);
    } catch (e) {
      console.error(e);
      setIsTesting(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden text-slate-300">
      <header className="h-24 border-b border-white/5 flex items-center px-10 bg-slate-900/40 justify-between backdrop-blur-xl shrink-0">
        <div>
          <h2 className="text-xl font-black text-indigo-400 flex items-center gap-3 uppercase tracking-tighter">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /></svg>
            </div>
            Spatial Architect
          </h2>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-11">Neural Acoustic Engine v13.0</p>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center bg-black/40 border border-slate-800 rounded-2xl px-4 mr-4">
            <span className="text-[9px] font-black uppercase text-slate-500 mr-3">Test Actor:</span>
            <select
              className="bg-transparent text-[10px] font-black text-indigo-400 outline-none uppercase"
              value={selectedCharId}
              onChange={(e) => setSelectedCharId(e.target.value)}
            >
              {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="relative flex items-center">
            <input
              className="bg-black/60 border border-slate-800 rounded-2xl px-6 py-3 text-xs w-80 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
              placeholder="Blueprint environment (e.g. Cathedral Ruins)..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
            />
            <button
              disabled={isGenerating || !prompt.trim()}
              onClick={handleAiGenerate}
              className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[9px] font-black uppercase tracking-widest text-white disabled:opacity-50 transition-all"
            >
              {isGenerating ? 'Mapping...' : 'Render'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 scrollbar-thin">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 pb-32">
          {scenes.map(scene => (
            <div key={scene.id} className="bg-slate-900/50 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl hover:border-indigo-500/40 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3z" /></svg>
              </div>

              <div className="flex justify-between items-start mb-8">
                <div className="flex-1">
                  <input
                    className="bg-transparent text-2xl font-black text-white focus:outline-none border-b-2 border-transparent focus:border-indigo-500 transition-all uppercase tracking-tighter w-full"
                    value={scene.name}
                    onChange={(e) => onUpdate(scene.id, { name: e.target.value })}
                  />
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Spatial DNA</span>
                    <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Reflectivity: {Math.round(scene.wetMix * 100)}%</span>
                  </div>
                </div>
                <button
                  onClick={() => handleSoundCheck(scene)}
                  disabled={isTesting !== null || characters.length === 0}
                  className={`px-6 py-3 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all ${isTesting === scene.id ? 'bg-indigo-600 border-indigo-400 text-white animate-pulse' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white'}`}
                >
                  {isTesting === scene.id ? 'Sound Check Active' : 'Test Acoustics'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Volume (Size)</label>
                      <span className="text-[10px] text-indigo-400 font-mono font-bold">{Math.round(scene.reverbSize * 100)}%</span>
                    </div>
                    <input
                      type="range" min="0.01" max="1" step="0.01" value={scene.reverbSize}
                      onChange={(e) => onUpdate(scene.id, { reverbSize: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none accent-indigo-500 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Temporal Decay</label>
                      <span className="text-[10px] text-indigo-400 font-mono font-bold">{scene.reverbDecay}s</span>
                    </div>
                    <input
                      type="range" min="0.1" max="10" step="0.1" value={scene.reverbDecay}
                      onChange={(e) => onUpdate(scene.id, { reverbDecay: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Wetness (Mix)</label>
                      <span className="text-[10px] text-indigo-400 font-mono font-bold">{Math.round(scene.wetMix * 100)}%</span>
                    </div>
                    <input
                      type="range" min="0" max="1" step="0.01" value={scene.wetMix}
                      onChange={(e) => onUpdate(scene.id, { wetMix: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none accent-indigo-500 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Damping (Cutoff)</label>
                      <span className="text-[10px] text-indigo-400 font-mono font-bold">{Math.round(scene.lowPassFreq)}Hz</span>
                    </div>
                    <input
                      type="range" min="200" max="20000" step="100" value={scene.lowPassFreq}
                      onChange={(e) => onUpdate(scene.id, { lowPassFreq: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 h-64 bg-black/60 rounded-[2rem] relative overflow-hidden flex items-center justify-center border border-white/5 shadow-inner perspective-[1000px]">
                <div
                  className="absolute inset-0 bg-indigo-500/5 transition-all duration-1000"
                  style={{ opacity: 0.05 + (scene.wetMix * 0.4) }}
                ></div>

                {/* 3D Wireframe Room Projection */}
                <div
                  className="border-2 border-indigo-500/30 transition-all duration-700 shadow-[0_0_50px_rgba(99,102,241,0.2)] flex items-center justify-center relative preserve-3d"
                  style={{
                    width: `${20 + scene.reverbSize * 70}%`,
                    height: `${20 + scene.reverbSize * 70}%`,
                    borderRadius: `${10 + (scene.lowPassFreq / 20000) * 40}%`,
                    filter: `blur(${Math.max(0, (20000 - scene.lowPassFreq) / 2000)}px)`,
                    transform: `rotateX(60deg) rotateZ(${scene.reverbDecay * 5}deg)`
                  }}
                >
                  <div className="absolute inset-0 border border-indigo-400/10 rounded-full animate-ping opacity-20" style={{ animationDuration: `${2 + scene.reverbDecay}s` }}></div>

                  {/* Placed Actor Placeholder */}
                  <div
                    className="w-12 h-12 rounded-full border-2 border-white/20 bg-indigo-600/20 backdrop-blur-md flex items-center justify-center transition-all"
                    style={{ transform: `rotateX(-60deg) translateY(-20px)` }}
                  >
                    {characters.find(c => c.id === selectedCharId) ? (
                      <img src={characters.find(c => c.id === selectedCharId)?.avatarUrl} className="w-full h-full rounded-full object-cover opacity-60" />
                    ) : (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 flex flex-col gap-1">
                  <span className="text-[8px] font-black uppercase text-indigo-400 tracking-widest">Spatial Grid Active</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-4 h-0.5 bg-indigo-500/20 rounded-full"></div>)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
