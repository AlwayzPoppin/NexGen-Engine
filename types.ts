
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
export type NexusModule = 'ASSEMBLER' | 'GENESIS' | 'SYNAPSE' | 'ECHO' | 'NOVA' | 'ATLAS' | 'AIRLOCK' | 'EXPLORER' | 'EDITOR';

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
  type: 'Event' | 'Action' | 'Branch' | 'Variable' | 'Quest' | 'Narrative' | 'Visual' | 'Atlas' | 'Echo' | 'Synapse';
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
