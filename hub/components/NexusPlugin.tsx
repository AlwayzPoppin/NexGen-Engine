
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Database,
  Home,
  Zap,
  Search,
  Music,
  ImageIcon,
  Files,
  Rocket,
  Workflow,
  Binary,
  Cpu,
  RefreshCcw,
  Monitor,
  BrainCircuit,
  Sparkles,
  MessageSquare,
  Flag,
  ListTodo,
  Activity,
  Wifi,
  Trash2,
  Save,
  Clock,
  Layers,
  Eye,
  Camera,
  Layout,
  UserPlus,
  Heart,
  Trophy,
  Gift,
  Ban,
  Scissors,
  VolumeX,
  Aperture,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ZapOff,
  Dna,
  Shield,
  Key,
  Boxes,
  Swords,
  CloudLightning,
  History,
  HardDrive,
  ZoomIn,
  ZoomOut,
  Focus,
  Crosshair,
  Compass,
  Filter,
  MoreVertical,
  Link2,
  GitMerge,
  Move,
  Target,
  PlusSquare,
  XSquare,
  Variable,
  Volume2,
  Plus,
  GitBranch,
  Skull,
  BookOpen,
  FolderOpen,
  Wand2,
  Download,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Layers2,
  Maximize2,
  MousePointer2,
  Paintbrush,
  Eraser,
  Pipette,
  Grid3X3,
  Edit2,
  Link,
  Dna as BoneIcon,
  Mic,
  Sliders,
  AudioLines,
  Waves,
  Link as LinkIcon,
  Headphones,
  Music2,
  Ear
} from 'lucide-react';
import { NexusModule, NexusAsset, NexusMetaVariable, GameEntity2D, GlobalGameState, GenesisNode } from '../../types';
import { generateSprite, generateAudioSignal } from '../services/geminiService';
import NovaEngine from './NovaEngine';
import AtlasUI from './AtlasUI';
import Airlock from './Airlock';
// GenesisEditor removed in favor of restored native Genesis UI
// import GenesisEditor from './GenesisEditor';
// NodePos moved to types.ts


type GenesisTab = 'QUEST' | 'LOGIC' | 'DEPLOY';
type SynapseTab = 'GENERATOR' | 'EDITOR' | 'ANIMATOR' | 'RIGGING';
type EchoTab = 'SIGNAL_GEN' | 'WAVE_EDIT' | 'FX_FORGE';
type AudioCategory = 'DIALOGUE' | 'SFX' | 'MUSIC' | 'AMBIENT';
type SpriteStyle = 'Pixel Art' | 'Vector Flat' | 'Hand Drawn' | 'Cyberpunk/Neon' | 'Isometric';

interface AnimFrame {
  id: string;
  image: string;
  duration: number;
}

