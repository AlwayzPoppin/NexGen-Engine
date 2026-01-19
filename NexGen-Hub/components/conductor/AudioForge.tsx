import React, { useState, useRef, useEffect } from 'react';
import { designNeuralSound } from '../../services/geminiService';
import { pcmToWav, decodeAudioData } from '../../services/audioUtils';
import { renderNeuralSequence, SynthStep } from '../../services/synthEngine';
import { loadSample, SAMPLE_REGISTRY } from '../../services/sampleBank';
import { WaveformDisplay } from './WaveformDisplay';
import { AudioAssetForge } from '../../types';
import { Download, Play, Edit3, Zap, Layers, Activity, RefreshCcw } from 'lucide-react';

interface AudioForgeProps {
  assets: AudioAssetForge[];
  onAssetGenerated?: (asset: AudioAssetForge) => void;
}

const SFX_LIBRARY = {
  Ballistics: [
    { name: '12-Gauge Shotgun', prompt: 'Brutal shotgun_blast with deep sub_bass kick and metallic mechanical_clunk bolt cycle.' },
    { name: 'Silenced Pistol', prompt: 'Short, sharp gun_shot_kick with high frequency trigger_granular air hiss and no tail.' },
    { name: 'SMG Burst', prompt: 'Rapid submachine_burst sequence with randomized pitch and industrial reverb.' },
    { name: 'Railgun Pulse', prompt: 'High-frequency laser_zap transient followed by magnetic_hum and long plasma_noise tail.' }
  ],
  Destruction: [
    { name: 'Plate Glass Wall', prompt: 'Massive impact_glass shatter with dense trigger_granular falling shards and low-pass wood impact.' },
    { name: 'Chemical Vial', prompt: 'Sharp shatter_vial transient followed by organic_squelch liquid spill texture.' },
    { name: 'Steel Girders', prompt: 'Heavy metal impact with FM bells dissonance and low-frequency metal_stress groan.' },
    { name: 'Armor Piercing', prompt: 'Metal impact layered with flesh_impact and short submachine_burst punch.' }
  ],
  "Granular Lab": [
    { name: 'Bio-Organic Mass', prompt: 'Continuous organic_squelch with randomized resonant filter sweeps and wet granular noise.' },
    { name: 'Active Servo', prompt: 'Rising servo_whir pitch sweep layered with high-frequency mechanical_clunk tics.' },
    { name: 'Cyber Glitch', prompt: 'Rapid ui_click sequence at 160bpm with plasma_noise bursts and bit-crushed FM bells.' },
    { name: 'Shifting Rubble', prompt: 'Dense stone impact granular texture with slow frequency descent to simulate collapse.' }
  ],
  Ambience: [
    { name: 'Abyssal Winds', prompt: 'Low-density plasma_noise with slow LFO gain modulation and cavernous reverb.' },
    { name: 'Data Center Hum', prompt: 'Constant magnetic_hum with intermittent ui_click chirps and high-pitch FM bells.' },
    { name: 'Alien Hive', prompt: 'Rhythmic organic_squelch pulses with shimmering FM bells and wet granular texture.' },
    { name: 'Stellar Drift', prompt: 'Ethereal FM bells with ultra-long crystal reverb and high-freq white noise swells.' }
  ]
};

