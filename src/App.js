// App.js
import { useState, useEffect } from 'react';
import './App.css';

const difficulties = {
  easy: { rows: 8, cols: 8, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 }
};

const Cell = ({ cell, onClick, onContextMenu }) => {
  const getDisplayContent = () => {
    if (cell.isRevealed) {
      if (cell.isMine) return '💣';
      return cell.neighborMines || '';
    }
    if (cell.isFlagged) return '🚩';
    return '';
  };

  return (
    <div 
      className={`cell ${cell.isRevealed ? 'revealed' : ''}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      style={{
        color: cell.neighborMines && ['blue', 'green', 'red', 'darkblue', 'brown', 'cyan', 'black', 'gray'][cell.neighborMines - 1],
        width: difficulties[cell.difficulty]?.cols === 30 ? '20px' : '30px'
      }}
    >
      {getDisplayContent()}
    </div>
  );
};

const createBoard = (rows, cols, mines, difficulty) => {
  const board = Array(rows).fill().map((_, x) => 
    Array(cols).fill().map((_, y) => ({
      x,
      y,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0,
      difficulty
    }))
  );

  // Place mines
  let minesPlaced = 0;
  while (minesPlaced < mines) {
    const x = Math.floor(Math.random() * rows);
    const y = Math.floor(Math.random() * cols);
    if (!board[x][y].isMine) {
      board[x][y].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate neighbors
  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < cols; y++) {
      if (!board[x][y].isMine) {
        let count = 0;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && board[nx][ny].isMine) {
              count++;
            }
          }
        }
        board[x][y].neighborMines = count;
      }
    }
  }
  return board;
};

function App() {
  const [difficulty, setDifficulty] = useState('easy');
  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(false);

  useEffect(() => {
    startNewGame();
  }, [difficulty]);

  const startNewGame = () => {
    const config = difficulties[difficulty];
    const newBoard = createBoard(config.rows, config.cols, config.mines, difficulty);
    setBoard(newBoard);
    setGameOver(false);
    setWinner(false);
  };

  const handleCellClick = (x, y) => {
    if (gameOver || winner) return;
    
    const newBoard = [...board];
    if (newBoard[x][y].isFlagged) return;
    
    if (newBoard[x][y].isMine) {
      setGameOver(true);
      return;
    }
    
    revealCells(newBoard, x, y);
    
    const hasWon = checkWin(newBoard);
    if (hasWon) setWinner(true);
    setBoard(newBoard);
  };

  const handleRightClick = (e, x, y) => {
    e.preventDefault();
    if (gameOver || winner) return;
    
    const newBoard = [...board];
    newBoard[x][y].isFlagged = !newBoard[x][y].isFlagged;
    setBoard(newBoard);
  };

  const revealCells = (board, x, y) => {
    if (x < 0 || x >= board.length || y < 0 || y >= board[0].length || board[x][y].isRevealed) return;
    
    board[x][y].isRevealed = true;
    
    if (board[x][y].neighborMines === 0) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          revealCells(board, x + dx, y + dy);
        }
      }
    }
  };

  const checkWin = (board) => {
    return board.every(row => 
      row.every(cell => 
        (cell.isMine && !cell.isRevealed) || (!cell.isMine && cell.isRevealed)
      )
    );
  };

  return (
    <div className="App">
      <div className="controls">
        <select 
          value={difficulty} 
          onChange={(e) => setDifficulty(e.target.value)}
          style={{ margin: '10px', padding: '5px' }}
        >
          {Object.keys(difficulties).map(level => (
            <option key={level} value={level}>{level.toUpperCase()}</option>
          ))}
        </select>
        <button 
          onClick={startNewGame}
          style={{ 
            margin: '10px', 
            padding: '5px 15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          New Game
        </button>
      </div>
      
      <div className="status" style={{ fontSize: '24px', margin: '10px' }}>
        {gameOver ? '💀 Game Over!' : winner ? '🎉 You Win!' : '😊'}
      </div>

      <div className="board" style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${board[0]?.length || 8}, 1fr)`,
        gap: '2px',
        backgroundColor: '#bdbdbd',
        padding: '10px',
        borderRadius: '5px'
      }}>
        {board.map((row, x) => 
          row.map((cell, y) => (
            <Cell
              key={`${x}-${y}`}
              cell={cell}
              onClick={() => handleCellClick(x, y)}
              onContextMenu={(e) => handleRightClick(e, x, y)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default App;