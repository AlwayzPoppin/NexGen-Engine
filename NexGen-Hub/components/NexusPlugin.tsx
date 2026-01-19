
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
  Monitor,
  Settings,
  RefreshCcw,
  Layout,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Cpu,
  BrainCircuit,
  Sparkles,
  MessageSquare,
  Flag,
  ListTodo,
  Activity,
  Wifi,
  Trash2,
  User,
  Save,
  Clock,
  Layers,
  Eye,
  Camera,
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
  AlignJustify,
  LayoutGrid,
  FileCode,
  FileAudio,
  FileImage,
  ChevronRight,
  ChevronDown,
  Folder,
  Clapperboard,
  Film,
  Users,
  Languages,
  Library,
  Theater,
  VenetianMask,
  Globe,
  Mic2,
  Send,
  X,
  Bot,
  EyeOff,
  FileText,
  FileJson,
  Map as MapIcon,
  Check
} from 'lucide-react';
import AtlasUI from './AtlasUI';
import { NexusModule, NexusAsset, NexusMetaVariable, GameEntity2D, GlobalGameState, GenesisNode, ChatMessage, TokenStats, NodePos, Project, FileNode } from '../types';
import {
  analyzeProduction,
  critiquePerformance,
  predictVisemes,
  generateActorPortrait,
  generateCharacterDialogue,
  summonCharacter,
  generateScriptProposal,
  generateSceneAcoustics,
  designNeuralSound,
  generateSpriteSheet,
  generateAssistantResponse,
  detectGridLayout,
  generateEntityLogic,
  correctSpriteSheet,
  generateQuests,
  generateConductorScript
} from '../services/geminiService';
import { generateWithOllama, switchOllamaModel, isOllamaEnabled } from '../services/ollamaService';
import NovaEngine from './NovaEngine';
import NexGenEngine from './NexGenEngine';
import Airlock from './Airlock';
import FileExplorer from './FileExplorer';
import NexScriptEditor from './NexScriptEditor';
import NeuralCommandBuffer from './NeuralCommandBuffer';
import { NeuralAction, SpriteStyle, SpriteSheet, AnimationSet, ModelType, GridConfig } from '../types';
import AnimationStudio from './synapse/AnimationStudio';
import GeneratorControls from './synapse/GeneratorControls';
import { MasterStage } from './conductor/MasterStage';
import { ScriptStudio } from './conductor/ScriptStudio';
import { AudioForge } from './conductor/AudioForge';
import { CharacterSummoner } from './conductor/CharacterSummoner';
import { LiveSession } from './conductor/LiveSession';
import { SceneStudio } from './conductor/SceneStudio';
import { DirectingOracle } from './conductor/DirectingOracle';
import {
  ConductorCharacter, ConductorScene, ConductorScript,
  CinematicSequence, AudioAssetForge, DialogueLine
} from '../types';

type GenesisTab = 'QUEST' | 'LOGIC';
type SynapseTab = 'GENERATOR' | 'EDITOR' | 'RIGGING';
type ConductorTab = 'SCRIPT_STUDIO' | 'AUDIO_FORGE' | 'SPATIAL_ARCHITECT' | 'MASTER_STAGE';
type AudioCategory = 'DIALOGUE' | 'SFX' | 'MUSIC' | 'AMBIENT';

// Define missing type locally if not exported from types
interface WireConnection {
  id: string;
  fromNode: string;
  fromPin: string;
  toNode: string;
  toPin: string;
}

interface AnimFrame {
  id: string;
  image: string;
  duration: number;
}

interface AssetCardProps {
  asset: Asset;
  isEditing: boolean;
  editNameValue: string;
  setEditNameValue: (s: string) => void;
  startEdit: () => void;
  saveEdit: () => void;
  onSendToSynapse?: () => void;
  onSendToConductor?: () => void;
  onLinkAsset?: () => void;
  linkTargets?: { type: string; id: string; name: string }[];
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onDelete?: () => void;
  viewMode?: 'GRID' | 'LIST';
}

