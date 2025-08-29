import React, { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import { getAIMove } from './services/geminiService';
import type { BoardState, Player, WinningInfo, GameMode } from './types';

const INITIAL_BOARD: BoardState = Array(9).fill(null);

const calculateWinner = (squares: BoardState): WinningInfo => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a] as Player, line: lines[i] };
    }
  }
  if (squares.every(square => square !== null)) {
    return { winner: 'draw', line: null };
  }
  return { winner: null, line: null };
};

const App: React.FC = () => {
  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winningInfo, setWinningInfo] = useState<WinningInfo>({ winner: null, line: null });
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });

  const handleAIMove = useCallback(async (currentBoard: BoardState) => {
    setIsThinking(true);
    await new Promise(resolve => setTimeout(resolve, 750));
    
    const aiMoveIndex = await getAIMove(currentBoard, 'O');

    if (currentBoard[aiMoveIndex] === null) {
        const newBoard = [...currentBoard];
        newBoard[aiMoveIndex] = 'O';
        setBoard(newBoard);
        setCurrentPlayer('X');
    } else {
        console.error("AI tried to play on a filled square.");
        setCurrentPlayer('X');
    }
    setIsThinking(false);
  }, []);

  useEffect(() => {
    const gameResult = calculateWinner(board);
    if (gameResult.winner && !winningInfo.winner) {
      setWinningInfo(gameResult);
      if (gameResult.winner === 'draw') {
        setScores(s => ({ ...s, draw: s.draw + 1 }));
      } else {
        setScores(s => ({ ...s, [gameResult.winner]: s[gameResult.winner] + 1 }));
      }
    } else if (!gameResult.winner && gameMode === 'ai' && currentPlayer === 'O') {
      handleAIMove(board);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, currentPlayer, gameMode, winningInfo.winner]);

  const handlePlayerMove = (index: number) => {
    if (board[index] || winningInfo.winner || (gameMode === 'ai' && currentPlayer === 'O')) {
      return;
    }
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };
  
  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setCurrentPlayer('X');
    setWinningInfo({ winner: null, line: null });
    setIsThinking(false);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, draw: 0 });
  };
  
  const changeGameMode = (mode: GameMode) => {
    setGameMode(mode);
    resetGame();
    resetScores();
  };

  const getStatusMessage = () => {
    if (winningInfo.winner) {
      if (winningInfo.winner === 'draw') return "It's a Draw!";
      if (gameMode === 'ai') {
        return winningInfo.winner === 'X' ? "Congratulations, You Won!" : "Gemini Wins!";
      }
      return `Player ${winningInfo.winner} Won!`;
    }
    if (isThinking) return "Gemini is thinking...";
    if (gameMode === 'ai') return `Your Turn (X)`;
    return `Player ${currentPlayer}'s Turn`;
  };
  
  const gameInProgress = !winningInfo.winner && board.some(square => square !== null);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="text-center mb-6">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-400">
            Gemini Tic Tac Toe
          </span>
        </h1>
        <p className="text-gray-400 text-lg">Can you beat the AI or your friend?</p>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <button 
          onClick={() => changeGameMode('ai')}
          disabled={gameInProgress}
          className={`px-6 py-2 font-semibold rounded-md transition-all duration-200 ${gameMode === 'ai' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          vs. Gemini
        </button>
        <button 
          onClick={() => changeGameMode('pvp')}
          disabled={gameInProgress}
          className={`px-6 py-2 font-semibold rounded-md transition-all duration-200 ${gameMode === 'pvp' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          vs. Player
        </button>
      </div>

      <div className="flex justify-center items-center gap-4 md:gap-8 text-center mb-6 w-full max-w-md">
          <div className="p-4 rounded-lg bg-gray-800/80 flex-1">
              <p className="text-lg font-bold text-cyan-400">Player (X)</p>
              <p className="text-3xl font-extrabold">{scores.X}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/80 flex-1">
              <p className="text-lg font-bold text-gray-400">Draws</p>
              <p className="text-3xl font-extrabold">{scores.draw}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/80 flex-1">
              <p className="text-lg font-bold text-amber-400">{gameMode === 'ai' ? 'Gemini (O)' : 'Player (O)'}</p>
              <p className="text-3xl font-extrabold">{scores.O}</p>
          </div>
      </div>

      <div className="relative mb-6">
        <Board 
          board={board} 
          onSquareClick={handlePlayerMove}
          winningLine={winningInfo.line}
          disabled={isThinking || !!winningInfo.winner}
        />
      </div>

      <div className="text-center h-24 flex flex-col justify-start items-center">
        <p className="text-2xl font-semibold text-gray-300 mb-4 h-8 transition-opacity duration-300">
          {getStatusMessage()}
        </p>
        
        {winningInfo.winner && (
          <button 
            onClick={resetGame}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-300"
          >
            Play Again
          </button>
        )}
      </div>
      <div className="absolute bottom-4">
        <button onClick={resetScores} className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
          Reset Scores
        </button>
      </div>
    </div>
  );
};

export default App;
