export type Player = 'X' | 'O';
export type SquareValue = Player | null;
export type BoardState = SquareValue[];
export type GameMode = 'ai' | 'pvp';

export interface WinningInfo {
  winner: Player | 'draw' | null;
  line: number[] | null;
}