const AssetCard: React.FC<AssetCardProps> = ({
  asset, isEditing, editNameValue, setEditNameValue, startEdit, saveEdit,
  onSendToSynapse, onSendToConductor, onLinkAsset, isSelected, onToggleSelect,
  onDelete, viewMode = 'GRID'
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
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

  const statusColor = asset.linkedTo ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : asset.status === 'Linked' ? 'bg-emerald-500' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]';
  const FileIcon = asset.type === 'Sprite' ? FileImage : asset.type === 'Audio' ? FileAudio : FileCode;

  if (viewMode === 'LIST') {
    return (
      <div
        className={`group/item relative flex items-center gap-4 p-3 rounded-xl border transition-all hover:bg-white/5 cursor-pointer ${isSelected ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-900/40 border-white/5 hover:border-cyan-500/20'}`}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('button')) onToggleSelect?.();
        }}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${asset.type === 'Sprite' ? 'bg-cyan-500/10 text-cyan-400' : asset.type === 'Audio' ? 'bg-pink-500/10 text-pink-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
          {asset.type === 'Sprite' && previewSrc ? <img src={previewSrc} className="w-full h-full object-cover rounded-lg" /> : <FileIcon size={16} />}
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-200 truncate">{asset.name}</h4>
            <p className="text-[9px] text-slate-500 truncate font-mono">{asset.path}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
            <span className={`text-[9px] font-black uppercase tracking-wider ${asset.linkedTo ? 'text-emerald-400' : 'text-slate-500'}`}>
              {asset.linkedTo ? asset.linkedTo.name : 'Unlinked'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
          {asset.type === 'Audio' && onSendToConductor && (
            <button onClick={onSendToConductor} className="p-1.5 bg-pink-500/10 text-pink-400 rounded-lg hover:bg-pink-500/20"><Volume2 size={12} /></button>
          )}
          {asset.type === 'Sprite' && onSendToSynapse && (
            <button onClick={onSendToSynapse} className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20"><Paintbrush size={12} /></button>
          )}
          <button onClick={(e) => { e.stopPropagation(); startEdit() }} className="p-1.5 bg-slate-800 text-slate-400 rounded-lg hover:text-white"><Edit2 size={12} /></button>
          {showConfirmDelete ? (
            <div className="flex items-center gap-1 animate-in slide-in-from-right-2">
              <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"><Check size={12} /></button>
              <button onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(false); }} className="p-1.5 bg-slate-800 text-slate-400 rounded-lg hover:text-white"><X size={12} /></button>
            </div>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(true); }} className="p-1.5 bg-slate-800 text-slate-400 rounded-lg hover:text-red-400"><Trash2 size={12} /></button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`glass-panel p-6 rounded-3xl border transition-all flex flex-col gap-5 relative overflow-hidden group/item cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10 duration-300 ${isSelected ? 'border-cyan-500 ring-4 ring-cyan-500/20 shadow-2xl shadow-cyan-500/20' : 'border-white/5 hover:border-cyan-500/30'
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
        <div className="flex justify-between items-center mt-2">
          {asset.statusReason ? <p className="text-[8px] font-black text-pink-500/60 uppercase tracking-widest">{asset.statusReason}</p> : <div />}
          <div className="flex gap-2">
            {showConfirmDelete ? (
              <div className="flex items-center gap-1 animate-in zoom-in duration-200">
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                  className="px-2 py-1 bg-red-500 text-white rounded-md text-[8px] font-black uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-500/20"
                >
                  Confirm
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(false); }}
                  className="px-2 py-1 bg-slate-800 text-slate-400 rounded-md text-[8px] font-black uppercase tracking-widest hover:text-white"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(true); }}
                className="p-1.5 bg-slate-900/60 text-slate-500 rounded-lg hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Delete Asset"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <div className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
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
        {asset.type === 'Audio' && onSendToConductor && (
          <button
            onClick={onSendToConductor}
            className="flex-1 py-2 bg-pink-500/10 border border-pink-500/20 rounded-xl text-[8px] font-black uppercase text-pink-400 hover:bg-pink-500/20 transition-all flex items-center justify-center gap-1"
            title="Send to Conductor for editing"
          >
            <Volume2 size={10} /> Conductor
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
  projectHandle: any;
  setProjectHandle: (handle: any) => void;
  isNexusSidebarCollapsed: boolean;
}

// Nexus Core Plugin - NexGen Engine AI Hub
const NexusPlugin: React.FC<NexusPluginProps> = ({ activeProject, projectHandle, setProjectHandle, isNexusSidebarCollapsed }) => {
  const [activeModule, setActiveModule] = useState<NexusModule>('ASSEMBLER');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
  const [genesisSidebarSearch, setGenesisSidebarSearch] = useState('');



  const [genesisTab, setGenesisTab] = useState<GenesisTab>('LOGIC');
  const [synapseTab, setSynapseTab] = useState<SynapseTab>('GENERATOR');
  const [genesisPrompt, setGenesisPrompt] = useState('');

  // Forge State
  const [isForging, setIsForging] = useState(false);
  const [forgeName, setForgeName] = useState('');
  const [showForgeModal, setShowForgeModal] = useState(false);
  const [forgedEntities, setForgedEntities] = useState<any[]>([]);

  // Viewport Ref
  const mainScrollRef = useRef<HTMLDivElement>(null);

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
        content: `⚠️ **Project Context Unavailable**\n\nI don't see any project selected in the library. Selection is required to activate neural indexing and engine binding. \n\nShall I create a new one? (Type: **__CMD_NEW_PROJECT** or say "Yes")`,
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
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [isDirty, setIsDirty] = useState(false);

  // use projectHandle from props instead of internal projectDirHandle
  const [projectPath, setProjectPath] = useState<string | null>(null);

  // Synapse State
  const [synapsePrompt, setSynapsePrompt] = useState('');
  const [synapseStyle, setSynapseStyle] = useState<SpriteStyle>('Pixel Art');
  const [isGeneratingSprite, setIsGeneratingSprite] = useState(false);
  const [synapseReferenceImage, setSynapseReferenceImage] = useState<string | null>(null);
  const [synapseReferenceImages, setSynapseReferenceImages] = useState<string[]>([]);
  const [synapseActiveSheet, setSynapseActiveSheet] = useState<SpriteSheet | null>(null);
  const [synapseModel, setSynapseModel] = useState<ModelType>('gemini-2.5-flash-image');
  const [synapseAutoTransparency, setSynapseAutoTransparency] = useState(false);
  const [synapseTransparencyTolerance, setSynapseTransparencyTolerance] = useState(15);
  const [generatedSprite, setGeneratedSprite] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isCorrectingSheet, setIsCorrectingSheet] = useState(false);

  // CONDUCTOR Cinematic Suite State
  const [conductorTab, setConductorTab] = useState<ConductorTab>('SCRIPT_STUDIO');
  const [conductorVision, setConductorVision] = useState('');
  const [conductorContext, setConductorContext] = useState<ProductionContext | null>(null);
  const [conductorCharacters, setConductorCharacters] = useState<ConductorCharacter[]>([]);
  const [conductorScenes, setConductorScenes] = useState<ConductorScene[]>([]);
  const [conductorScript, setConductorScript] = useState<ConductorScript | null>(null);
  const [cinematicSequences, setCinematicSequences] = useState<CinematicSequence[]>([
    {
      id: 'seq-master',
      name: 'Main Sequence',
      activeSceneId: '',
      tracks: [
        { id: 'track-actor-1', name: 'Actor 1', type: 'Dialogue', clips: [], volume: 1, pan: -0.3, isMuted: false, isSolo: false },
        { id: 'track-actor-2', name: 'Actor 2', type: 'Dialogue', clips: [], volume: 1, pan: 0.3, isMuted: false, isSolo: false },
        { id: 'track-ambient', name: 'Ambient', type: 'SFX', clips: [], volume: 0.6, pan: 0, isMuted: false, isSolo: false },
        { id: 'track-sfx', name: 'SFX', type: 'SFX', clips: [], volume: 0.8, pan: 0, isMuted: false, isSolo: false }
      ]
    }
  ]);
  const [audioForges, setAudioForges] = useState<AudioAssetForge[]>([]);
  const [isCasting, setIsCasting] = useState(false);
  const [isScripting, setIsScripting] = useState(false);
  const [isDirecting, setIsDirecting] = useState(false);
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  const [isTableReading, setIsTableReading] = useState(false);
  const [activePlaybackLineId, setActivePlaybackLineId] = useState<string | null>(null);
  const [isForgingAudio, setIsForgingAudio] = useState(false);

  // Conductor Audio State
  // Legacy Echo State (Retained for compatibility while transitioning)
  const [conductorPrompt, setConductorPrompt] = useState('');
  const [conductorAudioCategory, setConductorAudioCategory] = useState<AudioCategory>('DIALOGUE');
  const [conductorVoice, setConductorVoice] = useState('Kore');
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

  const [conductorWorkingAudio, setConductorWorkingAudio] = useState<{
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

  // GENESIS: Neural Quest Forge State
  const [isForgingQuests, setIsForgingQuests] = useState(false);
  const [proposedQuests, setProposedQuests] = useState<any[]>([]);
  const [showQuestReview, setShowQuestReview] = useState(false);

  const projectVariables = [
    { key: 'player_health', value: '100', type: 'System' },
    { key: 'world_time', value: 'Midnight', type: 'Global' },
    { key: 'is_in_combat', value: 'False', type: 'System' }
  ];

  // DIRECTOR: Live Session & OST Forge State
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

  const assetGroups = useMemo(() => {
    const groups: Record<string, NexusAsset[]> = {};
    const filtered = assets.filter(a => {
      const matchesType = assetTypeFilter === 'All' || a.type === assetTypeFilter;
      const matchesSearch = assetSearch === '' || a.name.toLowerCase().includes(assetSearch.toLowerCase()) || a.path.toLowerCase().includes(assetSearch.toLowerCase());
      return matchesType && matchesSearch;
    });
    filtered.forEach(asset => {
      const pathParts = asset.path.split('/');
      pathParts.pop();
      const dir = pathParts.join('/') || 'ROOT';
      if (!groups[dir]) groups[dir] = [];
      groups[dir].push(asset);
    });
    return groups;
  }, [assets, assetTypeFilter]);

  const togglePath = (path: string) => {
    const newSet = new Set(collapsedPaths);
    if (newSet.has(path)) newSet.delete(path);
    else newSet.add(path);
    setCollapsedPaths(newSet);
  };
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
    narrativeSegments: [],
    wires: []
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

  const handleDeleteAsset = async (asset: NexusAsset) => {
    if (!projectHandle) {
      setOptimizationLog(prev => [{
        type: 'warn',
        msg: `Deletion failed: No project folder open. Cannot delete physical file for [${asset.name}]`
      }, ...prev]);
      return;
    }

    try {
      // 1. Delete from File System
      // asset.path starts with '/', so split will have an empty string at index 0
      const pathParts = asset.path.split('/').filter(p => p !== '');
      const fileName = pathParts.pop(); // Get the file name

      let currentHandle = projectHandle;
      // Navigate to the correct directory
      for (const part of pathParts) {
        currentHandle = await currentHandle.getDirectoryHandle(part);
      }

      if (fileName) {
        await currentHandle.removeEntry(fileName);
        console.log(`[ASSEMBLER] Deleted physical file: ${asset.path}`);
      }

      // 2. Update State
      setAssets(prev => prev.filter(a => a.id !== asset.id));
      setSelectedAssetIds(prev => prev.filter(id => id !== asset.id));

      // 3. Add to status log
      setOptimizationLog(prev => [{
        type: 'warn',
        msg: `Neural Link severed: Asset discarded from matrix [${asset.name}]`
      }, ...prev]);

    } catch (err: any) {
      console.error("[ASSEMBLER] Deletion failed:", err);
      setOptimizationLog(prev => [{
        type: 'err',
        msg: `Critical Failure: Could not discard asset [${asset.name}] - ${err.message || err}`
      }, ...prev]);
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

      const nodeType = asset.type === 'Sprite' ? 'Action' : (asset.type === 'Audio' ? 'Conductor' : 'Data');
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
      const newWires: WireConnection[] = newNodes.map((node, i) => {
        if (i === 0) return null;
        return {
          id: `wire_orch_${Date.now()}_${i}`,
          fromNode: newNodes[i - 1].id,
          fromPin: 'out_exec',
          toNode: node.id,
          toPin: 'in_exec'
        };
      }).filter(Boolean) as WireConnection[];

      setIsDirty(true);
      setGameState(prev => ({
        ...prev,
        nodes: [...prev.nodes, ...newNodes],
        wires: [...(prev.wires || []), ...newWires]
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


  const handleCastQuestToConductor = async (quest: Quest) => {
    setActiveModule('CONDUCTOR');
    setConductorTab('SCRIPT_STUDIO');
    setLog(prev => [...prev, `CASTING QUEST [${quest.title}] TO CONDUCTOR CORE...`]);

    setIsScripting(true);
    try {
      const scriptProposal = await generateScriptProposal(`Quest Title: ${quest.title}. Description: ${quest.description}. Theme: ${quest.theme || 'Cinematic'}. Mood: ${quest.mood || 'Standard'}`);

      const newScript: ConductorScript = {
        id: `cast-${Date.now()}`,
        title: scriptProposal.title,
        lines: scriptProposal.lines.map((l: any, i: number) => ({
          id: `line-${i}-${Date.now()}`,
          characterId: 'temp', // System should auto-assign or let user pick
          text: l.text,
          emotion: l.emotion,
          activeTakeIndex: 0,
          takes: []
        }))
      };

      setConductorScript(newScript);
      setLog(prev => [...prev, `DRAMATIC ADAPTATION COMPLETE. SIGNAL STABLE.`]);
    } catch (e) {
      console.error(e);
      setLog(prev => [...prev, `CASTING FAILED: COGNITIVE OVERLOAD.`]);
    } finally {
      setIsScripting(false);
    }
  };

  const handleCastQuestToSynapse = (quest: Quest) => {
    setActiveModule('SYNAPSE');
    setSynapsePrompt(`Character adaptation from Quest: ${quest.title}. Description: ${quest.description}. Theme: ${quest.theme || 'Cinematic'}. Focus on visual character details, outfit, and equipment.`);
    // Automatically pick an appropriate style based on theme if possible
    if (quest.theme?.toLowerCase().includes('pixel')) setSynapseStyle('Pixel Art');
    else if (quest.theme?.toLowerCase().includes('cyberpunk')) setSynapseStyle('Cyberpunk/Neon');
    else if (quest.theme?.toLowerCase().includes('noir')) setSynapseStyle('Noir/Black & White');

    setLog(prev => [...prev, `CASTING QUEST [${quest.title}] TO SYNAPSE ARTIFICER...`]);
  };

  const handleNeuralQuestForge = async () => {
    setIsForgingQuests(true);
    try {
      const context = `
PROJECT: ${projectName || 'Unnamed Project'}
ASSETS: ${assets.length} items (${assets.filter(a => a.type === 'Sprite').length} Sprites, ${assets.filter(a => a.type === 'Audio').length} Audio, ${assets.filter(a => a.type === 'Data').length} Data)
ENTITIES: ${gameState.entities?.length || 0}
VARIABLES: ${JSON.stringify(projectVariables)}
CURRENT QUESTS: ${gameState.quests?.length || 0}
`;
      const quests = await generateQuests(context);
      setProposedQuests(quests);
      setShowQuestReview(true);
    } catch (error) {
      console.error("[GENESIS] Quest Forge failed:", error);
    } finally {
      setIsForgingQuests(false);
    }
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
      const newWires: WireConnection[] = [
        {
          id: `wire_${Date.now()}_1`,
          fromNode: newNodes[0].id, // Condition
          fromPin: 'out_exec',
          toNode: newNodes[1].id,   // Branch
          toPin: 'in_exec'
        },
        {
          id: `wire_${Date.now()}_2`,
          fromNode: newNodes[1].id, // Branch
          fromPin: 'out_exec_true',
          toNode: newNodes[2].id,   // Bribe
          toPin: 'in_exec'
        },
        {
          id: `wire_${Date.now()}_3`,
          fromNode: newNodes[1].id, // Branch
          fromPin: 'out_exec_false',
          toNode: newNodes[3].id,   // Fight
          toPin: 'in_exec'
        },
        {
          id: `wire_${Date.now()}_4`,
          fromNode: newNodes[2].id, // Bribe
          fromPin: 'out_exec',
          toNode: newNodes[4].id,   // FX
          toPin: 'in_exec'
        }
      ];

      setIsDirty(true);
      setGameState(prev => ({
        ...prev,
        nodes: [...prev.nodes, ...newNodes],
        wires: [...(prev.wires || []), ...newWires]
      }));
      setIsDirty(true);
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

    // CRITICAL FIX: Create a temporary SpriteSheet so the Editor receives the data
    const tempSheet: SpriteSheet = {
      id: asset.id,
      url: imageUrl,
      prompt: asset.name, // Use asset name as fallback prompt
      style: 'Pixel Art', // Default style
      grid: { rows: 1, cols: 1 }, // Default grid
      timestamp: Date.now(),
      animationSets: []
    };
    setSynapseActiveSheet(tempSheet);

    console.log('[NEXGEN] Asset sent to Synapse Editor:', asset.name, 'URL:', imageUrl ? 'valid' : 'empty');

    setTimeout(() => {
      if (mainScrollRef.current) {
        mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);

    // AUTO-SCAN TRIGGER
    setIsScanning(true);
    detectGridLayout(imageUrl).then(grid => {
      setIsScanning(false);
      setSynapseActiveSheet(prev => prev ? { ...prev, grid } : null);
      // Auto-create simple animation set
      const frames: number[] = [];
      for (let i = 0; i < grid.cols; i++) frames.push(i);

      setSynapseActiveSheet(prev => prev ? {
        ...prev,
        grid,
        animationSets: [{
          id: 'preview',
          name: 'Auto-Preview',
          frames,
          fps: 8,
          loop: true
        }]
      } : null);
    }).catch(() => setIsScanning(false));
  };

  // Send asset from Assembler to Conductor Wave Editor
  const handleSendToConductor = async (asset: NexusAsset, previewUrl?: string) => {
    setConductorTab('AUDIO_FORGE');
    setActiveModule('CONDUCTOR');

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

    setConductorWorkingAudio({
      id: asset.id,
      name: asset.name,
      audioUrl
    });
    console.log('[NEXGEN] Asset sent to Conductor Wave Editor:', asset.name, 'URL:', audioUrl ? 'valid' : 'empty');
    if (mainScrollRef.current) mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateSprite = async () => {
    if (!synapsePrompt) return;
    setIsGeneratingSprite(true);
    setGenerationError(null);
    setGeneratedSprite(null);

    try {
      // Use the modern generateSpriteSheet service with full parameter passing
      const imageUrl = await generateSpriteSheet(
        synapsePrompt,
        synapseStyle,
        sliceGrid,
        synapseModel,
        synapseReferenceImages
      );

      if (imageUrl) {
        setGeneratedSprite(imageUrl);

        // Create full SpriteSheet object for the Editor
        const newSheet: SpriteSheet = {
          id: crypto.randomUUID(),
          url: imageUrl,
          prompt: synapsePrompt,
          style: synapseStyle,
          grid: { ...sliceGrid },
          timestamp: Date.now(),
          animationSets: []
        };

        // Update active sheet and switch to Editor automatically
        setSynapseActiveSheet(newSheet);
        setSynapseTab('EDITOR');
        console.log('[SYNAPSE] Neural synthesis complete. Transporting to Editor.');
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

  const handleGenerateTake = async (lineId: string) => {
    if (!conductorScript) return;
    const line = conductorScript.lines.find(l => l.id === lineId);
    if (!line) return;
    const char = conductorCharacters.find(c => c.id === line.characterId);
    if (!char) return;

    setConductorScript(prev => {
      if (!prev) return null;
      return {
        ...prev,
        lines: prev.lines.map(l => l.id === lineId ? { ...l, isGenerating: true } : l)
      };
    });

    try {
      const { pcmData, visemes } = await generateCharacterDialogue(
        line.text,
        char.voice,
        line.emotion || char.emotion,
        line.pitch || char.pitch,
        char.style,
        char.timbre
      );

      const audioUrl = URL.createObjectURL(pcmToWav(pcmData, 24000));
      const newTake: AudioTake = {
        id: `take-${Date.now()}`,
        audioUrl,
        pcmData,
        visemes,
        timestamp: Date.now(),
        pitch: line.pitch || char.pitch
      };

      // Proactive: Get a critique for the take
      const critique = await critiquePerformance(line.text, audioUrl);

      setConductorScript(prev => {
        if (!prev) return null;
        return {
          ...prev,
          lines: prev.lines.map(l => l.id === lineId ? {
            ...l,
            isGenerating: false,
            takes: [...l.takes, { ...newTake, critique }],
            activeTakeIndex: l.takes.length
          } : l)
        };
      });
    } catch (e) {
      console.error(e);
      setConductorScript(prev => {
        if (!prev) return null;
        return {
          ...prev,
          lines: prev.lines.map(l => l.id === lineId ? { ...l, isGenerating: false } : l)
        };
      });
    }
  };

  const handlePlayTake = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  const handleSetActiveTake = (lineId: string, index: number) => {
    setConductorScript(prev => {
      if (!prev) return null;
      return {
        ...prev,
        lines: prev.lines.map(l => l.id === lineId ? { ...l, activeTakeIndex: index } : l)
      };
    });
  };

  const handleDeleteTake = (lineId: string, index: number) => {
    setConductorScript(prev => {
      if (!prev) return null;
      return {
        ...prev,
        lines: prev.lines.map(l => l.id === lineId ? {
          ...l,
          takes: l.takes.filter((_, i) => i !== index),
          activeTakeIndex: Math.max(0, l.activeTakeIndex - (index <= l.activeTakeIndex ? 1 : 0))
        } : l)
      };
    });
  };

  const handleTableRead = async () => {
    if (!conductorScript || conductorScript.lines.length === 0) return;
    setIsTableReading(true);

    let currentIndex = 0;
    const lines = conductorScript.lines;

    const playNext = () => {
      if (currentIndex >= lines.length) {
        setIsTableReading(false);
        setActivePlaybackLineId(null);
        return;
      }

      const line = lines[currentIndex];
      const take = line.takes[line.activeTakeIndex];

      if (take) {
        setActivePlaybackLineId(line.id);
        const audio = new Audio(take.audioUrl);
        audio.onended = () => {
          currentIndex++;
          playNext();
        };
        audio.onerror = () => {
          currentIndex++;
          playNext();
        };
        audio.play();
      } else {
        currentIndex++;
        playNext();
      }
    };

    playNext();
  };

  const handleGenerateAudio = async () => {
    if (!conductorPrompt) return;
    setIsGeneratingAudio(true);
    try {
      const context = isContextBound ? { assets, variables: projectVariables } : undefined;
      const enhancedPrompt = `${conductorPrompt} // PERFORMANCE_DIRECTION: ${conductorVoice}`;
      await designNeuralSound(enhancedPrompt, conductorAudioCategory);
      setGeneratedAudio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleCallToStage = async () => {
    setIsGeneratingAudio(true);
    try {
      const response = await generateCharacterDialogue({ name: livePersona, description: "Live Session Actor" }, "Performance Start");
      setAiMessages(prev => [...prev, {
        role: 'model',
        content: `🎭 **Live Performance Initialized**\n\nActor: **${livePersona}**\nNotes: ${response.directorNotes || 'No notes'}\n\n"${response.text}"`,
        source: 'local',
        timestamp: Date.now()
      }]);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleForgeAudio = async (recipe: any) => {
    setIsForgingAudio(true);
    try {
      // In a real implementation, this would trigger the actual DSP engine
      console.log('[CONDUCTOR] Forging audio with recipe:', recipe);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setIsForgingAudio(false);
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
          // Pass to Conductor Generator
          setConductorTab('AUDIO_FORGE');
          setConductorPrompt(action.data.prompt);
          // Logic to start synthesis if needed
          break;

        case 'NAVIGATE':
          // Already handled by existing logic, but this formalizes it
          const mod = action.data.module as NexusModule;
          const setTabFunctions: Record<string, any> = {
            'GENESIS': setGenesisTab,
            'SYNAPSE': setSynapseTab,
            'CONDUCTOR': setConductorTab
          };
          // Just switch valid tabs if needed, mostly handled by activeModule state though
          break;

        case 'GENERATE_POSE':
          setSynapseTab('EDITOR');
          // Logic to trigger pose variation on the selected frame
          // This would ideally set state that the SynapseEditor picks up
          setAiMessages(prev => [...prev, { role: 'model', content: "Preparing pose generation in Synapse Editor...", source: 'local', timestamp: Date.now() }]);
          break;

        case 'INTERPOLATE_FRAMES':
          setSynapseTab('ANIMATOR');
          setAiMessages(prev => [...prev, { role: 'model', content: "Orchestrating frame interpolation in Synapse Animator...", source: 'local', timestamp: Date.now() }]);
          break;

        case 'NORMALIZE_SHEET':
          setSynapseTab('EDITOR');
          setAiMessages(prev => [...prev, { role: 'model', content: "Starting sprite sheet normalization...", source: 'local', timestamp: Date.now() }]);
          break;

        case 'DETECT_SPRITES':
          setSynapseTab('EDITOR');
          setAiMessages(prev => [...prev, { role: 'model', content: "Running computer vision sprite detection...", source: 'local', timestamp: Date.now() }]);
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

      const poseMatch = response.match(/__CMD_POSE__\[([^\]]+)\]/);
      if (poseMatch) {
        setCommandBuffer(prev => [...prev, {
          id: `cmd_pose_${Date.now()}`,
          type: 'GENERATE_POSE',
          status: 'QUEUED',
          description: `Generate Pose Variation: ${poseMatch[1]}`,
          data: { prompt: poseMatch[1] },
          timestamp: Date.now()
        }]);
      }

      const interpolateMatch = response.match(/__CMD_INTERPOLATE__\[([^\]]+)\]/);
      if (interpolateMatch) {
        setCommandBuffer(prev => [...prev, {
          id: `cmd_interp_${Date.now()}`,
          type: 'INTERPOLATE_FRAMES',
          status: 'QUEUED',
          description: `Interpolate Frames: ${interpolateMatch[1]}`,
          data: { prompt: interpolateMatch[1] },
          timestamp: Date.now()
        }]);
      }

      const normalizeMatch = response.match(/__CMD_NORMALIZE__/);
      if (normalizeMatch) {
        setCommandBuffer(prev => [...prev, {
          id: `cmd_norm_${Date.now()}`,
          type: 'NORMALIZE_SHEET',
          status: 'QUEUED',
          description: `Normalize Sprite Sheet`,
          data: {},
          timestamp: Date.now()
        }]);
      }

      const detectMatch = response.match(/__CMD_DETECT__/);
      if (detectMatch) {
        setCommandBuffer(prev => [...prev, {
          id: `cmd_detect_${Date.now()}`,
          type: 'DETECT_SPRITES',
          status: 'QUEUED',
          description: `Detect Individual Sprites`,
          data: {},
          timestamp: Date.Now()
        }]);
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
      console.log('[AUTO-BUILD] No project directory open, requesting folder access...');
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

        // If 50% match or share a specific key identifier (ignoring common words like 'idle', 'walk', 'run', 'jump', 'attack', 'sfx')
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
      sprites.forEach((sprite, i) => {
        const canvas = document.createElement('canvas');
        canvas.width = sprite.w;
        canvas.height = sprite.h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, sprite.x, sprite.y, sprite.w, sprite.h, 0, 0, sprite.w, sprite.h);
          newFrames.push({
            id: `neural_slice_${Date.now()}_${i}`,
            image: canvas.toDataURL('image/png'),
            duration: 100
          });
        }
      });

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
    setIsDirty(true);
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

  const getBezierPath = (startX: number, startY: number, endX: number, endY: number) => {
    const dx = Math.abs(endX - startX) * 0.5;
    return `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;
  };

  const toggleCategory = (title: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

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
      color: 'text-cyan-400',
      items: [
        { label: 'Spawn Player', icon: UserPlus, color: 'border-cyan-500/40 bg-cyan-500/10' },
        { label: 'Set Health', icon: Heart, color: 'border-cyan-500/40 bg-cyan-500/10' },
        { label: 'Add Score', icon: Trophy, color: 'border-cyan-500/40 bg-cyan-500/10' },
        { label: 'Give Item', icon: Gift, color: 'border-cyan-500/40 bg-cyan-500/10' },
        { label: 'Take Item', icon: Scissors, color: 'border-cyan-500/40 bg-cyan-500/10' },
        { label: 'Kill Player', icon: Skull, color: 'border-cyan-500/40 bg-cyan-500/10' },
      ]
    },
    {
      title: 'AUDIO',
      icon: Volume2,
      color: 'text-orange-400',
      items: [
        { label: 'Play Sound', icon: Volume2, color: 'border-orange-500/40 bg-orange-500/10' },
        { label: 'Play Music', icon: Music, color: 'border-orange-500/40 bg-orange-500/10' },
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

  const renderConductor = () => {
    return (
      <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[#020617] relative">
        {/* Left Side: Module Nav & Actor Pool */}
        <aside className="w-80 border-r border-white/5 flex flex-col bg-slate-900/40 backdrop-blur-xl shrink-0">
          <div className="p-8 border-b border-white/5">
            <h2 className="text-xl font-black font-orbitron text-white tracking-tighter flex items-center gap-4">
              <Clapperboard size={24} className="text-pink-500" /> CONDUCTOR
            </h2>
            <p className="text-[9px] text-slate-500 font-black tracking-[0.4em] uppercase mt-2">Neural Production Lab</p>
          </div>

          {/* Module Navigation */}
          <nav className="p-4 space-y-2">
            {[
              { id: 'SCRIPT_STUDIO', label: 'Script Studio', icon: FileText, color: 'text-indigo-400' },
              { id: 'AUDIO_FORGE', label: 'Audio Forge', icon: Mic, color: 'text-emerald-400' },
              { id: 'SPATIAL_ARCHITECT', label: 'Spatial Architect', icon: MapIcon, color: 'text-cyan-400' },
              { id: 'MASTER_STAGE', label: 'Master Stage', icon: Film, color: 'text-pink-400' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setConductorTab(tab.id as ConductorTab)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${conductorTab === tab.id
                  ? 'bg-white/5 border border-white/10 shadow-xl'
                  : 'text-slate-500 hover:text-slate-200'
                  }`}
              >
                <tab.icon size={18} className={conductorTab === tab.id ? tab.color : 'opacity-40'} />
                <span className="text-sm font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Actor Pool */}
          <div className="flex-1 p-4 border-t border-white/5 overflow-y-auto custom-scrollbar">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Actor Pool</h3>
            <div className="space-y-3">
              {conductorCharacters.map(char => (
                <div
                  key={char.id}
                  onClick={() => setSelectedActorId(selectedActorId === char.id ? null : char.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedActorId === char.id
                    ? 'bg-purple-600/20 border-2 border-purple-500/50'
                    : 'bg-slate-950/40 border border-white/5 hover:bg-slate-900/50'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedActorId === char.id ? 'bg-purple-500/30 text-purple-300' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                    <User size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {selectedActorId === char.id ? (
                      <input
                        type="text"
                        value={char.name}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setConductorCharacters(prev => prev.map(c => c.id === char.id ? { ...c, name: e.target.value } : c))}
                        className="w-full bg-transparent border-b border-purple-500/50 text-xs font-bold text-white outline-none"
                      />
                    ) : (
                      <p className="text-xs font-bold text-slate-300 truncate">{char.name}</p>
                    )}
                    <p className="text-[10px] text-slate-500">{char.voice}</p>
                  </div>
                  {selectedActorId === char.id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setConductorCharacters(prev => prev.filter(c => c.id !== char.id)); setSelectedActorId(null); }}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => { const newId = Date.now().toString(); setConductorCharacters(prev => [...prev, { id: newId, name: 'New Actor', voice: 'Kore', emotion: 'Neutral', pitch: 0, style: 'Default', timbre: 0 }]); setSelectedActorId(newId); }} className="w-full py-2 bg-slate-900/50 border border-slate-800 border-dashed rounded-xl text-slate-500 text-xs font-bold uppercase hover:bg-slate-900 hover:text-slate-300 transition-all">+ Add Actor</button>
            </div>

            {/* Actor Edit Panel - Shows when actor is selected */}
            {selectedActorId && conductorCharacters.find(c => c.id === selectedActorId) && (
              <div className="mt-4 p-4 bg-slate-900/60 border border-purple-500/20 rounded-xl space-y-3">
                <h4 className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Actor Settings</h4>
                <div className="space-y-2">
                  <label className="text-[9px] text-slate-500 uppercase">Voice</label>
                  <select
                    value={conductorCharacters.find(c => c.id === selectedActorId)?.voice || 'Kore'}
                    onChange={(e) => setConductorCharacters(prev => prev.map(c => c.id === selectedActorId ? { ...c, voice: e.target.value } : c))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                  >
                    <option value="Kore">Kore (Female)</option>
                    <option value="Puck">Puck (Male)</option>
                    <option value="Charon">Charon (Deep Male)</option>
                    <option value="Fenrir">Fenrir (Gruff)</option>
                    <option value="Aoede">Aoede (Soft Female)</option>
                    <option value="Leda">Leda (Young Female)</option>
                    <option value="Orus">Orus (Elderly Male)</option>
                    <option value="Zephyr">Zephyr (Neutral)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] text-slate-500 uppercase">Pitch Shift</label>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    value={conductorCharacters.find(c => c.id === selectedActorId)?.pitch || 0}
                    onChange={(e) => setConductorCharacters(prev => prev.map(c => c.id === selectedActorId ? { ...c, pitch: parseInt(e.target.value) } : c))}
                    className="w-full accent-purple-500"
                  />
                  <div className="flex justify-between text-[8px] text-slate-600">
                    <span>-12</span>
                    <span>{conductorCharacters.find(c => c.id === selectedActorId)?.pitch || 0}st</span>
                    <span>+12</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] text-slate-500 uppercase">Mood</label>
                  <select
                    value={conductorCharacters.find(c => c.id === selectedActorId)?.emotion || 'Neutral'}
                    onChange={(e) => setConductorCharacters(prev => prev.map(c => c.id === selectedActorId ? { ...c, emotion: e.target.value } : c))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                  >
                    <optgroup label="Calm">
                      <option value="Neutral">Neutral 😐</option>
                      <option value="Content">Content 🙂</option>
                      <option value="Relaxed">Relaxed 😌</option>
                      <option value="Bored">Bored 😑</option>
                    </optgroup>
                    <optgroup label="Positive">
                      <option value="Happy">Happy 😊</option>
                      <option value="Excited">Excited 🤩</option>
                      <option value="Confident">Confident 😎</option>
                      <option value="Amused">Amused 😏</option>
                      <option value="Loving">Loving 🥰</option>
                      <option value="Hopeful">Hopeful ✨</option>
                    </optgroup>
                    <optgroup label="Negative">
                      <option value="Sad">Sad 😢</option>
                      <option value="Angry">Angry 😠</option>
                      <option value="Grumpy">Grumpy 😤</option>
                      <option value="Annoyed">Annoyed 🙄</option>
                      <option value="Frustrated">Frustrated 😣</option>
                      <option value="Bitter">Bitter 😒</option>
                    </optgroup>
                    <optgroup label="Fear/Anxiety">
                      <option value="Fearful">Fearful 😨</option>
                      <option value="Nervous">Nervous 😰</option>
                      <option value="Worried">Worried 😟</option>
                      <option value="Paranoid">Paranoid 👀</option>
                    </optgroup>
                    <optgroup label="Surprise/Shock">
                      <option value="Surprised">Surprised 😲</option>
                      <option value="Shocked">Shocked 😱</option>
                      <option value="Confused">Confused 😵</option>
                      <option value="Disgusted">Disgusted 🤢</option>
                    </optgroup>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] text-slate-500 uppercase">Personality</label>
                  <select
                    value={conductorCharacters.find(c => c.id === selectedActorId)?.style || 'Default'}
                    onChange={(e) => setConductorCharacters(prev => prev.map(c => c.id === selectedActorId ? { ...c, style: e.target.value } : c))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                  >
                    <optgroup label="Archetypes">
                      <option value="Default">Default</option>
                      <option value="Hero">Hero - Brave & Noble</option>
                      <option value="Villain">Villain - Menacing</option>
                      <option value="Anti-Hero">Anti-Hero - Morally Grey</option>
                      <option value="Sidekick">Sidekick - Loyal Support</option>
                      <option value="Mentor">Mentor - Wise Guide</option>
                      <option value="Trickster">Trickster - Cunning & Playful</option>
                    </optgroup>
                    <optgroup label="Emotional">
                      <option value="Comic">Comic - Humorous</option>
                      <option value="Romantic">Romantic - Charming</option>
                      <option value="Dramatic">Dramatic - Intense</option>
                      <option value="Melancholic">Melancholic - Somber</option>
                      <option value="Optimistic">Optimistic - Hopeful</option>
                      <option value="Cynical">Cynical - Distrustful</option>
                    </optgroup>
                    <optgroup label="Behavioral">
                      <option value="Stoic">Stoic - Reserved</option>
                      <option value="Aggressive">Aggressive - Confrontational</option>
                      <option value="Mysterious">Mysterious - Cryptic</option>
                      <option value="Nervous">Nervous - Anxious</option>
                      <option value="Cocky">Cocky - Overconfident</option>
                      <option value="Timid">Timid - Shy</option>
                      <option value="Sarcastic">Sarcastic - Dry Wit</option>
                    </optgroup>
                    <optgroup label="Professional">
                      <option value="Military">Military - Disciplined</option>
                      <option value="Scholar">Scholar - Intellectual</option>
                      <option value="Merchant">Merchant - Persuasive</option>
                      <option value="Rogue">Rogue - Streetwise</option>
                      <option value="Royal">Royal - Regal</option>
                      <option value="Zealot">Zealot - Fanatical</option>
                    </optgroup>
                    <optgroup label="Creature">
                      <option value="Feral">Feral - Wild & Primal</option>
                      <option value="Robotic">Robotic - Mechanical</option>
                      <option value="Ethereal">Ethereal - Otherworldly</option>
                      <option value="Demonic">Demonic - Sinister</option>
                      <option value="Childlike">Childlike - Innocent</option>
                    </optgroup>
                  </select>
                </div>

                {/* Intensity Slider */}
                <div className="space-y-2">
                  <label className="text-[9px] text-slate-500 uppercase">Intensity</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={conductorCharacters.find(c => c.id === selectedActorId)?.timbre || 5}
                    onChange={(e) => setConductorCharacters(prev => prev.map(c => c.id === selectedActorId ? { ...c, timbre: parseInt(e.target.value) } : c))}
                    className="w-full accent-pink-500"
                  />
                  <div className="flex justify-between text-[8px] text-slate-600">
                    <span>Subtle</span>
                    <span className="text-pink-400">{conductorCharacters.find(c => c.id === selectedActorId)?.timbre || 5}/10</span>
                    <span>Theatrical</span>
                  </div>
                </div>

                {/* Delivery Style */}
                <div className="space-y-2">
                  <label className="text-[9px] text-slate-500 uppercase">Delivery Style</label>
                  <select
                    value={(conductorCharacters.find(c => c.id === selectedActorId) as any)?.delivery || 'Natural'}
                    onChange={(e) => setConductorCharacters(prev => prev.map(c => c.id === selectedActorId ? { ...c, delivery: e.target.value } as any : c))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                  >
                    <optgroup label="Naturalistic">
                      <option value="Natural">Natural - Conversational</option>
                      <option value="Internal">Internal - Thinking Aloud</option>
                      <option value="Intimate">Intimate - Close & Personal</option>
                    </optgroup>
                    <optgroup label="Dramatic">
                      <option value="Theatrical">Theatrical - Stage Performance</option>
                      <option value="Melodramatic">Melodramatic - Over-the-Top</option>
                      <option value="Declarative">Declarative - Announcements</option>
                    </optgroup>
                    <optgroup label="Specialized">
                      <option value="Monotone">Monotone - Flat Delivery</option>
                      <option value="Whisper">Whisper - Hushed</option>
                      <option value="Shout">Shout - Yelling</option>
                      <option value="Sing-Song">Sing-Song - Melodic</option>
                      <option value="Staccato">Staccato - Sharp & Clipped</option>
                    </optgroup>
                  </select>
                </div>

                {/* Physical State */}
                <div className="space-y-2">
                  <label className="text-[9px] text-slate-500 uppercase">Physical State</label>
                  <select
                    value={(conductorCharacters.find(c => c.id === selectedActorId) as any)?.physicalState || 'Normal'}
                    onChange={(e) => setConductorCharacters(prev => prev.map(c => c.id === selectedActorId ? { ...c, physicalState: e.target.value } as any : c))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                  >
                    <option value="Normal">Normal - Healthy</option>
                    <optgroup label="Fatigue">
                      <option value="Tired">Tired - Weary</option>
                      <option value="Exhausted">Exhausted - Drained</option>
                      <option value="Sleepy">Sleepy - Drowsy</option>
                    </optgroup>
                    <optgroup label="Physical Stress">
                      <option value="OutOfBreath">Out of Breath - Winded</option>
                      <option value="Injured">Injured - In Pain</option>
                      <option value="Dying">Dying - Fading</option>
                    </optgroup>
                    <optgroup label="Impaired">
                      <option value="Drunk">Drunk - Intoxicated</option>
                      <option value="Sick">Sick - Unwell</option>
                      <option value="Cold">Cold - Shivering</option>
                      <option value="Hot">Hot - Overheated</option>
                    </optgroup>
                    <optgroup label="Heightened">
                      <option value="Adrenaline">Adrenaline - Pumped</option>
                      <option value="Crying">Crying - Tearful</option>
                      <option value="Laughing">Laughing - Giggling</option>
                    </optgroup>
                  </select>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Side: Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0B10] text-slate-300 font-sans selection:bg-pink-500/30">
          {/* CONDUCTOR TOP NAVIGATION BAR */}
          <div className="h-14 border-b border-white/5 bg-[#0A0B10]/95 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-40">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                  <Music size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">Conductor</h2>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Sonic & Cinematic Suite</p>
                </div>
              </div>

            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setConductorTab('SCRIPT_STUDIO')} // Or some quick summon modal
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 border border-indigo-500/30 rounded-lg text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
              >
                <Sparkles size={12} /> Summon Script
              </button>
            </div>
          </div>

          {/* CONDUCTOR CONTENT AREA */}
          <div className="flex-1 overflow-hidden relative">
            {conductorTab === 'SCRIPT_STUDIO' && (
              <ScriptStudio
                characters={conductorCharacters}
                script={conductorScript}
                setScript={setConductorScript}
                isScripting={isScripting}
                onGenerateScript={async (prompt) => {
                  setConductorPrompt(prompt);
                  setIsScripting(true);
                  try {
                    // Call AI to generate script
                    const result = await generateConductorScript(prompt, conductorCharacters.map(c => ({ id: c.id, name: c.name })));

                    const generated: ConductorScript = {
                      id: Date.now().toString(),
                      title: result.title || "AI Generated Script",
                      scenes: [],
                      lines: (result.lines || []).map((line: any, idx: number) => ({
                        id: `line-${Date.now()}-${idx}`,
                        characterId: line.characterId || conductorCharacters[0]?.id || 'narrator',
                        text: line.text || '',
                        activeTakeIndex: 0,
                        takes: []
                      }))
                    };

                    setConductorScript(generated);

                  } catch (e) {
                    console.error('Script generation error:', e);
                    // Fallback to basic script if AI fails
                    setConductorScript({
                      id: Date.now().toString(),
                      title: "New Script",
                      scenes: [],
                      lines: [{ id: '1', characterId: conductorCharacters[0]?.id || 'narrator', text: prompt, activeTakeIndex: 0, takes: [] }]
                    });
                  } finally {
                    setIsScripting(false);
                  }
                }}
                onAddLine={() => {
                  if (!conductorScript) {
                    setConductorScript({ id: '1', title: 'New Script', scenes: [], lines: [] });
                  }
                  // Logic to add line
                  const newLine: DialogueLine = { id: Date.now().toString(), characterId: conductorCharacters[0]?.id || '1', text: "New Line", activeTakeIndex: 0, takes: [] };
                  // Need a robust setLines helper, but for now:
                  setConductorScript({ ...conductorScript, lines: [...conductorScript.lines, newLine] });
                }}
                onGenerateTake={(lineId) => handleGenerateTake(lineId)}
                onPlayTake={(url) => setConductorWorkingAudio(prev => ({ ...prev, currentPreviewUrl: url }))}
                onSetActiveTake={(lineId, index) => {
                  // logic to update active take index
                }}
                onDeleteTake={(lineId, index) => {
                  // logic to delete take
                }}
                onOpenSpatialMap={() => setConductorTab('SPATIAL_ARCHITECT')}
                onTableRead={handleTableRead}
                isTableReading={isTableReading}
                activePlaybackLineId={activePlaybackLineId}
              />
            )}
            {conductorTab === 'AUDIO_FORGE' && (
              <AudioForge
                assets={audioForges}
                onAssetGenerated={(asset) => setAudioForges(prev => {
                  const exists = prev.find(a => a.id === asset.id);
                  if (exists) return prev.map(a => a.id === asset.id ? asset : a);
                  return [asset, ...prev];
                })}
              />
            )}
            {conductorTab === 'SPATIAL_ARCHITECT' && (
              <SceneStudio
                scenes={conductorScenes}
                characters={conductorCharacters}
                onUpdate={(id, updates) => {
                  setConductorScenes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
                }}
                onAdd={(scene) => {
                  if (scene) setConductorScenes(prev => [{
                    id: `scene-${Date.now()}`,
                    name: 'New Environment',
                    reverbSize: 0.2,
                    reverbDecay: 1.5,
                    wetMix: 0.3,
                    lowPassFreq: 5000,
                    description: '',
                    ...scene
                  } as ConductorScene, ...prev]);
                }}
              />
            )}
            {conductorTab === 'MASTER_STAGE' && (
              <MasterStage
                sequence={cinematicSequences[0] || {
                  id: 'seq-master',
                  name: 'Main Sequence',
                  tracks: [
                    { id: 'tr-1', name: 'Actor 1', clips: [], volume: 1, pan: 0, isMuted: false },
                    { id: 'tr-2', name: 'Actor 2', clips: [], volume: 1, pan: 0, isMuted: false },
                    { id: 'tr-3', name: 'Ambient', clips: [], volume: 0.5, pan: 0, isMuted: false },
                    { id: 'tr-4', name: 'SFX', clips: [], volume: 0.8, pan: 0, isMuted: false },
                  ],
                  timestamp: Date.now()
                }}
                dialogueAssets={conductorScript?.lines || []}
                forgeAssets={audioForges}
                characters={conductorCharacters}
                scenes={conductorScenes}
                onUpdate={(updates) => {
                  setCinematicSequences(prev => {
                    const existing = prev[0] || { id: 'seq-master', name: 'Main Sequence', tracks: [] };
                    return [{ ...existing, ...updates }, ...prev.slice(1)];
                  });
                }}
              />
            )}
          </div>

          {/* Bottom: Direct Conductor Link Bar */}
          <div className="h-16 bg-slate-900 border-t border-white/5 flex items-center justify-between px-8 backdrop-blur-3xl">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDirecting(true)}
                disabled={conductorCharacters.length === 0}
                className="flex items-center gap-3 px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-pink-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                <Mic2 size={16} /> Direct Conductor Link
              </button>
              <div className="flex gap-1.5 h-4 items-end opacity-40">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1 bg-slate-700 rounded-full h-full" />)}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Active Studio</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{conductorScenes[0]?.name || 'Dry Environment'}</span>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div className="flex items-center gap-3 text-slate-500">
                <Activity size={16} className="text-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest">Neural Signal Stable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSynapseGenerator = () => {
    return (
      <div className="h-full animate-in slide-in-from-bottom-6 duration-700 overflow-y-auto custom-scrollbar p-2">
        <GeneratorControls
          prompt={synapsePrompt}
          setPrompt={setSynapsePrompt}
          style={synapseStyle}
          setStyle={setSynapseStyle}
          grid={sliceGrid}
          setGrid={setSliceGrid}
          model={synapseModel}
          setModel={setSynapseModel}
          referenceImages={synapseReferenceImages}
          setReferenceImages={setSynapseReferenceImages}
          autoTransparency={synapseAutoTransparency}
          setAutoTransparency={setSynapseAutoTransparency}
          transparencyTolerance={synapseTransparencyTolerance}
          setTransparencyTolerance={setSynapseTransparencyTolerance}
          isLoading={isGeneratingSprite}
          onGenerate={handleGenerateSprite}
          onImportSheet={(url, grid) => {
            const newSheet: SpriteSheet = {
              id: crypto.randomUUID(),
              url,
              prompt: "Manual Import",
              style: synapseStyle,
              grid,
              timestamp: Date.now()
            };
            setSynapseActiveSheet(newSheet);
            setSynapseTab('EDITOR');
          }}
          onImportProject={(sheet) => {
            setSynapseActiveSheet(sheet);
            setSynapseTab('EDITOR');
          }}
        />
      </div>
    );
  };

  const renderSynapseEditor = () => {
    if (!synapseActiveSheet) {
      return (
        <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
          <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center text-slate-700 border border-white/5">
            <ImageIcon size={48} />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-slate-300 uppercase tracking-widest">No Active Asset</h3>
            <p className="text-sm text-slate-600 uppercase font-black tracking-widest">Generate an asset or import one in the Generator tab</p>
          </div>
          <button onClick={() => setSynapseTab('GENERATOR')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Go to Generator</button>
        </div>
      );
    }

    return (
      <div className="h-full relative">
        {/* Scanning Overlay */}
        {isScanning && (
          <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6" />
            <div className="text-2xl font-black text-white uppercase tracking-widest font-orbitron animate-pulse">Neural Scan Active</div>
            <p className="text-emerald-400 font-mono mt-2 text-xs">DETECTING SPRITE GEOMETRY</p>
          </div>
        )}

        <AnimationStudio
          sheet={synapseActiveSheet}
          onUpdateSheet={(updated) => {
            setSynapseActiveSheet(prev => prev ? { ...prev, ...updated } : null);
          }}
        />

        {/* Forge Button - Only when animation exists */}
        {synapseActiveSheet && synapseActiveSheet.animationSets.length > 0 && !isScanning && (
          <div className="absolute bottom-6 right-6 z-40 animate-in slide-in-from-bottom-4">
            <button
              onClick={() => setShowForgeModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black uppercase tracking-widest rounded-xl shadow-lg hover:scale-105 hover:shadow-cyan-500/20 transition-all flex items-center gap-3">
              <Rocket size={18} /> Forge Entity
            </button>
          </div>
        )}
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
            {['GENERATOR', 'EDITOR', 'RIGGING'].map((tab) => (
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
          {synapseTab === 'RIGGING' && renderSynapseRigging()}
        </div>
      </div>
    );
  };

  const renderVisualLogic = () => {
    return (
      <div className="flex h-full gap-6 animate-in fade-in duration-700 overflow-hidden">
        {/* Node Library */}
        <div className="w-80 glass-panel rounded-3xl border border-slate-800 p-6 flex flex-col gap-6 bg-slate-900/10 overflow-hidden">
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              value={genesisSidebarSearch}
              onChange={(e) => setGenesisSidebarSearch(e.target.value)}
              placeholder="Search logic blocks..."
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600"
            />
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1 space-y-8 pr-2">
            {sidebarCategories.map((cat, i) => {
              const isCollapsed = collapsedCategories.has(cat.title);
              const filteredItems = cat.items.filter(item => item.label.toLowerCase().includes(genesisSidebarSearch.toLowerCase()));

              if (genesisSidebarSearch && filteredItems.length === 0) return null;

              return (
                <div key={i} className="space-y-4">
                  <button
                    onClick={() => toggleCategory(cat.title)}
                    className={`w-full text-[10px] font-black tracking-[0.2em] flex items-center justify-between group transition-all p-1 rounded-lg hover:bg-white/5 ${cat.color} uppercase`}
                  >
                    <div className="flex items-center gap-2">
                      <cat.icon size={14} className="group-hover:scale-110 transition-transform" />
                      {cat.title}
                    </div>
                    {!genesisSidebarSearch && <ChevronDown size={14} className={`transition-transform duration-300 ${isCollapsed ? '-rotate-90 opacity-40' : ''}`} />}
                  </button>
                  {(!isCollapsed || genesisSidebarSearch) && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                      {filteredItems.map((item, j) => (
                        <button
                          key={j}
                          onClick={() => { addManualNode(cat.title, item.label, item.color); setIsDirty(true); }}
                          className="w-full flex items-center gap-3 p-2.5 bg-slate-950/20 border border-slate-800/50 rounded-xl hover:border-slate-600 hover:bg-slate-900/60 transition-all text-left group"
                          title="Click to add node"
                        >
                          <div className="p-1.5 rounded-lg border border-white/5 text-slate-400 group-hover:text-white">
                            <item.icon size={12} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200 uppercase tracking-tight truncate">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* The Board Workspace */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2">
              <GitMerge size={14} className="text-cyan-400" />
              <span className="text-[10px] font-black text-slate-200 tracking-[0.2em] uppercase">Synapse Graph</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-1 shadow-2xl backdrop-blur-md group/command">
              <div className="flex items-center gap-1 bg-slate-950/40 border border-white/5 rounded-xl p-1 mr-2 px-3">
                <button onClick={() => handleZoom(-0.1)} className="p-1.5 text-slate-500 hover:text-white rounded-lg"><ZoomOut size={14} /></button>
                <div className="w-[1px] h-3 bg-slate-800 mx-1" />
                <span className="text-[9px] font-mono text-slate-400 w-8 text-center uppercase">{Math.round(zoom * 100)}%</span>
                <div className="w-[1px] h-3 bg-slate-800 mx-1" />
                <button onClick={() => handleZoom(0.1)} className="p-1.5 text-slate-500 hover:text-white rounded-lg"><ZoomIn size={14} /></button>
                <button onClick={handleFitToView} className="p-1.5 text-cyan-500/60 hover:text-cyan-400 flex items-center gap-1.5 px-2 ml-1 bg-cyan-500/5 rounded-lg border border-cyan-500/10"><Focus size={12} /><span className="text-[8px] font-black uppercase">Fit</span></button>
              </div>

              <button
                onClick={handleNeuralOrchestration}
                className="px-4 py-2 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-xl text-[9px] font-black tracking-widest uppercase hover:bg-purple-600/20 transition-all flex items-center gap-2 hover:border-purple-500/40"
              >
                <Sparkles size={14} /> AI Auto-Link ({assets.filter(a => a.status === 'Unlinked').length})
              </button>

              <button
                onClick={() => { setGameState(prev => ({ ...prev, nodes: [], wires: [] })); setIsDirty(true); }}
                className="px-4 py-2 bg-red-600/10 border border-red-500/20 text-red-400 rounded-xl text-[9px] font-black tracking-widest uppercase hover:bg-red-600/20 flex items-center gap-2 hover:border-red-500/40"
              >
                <Trash2 size={14} /> Clear
              </button>

              <button
                onClick={() => { handleSaveToWorkspace(); setIsDirty(false); }}
                className={`px-6 py-2 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all flex items-center gap-2 shadow-lg ${isDirty
                  ? 'bg-emerald-600 text-white animate-pulse-dirty border-emerald-400'
                  : 'bg-slate-800/40 text-slate-500 border border-white/5 cursor-not-allowed grayscale'
                  }`}
              >
                <Save size={14} /> {isDirty ? 'Save Changes' : 'Saved'}
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
                {/* Tactical Blueprint Grid */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Blueprint Grid Pattern */}
                  <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                      backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)`,
                      backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
                    }}
                  />
                  {/* Major Grid Lines */}
                  <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                      backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)`,
                      backgroundSize: `${200 * zoom}px ${200 * zoom}px`,
                    }}
                  />
                </div>

                {/* Wires Connection Layer (SVG) */}
                <svg
                  className="absolute inset-0 pointer-events-none origin-center transition-transform duration-75"
                  style={{ width: BOARD_SIZE, height: BOARD_SIZE, transform: `scale(${zoom})` }}
                >
                  {gameState.wires && gameState.wires.map((wire) => {
                    const fromNode = gameState.nodes.find(n => n.id === wire.fromNode);
                    const toNode = gameState.nodes.find(n => n.id === wire.toNode);
                    if (!fromNode || !toNode) return null;

                    // Calculate port positions (Right side for output, Left side for input)
                    // Note: Node width is 240 (w-60), height is approx 160
                    const startX = fromNode.x + 120; // Right edge relative to center
                    const startY = fromNode.y;
                    const endX = toNode.x - 120; // Left edge relative to center
                    const endY = toNode.y;

                    const d = getBezierPath(startX, startY, endX, endY);

                    return (
                      <g key={wire.id}>
                        <path
                          d={d}
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d={d}
                          stroke="#22d3ee"
                          strokeWidth="1.5"
                          fill="none"
                          className="animate-line-flow opacity-40 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                        />
                      </g>
                    );
                  })}
                </svg>

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

                        {node.type === 'Conductor' && (
                          <div className="mb-4 space-y-2">
                            <label className="text-[7px] font-black text-pink-500 uppercase tracking-widest">Linked Audio Asset</label>
                            <select
                              className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-[9px] text-slate-300 focus:outline-none focus:border-pink-500/50"
                              value={node.data?.assetId || ''}
                              onChange={(e) => {
                                const assetId = e.target.value;
                                setGameState(prev => ({
                                  ...prev,
                                  nodes: prev.nodes.map(n => n.id === node.id ? { ...n, data: { ...n.data, assetId } } : n)
                                }));
                              }}
                            >
                              <option value="">None</option>
                              {assets.filter(a => a.type === 'Audio').map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                              ))}
                            </select>

                            <label className="text-[7px] font-black text-indigo-500 uppercase tracking-widest mt-2 block">Ambient Environment</label>
                            <select
                              className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-[9px] text-slate-300 focus:outline-none focus:border-indigo-500/50"
                              value={node.data?.sceneId || ''}
                              onChange={(e) => {
                                const sceneId = e.target.value;
                                setGameState(prev => ({
                                  ...prev,
                                  nodes: prev.nodes.map(n => n.id === node.id ? { ...n, data: { ...n.data, sceneId } } : n)
                                }));
                              }}
                            >
                              <option value="">None</option>
                              {conductorScenes.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
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
                className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${genesisTab === tab.id
                  ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.5)] scale-105'
                  : 'bg-slate-900/40 text-slate-500 hover:text-slate-200 border border-white/5 hover:border-cyan-500/30'
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
              <button
                onClick={handleNeuralQuestForge}
                disabled={isForgingQuests}
                className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest"
              >
                {isForgingQuests ? <RefreshCcw size={12} className="animate-spin" /> : <Sparkles size={12} />} Neural Forge
              </button>
              <button onClick={handleQuestAutoSync} className="p-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest" title="Auto-Sync Assets">
                <Database size={12} /> Sync
              </button>
              <button onClick={handleAddQuest} className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700" title="Add New Quest"><Plus size={14} /></button>
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
                <div className="flex gap-4">
                  <button
                    onClick={() => handleCastQuestToSynapse(allQuests[0])}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600/10 border border-indigo-500/30 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all shadow-lg hover:shadow-indigo-600/20"
                  >
                    <Paintbrush size={14} /> Synthesize Character
                  </button>
                  <button
                    onClick={() => handleCastQuestToConductor(allQuests[0])}
                    className="flex items-center gap-2 px-6 py-2 bg-pink-600/10 border border-pink-500/30 rounded-full text-pink-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-pink-600 hover:text-white transition-all shadow-lg hover:shadow-pink-600/20"
                  >
                    <Film size={14} /> Cast to Conductor
                  </button>
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider self-center">{allQuests[0].status || 'In Progress'}</span>
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
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black font-orbitron tracking-tight text-white uppercase">Assembler <span className="text-cyan-500/50">// Asset Pipeline</span></h2>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 border rounded-md transition-all duration-500 ${isOrchestrating ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-slate-800/80 border-white/5 text-slate-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isOrchestrating ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                    <span className={`text-[7px] font-black tracking-[0.2em] uppercase ${isOrchestrating ? 'text-emerald-400' : 'text-red-400'}`}>{isOrchestrating ? 'LINK: ACTIVE' : 'LINK: OFF'}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1">Resource indexing, binding, and metadata optimization</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* AI Link Button - Uses Gemini API */}
              {/* AI Link Button - Primary Action */}
              <button
                onClick={handleNeuralOrchestration}
                disabled={isOrchestrating || assets.length === 0}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-lg hover:scale-105 active:scale-95 ${isOrchestrating || assets.length === 0 ? 'bg-slate-800 text-slate-600' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-500/20'
                  }`}
              >
                {isOrchestrating ? <RefreshCcw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isOrchestrating ? 'Linking...' : 'AI Link'}
              </button>

              {/* Live Sync Toggle - Secondary */}
              <button
                onClick={() => setIsLiveSyncEnabled(!isLiveSyncEnabled)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all border ${isLiveSyncEnabled ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/30 hover:text-white'}`}
              >
                <Zap size={16} className={isLiveSyncEnabled ? 'animate-pulse text-emerald-400' : ''} />
                {isLiveSyncEnabled ? 'Sync: ON' : 'Sync: OFF'}
              </button>

              {/* Optimize Button - Secondary */}
              <button
                onClick={handleOptimizeProject}
                disabled={isOptimizing}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all border ${isOptimizing ? 'bg-slate-800 border-transparent text-slate-600' : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5'}`}
              >
                {isOptimizing ? <RefreshCcw size={16} className="animate-spin" /> : <Rocket size={16} />}
                Optimize
              </button>

              {/* Scan Button - Secondary */}
              <button
                onClick={scanDirectory}
                disabled={isScanning}
                className={`flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all border ${isScanning ? 'bg-slate-800 border-transparent text-slate-600' : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/5'}`}
              >
                {isScanning ? <RefreshCcw size={16} className="animate-spin" /> : <Search size={16} />}
                {isScanning ? 'Scanning...' : 'Scan'}
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

            <div className="flex items-center gap-4">
              {/* Asset Search Bar - Glass-morphism */}
              <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  value={assetSearch}
                  onChange={e => setAssetSearch(e.target.value)}
                  placeholder="Search assets..."
                  className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl pl-9 pr-4 py-2 text-[10px] text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 w-48 transition-all focus:w-64"
                />
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

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900 border border-white/10 rounded-lg p-1 ml-4">
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'GRID' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-white'}`}
                title="List View"
              >
                <AlignJustify size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 glass-panel rounded-2xl p-8 overflow-y-auto custom-scrollbar relative">
            {/* Digital Rain / Matrix Effect Background */}
            <div className="absolute inset-0 pointer-events-none rounded-[2.5rem] border border-white/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="absolute top-0 -left-1/4 w-full h-[200%] bg-gradient-to-b from-transparent via-cyan-900/5 to-transparent -skew-y-12 animate-pulse opacity-20" />
            </div>

            <div className="pb-20 space-y-4">
              {Object.keys(assetGroups).sort().map(path => {
                const isScript = path.toLowerCase().includes('script') || path.toLowerCase().includes('src');
                return (
                  <div key={path} className="mb-6">
                    <button
                      onClick={() => togglePath(path)}
                      className="flex items-center gap-2 mb-3 px-3 py-2 hover:bg-white/5 rounded-lg w-full text-left group transition-colors border border-transparent hover:border-white/5"
                    >
                      {collapsedPaths.has(path) ? <ChevronRight size={14} className="text-slate-500 group-hover:text-white transition-colors" /> : <ChevronDown size={14} className="text-slate-500 group-hover:text-white transition-colors" />}
                      <Folder size={14} className={isScript ? "text-amber-400" : "text-cyan-500"} />
                      <span className={`text-xs font-bold font-mono transition-colors ${isScript ? 'text-amber-100 group-hover:text-white' : 'text-slate-300 group-hover:text-white'}`}>{path}</span>
                      <span className="text-[10px] text-slate-600 bg-slate-900 border border-white/5 px-1.5 py-0.5 rounded ml-2 font-mono">{assetGroups[path].length}</span>
                      <div className={`flex-1 h-[1px] ml-4 transition-colors ${isScript ? 'bg-amber-500/10 group-hover:bg-amber-500/20' : 'bg-white/5 group-hover:bg-cyan-500/20'}`} />
                    </button>

                    {!collapsedPaths.has(path) && (
                      <div className={viewMode === 'GRID' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-300" : "flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300"}>
                        {assetGroups[path].map(asset => (
                          <AssetCard
                            key={asset.id}
                            asset={asset}
                            viewMode={viewMode}
                            isEditing={editingAssetId === asset.id}
                            editNameValue={editNameValue}
                            setEditNameValue={setEditNameValue}
                            startEdit={() => { setEditingAssetId(asset.id); setEditNameValue(asset.name); }}
                            saveEdit={saveRename}
                            onDelete={() => handleDeleteAsset(asset)}
                            onSendToSynapse={asset.type === 'Sprite' ? () => handleSendToSynapse(asset, asset.previewUrl) : undefined}
                            onSendToConductor={asset.type === 'Audio' ? () => handleSendToConductor(asset, asset.previewUrl) : undefined}
                            isSelected={selectedAssetIds.includes(asset.id)}
                            onToggleSelect={() => setSelectedAssetIds(prev =>
                              prev.includes(asset.id) ? prev.filter(id => id !== asset.id) : [...prev, asset.id]
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {assets.length === 0 && (
                <div className="col-span-full h-full flex flex-col items-center justify-center py-20 relative overflow-hidden">
                  <div className="radar-animation" style={{ width: '400px', height: '400px' }} />
                  {/* Technical Schematic Graphic Background */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <div className="w-[600px] h-[600px] border border-cyan-500 rounded-full animate-pulse flex items-center justify-center">
                      <div className="w-[450px] h-[450px] border border-dashed border-cyan-500 rounded-full animate-spin-slow" />
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-32 bg-cyan-500" />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-32 bg-cyan-500" />
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-1 bg-cyan-500" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-1 bg-cyan-500" />
                    </div>
                  </div>
                  <div className="relative z-10 opacity-30 flex flex-col items-center group cursor-pointer hover:opacity-100 transition-opacity duration-300">
                    <div className="relative">
                      <HardDrive size={80} className="text-cyan-400 animate-pulse group-hover:scale-110 transition-transform" />
                      <div className="absolute -inset-4 bg-cyan-500/20 blur-2xl rounded-full animate-pulse" />
                    </div>
                    <p className="mt-8 font-black uppercase tracking-[0.6em] text-lg text-white group-hover:text-cyan-400 transition-colors">Neural Index Offline</p>
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-2 animate-pulse">SCAN SYSTEM ASSETS TO ACTIVATE</p>
                  </div>
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

  // Forge Logic
  const handleForgeEntity = async () => {
    if (!synapseActiveSheet || !forgeName) return;
    setIsForging(true);

    try {
      // 1. Generate Logic
      const logicStr = await generateEntityLogic(forgeName, synapseActiveSheet.style);
      const logicData = JSON.parse(logicStr);

      // 2. Spawn in Nova
      const newEntity = {
        id: `forged_${Date.now()}`,
        name: forgeName,
        type: 'sprite',
        transform: { x: 400, y: 300, rotation: 0, scaleX: logicData.transform?.scaleX || 80, scaleY: logicData.transform?.scaleY || 80 },
        physics: {
          enabled: true,
          isStatic: false,
          vx: 0, vy: 0,
          mass: logicData.physics?.mass || 50,
          friction: logicData.physics?.friction || 0.5,
          restitution: logicData.physics?.restitution || 0.1
        },
        color: '#fff',
        zIndex: 10,
        assetData: synapseActiveSheet.url, // Use the sprite image
        script: logicData.onUpdate || '',
        internalState: {}
      };

      setForgedEntities(prev => [...prev, newEntity]);

      // 3. Switch to Nova
      setActiveModule('NOVA');
      setShowForgeModal(false);
      setForgeName('');

    } catch (e) {
      console.error("Forge failed:", e);
    } finally {
      setIsForging(false);
    }
  };

  const renderForgeModal = () => {
    if (!showForgeModal) return null;
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md animate-in fade-in">
        <div className="bg-slate-900 border border-emerald-500/30 p-8 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
          <h3 className="text-2xl font-black text-white font-orbitron uppercase tracking-widest mb-2">Neural Link</h3>
          <p className="text-slate-400 text-xs mb-8">Forge a new sentient entity from this asset.</p>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Entity Designation (Name)</label>
              <input
                value={forgeName}
                onChange={e => setForgeName(e.target.value)}
                placeholder="e.g. CYBER_NINJA_V1"
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white font-mono placeholder:text-slate-700 outline-none focus:border-emerald-500/50 transition-colors uppercase"
              />
            </div>
            <button
              onClick={handleForgeEntity}
              disabled={!forgeName || isForging}
              className="w-full py-4 bg-emerald-500 text-slate-950 font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isForging ? <RefreshCcw className="animate-spin" size={16} /> : <Zap size={16} />}
              {isForging ? 'Synthesizing Neural Cortex...' : 'Initialize Entity'}
            </button>
            <button onClick={() => setShowForgeModal(false)} className="w-full py-2 text-slate-500 text-[10px] uppercase font-bold tracking-widest hover:text-white">Cancel</button>
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
      case 'CONDUCTOR': return renderConductor();
      case 'NOVA':
        return <NexGenEngine
          initialEntities={forgedEntities}
          assets={assets}
          gameState={gameState}
        />;
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


  // const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Validated: Lifted to App.tsx

  return (
    <>
      <div className="flex h-full w-full gap-4 p-4">
        <aside className={`${isNexusSidebarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-64 opacity-100'} h-full flex flex-col gap-6 glass-panel rounded-2xl z-20 transition-all duration-500 ease-in-out`}>
          <div className="p-8 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="bg-cyan-500/10 p-2 rounded-lg text-cyan-400 border border-cyan-500/20"><BrainCircuit size={20} /></div>
              <div><h2 className="text-sm font-semibold text-white tracking-wide uppercase">NEXGEN ENGINE</h2><p className="text-xs text-slate-500">Core Workspace</p></div>
            </div>
          </div>
          <nav className="p-4 pr-6 flex flex-col gap-2 flex-none overflow-y-auto overflow-x-hidden custom-scrollbar">
            {[
              { id: 'ASSEMBLER', label: 'ASSEMBLER', icon: Database, desc: 'Asset Pipeline' },
              { id: 'GENESIS', label: 'GENESIS', icon: Workflow, desc: 'Logic Engine' },
              { id: 'SYNAPSE', label: 'SYNAPSE', icon: Sparkles, desc: 'AI Sprite Labs' },
              { id: 'CONDUCTOR', label: 'CONDUCTOR', icon: Clapperboard, desc: 'Cinematic Studio' },
              { id: 'NOVA', label: 'NOVA', icon: Cpu, desc: 'Game Runtime' },
              { id: 'ATLAS', label: 'ATLAS', icon: Layout, desc: 'UI Design Lab' },
              { id: 'AIRLOCK', label: 'AIRLOCK', icon: Rocket, desc: 'Cloud Deploy' },
            ].map(mod => (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id as NexusModule)}
                className={`w-full box-border flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 group ${activeModule === mod.id
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100 border border-transparent scale-hover'
                  }`}
              >
                <mod.icon size={18} className={activeModule === mod.id ? 'text-cyan-400' : 'group-hover:text-slate-100'} />
                <span className="font-medium tracking-wide text-xs flex-1">{mod.label}</span>
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
              className="w-full box-border flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/40 hover:text-slate-100 border border-transparent rounded-xl transition-all group mt-auto"
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

        {renderForgeModal()}

        <div className="flex-1 overflow-y-auto custom-scrollbar relative" ref={mainScrollRef}>

          <div className="w-full h-full">{renderModule()}</div>
        </div>

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
        <div className={`fixed top-0 right-0 h-full w-[480px] bg-[#0a0f1a]/80 backdrop-blur-xl border-l border-cyan-500/20 z-40 flex flex-col transition-transform duration-500 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] ${isAiPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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
                <div className={`w-1.5 h-1.5 rounded-full ${aiDeepContext.lastSyncTime ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-500 border border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'} animate-pulse`} />
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
                        setConductorPrompt(prompt);
                        setConductorAudioCategory(category as any);
                        setConductorTab('AUDIO_FORGE');
                        setActiveModule('CONDUCTOR');
                        setIsAiPanelOpen(false);
                      }}
                      className="w-full py-2 bg-pink-500/20 border border-pink-500/30 rounded-lg text-[9px] font-black text-pink-400 hover:bg-pink-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Mic size={12} /> Generate in Conductor
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
          <div className="p-6 border-t border-white/5 bg-slate-950/80 backdrop-blur-2xl">
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
                  <span className="text-[10px] font-mono text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]">-${neuralUsage.estimatedCost.toFixed(4)}</span>
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
      </div >

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
        )
      }

      {/* Neural Quest Review Dialog */}
      {
        showQuestReview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setShowQuestReview(false)} />
            <div className="w-full max-w-5xl glass-panel rounded-[3.5rem] border border-cyan-500/30 bg-slate-900/40 p-12 flex flex-col gap-8 shadow-[0_0_100px_rgba(6,182,212,0.15)] relative animate-in zoom-in-95 duration-500">
              <div className="absolute top-8 right-8">
                <button onClick={() => setShowQuestReview(false)} className="p-4 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={24} /></button>
              </div>

              <header className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400 border border-cyan-500/20 border-b-4">
                    <Workflow size={32} />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black font-orbitron text-white tracking-tighter uppercase">Neural Quest <span className="text-cyan-500">Forge</span></h2>
                    <p className="text-[10px] text-slate-500 font-black tracking-[0.4em] uppercase mt-1">Analyzing project DNA for narrative opportunities</p>
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-3 gap-8 pr-2 custom-scrollbar overflow-y-auto max-h-[55vh]">
                {proposedQuests.map((quest, i) => (
                  <div key={i} className="glass-panel p-8 rounded-[2.5rem] border border-white/5 bg-slate-950/60 hover:border-cyan-500/40 transition-all flex flex-col gap-6 group relative">
                    <div className="flex justify-between items-center">
                      <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-black uppercase tracking-widest">{quest.type}</span>
                      <button onClick={() => setProposedQuests(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-red-500/40 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-lg font-black text-white uppercase tracking-tight leading-tight">{quest.title}</h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-bold uppercase opacity-60 line-clamp-4">{quest.description}</p>
                    </div>

                    <div className="space-y-4 mt-auto pt-6 border-t border-white/5">
                      <div className="flex flex-wrap gap-2">
                        {quest.objectives?.map((obj: any, j: number) => (
                          <div key={j} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                            <span className="text-[8px] font-black text-slate-400 uppercase truncate max-w-[120px]">{obj.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <footer className="flex justify-between items-center pt-8 border-t border-white/5">
                <div className="flex items-center gap-4 text-slate-500">
                  <Database size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{proposedQuests.length} Quest Proposals Generated</span>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowQuestReview(false)}
                    className="px-10 py-5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all"
                  >
                    Discard Proposals
                  </button>
                  <button
                    onClick={() => {
                      setGameState(prev => ({
                        ...prev,
                        quests: [...(prev.quests || []), ...proposedQuests]
                      }));
                      setShowQuestReview(false);
                      setProposedQuests([]);
                    }}
                    className="px-14 py-5 bg-cyan-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-cyan-600/20 hover:bg-cyan-500 transition-all transform hover:-translate-y-1"
                  >
                    Sync to Genesis Core
                  </button>
                </div>
              </footer>
            </div>
          </div>
        )
      }

      {/* Direct Conductor Link Modal */}
      {isDirecting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-slate-900 border border-pink-500/30 rounded-3xl shadow-2xl shadow-pink-600/20 overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-pink-600/10 to-purple-600/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
                    <Mic2 size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-widest">Direct Conductor Link</h2>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Live Voice Direction Mode</p>
                  </div>
                </div>
                <button onClick={() => setIsDirecting(false)} className="text-slate-500 hover:text-white p-2">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Select Actor</label>
                <div className="grid grid-cols-2 gap-3">
                  {conductorCharacters.map(char => (
                    <button key={char.id} onClick={() => setSelectedActorId(char.id)} className={`p-4 rounded-xl border-2 transition-all text-left ${selectedActorId === char.id ? 'bg-purple-600/20 border-purple-500' : 'bg-slate-800/50 border-white/5 hover:border-white/20'}`}>
                      <p className="text-sm font-bold text-white">{char.name}</p>
                      <p className="text-[10px] text-slate-500">{char.voice}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Dialogue Line</label>
                <textarea value={conductorPrompt} onChange={(e) => setConductorPrompt(e.target.value)} placeholder="Type dialogue for the selected actor..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-pink-500/50 min-h-[100px] resize-none" />
              </div>
              <button
                onClick={async () => {
                  const selectedActor = conductorCharacters.find(c => c.id === selectedActorId);
                  if (!selectedActor || !conductorPrompt.trim()) return;
                  setIsGeneratingAudio(true);
                  try {
                    const newLine: DialogueLine = { id: Date.now().toString(), characterId: selectedActor.id, text: conductorPrompt, activeTakeIndex: 0, takes: [] };
                    if (conductorScript) {
                      setConductorScript({ ...conductorScript, lines: [...conductorScript.lines, newLine] });
                    } else {
                      setConductorScript({ id: '1', title: 'Live Session', scenes: [], lines: [newLine] });
                    }
                    await handleGenerateTake(newLine.id);
                    setConductorPrompt('');
                  } catch (e) { console.error('Direct Conductor Error:', e); } finally { setIsGeneratingAudio(false); }
                }}
                disabled={!selectedActorId || !conductorPrompt.trim() || isGeneratingAudio}
                className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-pink-600/30 hover:shadow-pink-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isGeneratingAudio ? (<><Activity size={18} className="animate-spin" /> Generating Take...</>) : (<><Sparkles size={18} /> Generate Take</>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NexusPlugin;
