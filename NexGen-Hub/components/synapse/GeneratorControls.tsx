
import React, { useRef, useState } from 'react';
import { SpriteStyle, GridConfig, ModelType, SpriteSheet, AnimationSet } from '../../types';
import { Icons } from './SynapseIcons';
import { detectGridLayout } from '../../services/geminiService';

interface GeneratorControlsProps {
  prompt: string;
  setPrompt: (v: string) => void;
  style: SpriteStyle;
  setStyle: (v: SpriteStyle) => void;
  grid: GridConfig;
  setGrid: (v: GridConfig) => void;
  model: ModelType;
  setModel: (v: ModelType) => void;
  referenceImages: string[];
  setReferenceImages: (v: string[]) => void;
  autoTransparency: boolean;
  setAutoTransparency: (v: boolean) => void;
  transparencyTolerance: number;
  setTransparencyTolerance: (v: number) => void;
  onGenerate: () => void;
  onImportSheet: (url: string, grid: GridConfig) => void;
  onImportProject: (sheet: SpriteSheet) => void;
  isLoading: boolean;
}

const STYLE_METADATA: Record<SpriteStyle, { icon: React.ReactNode, color: string, complexity: string, desc: string, specs: string }> = {
  'Pixel Art': {
    icon: <Icons.StylePixel />,
    color: 'from-blue-500/30 to-blue-600/30',
    complexity: '8-BIT',
    desc: 'Legacy raster synthesis.',
    specs: 'RES: 64px | CLR: LMT'
  },
  'HD Pixel': {
    icon: <Icons.StyleHD />,
    color: 'from-indigo-500/30 to-indigo-600/30',
    complexity: '32-BIT',
    desc: 'Enhanced bit-depth logic.',
    specs: 'RES: 256px | CLR: RGB'
  },
  'Gritty HD Pixel': {
    icon: <Icons.StyleHD />,
    color: 'from-slate-500/30 to-slate-600/30',
    complexity: 'DITHER',
    desc: 'Textured noise patterns.',
    specs: 'RES: 256px | CLR: NOISE'
  },
  'Vector': {
    icon: <Icons.StyleVector />,
    color: 'from-emerald-500/30 to-emerald-600/30',
    complexity: 'PATH',
    desc: 'Mathematical spline generation.',
    specs: 'RES: INF | CLR: VEC'
  },
  'Vector Flat': {
    icon: <Icons.StyleVector />,
    color: 'from-cyan-500/30 to-cyan-600/30',
    complexity: 'SVG+',
    desc: 'Minimalist vector curves.',
    specs: 'RES: INF | CLR: FLAT'
  },
  'Hand Drawn': {
    icon: <Icons.StyleSketch />,
    color: 'from-orange-500/30 to-orange-600/30',
    complexity: 'ANALOG',
    desc: 'Simulated stroke variance.',
    specs: 'RES: 512px | CLR: MIX'
  },
  'Flat Design': {
    icon: <Icons.StyleFlat />,
    color: 'from-cyan-500/30 to-cyan-600/30',
    complexity: 'UI/UX',
    desc: 'Minimalist geometry.',
    specs: 'RES: 512px | CLR: FLAT'
  },
  'Cel-shaded': {
    icon: <Icons.StyleCel />,
    color: 'from-pink-500/30 to-pink-600/30',
    complexity: 'PBR-',
    desc: 'High-contrast edge tracing.',
    specs: 'RES: 512px | CLR: TOON'
  },
  'Retro 8-bit': {
    icon: <Icons.StylePixel />,
    color: 'from-blue-600/30 to-blue-700/30',
    complexity: '8-BIT',
    desc: 'Classic console fidelity.',
    specs: 'RES: 64px | CLR: 8B'
  },
  'Anime/Manga': {
    icon: <Icons.StyleCel />,
    color: 'from-purple-500/30 to-pink-500/30',
    complexity: 'VIBRANT',
    desc: 'Cinematic cel-animation.',
    specs: 'RES: 512px | CLR: INK'
  },
  'Low Poly 3D': {
    icon: <Icons.StyleHD />,
    color: 'from-slate-400/30 to-slate-500/30',
    complexity: 'VERTEX',
    desc: 'Simulated 3D geometry.',
    specs: 'RES: 256px | CLR: PBR'
  },
  'Cyberpunk/Neon': {
    icon: <Icons.StyleHD />,
    color: 'from-purple-600/30 to-cyan-400/30',
    complexity: 'EMISSIVE',
    desc: 'High-luminance gradients.',
    specs: 'RES: 512px | CLR: LUM'
  },
  'Isometric': {
    icon: <Icons.StyleHD />,
    color: 'from-amber-500/30 to-orange-600/30',
    complexity: '2.5D',
    desc: 'Fixed-perspective rendering.',
    specs: 'RES: 512px | CLR: ISO'
  },
  'Watercolor': {
    icon: <Icons.StyleSketch />,
    color: 'from-sky-400/30 to-blue-500/30',
    complexity: 'FLUID',
    desc: 'Analog pigment diffusion.',
    specs: 'RES: 512px | CLR: WASH'
  },
  'Oil Painting': {
    icon: <Icons.StyleSketch />,
    color: 'from-orange-600/30 to-red-600/30',
    complexity: 'TEXTURED',
    desc: 'Impasto stroke simulation.',
    specs: 'RES: 512px | CLR: IMP'
  },
  'Retro 16-bit': {
    icon: <Icons.StyleRetro />,
    color: 'from-red-500/30 to-red-600/30',
    complexity: '16-BIT',
    desc: 'Classic arcade parity.',
    specs: 'RES: 128px | CLR: 16B'
  },
  'Blueprint/Schematic': {
    icon: <Icons.StyleVector />,
    color: 'from-blue-700/30 to-blue-800/30',
    complexity: 'TECH',
    desc: 'Technical vector drafting.',
    specs: 'RES: INF | CLR: LINE'
  },
  'Claymation': {
    icon: <Icons.StyleHD />,
    color: 'from-rose-500/30 to-orange-400/30',
    complexity: 'TACTILE',
    desc: 'Hand-sculpted aesthetics.',
    specs: 'RES: 512px | CLR: SOFT'
  },
  'Voxel': {
    icon: <Icons.StylePixel />,
    color: 'from-emerald-400/30 to-teal-600/30',
    complexity: 'VOLUME',
    desc: '3D volumetric pixels.',
    specs: 'RES: 128px | CLR: VOL'
  },
  'Noir/Black & White': {
    icon: <Icons.StyleSketch />,
    color: 'from-slate-800/30 to-slate-900/40',
    complexity: 'MONO',
    desc: 'High-contrast monochrome.',
    specs: 'RES: 512px | CLR: B&W'
  },
};

