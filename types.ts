
export interface NodePos {
    x: number;
    y: number;
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
    nodes: any[]; // Placeholder for Genesis logic nodes
}