interface AssetCardProps {
  asset: NexusAsset;
  isEditing: boolean;
  editNameValue: string;
  setEditNameValue: (s: string) => void;
  startEdit: () => void;
  saveEdit: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, isEditing, editNameValue, setEditNameValue, startEdit, saveEdit }) => {
  const [previewSrc, setPreviewSrc] = useState<string | null>(asset.previewUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let createdUrl: string | null = null;
    let mounted = true;

    if (!asset.previewUrl && asset.handle) {
      asset.handle.getFile().then((file: File) => {
        if (mounted) {
          createdUrl = URL.createObjectURL(file);
          setPreviewSrc(createdUrl);
        }
      });
    } else {
      setPreviewSrc(asset.previewUrl || null);
    }

    return () => {
      mounted = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [asset]);

  const togglePlay = () => {
    if (!previewSrc) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(previewSrc);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col gap-5 relative overflow-hidden group/item">
      <div className={`aspect-square rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden relative ${asset.type === 'Sprite' ? 'bg-cyan-500/10 text-cyan-400' :
        asset.type === 'Audio' ? 'bg-pink-500/10 text-pink-400' :
          'bg-emerald-500/10 text-emerald-400'
        }`}>
        {asset.type === 'Sprite' && previewSrc ? (
          <img src={previewSrc} className="w-full h-full object-contain" />
        ) : asset.type === 'Audio' && previewSrc ? (
          <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-pink-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg z-10">
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
        ) : (
          asset.type === 'Sprite' ? <ImageIcon size={32} /> : <Volume2 size={32} />
        )}
      </div>

      <div>
        {isEditing ? (
          <div className="flex gap-2">
            <input value={editNameValue} onChange={e => setEditNameValue(e.target.value)} className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-white w-full" autoFocus />
            <button onClick={saveEdit} className="p-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/40"><CheckCircle size={14} /></button>
          </div>
        ) : (
          <div className="flex justify-between items-center group/edit">
            <h4 className="text-sm font-black text-slate-100 uppercase tracking-tight truncate" title={asset.name}>{asset.name}</h4>
            <button onClick={startEdit} className="opacity-0 group-hover/edit:opacity-100 text-slate-500 hover:text-white transition-opacity"><Edit2 size={12} /></button>
          </div>
        )}
        <p className="text-[9px] font-mono text-slate-600 truncate uppercase tracking-tighter" title={asset.path}>{asset.path}</p>
        {asset.statusReason && <p className="text-[8px] font-black text-pink-500/60 uppercase mt-1 tracking-widest">{asset.statusReason}</p>}
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <div className={`w-1.5 h-1.5 rounded-full ${asset.status === 'Linked' ? 'bg-emerald-500' : 'bg-red-500'}`} />
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{asset.status}</span>
      </div>
    </div>
  );
};

const NexusPlugin: React.FC = () => {
  const [activeModule, setActiveModule] = useState<NexusModule>('ASSEMBLER');
  const [genesisTab, setGenesisTab] = useState<GenesisTab>('LOGIC');
  const [synapseTab, setSynapseTab] = useState<SynapseTab>('GENERATOR');
  const [echoTab, setEchoTab] = useState<EchoTab>('SIGNAL_GEN');

  const [isScanning, setIsScanning] = useState(false);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [assets, setAssets] = useState<NexusAsset[]>([]);
  const [assetSearch, setAssetSearch] = useState('');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Synapse State
  const [synapsePrompt, setSynapsePrompt] = useState('');
  const [synapseStyle, setSynapseStyle] = useState<SpriteStyle>('Pixel Art');
  const [isGeneratingSprite, setIsGeneratingSprite] = useState(false);
  const [generatedSprite, setGeneratedSprite] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Echo State
  const [echoPrompt, setEchoPrompt] = useState('');
  const [echoCategory, setEchoCategory] = useState<AudioCategory>('DIALOGUE');
  const [echoVoice, setEchoVoice] = useState('Kore');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isContextBound, setIsContextBound] = useState(true);
  const [audioFx, setAudioFx] = useState({ reverb: 20, distortion: 0, echo: 10, lowPass: 100, highPass: 0, gain: 80 });

  // Animation State
  const [animFrames, setAnimFrames] = useState<AnimFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(12);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");

  const projectVariables = [
    { key: 'player_health', value: '100', type: 'System' },
    { key: 'world_time', value: 'Midnight', type: 'Global' },
    { key: 'is_in_combat', value: 'False', type: 'System' }
  ];

  // Constants for the Coordinate System
  const BOARD_SIZE = 8000;
  const CENTER = BOARD_SIZE / 2;

  // Global Game State (Shared between Genesis Logic & Nova Runtime)
  const [gameState, setGameState] = useState<GlobalGameState>({
    entities: [
      { id: 'ent_player', name: 'Hero Character', type: 'Player', layer: 'Game', visible: true, x: CENTER, y: CENTER, scale: 1 },
      { id: 'ent_cam', name: 'Viewpoint Camera', type: 'Camera', layer: 'UI', visible: true, x: CENTER, y: CENTER, scale: 1 },
      { id: 'ent_level', name: 'Level Boundary', type: 'Trigger', layer: 'Game', visible: true, x: CENTER, y: CENTER, scale: 1 }
    ],
    nodes: [
      {
        id: 'node_init_event',
        x: CENTER,
        y: CENTER,
        label: 'On Game Start',
        type: 'Event',
        inputs: [],
        outputs: [{ id: 'out_exec', name: '', type: 'Exec', direction: 'Output' }]
      }
    ]
  });

  // Dragging & Navigation State
  const [zoom, setZoom] = useState(1);
  const [draggingNode, setDraggingNode] = useState<{ id: string; startX: number; startY: number; mouseStartX: number; mouseStartY: number } | null>(null);
  const [viewport, setViewport] = useState({ scrollLeft: 0, scrollTop: 0, clientWidth: 0, clientHeight: 0 });
  const [projectHandle, setProjectHandle] = useState<any>(null); // FileSystemDirectoryHandle

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize scroll position to center
  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      el.scrollLeft = CENTER - el.clientWidth / 2;
      el.scrollTop = CENTER - el.clientHeight / 2;
      updateViewport();
    }
  }, []);

  // Animation Player Loop
  useEffect(() => {
    let timeout: any;
    if (isPlaying && animFrames.length > 0) {
      timeout = setTimeout(() => {
        setCurrentFrameIndex(prev => (prev + 1) % animFrames.length);
      }, 1000 / fps);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, currentFrameIndex, animFrames, fps]);



  // Persistence Layer
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('nexgen_gamestate');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setGameState(prev => ({ ...prev, ...parsed }));
      }

      const savedAssets = localStorage.getItem('nexgen_assets');
      if (savedAssets) {
        setAssets(JSON.parse(savedAssets));
      }
    } catch (e) {
      console.warn("Nexus Persistence Load Failed:", e);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('nexgen_gamestate', JSON.stringify(gameState));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [gameState]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const serializableAssets = assets.map(({ handle, previewUrl, ...rest }) => ({
        ...rest,
        previewUrl: previewUrl?.startsWith('data:') ? previewUrl : undefined
      }));
      localStorage.setItem('nexgen_assets', JSON.stringify(serializableAssets));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [assets]);

  const updateViewport = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollTop, clientWidth, clientHeight } = containerRef.current;
      setViewport({ scrollLeft, scrollTop, clientWidth, clientHeight });
    }
  };

  // Real file system scanner using File System Access API with smart filtering
  const scanDirectory = async () => {
    setIsScanning(true);
    setProgress(0);

    // Directories to skip (common non-game folders)
    const skipDirs = [
      'node_modules', 'target', '.git', '.nexus', '.vscode', 'dist', 'build',
      '__pycache__', '.cargo', 'deps', 'debug', 'release', 'bin', 'obj',
      '.idea', '.vs', 'vendor', 'packages', 'Library', 'Temp', 'Logs'
    ];

    // File extensions to include (game assets only - excluding txt due to build logs)
    const gameAssetExtensions = {
      sprites: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'tga', 'psd'],
      audio: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma'],
      data: ['json', 'xml', 'yaml', 'yml', 'csv'], // Removed txt, toml, cfg, ini due to build artifacts
      logic: ['gd', 'nx', 'lua', 'gdc'] // Game-specific logic only
    };

    // Filename patterns to exclude (build artifacts, logs, config files)
    const excludePatterns = [
      /^build[_-]/i, /^compile[_-]/i, /^cargo\./i, /^rustfmt\./i,
      /^\.cargo/i, /^lock$/i, /\.lock$/i, /^error/i, /^warning/i,
      /^log[_-]/i, /^debug[_-]/i, /^test[_-]/i, /^\.git/i
    ];

    const isExcludedFile = (filename: string) => {
      return excludePatterns.some(pattern => pattern.test(filename));
    };


    const allGameExtensions = [
      ...gameAssetExtensions.sprites,
      ...gameAssetExtensions.audio,
      ...gameAssetExtensions.data,
      ...gameAssetExtensions.logic
    ];

    try {
      // Request directory access from user
      const dirHandle = await (window as any).showDirectoryPicker();
      setProjectHandle(dirHandle); // Store handle for later use (e.g. Genesis Sync)
      const scannedAssets: NexusAsset[] = [];
      let processedFiles = 0;
      let totalFiles = 0;

      // Count total game files first for progress (with filtering)
      const countFiles = async (handle: any, dirName: string = ''): Promise<number> => {
        if (skipDirs.includes(dirName.toLowerCase())) return 0;
        let count = 0;
        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            const ext = entry.name.split('.').pop()?.toLowerCase() || '';
            if (allGameExtensions.includes(ext)) count++;
          } else if (entry.kind === 'directory' && !skipDirs.includes(entry.name.toLowerCase())) {
            count += await countFiles(entry, entry.name);
          }
        }
        return count;
      };
      totalFiles = await countFiles(dirHandle);

      // Recursive scan function with filtering
      const scanHandle = async (handle: any, path: string = '', dirName: string = '') => {
        // Skip excluded directories
        if (skipDirs.includes(dirName.toLowerCase())) return;

        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            const ext = file.name.split('.').pop()?.toLowerCase() || '';

            // Only include game asset files
            if (!allGameExtensions.includes(ext)) continue;

            // Skip build artifacts and log files by pattern
            if (isExcludedFile(file.name)) continue;

            const filePath = `${path}/${file.name}`;

            // Determine asset type based on extension
            let assetType: 'Sprite' | 'Audio' | 'Logic' | 'Data' = 'Data';
            if (gameAssetExtensions.sprites.includes(ext)) assetType = 'Sprite';
            else if (gameAssetExtensions.audio.includes(ext)) assetType = 'Audio';
            else if (gameAssetExtensions.logic.includes(ext)) assetType = 'Logic';

            scannedAssets.push({
              id: `asset_${Date.now()}_${processedFiles}`,
              name: file.name,
              type: assetType,
              status: 'Unlinked',
              path: filePath,
              handle: entry
            });

            processedFiles++;
            setProgress(Math.round((processedFiles / Math.max(totalFiles, 1)) * 100));
          } else if (entry.kind === 'directory') {
            await scanHandle(entry, `${path}/${entry.name}`, entry.name);
          }
        }
      };

      await scanHandle(dirHandle);

      // Auto-Link Logic: Check if assets are referenced in the Genesis Graph
      const updatedAssets = scannedAssets.map(asset => {
        const isReferenced = gameState.nodes.some(node => {
          const assetName = asset.name;
          if (node.label.toLowerCase().includes(assetName.toLowerCase())) return true;
          if (node.data) {
            if (node.data === assetName) return true;
            if (typeof node.data === 'object' && Object.values(node.data).some(v => v === assetName)) return true;
          }
          return false;
        });

        if (isReferenced) {
          return { ...asset, status: 'Linked', statusReason: 'Referenced in Genesis Graph' };
        }
        return asset;
      });

      setAssets(updatedAssets as NexusAsset[]);
      setProgress(100);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Directory scan error:', error);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const saveRename = () => {
    if (editingAssetId) {
      setAssets(prev => prev.map(a => a.id === editingAssetId ? { ...a, name: editNameValue } : a));
      setEditingAssetId(null);
    }
  };



  const runAutoLink = () => {
    const updatedAssets = assets.map(asset => {
      const isReferenced = gameState.nodes.some(node => {
        const assetName = asset.name;
        if (node.label.toLowerCase().includes(assetName.toLowerCase())) return true;
        if (node.data) {
          if (node.data === assetName) return true;
          if (typeof node.data === 'object' && Object.values(node.data).some(v => v === assetName)) return true;
        }
        return false;
      });

      if (isReferenced) {
        return { ...asset, status: 'Linked', statusReason: 'Referenced in Genesis Graph' } as NexusAsset;
      }
      return { ...asset, status: 'Unlinked', statusReason: undefined } as NexusAsset;
    });
    setAssets(updatedAssets);
  };

  const handleNeuralOrchestration = async () => {
    setIsOrchestrating(true);
    setTimeout(() => setIsOrchestrating(false), 1500);
  };

  const handleGenerateSprite = async () => {
    if (!synapsePrompt) return;
    setIsGeneratingSprite(true);
    setGenerationError(null);
    setGeneratedSprite(null);

    try {
      const imageUrl = await generateSprite(synapsePrompt, synapseStyle);
      if (imageUrl) {
        setGeneratedSprite(imageUrl);
      } else {
        setGenerationError("Neural synthesis failed to produce visual data.");
      }
    } catch (e) {
      console.error(e);
      setGenerationError("Connection to Synapse Core interrupted. Check API Key.");
    } finally {
      setIsGeneratingSprite(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!echoPrompt) return;
    setIsGeneratingAudio(true);
    try {
      const context = isContextBound ? { assets, variables: projectVariables } : undefined;
      const audioUrl = await generateAudioSignal(echoPrompt, echoCategory, echoVoice, context as any);
      setGeneratedAudio(audioUrl);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleSaveToAssembler = () => {
    const isAudio = activeModule === 'ECHO';
    const nameBase = isAudio ? echoPrompt : synapsePrompt;
    const categorySuffix = isAudio ? `_${echoCategory.toLowerCase()}` : `_${synapseStyle.toLowerCase().replace(' ', '_')}`;

    const newAsset: NexusAsset = {
      id: `gen_${Date.now()}`,
      name: nameBase.slice(0, 15).trim().replace(/\s/g, '_') + categorySuffix,
      type: isAudio ? 'Audio' : 'Sprite',
      status: isAudio && isContextBound ? 'Linked' : 'Unlinked',
      path: `/generated/${isAudio ? 'audio' : 'sprites'}/${Date.now()}.${isAudio ? 'pcm' : 'png'}`,
      previewUrl: (isAudio ? generatedAudio : generatedSprite) || undefined,
      statusReason: isAudio && isContextBound ? 'Context-Bound Neural Signal' : undefined
    };

    setAssets(prev => [newAsset, ...prev]);
    setActiveModule('ASSEMBLER');
  };

  const handleSliceSprite = async () => {
    if (!generatedSprite) return;

    // Real AI-assisted sprite slicing using canvas
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const cols = 2; // Slice into 2x2 grid = 4 frames
      const rows = 2;
      const frameWidth = img.width / cols;
      const frameHeight = img.height / rows;
      const newFrames: AnimFrame[] = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const canvas = document.createElement('canvas');
          canvas.width = frameWidth;
          canvas.height = frameHeight;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.drawImage(
              img,
              col * frameWidth, row * frameHeight, // Source position
              frameWidth, frameHeight, // Source size
              0, 0, // Destination position
              frameWidth, frameHeight // Destination size
            );

            newFrames.push({
              id: `frame_${row}_${col}_${Date.now()}`,
              image: canvas.toDataURL('image/png'),
              duration: 100
            });
          }
        }
      }

      setAnimFrames(newFrames);
      setSynapseTab('ANIMATOR');
    };

    img.src = generatedSprite;
  };

  const addManualNode = (type: string, label: string, colorClass: string) => {
    const centerX = viewport.scrollLeft + viewport.clientWidth / 2;
    const centerY = viewport.scrollTop + viewport.clientHeight / 2;

    const newNode: NodePos = {
      id: `node_${Date.now()}`,
      x: centerX,
      y: centerY,
      label,
      type,
      subType: type,
      colorClass
    };
    setGameState(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.25), 2));
  };

  const handleFitToView = () => {
    setZoom(0.65);
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: CENTER - containerRef.current.clientWidth / 2,
        top: CENTER - containerRef.current.clientHeight / 2,
        behavior: 'smooth'
      });
    }
  };

  const handleRadarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const targetX = x * BOARD_SIZE;
    const targetY = y * BOARD_SIZE;

    containerRef.current.scrollTo({
      left: targetX - containerRef.current.clientWidth / 2,
      top: targetY - containerRef.current.clientHeight / 2,
      behavior: 'smooth'
    });

    setTimeout(updateViewport, 100);
  };

  const onNodeMouseDown = (e: React.MouseEvent, node: NodePos) => {
    setDraggingNode({
      id: node.id,
      startX: node.x,
      startY: node.y,
      mouseStartX: e.clientX,
      mouseStartY: e.clientY
    });
    e.stopPropagation();
  };

  const onBoardMouseMove = (e: React.MouseEvent) => {
    if (!draggingNode) return;
    const deltaX = (e.clientX - draggingNode.mouseStartX) / zoom;
    const deltaY = (e.clientY - draggingNode.mouseStartY) / zoom;
    setGameState(prev => ({
      ...prev,
      nodes: prev.nodes.map(n =>
        n.id === draggingNode.id
          ? { ...n, x: draggingNode.startX + deltaX, y: draggingNode.startY + deltaY }
          : n
      )
    }));
  };

  const onBoardMouseUp = () => setDraggingNode(null);

  const getRadarNodeColor = (colorClass: string) => {
    if (colorClass.includes('cyan')) return 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]';
    if (colorClass.includes('purple')) return 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.9)]';
    if (colorClass.includes('emerald')) return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]';
    if (colorClass.includes('pink')) return 'bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.9)]';
    if (colorClass.includes('amber')) return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]';
    if (colorClass.includes('orange')) return 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.9)]';
    if (colorClass.includes('indigo')) return 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.9)]';
    if (colorClass.includes('red')) return 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.9)]';
    if (colorClass.includes('teal')) return 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.9)]';
    return 'bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.9)]';
  };

  const sidebarCategories = [
    {
      title: 'SCENE & UI',
      icon: Layout,
      color: 'text-cyan-400',
      items: [
        { label: 'Load Scene', icon: Monitor, color: 'border-cyan-500/40 bg-cyan-500/10' },
        { label: 'Show Title Screen', icon: ImageIcon, color: 'border-cyan-500/40 bg-cyan-500/10' },
        { label: 'Show Menu', icon: ListTodo, color: 'border-cyan-500/40 bg-cyan-500/10' },
        { label: 'Hide Menu', icon: Ban, color: 'border-cyan-500/40 bg-cyan-500/10' },
        { label: 'Show Dialog', icon: MessageSquare, color: 'border-cyan-500/40 bg-cyan-500/10' },
        { label: 'Fade In', icon: Eye, color: 'border-cyan-500/40 bg-cyan-500/10' },
        { label: 'Fade Out', icon: ZapOff, color: 'border-cyan-500/40 bg-cyan-500/10' },
      ]
    },
    {
      title: 'ENTITIES',
      icon: Layers,
      color: 'text-purple-400',
      items: [
        { label: 'Spawn Entity', icon: PlusSquare, color: 'border-purple-500/40 bg-purple-500/10' },
        { label: 'Destroy Entity', icon: Trash2, color: 'border-purple-500/40 bg-purple-500/10' },
        { label: 'Move To', icon: Move, color: 'border-purple-500/40 bg-purple-500/10' },
        { label: 'Teleport', icon: Zap, color: 'border-purple-500/40 bg-purple-500/10' },
        { label: 'Set Animation', icon: Activity, color: 'border-purple-500/40 bg-purple-500/10' },
      ]
    },
    {
      title: 'PLAYER',
      icon: UserPlus,
      color: 'text-emerald-400',
      items: [
        { label: 'Spawn Player', icon: UserPlus, color: 'border-emerald-500/40 bg-emerald-500/10' },
        { label: 'Set Health', icon: Heart, color: 'border-emerald-500/40 bg-emerald-500/10' },
        { label: 'Add Score', icon: Trophy, color: 'border-emerald-500/40 bg-emerald-500/10' },
        { label: 'Give Item', icon: Gift, color: 'border-emerald-500/40 bg-emerald-500/10' },
        { label: 'Take Item', icon: Scissors, color: 'border-emerald-500/40 bg-emerald-500/10' },
        { label: 'Kill Player', icon: Skull, color: 'border-emerald-500/40 bg-emerald-500/10' },
      ]
    },
    {
      title: 'AUDIO',
      icon: Volume2,
      color: 'text-pink-400',
      items: [
        { label: 'Play Sound', icon: Volume2, color: 'border-pink-500/40 bg-pink-500/10' },
        { label: 'Play Music', icon: Music, color: 'border-pink-500/40 bg-pink-500/10' },
        { label: 'Stop Music', icon: VolumeX, color: 'border-pink-500/40 bg-pink-500/10' },
      ]
    },
    {
      title: 'CAMERA',
      icon: Camera,
      color: 'text-violet-400',
      items: [
        { label: 'Camera Follow', icon: Target, color: 'border-violet-500/40 bg-violet-500/10' },
        { label: 'Camera Shake', icon: Activity, color: 'border-violet-500/40 bg-violet-500/10' },
        { label: 'Zoom In', icon: ZoomIn, color: 'border-violet-500/40 bg-violet-500/10' },
        { label: 'Zoom Out', icon: ZoomOut, color: 'border-violet-500/40 bg-violet-500/10' },
      ]
    },
    {
      title: 'QUESTS',
      icon: Flag,
      color: 'text-blue-400',
      items: [
        { label: 'Start Quest', icon: Flag, color: 'border-blue-500/40 bg-blue-500/10' },
        { label: 'Complete Quest', icon: CheckCircle, color: 'border-blue-500/40 bg-blue-500/10' },
        { label: 'Update Objective', icon: Target, color: 'border-blue-500/40 bg-blue-500/10' },
      ]
    },
    {
      title: 'VARIABLES',
      icon: Variable,
      color: 'text-indigo-400',
      items: [
        { label: 'Set Variable', icon: Variable, color: 'border-indigo-500/40 bg-indigo-500/10' },
        { label: 'Add to Variable', icon: Plus, color: 'border-indigo-500/40 bg-indigo-500/10' },
        { label: 'Set Flag', icon: Flag, color: 'border-indigo-500/40 bg-indigo-500/10' },
      ]
    },
    {
      title: 'CONDITIONS',
      icon: HelpCircle,
      color: 'text-sky-400',
      items: [
        { label: 'Check Flag', icon: Flag, color: 'border-sky-500/40 bg-sky-500/10' },
        { label: 'Check Variable', icon: Variable, color: 'border-sky-500/40 bg-sky-500/10' },
      ]
    },
    {
      title: 'EFFECTS',
      icon: Sparkles,
      color: 'text-fuchsia-400',
      items: [
        { label: 'Spawn Particles', icon: Aperture, color: 'border-fuchsia-500/40 bg-fuchsia-500/10' },
        { label: 'Screen Flash', icon: Zap, color: 'border-fuchsia-500/40 bg-fuchsia-500/10' },
        { label: 'Slow Motion', icon: Clock, color: 'border-fuchsia-500/40 bg-fuchsia-500/10' },
        { label: 'Wait', icon: Clock, color: 'border-fuchsia-500/40 bg-fuchsia-500/10' },
      ]
    },
    {
      title: 'STORY & NARRATIVE',
      icon: MessageSquare,
      color: 'text-teal-400',
      items: [
        { label: 'Dialogue Node', icon: MessageSquare, color: 'border-teal-500/40 bg-teal-500/10' },
        { label: 'Branching Choice', icon: GitBranch, color: 'border-teal-500/40 bg-teal-500/10' },
        { label: 'Ending Node', icon: Boxes, color: 'border-teal-500/40 bg-teal-500/10' },
      ]
    },
    {
      title: 'GAME STATE',
      icon: Database,
      color: 'text-amber-400',
      items: [
        { label: 'Trust Requirement', icon: Shield, color: 'border-amber-500/40 bg-amber-500/10' },
        { label: 'Inventory Check', icon: Boxes, color: 'border-amber-500/40 bg-amber-500/10' },
        { label: 'Scenario Flag', icon: Flag, color: 'border-amber-500/40 bg-amber-500/10' },
      ]
    },
    {
      title: 'FINALE LOGIC',
      icon: CloudLightning,
      color: 'text-orange-400',
      items: [
        { label: 'AND/OR Logic Gate', icon: GitMerge, color: 'border-orange-500/40 bg-orange-500/10' },
        { label: 'Betrayal / Tragedy', icon: Swords, color: 'border-orange-500/40 bg-orange-500/10' },
        { label: 'Secret / Success', icon: Key, color: 'border-orange-500/40 bg-orange-500/10' },
      ]
    },
    {
      title: 'MUTATORS',
      icon: Dna,
      color: 'text-lime-400',
      items: [
        { label: 'Gain Trust', icon: Heart, color: 'border-lime-500/40 bg-lime-500/10' },
        { label: 'Set Story Flag', icon: Flag, color: 'border-lime-500/40 bg-lime-500/10' },
      ]
    },
    {
      title: 'COMMANDS',
      icon: Cpu,
      color: 'text-red-400',
      items: [
        { label: 'Save Progress', icon: Save, color: 'border-red-500/40 bg-red-500/10' },
        { label: 'Force Reload', icon: RefreshCcw, color: 'border-red-500/40 bg-red-500/10' },
      ]
    }
  ];

  const RadioIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" /><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" /><circle cx="12" cy="12" r="2" /><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" /><path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" /></svg>
  );

  const renderEcho = () => {
    return (
      <div className="space-y-8 flex flex-col h-[calc(100vh-140px)] animate-in slide-in-from-right-4 duration-700">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-4xl font-black font-orbitron text-white tracking-tighter flex items-center gap-4">
              <Volume2 size={40} className="text-pink-500" /> NEXGEN <span className="text-pink-500/50">SONIC</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-black tracking-[0.4em] uppercase mt-2">Neural Signal Synthesis and Mastering Lab</p>
          </div>
          <div className="flex items-center gap-4">
            {['SIGNAL_GEN', 'WAVE_EDIT', 'FX_FORGE'].map((tab) => (
              <button
                key={tab}
                onClick={() => setEchoTab(tab as EchoTab)}
                className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all ${echoTab === tab
                  ? 'bg-pink-600 text-white shadow-xl shadow-pink-600/20'
                  : 'bg-slate-900/40 text-slate-500 hover:text-slate-200 border border-white/5'
                  }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {echoTab === 'SIGNAL_GEN' && (
            <div className="h-full flex gap-8">
              <div className="w-1/3 flex flex-col gap-6">
                <div className="glass-panel p-6 rounded-3xl border border-pink-500/20 bg-pink-500/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-pink-400 uppercase tracking-widest flex items-center gap-2"><Mic size={14} /> Signal Generator</h3>
                    <button
                      onClick={() => setIsContextBound(!isContextBound)}
                      className={`p-2 rounded-lg border transition-all flex items-center gap-2 ${isContextBound ? 'bg-pink-500/10 border-pink-500/40 text-pink-400' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                      title="Bind to Project Context"
                    >
                      <LinkIcon size={14} />
                      <span className="text-[8px] font-black uppercase">Context Sync</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Audio Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['DIALOGUE', 'SFX', 'MUSIC', 'AMBIENT'] as AudioCategory[]).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setEchoCategory(cat)}
                          className={`px-3 py-2.5 rounded-xl text-[10px] font-bold border transition-all ${echoCategory === cat ? 'bg-pink-500/20 border-pink-500/40 text-pink-300' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aural Prompt</label>
                    <textarea
                      value={echoPrompt}
                      onChange={(e) => setEchoPrompt(e.target.value)}
                      placeholder={echoCategory === 'DIALOGUE' ? "Type dialogue or a conversation script..." : "Describe the sound or melody..."}
                      className="w-full h-32 bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 font-bold focus:outline-none focus:border-pink-500/50 transition-all resize-none placeholder:text-slate-700"
                    />
                  </div>

                  {echoCategory === 'DIALOGUE' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Voice Profile</label>
                      <select
                        value={echoVoice}
                        onChange={(e) => setEchoVoice(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-bold focus:outline-none"
                      >
                        <option value="Kore">Kore (Neutral Narrator)</option>
                        <option value="Puck">Puck (Fast-Paced)</option>
                        <option value="Charon">Charon (Deep/Mysterious)</option>
                        <option value="Zephyr">Zephyr (Smooth/Friendly)</option>
                      </select>
                    </div>
                  )}

                  <button
                    onClick={handleGenerateAudio}
                    disabled={isGeneratingAudio || !echoPrompt}
                    className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl font-black text-xs uppercase text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2 group"
                  >
                    {isGeneratingAudio ? <><RefreshCcw size={16} className="animate-spin" /> Synthesizing...</> : <><Sparkles size={16} className="group-hover:scale-110 transition-transform" /> Render Signal</>}
                  </button>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/10">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={14} /> Neural Audio Engine</h3>
                  <div className="space-y-3 font-mono text-[9px]">
                    <div className="flex justify-between text-slate-500 border-b border-white/5 pb-2"><span>KERNEL</span><span className="text-pink-400">GEMINI-2.5-TTS</span></div>
                    <div className="flex justify-between text-slate-500 border-b border-white/5 pb-2"><span>SAMPLING</span><span className="text-pink-400">24.0 KHZ</span></div>
                    <div className="flex justify-between text-slate-500"><span>CHANNELS</span><span className="text-cyan-400">PCM_MONO_16</span></div>
                  </div>
                </div>
              </div>

              <div className="flex-1 glass-panel rounded-[2.5rem] border border-slate-800 bg-slate-950/50 flex flex-col overflow-hidden relative group">
                <div className="flex-1 flex flex-col items-center justify-center p-12 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ec4899 1px, transparent 1px), linear-gradient(90deg, #ec4899 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                  {isGeneratingAudio ? (
                    <div className="z-10 flex flex-col items-center gap-8">
                      <div className="relative w-40 h-40">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-pink-500 border-r-purple-500 border-b-transparent border-l-transparent animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <AudioLines size={48} className="text-slate-600 animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-sm font-black uppercase tracking-[0.4em] text-white animate-pulse">Folding Waveforms...</p>
                        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{isContextBound ? 'Reading Project Metadata' : 'Pure Signal Render'}</p>
                      </div>
                    </div>
                  ) : generatedAudio ? (
                    <div className="z-10 flex flex-col items-center gap-12 w-full max-w-2xl">
                      <div className="w-full aspect-[21/9] bg-slate-900/60 backdrop-blur-3xl border border-white/5 rounded-[2rem] shadow-2xl flex items-center justify-center overflow-hidden relative">
                        <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                        <div className="flex items-center gap-1.5 h-32 w-full px-12">
                          {[...Array(64)].map((_, i) => (
                            <div key={i} className="flex-1 bg-pink-500 rounded-full transition-all duration-300 opacity-60 hover:opacity-100" style={{ height: `${20 + Math.random() * 80}%` }} />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <button className="p-4 bg-slate-900 text-white border border-white/5 rounded-full hover:bg-slate-800 transition-all"><SkipBack size={24} /></button>
                        <button className="w-20 h-20 bg-pink-500 text-slate-950 rounded-full flex items-center justify-center hover:bg-pink-400 transition-all shadow-[0_0_30px_rgba(236,72,153,0.3)]"><Play size={32} fill="currentColor" /></button>
                        <button className="p-4 bg-slate-900 text-white border border-white/5 rounded-full hover:bg-slate-800 transition-all"><SkipForward size={24} /></button>
                      </div>

                      <div className="flex gap-4">
                        <button onClick={handleSaveToAssembler} className="px-10 py-4 bg-cyan-500 text-slate-950 font-black uppercase tracking-widest rounded-2xl hover:bg-cyan-400 shadow-xl flex items-center gap-2"><Save size={20} /> Save to Assembler</button>
                        <button onClick={() => setEchoTab('WAVE_EDIT')} className="px-10 py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl border border-white/10 hover:bg-slate-800 flex items-center gap-2"><Scissors size={20} /> Fine Tune Wave</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center opacity-30 select-none space-y-6">
                      <Headphones size={80} className="mx-auto text-slate-500" />
                      <div className="space-y-2">
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Sonic Monitor Standby</p>
                        <p className="text-[10px] font-mono text-slate-600 uppercase">Input expected from Signal Generator Sub-module</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {echoTab === 'WAVE_EDIT' && (
            <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
              <div className="flex-1 glass-panel rounded-[2.5rem] border border-slate-800 bg-slate-950 flex flex-col overflow-hidden shadow-inner relative">
                <div className="h-14 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between px-8">
                  <div className="flex items-center gap-3">
                    <Waves size={18} className="text-pink-400" />
                    <span className="text-[10px] font-black text-slate-100 uppercase tracking-widest">Waveform Editor // {echoPrompt.slice(0, 20) || 'Untitled'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-1.5 bg-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-400 rounded-lg hover:text-white transition-all flex items-center gap-2"><Scissors size={12} /> Trim</button>
                    <button className="px-4 py-1.5 bg-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-400 rounded-lg hover:text-white transition-all flex items-center gap-2"><Pipette size={12} /> Normalize</button>
                    <div className="w-[1px] h-6 bg-white/5 mx-2" />
                    <button onClick={handleSaveToAssembler} className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-cyan-500/20 transition-all flex items-center gap-2"><Save size={12} /> Save Progress</button>
                  </div>
                </div>

                <div className="flex-1 flex flex-col p-12 relative overflow-hidden">
                  <div className="flex-1 bg-slate-900/40 rounded-[2.5rem] border border-white/5 relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    <div className="flex items-center gap-[1px] h-48 w-full px-16 group/wave cursor-col-resize">
                      {[...Array(200)].map((_, i) => (
                        <div key={i} className="flex-1 bg-pink-500/60 group-hover/wave:bg-pink-500 rounded-full transition-all" style={{ height: `${10 + Math.random() * 90}%` }} />
                      ))}
                      <div className="absolute left-1/3 top-0 bottom-0 w-[2px] bg-cyan-400 z-10 shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                    </div>
                  </div>
                </div>

                <div className="h-24 border-t border-white/5 bg-slate-900/40 flex items-center px-12 gap-10">
                  <div className="flex items-center gap-4">
                    <button className="p-3 bg-slate-950 border border-white/5 rounded-xl text-slate-500 hover:text-white"><SkipBack size={20} /></button>
                    <button className="w-16 h-16 bg-pink-500 text-slate-950 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform"><Play size={28} fill="currentColor" /></button>
                    <button className="p-3 bg-slate-950 border border-white/5 rounded-xl text-slate-500 hover:text-white"><SkipForward size={20} /></button>
                  </div>
                  <div className="flex-1 h-3 bg-slate-950 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                    <div className="h-full bg-gradient-to-r from-pink-600 to-purple-600 w-1/3 shadow-[0_0_20px_rgba(236,72,153,0.4)]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {echoTab === 'FX_FORGE' && (
            <div className="h-full grid grid-cols-4 gap-6 animate-in fade-in duration-500">
              <div className="col-span-3 glass-panel rounded-[2.5rem] border border-slate-800 bg-slate-950/40 p-12 flex flex-col gap-12 overflow-y-auto custom-scrollbar">
                <header className="flex justify-between items-center border-b border-white/5 pb-6">
                  <h3 className="text-lg font-black text-white uppercase tracking-[0.2em] flex items-center gap-3"><Sliders size={20} className="text-pink-500" /> FX Mastery Rack</h3>
                </header>

                <div className="grid grid-cols-2 gap-16">
                  {[
                    { label: 'Reverb (Space)', val: audioFx.reverb, key: 'reverb', color: 'bg-pink-500', desc: 'Simulates spatial resonance' },
                    { label: 'Echo (Temporal)', val: audioFx.echo, key: 'echo', color: 'bg-cyan-500', desc: 'Adds rhythmic delay loops' },
                    { label: 'Saturation (Heat)', val: audioFx.distortion, key: 'distortion', color: 'bg-amber-500', desc: 'Warm harmonics and grit' },
                    { label: 'Gain (Power)', val: audioFx.gain, key: 'gain', color: 'bg-white', desc: 'Signal amplitude multiplier' },
                  ].map((fx) => (
                    <div key={fx.key} className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{fx.label}</h4>
                          <p className="text-[9px] text-slate-500 uppercase mt-0.5 tracking-tighter">{fx.desc}</p>
                        </div>
                        <span className="text-[11px] font-mono text-pink-400 font-bold">{fx.val}%</span>
                      </div>
                      <div
                        className="h-3 w-full bg-slate-900 rounded-full border border-white/5 relative group cursor-pointer overflow-hidden shadow-inner"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const percent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                          setAudioFx(prev => ({ ...prev, [fx.key]: percent }));
                        }}
                      >
                        <div className={`h-full ${fx.color} transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)]`} style={{ width: `${fx.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex-1 flex flex-col gap-6 pt-6 border-t border-white/5">
                  <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Ear size={14} /> Multi-Band Spectral Balancer</h3>
                  <div className="flex-1 flex items-end gap-3 px-6 py-8 bg-slate-900/20 rounded-[2rem] border border-white/5 min-h-[200px]">
                    {[...Array(24)].map((_, i) => (
                      <div key={i} className="flex-1 bg-slate-900 border border-white/5 rounded-t-lg relative group h-full cursor-pointer hover:border-pink-500/40">
                        <div className="absolute bottom-0 left-0 right-0 bg-pink-500/20 group-hover:bg-pink-500/60 transition-all rounded-t-lg" style={{ height: `${15 + Math.random() * 70}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-900/10 p-8 flex flex-col gap-6 flex-1">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Music2 size={16} /> Acoustic Profile</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Cold Corridor', icon: Activity },
                      { name: 'Vibrant Arena', icon: Zap },
                      { name: 'Sub-Zero Static', icon: Shield },
                    ].map((p, i) => (
                      <button
                        key={i}
                        className="w-full text-left p-4 rounded-2xl border border-white/5 bg-slate-950/40 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:border-pink-500/30 hover:text-white transition-all flex items-center justify-between group"
                      >
                        <span className="flex items-center gap-3"><p.icon size={14} className="group-hover:text-pink-400" /> {p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-900/10 p-8 space-y-4">
                  <button onClick={handleSaveToAssembler} className="w-full py-4 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-500 shadow-xl transition-all flex items-center justify-center gap-2"><CheckCircle size={18} /> Master & Save to Assembler</button>
                  <p className="text-[9px] text-center text-slate-600 font-bold uppercase tracking-widest italic leading-relaxed">Changes will be master-rendered into the project library.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSynapseGenerator = () => {
    return (
      <div className="h-full flex gap-8 animate-in fade-in duration-500">
        {/* Controls Section */}
        <div className="w-1/3 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 bg-purple-500/5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Wand2 size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black font-orbitron text-white uppercase tracking-tight">SYNAPSE <span className="text-purple-400">GEN</span></h2>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Neural 2D Sprite Synthesis</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sprite Description</label>
              <textarea
                value={synapsePrompt}
                onChange={(e) => setSynapsePrompt(e.target.value)}
                placeholder="E.g. A futuristic cyber-ninja holding a glowing katana..."
                className="w-full h-32 bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 font-bold focus:outline-none focus:border-purple-500/50 transition-all resize-none placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Art Style</label>
              <div className="grid grid-cols-2 gap-2">
                {['Pixel Art', 'Vector Flat', 'Hand Drawn', 'Cyberpunk/Neon', 'Isometric'].map((style) => (
                  <button
                    key={style}
                    onClick={() => setSynapseStyle(style as SpriteStyle)}
                    className={`px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${synapseStyle === style
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                      : 'bg-slate-950/30 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateSprite}
              disabled={isGeneratingSprite || !synapsePrompt}
              className="w-full py-4 mt-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-black text-xs uppercase tracking-[0.2em] text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2 group"
            >
              {isGeneratingSprite ? <><RefreshCcw size={16} className="animate-spin" /> Synthesizing...</> : <><Sparkles size={16} /> Generate Sprite</>}
            </button>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/10">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={14} /> Neural Logs</h3>
            <div className="space-y-3 font-mono text-[9px]">
              <div className="flex justify-between text-slate-500 border-b border-white/5 pb-2"><span>MODEL_CORE</span><span className="text-purple-400">GEMINI-2.5-FLASH-IMG</span></div>
              <div className="flex justify-between text-slate-500"><span>LATENCY</span><span className="text-emerald-400">12ms</span></div>
            </div>
          </div>
        </div>

        {/* Viewport Section */}
        <div className="flex-1 glass-panel rounded-[2.5rem] border border-slate-800 bg-slate-950/50 flex flex-col overflow-hidden relative group">
          <div className="flex-1 flex items-center justify-center relative p-12">
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {isGeneratingSprite ? (
              <div className="flex flex-col items-center gap-6 z-10">
                <div className="relative w-32 h-32"><div className="absolute inset-0 rounded-full border-4 border-slate-800" /><div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin" /></div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Constructing Neural Geometry...</p>
              </div>
            ) : generatedSprite ? (
              <div className="relative z-10 group/img">
                <div className="relative rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                  <img src={generatedSprite} alt="Generated Sprite" className="max-h-[500px] object-contain" />
                </div>
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover/img:opacity-100 group-hover/img:bottom-4 transition-all duration-300">
                  <button onClick={handleSaveToAssembler} className="px-6 py-3 bg-cyan-500 text-slate-950 font-black uppercase tracking-widest rounded-xl hover:bg-cyan-400 shadow-xl flex items-center gap-2"><Save size={18} /> Save</button>
                  <button onClick={handleSliceSprite} className="px-6 py-3 bg-purple-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-purple-500 shadow-xl flex items-center gap-2"><Grid3X3 size={18} /> Slice AI</button>
                </div>
              </div>
            ) : (
              <div className="text-center opacity-30 select-none">
                <ImageIcon size={64} className="mx-auto mb-4 text-slate-500" />
                <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Viewport Empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSynapseEditor = () => {
    return (
      <div className="h-full flex gap-8 animate-in fade-in duration-500">
        {/* Toolset */}
        <div className="w-20 glass-panel rounded-full border border-slate-800 bg-slate-900/10 flex flex-col items-center py-8 gap-6">
          {[
            { icon: MousePointer2, label: 'Select' },
            { icon: Paintbrush, label: 'Paint' },
            { icon: Eraser, label: 'Erase' },
            { icon: Pipette, label: 'Pick' },
            { icon: Scissors, label: 'Crop' },
            { icon: Grid3X3, label: 'Slice' }
          ].map((tool, i) => (
            <button key={i} className={`p-3 rounded-full transition-all ${i === 1 ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
              <tool.icon size={20} />
            </button>
          ))}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 glass-panel rounded-[2.5rem] border border-slate-800 bg-slate-950 flex flex-col overflow-hidden relative">
          <div className="flex-1 flex items-center justify-center p-12 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-80">
            <div className="w-[512px] h-[512px] border-2 border-white/5 shadow-2xl relative bg-slate-900/40 backdrop-blur-3xl overflow-hidden rounded-xl">
              <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
              {generatedSprite && <img src={generatedSprite} className="w-full h-full object-contain p-8" />}
            </div>
          </div>

          {/* Editor Footer */}
          <div className="h-16 border-t border-white/5 bg-slate-900/60 backdrop-blur-xl px-10 flex items-center justify-between">
            <div className="flex gap-4">
              <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"><Maximize2 size={12} /> Canvas Size</button>
              <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"><Layers2 size={12} /> Layers</button>
            </div>
            <div className="flex gap-4">
              <button onClick={handleSaveToAssembler} className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-2"><Save size={14} /> Commit Changes</button>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-80 glass-panel rounded-3xl border border-slate-800 p-6 space-y-8 bg-slate-900/10">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Aperture size={14} /> Quantum Properties</h3>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Opacity</label>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 w-[100%]" /></div>
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Saturation</label>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[70%]" /></div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-[8px] font-mono text-slate-600 uppercase">File Info // PNG_RGBA_1024</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSynapseAnimator = () => {
    return (
      <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
        <div className="flex-1 flex gap-8">
          {/* Preview Viewport */}
          <div className="flex-1 glass-panel rounded-[2.5rem] border border-slate-800 bg-slate-950 flex flex-col overflow-hidden relative">
            <div className="flex-1 flex items-center justify-center relative p-12 overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              <div className="relative z-10 p-20 bg-slate-900/20 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl">
                {animFrames.length > 0 ? (
                  <img src={animFrames[currentFrameIndex].image} className="max-h-[300px] object-contain" />
                ) : (
                  <p className="text-slate-600 font-black uppercase tracking-widest">Add frames to begin</p>
                )}
              </div>
              <div className="absolute bottom-8 right-8 flex flex-col gap-2">
                <button className="p-3 bg-slate-900 border border-white/5 rounded-full text-slate-500 hover:text-cyan-400"><Monitor size={20} /></button>
                <button className="p-3 bg-slate-900 border border-white/5 rounded-full text-slate-500 hover:text-cyan-400"><Camera size={20} /></button>
              </div>
            </div>

            {/* Player Controls Overlay */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-3xl border border-white/10 px-8 py-3 rounded-2xl flex items-center gap-8 shadow-2xl">
              <div className="flex items-center gap-4">
                <button onClick={() => setCurrentFrameIndex(prev => (prev - 1 + animFrames.length) % animFrames.length)} className="text-slate-400 hover:text-white"><SkipBack size={20} /></button>
                <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 bg-cyan-500 text-slate-950 rounded-full flex items-center justify-center hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20">
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>
                <button onClick={() => setCurrentFrameIndex(prev => (prev + 1) % animFrames.length)} className="text-slate-400 hover:text-white"><SkipForward size={20} /></button>
              </div>
              <div className="h-8 w-[1px] bg-white/10" />
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">FPS Limit</span>
                  <input type="number" value={fps} onChange={(e) => setFps(parseInt(e.target.value))} className="bg-transparent border-none text-xs font-black text-cyan-400 focus:outline-none w-12" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Current Frame</span>
                  <span className="text-xs font-black text-white">{currentFrameIndex + 1} / {animFrames.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Export/Settings */}
          <div className="w-80 glass-panel rounded-3xl border border-slate-800 p-6 flex flex-col gap-6 bg-slate-900/10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><RefreshCcw size={14} /> Sequence Data</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl">
                <span className="text-[9px] font-bold text-slate-600 uppercase">Loop Mode</span>
                <p className="text-xs font-black text-slate-300 mt-1">Continuous Ping-Pong</p>
              </div>
              <button onClick={handleSaveToAssembler} className="w-full py-4 bg-cyan-500 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-cyan-400 shadow-xl flex items-center justify-center gap-2"><Save size={16} /> Save Animation</button>
              <button className="w-full py-4 bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-700 flex items-center justify-center gap-2"><Download size={16} /> Export JSON</button>
            </div>
          </div>
        </div>

        {/* Timeline Suite */}
        <div className="h-48 glass-panel rounded-3xl border border-slate-800 bg-slate-900/20 p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Timeline // Chronos Motion</span>
            <div className="flex gap-2">
              <button onClick={() => handleSliceSprite()} className="text-[9px] font-black text-cyan-400 uppercase tracking-widest hover:text-cyan-300">+ Add Frames</button>
            </div>
          </div>
          <div className="flex-1 flex gap-2 overflow-x-auto custom-scrollbar pb-2">
            {animFrames.map((frame, i) => (
              <div key={i} onClick={() => setCurrentFrameIndex(i)} className={`h-full aspect-square flex-shrink-0 border-2 rounded-xl transition-all cursor-pointer relative group ${currentFrameIndex === i ? 'border-cyan-500 scale-105 shadow-xl bg-cyan-500/5' : 'border-white/5 bg-slate-950/40 hover:border-white/20'}`}>
                <img src={frame.image} className="w-full h-full object-contain p-2" />
                <span className="absolute bottom-1 right-2 text-[8px] font-black text-slate-600 group-hover:text-cyan-500">{i + 1}</span>
              </div>
            ))}
            {animFrames.length === 0 && (
              <div className="flex-1 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-700 uppercase tracking-widest">No Frames Loaded</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSynapseRigging = () => {
    return (
      <div className="h-full flex gap-8 animate-in fade-in duration-500">
        <div className="w-80 glass-panel rounded-3xl border border-slate-800 p-6 flex flex-col gap-8 bg-slate-900/10">
          <header className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest">Bone Hierarchy</h3>
            <button className="p-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20"><Plus size={14} /></button>
          </header>
          <div className="space-y-2 font-mono text-[10px]">
            {['Root', 'Spine', 'Neck', 'Head', 'Arm_L', 'Arm_R'].map((bone, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-950/40 border border-white/5 rounded-lg text-slate-400 hover:text-purple-400 transition-all cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="uppercase tracking-widest">{bone}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 glass-panel rounded-[2.5rem] border border-slate-800 bg-slate-950 flex flex-col overflow-hidden relative">
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            <div className="relative text-center space-y-8 max-w-lg opacity-20">
              <BoneIcon size={120} className="mx-auto text-purple-400 animate-pulse" />
              <h2 className="text-2xl font-black text-white uppercase tracking-widest">BONE FORGE <span className="text-purple-500">SYSTEM</span></h2>
              <p className="text-xs text-slate-400 font-mono leading-loose uppercase">Kinematics Sub-system is currently in standby. Rigging logic will be activated once a valid bone-structure is defined for the target sprite.</p>
            </div>
          </div>
          <div className="h-16 border-t border-white/5 bg-slate-900/60 backdrop-blur-xl px-10 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest"><Shield size={16} /> IK Engine Ready</div>
            <button className="px-8 py-2 bg-slate-800 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-not-allowed">Initialize Rig</button>
          </div>
        </div>
      </div>
    );
  };

  const renderSynapse = () => {
    return (
      <div className="space-y-8 flex flex-col h-[calc(100vh-140px)] animate-in slide-in-from-right-4 duration-700">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-4xl font-black font-orbitron text-white tracking-tighter flex items-center gap-4">
              <Sparkles size={40} className="text-purple-400" /> SYNAPSE <span className="text-purple-500/50">LABS</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-black tracking-[0.4em] uppercase mt-2">Neural Asset Generation and Animation Suite</p>
          </div>
          <div className="flex items-center gap-4">
            {['GENERATOR', 'EDITOR', 'ANIMATOR', 'RIGGING'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSynapseTab(tab as SynapseTab)}
                className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all ${synapseTab === tab
                  ? 'bg-purple-600 text-white shadow-xl shadow-purple-600/20'
                  : 'bg-slate-900/40 text-slate-500 hover:text-slate-200 border border-white/5'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {synapseTab === 'GENERATOR' && renderSynapseGenerator()}
          {synapseTab === 'EDITOR' && renderSynapseEditor()}
          {synapseTab === 'ANIMATOR' && renderSynapseAnimator()}
          {synapseTab === 'RIGGING' && renderSynapseRigging()}
        </div>
      </div>
    );
  };

  const renderVisualLogic = () => {
    return (
      <div className="flex h-full gap-6 animate-in fade-in duration-700 overflow-hidden">
        {/* Node Library */}
        <div className="w-80 glass-panel rounded-3xl border border-slate-800 p-6 flex flex-col gap-8 bg-slate-900/10 overflow-y-auto custom-scrollbar">
          {sidebarCategories.map((cat, i) => (
            <div key={i} className="space-y-4">
              <h3 className={`text-[10px] font-black tracking-[0.2em] flex items-center gap-2 ${cat.color} uppercase`}>
                <cat.icon size={14} />
                {cat.title}
              </h3>
              <div className="space-y-1.5">
                {cat.items.map((item, j) => (
                  <button
                    key={j}
                    onClick={() => addManualNode(cat.title, item.label, item.color)}
                    className="w-full flex items-center gap-3 p-2.5 bg-slate-950/20 border border-slate-800/50 rounded-xl hover:border-slate-600 hover:bg-slate-900/60 transition-all text-left group"
                  >
                    <div className="p-1.5 rounded-lg border border-white/5 text-slate-400 group-hover:text-white">
                      <item.icon size={12} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200 uppercase tracking-tight truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* The Board Workspace */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2">
              <GitMerge size={14} className="text-cyan-400" />
              <span className="text-[10px] font-black text-slate-200 tracking-[0.2em] uppercase">Synapse Graph</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800 rounded-xl p-1 mr-4">
                <button onClick={() => handleZoom(-0.1)} className="p-1.5 text-slate-500 hover:text-white rounded-lg"><ZoomOut size={14} /></button>
                <span className="text-[9px] font-mono text-slate-500 w-10 text-center uppercase">{Math.round(zoom * 100)}%</span>
                <button onClick={() => handleZoom(0.1)} className="p-1.5 text-slate-500 hover:text-white rounded-lg"><ZoomIn size={14} /></button>
                <div className="w-[1px] h-4 bg-slate-800 mx-1" />
                <button onClick={handleFitToView} className="p-1.5 text-cyan-500 hover:text-white flex items-center gap-1.5 px-2"><Focus size={14} /><span className="text-[8px] font-black uppercase">Fit</span></button>
              </div>
              <button onClick={handleNeuralOrchestration} className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-xl text-[9px] font-black tracking-widest uppercase hover:bg-purple-600/30 transition-all flex items-center gap-2">
                <Sparkles size={14} /> Generate from Assets ({assets.length})
              </button>
              <button onClick={() => setGameState(prev => ({ ...prev, nodes: [] }))} className="px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl text-[9px] font-black tracking-widest uppercase hover:bg-red-600/30 flex items-center gap-2">
                <Trash2 size={14} /> Clear
              </button>
              <button className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black tracking-widest uppercase hover:bg-emerald-500 shadow-lg flex items-center gap-2">
                <Save size={14} /> Save
              </button>
            </div>
          </div>

          <div className="flex-1 glass-panel rounded-[2.5rem] border border-slate-800 relative overflow-hidden bg-[#020617] shadow-inner select-none">
            {/* Viewport Container */}
            <div
              ref={containerRef}
              onScroll={updateViewport}
              onMouseMove={onBoardMouseMove}
              onMouseUp={onBoardMouseUp}
              onMouseLeave={onBoardMouseUp}
              className={`absolute inset-0 overflow-scroll custom-scrollbar ${draggingNode ? 'cursor-grabbing' : 'cursor-default'}`}
            >
              {/* Virtual Infinite Canvas */}
              <div
                className="relative"
                style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
              >
                {/* Background Grid */}
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
                    backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
                  }}
                />

                {/* Nodes Container */}
                <div
                  className="absolute inset-0 origin-center transition-transform duration-75"
                  style={{ transform: `scale(${zoom})` }}
                >
                  {gameState.nodes.map((node) => (
                    <div
                      key={node.id}
                      onMouseDown={(e) => onNodeMouseDown(e, node)}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className={`absolute group z-20 ${draggingNode?.id === node.id ? 'z-50' : ''} ${hoveredNodeId && hoveredNodeId !== node.id ? 'opacity-40 blur-[0.5px]' : 'opacity-100'}`}
                      style={{ left: node.x - 120, top: node.y - 80 }} // Offset to center on coordinate
                    >
                      <div className={`w-60 bg-slate-900/95 backdrop-blur-3xl border rounded-2xl p-4 shadow-2xl transition-all cursor-grab active:cursor-grabbing ${node.colorClass || 'border-slate-800'} ${draggingNode?.id === node.id ? 'scale-[1.05] border-white/40 ring-4 ring-cyan-500/10' : 'hover:border-white/20'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-500">{node.type}</span>
                        </div>
                        <h4 className="font-bold text-[11px] text-slate-100 truncate mb-4 uppercase tracking-tighter">{node.label}</h4>
                        <div className="flex justify-between items-center -mx-4 relative">
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-white/10 -ml-1.5 flex items-center justify-center"><div className="w-0.5 h-0.5 rounded-full bg-cyan-400" /></div>
                          <div className="flex-1 border-t border-white/5 mx-2" />
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-white/10 -mr-1.5 flex items-center justify-center"><div className="w-0.5 h-0.5 rounded-full bg-emerald-400" /></div>
                        </div>
                        <div className="mt-4 flex items-center gap-1.5">
                          <div className={`w-1 h-1 rounded-full ${draggingNode?.id === node.id ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                          <span className="text-[7px] font-mono text-slate-600 uppercase tracking-widest">ID: {node.id.slice(-4)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SYNAPSE RADAR */}
            <div className="absolute bottom-8 right-8 z-30">
              <div className="bg-slate-950/80 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 shadow-2xl w-52">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Compass size={12} className="text-cyan-400 animate-spin-slow" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">Radar</span>
                  </div>
                  <span className="text-[8px] font-mono text-slate-600 uppercase">Nodes: {gameState.nodes.length}</span>
                </div>

                <div
                  onClick={handleRadarClick}
                  className="relative bg-slate-950/50 rounded-lg border border-white/5 aspect-square overflow-hidden cursor-crosshair group/radar"
                >
                  <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '10% 10%' }} />

                  {/* Radar Node Dots */}
                  {gameState.nodes.map(node => (
                    <div
                      key={node.id}
                      className={`absolute w-1.5 h-1.5 rounded-full pointer-events-none z-10 ${getRadarNodeColor(node.colorClass)}`}
                      style={{
                        left: `${(node.x / BOARD_SIZE) * 100}%`,
                        top: `${(node.y / BOARD_SIZE) * 100}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  ))}

                  {/* Viewport Indicator */}
                  {viewport.clientWidth > 0 && (
                    <div
                      className="absolute border border-cyan-500/60 bg-cyan-500/10 transition-all pointer-events-none ring-1 ring-cyan-500/20"
                      style={{
                        left: `${(viewport.scrollLeft / BOARD_SIZE) * 100}%`,
                        top: `${(viewport.scrollTop / BOARD_SIZE) * 100}%`,
                        width: `${(viewport.clientWidth / zoom / BOARD_SIZE) * 100}%`,
                        height: `${(viewport.clientHeight / zoom / BOARD_SIZE) * 100}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGenesis = () => {
    return (
      <div className="space-y-8 flex flex-col h-[calc(100vh-140px)] animate-in slide-in-from-right-4 duration-700">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-4xl font-black font-orbitron text-white tracking-tighter flex items-center gap-4">
              <Workflow size={40} className="text-cyan-500" /> GENESIS <span className="text-cyan-500/50">ENGINE</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-black tracking-[0.4em] uppercase mt-2">Game Rules, Logic Systems, and Engine Deployment</p>
          </div>
          <div className="flex items-center gap-4">
            {([
              { id: 'QUEST', label: 'QUESTS & NARRATIVE' },
              { id: 'LOGIC', label: 'LOGIC BOARD' },
              { id: 'DEPLOY', label: 'DEPLOY' }
            ] as { id: GenesisTab, label: string }[]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setGenesisTab(tab.id)}
                className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all ${genesisTab === tab.id
                  ? 'bg-cyan-600 text-white shadow-xl shadow-cyan-600/20'
                  : 'bg-slate-900/40 text-slate-500 hover:text-slate-200 border border-white/5'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {genesisTab === 'QUEST' && renderQuestEditor()}
          {genesisTab === 'LOGIC' && renderVisualLogic()}
          {genesisTab === 'DEPLOY' && <Airlock gameState={gameState} assets={assets} />}
        </div>
      </div>
    );
  };

  const renderQuestEditor = () => {
    return (
      <div className="flex h-full gap-6 animate-in fade-in duration-700">
        {/* Quest List */}
        <div className="w-80 glass-panel rounded-3xl border border-slate-800 p-6 flex flex-col gap-4 bg-slate-900/10">
          <header className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest">Active Quests</h3>
            <button className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20"><Plus size={14} /></button>
          </header>
          <div className="space-y-3">
            {[
              { title: 'The Awakened Protocol', status: 'Active', progress: 45 },
              { title: 'Cyber-Psychosis', status: 'Pending', progress: 0 },
              { title: 'Neural Leakage', status: 'Completed', progress: 100 },
            ].map((q, i) => (
              <div key={i} className={`p-4 rounded-xl border ${i === 0 ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-slate-900/40 border-slate-800'} cursor-pointer hover:border-cyan-500/30 transition-all`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`text-xs font-bold uppercase tracking-wide ${i === 0 ? 'text-cyan-400' : 'text-slate-400'}`}>{q.title}</h4>
                  {q.status === 'Completed' && <CheckCircle size={12} className="text-emerald-500" />}
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${q.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 glass-panel rounded-3xl border border-slate-800 p-8 flex flex-col gap-6 bg-slate-900/10 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start border-b border-white/5 pb-6">
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">The Awakened Protocol</h2>
              <p className="text-xs text-slate-500 font-mono mt-2 uppercase">ID: Q_MAIN_01 // TYPE: MAIN_STORY</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">In Progress</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quest Description</label>
              <textarea className="w-full h-32 bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500/50" defaultValue="The player must locate the missing android unit within the Neon Slums sector and retrieve the corrupted memory core." />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rewards</label>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400"><Gift size={16} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-300">Credits</p>
                    <p className="text-[10px] text-slate-500">5000 CR</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-900/40 border border-slate-800/50 rounded-xl border-dashed">
                  <div className="w-8 h-8 rounded flex items-center justify-center text-slate-600"><Plus size={16} /></div>
                  <p className="text-xs font-bold text-slate-600 uppercase">Add Reward</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Objective Flow</label>
            {[
              { step: 1, text: 'Travel to Sector 7', done: true },
              { step: 2, text: 'Speak to the Informant', done: true },
              { step: 3, text: 'Locate the Android', done: false },
              { step: 4, text: 'Extract Memory Core', done: false },
            ].map((obj, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-slate-950/30 border border-slate-800 rounded-xl">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${obj.done ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600 text-transparent'}`}>
                  <CheckCircle size={14} fill={obj.done ? "currentColor" : "none"} className={obj.done ? "text-slate-950" : ""} />
                </div>
                <input type="text" defaultValue={obj.text} className={`bg-transparent border-none focus:outline-none flex-1 text-sm font-bold ${obj.done ? 'text-slate-500 line-through' : 'text-slate-200'}`} />
                <MoreVertical size={16} className="text-slate-600" />
              </div>
            ))}
            <button className="w-full py-3 bg-slate-900/50 border border-slate-800 border-dashed rounded-xl text-slate-500 text-xs font-bold uppercase hover:bg-slate-900 hover:text-slate-300 transition-all">+ Add Objective</button>
          </div>
        </div>
      </div>
    );
  };

  const renderAssembler = () => {
    return (
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 h-full flex flex-col">
        <div className="flex items-center justify-between bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
              <Database size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black font-orbitron tracking-tight text-white uppercase">Assembler <span className="text-cyan-500/50">// Asset Pipeline</span></h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1">Resource indexing, binding, and metadata optimization</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleNeuralOrchestration}
              disabled={isOrchestrating || assets.length === 0}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-xl ${isOrchestrating || assets.length === 0 ? 'bg-slate-800 text-slate-600' : 'bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:bg-purple-600/30'
                }`}
            >
              {isOrchestrating ? <RefreshCcw size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {isOrchestrating ? 'Linking...' : 'AI Neural Link'}
            </button>
            <button
              onClick={runAutoLink}
              disabled={assets.length === 0}
              className="flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30"
            >
              <Link size={16} />
              Quick Link
            </button>
            <button
              onClick={scanDirectory}
              disabled={isScanning}
              className={`flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-xl ${isScanning ? 'bg-slate-800 text-slate-600' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-500/10'
                }`}
            >
              {isScanning ? <RefreshCcw size={16} className="animate-spin" /> : <Search size={16} />}
              {isScanning ? 'Scanning...' : 'Scan for Assets'}
            </button>
          </div>
        </div>

        {/* Asset Stats Bar */}
        {assets.length > 0 && (
          <div className="flex items-center gap-6 px-4">
            <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-900/60 border border-white/5 rounded-xl">
              <Database size={14} className="text-cyan-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{assets.length}</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Total Assets</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="flex items-center gap-4">
              {[
                { type: 'Sprite', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
                { type: 'Audio', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
                { type: 'Data', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { type: 'Logic', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
              ].map(cat => {
                const count = assets.filter(a => a.type === cat.type).length;
                if (count === 0) return null;
                return (
                  <div key={cat.type} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${cat.bg}`}>
                    <span className={`text-[11px] font-black ${cat.color}`}>{count}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{cat.type}s</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 bg-slate-950/20 rounded-[2.5rem] border border-white/5 p-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-20">
            {assets.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                isEditing={editingAssetId === asset.id}
                editNameValue={editNameValue}
                setEditNameValue={setEditNameValue}
                startEdit={() => { setEditingAssetId(asset.id); setEditNameValue(asset.name); }}
                saveEdit={saveRename}
              />
            ))}
            {assets.length === 0 && (
              <div className="col-span-full h-full flex flex-col items-center justify-center opacity-20 py-20">
                <HardDrive size={64} />
                <p className="mt-4 font-black uppercase tracking-[0.4em] text-xs">Repository Exhausted</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'ASSEMBLER': return renderAssembler();
      case 'GENESIS':
        return renderGenesis();
      case 'SYNAPSE': return renderSynapse();
      case 'ECHO': return renderEcho();
      case 'NOVA':
        return <NovaEngine gameState={gameState} updateGameState={setGameState} />;
      case 'ATLAS':
        return <AtlasUI />;
      case 'AIRLOCK':
        return <Airlock gameState={gameState} assets={assets} />;
      default:
        return <div className="p-20 text-center opacity-20 h-full flex flex-col items-center justify-center gap-4"><Activity size={48} /><p className="font-black uppercase tracking-[0.4em]">SUBSYSTEM OFF-LINE</p></div>;
    }
  };

  return (
    <div className="flex h-full w-full">
      <aside className="w-64 flex flex-col gap-6 bg-[#020617]/80 backdrop-blur-3xl border-r border-slate-800/50 z-20">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-xl"><BrainCircuit size={24} /></div>
            <div><h2 className="text-sm font-black font-orbitron text-white tracking-widest uppercase">NEXGEN ENGINE</h2><p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Core Engine Workspace</p></div>
          </div>
        </div>
        <nav className="p-4 flex flex-col gap-1.5 flex-1 overflow-y-auto custom-scrollbar">
          {[
            { id: 'ASSEMBLER', label: 'ASSEMBLER', icon: Database, desc: 'Asset Pipeline' },
            { id: 'SYNAPSE', label: 'SYNAPSE', icon: Sparkles, desc: 'AI Sprite Labs' },
            { id: 'ECHO', label: 'ECHO', icon: Volume2, desc: 'Sonic Signal Lab' },
            { id: 'GENESIS', label: 'GENESIS', icon: Workflow, desc: 'Logic Engine' },
            { id: 'NOVA', label: 'NOVA', icon: Cpu, desc: 'Game Runtime' },
            { id: 'ATLAS', label: 'ATLAS', icon: Layout, desc: 'UI Design Lab' },
            { id: 'AIRLOCK', label: 'AIRLOCK', icon: Rocket, desc: 'Cloud Deploy' },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveModule(item.id as NexusModule)} className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group relative overflow-hidden ${activeModule === item.id ? 'bg-cyan-500 text-slate-950 shadow-2xl' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}>
              <item.icon size={20} />
              <div className="text-left"><p className="text-[11px] font-black uppercase tracking-widest">{item.label}</p><p className="text-[8px] font-bold uppercase tracking-tighter opacity-70">{item.desc}</p></div>
              {activeModule === item.id && <div className="absolute right-0 top-0 bottom-0 w-1 bg-white opacity-40" />}
            </button>
          ))}
        </nav>
      </aside>
      <div className="flex-1 p-10 overflow-y-auto custom-scrollbar"><div className="max-w-7xl mx-auto h-full">{renderModule()}</div></div>
    </div>
  );
};

export default NexusPlugin;
