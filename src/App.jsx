import React, { useState } from 'react';
import './styles.css';

function Square({ value, onSquareClick, highlight }) {
  return (
    <button className={`square ${highlight ? 'highlight' : ''}`} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares, i);
  }

  const winnerInfo = calculateWinner(squares);
  const winner = winnerInfo ? winnerInfo.winner : null;
  const winningLine = winnerInfo ? winnerInfo.line : null;

  let status;
  if (winner) {
    status = 'Ganador: ' + winner;
  } else if (squares.every(square => square !== null)) {
    status = 'El resultado fue un empate';
  } else {
    status = 'Siguiente Jugador: ' + (xIsNext ? 'X' : 'O');
  }

  function renderSquare(i) {
    const highlight = winningLine && winningLine.includes(i);
    return <Square key={i} value={squares[i]} onSquareClick={() => handleClick(i)} highlight={highlight} />;
  }

  const boardRows = [];
  for (let row = 0; row < 3; row++) {
    const squares = [];
    for (let col = 0; col < 3; col++) {
      squares.push(renderSquare(row * 3 + col));
    }
    boardRows.push(
      <div key={row} className="board-row">
        {squares}
      </div>
    );
  }

  return (
    <>
      <div className="status">{status}</div>
      {boardRows}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([{ squares: Array(9).fill(null), location: null }]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares, location) {
    const nextHistory = [...history.slice(0, currentMove + 1), { squares: nextSquares, location }];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function toggleSortOrder() {
    setIsAscending(!isAscending);
  }

  const moves = history.map((step, move) => {
    const { location } = step;
    const col = location !== null ? location % 3 + 1 : null;
    const row = location !== null ? Math.floor(location / 3) + 1 : null;
    const description = move === currentMove 
      ? `Estás en el movimiento #${move} (${col}, ${row})` 
      : move > 0 
      ? `Ir hacia la jugada #${move} (${col}, ${row})` 
      : 'Ir al inicio del juego';
    return (
      <li key={move}>
        {move === currentMove ? (
          <span>{description}</span>
        ) : (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
      </li>
    );
  });

  const sortedMoves = isAscending ? moves : moves.reverse();

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <button onClick={toggleSortOrder}>
          Ordenar {isAscending ? 'Descendente' : 'Ascendente'}
        </button>
        <ol>{sortedMoves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
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
}