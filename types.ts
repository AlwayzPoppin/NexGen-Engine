
export enum NavTab {
    PROJECTS = 'PROJECTS',
    NEXUS = 'NEXUS',
    SETTINGS = 'SETTINGS'
    // Future: DASHBOARD, STORE, AI
}

export interface Project {
    id: string;
    name: string;
    engine: 'Unreal' | 'Unity' | 'Godot' | 'NexGen-Native';
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

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    timestamp: number;
}

// Nexus Specific Types
export type NexusModule = 'ASSEMBLER' | 'GENESIS' | 'SYNAPSE' | 'ECHO' | 'NOVA' | 'ATLAS' | 'AIRLOCK';

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
    type: 'Player' | 'Sprite' | 'Camera' | 'Emitter' | 'Trigger';
    layer: 'UI' | 'Game' | 'Background';
    visible: boolean;
    x: number;
    y: number;
    scale: number;
    linkedLogicId?: string;
}

export interface GlobalGameState {
    entities: GameEntity2D[];
    nodes: GenesisNode[]; // Updated from NodePos
    wires: WireConnection[];
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
}

export interface NexusMetaVariable {
    key: string;
    value: string;
    type: 'Global' | 'Story' | 'System';
}
