export type GameStatus = 'idle' | 'playing' | 'game-over';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Velocity {
  dx: number;
  dy: number;
}

export interface Plane extends Position, Size, Velocity {
  rotation: number;
  invincible?: boolean;
}

export type EntityType = 'cloud' | 'bird' | 'star' | 'candy';

export interface Entity extends Position, Size {
  id: string;
  type: EntityType;
  speed: number;
  scoreValue?: number;
}

export interface GameState {
  status: GameStatus;
  score: number;
  highScore: number;
  plane: Plane;
  entities: Entity[];
  lastScoreTime: number;
}