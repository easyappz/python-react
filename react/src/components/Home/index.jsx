import React, { useState, useEffect } from 'react';
import './Home.css';

export const Home = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [winningLine, setWinningLine] = useState([]);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    return null;
  };

  useEffect(() => {
    const result = calculateWinner(board);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setScores(prev => ({ ...prev, [result.winner]: prev[result.winner] + 1 }));
    } else if (board.every(cell => cell !== null)) {
      setIsDraw(true);
    }
  }, [board]);

  const handleClick = (index) => {
    if (board[index] || winner || isDraw) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setIsDraw(false);
    setWinningLine([]);
  };

  const getGameStatus = () => {
    if (winner) {
      return `🎉 Победил игрок ${winner}! 🎉`;
    }
    if (isDraw) {
      return '🤝 Ничья! 🤝';
    }
    return `Ходит: ${isXNext ? 'X' : 'O'}`;
  };

  return (
    <div className="home-container" data-easytag="id1-src/components/Home/index.jsx">
      <div className="game-wrapper">
        <h1 className="game-title">Крестики vs Нолики</h1>
        
        <div className="scoreboard">
          <div className="score-item score-x">
            <div className="player-label">Игрок X</div>
            <div className="score-value" data-testid="score-x">{scores.X}</div>
          </div>
          <div className="score-item score-o">
            <div className="player-label">Игрок O</div>
            <div className="score-value" data-testid="score-o">{scores.O}</div>
          </div>
        </div>

        <div className={`game-status ${winner ? 'winner-status' : ''}`} data-testid="game-status">
          <span data-testid="current-player">{getGameStatus()}</span>
        </div>

        <div className="game-board" data-testid="game-board">
          {board.map((cell, index) => (
            <button
              key={index}
              className={`cell ${
                cell === 'X' ? 'cell-x' : cell === 'O' ? 'cell-o' : ''
              } ${winningLine.includes(index) ? 'winning-cell' : ''}`}
              onClick={() => handleClick(index)}
              data-testid={`cell-${index}`}
            >
              {cell && <span className="cell-content">{cell}</span>}
            </button>
          ))}
        </div>

        <button 
          className="reset-button" 
          onClick={resetGame}
          data-testid="reset-button"
        >
          🔄 Начать заново
        </button>
      </div>
    </div>
  );
};