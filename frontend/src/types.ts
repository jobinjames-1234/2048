export type Role = 'super_admin' | 'admin' | 'moderator' | 'player';

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  role: Role;
  bestScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScoreEntry {
  id?: string;
  uid: string;
  username: string;
  score: number;
  timestamp: string;
}

export type Grid = (number | null)[][];

export interface GameState {
  grid: Grid;
  score: number;
  bestScore: number;
  gameOver: boolean;
  won: boolean;
  history: { grid: Grid; score: number }[];
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