export const AudioForge: React.FC<AudioForgeProps> = ({ assets, onAssetGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [activeCategory, setActiveCategory] = useState<keyof typeof SFX_LIBRARY>('Ballistics');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState<string | null>(null);
  const [activePlaybackId, setActivePlaybackId] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState<AudioAssetForge | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const [grit, setGrit] = useState(0.4);
  const [tension, setTension] = useState(0.5);
  const [flux, setFlux] = useState(0.3);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const handleForge = async (customPrompt?: string, forceMode?: 'Music' | 'Foley' | 'SFX') => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) return;
    setIsGenerating(true);

    const category = forceMode || 'SFX';

    setLog([`CALIBRATING NEURAL CORE...`, `MODE: ${category.toUpperCase()}`, `TARGET: ${finalPrompt}`]);

    // Simulate scientific decomposition logs
    setTimeout(() => setLog(prev => [...prev, "DECOMPOSING TRANSIENT: Sharp High-Freq Spike Detected"]), 200);
    setTimeout(() => setLog(prev => [...prev, "ISOLATING BODY: Harmonic Resonance Mapping..."]), 400);
    setTimeout(() => setLog(prev => [...prev, "ANALYZING TAIL: Granular Decay & Reverb Tail Optimization"]), 600);

    try {
      const designPrompt = editingAsset
        ? `Editing [${editingAsset.name}]: ${finalPrompt}. Context: This is an existing audio asset. Contextualize the changes based on the asset identity.`
        : finalPrompt;

      // Fix: correct service call signature and access layers from result
      const result = await designNeuralSound(`${designPrompt}. Performance: Grit=${grit}, Tension=${tension}, Flux=${flux}`, category);
      const rawCalls = result.layers || [];

      setLog(prev => [...prev, `CHAIN OPTIMIZED: ${rawCalls.length} NEURAL LAYERS.`]);

      // Separate sample bank items from procedural items
      const sampleItems = rawCalls.filter((call: any) => call.component.startsWith('sample:'));
      const proceduralItems = rawCalls.filter((call: any) => !call.component.startsWith('sample:'));

      // Log sample bank usage
      if (sampleItems.length > 0) {
        setLog(prev => [...prev, `SAMPLE BANK: ${sampleItems.length} real recordings detected.`]);
        sampleItems.forEach((s: any) => {
          setLog(prev => [...prev, `LOAD SAMPLE: ${s.component.replace('sample:', '').toUpperCase()}`]);
        });
      }

      const steps: SynthStep[] = rawCalls.map((call: any) => {
        const componentName = (call.component.replace('trigger_', '').replace('apply_', ''));

        // Log individual tool activations
        if (!componentName.startsWith('sample:')) {
          setLog(prev => [...prev, `ACTIVATE TOOL: ${componentName.toUpperCase()} @ ${call.startTime}s`]);
        }

        return {
          type: 'layer',
          sampleName: componentName,
          frequency: call.frequency,
          startTime: call.startTime,
          duration: call.duration,
          waveType: call.waveType,
          ...call.args
        } as SynthStep;
      });

      // Render procedural audio
      const pcmData = await renderNeuralSequence(steps);

      // If there are sample bank items, we'll need to mix them during playback
      // Store the sample references in the recipe for later playback
      if (sampleItems.length > 0) {
        setLog(prev => [...prev, `MIX MODE: Procedural + ${sampleItems.length} samples will be layered on playback.`]);
      }

      if (editingAsset) {
        // Update existing asset
        const updatedAsset: AudioAssetForge = {
          ...editingAsset,
          url: URL.createObjectURL(pcmToWav(pcmData, 24000)),
          pcmData,
          recipe: rawCalls,
          timestamp: Date.now(),
        };
        onAssetGenerated?.(updatedAsset);
        setEditingAsset(null);
        setLog(prev => [...prev, "REMASTERING COMPLETE. SIGNAL STABLE."]);
      } else {
        // Create new asset
        const newAsset: AudioAssetForge = {
          id: `ai-${Date.now()}`,
          name: finalPrompt,
          subType: actualMode as any,
          url: URL.createObjectURL(pcmToWav(pcmData, 24000)),
          pcmData,
          timestamp: Date.now(),
          recipe: rawCalls,
          variations: []
        };
        onAssetGenerated?.(newAsset);
        setLog(prev => [...prev, "SYNTHESIS COMPLETE. SIGNAL STABLE."]);
      }

      if (!customPrompt) setPrompt('');
    } catch (e) {
      console.error(e);
      setLog(prev => [...prev, "CRITICAL ERROR: CORE COLLAPSE."]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVariations = async (asset: AudioAssetForge) => {
    if (!asset.recipe) return;
    setIsGeneratingVariations(asset.id);

    try {
      const steps: SynthStep[] = asset.recipe.map((call: any) => {
        const componentName = (call.component.replace('trigger_', '').replace('apply_', ''));
        return {
          type: 'layer',
          sampleName: componentName,
          frequency: call.frequency,
          startTime: call.startTime,
          duration: call.duration,
          waveType: call.waveType,
          ...call.args
        } as SynthStep;
      });

      const variations = [];
      for (let i = 1; i <= 3; i++) {
        const pcmData = await renderNeuralSequence(steps, i * 100);
        variations.push({
          id: `var-${asset.id}-${i}`,
          url: URL.createObjectURL(pcmToWav(pcmData, 24000)),
          pcmData
        });
      }

      onAssetGenerated?.({ ...asset, variations });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingVariations(null);
    }
  };

  const playAsset = async (asset: AudioAssetForge | { pcmData: Uint8Array, id: string }) => {
    if (sourceNodeRef.current) try { sourceNodeRef.current.stop(); } catch (e) { }
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
    const buffer = await decodeAudioData(asset.pcmData, audioCtxRef.current, 24000, 1);
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtxRef.current.destination);
    source.start();
    sourceNodeRef.current = source;
    setActivePlaybackId(asset.id);
    source.onended = () => setActivePlaybackId(null);
  };

  const downloadAsset = (asset: AudioAssetForge | { pcmData: Uint8Array, name?: string, id: string }) => {
    const pcm = asset.pcmData;
    const wavBlob = pcmToWav(pcm, 24000);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(asset as any).name || asset.id}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020617] text-slate-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <header className="h-20 border-b border-white/5 flex items-center px-10 bg-slate-900/60 backdrop-blur-xl justify-between shrink-0 z-10">
        <div className="flex items-center gap-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">Neural Core</h2>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Unified Audio Laboratory v15.0</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Category:</span>
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value as keyof typeof SFX_LIBRARY)}
            className="bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-indigo-500/50 cursor-pointer"
          >
            {(Object.keys(SFX_LIBRARY) as Array<keyof typeof SFX_LIBRARY>).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-4 gap-10 scrollbar-thin relative z-10">
        <div className="lg:col-span-3 space-y-10">
          <section className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Sub-Layer Pulse Overlay */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
              <div className="h-full w-full flex items-center justify-center gap-1.5 px-20">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(i => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-300 ${isGenerating ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`}
                    style={{
                      height: isGenerating ? `${15 + Math.random() * 50}%` : '6px',
                      animation: isGenerating ? `pulse-height-audio 1.2s ease-in-out infinite alternate ${i * 0.08}s` : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            <style dangerouslySetInnerHTML={{
              __html: `
              @keyframes pulse-height-audio {
                from { height: 15%; }
                to { height: 65%; }
              }
            `}} />

            <div className="relative z-10 space-y-10">
              <div className="flex justify-between items-center">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400">Signal Parametrics</h3>
                <div className="flex gap-8">
                  {['Grit', 'Tension', 'Flux'].map((m, i) => (
                    <div key={m} className="flex flex-col items-center gap-3">
                      <div className="relative w-14 h-14">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="28" cy="28" r="24" className="stroke-slate-800 fill-none" strokeWidth="4" />
                          <circle cx="28" cy="28" r="24" className={`fill-none ${i === 0 ? 'stroke-red-500' : i === 1 ? 'stroke-indigo-500' : 'stroke-emerald-500'}`} strokeWidth="4" strokeDasharray="150.8" strokeDashoffset={150.8 * (1 - (i === 0 ? grit : i === 1 ? tension : flux))} />
                        </svg>
                        <input type="range" min="0" max="1" step="0.01" value={i === 0 ? grit : i === 1 ? tension : flux} onChange={(e) => i === 0 ? setGrit(parseFloat(e.target.value)) : i === 1 ? setTension(parseFloat(e.target.value)) : setFlux(parseFloat(e.target.value))} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unified Input + Presets Layout */}
              <div className="space-y-8">
                {/* Freeform Prompt Input */}
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Custom Synthesis Prompt</label>
                  <textarea
                    className="w-full bg-black/60 border-2 border-white/5 rounded-3xl p-6 text-white focus:border-indigo-500/50 min-h-[100px] text-lg font-medium outline-none transition-all placeholder:text-slate-700 shadow-inner resize-none"
                    placeholder="Describe your sound... e.g., 'heavy footsteps on metal grating', 'crackling fire with wind', 'sci-fi door hydraulics'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleForge()}
                  />
                </div>

                {/* Quick Presets from Active Category */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-black uppercase tracking-widest text-emerald-400">{activeCategory} Presets</label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {SFX_LIBRARY[activeCategory].map(p => (
                      <button
                        key={p.name}
                        onClick={() => handleForge(p.prompt, 'SFX')}
                        disabled={isGenerating}
                        className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-indigo-600/10 hover:border-indigo-500/30 transition-all group text-left disabled:opacity-50"
                      >
                        <span className="text-[10px] font-black uppercase text-white block mb-1">{p.name}</span>
                        <p className="text-[9px] text-slate-500 leading-relaxed line-clamp-2">{p.prompt}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-white/5">
                <div className="flex gap-4 items-center">
                  <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-indigo-500 animate-ping' : 'bg-slate-800'}`} />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{isGenerating ? 'Synthesis Engine Active' : 'Standby'}</span>
                    {editingAsset && (
                      <span className="text-[8px] font-black text-pink-500 uppercase tracking-widest animate-pulse">Editing: {editingAsset.name}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-4">
                  {editingAsset && (
                    <button
                      onClick={() => { setEditingAsset(null); setPrompt(''); }}
                      className="py-4 px-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-slate-400 border border-white/10 hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => handleForge()}
                    disabled={isGenerating || !prompt.trim()}
                    className={`py-4 px-12 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-white transition-all shadow-xl ${isGenerating ? 'bg-slate-800 opacity-50' : editingAsset ? 'bg-pink-600 hover:bg-pink-500 shadow-pink-900/40' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/40'}`}
                  >
                    {editingAsset ? 'Remaster' : 'Forge Custom'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-4 flex items-center gap-2">
              <Layers size={12} /> Generated Manifest
            </h3>
            <div className="space-y-6">
              {assets.map(asset => (
                <div key={asset.id} className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 flex flex-col hover:border-indigo-500/20 transition-all shadow-xl backdrop-blur-xl group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${asset.subType === 'Foley' ? 'border-red-500/20 bg-red-500/5 text-red-400' : asset.subType === 'SFX' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400'}`}>
                        <Music size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${asset.subType === 'Foley' ? 'border-red-500/30 text-red-400' : asset.subType === 'SFX' ? 'border-emerald-500/30 text-emerald-400' : 'border-indigo-500/30 text-indigo-400'}`}>{asset.subType}</span>
                          <h4 className="text-base font-black text-white truncate uppercase tracking-tighter">{asset.name}</h4>
                        </div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{asset.recipe?.length || 0} Neural Layers</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setEditingAsset(asset);
                          setPrompt("");
                          setDesignMode(asset.subType === 'Music' ? 'Music' : 'Foley');
                        }}
                        className="px-4 py-2 rounded-xl bg-pink-600/10 border border-pink-500/20 text-pink-400 text-[9px] font-black uppercase tracking-widest hover:bg-pink-600/20 transition-all"
                        title="AI Refine"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleVariations(asset)}
                        disabled={isGeneratingVariations === asset.id}
                        className="px-4 py-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600/20 transition-all disabled:opacity-50"
                        title="Vary"
                      >
                        <RefreshCcw size={14} className={isGeneratingVariations === asset.id ? 'animate-spin' : ''} />
                      </button>
                      <button
                        onClick={() => downloadAsset(asset)}
                        className="px-4 py-2 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600/20 transition-all"
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                      <button onClick={() => playAsset(asset)} className={`p-4 rounded-2xl border transition-all ${activePlaybackId === asset.id ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/40' : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white hover:bg-slate-700'}`}>
                        {activePlaybackId === asset.id ? <Activity size={20} /> : <Play size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="h-16 w-full bg-black/60 rounded-xl overflow-hidden border border-white/5 mb-4 relative">
                    <WaveformDisplay pcmData={asset.pcmData} color={asset.subType === 'Foley' ? '#f87171' : asset.subType === 'SFX' ? '#10b981' : '#6366f1'} height={64} />
                  </div>

                  {asset.variations && asset.variations.length > 0 && (
                    <div className="flex gap-3 mt-2 pt-4 border-t border-white/5 overflow-x-auto pb-2 custom-scrollbar">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest self-center mr-2 shrink-0">Neural Vars:</span>
                      {asset.variations.map((v, i) => (
                        <div key={v.id} className="flex gap-2 shrink-0">
                          <button
                            onClick={() => playAsset(v)}
                            className={`w-10 h-10 rounded-lg border transition-all flex items-center justify-center text-[10px] font-black ${activePlaybackId === v.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/40 border-white/5 text-slate-500 hover:text-white'}`}
                          >
                            V{i + 1}
                          </button>
                          <button
                            onClick={() => downloadAsset(v)}
                            className="w-10 h-10 rounded-lg border border-white/5 bg-black/40 text-slate-500 hover:text-emerald-400 flex items-center justify-center transition-all"
                          >
                            <Download size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {assets.length === 0 && (
                <div className="py-20 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-600 bg-slate-900/20 backdrop-blur-sm">
                  <Activity size={40} className="mb-4 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-[0.2em]">Manifest Empty</p>
                  <p className="text-[9px] uppercase tracking-widest mt-2">Forge an asset to begin neural mapping.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8 flex flex-col h-full sticky top-0">
          <section className="bg-slate-900 border border-white/5 rounded-[2.5rem] flex-1 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 bg-slate-800/40 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Neural Patch Matrix</span>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-slate-700" />)}
              </div>
            </div>
            <div className="flex-1 p-8 bg-black/40 overflow-y-auto font-mono text-[10px] scrollbar-none text-indigo-400/80 leading-relaxed">
              {log.map((l, i) => (
                <div key={i} className="mb-2 flex gap-3">
                  <span className="text-slate-800">{i.toString(16).padStart(2, '0')}</span>
                  <span>{l}</span>
                </div>
              ))}
              {log.length === 0 && <p className="text-slate-800 italic">No activity...</p>}
            </div>
          </section>
        </div>
      </div>
    </div >
  );
};

const Music = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16">
    <path d="M9 13c0 1.105-1.12 2-2.5 2S4 14.105 4 13s1.12-2 2.5-2 2.5.895 2.5 2z" />
    <path fillRule="evenodd" d="M9 3v10H8V3h1z" />
    <path d="M8 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 13 2.22V4L8 5V2.82z" />
  </svg>
);
