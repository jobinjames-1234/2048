import { useState, useCallback, useEffect } from 'react';
import type { Grid, Direction, GameState } from '../types';

const GRID_SIZE = 4;

const createEmptyGrid = (): Grid => 
  Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

const getRandomPosition = (grid: Grid) => {
  const emptyCells = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) emptyCells.push({ r, c });
    }
  }
  if (emptyCells.length === 0) return null;
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

const spawnTile = (grid: Grid): Grid => {
  const newGrid = grid.map(row => [...row]);
  const pos = getRandomPosition(newGrid);
  if (pos) {
    newGrid[pos.r][pos.c] = Math.random() < 0.9 ? 2 : 4;
  }
  return newGrid;
};

const moveGrid = (grid: Grid, direction: Direction): { nextGrid: Grid; moveScore: number; moved: boolean } => {
  let nextGrid = grid.map(row => [...row]);
  let moveScore = 0;
  let moved = false;

  const rotateClockwise = (g: Grid) => {
    const rotated = createEmptyGrid();
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        rotated[c][GRID_SIZE - 1 - r] = g[r][c];
      }
    }
    return rotated;
  };

  const rotateCounterClockwise = (g: Grid) => {
    const rotated = createEmptyGrid();
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        rotated[GRID_SIZE - 1 - c][r] = g[r][c];
      }
    }
    return rotated;
  };

  // Standardize everything to "LEFT" movement for simplicity
  let rotationCount = 0;
  if (direction === 'UP') rotationCount = 3;
  else if (direction === 'RIGHT') rotationCount = 2;
  else if (direction === 'DOWN') rotationCount = 1;

  for (let i = 0; i < rotationCount; i++) nextGrid = rotateClockwise(nextGrid);

  for (let r = 0; r < GRID_SIZE; r++) {
    const row = nextGrid[r].filter(val => val !== null) as number[];
    const newRow: (number | null)[] = [];
    
    for (let i = 0; i < row.length; i++) {
      if (i < row.length - 1 && row[i] === row[i + 1]) {
        const combined = row[i] * 2;
        newRow.push(combined);
        moveScore += combined;
        i++;
      } else {
        newRow.push(row[i]);
      }
    }

    while (newRow.length < GRID_SIZE) newRow.push(null);
    if (JSON.stringify(nextGrid[r]) !== JSON.stringify(newRow)) moved = true;
    nextGrid[r] = newRow;
  }

  for (let i = 0; i < (4 - rotationCount) % 4; i++) nextGrid = rotateClockwise(nextGrid);

  return { nextGrid, moveScore, moved };
};

const checkGameOver = (grid: Grid): boolean => {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) return false;
      if (r < GRID_SIZE - 1 && grid[r][c] === grid[r + 1][c]) return false;
      if (c < GRID_SIZE - 1 && grid[r][c] === grid[r][c + 1]) return false;
    }
  }
  return true;
};

export const use2048 = (initialBestScore = 0) => {
  const [state, setState] = useState<GameState>(() => {
    const startGrid = spawnTile(spawnTile(createEmptyGrid()));
    return {
      grid: startGrid,
      score: 0,
      bestScore: initialBestScore,
      gameOver: false,
      won: false,
      history: []
    };
  });

  const move = useCallback((direction: Direction) => {
    setState(prev => {
      if (prev.gameOver) return prev;

      const { nextGrid, moveScore, moved } = moveGrid(prev.grid, direction);
      if (!moved) return prev;

      const gridWithNewTile = spawnTile(nextGrid);
      const newScore = prev.score + moveScore;
      const isWon = gridWithNewTile.some(row => row.includes(2048));
      const isGameOver = checkGameOver(gridWithNewTile);

      return {
        grid: gridWithNewTile,
        score: newScore,
        bestScore: Math.max(prev.bestScore, newScore),
        gameOver: isGameOver,
        won: prev.won || isWon,
        history: [...prev.history.slice(-19), { grid: prev.grid, score: prev.score }]
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.history.length === 0) return prev;
      const last = prev.history[prev.history.length - 1];
      return {
        ...prev,
        grid: last.grid,
        score: last.score,
        gameOver: false,
        history: prev.history.slice(0, -1)
      };
    });
  }, []);

  const reset = useCallback(() => {
    const startGrid = spawnTile(spawnTile(createEmptyGrid()));
    setState(prev => ({
      grid: startGrid,
      score: 0,
      bestScore: prev.bestScore,
      gameOver: false,
      won: false,
      history: []
    }));
  }, []);

  return { ...state, move, undo, reset };
};
