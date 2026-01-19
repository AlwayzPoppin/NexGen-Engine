
import React, { useState, useRef } from 'react';
import { CinematicSequence, AudioAssetForge, DialogueLine, ConductorCharacter, ConductorScene, AudioClip } from '../../types';
import { WaveformDisplay } from './WaveformDisplay';
import { createImpulseResponse, pcmToWav } from '../../services/audioUtils';

interface MasterStageProps {
  sequence: CinematicSequence;
  dialogueAssets: DialogueLine[];
  forgeAssets: AudioAssetForge[];
  characters: ConductorCharacter[];
  scenes: ConductorScene[];
  onUpdate: (updates: Partial<CinematicSequence>) => void;
}

export const MasterStage: React.FC<MasterStageProps> = ({
  sequence,
  dialogueAssets,
  forgeAssets,
  characters,
  scenes,
  onUpdate
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [zoom] = useState(20);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const playRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  const totalDuration = Math.max(30, ...sequence.tracks.flatMap(t => t.clips.map(c => c.startTime + c.duration)));

  const handleMixdown = async () => {
    setIsExporting(true);
    setExportProgress(10);

    const sampleRate = 24000;
    const totalFrames = Math.max(1, Math.floor(sampleRate * totalDuration));
    const offlineCtx = new OfflineAudioContext(2, totalFrames, sampleRate);

    setExportProgress(30);

    // Global FX
    const currentScene = scenes.find(s => s.id === sequence.activeSceneId);
    const mainMix = offlineCtx.createGain();

    if (currentScene) {
      const reverb = offlineCtx.createConvolver();
      reverb.buffer = createImpulseResponse(offlineCtx, currentScene.reverbSize * 4, currentScene.reverbDecay);
      const wet = offlineCtx.createGain();
      wet.gain.value = currentScene.wetMix;
      const dry = offlineCtx.createGain();
      dry.gain.value = 1 - currentScene.wetMix;

      mainMix.connect(dry); dry.connect(offlineCtx.destination);
      mainMix.connect(reverb); reverb.connect(wet); wet.connect(offlineCtx.destination);
    } else {
      mainMix.connect(offlineCtx.destination);
    }

    setExportProgress(50);

    for (const track of sequence.tracks) {
      if (track.isMuted) continue;
      const trackGain = offlineCtx.createGain();
      trackGain.gain.value = track.volume;
      const trackPan = offlineCtx.createStereoPanner();
      trackPan.pan.value = track.pan || 0;

      trackGain.connect(trackPan);
      trackPan.connect(mainMix);

      for (const clip of track.clips) {
        let pcm: Uint8Array | undefined;
        if (clip.type === 'Dialogue') {
          const line = dialogueAssets.find(a => a.id === clip.assetId);
          pcm = line?.takes[line.activeTakeIndex]?.pcmData;
        } else {
          const asset = forgeAssets.find(a => a.id === clip.assetId);
          pcm = asset?.pcmData;
        }
        if (!pcm) continue;

        try {
          const buffer = await offlineCtx.decodeAudioData(pcm.buffer.slice(0));
          const source = offlineCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(trackGain);
          source.start(clip.startTime);
        } catch (e) {
          console.error("Decode error in mixdown:", e);
        }
      }
    }

    setExportProgress(80);
    const renderedBuffer = await offlineCtx.startRendering();

    // Mix to Int16 PCM
    const ch1 = renderedBuffer.getChannelData(0);
    const ch2 = renderedBuffer.getChannelData(1);
    const pcmData = new Int16Array(ch1.length * 2);
    for (let i = 0; i < ch1.length; i++) {
      pcmData[i * 2] = Math.max(-1, Math.min(1, ch1[i])) * 32767;
      pcmData[i * 2 + 1] = Math.max(-1, Math.min(1, ch2[i])) * 32767;
    }

    const blob = pcmToWav(new Uint8Array(pcmData.buffer), sampleRate);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sequence.name}_mixdown.wav`;
    link.click();

    setExportProgress(100);
    setTimeout(() => {
      setIsExporting(false);
      setExportProgress(0);
    }, 1000);
  };

  const stopAll = () => {
    activeSourcesRef.current.forEach(s => { try { s.stop(); } catch (e) { } });
    activeSourcesRef.current = [];
    if (playRef.current) cancelAnimationFrame(playRef.current);
    setIsPlaying(false);
  };

  const playSequence = async (startAt: number = 0) => {
    stopAll();
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const ctx = audioCtxRef.current!;
    if (ctx.state === 'suspended') await ctx.resume();

    const currentScene = scenes.find(s => s.id === sequence.activeSceneId);
    const mainMix = ctx.createGain();

    if (currentScene) {
      const reverb = ctx.createConvolver();
      reverb.buffer = createImpulseResponse(ctx, currentScene.reverbSize * 4, currentScene.reverbDecay);
      const wet = ctx.createGain(); wet.gain.value = currentScene.wetMix;
      const dry = ctx.createGain(); dry.gain.value = 1 - currentScene.wetMix;
      mainMix.connect(dry); dry.connect(ctx.destination);
      mainMix.connect(reverb); reverb.connect(wet); wet.connect(ctx.destination);
    } else { mainMix.connect(ctx.destination); }

    const playStart = ctx.currentTime;
    startTimeRef.current = playStart - startAt;

    sequence.tracks.forEach(track => {
      if (track.isMuted) return;
      const trackGain = ctx.createGain();
      trackGain.gain.value = track.volume;
      const trackPan = ctx.createStereoPanner();
      trackPan.pan.value = track.pan || 0;
      trackGain.connect(trackPan);
      trackPan.connect(mainMix);

      track.clips.forEach(async clip => {
        let pcm: Uint8Array | undefined;
        if (clip.type === 'Dialogue') {
          const line = dialogueAssets.find(a => a.id === clip.assetId);
          pcm = line?.takes[line.activeTakeIndex]?.pcmData;
        } else {
          const asset = forgeAssets.find(a => a.id === clip.assetId);
          pcm = asset?.pcmData;
        }
        if (!pcm) return;
        try {
          const buffer = await ctx.decodeAudioData(pcm.buffer.slice(0));
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(trackGain);
          const absoluteStart = startTimeRef.current + clip.startTime;
          if (absoluteStart >= ctx.currentTime) {
            source.start(absoluteStart);
          } else if (absoluteStart + clip.duration > ctx.currentTime) {
            const offset = ctx.currentTime - absoluteStart;
            source.start(ctx.currentTime, offset);
          }
          activeSourcesRef.current.push(source);
        } catch (e) {
          console.error("Playback decode error:", e);
        }
      });
    });

    setIsPlaying(true);
    const updateProgress = () => {
      const elapsed = ctx.currentTime - startTimeRef.current;
      setCurrentTime(elapsed);
      if (elapsed < totalDuration) {
        playRef.current = requestAnimationFrame(updateProgress);
      } else { stopAll(); }
    };
    playRef.current = requestAnimationFrame(updateProgress);
  };

  const addClipToTrack = (trackId: string, asset: DialogueLine | AudioAssetForge, type: 'Dialogue' | 'SFX') => {
    let pcm: Uint8Array | undefined;
    if (type === 'Dialogue') {
      const line = asset as DialogueLine;
      pcm = line.takes[line.activeTakeIndex]?.pcmData;
    } else {
      pcm = (asset as AudioAssetForge).pcmData;
    }
    const duration = pcm ? pcm.length / (2 * 24000) : 2;
    const newClip: AudioClip = {
      id: `clip-${Date.now()}`,
      assetId: asset.id,
      startTime: currentTime,
      duration,
      type,
      name: (asset as any).text || (asset as any).name || 'Unknown'
    };
    const updatedTracks = sequence.tracks.map(t => t.id === trackId ? { ...t, clips: [...t.clips, newClip] } : t);
    onUpdate({ tracks: updatedTracks });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/40 text-slate-300 relative overflow-hidden">
      {isExporting && (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="w-80 space-y-6">
            <h3 className="text-xl font-black text-white text-center uppercase tracking-widest text-shadow-cyan">Neural Mixdown Active</h3>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_15px_#22d3ee]" style={{ width: `${exportProgress}%` }} />
            </div>
            <p className="text-[10px] font-black text-cyan-400 text-center uppercase tracking-[0.4em] animate-pulse">Rendering Signal Layers... {exportProgress}%</p>
          </div>
        </div>
      )}

      <header className="h-20 border-b border-white/5 flex items-center px-10 bg-slate-900/60 backdrop-blur-2xl justify-between glass-panel">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 scale-hover">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M6 1v3H1V1h5zM1 0a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1H1z" /></svg>
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-white glow-text-cyan">CONDUCTOR Master Stage</h2>
            <p className="text-[9px] font-black uppercase tracking-widest text-cyan-500/60">Sonic Context Engine v14.0</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-black/40 p-1.5 rounded-2xl border border-white/10 glass-panel">
          <button onClick={() => isPlaying ? stopAll() : playSequence(currentTime)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all scale-hover ${isPlaying ? 'bg-pink-500 animate-pulse shadow-[0_0_20px_#ec4899]' : 'bg-cyan-600 shadow-xl shadow-cyan-500/20'}`}>
            {isPlaying ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" /></svg>}
          </button>
          <div className="px-6 font-mono text-cyan-400 font-black text-lg">
            {currentTime.toFixed(2)}s <span className="text-slate-700 mx-2">/</span> {totalDuration.toFixed(2)}s
          </div>
        </div>

        <div className="flex gap-4">
          <select className="bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-slate-300 outline-none focus:border-cyan-500/50 transition-all" value={sequence.activeSceneId} onChange={(e) => onUpdate({ activeSceneId: e.target.value })}>
            <option value="">Dry Environment</option>
            {scenes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={handleMixdown} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-[10px] font-black uppercase text-white shadow-lg shadow-cyan-500/20 transition-all scale-hover">Export Master</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-xl p-6 flex flex-col gap-8 overflow-y-auto scrollbar-none glass-panel">
          <section>
            <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
              Dialogue Library
            </h3>
            <div className="space-y-2">
              {dialogueAssets.filter(a => a.takes.length > 0).map(asset => (
                <div key={asset.id} draggable onDragStart={(e) => e.dataTransfer.setData('asset', JSON.stringify({ id: asset.id, type: 'Dialogue' }))} className="p-3 bg-slate-900/40 border border-white/5 rounded-xl cursor-grab hover:border-cyan-500/50 transition-all scale-hover glass-panel">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={characters.find(c => c.id === asset.characterId)?.avatarUrl} className="w-5 h-5 rounded-full ring-1 ring-white/10" alt="avatar" />
                    <span className="text-[9px] font-black text-white truncate uppercase tracking-tighter">{characters.find(c => c.id === asset.characterId)?.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 italic">"{asset.text}"</p>
                </div>
              ))}
              {dialogueAssets.filter(a => a.takes.length > 0).length === 0 && (
                <div className="p-8 border border-dashed border-white/5 rounded-2xl text-center">
                  <p className="text-[9px] font-black uppercase text-slate-600">No Dialogue Recorded</p>
                </div>
              )}
            </div>
          </section>
          <section>
            <h3 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
              Forge Assets
            </h3>
            <div className="space-y-2">
              {forgeAssets.map(asset => (
                <div key={asset.id} draggable onDragStart={(e) => e.dataTransfer.setData('asset', JSON.stringify({ id: asset.id, type: 'SFX' }))} className="p-3 bg-slate-900/40 border border-white/5 rounded-xl cursor-grab hover:border-purple-500/50 transition-all scale-hover glass-panel">
                  <span className="text-[9px] font-black text-purple-400 block mb-1 uppercase tracking-widest">{asset.subType}</span>
                  <p className="text-[10px] text-white font-bold truncate">{asset.name}</p>
                </div>
              ))}
              {forgeAssets.length === 0 && (
                <div className="p-8 border border-dashed border-white/5 rounded-2xl text-center">
                  <p className="text-[9px] font-black uppercase text-slate-600">No Sound FX Forged</p>
                </div>
              )}
            </div>
          </section>
        </aside>

        <section className="flex-1 flex flex-col overflow-hidden bg-slate-950/20 relative">
          <div className="h-8 border-b border-white/5 bg-slate-900/40 flex relative" style={{ width: `${totalDuration * zoom}px` }}>
            {Array.from({ length: Math.ceil(totalDuration) }).map((_, i) => (
              <div key={i} className="absolute h-full border-l border-white/10 text-[8px] text-slate-600 pl-1 pt-1 font-mono" style={{ left: `${i * zoom}px` }}>{i}s</div>
            ))}
          </div>
          <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-800">
            <div className="min-w-full pb-20" style={{ width: `${totalDuration * zoom}px` }}>
              {sequence.tracks.map(track => (
                <div key={track.id} className="h-32 border-b border-white/5 group relative flex items-center hover:bg-white/[0.02] transition-colors" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
                  try {
                    const data = JSON.parse(e.dataTransfer.getData('asset'));
                    const asset = data.type === 'Dialogue' ? dialogueAssets.find(a => a.id === data.id) : forgeAssets.find(a => a.id === data.id);
                    if (asset) addClipToTrack(track.id, asset, data.type);
                  } catch (err) { }
                }}>
                  <div className="sticky left-0 w-64 h-full bg-slate-900/95 border-r border-white/5 z-20 p-6 flex flex-col justify-between shadow-2xl glass-panel">
                    <div>
                      <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {track.name}
                          <span className={`text-[8px] px-2 py-0.5 rounded-full border ${track.type === 'Dialogue' ? 'border-cyan-500/30 text-cyan-400' : 'border-purple-500/30 text-purple-400'}`}>{track.type}</span>
                        </div>
                        <button className="text-slate-600 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" /></svg></button>
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[8px] font-black uppercase text-slate-500 tracking-tighter">
                          <span>Track Pan</span>
                          <span className="text-cyan-400">{track.pan > 0 ? `R${Math.round(track.pan * 100)}` : track.pan < 0 ? `L${Math.abs(Math.round(track.pan * 100))}` : 'C'}</span>
                        </div>
                        <input type="range" min="-1" max="1" step="0.1" value={track.pan || 0} onChange={(e) => {
                          const newTracks = sequence.tracks.map(t => t.id === track.id ? { ...t, pan: parseFloat(e.target.value) } : t);
                          onUpdate({ tracks: newTracks });
                        }} className="w-full h-1 bg-slate-800 accent-cyan-500 rounded appearance-none cursor-pointer" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[8px] font-black uppercase text-slate-500 tracking-tighter">
                          <span>Volume</span>
                          <span className="text-pink-400">{Math.round(track.volume * 100)}%</span>
                        </div>
                        <input type="range" min="0" max="1" step="0.05" value={track.volume} onChange={(e) => {
                          const newTracks = sequence.tracks.map(t => t.id === track.id ? { ...t, volume: parseFloat(e.target.value) } : t);
                          onUpdate({ tracks: newTracks });
                        }} className="w-full h-1 bg-slate-800 accent-pink-500 rounded appearance-none cursor-pointer" />
                      </div>
                    </div>
                  </div>
                  {track.clips.map(clip => {
                    const asset = clip.type === 'Dialogue' ? dialogueAssets.find(a => a.id === clip.assetId) : forgeAssets.find(a => a.id === clip.assetId);
                    let pcm: Uint8Array | undefined;
                    if (clip.type === 'Dialogue') pcm = (asset as DialogueLine)?.takes[(asset as DialogueLine).activeTakeIndex]?.pcmData;
                    else pcm = (asset as AudioAssetForge)?.pcmData;
                    return (
                      <div key={clip.id} className="absolute h-24 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl overflow-hidden cursor-move group/clip backdrop-blur-md shadow-xl" style={{ left: `${(clip.startTime * zoom) + 256}px`, width: `${clip.duration * zoom}px` }}>
                        <div className="p-3 h-full">
                          <span className="text-[9px] font-black text-cyan-400 uppercase truncate block mb-2 tracking-tighter">{clip.name}</span>
                          {pcm && <WaveformDisplay pcmData={pcm} color={clip.type === 'Dialogue' ? "#22d3ee" : "#a855f7"} height={40} />}
                        </div>
                        <button onClick={() => onUpdate({ tracks: sequence.tracks.map(t => ({ ...t, clips: t.clips.filter(c => c.id !== clip.id) })) })} className="absolute top-2 right-2 p-1 bg-black/60 rounded-lg text-white opacity-0 group-hover/clip:opacity-100 transition-opacity hover:bg-red-500"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" /></svg></button>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className="absolute top-0 bottom-0 w-0.5 bg-cyan-500 z-30 pointer-events-none shadow-[0_0_15px_#22d3ee]" style={{ left: `${(currentTime * zoom) + 256}px` }}><div className="w-3 h-3 bg-cyan-500 rounded-full -ml-[5px] -mt-1 shadow-lg shadow-cyan-500/50"></div></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
