
export enum NavTab {
  PROJECTS = 'PROJECTS',
  NEXUS = 'NEXUS',
  SETTINGS = 'SETTINGS'
  // Future: DASHBOARD, STORE, AI
}

export interface Project {
  id: string;
  name: string;
  engine: 'Unreal' | 'Unity' | 'Godot' | 'NexGen-Native' | 'Bevy';
  path?: string;
  lastModified: string;
  status: 'Development' | 'Alpha' | 'Beta' | 'Production';
  thumbnail: string;
  progress: number;
}

export interface Asset {
  id: string;
  name: string;
  type: '3D Model' | 'Texture' | 'Audio' | 'Script';
  price: string;
  rating: number;
  image: string;
}

export interface TokenStats {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  cost?: number; // Estimated cost in USD
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  source?: 'local' | 'cloud';
  usage?: TokenStats;
}

// Nexus Specific Types
export type NexusModule = 'ASSEMBLER' | 'GENESIS' | 'SYNAPSE' | 'CONDUCTOR' | 'NOVA' | 'ATLAS' | 'AIRLOCK' | 'EXPLORER' | 'EDITOR';

export interface FileNode {
  id: string;
  name: string;
  kind: 'file' | 'directory';
  handle: any; // FileSystemFileHandle or FileSystemDirectoryHandle
  path: string;
  children?: FileNode[];
  isOpen?: boolean;
}

// Genesis Graph Types
export interface NodePin {
  id: string;
  name: string;
  type: 'Exec' | 'Boolean' | 'Int' | 'Float' | 'String' | 'Vec2' | 'Entity';
  direction: 'Input' | 'Output';
}

export interface GenesisNode {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'Event' | 'Action' | 'Branch' | 'Variable' | 'Quest' | 'Narrative' | 'Visual' | 'Atlas' | 'Conductor' | 'Synapse';
  inputs: NodePin[];
  outputs: NodePin[];
  data?: any; // For literal values (e.g. "jump.wav")
}

export interface WireConnection {
  id: string;
  fromNode: string;
  fromPin: string;
  toNode: string;
  toPin: string;
}

export interface GameEntity2D {
  id: string;
  name: string;
  type: 'Player' | 'Sprite' | 'Camera' | 'Emitter' | 'Trigger' | 'Enemy';
  layer: 'UI' | 'Game' | 'Background';
  visible: boolean;
  x: number;
  y: number;
  scale: number;
  linkedLogicId?: string;
}

export interface QuestObjective {
  id: string;
  text: string;
  description?: string;
  status: 'Pending' | 'Active' | 'Completed' | 'Failed';
  isOptional?: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'Available' | 'Active' | 'Completed' | 'Failed';
  type: 'Main' | 'Side' | 'World' | 'Hidden';
  theme?: string;
  mood?: string;
  objectives: QuestObjective[];
  rewards?: { type: string; amount: number; label: string }[];
  linkedAssetId?: string;
}

export interface NarrativeSegment {
  id: string;
  speaker: string;
  content: string;
  mood?: string;
  choices?: { text: string; nextSegmentId: string }[];
  linkedAssetId?: string;
}

export interface GlobalGameState {
  entities: GameEntity2D[];
  nodes: GenesisNode[];
  wires: WireConnection[];
  quests: Quest[];
  narrativeSegments: NarrativeSegment[];
}

export interface NexusAsset {
  id: string;
  name: string;
  type: 'Sprite' | 'Audio' | 'Logic' | 'Data';
  status: 'Linked' | 'Unlinked' | 'Warning';
  path: string;
  statusReason?: string;
  handle?: any; // FileSystemFileHandle
  previewUrl?: string; // Blob URL or Data URI
  imageUrl?: string; // For sprite/image based assets
  linkedTo?: {
    type: 'entity' | 'event' | 'quest' | 'scene';
    id: string;
    name: string;
  };
}

export interface NexusMetaVariable {
  key: string;
  value: string;
  type: 'Global' | 'Story' | 'System';
}

export interface NodePos {
  id: string;
  x: number;
  y: number;
  label: string;
  type: string;
  subType?: string;
  colorClass?: string;
}

