const boardElement = document.getElementById("game");
const statusElement = document.getElementById("status");

const pieces = {
  r: "♜",
  n: "♞",
  b: "♝",
  q: "♛",
  k: "♚",
  p: "♟",
  R: "♖",
  N: "♘",
  B: "♗",
  Q: "♕",
  K: "♔",
  P: "♙"
};

let board = [];
let selected = null;
let currentPlayer = "white";

function initialBoard() {
  return [
    ["r","n","b","q","k","b","n","r"],
    ["p","p","p","p","p","p","p","p"],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["P","P","P","P","P","P","P","P"],
    ["R","N","B","Q","K","B","N","R"]
  ];
}

function resetGame() {
  board = initialBoard();
  currentPlayer = "white";
  selected = null;
  renderBoard();
  updateStatus();
}

function renderBoard() {
  boardElement.innerHTML = "";

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement("div");
      const isWhite = (row + col) % 2 === 0;

      cell.classList.add("cell");
      cell.classList.add(isWhite ? "white" : "black");

      const piece = board[row][col];
      cell.textContent = pieces[piece] || "";

      if (selected && selected.row === row && selected.col === col) {
        cell.classList.add("selected");
      }

      cell.addEventListener("click", () => handleClick(row, col));
      boardElement.appendChild(cell);
    }
  }
}

function handleClick(row, col) {
  const piece = board[row][col];

  if (selected) {
    movePiece(selected.row, selected.col, row, col);
    selected = null;
    switchTurn();
    renderBoard();
    return;
  }

  if (piece) {
    selected = { row, col };
  }

  renderBoard();
}

function movePiece(fromRow, fromCol, toRow, toCol) {
  board[toRow][toCol] = board[fromRow][fromCol];
  board[fromRow][fromCol] = "";
}

function switchTurn() {
  currentPlayer = currentPlayer === "white" ? "black" : "white";
  updateStatus();
}

function updateStatus() {
  statusElement.textContent =
    currentPlayer === "white" ? "白方回合" : "黑方回合";
}

resetGame();
