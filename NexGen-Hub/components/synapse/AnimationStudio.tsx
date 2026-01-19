
import React, { useState, useEffect, useRef } from 'react';
import { SpriteSheet, GridConfig, AnimationSet } from '../../types';
import { Icons } from './SynapseIcons';
import { detectGridLayout, generateMotionVideo, refineSpriteSheet, normalizeSpriteSheet, interpolateFrames, generatePoseVariation } from '../../services/geminiService';
import { processTransparency, extractPalette, remapColor } from '../../utils/imageUtils';

interface AnimationStudioProps {
  sheet: SpriteSheet;
  onUpdateSheet: (updated: Partial<SpriteSheet>) => void;
}

const AnimationStudio: React.FC<AnimationStudioProps> = ({ sheet, onUpdateSheet }) => {
  const [fps, setFps] = useState(10);
  const [zoom, setZoom] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [bgType, setBgType] = useState<'dark' | 'light' | 'checker'>('dark');
  const [isDetecting, setIsDetecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'slicer' | 'palette' | 'refine' | 'motion'>('preview');
  const [slicedFrames, setSlicedFrames] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoStatus, setVideoStatus] = useState("");
  const [isStudioFullscreen, setIsStudioFullscreen] = useState(false);

  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [isAddingSet, setIsAddingSet] = useState(false);
  const [newSetName, setNewSetName] = useState("");

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const [correctionPrompt, setCorrectionPrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refinementScope, setRefinementScope] = useState<'global' | 'targeted'>('global');
  const [refinementTargetIndex, setRefinementTargetIndex] = useState<number | null>(null);

  const [interpolatingIndex, setInterpolatingIndex] = useState<number | null>(null);
  const [varyingIndex, setVaryingIndex] = useState<number | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [selectedPaletteColor, setSelectedPaletteColor] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const importJsonRef = useRef<HTMLInputElement>(null);
  const totalFrames = (sheet.grid.rows || 1) * (sheet.grid.cols || 1);
  const animationSets = sheet.animationSets || [];
  const currentSet = animationSets.find(s => s.id === activeSetId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        setIsPlaying(false);
        setCurrentFrame(prev => (prev + 1) % totalFrames);
      } else if (e.code === 'ArrowLeft') {
        setIsPlaying(false);
        setCurrentFrame(prev => (prev - 1 + totalFrames) % totalFrames);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalFrames]);

  useEffect(() => {
    if (isPlaying && activeTab === 'preview') {
      const start = currentSet ? currentSet.startFrame : 0;
      const end = currentSet ? currentSet.endFrame : totalFrames - 1;
      timerRef.current = window.setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev < start || prev >= end) return start;
          return prev + 1;
        });
      }, 1000 / fps);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, totalFrames, fps, activeTab, activeSetId, currentSet]);

  const sliceSheet = async () => {
    const img = new Image();
    img.src = sheet.url;
    await new Promise((resolve) => (img.onload = resolve));

    const frameWidth = img.width / sheet.grid.cols;
    const frameHeight = img.height / sheet.grid.rows;
    const frames: string[] = [];
    const canvas = document.createElement('canvas');
    canvas.width = frameWidth;
    canvas.height = frameHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    for (let r = 0; r < sheet.grid.rows; r++) {
      for (let c = 0; c < sheet.grid.cols; c++) {
        ctx.clearRect(0, 0, frameWidth, frameHeight);
        ctx.drawImage(img, c * frameWidth, r * frameHeight, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
        frames.push(canvas.toDataURL('image/png'));
      }
    }
    setSlicedFrames(frames);
  };

  useEffect(() => {
    sliceSheet();
  }, [sheet.grid, sheet.url]);

  useEffect(() => {
    const loadPalette = async () => {
      const colors = await extractPalette(sheet.url);
      setPalette(colors);
    };
    loadPalette();
  }, [sheet.url]);

  const rebuildSheet = async (newFrames: string[]) => {
    if (newFrames.length === 0) return;
    const newCols = sheet.grid.cols;
    const newRows = Math.ceil(newFrames.length / newCols);
    let maxW = 0, maxH = 0;
    const imgs = await Promise.all(newFrames.map(f => {
      const img = new Image();
      img.src = f;
      return new Promise<HTMLImageElement>((resolve) => {
        img.onload = () => {
          maxW = Math.max(maxW, img.width);
          maxH = Math.max(maxH, img.height);
          resolve(img);
        };
      });
    }));

    const canvas = document.createElement('canvas');
    canvas.width = maxW * newCols;
    canvas.height = maxH * newRows;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i];
      const r = Math.floor(i / newCols);
      const c = i % newCols;
      const xOff = (maxW - img.width) / 2;
      const yOff = (maxH - img.height) / 2;
      ctx.drawImage(img, c * maxW + xOff, r * maxH + yOff);
    }
    onUpdateSheet({ url: canvas.toDataURL('image/png'), grid: { rows: newRows, cols: newCols } });
  };

  const handleExportPro = () => {
    const atlas = {
      meta: {
        type: "SpriteSheetAI_Project",
        version: "2.0",
        prompt: sheet.prompt,
        style: sheet.style,
        grid: sheet.grid,
        timestamp: sheet.timestamp,
        imageData: sheet.url
      },
      animations: animationSets.map(set => ({
        id: set.id,
        name: set.name,
        start: set.startFrame,
        end: set.endFrame
      }))
    };
    const blob = new Blob([JSON.stringify(atlas, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `project-${sheet.prompt.slice(0, 20).replace(/\s+/g, '_')}.json`;
    link.click();
  };

  const handleImportPro = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const imageData = json.meta?.imageData || json.meta?.image;
        if (json.meta && imageData) {
          const importedSets: AnimationSet[] = (json.animations || []).map((anim: any) => ({
            id: anim.id || crypto.randomUUID(),
            name: anim.name,
            startFrame: anim.start ?? anim.startFrame,
            endFrame: anim.end ?? anim.endFrame
          }));
          onUpdateSheet({
            url: imageData,
            prompt: json.meta.prompt,
            style: json.meta.style,
            grid: json.meta.grid,
            animationSets: importedSets
          });
          setActiveSetId(null);
        }
      } catch (err) {
        alert("Invalid Project JSON format.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const updateSetBounds = (id: string, field: 'startFrame' | 'endFrame', value: number) => {
    onUpdateSheet({
      animationSets: animationSets.map(s => s.id === id ? { ...s, [field]: value } : s)
    });
  };

  const handleDuplicateFrame = async (index: number) => {
    const newFrames = [...slicedFrames];
    newFrames.splice(index + 1, 0, slicedFrames[index]);
    await rebuildSheet(newFrames);
  };

  const handleDeleteFrame = async (index: number) => {
    if (slicedFrames.length <= 1) return;
    const newFrames = slicedFrames.filter((_, i) => i !== index);
    await rebuildSheet(newFrames);
  };

  const handleMoveFrame = async (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === slicedFrames.length - 1) return;
    const newFrames = [...slicedFrames];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    [newFrames[index], newFrames[targetIndex]] = [newFrames[targetIndex], newFrames[index]];
    await rebuildSheet(newFrames);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDropTargetIndex(index);
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDropTargetIndex(null);
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const newFrames = [...slicedFrames];
    const [removed] = newFrames.splice(draggedIndex, 1);
    newFrames.splice(targetIndex, 0, removed);
    setDraggedIndex(null);
    await rebuildSheet(newFrames);
  };

  const handleInterpolate = async (indexA: number, indexB: number) => {
    setInterpolatingIndex(indexA);
    try {
      const newFrame = await interpolateFrames(slicedFrames[indexA], slicedFrames[indexB], sheet.style, sheet.prompt);
      const newFrames = [...slicedFrames];
      newFrames.splice(indexA + 1, 0, newFrame);
      await rebuildSheet(newFrames);
    } catch (err) { console.error(err); } finally { setInterpolatingIndex(null); }
  };

  const handleGenerateVariation = async (index: number) => {
    setVaryingIndex(index);
    try {
      const newFrame = await generatePoseVariation(slicedFrames[index], sheet.style, sheet.prompt);
      const newFrames = [...slicedFrames];
      newFrames.splice(index + 1, 0, newFrame);
      await rebuildSheet(newFrames);
    } catch (err) { console.error(err); } finally { setVaryingIndex(null); }
  };

  const handleAddSet = () => {
    if (!newSetName.trim()) return;
    const newSet: AnimationSet = {
      id: crypto.randomUUID(),
      name: newSetName,
      startFrame: 0,
      endFrame: totalFrames - 1
    };
    onUpdateSheet({ animationSets: [...animationSets, newSet] });
    setNewSetName("");
    setIsAddingSet(false);
    setActiveSetId(newSet.id);
  };

  const handleDeleteSet = (id: string) => {
    onUpdateSheet({ animationSets: animationSets.filter(s => s.id !== id) });
    if (activeSetId === id) setActiveSetId(null);
  };

  const handleRefine = async () => {
    if (!correctionPrompt.trim()) return;
    setIsRefining(true);
    try {
      if (refinementScope === 'targeted' && refinementTargetIndex !== null) {
        // Surgical Refinement: Update only one frame
        const refinedFrame = await refineSpriteSheet(slicedFrames[refinementTargetIndex], correctionPrompt);
        const newFrames = [...slicedFrames];
        newFrames[refinementTargetIndex] = refinedFrame;
        await rebuildSheet(newFrames);
      } else {
        // Global Refinement: Update entire atlas
        const refinedUrl = await refineSpriteSheet(sheet.url, correctionPrompt);
        onUpdateSheet({ url: refinedUrl });
      }
      setCorrectionPrompt("");
    } catch (err) { console.error(err); } finally { setIsRefining(false); }
  };

  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    setVideoStatus("Starting motion synthesis...");
    try {
      const url = await generateMotionVideo(sheet.prompt, sheet.url, (status) => setVideoStatus(status));
      setVideoUrl(url);
    } catch (err) { console.error(err); } finally { setIsGeneratingVideo(false); setVideoStatus(""); }
  };

  const handleDownloadFrame = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `frame-${index + 1}.png`;
    link.click();
  };

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    try {
      const detected = await detectGridLayout(sheet.url);
      onUpdateSheet({ grid: detected });
    } catch (err) { console.error(err); } finally { setIsDetecting(false); }
  };

  const handleRemoveBackground = async () => {
    setIsDetecting(true);
    try {
      const newUrl = await processTransparency(sheet.url, 15);
      onUpdateSheet({ url: newUrl });
    } catch (err) { console.error(err); } finally { setIsDetecting(false); }
  };

  const handlePrecisionCrop = async () => {
    setIsDetecting(true);
    try {
      const newUrl = await normalizeSpriteSheet(sheet.url, sheet.grid);
      onUpdateSheet({ url: newUrl });
    } catch (err) { console.error(err); } finally { setIsDetecting(false); }
  };

  const row = Math.floor(currentFrame / (sheet.grid.cols || 1));
  const col = currentFrame % (sheet.grid.cols || 1);
  const posX = sheet.grid.cols > 1 ? (col / (sheet.grid.cols - 1)) * 100 : 0;
  const posY = sheet.grid.rows > 1 ? (row / (sheet.grid.rows - 1)) * 100 : 0;

  const bgStyles = {
    dark: 'bg-slate-950',
    light: 'bg-slate-100',
    checker: 'bg-[url(https://www.transparenttextures.com/patterns/carbon-fibre.png)] bg-slate-900'
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ${isStudioFullscreen ? 'fixed inset-0 z-[150] bg-slate-950 p-12 overflow-auto' : ''}`}>
      {isDetecting && (
        <div className="fixed inset-0 bg-indigo-950/60 backdrop-blur-md z-[200] flex flex-col items-center justify-center gap-6 animate-in fade-in">
          <div className="animate-spin h-12 w-12 border-4 border-white/10 border-t-white rounded-full"></div>
          <span className="text-white font-black text-xs tracking-[0.4em] uppercase">Deep Neural Calibration...</span>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex p-1.5 bg-black/40 rounded-[2rem] w-fit border border-white/5 backdrop-blur-xl">
            {(['preview', 'slicer', 'palette', 'refine', 'motion'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === tab ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab === 'preview' && <Icons.Play />}
                {tab === 'slicer' && <Icons.Scissors />}
                {tab === 'palette' && <Icons.Palette />}
                {tab === 'refine' && <Icons.Sparkles />}
                {tab === 'motion' && <Icons.Video />}
                {tab}
              </button>
            ))}
          </div>
          <button onClick={() => setIsStudioFullscreen(!isStudioFullscreen)} className="p-4 bg-black/40 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-all glass">
            {isStudioFullscreen ? <Icons.Minimize /> : <Icons.Maximize />}
          </button>
        </div>

        <div className="flex-1">
          {activeTab === 'preview' && (
            <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
              <div className={`relative w-full aspect-square md:aspect-video rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl flex items-center justify-center ${bgStyles[bgType]} group`}>
                <div className="relative aspect-square h-[80%] max-h-full overflow-hidden transition-all duration-700">
                  <div
                    className="w-full h-full"
                    style={{
                      transformOrigin: 'center center',
                      transform: `scale(${zoom})`,
                      imageRendering: 'pixelated',
                      backgroundImage: `url(${sheet.url})`,
                      backgroundSize: `${sheet.grid.cols * 100}% ${sheet.grid.rows * 100}%`,
                      backgroundPosition: `${posX}% ${posY}%`,
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                </div>
                <div className="absolute top-10 left-10 flex flex-col gap-3">
                  <div className="bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/5 text-[10px] font-black text-indigo-400 uppercase tracking-widest shadow-xl">
                    {zoom.toFixed(1)}x Magnification
                  </div>
                </div>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/60 backdrop-blur-xl px-8 py-4 rounded-[2.5rem] border border-white/10 shadow-2xl z-20">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all text-white flex items-center justify-center shadow-lg active:scale-90">
                    {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                  </button>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="text-xs mono text-slate-400 tracking-widest">
                    <span className="text-indigo-400 font-bold">{currentFrame + 1}</span> / {totalFrames}
                  </div>
                </div>
              </div>

              {currentSet && (
                <div className="glass p-10 rounded-[3rem] border border-indigo-500/20 space-y-8 animate-in slide-in-from-top-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Sequence Bounds: {currentSet.name}</h4>
                    <button onClick={() => setActiveSetId(null)} className="text-[10px] text-slate-500 hover:text-white font-black uppercase">Close Editor</button>
                  </div>
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500"><span>START FRAME</span><span className="mono text-indigo-400">#{currentSet.startFrame + 1}</span></div>
                      <input type="range" min="0" max={totalFrames - 1} value={currentSet.startFrame} onChange={(e) => updateSetBounds(currentSet.id, 'startFrame', parseInt(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500"><span>END FRAME</span><span className="mono text-indigo-400">#{currentSet.endFrame + 1}</span></div>
                      <input type="range" min="0" max={totalFrames - 1} value={currentSet.endFrame} onChange={(e) => updateSetBounds(currentSet.id, 'endFrame', parseInt(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-8">
                <div className="glass p-8 rounded-[3rem] space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <span>Optical Zoom</span>
                    <span className="text-indigo-400 mono">{zoom.toFixed(1)}x</span>
                  </div>
                  <input type="range" min="0.5" max="8" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
                <div className="glass p-8 rounded-[3rem] space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <span>Frame Velocity</span>
                    <span className="text-purple-400 mono">{fps} FPS</span>
                  </div>
                  <input type="range" min="1" max="60" value={fps} onChange={(e) => setFps(parseInt(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] uppercase font-black text-slate-500 tracking-[0.4em]">Active Animation Sets</h4>
                  <button onClick={() => setIsAddingSet(true)} className="text-[10px] font-black text-indigo-400 hover:text-white flex items-center gap-2 transition-colors">
                    <Icons.Sparkles /> NEW LOGIC SET
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveSetId(null)}
                    className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${!activeSetId ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20' : 'bg-black/20 border-white/5 text-slate-500 hover:text-slate-300'}`}
                  >
                    Atlas Root
                  </button>
                  {animationSets.map(set => (
                    <div key={set.id} className="relative group">
                      <button
                        onClick={() => setActiveSetId(set.id)}
                        className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeSetId === set.id ? 'bg-indigo-600 border-indigo-500 text-white ring-4 ring-indigo-500/10' : 'bg-black/20 border-white/5 text-slate-500'}`}
                      >
                        {set.name}
                      </button>
                      <button onClick={() => handleDeleteSet(set.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border-2 border-slate-950 scale-90 hover:scale-100">
                        <Icons.X />
                      </button>
                    </div>
                  ))}
                </div>
                {isAddingSet && (
                  <div className="glass p-6 rounded-[2rem] border border-indigo-500/20 flex items-center gap-6 animate-in slide-in-from-top-4">
                    <input autoFocus value={newSetName} onChange={e => setNewSetName(e.target.value)} placeholder="Identifier (e.g. CombatIdle)" className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none flex-1 font-bold" />
                    <button onClick={handleAddSet} className="px-8 py-3 bg-white text-black text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-slate-200 transition-colors">Register</button>
                    <button onClick={() => setIsAddingSet(false)} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest">Cancel</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'slicer' && (
            <div className="glass p-10 rounded-[4rem] space-y-10 animate-in fade-in duration-500">
              <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <h2 className="text-3xl font-black tracking-tighter">Timeline Slicer</h2>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full">
                  {slicedFrames.length} FRAMES BUFFERED
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-12 gap-x-6">
                {slicedFrames.map((frame, idx) => (
                  <React.Fragment key={idx}>
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      className={`flex flex-col gap-3 group animate-in zoom-in-95 cursor-grab active:cursor-grabbing ${draggedIndex === idx ? 'opacity-20 grayscale' : ''} ${dropTargetIndex === idx ? 'scale-110 border-indigo-500' : ''}`}
                    >
                      <div className="relative aspect-square bg-[url(https://www.transparenttextures.com/patterns/carbon-fibre.png)] bg-slate-900 rounded-[2rem] overflow-hidden border border-white/5 group-hover:border-indigo-500/50 transition-all shadow-xl group-hover:shadow-indigo-500/10">
                        <img src={frame} className="w-full h-full object-contain p-2 pointer-events-none" style={{ imageRendering: 'pixelated' }} />
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] mono font-bold text-slate-500 border border-white/5">#{idx + 1}</div>
                        <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); handleGenerateVariation(idx); }} className="w-10 h-10 bg-white text-black rounded-xl hover:scale-110 transition-transform flex items-center justify-center shadow-2xl">
                            {varyingIndex === idx ? <div className="animate-spin h-4 w-4 border-2 border-black/20 border-t-black rounded-full"></div> : <Icons.Magic />}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDownloadFrame(frame, idx); }} className="w-10 h-10 bg-black/60 text-white rounded-xl hover:scale-110 transition-transform flex items-center justify-center border border-white/10 shadow-2xl">
                            <Icons.Download />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1.5">
                          <button onClick={() => handleMoveFrame(idx, 'left')} disabled={idx === 0} className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-600 hover:text-white disabled:opacity-20"><Icons.ChevronLeft /></button>
                          <button onClick={() => handleMoveFrame(idx, 'right')} disabled={idx === slicedFrames.length - 1} className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-600 hover:text-white disabled:opacity-20"><Icons.ChevronRight /></button>
                        </div>
                        <button onClick={() => handleDeleteFrame(idx)} className="p-2 rounded-lg bg-red-950/20 text-red-500 hover:bg-red-600 hover:text-white border border-red-500/20 transition-all"><Icons.Trash /></button>
                      </div>
                    </div>
                    {idx < slicedFrames.length - 1 && (
                      <div className="flex items-center justify-center -mx-4 pt-12">
                        <button onClick={() => handleInterpolate(idx, idx + 1)} disabled={interpolatingIndex !== null} className="w-8 h-8 rounded-full border border-dashed border-white/10 hover:border-indigo-500 flex items-center justify-center text-slate-700 hover:text-indigo-500 transition-all hover:bg-indigo-500/5 group/tween">
                          {interpolatingIndex === idx ? <div className="animate-spin h-3 w-3 border-2 border-indigo-500 border-t-transparent rounded-full"></div> : <Icons.Sparkles />}
                        </button>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'palette' && (
            <div className="glass p-12 rounded-[4rem] space-y-10 animate-in fade-in duration-500">
              <h3 className="text-3xl font-black tracking-tighter">Chromatic Atlas</h3>
              <p className="text-slate-400 font-medium">Unique pigments synthesized from the current texture.</p>
              <div className="flex flex-wrap gap-6">
                {palette.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedPaletteColor(color)}
                    className={`w-20 h-20 rounded-3xl border-2 transition-all shadow-2xl relative group ${selectedPaletteColor === color ? 'border-indigo-500 scale-110 z-10 ring-8 ring-indigo-500/10' : 'border-white/5 hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                  >
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><Icons.Palette /></div>
                  </button>
                ))}
              </div>
              {selectedPaletteColor && (
                <div className="p-10 bg-black/40 rounded-[3rem] border border-white/5 animate-in slide-in-from-top-6 flex flex-col gap-8 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Swap Channel: <span className="text-white mono">{selectedPaletteColor}</span></span>
                    <button onClick={() => setSelectedPaletteColor(null)} className="p-2 hover:bg-white/10 rounded-xl"><Icons.X /></button>
                  </div>
                  <div className="flex items-center gap-10">
                    <input
                      type="color"
                      className="w-24 h-24 bg-transparent border-none cursor-pointer rounded-full overflow-hidden"
                      onChange={async (e) => {
                        const newUrl = await remapColor(sheet.url, selectedPaletteColor, e.target.value);
                        onUpdateSheet({ url: newUrl });
                        setSelectedPaletteColor(null);
                      }}
                    />
                    <p className="text-slate-500 text-sm leading-relaxed max-w-sm italic">Selection will trigger a global GPU-accelerated remap.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'refine' && (
            <div className="glass p-12 rounded-[4rem] space-y-10 animate-in fade-in duration-500 max-w-4xl">
              <div className="space-y-4">
                <h3 className="text-3xl font-black tracking-tighter">Intelligent Refiner</h3>
                <p className="text-slate-400 font-medium leading-relaxed">Fix artifacts or apply global transformations using natural language.</p>
              </div>

              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Refinement Scope</label>
                  <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/5 w-fit">
                    <button
                      onClick={() => setRefinementScope('global')}
                      className={`px-8 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${refinementScope === 'global' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Entire Atlas
                    </button>
                    <button
                      onClick={() => setRefinementScope('targeted')}
                      className={`px-8 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${refinementScope === 'targeted' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Targeted Frame
                    </button>
                  </div>
                </div>

                {refinementScope === 'targeted' && (
                  <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex justify-between">
                      Select Target Sprite
                      {refinementTargetIndex !== null && <span className="text-indigo-400 font-bold">FRAME #{refinementTargetIndex + 1} ACTIVE</span>}
                    </label>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {slicedFrames.map((frame, idx) => (
                        <button
                          key={idx}
                          onClick={() => setRefinementTargetIndex(idx)}
                          className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-slate-900/50 ${refinementTargetIndex === idx ? 'border-indigo-500 scale-105 shadow-xl shadow-indigo-600/20' : 'border-white/5 hover:border-white/20'}`}
                        >
                          <img src={frame} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <textarea
                    value={correctionPrompt}
                    onChange={e => setCorrectionPrompt(e.target.value)}
                    placeholder={refinementScope === 'targeted' ? "e.g. Remove the extra arm on this frame and fix the shoulder armor shading..." : "e.g. Infuse the character with a cyan spectral glow and add rune patterns..."}
                    className="w-full bg-black/40 border border-white/5 rounded-[2rem] p-8 text-slate-100 focus:ring-4 focus:ring-indigo-500/10 outline-none h-40 resize-none font-medium text-lg placeholder:text-slate-700 shadow-inner"
                  />

                  <button
                    onClick={handleRefine}
                    disabled={isRefining || !correctionPrompt.trim() || (refinementScope === 'targeted' && refinementTargetIndex === null)}
                    className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-4 active:scale-95"
                  >
                    {isRefining ? <div className="animate-spin h-6 w-6 border-4 border-white/20 border-t-white rounded-full"></div> : <><Icons.Sparkles /> {refinementScope === 'targeted' ? 'REFINE SELECTED SPRITE' : 'EXECUTE GLOBAL REFINEMENT'}</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'motion' && (
            <div className="glass p-12 rounded-[4rem] space-y-10 animate-in fade-in duration-500 flex flex-col items-center">
              <div className="text-center space-y-4 max-w-xl">
                <h3 className="text-3xl font-black tracking-tighter">AI Motion Diagnostics</h3>
                <p className="text-slate-400 font-medium">Synthesize a cinematic MP4 of the primary character logic.</p>
              </div>
              {videoUrl ? (
                <div className="space-y-10 w-full max-w-2xl">
                  <div className="aspect-square bg-slate-950 rounded-[4rem] border-4 border-white/5 shadow-2xl overflow-hidden">
                    <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-6 justify-center">
                    <button onClick={() => setVideoUrl(null)} className="px-10 py-4 glass glass-hover text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest">RESET ENGINE</button>
                    <a href={videoUrl} download="motion_render.mp4" className="px-10 py-4 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-600/20 flex items-center gap-3"><Icons.Download /> EXPORT VIDEO</a>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-2xl aspect-video border-2 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center gap-8 bg-black/20 group hover:border-indigo-500/20 transition-all">
                  <div className="p-8 bg-purple-600/10 rounded-full text-purple-500 group-hover:scale-110 transition-transform"><Icons.Video /></div>
                  <button onClick={handleGenerateVideo} disabled={isGeneratingVideo} className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.05] transition-all active:scale-95 disabled:grayscale">
                    {isGeneratingVideo ? <div className="animate-spin h-6 w-6 border-4 border-white/20 border-t-white rounded-full"></div> : "GENERATE MOTION"}
                  </button>
                  {isGeneratingVideo && <p className="text-purple-400 text-[10px] font-black uppercase tracking-widest animate-pulse">{videoStatus}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={`w-full lg:w-96 flex flex-col gap-10 ${isStudioFullscreen ? 'lg:max-h-[80vh] overflow-auto pr-2' : ''}`}>
        <div className="glass p-8 rounded-[3rem] space-y-6">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Pipeline Transfer</h3>
          <div className="flex flex-col gap-3">
            <button onClick={handleExportPro} className="w-full py-5 bg-indigo-600 text-white text-[10px] font-black rounded-2xl flex items-center justify-center gap-3 shadow-2xl hover:bg-indigo-500 transition-all uppercase tracking-widest active:scale-95">
              <Icons.Download /> Pro JSON Export
            </button>
            <button onClick={() => importJsonRef.current?.click()} className="w-full py-5 glass glass-hover text-white text-[10px] font-black rounded-2xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest border border-white/10 active:scale-95">
              <Icons.Folder /> Pro JSON Import
              <input type="file" ref={importJsonRef} onChange={handleImportPro} className="hidden" accept=".json" />
            </button>
            <button onClick={() => window.print()} className="w-full py-5 bg-white text-black text-[10px] font-black rounded-2xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest hover:bg-slate-200 shadow-xl active:scale-95">
              <Icons.Copy /> Export Atlas PNG
            </button>
          </div>
        </div>

        <div className="glass p-8 rounded-[3rem] space-y-8">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Grid Calibration</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">COLS</span>
              <input type="number" min="1" value={sheet.grid.cols} onChange={e => onUpdateSheet({ grid: { ...sheet.grid, cols: parseInt(e.target.value) || 1 } })} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm mono font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">ROWS</span>
              <input type="number" min="1" value={sheet.grid.rows} onChange={e => onUpdateSheet({ grid: { ...sheet.grid, rows: parseInt(e.target.value) || 1 } })} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm mono font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
          </div>
          <button onClick={handleAutoDetect} className="w-full py-4 glass glass-hover text-[10px] font-black rounded-2xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-indigo-400">
            <Icons.Scan /> AI AUTO-GEOMETRY
          </button>
        </div>

        <div className="glass p-8 rounded-[3rem] space-y-6">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Batch Operations</h3>
          <div className="flex flex-col gap-3">
            <button onClick={handleRemoveBackground} className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[10px] font-black rounded-2xl border border-white/5 flex items-center justify-center gap-3 transition-all uppercase tracking-widest">
              <Icons.Scissors /> Smart Transparency
            </button>
            <button onClick={handlePrecisionCrop} className="w-full py-4 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-black rounded-2xl border border-indigo-500/20 flex items-center justify-center gap-3 transition-all uppercase tracking-widest">
              <Icons.Image /> AI Pixel Align
            </button>
          </div>
        </div>

        <div className="glass p-8 rounded-[3rem] space-y-6 flex-1 relative overflow-hidden group">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Source Atlas</h3>
            <Icons.Eye />
          </div>
          <div className="aspect-square rounded-[2rem] overflow-hidden border border-white/10 bg-[url(https://www.transparenttextures.com/patterns/carbon-fibre.png)] bg-slate-950 relative shadow-inner">
            <img src={sheet.url} alt="Source" className="w-full h-full object-contain drop-shadow-2xl" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute inset-0 pointer-events-none opacity-20 transition-opacity group-hover:opacity-40">
              {Array.from({ length: sheet.grid.rows }).map((_, r) => (<div key={r} className="absolute w-full border-b border-white/40" style={{ top: `${(r / sheet.grid.rows) * 100}%` }} />))}
              {Array.from({ length: sheet.grid.cols }).map((_, c) => (<div key={c} className="absolute h-full border-r border-white/40" style={{ left: `${(c / sheet.grid.cols) * 100}%` }} />))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationStudio;