export type ModelType =
  | 'gemini-2.5-flash-image'
  | 'gemini-3-pro-image-preview'
  | 'gemini-3-flash-preview'
  | 'veo-3.1-fast-generate-preview'
  | 'gemini-2.0-flash-exp';

export interface GridConfig {
  rows: number;
  cols: number;
}

export type SpriteStyle = 'Pixel Art' | 'HD Pixel' | 'Gritty HD Pixel' | 'Vector' | 'Vector Flat' | 'Hand Drawn' | 'Flat Design' | 'Cel-shaded' | 'Retro 8-bit' | 'Anime/Manga' | 'Low Poly 3D' | 'Cyberpunk/Neon' | 'Isometric' | 'Watercolor' | 'Oil Painting' | 'Retro 16-bit' | 'Blueprint/Schematic' | 'Claymation' | 'Voxel' | 'Noir/Black & White';

export interface AnimationSet {
  id: string;
  name: string;
  startFrame: number;
  endFrame: number;
}

export interface SpriteSheet {
  id: string;
  url: string;
  prompt: string;
  style: SpriteStyle;
  grid: GridConfig;
  timestamp: number;
  animationSets?: AnimationSet[];
}

export interface NeuralAction {
  id: string;
  type: 'CREATE_FILE' | 'GENERATE_SPRITE' | 'GENERATE_AUDIO' | 'NAVIGATE' | 'SCAFFOLD' | 'OLLAMA_TASK' | 'GENERATE_POSE' | 'INTERPOLATE_FRAMES' | 'NORMALIZE_SHEET' | 'DETECT_SPRITES';
  status: 'QUEUED' | 'APPROVED' | 'REJECTED' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  data: any;
  description: string;
  timestamp: number;
}

// --- CONDUCTOR Cinematic Suite Types ---
export type VoiceName = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' | 'Aoide' | 'Eos' | 'Orpheus';

export type VisemeCode = 'neutral' | 'A' | 'E' | 'I' | 'O' | 'U' | 'M' | 'L' | 'F' | 'S';

export interface Viseme {
  time: number;
  code: VisemeCode;
}

export interface TakeCritique {
  score: number; // 1-100
  feedback: string;
  suggestion: string;
}

export interface AudioTake {
  id: string;
  audioUrl: string;
  pcmData: Uint8Array;
  visemes: Viseme[];
  timestamp: number;
  pitch: number;
  critique?: TakeCritique;
}

export interface ConductorScene {
  id: string;
  name: string;
  reverbSize: number; // 0 to 1
  reverbDecay: number; // seconds
  wetMix: number; // 0 to 1
  lowPassFreq: number; // 200 to 20000
  description: string;
}

export interface ConductorCharacter {
  id: string;
  name: string;
  voice: VoiceName;
  description: string;
  avatarUrl: string;
  emotion: string;
  style: string;
  timbre: number;
  pitch: number;
  sampleUrl?: string;
  isSampling?: boolean;
}

export interface DialogueLine {
  id: string;
  characterId: string;
  text: string;
  emotion?: string;
  directorNotes?: string;
  pitch?: number;
  takes: AudioTake[];
  activeTakeIndex: number;
  isGenerating?: boolean;
}

export interface ConductorScript {
  id: string;
  title: string;
  lines: DialogueLine[];
  activeSceneId?: string;
}

export interface AudioAssetForge {
  id: string;
  name: string;
  subType: 'Foley' | 'Music' | 'SFX';
  url: string;
  pcmData: Uint8Array;
  timestamp: number;
  recipe?: any[];
  variations?: { id: string, url: string, pcmData: Uint8Array }[];
}

export interface AudioClip {
  id: string;
  assetId: string;
  startTime: number; // seconds
  duration: number;
  type: 'Dialogue' | 'SFX';
  name: string;
}

export interface MasterTrack {
  id: string;
  name: string;
  clips: AudioClip[];
  volume: number;
  pan: number; // -1 to 1
  isMuted: boolean;
}

export interface CinematicSequence {
  id: string;
  name: string;
  tracks: MasterTrack[];
  activeSceneId?: string;
}
