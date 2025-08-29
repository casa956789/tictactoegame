
import React from 'react';
import Square from './Square';
import type { BoardState } from '../types';

interface BoardProps {
  board: BoardState;
  onSquareClick: (index: number) => void;
  winningLine: number[] | null;
  disabled: boolean;
}

const Board: React.FC<BoardProps> = ({ board, onSquareClick, winningLine, disabled }) => {
  return (
    <div className="grid grid-cols-3 gap-3 p-3 bg-gray-900/50 rounded-xl shadow-inner">
      {board.map((value, index) => {
        const isWinning = winningLine?.includes(index) ?? false;
        return (
          <Square
            key={index}
            value={value}
            onClick={() => onSquareClick(index)}
            isWinning={isWinning}
            disabled={disabled || value !== null}
          />
        );
      })}
    </div>
  );
};

export default Board;
