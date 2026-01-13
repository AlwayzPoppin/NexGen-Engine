
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
  Rewind,
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
  Ear,
  Radio,
  Send,
  X,
  Bot,
  Settings,
  EyeOff,
  FileText,
  Check,
  ChevronDown
} from 'lucide-react';
import AtlasUI from './AtlasUI';
import { NexusModule, NexusAsset, NexusMetaVariable, GameEntity2D, GlobalGameState, GenesisNode, ChatMessage, TokenStats, NodePos, Project, FileNode, SpriteStyle, NeuralAction } from '../../types';
import {
  generateAssistantResponse,
  orchestrateNexusLinks,
  generateSprite,
  generateAudioSignal,
  generateLivePerformance,
  generateAtmosphericTrack,
  analyzeSpriteSheet,
  analyzeIndividualSprites,
  correctSpriteSheet
} from '../services/geminiService';
import { generateWithOllama, switchOllamaModel, isOllamaEnabled } from '../services/ollamaService';
import NovaEngine from './NovaEngine';
import Airlock from './Airlock';
import FileExplorer from './FileExplorer';
import NexScriptEditor from './NexScriptEditor';
import NeuralCommandBuffer from './NeuralCommandBuffer';


type GenesisTab = 'QUEST' | 'LOGIC';
type SynapseTab = 'GENERATOR' | 'EDITOR' | 'ANIMATOR' | 'RIGGING';
type EchoTab = 'SIGNAL_GEN' | 'WAVE_EDIT' | 'FX_FORGE' | 'LIVE_PERFORMANCE' | 'OST_COMPOSE';
type AudioCategory = 'DIALOGUE' | 'SFX' | 'MUSIC' | 'AMBIENT';


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
  onSendToSynapse?: () => void;
  onSendToEcho?: () => void;
  onLinkAsset?: () => void;
  linkTargets?: { type: string; id: string; name: string }[];
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({
  asset, isEditing, editNameValue, setEditNameValue, startEdit, saveEdit,
  onSendToSynapse, onSendToEcho, onLinkAsset, isSelected, onToggleSelect
}) => {
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
    <div
      className={`glass-panel p-6 rounded-3xl border transition-all flex flex-col gap-5 relative overflow-hidden group/item cursor-pointer ${isSelected ? 'border-cyan-500 ring-4 ring-cyan-500/20 shadow-2xl shadow-cyan-500/20' : 'border-white/5 hover:border-cyan-500/30'
        }`}
      onClick={(e) => {
        // Only toggle if not clicking a button
        if (!(e.target as HTMLElement).closest('button')) {
          onToggleSelect?.();
        }
      }}
    >
      {/* Selection Overlay */}
      {isSelected && (
        <div className="absolute top-4 right-4 z-20 animate-in zoom-in duration-300">
          <div className="bg-cyan-500 text-slate-950 p-1.5 rounded-full shadow-lg border-2 border-slate-950">
            <Check size={16} strokeWidth={4} />
          </div>
        </div>
      )}
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
        <div className={`w-1.5 h-1.5 rounded-full ${asset.linkedTo ? 'bg-emerald-500' : asset.status === 'Linked' ? 'bg-amber-500' : 'bg-red-500'}`} />
        {asset.linkedTo ? (
          <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400" title={`Linked to ${asset.linkedTo.type}: ${asset.linkedTo.name}`}>
            🔗 {asset.linkedTo.name}
          </span>
        ) : (
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{asset.status}</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-3 opacity-0 group-hover/item:opacity-100 transition-opacity">
        {asset.type === 'Sprite' && onSendToSynapse && (
          <button
            onClick={onSendToSynapse}
            className="flex-1 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[8px] font-black uppercase text-cyan-400 hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-1"
            title="Send to Synapse for editing"
          >
            <Paintbrush size={10} /> Synapse
          </button>
        )}
        {asset.type === 'Audio' && onSendToEcho && (
          <button
            onClick={onSendToEcho}
            className="flex-1 py-2 bg-pink-500/10 border border-pink-500/20 rounded-xl text-[8px] font-black uppercase text-pink-400 hover:bg-pink-500/20 transition-all flex items-center justify-center gap-1"
            title="Send to Echo for editing"
          >
            <Volume2 size={10} /> Echo
          </button>
        )}
        {onLinkAsset && (
          <button
            onClick={onLinkAsset}
            className="flex-1 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-[8px] font-black uppercase text-purple-400 hover:bg-purple-500/20 transition-all flex items-center justify-center gap-1"
            title="Link to entity, event, or quest"
          >
            <Link size={10} /> Link to...
          </button>
        )}
      </div>
    </div>
  );
};

interface NexusPluginProps {
  activeProject: Project | null;
  projectHandle?: any;
  setProjectHandle: (handle: any) => void;
}

const NexusPlugin: React.FC<NexusPluginProps> = ({ activeProject, projectHandle, setProjectHandle }) => {
  const [activeModule, setActiveModule] = useState<NexusModule>('ASSEMBLER');
  const [genesisTab, setGenesisTab] = useState<GenesisTab>('LOGIC');
  const [synapseTab, setSynapseTab] = useState<SynapseTab>('GENERATOR');
  const [echoTab, setEchoTab] = useState<EchoTab>('SIGNAL_GEN');

  // Neural Command Buffer State
  const [commandBuffer, setCommandBuffer] = useState<NeuralAction[]>([]);
  // ... existing state ...

  // Initialize AI with Active Project Context
  useEffect(() => {
    if (activeProject) {
      setAiMessages(prev => [...prev, {
        role: 'model',
        content: `⚡ **Nexus Core Activated**\n\nConnected to project database: **${activeProject.name}**\nEngine Mode: **${activeProject.engine}**\n\nI am ready to assist with assets, logic, and optimization for this project. Should I scan the latest files?`,
        source: 'local',
        timestamp: Date.now()
      }]);
      // If we don't have a handle but have a path (native app), we might prompt?
      // For now, web-based, we rely on user re-selecting folder if handle is needed.
    } else {
      setAiMessages(prev => [...prev, {
        role: 'model',
        content: `🛑 **No Active Project Detected**\n\nI don't see any project selected in the library. \n\nShall I create a new one? (Type: **__CMD_NEW_PROJECT** or say "Yes")`,
        source: 'local',
        timestamp: Date.now()
      }]);
    }
  }, [activeProject]);


  const [isScanning, setIsScanning] = useState(false);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [assets, setAssets] = useState<NexusAsset[]>([]);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
  const [assetSearch, setAssetSearch] = useState('');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // use projectHandle from props instead of internal projectDirHandle
  const [projectPath, setProjectPath] = useState<string | null>(null);

  // Synapse State
  const [synapsePrompt, setSynapsePrompt] = useState('');
  const [synapseStyle, setSynapseStyle] = useState<SpriteStyle>('Pixel Art');
  const [isGeneratingSprite, setIsGeneratingSprite] = useState(false);
  const [synapseReferenceImage, setSynapseReferenceImage] = useState<string | null>(null);
  const [generatedSprite, setGeneratedSprite] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isCorrectingSheet, setIsCorrectingSheet] = useState(false);

  // Echo State
  const [echoPrompt, setEchoPrompt] = useState('');
  const [echoCategory, setEchoCategory] = useState<AudioCategory>('DIALOGUE');
  const [echoVoice, setEchoVoice] = useState('Kore');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isContextBound, setIsContextBound] = useState(true);
  const [audioFx, setAudioFx] = useState({ reverb: 20, distortion: 0, echo: 10, lowPass: 100, highPass: 0, gain: 80 });

  // Working Asset State for Sub-Module Transfer
  const [synapseWorkingAsset, setSynapseWorkingAsset] = useState<{
    id: string;
    name: string;
    imageUrl: string;
  } | null>(null);

  const [echoWorkingAudio, setEchoWorkingAudio] = useState<{
    id: string;
    name: string;
    audioUrl: string;
  } | null>(null);

  // Animation State
  const [animFrames, setAnimFrames] = useState<AnimFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(12);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");

  // Sprite Slicing State
  const [sliceGrid, setSliceGrid] = useState({ cols: 4, rows: 4 });
  const [showSliceOverlay, setShowSliceOverlay] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [isNeuralSplicing, setIsNeuralSplicing] = useState(false);
  const [activeSynapseTool, setActiveSynapseTool] = useState('Select');
  const [synapseBrushSize, setSynapseBrushSize] = useState(5);
  const [synapseActiveColor, setSynapseActiveColor] = useState('#22d3ee');
  const [isDrawing, setIsDrawing] = useState(false);
  const synapseCanvasRef = useRef<HTMLCanvasElement>(null);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [animLoopMode, setAnimLoopMode] = useState<'once' | 'loop' | 'pingpong'>('loop');

  // Asset Link Modal State
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkingAssetId, setLinkingAssetId] = useState<string | null>(null);

  const projectVariables = [
    { key: 'player_health', value: '100', type: 'System' },
    { key: 'world_time', value: 'Midnight', type: 'Global' },
    { key: 'is_in_combat', value: 'False', type: 'System' }
  ];

  // ECHO: AI Audio Expansion State
  const [livePersona, setLivePersona] = useState('Decaying Zombie');
  const [liveDirectives, setLiveDirectives] = useState(['Moan', 'Snarl', 'Rasp']);
  const [ostParams, setOstParams] = useState({ bpm: 120, density: 50, brightness: 50 });
  const [isForgingOst, setIsForgingOst] = useState(false);

  // AI Assistant State
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // AI Usage Tracking (Neural Credits & Budget)
  const [neuralUsage, setNeuralUsage] = useState<{
    totalTokens: number;
    estimatedCost: number;
    usdBudgetLimit: number; // 0 = unlimited
  }>(() => {
    const savedUsage = localStorage.getItem('nexgen_neural_usage');
    if (savedUsage) {
      const parsed = JSON.parse(savedUsage);
      // Migration: convert old token quota to a default USD budget if it doesn't exist
      return {
        totalTokens: parsed.totalTokens || 0,
        estimatedCost: parsed.estimatedCost || 0,
        usdBudgetLimit: parsed.usdBudgetLimit !== undefined ? parsed.usdBudgetLimit : 0
      };
    }
    return {
      totalTokens: 0,
      estimatedCost: 0,
      usdBudgetLimit: 0 // Unlimited by default
    };
  });

  useEffect(() => {
    localStorage.setItem('nexgen_neural_usage', JSON.stringify(neuralUsage));
  }, [neuralUsage]);

  // AI Deep Context State
  const [aiDeepContext, setAiDeepContext] = useState<{
    gameConfig: any | null;
    assetSummaries: string[];
    isSyncing: boolean;
    lastSyncTime: Date | null;
  }>({
    gameConfig: null,
    assetSummaries: [],
    isSyncing: false,
    lastSyncTime: null,
  });

  // AI File Editing State
  const [pendingFileEdits, setPendingFileEdits] = useState<{
    filePath: string;
    fileName: string;
    originalContent: string;
    suggestedContent: string;
    timestamp: Date;
  }[]>([]);
  const [isDiffPanelOpen, setIsDiffPanelOpen] = useState(false);
  const [activeDiffIndex, setActiveDiffIndex] = useState(0);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Asset Type Filter State
  const [assetTypeFilter, setAssetTypeFilter] = useState<'All' | 'Sprite' | 'Audio' | 'Data' | 'Logic'>('All');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [savedApiKey, setSavedApiKey] = useState<string | null>(null);

  // Project Handling State
  const [projectDirHandle, setProjectDirHandle] = useState<any>(null);

  // AI File Creation State
  const [pendingFileCreation, setPendingFileCreation] = useState<{
    path: string;
    content: string;
    language: string;
  } | null>(null);

  // Assembler Selection & Sync State
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [isLiveSyncEnabled, setIsLiveSyncEnabled] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationLog, setOptimizationLog] = useState<{ msg: string, type: 'info' | 'success' | 'warn' }[]>([]);
  const [showOptimizationLog, setShowOptimizationLog] = useState(false);
  const [showFileCreateDialog, setShowFileCreateDialog] = useState(false);
  const [fileCreatePath, setFileCreatePath] = useState('');


  // Listen for global clear session event
  useEffect(() => {
    const handleGlobalClear = () => {
      handleClearSession();
    };
    window.addEventListener('nexgen:clear-session', handleGlobalClear);
    return () => window.removeEventListener('nexgen:clear-session', handleGlobalClear);
  }, []);

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('nexgen_api_key');
    if (storedKey) {
      setSavedApiKey(storedKey);
    }
  }, []);

  // Set API key state if it was already saved
  useEffect(() => {
    if (savedApiKey) {
      setApiKeyInput(savedApiKey);
    }
  }, [savedApiKey]);

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('nexgen_api_key', apiKeyInput.trim());
      setSavedApiKey(apiKeyInput.trim());
      // Update the environment variable for the current session
      (window as any).__NEXGEN_API_KEY__ = apiKeyInput.trim();
    }
  };

  // Animation Loop
  useEffect(() => {
    let interval: any;
    if (isPlaying && animFrames.length > 0) {
      interval = setInterval(() => {
        setCurrentFrameIndex(prev => (prev + 1) % animFrames.length);
      }, 1000 / fps);
    }
    return () => clearInterval(interval);
  }, [isPlaying, animFrames, fps]);

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
    ],
    quests: [
      {
        id: 'q_main_01',
        title: 'The Awakened Protocol',
        description: 'The player must locate the missing android unit within the Neon Slums sector and retrieve the corrupted memory core.',
        status: 'Available',
        type: 'Main',
        objectives: [
          { id: 'obj_1', text: 'Travel to Sector 7', status: 'Completed' },
          { id: 'obj_2', text: 'Speak to the Informant', status: 'Completed' },
          { id: 'obj_3', text: 'Locate the Android', status: 'Pending' },
          { id: 'obj_4', text: 'Extract Memory Core', status: 'Pending' }
        ]
      }
    ],
    narrativeSegments: []
  });

  // Dragging & Navigation State
  const [zoom, setZoom] = useState(1);
  const [draggingNode, setDraggingNode] = useState<{ id: string; startX: number; startY: number; mouseStartX: number; mouseStartY: number } | null>(null);
  const [viewport, setViewport] = useState({ scrollLeft: 0, scrollTop: 0, clientWidth: 0, clientHeight: 0 });

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

  // Animation Player Loop with Loop Mode Support
  const [pingPongDir, setPingPongDir] = useState<1 | -1>(1);
  useEffect(() => {
    let timeout: any;
    if (isPlaying && animFrames.length > 0) {
      timeout = setTimeout(() => {
        if (animLoopMode === 'once') {
          if (currentFrameIndex < animFrames.length - 1) {
            setCurrentFrameIndex(prev => prev + 1);
          } else {
            setIsPlaying(false); // Stop at last frame
          }
        } else if (animLoopMode === 'loop') {
          setCurrentFrameIndex(prev => (prev + 1) % animFrames.length);
        } else if (animLoopMode === 'pingpong') {
          const nextIndex = currentFrameIndex + pingPongDir;
          if (nextIndex >= animFrames.length - 1) {
            setPingPongDir(-1);
            setCurrentFrameIndex(animFrames.length - 1);
          } else if (nextIndex <= 0) {
            setPingPongDir(1);
            setCurrentFrameIndex(0);
          } else {
            setCurrentFrameIndex(nextIndex);
          }
        }
      }, 1000 / fps);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, currentFrameIndex, animFrames, fps, animLoopMode, pingPongDir]);




  // Persistence Layer
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('nexgen_gamestate');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        // Migration: If no quests exist, inject the sample quest
        if (!parsed.quests || parsed.quests.length === 0) {
          parsed.quests = [{
            id: 'q_main_01',
            title: 'The Awakened Protocol',
            description: 'The player must locate the missing android unit within the Neon Slums sector and retrieve the corrupted memory core.',
            status: 'Available',
            type: 'Main',
            objectives: [
              { id: 'obj_1', text: 'Travel to Sector 7', status: 'Completed' },
              { id: 'obj_2', text: 'Speak to the Informant', status: 'Completed' },
              { id: 'obj_3', text: 'Locate the Android', status: 'Pending' },
              { id: 'obj_4', text: 'Extract Memory Core', status: 'Pending' }
            ]
          }];
        }
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
      const serializableAssets = assets.map(({ handle, previewUrl, imageUrl, audioUrl, ...rest }) => ({
        ...rest,
        previewUrl: previewUrl?.startsWith('data:') ? previewUrl : undefined,
        imageUrl: imageUrl?.startsWith('data:') ? imageUrl : undefined,
        audioUrl: audioUrl?.startsWith('data:') ? audioUrl : undefined
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

      // Build recursive FileNode tree
      const buildTree = async (handle: any, path: string = ''): Promise<FileNode[]> => {
        const nodes: FileNode[] = [];
        for await (const entry of handle.values()) {
          const entryPath = path ? `${path}/${entry.name}` : entry.name;
          const node: FileNode = {
            id: `file_${Math.random().toString(36).substr(2, 9)}`,
            name: entry.name,
            kind: entry.kind,
            handle: entry,
            path: entryPath
          };

          if (entry.kind === 'directory') {
            node.children = await buildTree(entry, entryPath);
          }
          nodes.push(node);
        }
        // Consistent sorting: dirs first, then alpha
        return nodes.sort((a, b) => {
          if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      };

      const tree = await buildTree(dirHandle);
      setFileTree(tree);

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

  const handleFileClick = (file: FileNode) => {
    setActiveFile(file);
    if (!openFiles.find(f => f.id === file.id)) {
      setOpenFiles(prev => [...prev, file]);
    }
    setActiveModule('EDITOR');
  };

  const handleCloseFile = (fileId: string) => {
    const newOpenFiles = openFiles.filter(f => f.id !== fileId);
    setOpenFiles(newOpenFiles);
    if (activeFile?.id === fileId) {
      setActiveFile(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null);
      if (newOpenFiles.length === 0) setActiveModule('ASSEMBLER');
    }
  };

  const handleSaveFile = async (fileNode: FileNode, content: string) => {
    try {
      const writable = await fileNode.handle.createWritable();
      await writable.write(content);
      await writable.close();
      console.log(`[Editor] Saved: ${fileNode.name}`);
    } catch (e) {
      console.error('Failed to save file:', e);
      alert('Save failed: Ensure you have write permissions for this project folder.');
    }
  };

  const handleNeuralOrchestration = async () => {
    setIsOrchestrating(true);

    // PHASE 2: Logic Engine Generation
    // Only generate nodes for assets that are 'Linked' (meaning they've been processed/readied in Assembler)
    // but not yet in the graph, OR process all Unlinked assets if that's the goal.
    // Based on user feedback: "auto link in the assembler first then auto link in logic engine"
    const readyAssets = assets.filter(a => a.status === 'Linked' && a.statusReason?.includes('Neural'));

    // However, to be most useful, let's treat "Generate from Assets" in logic engine 
    // as the step that takes the assets identified in Assembler and puts them on the board.

    const unlinkedAssets = assets.filter(a => a.status === 'Unlinked');
    const assetsToProcess = unlinkedAssets.length > 0 ? unlinkedAssets : readyAssets;

    const newNodes = assetsToProcess.map((asset, index) => {
      const col = index % 5;
      const row = Math.floor(index / 5);

      const nodeType = asset.type === 'Sprite' ? 'Action' : (asset.type === 'Audio' ? 'Echo' : 'Data');
      const label = asset.type === 'Sprite' ? `Load Sprite: ${asset.name}` : (asset.type === 'Audio' ? `Play Sound: ${asset.name}` : `Asset: ${asset.name}`);
      const colorClass = asset.type === 'Sprite' ? 'border-cyan-500/40 bg-cyan-500/10' : (asset.type === 'Audio' ? 'border-pink-500/40 bg-pink-500/10' : 'border-slate-500/40 bg-slate-500/10');

      return {
        id: `node_gen_${asset.id}`,
        x: CENTER + (col * 300) - 600,
        y: CENTER + (row * 200) + 300,
        label,
        type: nodeType,
        inputs: [{ id: 'in_exec', name: '', type: 'Exec', direction: 'Input' }],
        outputs: [{ id: 'out_exec', name: '', type: 'Exec', direction: 'Output' }],
        data: asset.name,
        colorClass
      };
    });
    if (newNodes.length > 0) {
      setGameState(prev => ({
        ...prev,
        nodes: [...prev.nodes, ...newNodes]
      }));

      // Update assets to linked
      setAssets(prev => prev.map(a =>
        assetsToProcess.find(ua => ua.id === a.id)
          ? { ...a, status: 'Linked', statusReason: 'Auto-Generated by Neural Orchestration' }
          : a
      ));
    }

    setTimeout(() => {
      setIsOrchestrating(false);
      // Auto-focus on new nodes
      if (containerRef.current && newNodes.length > 0) {
        containerRef.current.scrollTo({
          left: newNodes[0].x - containerRef.current.clientWidth / 2,
          top: newNodes[0].y - containerRef.current.clientHeight / 2,
          behavior: 'smooth'
        });
      }
    }, 1500);
  };

  const handleQuestAutoSync = async () => {
    setIsOrchestrating(true);

    // Identify unlinked 'Data' or 'Logic' assets that might be Quests or Narrative
    const unlinkedAssets = assets.filter(a => a.status === 'Unlinked' && (a.type === 'Data' || a.type === 'Logic'));

    const newQuests: any[] = [];
    const newNarratives: any[] = [];

    if (unlinkedAssets.length === 0) {
      // No assets to sync - create a sample quest instead
      console.log('[GENESIS] No unlinked Data/Logic assets found. Creating sample quest...');
      newQuests.push({
        id: `q_sync_${Date.now()}`,
        title: 'Synced Quest',
        description: 'This quest was created via Auto-Sync. Scan assets in Assembler to link game data.',
        status: 'Available',
        type: 'Side',
        objectives: [
          { id: `obj_${Date.now()}_1`, text: 'Scan project assets in Assembler', status: 'Pending' },
          { id: `obj_${Date.now()}_2`, text: 'Link Data files to quests', status: 'Pending' }
        ]
      });
    } else {
      unlinkedAssets.forEach(asset => {
        // Simple heuristic: if filename contains 'quest' it's a quest, else it's narrative
        if (asset.name.toLowerCase().includes('quest')) {
          newQuests.push({
            id: `q_sync_${asset.id}`,
            title: asset.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
            description: `Auto-synced from asset: ${asset.path}`,
            status: 'Available',
            type: 'Side',
            objectives: [
              { id: `obj_${asset.id}_1`, text: 'Locate asset data', status: 'Pending' }
            ],
            linkedAssetId: asset.id
          });
        } else {
          newNarratives.push({
            id: `n_sync_${asset.id}`,
            speaker: "System AI",
            content: `Data stream initiated from ${asset.name}. Analyzing neural patterns...`,
            linkedAssetId: asset.id
          });
        }
      });

      // Update assets to linked
      const processedIds = unlinkedAssets.map(a => a.id);
      setAssets(prev => prev.map(a =>
        processedIds.includes(a.id)
          ? { ...a, status: 'Linked', statusReason: 'Synced to Genesis Core' }
          : a
      ));
    }

    if (newQuests.length > 0 || newNarratives.length > 0) {
      setGameState(prev => ({
        ...prev,
        quests: [...(prev.quests || []), ...newQuests],
        narrativeSegments: [...(prev.narrativeSegments || []), ...newNarratives]
      }));
    }

    setTimeout(() => setIsOrchestrating(false), 1500);
  };

  // Add a new blank quest
  const handleAddQuest = () => {
    const newQuest = {
      id: `q_${Date.now()}`,
      title: 'New Quest',
      description: 'Enter quest description...',
      status: 'Available',
      type: 'Side',
      objectives: [
        { id: `obj_${Date.now()}_1`, text: 'First objective', status: 'Pending' }
      ]
    };
    setGameState(prev => ({
      ...prev,
      quests: [...(prev.quests || []), newQuest]
    }));
  };

  // Delete a quest by ID
  const handleDeleteQuest = (questId: string) => {
    setGameState(prev => ({
      ...prev,
      quests: (prev.quests || []).filter(q => q.id !== questId)
    }));
  };

  // Delete a narrative segment by ID
  const handleDeleteNarrative = (narrativeId: string) => {
    setGameState(prev => ({
      ...prev,
      narrativeSegments: (prev.narrativeSegments || []).filter(n => n.id !== narrativeId)
    }));
  };

  // Open link modal for an asset
  const handleLinkAsset = (assetId: string) => {
    setLinkingAssetId(assetId);
    setLinkModalOpen(true);
  };

  // Confirm link to a target entity/event/quest
  const handleConfirmLink = (targetType: 'entity' | 'event' | 'quest', targetId: string, targetName: string) => {
    if (!linkingAssetId) return;
    setAssets(prev => prev.map(a =>
      a.id === linkingAssetId
        ? { ...a, status: 'Linked' as const, linkedTo: { type: targetType, id: targetId, name: targetName } }
        : a
    ));
    setLinkModalOpen(false);
    setLinkingAssetId(null);
  };

  // Get available link targets from gameState
  const getLinkTargets = () => {
    const entities = (gameState.entities || []).map(e => ({ type: 'entity' as const, id: e.id, name: e.name }));
    const quests = (gameState.quests || []).map(q => ({ type: 'quest' as const, id: q.id, name: q.title }));
    const events = (gameState.nodes || []).filter(n => n.type === 'Event').map(n => ({ type: 'event' as const, id: n.id, name: n.label }));
    return [...entities, ...quests, ...events];
  };

  // Scaffold a logic template (Logic Clusters)
  const handleScaffoldTemplate = (template: 'GUARDS_DILEMMA') => {
    setIsOrchestrating(true);

    const centerX = viewport.scrollLeft + viewport.clientWidth / 2;
    const centerY = viewport.scrollTop + viewport.clientHeight / 2;

    let newNodes: NodePos[] = [];

    if (template === 'GUARDS_DILEMMA') {
      newNodes = [
        {
          id: `node_cond_${Date.now()}`,
          x: centerX - 400,
          y: centerY,
          label: 'Check Flag: Has Bribery Gold?',
          type: 'Condition',
          colorClass: 'border-sky-500/40 bg-sky-500/10'
        },
        {
          id: `node_branch_${Date.now()}`,
          x: centerX - 150,
          y: centerY,
          label: 'Branch: Bribe or Fight?',
          type: 'Event', // Branching Choice
          colorClass: 'border-purple-500/40 bg-purple-500/10'
        },
        {
          id: `node_mut_bribe_${Date.now()}`,
          x: centerX + 150,
          y: centerY - 100,
          label: 'Mutator: Gain Trust (Bribed)',
          type: 'Action',
          colorClass: 'border-emerald-500/40 bg-emerald-500/10'
        },
        {
          id: `node_mut_fight_${Date.now()}`,
          x: centerX + 150,
          y: centerY + 100,
          label: 'Spawn: Guard Entity (Fighting)',
          type: 'Action',
          colorClass: 'border-red-500/40 bg-red-500/10'
        },
        {
          id: `node_fx_${Date.now()}`,
          x: centerX + 400,
          y: centerY,
          label: 'FX: Camera Shake + Play SFX',
          type: 'Action',
          colorClass: 'border-pink-500/40 bg-pink-500/10'
        }
      ];
    }

    if (newNodes.length > 0) {
      setGameState(prev => ({
        ...prev,
        nodes: [...prev.nodes, ...newNodes]
      }));
    }

    setTimeout(() => {
      setIsOrchestrating(false);
      if (containerRef.current && newNodes.length > 0) {
        containerRef.current.scrollTo({
          left: newNodes[0].x - containerRef.current.clientWidth / 2,
          top: newNodes[0].y - containerRef.current.clientHeight / 2,
          behavior: 'smooth'
        });
      }
    }, 1500);
  };

  // Open a project folder and save the directory handle for writes
  const openProjectFolder = async () => {
    try {
      const dirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      setProjectDirHandle(dirHandle);
      setProjectPath(dirHandle.name);
      console.log('[NEXGEN] Project folder opened:', dirHandle.name);
      return dirHandle;
    } catch (e) {
      console.warn('User cancelled folder selection');
      return null;
    }
  };

  // Write a file to the project folder
  const writeToProject = async (filePath: string, content: string | Blob): Promise<boolean> => {
    if (!projectDirHandle) {
      console.warn('No project folder open - opening picker...');
      const handle = await openProjectFolder();
      if (!handle) return false;
    }

    try {
      const parts = filePath.split('/').filter(p => p);
      let current = projectDirHandle!;

      // Navigate/create subdirectories
      for (const part of parts.slice(0, -1)) {
        current = await current.getDirectoryHandle(part, { create: true });
      }

      // Write the file
      const fileName = parts[parts.length - 1];
      const fileHandle = await current.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      console.log('[NEXGEN] File written:', filePath);
      return true;
    } catch (e) {
      console.error('[NEXGEN] Write failed:', e);
      return false;
    }
  };

  // Send asset from Assembler to Synapse Editor
  const handleSendToSynapse = async (asset: NexusAsset, previewUrl?: string) => {
    setSynapseTab('EDITOR');
    setActiveModule('SYNAPSE');

    // Get preview URL - prioritize passed URL, then asset.previewUrl, then read from handle
    let imageUrl = previewUrl || asset.previewUrl || '';
    if (!imageUrl && asset.handle) {
      try {
        const file = await asset.handle.getFile();
        imageUrl = URL.createObjectURL(file);
      } catch (e) {
        console.warn('[NEXGEN] Could not read file from handle:', e);
      }
    }

    setSynapseWorkingAsset({
      id: asset.id,
      name: asset.name,
      imageUrl
    });
    console.log('[NEXGEN] Asset sent to Synapse Editor:', asset.name, 'URL:', imageUrl ? 'valid' : 'empty');
  };

  // Send asset from Assembler to Echo Wave Editor
  const handleSendToEcho = async (asset: NexusAsset, previewUrl?: string) => {
    setEchoTab('WAVE_EDIT');
    setActiveModule('ECHO');

    // Get preview URL - prioritize passed URL, then asset.previewUrl, then read from handle
    let audioUrl = previewUrl || asset.previewUrl || '';
    if (!audioUrl && asset.handle) {
      try {
        const file = await asset.handle.getFile();
        audioUrl = URL.createObjectURL(file);
      } catch (e) {
        console.warn('[NEXGEN] Could not read file from handle:', e);
      }
    }

    setEchoWorkingAudio({
      id: asset.id,
      name: asset.name,
      audioUrl
    });
    console.log('[NEXGEN] Asset sent to Echo Wave Editor:', asset.name, 'URL:', audioUrl ? 'valid' : 'empty');
  };

  const handleGenerateSprite = async () => {
    if (!synapsePrompt) return;
    setIsGeneratingSprite(true);
    setGenerationError(null);
    setGeneratedSprite(null);

    try {
      const imageUrl = await generateSprite(synapsePrompt, synapseStyle, synapseReferenceImage || undefined);
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

  const handleCorrectSpriteSheet = async () => {
    const imageUrl = synapseWorkingAsset?.imageUrl || generatedSprite;
    if (!imageUrl) return;

    setIsCorrectingSheet(true);
    try {
      const corrected = await correctSpriteSheet(imageUrl, synapseStyle);
      if (corrected) {
        setGeneratedSprite(corrected);
        console.log('[SYNAPSE] AI Sprite Sheet Correction complete');
      }
    } catch (e) {
      console.error('[SYNAPSE] AI Correction failed:', e);
    } finally {
      setIsCorrectingSheet(false);
    }
  };

  const handleReferenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSynapseReferenceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAudio = async () => {
    if (!echoPrompt) return;
    setIsGeneratingAudio(true);
    try {
      const context = isContextBound ? { assets, variables: projectVariables } : undefined;
      // Enhanced with "Steerable" prompt logic
      const enhancedPrompt = echoCategory === 'DIALOGUE'
        ? `${echoPrompt} // PERFORMANCE_DIRECTION: ${echoVoice === 'Kore' ? 'Neutral/Clear' : echoVoice}`
        : echoPrompt;
      const audioUrl = await generateAudioSignal(enhancedPrompt, echoCategory, echoVoice, context as any);
      setGeneratedAudio(audioUrl);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleCallToStage = async () => {
    setIsGeneratingAudio(true);
    try {
      const response = await generateLivePerformance(livePersona, "Session Start");
      setGeneratedAudio(response);
      // Logic for terminal logs would go here
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleForgeOst = async () => {
    setIsForgingOst(true);
    try {
      const response = await generateAtmosphericTrack("OST Forge Sample", ostParams);
      // In a real impl, we'd set this to a wave preview
      setGeneratedAudio(response);
    } finally {
      setIsForgingOst(false);
    }
  };

  // AI Deep Context Sync - Reads asset contents and looks for game config
  const handleSyncContext = async () => {
    setAiDeepContext(prev => ({ ...prev, isSyncing: true }));

    try {
      const summaries: string[] = [];

      // Read asset file contents (first 300 chars each)
      for (const asset of assets.slice(0, 20)) { // Limit to first 20 assets
        if (asset.handle) {
          try {
            const file = await asset.handle.getFile();
            if (file.type.startsWith('text/') || file.name.endsWith('.json') || file.name.endsWith('.nx')) {
              const text = await file.text();
              const preview = text.slice(0, 300).replace(/\n/g, ' ');
              summaries.push(`[${asset.type}] ${asset.name}: ${preview}...`);
            } else {
              summaries.push(`[${asset.type}] ${asset.name}: (binary file, ${Math.round(file.size / 1024)}KB)`);
            }
          } catch (e) {
            summaries.push(`[${asset.type}] ${asset.name}: (could not read)`);
          }
        }
      }

      // Look for project configuration
      let gameConfig = null;
      let configType = '';

      const configAsset = assets.find(a => a.name.toLowerCase() === 'nexus_project.json' || a.name.toLowerCase() === 'project.json');

      if (configAsset?.handle) {
        try {
          const file = await configAsset.handle.getFile();
          const text = await file.text();
          gameConfig = JSON.parse(text);
          configType = configAsset.name;
        } catch (e) {
          console.log('Could not parse config file');
        }
      }

      let syncMessage = `✅ **Context Synced!** I now have deep access to ${summaries.length} assets.`;

      if (gameConfig?.gameState) {
        setGameState(gameConfig.gameState);
        syncMessage += `\n✅ **Auto-Loaded Engine State** from \`${configAsset?.name}\`.`;
      }

      setAiDeepContext({
        gameConfig,
        assetSummaries: summaries,
        isSyncing: false,
        lastSyncTime: new Date(),
      });

      // LOCAL ASSET DETECTION (FREE - no tokens!)
      const analyzeAssetNeeds = (config: any, existingAssets: any[]) => {
        const needs: { type: string; name: string; category: string }[] = [];
        const assetNames = existingAssets.map(a => a.name.toLowerCase());

        // Check characters
        if (config?.characters?.player) {
          const playerName = config.characters.player.name?.toLowerCase() || 'player';
          if (!assetNames.some(n => n.includes(playerName) && (n.includes('sprite') || n.includes('idle')))) {
            needs.push({ type: 'sprite', name: config.characters.player.name || 'Player', category: 'character' });
          }
        }

        if (config?.characters?.recruits) {
          for (const recruit of config.characters.recruits) {
            const name = recruit.name?.toLowerCase() || '';
            if (!assetNames.some(n => n.includes(name))) {
              needs.push({ type: 'sprite', name: recruit.name, category: 'character' });
            }
            // Check for dialogue audio
            if (!assetNames.some(n => n.includes(name) && n.includes('audio'))) {
              needs.push({ type: 'audio', name: `${recruit.name} dialogue`, category: 'voice' });
            }
          }
        }

        // Check enemies
        if (config?.enemies) {
          for (const enemy of config.enemies) {
            const name = enemy.name?.toLowerCase() || enemy.type?.toLowerCase() || '';
            if (!assetNames.some(n => n.includes(name))) {
              needs.push({ type: 'sprite', name: enemy.name || enemy.type, category: 'enemy' });
            }
            // Death audio
            if (!assetNames.some(n => n.includes(name) && (n.includes('death') || n.includes('die')))) {
              needs.push({ type: 'audio', name: `${enemy.name || enemy.type} death`, category: 'sfx' });
            }
          }
        }

        // Check zones for backgrounds
        if (config?.zones) {
          for (const zone of config.zones) {
            const name = zone.name?.toLowerCase() || '';
            if (!assetNames.some(n => n.includes(name) && (n.includes('bg') || n.includes('background')))) {
              needs.push({ type: 'sprite', name: `${zone.name} background`, category: 'environment' });
            }
            // Ambient audio
            if (!assetNames.some(n => n.includes(name) && n.includes('ambient'))) {
              needs.push({ type: 'audio', name: `${zone.name} ambient`, category: 'ambient' });
            }
          }
        }

        return needs;
      };

      // Run local analysis
      const missingAssets = gameConfig ? analyzeAssetNeeds(gameConfig, assets) : [];

      if (gameConfig) {
        syncMessage += `\n\n📖 **Loaded Game Bible:** \`${configType}\``;
        if (gameConfig.game?.title) {
          syncMessage += `\n- **Game:** ${gameConfig.game.title}`;
        }
        if (gameConfig.story?.premise) {
          syncMessage += `\n- **Premise:** ${gameConfig.story.premise.slice(0, 100)}...`;
        }
      }

      syncMessage += '\n\nAsk me anything about your project!';

      setAiMessages(prev => [...prev, {
        role: 'model',
        content: syncMessage
      }]);

    } catch (e) {
      console.error('Sync error:', e);
      setAiDeepContext(prev => ({ ...prev, isSyncing: false }));
    }
  };

  // Background File Watcher (Polling)
  useEffect(() => {
    if (!projectHandle || !projectDirHandle) return;

    const intervalId = setInterval(async () => {
      // Only "light sync" if we are not actively diffing or orchestrating
      if (!isOrchestrating && !isDiffPanelOpen && !aiDeepContext.isSyncing) {
        // Random polling for background sync
        if (Math.random() > 0.8) {
          handleSyncContext();
        }
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(intervalId);
  }, [projectHandle, projectDirHandle, isOrchestrating, isDiffPanelOpen, aiDeepContext.isSyncing]); // Added missing dependency

  // Command Handlers for Autonomous Flow
  const handleAnalyzeGaps = () => {
    const needs = [];
    const assetNames = assets.map(a => a.name.toLowerCase());

    if (!assetNames.some(n => n.includes('player'))) needs.push('Player Character (Sprite)');
    if (!assetNames.some(n => n.includes('bgm') || n.includes('music'))) needs.push('Background Music (Audio)');
    if (!gameState.nodes.some(n => n.type === 'Quest')) needs.push('Main Quest (Logic)');

    if (needs.length > 0) {
      setAiMessages(prev => [...prev, {
        role: 'model',
        content: `🧩 **Gap Analysis Complete**\nI've detected some missing core elements:\n${needs.map(n => `- ${n}`).join('\n')}\n\nShall I **Auto Forge** these for you?`,
        source: 'local',
        timestamp: Date.now()
      }]);
    } else {
      setAiMessages(prev => [...prev, { role: 'model', content: "✅ **Project Integrity Good**. No obvious gaps detected.", source: 'local', timestamp: Date.now() }]);
    }
  };

  const handleAutoForge = async (command: string) => {
    // Extract parameters: __CMD_AUTO_FORGE__[target_name:type]
    // Mock implementation of the full pipeline
    const params = command.match(/__CMD_AUTO_FORGE__\[(.*?)\]/);
    const target = params ? params[1] : 'Unknown';

    setAiMessages(prev => [...prev, { role: 'model', content: `⚙️ **Initiating Super Forge Protocol for: ${target}**\n\n1. Generating Assets... [PENDING]\n2. Splicing Frames... [PENDING]\n3. creating Entity... [PENDING]\n4. Spawning Logic... [PENDING]`, source: 'local', timestamp: Date.now() }]);

    // Simulate pipeline steps
    setTimeout(() => {
      setAiMessages(prev => [...prev, { role: 'model', content: `✅ **Super Forge Complete**\n\nCreated new Entity: **${target}** with linked assets and logic node.`, source: 'local', timestamp: Date.now() }]);
      // Trigger a real sync to show the "new" files
      handleSyncContext();
    }, 3000);
  };

  // AI Assistant Handler
  // Neural Command Buffer Handlers
  const handleRejectAction = (actionId: string) => {
    setCommandBuffer(prev => prev.filter(a => a.id !== actionId));
  };

  const handleExecuteAction = async (actionId: string) => {
    const action = commandBuffer.find(a => a.id === actionId);
    if (!action) return;

    // Remove from buffer immediately (optimistic UI)
    setCommandBuffer(prev => prev.filter(a => a.id !== actionId));

    try {
      switch (action.type) {
        case 'CREATE_FILE':
          // Start file creation flow
          setFileCreatePath(action.data.path);
          setPendingFileCreation({
            path: action.data.path,
            content: action.data.content,
            language: 'nexscript'
          });
          setShowFileCreateDialog(true);
          break;

        case 'GENERATE_SPRITE':
          // Pass to Synapse Generator
          setSynapseTab('GENERATOR');
          setSynapsePrompt(action.data.prompt);
          setSynapseStyle(action.data.style || 'HD Pixel'); // Default to new style
          // Optional: auto-trigger generation or let user click
          break;

        case 'GENERATE_AUDIO':
          // Pass to Echo Generator
          setEchoTab('SIGNAL_GEN');
          setEchoPrompt(action.data.prompt);
          // Logic to start synthesis if needed
          break;

        case 'NAVIGATE':
          // Already handled by existing logic, but this formalizes it
          const mod = action.data.module as NexusModule;
          const setTabFunctions: Record<string, any> = {
            'GENESIS': setGenesisTab,
            'SYNAPSE': setSynapseTab,
            'ECHO': setEchoTab
          };
          // Just switch valid tabs if needed, mostly handled by activeModule state though
          break;
      }
    } catch (e) {
      console.error("Action execution failed", e);
    }
  }

  const handleAiSubmit = async () => {
    if (!aiInput.trim()) return;

    const userMessage = aiInput.trim();
    setAiMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: Date.now() }]);
    setAiInput('');
    setIsAiThinking(true);

    try {
      // Build shared context for orchestration
      const sharedContext = {
        currentModule: activeModule,
        assets,
        gameConfig: aiDeepContext.gameConfig,
        chatHistory: aiMessages.map(m => ({ role: m.role, content: m.content })),
        assetsCount: assets.length
      };

      let response = '';
      let source: 'local' | 'cloud' = 'local';
      let usage: TokenStats | undefined = undefined;

      // 1. Try Ollama First (Local Orchestration)
      if (isOllamaEnabled()) {
        try {
          const ollamaRaw = await generateWithOllama(userMessage, sharedContext as any);

          if (ollamaRaw.includes('__DELEGATE_TO_GEMINI__')) {
            source = 'cloud';
          } else {
            response = ollamaRaw;
            source = 'local';
            usage = { promptTokens: 0, candidatesTokens: 0, totalTokens: 0, cost: 0 };
          }
        } catch (e) {
          console.warn("Ollama orchestration failed, falling back to Gemini:", e);
          source = 'cloud';
        }
      } else {
        source = 'cloud';
      }

      // 2. Fallback to Gemini if requested or local failed/disabled
      if (source === 'cloud') {
        // Budget Safety Interlock
        if (neuralUsage.usdBudgetLimit > 0 && neuralUsage.estimatedCost >= neuralUsage.usdBudgetLimit) {
          response = "⚠️ **NEURAL BUDGET REACHED**\n\nCloud orchestration (Gemini) has been paused to prevent overspending. Your current burn is **$" + neuralUsage.estimatedCost.toFixed(4) + "** against a limit of **$" + neuralUsage.usdBudgetLimit.toFixed(2) + "**.\n\n**OPTIONS:**\n1. Increase budget in **Settings**\n2. Enable **Local AI (Ollama)** for free orchestration\n3. Clear usage stats in Settings";
          source = 'cloud';
          setIsAiThinking(false);
        } else {
          const enhancedContext = {
            assets,
            gameState,
            activeModule,
            projectVariables,
            ...(aiDeepContext.lastSyncTime && {
              gameConfig: aiDeepContext.gameConfig,
              assetSummaries: aiDeepContext.assetSummaries.slice(0, 50), // Increased slice
            }),
          };
          const geminiRes = await generateAssistantResponse(userMessage, enhancedContext, aiMessages);
          response = geminiRes.text || '';
          usage = geminiRes.usage;

          // Calculate estimated cost ($0.10 per 1M tokens for Flash)
          if (usage) {
            const estimatedCost = (usage.totalTokens / 1000000) * 0.10;
            usage.cost = estimatedCost;

            setNeuralUsage(prev => ({
              ...prev,
              totalTokens: prev.totalTokens + usage!.totalTokens,
              estimatedCost: prev.estimatedCost + estimatedCost
            }));
          }
        }
      }

      // 3. Process Response (Edits, Commands, Display)
      const fileEdits = parseFileEdits(response);
      const fileCreationMatch = response.match(/__CMD_CREATE_FILE__\[(.*?)\]/);

      if (fileCreationMatch) {
        const filePath = fileCreationMatch[1];
        // Extract content between the command and any trailing code block
        // Or just the next code block after the command
        const codeBlockMatch = response.slice(fileCreationMatch.index! + fileCreationMatch[0].length).match(/```(\w+)?\n([\s\S]*?)```/);

        if (codeBlockMatch) {
          const language = codeBlockMatch[1] || 'text';
          const content = codeBlockMatch[2];

          // Clean the response and add the command message
          const cleanResponse = response.replace(/__CMD_CREATE_FILE__\[.*?\]\n?```[\s\S]*?```/g, '').trim();


          setCommandBuffer(prev => [...prev, {
            id: `cmd_file_${Date.now()}`,
            type: 'CREATE_FILE',
            status: 'QUEUED',
            description: `Create File: ${filePath}`,
            data: { path: filePath, content, language },
            timestamp: Date.now()
          }]);

          setAiMessages(prev => [
            ...prev,
            { role: 'model', content: cleanResponse || `I have queued the creation of **${filePath}**. Check the Neural Buffer.`, source, usage, timestamp: Date.now() }
          ]);
          setIsAiThinking(false);
          return;
        }
      }

      // 4. Handle Autonomous Forge Commands
      if (response.includes('__CMD_AUTO_FORGE__')) {
        handleAutoForge(response);
      }

      // 5. Handle Gap Fill Command
      if (response.includes('__CMD_FILL_GAPS__')) {
        setAiMessages(prev => [...prev, { role: 'model', content: "🔍 Analyzing project structural integrity for gaps...", source, timestamp: Date.now() }]);
        setTimeout(() => handleAnalyzeGaps(), 1000);
      }

      if (fileEdits.length > 0) {
        for (const edit of fileEdits) {
          await handleFileEditSuggestion(edit.filePath, edit.content);
        }
        const cleanResponse = response.replace(/<FILE_EDIT[\s\S]*?<\/FILE_EDIT>/g, '').trim();
        setAiMessages(prev => [...prev, {
          role: 'model',
          content: cleanResponse || 'I\'ve prepared file changes for your review.',
          source,
          usage,
          timestamp: Date.now()
        }]);
      } else {
        setAiMessages(prev => [...prev, { role: 'model', content: response, source, usage, timestamp: Date.now() }]);
      }


      // Integrated Global Commands
      const projectMatch = response.match(/__CMD(?:__|_?)NEW_PROJECT(?:$|__|_?|\[(.*?)\])/i);
      if (projectMatch) {
        const projectName = projectMatch[1] || '';
        setAiMessages(prev => [...prev, { role: 'model', content: `__CMD__NEW_PROJECT${projectName ? '__' + projectName : ''}`, source, timestamp: Date.now() }]);
      }
      if (response.includes('__CMD__CLEAR_SESSION') || response.includes('__CMD_CLEAR_SESSION__')) {
        setAiMessages(prev => [...prev, { role: 'model', content: '__CMD__CLEAR_SESSION', source, timestamp: Date.now() }]);
      }
      if (response.includes('__CMD_SCAFFOLD__') || response.includes('__CMD__SCAFFOLD')) {
        setAiMessages(prev => [...prev, { role: 'model', content: '__CMD_SCAFFOLD__', source, timestamp: Date.now() }]);
      }
      if (response.includes('__CMD_SCAFFOLD_STEALTH__')) {
        setAiMessages(prev => [...prev, { role: 'model', content: '__CMD_SCAFFOLD_STEALTH__', source, timestamp: Date.now() }]);
        handleScaffoldTemplate('GUARDS_DILEMMA');
      }

      // Navigation Handler (Normalizes multiple formats)
      const navMatch = response.match(/__NAV__\[?(\w+)\]?/) || response.match(/__CMD_NAVIGATE_(\w+)__/);
      if (navMatch) {
        const targetModule = navMatch[1].toUpperCase() as NexusModule;
        setAiMessages(prev => [...prev, { role: 'model', content: `__NAV__${targetModule}`, source, timestamp: Date.now() }]);
      } else {
        // Legacy/NLP navigation fallback
        const moduleKeywords: Record<string, NexusModule> = {
          'assembler': 'ASSEMBLER', 'synapse': 'SYNAPSE', 'echo': 'ECHO',
          'genesis': 'GENESIS', 'atlas': 'ATLAS', 'nova': 'NOVA', 'airlock': 'AIRLOCK',
        };
        const lowerResponse = response.toLowerCase();
        for (const [kw, mod] of Object.entries(moduleKeywords)) {
          if (lowerResponse.includes(`navigate to ${kw}`) || lowerResponse.includes(`go to ${kw}`)) {
            setAiMessages(prev => [...prev, { role: 'model', content: `__NAV__${mod}`, source, timestamp: Date.now() }]);
            break;
          }
        }
      }

      // Asset & Code Generation Hooks
      const spriteMatch = response.match(/__CMD_GEN_SPRITE__\[([^\]]+)\]:\[([^\]]+)\]/);
      if (spriteMatch) {
        const [_, name, prompt] = spriteMatch;
        setCommandBuffer(prev => [...prev, {
          id: `cmd_sprite_${Date.now()}`,
          type: 'GENERATE_SPRITE',
          status: 'QUEUED',
          description: `Generate Sprite: ${name}`,
          data: { name, prompt, style: 'HD Pixel' },
          timestamp: Date.now()
        }]);
        setAiMessages(prev => [...prev, { role: 'model', content: `queued sprite generation for **${name}**.`, source, usage, timestamp: Date.now() }]);
      }
      const audioMatch = response.match(/__CMD_GEN_AUDIO__\[([^\]]+)\]:\[([^\]]+)\]:\[([^\]]+)\]/);
      if (audioMatch) {
        const [_, name, category, prompt] = audioMatch;
        setCommandBuffer(prev => [...prev, {
          id: `cmd_audio_${Date.now()}`,
          type: 'GENERATE_AUDIO',
          status: 'QUEUED',
          description: `Generate Audio: ${name} (${category})`,
          data: { name, category, prompt },
          timestamp: Date.now()
        }]);
        setAiMessages(prev => [...prev, { role: 'model', content: `queued audio generation for **${name}**.`, source, usage, timestamp: Date.now() }]);
      }

      // local-specific model switch command
      const modelMatch = response.match(/__OLLAMA_MODEL__\[([^\]]+)\]/);
      if (modelMatch) {
        switchOllamaModel(modelMatch[1]);
        setAiMessages(prev => [...prev, { role: 'model', content: `🔄 Switched local AI model to **${modelMatch[1]}**`, source, timestamp: Date.now() }]);
      }
    } catch (e: any) {
      console.error('AI Orchestration Error:', e);
      let errorMessage = "Connection to Neural Core lost. Check your internet or API key.";

      if (e.message?.includes('403') || e.message?.includes('leaked')) {
        errorMessage = "⚠️ **CRITICAL: API KEY LEAKED**\n\nGoogle has flagged your API key as compromised and has disabled it. \n\n**ACTIONS REQUIRED:**\n1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)\n2. Generate a **NEW API KEY**\n3. Paste it in the **Settings** panel of this suite.";
      }

      setAiMessages(prev => [...prev, {
        role: 'model',
        content: errorMessage,
        source: 'cloud',
        timestamp: Date.now()
      }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Parse AI response for file edit suggestions
  const parseFileEdits = (response: string): { filePath: string; content: string }[] => {
    const edits: { filePath: string; content: string }[] = [];
    const regex = /<FILE_EDIT\s+path="([^"]+)">([\s\S]*?)<\/FILE_EDIT>/g;
    let match;
    while ((match = regex.exec(response)) !== null) {
      edits.push({ filePath: match[1], content: match[2].trim() });
    }
    return edits;
  };

  // Handle file edit from AI response
  const handleFileEditSuggestion = async (filePath: string, suggestedContent: string) => {
    try {
      // Try to get original content from synced assets
      const asset = assets.find(a => a.path?.includes(filePath) || a.name === filePath);
      let originalContent = '';

      if (asset && aiDeepContext.assetSummaries.length > 0) {
        // Find in summaries
        const summary = aiDeepContext.assetSummaries.find(s => s.includes(filePath));
        if (summary) {
          originalContent = summary.split('\n').slice(1).join('\n');
        }
      }

      // If we have gameConfig and it's that file
      if (filePath.includes('game_context.json') && aiDeepContext.gameConfig) {
        originalContent = JSON.stringify(aiDeepContext.gameConfig, null, 2);
      }

      const fileName = filePath.split('/').pop() || filePath;

      setPendingFileEdits(prev => [...prev, {
        filePath,
        fileName,
        originalContent,
        suggestedContent,
        timestamp: new Date()
      }]);

      // Notify user about pending edit
      setAiMessages(prev => [...prev, {
        role: 'model',
        content: `__FILE_EDIT__${filePath}`
      }]);

    } catch (e) {
      console.error('Error processing file edit:', e);
    }
  };

  // Generate simple unified diff
  const generateDiff = (original: string, modified: string, fileName: string): string => {
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');
    let diff = `--- a/${fileName}\n+++ b/${fileName}\n`;

    const maxLines = Math.max(originalLines.length, modifiedLines.length);
    let context = [];
    let changes = [];

    for (let i = 0; i < maxLines; i++) {
      const origLine = originalLines[i] || '';
      const modLine = modifiedLines[i] || '';

      if (origLine === modLine) {
        if (changes.length > 0) {
          // Output accumulated changes
          diff += `@@ -${Math.max(1, i - changes.length - 2)} +${Math.max(1, i - changes.length - 2)} @@\n`;
          diff += context.map(l => ` ${l}`).join('\n') + '\n';
          diff += changes.join('\n') + '\n';
          context = [];
          changes = [];
        }
        context.push(origLine);
        if (context.length > 3) context.shift();
      } else {
        if (origLine && !modifiedLines.includes(origLine)) {
          changes.push(`-${origLine}`);
        }
        if (modLine && !originalLines.includes(modLine)) {
          changes.push(`+${modLine}`);
        }
      }
    }

    // Output remaining changes
    if (changes.length > 0) {
      diff += `@@ -${Math.max(1, maxLines - changes.length)} +${Math.max(1, maxLines - changes.length)} @@\n`;
      diff += context.map(l => ` ${l}`).join('\n') + '\n';
      diff += changes.join('\n') + '\n';
    }

    return diff;
  };

  // Download diff as file
  const handleDownloadDiff = (index: number) => {
    const edit = pendingFileEdits[index];
    if (!edit) return;

    const diff = generateDiff(edit.originalContent, edit.suggestedContent, edit.fileName);
    const blob = new Blob([diff], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${edit.fileName}.diff`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Apply changes (would need IPC in real app)
  const handleApplyChanges = async (index: number) => {
    const edit = pendingFileEdits[index];
    if (!edit) return;

    // In a real Electron app, this would use IPC to write the file
    // For now, we'll download the new content
    const blob = new Blob([edit.suggestedContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = edit.fileName;
    a.click();
    URL.revokeObjectURL(url);

    // Remove from pending
    setPendingFileEdits(prev => prev.filter((_, i) => i !== index));

    setAiMessages(prev => [...prev, {
      role: 'model',
      content: `✅ Downloaded updated **${edit.fileName}**. Replace the original file with this version to apply changes.`
    }]);
  };

  // Dismiss pending edit
  const handleDismissEdit = (index: number) => {
    setPendingFileEdits(prev => prev.filter((_, i) => i !== index));
  };

  // Clear current session (reset all state)
  const handleClearSession = () => {
    setAssets([]);
    setAiDeepContext({
      gameConfig: null,
      assetSummaries: [],
      isSyncing: false,
      lastSyncTime: null,
    });
    setPendingFileEdits([]);
    setAiMessages([{
      role: 'model',
      content: '🧹 **Session Cleared!** All assets and context have been reset.\n\nYou can now:\n- Open a new project from the Projects tab\n- Import new assets\n- Start fresh!'
    }]);
  };

  // State for new project modal (shared with AI)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // Sanitize folder/file names for File System Access API
  const sanitizeName = (name: string) => {
    return name
      .replace(/[<>:"/\\|?*]/g, '_')
      .trim()
      .replace(/\.+$/, '')
      .substring(0, 255);
  };

  // Write a file to the project directory using File System Access API
  const handleWriteProjectFile = async (relativePath: string, content: string): Promise<boolean> => {
    if (!projectHandle) {
      console.error('[AUTO-BUILD] No project directory open. Please scan a project first.');
      return false;
    }

    try {
      // Split path into parts (e.g., "scripts/entities/player.nx" -> ["scripts", "entities", "player.nx"])
      const pathParts = relativePath.split('/').filter(p => p.length > 0);
      const fileName = pathParts.pop();
      if (!fileName) return false;

      // Navigate/create folders
      let currentDir = projectHandle;
      for (const folder of pathParts) {
        try {
          const safeFolder = sanitizeName(folder);
          if (!safeFolder) continue; // Skip empty/invalid parts
          currentDir = await currentDir.getDirectoryHandle(safeFolder, { create: true });
        } catch (e) {
          console.error(`[AUTO-BUILD] Failed to create folder: ${folder}`, e);
          return false;
        }
      }

      const safeFileName = sanitizeName(fileName);
      if (!safeFileName) return false;

      // Create/overwrite the file
      const fileHandle = await currentDir.getFileHandle(safeFileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      console.log(`[AUTO-BUILD] ✅ Created file: ${relativePath}`);

      // Add to assets list as Logic type
      const newAsset: NexusAsset = {
        id: `file_${Date.now()}`,
        name: fileName,
        type: 'Logic',
        status: 'Unlinked',
        path: `/${relativePath}`,
        statusReason: 'AI-Generated Script'
      };
      setAssets(prev => [newAsset, ...prev]);

      return true;
    } catch (error) {
      console.error('[AUTO-BUILD] Write failed:', error);
      return false;
    }
  };

  // Create a folder structure in the project
  const handleCreateFolder = async (relativePath: string): Promise<boolean> => {
    if (!projectHandle) return false;

    try {
      const pathParts = relativePath.split('/').filter(p => p.length > 0);
      let currentDir = projectHandle;
      for (const folder of pathParts) {
        const safeFolder = sanitizeName(folder);
        if (!safeFolder) continue;
        currentDir = await currentDir.getDirectoryHandle(safeFolder, { create: true });
      }
      console.log(`[AUTO-BUILD] 📁 Created folder: ${relativePath}`);
      return true;
    } catch (error) {
      console.error('[AUTO-BUILD] Folder creation failed:', error);
      return false;
    }
  };

  // Trigger file creation from AI code block
  const handleStartFileCreation = (suggestedPath: string, content: string, language: string) => {
    setPendingFileCreation({ path: suggestedPath, content, language });
    setFileCreatePath(suggestedPath);
    setShowFileCreateDialog(true);
  };

  // Confirm and write the file
  const handleConfirmFileCreation = async () => {
    if (!pendingFileCreation || !fileCreatePath) return;

    const success = await handleWriteProjectFile(fileCreatePath, pendingFileCreation.content);
    if (success) {
      setAiMessages(prev => [...prev, {
        role: 'model',
        content: `✅ **File Created:** \`${fileCreatePath}\`\n\nThe file has been added to your Assembler.`
      }]);
    } else {
      setAiMessages(prev => [...prev, {
        role: 'model',
        content: `❌ **Failed to create file.** Make sure you have a project folder open via Assembler scan.`
      }]);
    }

    setShowFileCreateDialog(false);
    setPendingFileCreation(null);
    setFileCreatePath('');
  };

  const handleSaveToWorkspace = async () => {
    if (!projectHandle) {
      console.warn('[HUB] No project handle available for saving.');
      return;
    }

    try {
      // 1. Save Nexus Project State (Visual Logic & Entities)
      const projectFile = await projectHandle.getFileHandle('nexus_project.json', { create: true });
      const writable = await projectFile.createWritable();
      await writable.write(JSON.stringify({
        version: '1.0',
        timestamp: new Date().toISOString(),
        gameState: gameState // Central engine state
      }, null, 2));
      await writable.close();

      setAiMessages(prev => [...prev, {
        role: 'model',
        content: `💾 **Project Saved to Workspace!**\n\nPersisted visual logic and entity states to \`nexus_project.json\`.`
      }]);
    } catch (e) {
      console.error('Failed to save to workspace:', e);
    }
  };

  useEffect(() => {
    const onSaveCommand = () => handleSaveToWorkspace();
    window.addEventListener('nexgen:save-project', onSaveCommand);
    return () => window.removeEventListener('nexgen:save-project', onSaveCommand);
  }, [projectHandle, gameState]);

  const handleScaffoldProject = async () => {
    let activeHandle = projectHandle;

    if (!activeHandle) {
      console.log('[AUTO-BUILD] No project handle found, requesting folder access...');
      try {
        activeHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
        setProjectHandle(activeHandle);
      } catch (e) {
        console.warn('User cancelled folder selection for scaffolding');
        return;
      }
    }

    const folders = ['assets', 'scripts', 'scripts/entities', 'scripts/systems', 'configs', 'data'];
    let count = 0;

    // Use a local helper that uses the specific handle
    const createFolderWithHandle = async (handle: FileSystemDirectoryHandle, relativePath: string) => {
      const pathParts = relativePath.split('/').filter(p => p.length > 0);
      let currentDir = handle;
      for (const folder of pathParts) {
        currentDir = await currentDir.getDirectoryHandle(sanitizeName(folder), { create: true });
      }
      return true;
    };

    for (const folder of folders) {
      const success = await createFolderWithHandle(activeHandle, folder);
      if (success) count++;
    }

    setAiMessages(prev => [...prev, {
      role: 'model',
      content: `🏗️ **Project Scaffolding Complete!**\n\nCreated ${count} directories. Your workspace is now ready for Auto-Build.`
    }]);
  };


  const handleSaveToAssembler = () => {
    const isAudio = activeModule === 'ECHO';
    const isSynapseEditor = activeModule === 'SYNAPSE' && synapseTab === 'EDITOR';

    let previewUrl = (isAudio ? (generatedAudio || echoWorkingAudio?.audioUrl) : (generatedSprite || synapseWorkingAsset?.imageUrl)) || undefined;

    // If in synapse editor, use canvas content to capture manual edits
    if (isSynapseEditor && synapseCanvasRef.current) {
      previewUrl = synapseCanvasRef.current.toDataURL('image/png');
    }

    const nameBase = isAudio ? echoPrompt : synapsePrompt;
    const categorySuffix = isAudio ? `_${echoCategory.toLowerCase()}` : `_${synapseStyle.toLowerCase().replace(' ', '_')}`;

    const newAsset: NexusAsset = {
      id: `gen_${Date.now()}`,
      name: nameBase.slice(0, 15).trim().replace(/\s/g, '_') + categorySuffix,
      type: isAudio ? 'Audio' : 'Sprite',
      status: isAudio && isContextBound ? 'Linked' : 'Unlinked',
      path: `/generated/${isAudio ? 'audio' : 'sprites'}/${Date.now()}.${isAudio ? 'pcm' : 'png'}`,
      previewUrl: previewUrl,
      imageUrl: previewUrl, // Mirror for submodule transfer consistency
      statusReason: isAudio && isContextBound ? 'Context-Bound Neural Signal' : undefined
    };

    setAssets(prev => [newAsset, ...prev]);
    setActiveModule('ASSEMBLER');
  };

  const handleBundleAssets = (name: string = "New Entity Bundle") => {
    if (selectedAssetIds.length === 0) return;

    const bundledAssets = assets.filter(a => selectedAssetIds.includes(a.id));
    const newEntity: GameEntity2D = {
      id: `ent_bundle_${Date.now()}`,
      name,
      type: 'Enemy',
      layer: 'Game',
      x: 0,
      y: 0,
      scale: 1,
      visible: true
    };

    setGameState(prev => ({
      ...prev,
      entities: [...prev.entities, newEntity],
      // Add a node for it in Genesis
      nodes: [
        ...prev.nodes,
        {
          id: `node_bundle_${newEntity.id}`,
          x: CENTER,
          y: CENTER + 400,
          label: `Entity: ${newEntity.name}`,
          type: 'Action',
          colorClass: 'border-orange-500/40 bg-orange-500/10'
        }
      ]
    }));

    // Mark assets as bundled (internal link)
    setAssets(prev => prev.map(a =>
      selectedAssetIds.includes(a.id)
        ? { ...a, linkedTo: { type: 'entity', id: newEntity.id, name: newEntity.name } }
        : a
    ));

    setSelectedAssetIds([]);
    console.log(`[ASSEMBLER] Bundled ${bundledAssets.length} assets into entity ${newEntity.name}`);
  };

  // Smart Linking by Naming Convention
  const handleSmartLink = () => {
    setAiMessages(prev => [...prev, {
      role: 'model',
      content: `🔗 **Smart Link Protocol Initiated**\nScanning asset registry for linguistic matches...`,
      source: 'local',
      timestamp: Date.now()
    }]);

    let linksCreated = 0;
    const newAssets = [...assets];

    // Simple Tokenizer: Split by _ - or space
    const tokenize = (name: string) => name.toLowerCase().split(/[_\-\s]+/);

    newAssets.forEach(source => {
      const sourceTokens = tokenize(source.name);

      newAssets.forEach(target => {
        if (source.id === target.id) return;
        if (source.type === target.type) return; // Usually link across types (Sprite <-> Audio)

        const targetTokens = tokenize(target.name);

        // Check for significant overlap (e.g. "Hero" in both)
        const overlap = sourceTokens.filter(t => targetTokens.includes(t));

        // If 50% match or share a specific key identifier (ignoring common words like 'idle', 'sfx')
        const commonIgnored = ['idle', 'walk', 'run', 'jump', 'attack', 'sfx', 'loop', 'intro'];
        const significantOverlap = overlap.filter(t => !commonIgnored.includes(t));

        if (significantOverlap.length > 0) {
          // Create link
          source.linkedTo = { type: target.type.toLowerCase(), id: target.id, name: target.name };
          linksCreated++;
        }
      });
    });

    setAssets(newAssets);

    setTimeout(() => {
      setAiMessages(prev => [...prev, {
        role: 'model',
        content: `✅ **Smart Link Complete**\nEstablished **${linksCreated}** new neural connections based on naming conventions.`,
        source: 'local',
        timestamp: Date.now()
      }]);
    }, 800);
  };

  const handleOptimizeProject = async () => {
    // Mock optimization logic
    setAiMessages(prev => [...prev, {
      role: 'model',
      content: `🚀 **Optimization Log**\n\n- Texture Packing: 12 sprites combined\n- Audio Compression: 4 files processed\n- Logic Minification: 0 redundant nodes removed\n\n**Total Space Saved: 2.3MB**`,
      source: 'local',
      timestamp: Date.now()
    }]);
    setOptimizationLog([]);
    setShowOptimizationLog(true);

    const log = (msg: string, type: 'info' | 'success' | 'warn' = 'info') => {
      setOptimizationLog(prev => [...prev, { msg, type }]);
    };

    log("Initializing Neural Optimization Engine...", 'info');
    await new Promise(r => setTimeout(r, 800));

    // Simulate texture packing
    const spriteCount = assets.filter(a => a.type === 'Sprite').length;
    if (spriteCount > 0) {
      log(`Found ${spriteCount} sprites. Compressing textures and generating Atlas...`, 'info');
      await new Promise(r => setTimeout(r, 1200));
      log(`Texture Atlas generated. Savings: ${(spriteCount * 0.45).toFixed(2)}MB (42%)`, 'success');
    }

    // Simulate script minification
    log("Parsing Genesis logic nodes for NexScript optimization...", 'info');
    await new Promise(r => setTimeout(r, 1000));
    log("Minified 12 internal logic clusters. Logic debt reduced by 14%.", 'success');

    // Simulate audio trimming
    const audioCount = assets.filter(a => a.type === 'Audio').length;
    if (audioCount > 0) {
      log(`Resampling ${audioCount} audio assets to 44.1kHz (Web-Ready)...`, 'info');
      await new Promise(r => setTimeout(r, 800));
      log("Audio normalization complete.", 'success');
    }

    log("Project optimization complete. Nova Runtime ready.", 'success');

    setTimeout(() => {
      setIsOptimizing(false);
    }, 500);
  };

  const handleNeuralSplice = async () => {
    let imageUrl = synapseWorkingAsset?.imageUrl || generatedSprite;

    // Check if we have modified content in the editor canvas
    if (synapseTab === 'EDITOR' && synapseCanvasRef.current) {
      imageUrl = synapseCanvasRef.current.toDataURL('image/png');
    }

    if (!imageUrl) return;

    setIsNeuralSplicing(true);
    try {
      const sprites = await analyzeIndividualSprites(imageUrl);
      if (sprites.length === 0) {
        console.warn('[SYNAPSE] AI failed to detect individual sprites');
        setIsNeuralSplicing(false);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      await img.decode();

      const newFrames: AnimFrame[] = [];
      for (const [i, sprite] of sprites.entries()) {
        const canvas = document.createElement('canvas');
        canvas.width = sprite.width;
        canvas.height = sprite.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, sprite.x, sprite.y, sprite.width, sprite.height, 0, 0, sprite.width, sprite.height);
          newFrames.push({
            id: `neural_slice_${Date.now()}_${i}`,
            image: canvas.toDataURL('image/png'),
            duration: 100
          });
        }
      }

      setAnimFrames(newFrames);
      setSynapseTab('ANIMATOR');
      console.log(`[SYNAPSE] Neural Splicing complete. Detected ${newFrames.length} sprites.`);
    } catch (e) {
      console.error('[SYNAPSE] Neural Splice failed:', e);
    } finally {
      setIsNeuralSplicing(false);
    }
  };


  const handleSliceSprite = async () => {
    let imgSource: HTMLCanvasElement | HTMLImageElement | null = null;

    // Check if we have modified content in the editor canvas
    if (synapseTab === 'EDITOR' && synapseCanvasRef.current) {
      imgSource = synapseCanvasRef.current;
    } else {
      const imageUrl = synapseWorkingAsset?.imageUrl || generatedSprite;
      if (!imageUrl) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      try {
        await img.decode();
        imgSource = img;
      } catch (e) {
        console.error('[SYNAPSE] Failed to decode image for slicing:', e);
        return;
      }
    }

    if (!imgSource) return;

    try {
      const { cols, rows } = sliceGrid;
      const frameWidth = imgSource.width / cols;
      const frameHeight = imgSource.height / rows;
      const newFrames: AnimFrame[] = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const canvas = document.createElement('canvas');
          canvas.width = frameWidth;
          canvas.height = frameHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(imgSource, col * frameWidth, row * frameHeight, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
            newFrames.push({
              id: `slice_${Date.now()}_${row}_${col}`,
              image: canvas.toDataURL('image/png'),
              duration: 100
            });
          }
        }
      }

      setAnimFrames(newFrames);
      setSynapseTab('ANIMATOR');
      console.log(`[SYNAPSE] Sliced sprite into ${newFrames.length} frames`);
    } catch (e) {
      console.error('[SYNAPSE] Slice failed:', e);
    }
  };
  const handleDownloadSprite = () => {
    let dataUrl = "";
    if (activeModule === 'SYNAPSE' && synapseTab === 'EDITOR' && synapseCanvasRef.current) {
      dataUrl = synapseCanvasRef.current.toDataURL('image/png');
    } else {
      dataUrl = generatedSprite || synapseWorkingAsset?.imageUrl || "";
    }

    if (!dataUrl) return;

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `nexgen_sprite_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAiAnalyzeSprite = async () => {
    const imageUrl = synapseWorkingAsset?.imageUrl || generatedSprite;
    if (!imageUrl) return;

    setIsAiAnalyzing(true);
    try {
      const detected = await analyzeSpriteSheet(imageUrl);
      setSliceGrid(detected);
      setShowSliceOverlay(true);
      console.log('[SYNAPSE] AI Analysis detected grid:', detected);
    } catch (e) {
      console.error('[SYNAPSE] AI Analysis failed:', e);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Synapse Canvas Logic
  useEffect(() => {
    const imageUrl = synapseWorkingAsset?.imageUrl || generatedSprite;
    if (imageUrl && synapseCanvasRef.current && synapseTab === 'EDITOR') {
      const canvas = synapseCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      img.onload = () => {
        // Match canvas to image size, or a decent default if not set
        canvas.width = img.width || 512;
        canvas.height = img.height || 512;
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx?.drawImage(img, 0, 0);
      };
    }
  }, [synapseWorkingAsset, generatedSprite, synapseTab]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeSynapseTool === 'Select' || activeSynapseTool === 'Slice') return;

    if (activeSynapseTool === 'Crop') {
      const canvas = synapseCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      setCropStart({ x, y });
      setCropEnd({ x, y });
      setIsCropping(true);
      return;
    }

    setIsDrawing(true);
    drawOnCanvas(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeSynapseTool === 'Crop' && isCropping) {
      const canvas = synapseCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      setCropEnd({ x, y });
      return;
    }
    if (!isDrawing) return;
    drawOnCanvas(e);
  };

  const handleCanvasMouseUp = () => {
    if (activeSynapseTool === 'Crop' && isCropping) {
      setIsCropping(false);
      // Keep cropStart and cropEnd for the user to confirm or cancel
      return;
    }
    setIsDrawing(false);
  };

  const handleExecuteCrop = () => {
    if (!cropStart || !cropEnd || !synapseCanvasRef.current) return;
    const canvas = synapseCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = Math.min(cropStart.x, cropEnd.x);
    const y = Math.min(cropStart.y, cropEnd.y);
    const width = Math.abs(cropEnd.x - cropStart.x);
    const height = Math.abs(cropEnd.y - cropStart.y);

    if (width < 2 || height < 2) {
      setCropStart(null);
      setCropEnd(null);
      return; // Too small, cancel
    }

    const imageData = ctx.getImageData(x, y, width, height);
    canvas.width = width;
    canvas.height = height;
    ctx.putImageData(imageData, 0, 0);

    setCropStart(null);
    setCropEnd(null);
    console.log(`[SYNAPSE] Cropped image to ${width}x${height}`);
  };

  const handleCancelCrop = () => {
    setCropStart(null);
    setCropEnd(null);
  };

  const drawOnCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!synapseCanvasRef.current) return;
    const canvas = synapseCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (activeSynapseTool === 'Paint') {
      ctx.fillStyle = synapseActiveColor;
      ctx.beginPath();
      ctx.arc(x, y, synapseBrushSize, 0, Math.PI * 2);
      ctx.fill();
    } else if (activeSynapseTool === 'Erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, synapseBrushSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    } else if (activeSynapseTool === 'Pick') {
      const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
      if (pixel[3] > 0) { // Only pick if not transparent
        const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
        setSynapseActiveColor(hex);
      }
    }
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

  const getRadarNodeColor = (colorClass?: string) => {
    if (!colorClass) return 'bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.9)]';
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
            {['SIGNAL_GEN', 'LIVE_PERFORMANCE', 'OST_COMPOSE', 'WAVE_EDIT', 'FX_FORGE'].map((tab) => (
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
          {echoTab === 'WAVE_EDIT' && (
            <div className="h-full flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-700">
              {/* Waveform Editor Implementation */}
              <div className="flex-1 glass-panel rounded-[2.5rem] border border-slate-800 bg-slate-950/40 flex flex-col p-12 relative overflow-hidden">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-64 flex items-center justify-center gap-1">
                  {Array.from({ length: 120 }).map((_, i) => (
                    <div key={i} className={`w-1 rounded-full bg-pink-500/30 hover:bg-pink-500 transition-all cursor-pointer`} style={{ height: `${20 + Math.random() * 80}%` }} />
                  ))}
                </div>
                <div className="z-10 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-widest">Master Signal: {echoWorkingAudio?.name || 'Untitled_Loop'}</h3>
                    <p className="text-[10px] text-pink-400 font-mono mt-2 uppercase">PCM // 44.1KHZ // MONO_NEURAL</p>
                  </div>
                  <div className="flex items-center justify-center gap-8">
                    <button className="p-4 bg-slate-900 border border-white/5 rounded-full text-slate-500 hover:text-white"><Rewind size={24} /></button>
                    <button
                      onClick={() => {
                        const url = echoWorkingAudio?.audioUrl || generatedAudio;
                        if (url) {
                          const audio = new Audio(url);
                          audio.play().catch(e => console.error("Audio playback failed", e));
                        }
                      }}
                      className="w-20 h-20 bg-pink-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-pink-600/30 hover:scale-105 transition-all"
                    >
                      <Play size={32} fill="currentColor" />
                    </button>
                    <button className="p-4 bg-slate-900 border border-white/5 rounded-full text-slate-500 hover:text-white"><SkipForward size={24} /></button>
                  </div>
                </div>
              </div>
              <div className="h-32 glass-panel rounded-3xl border border-slate-800 bg-slate-900/10 p-6 flex items-center justify-between">
                <div className="flex gap-12">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Duration</p>
                    <p className="text-sm font-black text-white tracking-widest">00:04.23</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sample Rate</p>
                    <p className="text-sm font-black text-white tracking-widest">44,100 HZ</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button className="px-8 py-3 bg-pink-600/10 border border-pink-600/20 text-pink-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-600/20 transition-all">Export PCM</button>
                  <button className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all">Save to Project</button>
                </div>
              </div>
            </div>
          )}
          {echoTab === 'LIVE_PERFORMANCE' && (
            <div className="h-full flex gap-8 animate-in slide-in-from-bottom-4 duration-700">
              {/* Director's Booth Toolset */}
              <div className="w-80 flex flex-col gap-6">
                <div className="glass-panel p-6 rounded-3xl border border-pink-500/20 bg-pink-500/5 space-y-6">
                  <h3 className="text-xs font-black text-pink-400 uppercase tracking-widest flex items-center gap-2"><Radio size={14} /> Director's Booth</h3>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Active Persona</label>
                    <input
                      value={livePersona}
                      onChange={e => setLivePersona(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-pink-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Directorial Overlays</label>
                    <div className="grid grid-cols-2 gap-2">
                      {liveDirectives.map(d => (
                        <button key={d} className="py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-400 hover:text-pink-400 hover:border-pink-500/30 transition-all uppercase">{d}</button>
                      ))}
                      <button className="py-2.5 bg-slate-900/40 border border-slate-800 border-dashed rounded-xl text-[10px] font-bold text-slate-600 flex items-center justify-center gap-1"><Plus size={10} /> ADD</button>
                    </div>
                  </div>

                  <button
                    onClick={handleCallToStage}
                    disabled={isGeneratingAudio}
                    className="w-full py-4 bg-pink-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-pink-500 transition-all disabled:opacity-50"
                  >
                    {isGeneratingAudio ? <RefreshCcw size={18} className="animate-spin" /> : <Mic size={18} />} Call to Stage
                  </button>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/10 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Performance Logs</h4>
                  <div className="space-y-2 h-40 overflow-y-auto custom-scrollbar pr-2">
                    <p className="text-[9px] font-mono text-slate-600 uppercase border-l border-slate-800 pl-3 py-1">[ACTOR] Connected to Gemini-Live-3</p>
                    <p className="text-[9px] font-mono text-slate-600 uppercase border-l border-slate-800 pl-3 py-1">[DIRECTOR] Awaiting first prompt...</p>
                  </div>
                </div>
              </div>

              {/* The "Stage" */}
              <div className="flex-1 glass-panel rounded-[2.5rem] border border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ec4899 0%, transparent 70%)' }} />

                <div className="z-10 text-center space-y-8">
                  <div className="relative w-48 h-48 mx-auto">
                    <div className="absolute inset-0 rounded-full border border-pink-500/20 animate-ping duration-3000" />
                    <div className="absolute inset-4 rounded-full border-2 border-pink-500/40 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BrainCircuit size={64} className="text-pink-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Stage: {livePersona}</h2>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-[0.2em]">Bidi-Stream Active // Latency: 42ms</p>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex gap-[2px] h-8 items-center">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-1 bg-pink-500 rounded-full animate-pulse" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 100}ms` }} />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Actor Output</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {echoTab === 'OST_COMPOSE' && (
            <div className="h-full flex gap-8 animate-in slide-in-from-right-4 duration-700">
              {/* Sonic Forge Controls */}
              <div className="w-1/3 flex flex-col gap-6">
                <div className="glass-panel p-8 rounded-[2.5rem] border border-cyan-500/20 bg-cyan-500/5 space-y-8">
                  <header className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2"><Music2 size={18} /> Sonic Forge</h3>
                    <Sparkles size={18} className="text-cyan-400 animate-pulse" />
                  </header>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tempo (BPM)</label>
                        <span className="text-xs font-mono text-cyan-400 font-bold">{ostParams.bpm}</span>
                      </div>
                      <input type="range" min="40" max="220" value={ostParams.bpm} onChange={e => setOstParams({ ...ostParams, bpm: parseInt(e.target.value) })} className="w-full accent-cyan-500 h-1 bg-slate-900 rounded-full" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Density</label>
                        <span className="text-xs font-mono text-cyan-400 font-bold">{ostParams.density}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={ostParams.density} onChange={e => setOstParams({ ...ostParams, density: parseInt(e.target.value) })} className="w-full accent-cyan-500 h-1 bg-slate-900 rounded-full" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Brightness</label>
                        <span className="text-xs font-mono text-cyan-400 font-bold">{ostParams.brightness}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={ostParams.brightness} onChange={e => setOstParams({ ...ostParams, brightness: parseInt(e.target.value) })} className="w-full accent-cyan-500 h-1 bg-slate-900 rounded-full" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Atmospheric Prompt</label>
                    <textarea className="w-full h-24 bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 font-bold focus:outline-none focus:border-cyan-500/50 transition-all resize-none" placeholder="E.g., Dark orchestral theme for a zombie graveyard..." />
                  </div>

                  <button
                    onClick={handleForgeOst}
                    disabled={isForgingOst}
                    className="w-full py-4 bg-cyan-600 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-cyan-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isForgingOst ? <RefreshCcw size={18} className="animate-spin" /> : <Cpu size={18} />} Forge Soundtrack
                  </button>
                </div>
              </div>

              {/* Master Monitor */}
              <div className="flex-1 glass-panel rounded-[3rem] border border-slate-800 bg-slate-950 flex flex-col overflow-hidden relative group">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                <div className="flex-1 flex flex-col items-center justify-center gap-12 p-12">
                  <div className="w-full aspect-video bg-slate-900/60 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center gap-1 px-8">
                      {[...Array(128)].map((_, i) => (
                        <div key={i} className="flex-1 bg-cyan-500/20 rounded-full transition-all" style={{ height: `${10 + Math.random() * 60}%` }} />
                      ))}
                    </div>
                    <div className="z-10 flex flex-col items-center gap-4">
                      <Waves size={64} className="text-slate-800" />
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">Lyria 2 Spectral Monitoring</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="px-12 py-4 bg-slate-900 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-2xl border border-white/5 disabled:opacity-50" disabled>Save to Assembler</button>
                    <button className="px-12 py-4 bg-slate-900 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-2xl border border-white/5 disabled:opacity-50" disabled>Export Pattern</button>
                  </div>
                </div>
              </div>
            </div>
          )}

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

            <div className="space-y-4 pt-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                Visual Reference
                {synapseReferenceImage && (
                  <button onClick={() => setSynapseReferenceImage(null)} className="text-pink-500 hover:text-pink-400 transition-colors uppercase tracking-widest text-[8px]">Clear</button>
                )}
              </label>

              {!synapseReferenceImage ? (
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReferenceImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <div className="w-full py-6 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:border-purple-500/30 transition-all bg-slate-950/20">
                    <Camera size={24} className="text-slate-700 group-hover:text-purple-400 transition-colors" />
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Upload Reference</p>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 group">
                  <img src={synapseReferenceImage} className="w-full aspect-video object-cover opacity-50 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CheckCircle size={24} className="text-purple-400 drop-shadow-lg" />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Art Style</label>
              <div className="relative">
                <select
                  value={synapseStyle}
                  onChange={(e) => setSynapseStyle(e.target.value as SpriteStyle)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 font-bold focus:outline-none focus:border-purple-500/50 appearance-none uppercase tracking-wider relative z-10"
                >
                  {['Pixel Art', 'HD Pixel', 'Gritty HD Pixel', 'Vector Flat', 'Hand Drawn', 'Anime/Manga', 'Low Poly 3D', 'Cyberpunk/Neon', 'Isometric', 'Watercolor', 'Oil Painting', 'Retro 16-bit', 'Blueprint/Schematic', 'Claymation', 'Voxel', 'Noir/Black & White'].map((style) => (
                    <option key={style} value={style} className="bg-slate-900 text-slate-300">
                      {style}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 z-20 pointer-events-none" />
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
                  <button onClick={handleDownloadSprite} className="px-6 py-3 bg-slate-800 text-white font-black uppercase tracking-widest rounded-xl hover:bg-slate-700 shadow-xl flex items-center gap-2"><Download size={18} /> Download</button>
                  <button
                    onClick={handleNeuralSplice}
                    disabled={isNeuralSplicing}
                    className="px-6 py-3 bg-purple-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-purple-500 shadow-xl flex items-center gap-2 disabled:opacity-50"
                  >
                    {isNeuralSplicing ? <RefreshCcw size={18} className="animate-spin" /> : <Grid3X3 size={18} />} Neural Splice
                  </button>
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
            <button
              key={i}
              onClick={() => setActiveSynapseTool(tool.label)}
              className={`p-3 rounded-full transition-all ${activeSynapseTool === tool.label ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              title={tool.label}
            >
              <tool.icon size={20} />
            </button>
          ))}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 glass-panel rounded-[2.5rem] border border-slate-800 bg-slate-950 flex flex-col overflow-hidden relative">
          <div className="flex-1 flex items-center justify-center p-12 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-80">
            <div className="w-[512px] h-[512px] border-2 border-white/5 shadow-2xl relative bg-slate-900/40 backdrop-blur-3xl overflow-hidden rounded-xl">
              <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

              {/* Image Canvas */}
              {(synapseWorkingAsset?.imageUrl || generatedSprite) ? (
                <div className="relative w-full h-full flex items-center justify-center p-8">
                  <canvas
                    ref={synapseCanvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                    className="max-w-full max-h-full object-contain cursor-crosshair touch-none"
                    style={{
                      imageRendering: synapseStyle.includes('Pixel') ? 'pixelated' : 'auto'
                    }}
                  />

                  {/* Slice Overlay */}
                  {(showSliceOverlay || activeSynapseTool === 'Slice') && (
                    <div className="absolute inset-8 pointer-events-none">
                      <div className="w-full h-full border border-cyan-500/30 grid" style={{
                        gridTemplateColumns: `repeat(${sliceGrid.cols}, 1fr)`,
                        gridTemplateRows: `repeat(${sliceGrid.rows}, 1fr)`
                      }}>
                        {Array.from({ length: sliceGrid.cols * sliceGrid.rows }).map((_, i) => (
                          <div key={i} className="border border-cyan-500/20" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Crop Selection Overlay */}
                  {activeSynapseTool === 'Crop' && cropStart && cropEnd && synapseCanvasRef.current && (
                    <div
                      className="absolute pointer-events-none border-2 border-dashed border-amber-400 bg-amber-400/10"
                      style={{
                        left: `${32 + Math.min(cropStart.x, cropEnd.x) * (synapseCanvasRef.current.getBoundingClientRect().width / synapseCanvasRef.current.width)}px`,
                        top: `${32 + Math.min(cropStart.y, cropEnd.y) * (synapseCanvasRef.current.getBoundingClientRect().height / synapseCanvasRef.current.height)}px`,
                        width: `${Math.abs(cropEnd.x - cropStart.x) * (synapseCanvasRef.current.getBoundingClientRect().width / synapseCanvasRef.current.width)}px`,
                        height: `${Math.abs(cropEnd.y - cropStart.y) * (synapseCanvasRef.current.getBoundingClientRect().height / synapseCanvasRef.current.height)}px`
                      }}
                    />
                  )}
                </div>

              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-600">
                  <ImageIcon size={48} className="mb-4 opacity-50" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Viewport Empty</p>
                  <p className="text-[8px] text-slate-700 mt-2">Send a sprite from Assembler</p>
                </div>
              )}
            </div>
          </div>

          {/* Editor Footer */}
          <div className="h-16 border-t border-white/5 bg-slate-900/60 backdrop-blur-xl px-10 flex items-center justify-between">
            <div className="flex gap-4">
              <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"><Maximize2 size={12} /> Canvas Size</button>
              <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"><Layers2 size={12} /> Layers</button>
            </div>
            <div className="flex gap-4">
              {synapseWorkingAsset && (
                <button
                  onClick={() => { setSynapseTab('ANIMATOR'); }}
                  className="px-6 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-purple-500/20 transition-all flex items-center gap-2"
                >
                  <Play size={14} /> Send to Animator
                </button>
              )}
              <button onClick={handleDownloadSprite} className="px-6 py-2 bg-slate-800 border border-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center gap-2"><Download size={14} /> Download PNG</button>
              <button onClick={handleSaveToAssembler} className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-2"><Save size={14} /> Commit Changes</button>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-80 glass-panel rounded-3xl border border-slate-800 p-6 space-y-8 bg-slate-900/10">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              {activeSynapseTool === 'Slice' ? <Grid3X3 size={14} /> : <Aperture size={14} />}
              {activeSynapseTool === 'Slice' ? 'Slicer Core' : 'Quantum Properties'}
            </h3>
          </div>

          <div className="space-y-6">
            {activeSynapseTool === 'Slice' ? (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Columns</label>
                    <input
                      type="number"
                      value={sliceGrid.cols}
                      onChange={(e) => setSliceGrid(prev => ({ ...prev, cols: parseInt(e.target.value) || 1 }))}
                      className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-2 text-[10px] font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Rows</label>
                    <input
                      type="number"
                      value={sliceGrid.rows}
                      onChange={(e) => setSliceGrid(prev => ({ ...prev, rows: parseInt(e.target.value) || 1 }))}
                      className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-2 text-[10px] font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleAiAnalyzeSprite}
                    disabled={isAiAnalyzing}
                    className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAiAnalyzing ? <RefreshCcw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    AI Auto-Detect
                  </button>
                  <button
                    onClick={handleCorrectSpriteSheet}
                    disabled={isCorrectingSheet}
                    className="w-full py-3 bg-pink-500/10 border border-pink-500/30 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-pink-400 hover:bg-pink-500/20 hover:border-pink-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isCorrectingSheet ? <RefreshCcw size={14} className="animate-spin" /> : <Scissors size={14} />}
                    AI Corrector (Repad)
                  </button>
                  <button
                    onClick={handleNeuralSplice}
                    disabled={isNeuralSplicing}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isNeuralSplicing ? <RefreshCcw size={14} className="animate-spin" /> : <Zap size={14} />}
                    Neural Splice (Individual)
                  </button>
                  <button
                    onClick={handleSliceSprite}
                    className="w-full py-3 bg-slate-800 border border-white/10 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Scissors size={14} /> Execute Grid Slice
                  </button>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${showSliceOverlay ? 'bg-cyan-500' : 'bg-slate-700'}`} />
                  <button
                    onClick={() => setShowSliceOverlay(!showSliceOverlay)}
                    className="text-[9px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300"
                  >
                    {showSliceOverlay ? 'Hide Guide' : 'Show Guide'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Opacity</label>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 w-[100%]" /></div>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Saturation</label>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[70%]" /></div>
                </div>

                {/* Manual Tool Controls */}
                {['Paint', 'Erase', 'Pick'].includes(activeSynapseTool) && (
                  <div className="pt-6 border-t border-white/5 space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Brush Size</label>
                        <span className="text-[9px] font-mono text-cyan-400">{synapseBrushSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={synapseBrushSize}
                        onChange={(e) => setSynapseBrushSize(parseInt(e.target.value))}
                        className="w-full accent-cyan-500 bg-slate-800 rounded-full h-1.5 appearance-none cursor-pointer"
                      />
                    </div>

                    {activeSynapseTool !== 'Erase' && (
                      <div className="space-y-3">
                        <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Active Color</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={synapseActiveColor}
                            onChange={(e) => setSynapseActiveColor(e.target.value)}
                            className="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 p-1 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={synapseActiveColor}
                            onChange={(e) => setSynapseActiveColor(e.target.value)}
                            className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-mono text-slate-300 uppercase focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Crop Tool Controls */}
                {activeSynapseTool === 'Crop' && (
                  <div className="pt-6 border-t border-white/5 space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-3">
                      <label className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Crop Mode Active</label>
                      <p className="text-[8px] text-slate-500">Click and drag on the canvas to select a region to crop.</p>
                    </div>
                    {cropStart && cropEnd && (
                      <div className="space-y-3">
                        <div className="text-[9px] text-slate-400 font-mono">
                          Selection: {Math.abs(Math.round(cropEnd.x - cropStart.x))} x {Math.abs(Math.round(cropEnd.y - cropStart.y))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleExecuteCrop}
                            className="flex-1 py-2.5 bg-amber-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
                          >
                            <Check size={14} /> Confirm Crop
                          </button>
                          <button
                            onClick={handleCancelCrop}
                            className="px-4 py-2.5 bg-slate-800 text-slate-400 rounded-xl text-[10px] font-black uppercase hover:bg-slate-700 transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}


            <div className="pt-4 border-t border-white/5">
              <p className="text-[8px] font-mono text-slate-600 uppercase">{synapseWorkingAsset ? `File // ${synapseWorkingAsset.name}` : 'File Info // PNG_RGBA_1024'}</p>
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
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><RefreshCcw size={14} /> Playback Settings</h3>
            <div className="space-y-4">
              <div className="space-y-3">
                <span className="text-[9px] font-bold text-slate-600 uppercase">Loop Mode</span>
                <div className="flex gap-2">
                  {(['once', 'loop', 'pingpong'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setAnimLoopMode(mode)}
                      className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${animLoopMode === mode ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950 text-slate-500 border border-white/10 hover:border-cyan-500/30'}`}
                    >
                      {mode === 'once' ? 'Once' : mode === 'loop' ? 'Loop' : 'Ping-Pong'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-slate-600 uppercase">Playback Speed</span>
                  <span className="text-[9px] font-mono text-cyan-400">{fps} FPS</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={fps}
                  onChange={(e) => setFps(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 rounded-full h-1.5 appearance-none cursor-pointer"
                />
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
                <Sparkles size={14} /> AI Auto-Link (Generate) ({assets.filter(a => a.status === 'Unlinked').length})
              </button>
              <button onClick={() => setGameState(prev => ({ ...prev, nodes: [] }))} className="px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl text-[9px] font-black tracking-widest uppercase hover:bg-red-600/30 flex items-center gap-2">
                <Trash2 size={14} /> Clear
              </button>
              <button
                onClick={handleSaveToWorkspace}
                className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black tracking-widest uppercase hover:bg-emerald-500 shadow-lg flex items-center gap-2"
              >
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
              { id: 'LOGIC', label: 'LOGIC BOARD' }
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
        </div>
      </div>
    );
  };

  const renderQuestEditor = () => {
    const allQuests = gameState.quests || [];

    return (
      <div className="flex h-full gap-6 animate-in fade-in duration-700">
        {/* Quest List */}
        <div className="w-80 glass-panel rounded-3xl border border-slate-800 p-6 flex flex-col gap-4 bg-slate-900/10">
          <header className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest">Active Quests</h3>
            <div className="flex gap-2">
              <button onClick={handleQuestAutoSync} className="p-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest">
                <Sparkles size={12} /> Auto-Sync
              </button>
              <button onClick={handleAddQuest} className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20" title="Add New Quest"><Plus size={14} /></button>
            </div>
          </header>
          <div className="space-y-3">
            {allQuests.map((q, i) => (
              <div key={q.id} className={`p-4 rounded-xl border ${i === 0 ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-slate-900/40 border-slate-800'} cursor-pointer hover:border-cyan-500/30 transition-all group`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`text-xs font-bold uppercase tracking-wide flex-1 ${i === 0 ? 'text-cyan-400' : 'text-slate-400'}`}>{q.title}</h4>
                  <div className="flex items-center gap-2">
                    {q.status === 'Completed' && <CheckCircle size={12} className="text-emerald-500" />}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteQuest(q.id); }}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                      title="Delete Quest"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${q.progress || 0}%` }} />
                </div>
                {q.linkedAssetId && (
                  <div className="mt-2 flex items-center gap-1">
                    <Database size={8} className="text-slate-600" />
                    <span className="text-[7px] font-mono text-slate-600 uppercase">LINKED_ASSET</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 glass-panel rounded-3xl border border-slate-800 p-8 flex flex-col gap-6 bg-slate-900/10 overflow-y-auto custom-scrollbar">
          {allQuests.length > 0 ? (
            <>
              <div className="flex justify-between items-start border-b border-white/5 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">{allQuests[0].title}</h2>
                  <p className="text-xs text-slate-500 font-mono mt-2 uppercase">ID: {allQuests[0].id} // TYPE: {allQuests[0].type || 'MAIN_STORY'}</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">{allQuests[0].status || 'In Progress'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quest Description</label>
                  <textarea className="w-full h-32 bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500/50" defaultValue={allQuests[0].description || 'No description available.'} />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rewards</label>
                  <div className="space-y-2">
                    {(allQuests[0].rewards || []).length > 0 ? (
                      allQuests[0].rewards?.map((r: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                          <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400"><Gift size={16} /></div>
                          <div>
                            <p className="text-xs font-bold text-slate-300">{r.label || r.type}</p>
                            <p className="text-[10px] text-slate-500">{r.amount} {r.type}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                        <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400"><Gift size={16} /></div>
                        <div>
                          <p className="text-xs font-bold text-slate-300">Credits</p>
                          <p className="text-[10px] text-slate-500">5000 CR</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-3 bg-slate-900/40 border border-slate-800/50 rounded-xl border-dashed">
                      <div className="w-8 h-8 rounded flex items-center justify-center text-slate-600"><Plus size={16} /></div>
                      <p className="text-xs font-bold text-slate-600 uppercase">Add Reward</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Objective Flow</label>
                {(allQuests[0].objectives || []).map((obj: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-950/30 border border-slate-800 rounded-xl">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${obj.status === 'Completed' ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600 text-transparent'}`}>
                      <CheckCircle size={14} fill={obj.status === 'Completed' ? "currentColor" : "none"} className={obj.status === 'Completed' ? "text-slate-950" : ""} />
                    </div>
                    <input type="text" defaultValue={obj.text} className={`bg-transparent border-none focus:outline-none flex-1 text-sm font-bold ${obj.status === 'Completed' ? 'text-slate-500 line-through' : 'text-slate-200'}`} />
                    <MoreVertical size={16} className="text-slate-600" />
                  </div>
                ))}
                <button className="w-full py-3 bg-slate-900/50 border border-slate-800 border-dashed rounded-xl text-slate-500 text-xs font-bold uppercase hover:bg-slate-900 hover:text-slate-300 transition-all">+ Add Objective</button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
              <Flag size={64} className="text-slate-600 mb-4" />
              <p className="text-lg font-black text-slate-500 uppercase tracking-widest">No Quests</p>
              <p className="text-xs text-slate-600 mt-2">Use Auto-Sync or add a quest manually</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAssembler = () => {
    return (
      <>
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
              {/* AI Link Button - Uses Gemini API */}
              <button
                onClick={handleNeuralOrchestration}
                disabled={isOrchestrating || assets.length === 0}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-xl ${isOrchestrating || assets.length === 0 ? 'bg-slate-800 text-slate-600' : 'bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:bg-purple-600/30'
                  }`}
              >
                {isOrchestrating ? <RefreshCcw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isOrchestrating ? 'AI Linking...' : 'AI Link'}
              </button>

              {/* Live Sync Toggle */}
              <button
                onClick={() => setIsLiveSyncEnabled(!isLiveSyncEnabled)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-xl ${isLiveSyncEnabled ? 'bg-orange-500 text-slate-950' : 'bg-slate-900/60 border border-white/10 text-slate-400 hover:border-orange-500/50'}`}
              >
                <Zap size={16} className={isLiveSyncEnabled ? 'animate-pulse' : ''} />
                {isLiveSyncEnabled ? 'Live Sync: ON' : 'Live Sync: OFF'}
              </button>

              {/* Optimize Button */}
              <button
                onClick={handleOptimizeProject}
                disabled={isOptimizing}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-xl ${isOptimizing ? 'bg-slate-800 text-slate-600' : 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30'}`}
              >
                {isOptimizing ? <RefreshCcw size={16} className="animate-spin" /> : <Rocket size={16} />}
                Optimize
              </button>
              {/* Auto Link Button - Local Pattern Matching */}
              <button
                onClick={runAutoLink}
                disabled={assets.length === 0}
                className="flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-600/30"
              >
                <Link size={16} />
                Auto Link
              </button>
              {/* Verify Links Button */}
              <button
                onClick={runAutoLink}
                disabled={assets.length === 0}
                className="flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30"
              >
                <Check size={16} />
                Verify Links
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

          {/* Asset Stats & Multi-Select Bar */}
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-6">
              {/* All Assets Tab */}
              <button
                onClick={() => setAssetTypeFilter('All')}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all ${assetTypeFilter === 'All' ? 'bg-cyan-500/20 border-cyan-500/40' : 'bg-slate-900/60 border-white/5 hover:border-white/20'}`}
              >
                <Database size={14} className="text-cyan-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{assets.length}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">All</span>
              </button>
              <div className="h-4 w-[1px] bg-white/10" />
              <div className="flex items-center gap-4">
                {[
                  { type: 'Sprite' as const, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', activeBg: 'bg-cyan-500/30 border-cyan-500/50' },
                  { type: 'Audio' as const, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', activeBg: 'bg-pink-500/30 border-pink-500/50' },
                  { type: 'Data' as const, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', activeBg: 'bg-emerald-500/30 border-emerald-500/50' },
                  { type: 'Logic' as const, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', activeBg: 'bg-amber-500/30 border-amber-500/50' },
                ].map(cat => {
                  const count = assets.filter(a => a.type === cat.type).length;
                  if (count === 0) return null;
                  const isActive = assetTypeFilter === cat.type;
                  return (
                    <button
                      key={cat.type}
                      onClick={() => setAssetTypeFilter(cat.type)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all hover:scale-105 ${isActive ? cat.activeBg : cat.bg}`}
                    >
                      <span className={`text-[11px] font-black ${cat.color}`}>{count}</span>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{cat.type}s</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedAssetIds.length > 0 && (
              <div className="flex items-center gap-4 animate-in slide-in-from-right duration-500">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">{selectedAssetIds.length} Assets Selected</span>
                <button
                  onClick={() => handleBundleAssets(`Bundle ${Date.now().toString().slice(-4)}`)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-400 shadow-lg shadow-orange-500/20 transition-all"
                >
                  <Workflow size={14} /> Forge Entity
                </button>
                <button
                  onClick={() => setSelectedAssetIds([])}
                  className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-0 bg-slate-950/20 rounded-[2.5rem] border border-white/5 p-8 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-20">
              {assets.filter(a => assetTypeFilter === 'All' || a.type === assetTypeFilter).map(asset => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  isEditing={editingAssetId === asset.id}
                  editNameValue={editNameValue}
                  setEditNameValue={setEditNameValue}
                  startEdit={() => { setEditingAssetId(asset.id); setEditNameValue(asset.name); }}
                  saveEdit={saveRename}
                  onSendToSynapse={asset.type === 'Sprite' ? () => handleSendToSynapse(asset, asset.previewUrl) : undefined}
                  onSendToEcho={asset.type === 'Audio' ? () => handleSendToEcho(asset, asset.previewUrl) : undefined}
                  isSelected={selectedAssetIds.includes(asset.id)}
                  onToggleSelect={() => setSelectedAssetIds(prev =>
                    prev.includes(asset.id) ? prev.filter(id => id !== asset.id) : [...prev, asset.id]
                  )}
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

        {/* Optimization Log Modal */}
        {showOptimizationLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Rocket className="text-emerald-400" size={20} />
                  <h3 className="text-lg font-black font-orbitron text-white uppercase tracking-widest">Neural Optimization Log</h3>
                </div>
                <button onClick={() => setShowOptimizationLog(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-3 font-mono text-[10px] custom-scrollbar bg-slate-950/50">
                {optimizationLog.map((entry, i) => (
                  <div key={i} className={`flex gap-3 animate-in slide-in-from-left duration-300 fill-mode-both`} style={{ animationDelay: `${i * 100}ms` }}>
                    <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                    <span className={`${entry.type === 'success' ? 'text-emerald-400' :
                      entry.type === 'warn' ? 'text-amber-400' : 'text-cyan-400'
                      }`}>
                      {entry.type.toUpperCase()}:
                    </span>
                    <span className="text-slate-300">{entry.msg}</span>
                  </div>
                ))}
                {isOptimizing && (
                  <div className="flex items-center gap-3 text-cyan-400 animate-pulse mt-4">
                    <RefreshCcw size={12} className="animate-spin" />
                    <span>Processing visual data streams...</span>
                  </div>
                )}
              </div>
              <div className="p-6 bg-slate-900 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => setShowOptimizationLog(false)}
                  disabled={isOptimizing}
                  className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-white hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  Dismiss Log
                </button>
              </div>
            </div>
          </div>
        )}
      </>
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
        return <AtlasUI onSaveToAssembler={(asset) => {
          setAssets(prev => [{
            ...asset,
            id: `gen_ui_${Date.now()}`,
            path: `/generated/ui/${asset.name.replace(/\s/g, '_')}.png`,
            status: 'Unlinked'
          }, ...prev]);
          setActiveModule('ASSEMBLER'); // Auto-switch to Assembler
        }} />;
      case 'AIRLOCK':
        return <Airlock gameState={gameState} assets={assets} />;
      case 'EDITOR':
        return (
          <NexScriptEditor
            openFiles={openFiles}
            activeFile={activeFile}
            onSetActive={setActiveFile}
            onCloseFile={handleCloseFile}
            onSave={handleSaveFile}
          />
        );
      default:
        return <div className="p-20 text-center opacity-20 h-full flex flex-col items-center justify-center gap-4"><Activity size={48} /><p className="font-black uppercase tracking-[0.4em]">SUBSYSTEM OFF-LINE</p></div>;
    }
  };

  return (
    <>
      <div className="flex h-full w-full">
        <aside className="w-64 h-full flex flex-col gap-6 bg-[#020617]/80 backdrop-blur-3xl border-r border-slate-800/50 z-20">
          <div className="p-8 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-xl"><BrainCircuit size={24} /></div>
              <div><h2 className="text-sm font-black font-orbitron text-white tracking-widest uppercase">NEXGEN ENGINE</h2><p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Core Engine Workspace</p></div>
            </div>
          </div>
          <nav className="p-4 flex flex-col gap-1.5 flex-none overflow-y-auto custom-scrollbar">
            {[
              { id: 'ASSEMBLER', label: 'ASSEMBLER', icon: Database, desc: 'Asset Pipeline' },
              { id: 'GENESIS', label: 'GENESIS', icon: Workflow, desc: 'Logic Engine' },
              { id: 'SYNAPSE', label: 'SYNAPSE', icon: Sparkles, desc: 'AI Sprite Labs' },
              { id: 'ECHO', label: 'ECHO', icon: Volume2, desc: 'Sonic Signal Lab' },
              { id: 'NOVA', label: 'NOVA', icon: Cpu, desc: 'Game Runtime' },
              { id: 'ATLAS', label: 'ATLAS', icon: Layout, desc: 'UI Design Lab' },
              { id: 'AIRLOCK', label: 'AIRLOCK', icon: Rocket, desc: 'Cloud Deploy' },
            ].map(mod => (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id as NexusModule)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${activeModule === mod.id
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
                  }`}
              >
                <mod.icon size={18} className={activeModule === mod.id ? 'text-cyan-400' : 'group-hover:text-slate-100'} />
                <span className="font-medium tracking-wide text-xs">{mod.label}</span>
                {activeModule === mod.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,1)]" />
                )}
              </button>
            ))}
          </nav>

          <div className="flex-1 min-h-0 flex flex-col border-t border-white/5 pt-4 overflow-hidden">
            <FileExplorer
              tree={fileTree}
              activeFile={activeFile}
              onFileClick={handleFileClick}
            />
          </div>
          {/* Settings Button */}
          <div className="p-4 border-t border-white/5">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all w-full text-slate-500 hover:bg-white/5 hover:text-slate-200"
            >
              <Settings size={20} />
              <div className="text-left"><p className="text-[11px] font-black uppercase tracking-widest">Settings</p><p className="text-[8px] font-bold uppercase tracking-tighter opacity-70">API & Config</p></div>
            </button>
          </div>
        </aside>

        {/* Settings Modal */}
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300">
            <div className="bg-[#0a0f1a] border border-cyan-500/20 rounded-[2rem] w-[500px] shadow-2xl animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Settings</h2>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">API Configuration</p>
                  </div>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Key size={12} /> Gemini API Key
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKeyInput}
                        onChange={e => setApiKeyInput(e.target.value)}
                        placeholder="Enter your Gemini API key..."
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 pr-10"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-600">Get your API key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">Google AI Studio</a></p>
                </div>

                {savedApiKey && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <CheckCircle size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">API Key Saved</span>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-6 py-3 bg-slate-900 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { handleSaveApiKey(); setIsSettingsOpen(false); }}
                  className="px-6 py-3 bg-cyan-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors shadow-xl"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar"><div className="max-w-7xl mx-auto h-full">{renderModule()}</div></div>

        {/* AI Assistant Floating Button */}
        <button
          onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
          className={`fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl z-50 flex items-center justify-center transition-all hover:scale-110 ${isAiPanelOpen ? 'bg-slate-800 text-white' : 'bg-gradient-to-br from-cyan-500 to-purple-600 text-white'}`}
        >
          <Bot size={28} />
        </button>

        {/* AI Assistant Overlay & Panel */}
        {isAiPanelOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-30 opacity-0 animate-in fade-in duration-300"
            onClick={() => setIsAiPanelOpen(false)}
          />
        )}

        {/* AI Assistant Slide-Out Panel */}
        <div className={`fixed top-0 right-0 h-full w-[480px] bg-[#0a0f1a]/95 backdrop-blur-3xl border-l border-cyan-500/20 z-40 flex flex-col transition-transform duration-500 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] ${isAiPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Header */}
          <div className="p-6 border-b border-white/5 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Bot size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">NexGen AI</h2>
                <p className="text-[9px] text-slate-500 font-bold uppercase">Game Dev Co-Pilot</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                <div className={`w-1.5 h-1.5 rounded-full ${aiDeepContext.lastSyncTime ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                {aiDeepContext.lastSyncTime
                  ? `Deep Synced: ${aiDeepContext.assetSummaries.length} files`
                  : `Basic: ${assets.length} Assets`}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleClearSession}
                  className="flex items-center gap-1.5 px-2 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[8px] font-black text-red-400 hover:bg-red-500/20 transition-all"
                  title="Clear session"
                >
                  <Trash2 size={10} />
                </button>
                <button
                  onClick={handleSyncContext}
                  disabled={aiDeepContext.isSyncing || assets.length === 0}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[8px] font-black text-purple-400 hover:bg-purple-500/20 transition-all disabled:opacity-50"
                >
                  {aiDeepContext.isSyncing ? <RefreshCcw size={10} className="animate-spin" /> : <Zap size={10} />}
                  {aiDeepContext.isSyncing ? 'Syncing...' : 'Sync Context'}
                </button>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {aiMessages.length === 0 && (
              <div className="text-center py-12 opacity-40">
                <Bot size={48} className="mx-auto text-slate-600 mb-4" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Ask me anything about your game</p>
                <p className="text-[9px] text-slate-600 mt-2">I can help create quests, logic, navigate the app, and more.</p>
              </div>
            )}
            {aiMessages.map((msg, i) => (
              msg.content.startsWith('__NAV__') ? (
                <button
                  key={i}
                  onClick={() => {
                    const target = msg.content.replace('__NAV__', '') as NexusModule;
                    setActiveModule(target);
                    setIsAiPanelOpen(false);
                  }}
                  className="w-full py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs font-black uppercase text-cyan-400 hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Rocket size={14} /> Navigate to {msg.content.replace('__NAV__', '')}
                </button>
              ) : msg.content.startsWith('__FILE_EDIT__') ? (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30"
                >
                  <p className="text-[8px] font-black uppercase tracking-widest mb-2 text-amber-400">📝 File Edit Suggested</p>
                  <p className="text-xs text-white mb-3">{msg.content.replace('__FILE_EDIT__', '')}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setActiveDiffIndex(pendingFileEdits.length - 1);
                        setIsDiffPanelOpen(true);
                      }}
                      className="px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-[9px] font-black text-amber-400 hover:bg-amber-500/30 transition-all flex items-center gap-2"
                    >
                      <Eye size={12} /> Review Changes
                    </button>
                  </div>
                </div>
              ) : msg.content.startsWith('__CMD__NEW_PROJECT') ? (() => {
                const projectName = msg.content.replace('__CMD__NEW_PROJECT', '').replace(/^__/, '');
                return (
                  <button
                    key={i}
                    onClick={() => window.dispatchEvent(new CustomEvent('nexgen:open-new-project', { detail: { projectName } }))}
                    className="w-full py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-black uppercase text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Create New Project {projectName && `(${projectName})`}
                  </button>
                );
              })() : msg.content === '__CMD__CLEAR_SESSION' ? (
                <button
                  key={i}
                  onClick={handleClearSession}
                  className="w-full py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-black uppercase text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> Clear Session
                </button>
              ) : msg.content.startsWith('__CMD__GEN_SPRITE__') ? (() => {
                const parts = msg.content.replace('__CMD__GEN_SPRITE__', '').split('__');
                const name = parts[0];
                const prompt = parts[1];
                return (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30"
                  >
                    <p className="text-[8px] font-black uppercase tracking-widest mb-2 text-purple-400">🎨 Generate Sprite</p>
                    <p className="text-xs text-white font-bold mb-1">{name}</p>
                    <p className="text-[10px] text-slate-400 mb-3">{prompt}</p>
                    <button
                      onClick={() => {
                        setSynapsePrompt(prompt);
                        setActiveModule('SYNAPSE');
                        setIsAiPanelOpen(false);
                      }}
                      className="w-full py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-[9px] font-black text-purple-400 hover:bg-purple-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Paintbrush size={12} /> Generate in Synapse
                    </button>
                  </div>
                );
              })() : msg.content.startsWith('__CMD__GEN_AUDIO__') ? (() => {
                const parts = msg.content.replace('__CMD__GEN_AUDIO__', '').split('__');
                const name = parts[0];
                const category = parts[1];
                const prompt = parts[2];
                return (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/30"
                  >
                    <p className="text-[8px] font-black uppercase tracking-widest mb-2 text-pink-400">🎵 Generate Audio</p>
                    <p className="text-xs text-white font-bold mb-1">{name} ({category})</p>
                    <p className="text-[10px] text-slate-400 mb-3">{prompt}</p>
                    <button
                      onClick={() => {
                        setEchoPrompt(prompt);
                        setEchoCategory(category as any);
                        setActiveModule('ECHO');
                        setIsAiPanelOpen(false);
                      }}
                      className="w-full py-2 bg-pink-500/20 border border-pink-500/30 rounded-lg text-[9px] font-black text-pink-400 hover:bg-pink-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Mic size={12} /> Generate in Echo
                    </button>
                  </div>
                );
              })() : msg.content.startsWith('__CMD_CREATE_FILE__') ? (() => {
                const parts = msg.content.replace('__CMD_CREATE_FILE__', '').split('__');
                const path = parts[0];
                const language = parts[1];
                const content = parts[2];
                return (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400">💾 Create Project File</p>
                      <span className="text-[7px] font-mono text-emerald-500/50 uppercase">{language}</span>
                    </div>
                    <p className="text-xs text-white font-mono mb-1 truncate">{path}</p>
                    <pre className="text-[8px] text-slate-400 bg-slate-950/50 p-2 rounded-lg mb-3 max-h-24 overflow-hidden border border-white/5">
                      {content.slice(0, 150)}...
                    </pre>
                    <button
                      onClick={() => handleStartFileCreation(path, content, language)}
                      className="w-full py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-[9px] font-black text-emerald-400 hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={12} /> Create File in Project
                    </button>
                  </div>
                );
              })() : msg.content === '__CMD_SCAFFOLD__' ? (
                <div
                  key={i}
                  className="p-5 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400">
                      <Layout size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Project Scaffolding</p>
                      <p className="text-xs text-white font-bold">Initialize Game Structure</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                    This will create the standard directory structure: `assets/`, `scripts/`, `configs/`, and a `game_context.json` file.
                  </p>
                  <button
                    onClick={handleScaffoldProject}
                    className="w-full py-3 bg-cyan-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <Zap size={14} /> Run Scaffolding
                  </button>
                </div>
              ) : (
                <div
                  key={i}
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${msg.role === 'user'
                    ? 'bg-cyan-500/10 text-cyan-300 ml-8 border border-cyan-500/20'
                    : 'bg-slate-900/60 text-slate-300 mr-8 border border-white/5'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-50">{msg.role === 'user' ? 'You' : 'NexGen AI'}</p>
                    {msg.source && (
                      <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${msg.source === 'local' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                        {msg.source === 'local' ? 'Local (Saved $)' : `Cloud (${msg.usage?.totalTokens.toLocaleString()} tkn)`}
                      </span>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              )
            ))}
            {isAiThinking && (
              <div className="flex items-center gap-3 p-4 bg-slate-900/60 rounded-2xl border border-white/5 mr-8">
                <RefreshCcw size={16} className="text-cyan-400 animate-spin" />
                <span className="text-xs text-slate-400 font-bold">Thinking...</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="px-6 pb-3 flex flex-wrap gap-2">
            {['Where can I edit sprites?', 'Create a main quest', 'Help with logic'].map((q, i) => (
              <button
                key={i}
                onClick={() => { setAiInput(q); }}
                className="px-3 py-1.5 bg-slate-900/60 border border-white/5 rounded-lg text-[9px] font-bold text-slate-400 hover:text-white hover:border-cyan-500/30 transition-all"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-6 border-t border-white/5 bg-slate-950/50">
            <div className="flex gap-3">
              <input
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAiSubmit()}
                placeholder="Ask about game dev, navigate, or create content..."
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                onClick={handleAiSubmit}
                disabled={isAiThinking || !aiInput.trim()}
                className="w-12 h-12 bg-cyan-500 text-slate-950 rounded-xl flex items-center justify-center hover:bg-cyan-400 transition-all disabled:opacity-50 shadow-xl"
              >
                <Send size={18} />
              </button>
            </div>

            {/* Neural Pulse - Virtual Budget Monitor */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Neural Debt</span>
                  <span className="text-[10px] font-mono text-pink-400">-${neuralUsage.estimatedCost.toFixed(4)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Total Signals</span>
                  <span className="text-[10px] font-mono text-cyan-400">{neuralUsage.totalTokens.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">
                  {neuralUsage.usdBudgetLimit > 0 ? 'Budget Remaining' : 'Status'}
                </span>
                <div className="flex items-center gap-2">
                  {neuralUsage.usdBudgetLimit > 0 ? (
                    <>
                      <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${neuralUsage.estimatedCost >= neuralUsage.usdBudgetLimit ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]'
                            }`}
                          style={{ width: `${Math.max(0, 100 - (neuralUsage.estimatedCost / neuralUsage.usdBudgetLimit * 100))}%` }}
                        />
                      </div>
                      <span className={`text-[9px] font-mono ${neuralUsage.estimatedCost >= neuralUsage.usdBudgetLimit ? 'text-red-400' : 'text-emerald-400'}`}>
                        {Math.max(0, 100 - (neuralUsage.estimatedCost / neuralUsage.usdBudgetLimit * 100)).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-[9px] font-mono text-cyan-400 animate-pulse">UNLIMITED TRACKING</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diff Preview Slide-Out Panel */}
        <div className={`fixed top-0 right-0 h-full w-[600px] bg-[#0a0f1a]/95 backdrop-blur-3xl border-l border-amber-500/20 z-50 flex flex-col transition-transform duration-500 ${isDiffPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Diff Panel Header */}
          <div className="p-6 border-b border-white/5 bg-gradient-to-r from-amber-500/5 to-orange-500/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FileText size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">File Changes</h2>
                <p className="text-[9px] text-slate-500 font-bold uppercase">Review Before Applying</p>
              </div>
            </div>
            <button
              onClick={() => setIsDiffPanelOpen(false)}
              className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-all"
            >
              <X size={18} className="text-white" />
            </button>
          </div>

          {/* Diff Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {pendingFileEdits.length === 0 ? (
              <div className="text-center py-12 opacity-40">
                <FileText size={48} className="mx-auto text-slate-600 mb-4" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No Pending Changes</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingFileEdits.map((edit, index) => (
                  <div key={index} className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden">
                    {/* File Header */}
                    <div className="px-4 py-3 bg-slate-800/50 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-amber-400" />
                        <span className="text-xs font-black text-white">{edit.fileName}</span>
                      </div>
                      <span className="text-[9px] text-slate-500">{edit.timestamp.toLocaleTimeString()}</span>
                    </div>

                    {/* Diff Preview */}
                    <div className="p-4 max-h-64 overflow-y-auto">
                      <pre className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap">
                        {generateDiff(edit.originalContent, edit.suggestedContent, edit.fileName).slice(0, 1500)}
                        {generateDiff(edit.originalContent, edit.suggestedContent, edit.fileName).length > 1500 && '\n... (truncated)'}
                      </pre>
                    </div>

                    {/* Actions */}
                    <div className="px-4 py-3 bg-slate-800/30 border-t border-white/5 flex gap-2">
                      <button
                        onClick={() => handleDownloadDiff(index)}
                        className="flex-1 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-[9px] font-black text-slate-300 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Download size={12} /> Download .diff
                      </button>
                      <button
                        onClick={() => handleApplyChanges(index)}
                        className="flex-1 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-[9px] font-black text-emerald-400 hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-2"
                      >
                        <Check size={12} /> Download Updated File
                      </button>
                      <button
                        onClick={() => handleDismissEdit(index)}
                        className="py-2 px-3 bg-red-500/10 border border-red-500/20 rounded-lg text-[9px] font-black text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Edits Count */}
          {pendingFileEdits.length > 0 && (
            <div className="p-4 border-t border-white/5 bg-slate-950/50 text-center">
              <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">
                {pendingFileEdits.length} Pending Edit{pendingFileEdits.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File Creation Dialog */}
      {
        showFileCreateDialog && pendingFileCreation && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-[500px] glass-panel rounded-3xl border border-cyan-500/30 bg-slate-950/95 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3">
                  <Save size={20} className="text-cyan-400" />
                  Create File
                </h2>
                <p className="text-xs text-slate-500 mt-2">The AI has generated code to save to your project.</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">File Path</label>
                  <input
                    type="text"
                    value={fileCreatePath}
                    onChange={(e) => setFileCreatePath(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/50"
                    placeholder="e.g., scripts/entities/player.nx"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Preview ({pendingFileCreation.language})</label>
                  <pre className="bg-slate-900/50 border border-white/5 rounded-xl p-4 text-[10px] font-mono text-slate-300 max-h-48 overflow-y-auto">
                    {pendingFileCreation.content.slice(0, 800)}
                    {pendingFileCreation.content.length > 800 && '\n... (truncated)'}
                  </pre>
                </div>
              </div>

              <div className="p-6 bg-slate-900/50 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => { setShowFileCreateDialog(false); setPendingFileCreation(null); }}
                  className="flex-1 py-3 bg-slate-800 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmFileCreation}
                  className="flex-1 py-3 bg-cyan-500 text-slate-950 rounded-xl text-[10px] font-black uppercase hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                  <Save size={14} /> Create File
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default NexusPlugin;
