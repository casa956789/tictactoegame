
import React from 'react';
import type { SquareValue } from '../types';

interface SquareProps {
  value: SquareValue;
  onClick: () => void;
  isWinning: boolean;
  disabled: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isWinning, disabled }) => {
  const baseStyle = "flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-lg transition-all duration-200 ease-in-out text-5xl sm:text-7xl font-bold";
  const disabledStyle = "cursor-not-allowed";
  const enabledStyle = "cursor-pointer hover:bg-gray-700";
  
  const valueStyle = value === 'X' 
    ? "text-cyan-400" 
    : "text-amber-400";

  const winningStyle = isWinning 
    ? "bg-green-500/80 scale-105 shadow-2xl shadow-green-500/50" 
    : "bg-gray-800 shadow-lg";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${winningStyle} ${disabled ? disabledStyle : enabledStyle}`}
      aria-label={`Square with value ${value || 'empty'}`}
    >
      <span className={`${valueStyle} transform transition-transform duration-300 ${value ? 'scale-100' : 'scale-0'}`}>
        {value}
      </span>
    </button>
  );
};

export default Square;
