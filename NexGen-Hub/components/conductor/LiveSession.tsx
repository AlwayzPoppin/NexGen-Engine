
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Character, Scene } from '../../types';
import { encode, decodeAudioData, decode, createImpulseResponse } from '../../services/audioUtils';
import { Visualizer } from './Visualizer';
import { FaceVisualizer } from './FaceVisualizer';

interface LiveSessionProps {
  characters: Character[];
  initialCharacterId: string;
  scenes: Scene[];
  activeSceneId?: string;
  onClose: () => void;
  onSceneChange: (id: string) => void;
}

export const LiveSession: React.FC<LiveSessionProps> = ({
  characters,
  initialCharacterId,
  scenes,
  activeSceneId,
  onClose,
  onSceneChange
}) => {
  const [activeCharacterId, setActiveCharacterId] = useState(initialCharacterId);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Standby');
  const [transcript, setTranscript] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [pulseScale, setPulseScale] = useState(1);
  const [isAiTalking, setIsAiTalking] = useState(false);
  const [aiTalkStartTime, setAiTalkStartTime] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  // FX Nodes
  const lowPassNodeRef = useRef<BiquadFilterNode | null>(null);
  const convolverNodeRef = useRef<ConvolverNode | null>(null);
  const dryGainNodeRef = useRef<GainNode | null>(null);
  const wetGainNodeRef = useRef<GainNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);

  const character = characters.find(c => c.id === activeCharacterId) || characters[0];
  const scene = scenes.find(s => s.id === activeSceneId);

  if (!character) return null;

  const cleanup = useCallback(() => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (e) { }
      sessionRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    for (const s of sourcesRef.current.values()) {
      try { s.stop(); } catch (e) { }
    }
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsActive(false);
    setAnalyser(null);
    setIsAiTalking(false);
  }, []);

  useEffect(() => {
    if (audioCtxRef.current && scene) {
      if (lowPassNodeRef.current) lowPassNodeRef.current.frequency.setValueAtTime(scene.lowPassFreq, audioCtxRef.current.currentTime);
      if (dryGainNodeRef.current) dryGainNodeRef.current.gain.setValueAtTime(1 - scene.wetMix, audioCtxRef.current.currentTime);
      if (wetGainNodeRef.current) wetGainNodeRef.current.gain.setValueAtTime(scene.wetMix, audioCtxRef.current.currentTime);
      if (convolverNodeRef.current) convolverNodeRef.current.buffer = createImpulseResponse(audioCtxRef.current, scene.reverbSize * 4, scene.reverbDecay);
    }
  }, [scene, isActive]);

  const startSession = useCallback(async () => {
    try {
      cleanup();
      setStatus(`Calibrating: ${character.name}...`);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
      inputAudioCtxRef.current = new AudioContext({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const ctx = audioCtxRef.current;
      analyserNodeRef.current = ctx.createAnalyser();
      setAnalyser(analyserNodeRef.current);

      lowPassNodeRef.current = ctx.createBiquadFilter();
      lowPassNodeRef.current.type = 'lowpass';

      convolverNodeRef.current = ctx.createConvolver();
      dryGainNodeRef.current = ctx.createGain();
      wetGainNodeRef.current = ctx.createGain();

      lowPassNodeRef.current.connect(dryGainNodeRef.current);
      lowPassNodeRef.current.connect(convolverNodeRef.current);
      convolverNodeRef.current.connect(wetGainNodeRef.current);
      dryGainNodeRef.current.connect(analyserNodeRef.current);
      wetGainNodeRef.current.connect(analyserNodeRef.current);
      analyserNodeRef.current.connect(ctx.destination);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setStatus('Neural Link Synchronized');
            const source = inputAudioCtxRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioCtxRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioCtxRef.current!.destination);
          },
          onmessage: async (m) => {
            const audio = m.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audio && audioCtxRef.current && lowPassNodeRef.current) {
              setPulseScale(1.4);
              setTimeout(() => setPulseScale(1), 200);

              if (!isAiTalking) {
                setIsAiTalking(true);
                setAiTalkStartTime(Date.now());
              }

              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtxRef.current.currentTime);
              const buf = await decodeAudioData(decode(audio), audioCtxRef.current, 24000, 1);
              const s = audioCtxRef.current.createBufferSource();
              s.buffer = buf;
              s.connect(lowPassNodeRef.current);
              s.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buf.duration;
              sourcesRef.current.add(s);
              s.onended = () => {
                sourcesRef.current.delete(s);
                if (sourcesRef.current.size === 0) setIsAiTalking(false);
              };
            }
            if (m.serverContent?.outputTranscription) setTranscript(p => [...p, { role: 'ai', text: m.serverContent!.outputTranscription!.text }]);
            if (m.serverContent?.inputTranscription) setTranscript(p => [...p, { role: 'user', text: m.serverContent!.inputTranscription!.text }]);
          },
          onerror: (e) => setStatus('Neural Link Fault'),
          onclose: () => setIsActive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: character.voice }
            }
          },
          systemInstruction: `PERFORMANCE: You are auditioning for the role of ${character.name}. PHYSICALITY: ${character.description}. STYLE: ${character.style}. EMOTION: ${character.emotion}. ENVIRONMENT: You are standing in a ${scene?.name || 'Standard Studio'}. Respond in-character.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) { setStatus('Direct Access Restricted'); }
  }, [character, cleanup, scene, isAiTalking]);

  useEffect(() => {
    if (isActive) startSession();
  }, [activeCharacterId]);

  useEffect(() => cleanup, [cleanup]);

  return (
    <div className="fixed inset-0 bg-slate-950/98 flex items-center justify-center z-[100] p-4 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="bg-slate-900 border border-white/5 w-full max-w-6xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col h-[92vh] border-t-white/10">

        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div
                className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl transition-all duration-500 group-hover:bg-indigo-500/40"
                style={{ transform: `scale(${isActive ? pulseScale : 1})` }}
              ></div>
              <img src={character.avatarUrl} className="w-20 h-20 rounded-2xl border-2 border-indigo-500 shadow-2xl object-cover relative z-10" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white leading-none tracking-tighter uppercase">{character.name}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {isActive ? 'Neural Feed: Synchronized' : 'Link Standby'}
                </span>
                <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">{scene?.name || 'Dry Studio'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-black/40 border border-white/5 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Status</p>
              <p className="text-xs font-bold text-slate-300">{status}</p>
            </div>
            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:bg-white/5 rounded-2xl border border-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" /></svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 flex-1 overflow-hidden">
          <aside className="col-span-1 border-r border-white/5 bg-black/20 p-6 space-y-8 overflow-y-auto scrollbar-none">
            <div className="flex flex-col items-center justify-center p-6 bg-slate-800/40 rounded-[2rem] border border-white/5 shadow-inner">
              <FaceVisualizer isPlaying={isAiTalking} startTime={aiTalkStartTime} scale={1.5} />
              <p className="text-[8px] font-black uppercase tracking-widest text-indigo-400 mt-4">Phonetic Mesh Feed</p>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Casting Pool</h3>
              <div className="space-y-3">
                {characters.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCharacterId(c.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${activeCharacterId === c.id ? 'bg-indigo-600 border-indigo-500 shadow-lg' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}
                  >
                    <img src={c.avatarUrl} className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-xs font-black uppercase tracking-tighter text-white truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="col-span-3 flex flex-col overflow-hidden relative bg-slate-950">
            <div className="flex-1 p-10 overflow-y-auto space-y-8 scrollbar-thin flex flex-col-reverse">
              <div className="space-y-8">
                {transcript.map((t, i) => (
                  <div key={i} className={`flex items-start gap-5 ${t.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-4 duration-500`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shadow-xl ${t.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-white/5 text-indigo-400'}`}>
                      {t.role === 'user' ? 'DIR' : 'VO'}
                    </div>
                    <div className={`max-w-[70%] p-5 rounded-[1.5rem] shadow-2xl leading-relaxed text-[15px] font-medium ${t.role === 'user' ? 'bg-indigo-500/10 text-white border border-indigo-500/20' : 'bg-white/5 text-slate-200 border border-white/5'}`}>
                      {t.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none opacity-20">
              <Visualizer analyser={analyser} color="#6366f1" height={160} />
            </div>

            <footer className="p-10 bg-slate-900/80 border-t border-white/5 flex flex-col items-center gap-6 backdrop-blur-xl">
              {!isActive ? (
                <button
                  onClick={startSession}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 px-16 rounded-[2rem] shadow-2xl uppercase tracking-[0.3em] text-[11px] transition-all hover:scale-105"
                >
                  Initiate Conductor Link
                </button>
              ) : (
                <div className="flex gap-6">
                  <button
                    onClick={cleanup}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-4 px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all"
                  >
                    Disconnect
                  </button>
                  <div className="px-8 py-4 bg-black/40 rounded-2xl border border-white/5 flex items-center gap-5">
                    <div className="flex gap-1.5 h-4 items-end">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="w-1.5 bg-indigo-500 animate-pulse rounded-full" style={{ height: `${30 + Math.random() * 70}%`, animationDelay: `${i * 100}ms` }}></div>
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Feed Active</span>
                  </div>
                </div>
              )}
            </footer>
          </section>
        </div>
      </div>
    </div>
  );
};