const GeneratorControls: React.FC<GeneratorControlsProps> = ({
  prompt, setPrompt, style, setStyle, grid, setGrid, model, setModel,
  referenceImages, setReferenceImages, autoTransparency, setAutoTransparency,
  transparencyTolerance, setTransparencyTolerance,
  onGenerate, onImportSheet, onImportProject, isLoading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(true); // Default open for better access
  const [lastSelectedStyle, setLastSelectedStyle] = useState<SpriteStyle | null>(null);

  const handleStyleSelect = (s: SpriteStyle) => {
    setStyle(s);
    setLastSelectedStyle(s);
    setTimeout(() => setLastSelectedStyle(null), 300);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [...referenceImages];
    for (let i = 0; i < files.length; i++) {
      if (newImages.length >= 5) break;
      const file = files[i];
      const reader = new FileReader();
      const promise = new Promise<string>((resolve) => {
        reader.onload = (event) => resolve(event.target?.result as string);
      });
      reader.readAsDataURL(file);
      const result = await promise;
      newImages.push(result);
    }
    setReferenceImages(newImages);
    e.target.value = ''; // Reset input
  };

  const handleImportSheet = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const url = event.target?.result as string;
      setIsDetecting(true);
      try {
        const detected = await detectGridLayout(url);
        onImportSheet(url, detected);
      } catch (err) {
        onImportSheet(url, { rows: 1, cols: 1 });
      } finally {
        setIsDetecting(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const handleRestoreProject = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          const projectSheet: SpriteSheet = {
            id: crypto.randomUUID(),
            url: imageData,
            prompt: json.meta.prompt || "Restored Session",
            style: json.meta.style || 'Pixel Art',
            grid: json.meta.grid || { rows: 1, cols: 1 },
            timestamp: json.meta.timestamp || Date.now(),
            animationSets: importedSets
          };
          onImportProject(projectSheet);
        } else {
          alert("Selected file is not a valid SpriteSheet.ai project manifest.");
        }
      } catch (err) {
        alert("Failed to parse project file. Ensure it is a valid .json file.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="glass p-8 pb-16 rounded-[3rem] space-y-8 relative overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
      {isDetecting && (
        <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-xl z-50 rounded-[3rem] flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500">
          <div className="relative">
            <div className="animate-ping absolute inset-0 rounded-full bg-indigo-500 opacity-20"></div>
            <div className="animate-spin h-14 w-14 border-4 border-white/10 border-t-indigo-500 rounded-full relative z-10"></div>
          </div>
          <div className="text-center space-y-2">
            <span className="text-white font-black text-xs tracking-[0.4em] uppercase block">Deep Scanning</span>
            <p className="text-slate-500 text-[10px] font-bold">CALIBRATING GRID GEOMETRY...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Image Archetypes</label>
          <span className="text-[10px] font-black text-slate-600">{referenceImages.length} / 5</span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1 relative">
          {referenceImages.length === 0 && !isLoading && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="text-white/20 group-hover:text-indigo-400 group-hover:scale-110 transition-all duration-500">
                <Icons.Plus />
              </div>
              <span className="text-[9px] font-black text-slate-500 group-hover:text-slate-300 uppercase tracking-widest transition-colors">Load Your Vision</span>
            </div>
          )}
          {referenceImages.map((img, idx) => (
            <div key={idx} className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border border-white/10 group shadow-2xl glass transition-transform hover:scale-105 ${idx === 0 ? 'border-indigo-500/50 shadow-[0_0_25px_rgba(79,70,229,0.2)]' : ''} ${isLoading ? 'scanning-bar' : ''}`}>
              <img src={img} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setReferenceImages(referenceImages.filter((_, i) => i !== idx))}
                className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity z-30"
              >
                <Icons.X />
              </button>
            </div>
          ))}

          {/* Ghost Placeholders */}
          {Array.from({ length: 5 - referenceImages.length }).map((_, i) => (
            <div
              key={`ghost-${i}`}
              className={`flex-shrink-0 w-24 h-24 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-800 bg-black/5 opacity-50 ${i === 0 && !isLoading ? 'hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-colors cursor-pointer' : ''} ${isLoading ? 'scanning-bar' : ''}`}
              onClick={() => i === 0 && !isLoading && fileInputRef.current?.click()}
            >
              {i === 0 && !isLoading ? (
                <>
                  <div className="text-indigo-400/50 group-hover:text-indigo-400 transition-colors">
                    <Icons.Plus />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-tighter opacity-40 mt-1">Add Archetype</span>
                </>
              ) : (
                <div className="opacity-10">
                  <Icons.Ghost size={24} />
                </div>
              )}
              {i === 0 && <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logic Prompt</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => projectInputRef.current?.click()}
              className="text-[10px] font-black text-purple-400 hover:text-white flex items-center gap-2 transition-colors uppercase tracking-widest active:scale-95"
            >
              <Icons.Download /> Restore Session
              <input type="file" ref={projectInputRef} onChange={handleRestoreProject} className="hidden" accept=".json" />
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="text-[10px] font-black text-indigo-400 hover:text-white flex items-center gap-2 transition-colors uppercase tracking-widest active:scale-95"
            >
              <Icons.Folder /> Import Texture
              <input type="file" ref={importInputRef} onChange={handleImportSheet} className="hidden" accept="image/*" />
            </button>
          </div>
        </div>
        <div className="relative group">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A cybernetic ronin with a glowing blade performing a low-sweep attack animation..."
            className="w-full bg-black/40 border border-white/10 rounded-[2rem] p-6 text-slate-100 focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-500/50 outline-none transition-all resize-none h-32 text-sm leading-relaxed placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Art Direction</label>
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black text-indigo-400/50 uppercase tracking-tighter">Horizontal Scroll Active</span>
            <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {(Object.keys(STYLE_METADATA) as SpriteStyle[]).map((s) => {
            const meta = STYLE_METADATA[s];
            const isActive = style === s;
            const isFlashed = lastSelectedStyle === s;

            return (
              <button
                key={s}
                type="button"
                onClick={() => handleStyleSelect(s)}
                className={`group relative flex-shrink-0 w-44 h-24 rounded-2xl transition-all duration-500 overflow-hidden border ${isActive
                  ? `bg-gradient-to-br ${meta.color} border-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.3)] ${isFlashed ? 'animate-pixel-flash' : ''}`
                  : 'bg-white/5 border-white/[0.08] hover:bg-white/10 hover:border-white/20'
                  }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-indigo-500/10 animate-pulse-glow pointer-events-none" />
                )}
                {/* Complexity Tag (Top Right) */}
                <div className={`absolute top-2.5 right-3 px-1.5 py-0.5 rounded border text-[6px] font-black tracking-widest transition-all ${isActive ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-white/5 border-white/10 text-slate-600'}`}>
                  {meta.complexity}
                </div>

                {/* Shrunk Ghost Silhouette (Top Left) */}
                <div
                  className={`absolute top-3 left-4 transition-all duration-700 pointer-events-none ${isActive ? 'opacity-40 scale-110' : 'opacity-10 scale-90 group-hover:opacity-25'
                    }`}
                >
                  <div className={isActive && isFlashed ? 'chromatic-glitch' : ''}>
                    {React.cloneElement(meta.icon as React.ReactElement, { size: 28, strokeWidth: 0.8 })}
                  </div>
                </div>

                {/* Minimal Label & Specs (Bottom) */}
                <div className="absolute bottom-3 left-4 right-4 text-left">
                  <p className={`text-[9px] font-mono font-black uppercase tracking-wider leading-none ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {s}
                  </p>
                  <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-white/5">
                    <p className="text-[6px] font-bold text-slate-500 uppercase tracking-tighter truncate opacity-60">
                      {meta.specs}
                    </p>
                  </div>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Engine</label>
          <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/5">
            <button
              type="button"
              onClick={() => setModel('gemini-2.5-flash-image')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${model === 'gemini-2.5-flash-image' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            > LITE </button>
            <button
              type="button"
              onClick={() => setModel('gemini-3-pro-image-preview')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${model === 'gemini-3-pro-image-preview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            > PRO </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex justify-between">
            Grid <span className="text-indigo-400 mono">{grid.cols}x{grid.rows}</span>
          </label>
          <div className="flex flex-col gap-3 p-4 bg-black/40 rounded-2xl border border-white/10">
            <input type="range" min="1" max="8" value={grid.cols} onChange={(e) => setGrid({ ...grid, cols: parseInt(e.target.value) })} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-white/5" />
            <input type="range" min="1" max="8" value={grid.rows} onChange={(e) => setGrid({ ...grid, rows: parseInt(e.target.value) })} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500 border border-white/5" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="p-4 bg-black/40 rounded-2xl border border-white/10">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setAutoTransparency(!autoTransparency)}>
            <div className={`w-12 h-6 rounded-full transition-all relative ${autoTransparency ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-white/10'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${autoTransparency ? 'left-7' : 'left-1'}`} />
            </div>
            <div className="flex flex-col">
              <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${autoTransparency ? 'text-white' : 'text-slate-600'}`}>Auto-Transparency Engine</span>
              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter">Alpha Channel Synthesis</span>
            </div>
          </div>
        </div>

        {autoTransparency && (
          <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5 animate-in slide-in-from-top-4 duration-500 mt-2">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tolerance</span>
              <span className="text-indigo-400 mono font-bold">{transparencyTolerance}</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={transparencyTolerance}
              onChange={(e) => setTransparencyTolerance(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-white/5"
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={isLoading || !prompt.trim()}
        className={`w-full py-6 rounded-[2rem] flex items-center justify-center gap-4 font-black text-base tracking-[0.2em] uppercase transition-all shadow-2xl relative overflow-hidden group/btn ${isLoading || !prompt.trim()
          ? 'bg-slate-900 text-slate-700 cursor-not-allowed border border-white/5'
          : 'bg-white text-black hover:scale-[1.02] active:scale-[0.98]'
          }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-4">
            <div className="animate-spin h-5 w-5 border-4 border-black/10 border-t-black rounded-full"></div>
            <span>PROCESSING...</span>
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
            <span className="relative z-10 group-hover/btn:text-white flex items-center gap-3"><Icons.Sparkles /> SYNTHESIZE ASSET</span>
          </>
        )}
      </button>
    </div>
  );
};

export default GeneratorControls;
