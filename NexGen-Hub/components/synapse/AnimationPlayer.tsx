
import React, { useState, useEffect, useRef } from 'react';
import { GridConfig } from '../../types';
import { Icons } from './SynapseIcons';

interface AnimationPlayerProps {
  imageUrl: string;
  grid: GridConfig;
  speed?: number; // default frames per second
}

const AnimationPlayer: React.FC<AnimationPlayerProps> = ({ imageUrl, grid, speed = 10 }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [fps, setFps] = useState(speed);
  const [zoom, setZoom] = useState(2);
  const [isMaximized, setIsMaximized] = useState(false);
  const [bgType, setBgType] = useState<'dark' | 'light' | 'checker'>('checker');
  const [onionSkin, setOnionSkin] = useState(false);

  const totalFrames = grid.rows * grid.cols;
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying && totalFrames > 0) {
      timerRef.current = window.setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % totalFrames);
      }, 1000 / fps);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, totalFrames, fps]);

  // Handle manual steps
  const nextFrame = () => {
    setIsPlaying(false);
    setCurrentFrame((prev) => (prev + 1) % totalFrames);
  };

  const prevFrame = () => {
    setIsPlaying(false);
    setCurrentFrame((prev) => (prev - 1 + totalFrames) % totalFrames);
  };

  const getPos = (frame: number) => {
    const r = Math.floor(frame / grid.cols);
    const c = frame % grid.cols;
    const px = grid.cols > 1 ? (c / (grid.cols - 1)) * 100 : 0;
    const py = grid.rows > 1 ? (r / (grid.rows - 1)) * 100 : 0;
    return { px, py };
  };

  const currentPos = getPos(currentFrame);
  const prevFrameIdx = (currentFrame - 1 + totalFrames) % totalFrames;
  const prevPos = getPos(prevFrameIdx);

  const bgStyles = {
    dark: 'bg-slate-950',
    light: 'bg-slate-200',
    checker: 'bg-[url(https://www.transparenttextures.com/patterns/carbon-fibre.png)] bg-slate-900'
  };

  const PlayerDisplay = (
    <div className={`relative flex items-center justify-center overflow-hidden transition-all duration-500 border border-white/5 shadow-inner group/display ${isMaximized ? 'w-full h-full rounded-none' : 'w-full aspect-square rounded-[3rem]'} ${bgStyles[bgType]}`}>
      {/* Onion Skin Layer */}
      {onionSkin && (
        <div
          className="absolute inset-0 opacity-10 pointer-events-none transition-transform duration-200"
          style={{
            width: '100%',
            height: '100%',
            transform: `scale(${zoom})`,
            imageRendering: 'pixelated',
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: `${grid.cols * 100}% ${grid.rows * 100}%`,
            backgroundPosition: `${prevPos.px}% ${prevPos.py}%`,
            backgroundRepeat: 'no-repeat'
          }}
        />
      )}

      {/* Current Frame Layer */}
      <div
        className="transition-transform duration-200 ease-out z-10"
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${zoom})`,
          imageRendering: 'pixelated',
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: `${grid.cols * 100}% ${grid.rows * 100}%`,
          backgroundPosition: `${currentPos.px}% ${currentPos.py}%`,
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Floating Overlays */}
      <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover/display:opacity-100 transition-all z-20 translate-y-2 group-hover/display:translate-y-0">
        <button
          onClick={() => setOnionSkin(!onionSkin)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl border border-white/5 backdrop-blur-xl transition-all ${onionSkin ? 'bg-indigo-600 text-white' : 'bg-black/60 text-slate-400'}`}
          title="Toggle Onion Skinning"
        >
          <Icons.Ghost />
        </button>
        <div className="flex bg-black/60 backdrop-blur-xl rounded-xl border border-white/5 overflow-hidden">
          {(['dark', 'light', 'checker'] as const).map(t => (
            <button
              key={t}
              onClick={() => setBgType(t)}
              className={`w-10 h-10 flex items-center justify-center transition-colors ${bgType === t ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title={`Switch to ${t} background`}
            >
              <div className={`w-3 h-3 rounded-full ${t === 'dark' ? 'bg-slate-950' : t === 'light' ? 'bg-white' : 'bg-slate-500 border border-white/20'}`} />
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsMaximized(!isMaximized)}
          className="w-10 h-10 bg-black/60 backdrop-blur-xl rounded-xl text-slate-400 hover:text-white transition-all flex items-center justify-center border border-white/5 shadow-lg"
        >
          {isMaximized ? <Icons.Minimize /> : <Icons.Maximize />}
        </button>
      </div>

      <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full text-[10px] mono font-bold text-indigo-400 border border-white/10 shadow-lg z-20">
        POS: {currentFrame + 1} / {totalFrames}
      </div>
    </div>
  );

  if (isMaximized) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 md:p-16 animate-in zoom-in-95 duration-500">
        <div className="w-full max-w-6xl aspect-square flex items-center justify-center relative glass rounded-[4rem] overflow-hidden shadow-2xl">
          {PlayerDisplay}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-10 glass px-12 py-8 rounded-[3rem] shadow-2xl max-w-5xl w-full">
          <div className="flex items-center gap-4">
            <button onClick={prevFrame} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 transition-all active:scale-95">
              <Icons.ChevronLeft />
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 transition-all text-white shadow-2xl shadow-indigo-600/30 flex items-center justify-center active:scale-90">
              {isPlaying ? <Icons.Pause /> : <Icons.Play />}
            </button>
            <button onClick={nextFrame} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 transition-all active:scale-95">
              <Icons.ChevronRight />
            </button>
          </div>

          <div className="h-12 w-px bg-white/5 mx-4" />

          <div className="flex flex-col gap-4 flex-1 min-w-[200px]">
            <div className="flex justify-between text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">
              <span>Optic Zoom</span>
              <span className="text-indigo-400 mono">{zoom.toFixed(1)}x</span>
            </div>
            <input type="range" min="0.5" max="12" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
          </div>

          <div className="flex flex-col gap-4 flex-1 min-w-[200px]">
            <div className="flex justify-between text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">
              <span>Time Frame</span>
              <span className="text-purple-400 mono">{fps} FPS</span>
            </div>
            <input type="range" min="1" max="60" value={fps} onChange={(e) => setFps(parseInt(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500" />
          </div>

          <button onClick={() => setIsMaximized(false)} className="px-10 py-4 glass glass-hover text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
            CLOSE VIEW
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 glass p-8 rounded-[3rem] transition-all hover:border-indigo-500/20 shadow-2xl group/player">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
          <Icons.Play /> Motion Diagnostic
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => setOnionSkin(!onionSkin)}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest ${onionSkin ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/40 border-white/5 text-slate-600 hover:text-white'}`}
          >
            GHOST
          </button>
          <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-400 mono uppercase">
            {totalFrames} POSES
          </div>
        </div>
      </div>

      {PlayerDisplay}

      <div className="flex flex-col gap-8 w-full px-2">
        {/* Playback Controls */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl border border-white/5 shadow-inner">
            <button onClick={prevFrame} className="p-2.5 rounded-xl text-slate-600 hover:text-white hover:bg-white/5 transition-all"><Icons.ChevronLeft /></button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all text-white shadow-xl shadow-indigo-600/20 flex items-center justify-center active:scale-95"
            >
              {isPlaying ? <Icons.Pause /> : <Icons.Play />}
            </button>
            <button onClick={nextFrame} className="p-2.5 rounded-xl text-slate-600 hover:text-white hover:bg-white/5 transition-all"><Icons.ChevronRight /></button>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div className="flex justify-between items-center text-[10px] uppercase font-black text-slate-500 tracking-widest">
              <span>Velocity</span>
              <span className="text-indigo-400 mono">{fps} FPS</span>
            </div>
            <input type="range" min="1" max="60" value={fps} onChange={(e) => setFps(parseInt(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 flex items-center justify-center text-slate-700 bg-black/40 rounded-[1.5rem] border border-white/5 group-hover/player:text-indigo-500/50 transition-colors">
            <Icons.Scan />
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex justify-between items-center text-[10px] uppercase font-black text-slate-500 tracking-widest">
              <span>Magnification</span>
              <span className="text-slate-400 mono">{zoom.toFixed(1)}x</span>
            </div>
            <input type="range" min="1" max="8" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationPlayer;
