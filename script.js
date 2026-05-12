const boardEl=document.getElementById('board');
const turnText=document.getElementById('turnText');
const statusText=document.getElementById('statusText');
const capturedByWhiteEl=document.getElementById('capturedByWhite');
const capturedByBlackEl=document.getElementById('capturedByBlack');
const resetBtn=document.getElementById('resetBtn');
const symbols={w:{k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'},b:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'}};
let board,turn,selected,legalMoves,capturedByWhite,capturedByBlack,gameOver,lastMove,castlingRights;

function newGame(){
  board=[['br','bn','bb','bq','bk','bb','bn','br'],['bp','bp','bp','bp','bp','bp','bp','bp'],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],['wp','wp','wp','wp','wp','wp','wp','wp'],['wr','wn','wb','wq','wk','wb','wn','wr']];
  turn='w'; selected=null; legalMoves=[]; capturedByWhite=[]; capturedByBlack=[]; gameOver=false; lastMove=null;
  castlingRights={wKing:true,wQueen:true,bKing:true,bQueen:true};
  render(); updateStatus();
}

function render(){
  boardEl.innerHTML='';
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const sq=document.createElement('button');
    sq.type='button'; sq.className=`square ${(r+c)%2===0?'light':'dark'}`;
    if(selected&&selected.r===r&&selected.c===c) sq.classList.add('selected');
    if(lastMove&&((lastMove.from.r===r&&lastMove.from.c===c)||(lastMove.to.r===r&&lastMove.to.c===c))) sq.classList.add('last');
    const m=legalMoves.find(x=>x.r===r&&x.c===c); if(m) sq.classList.add(m.capture?'capture':'legal');
    const piece=board[r][c];
    if(piece){const sp=document.createElement('span');sp.className=`piece ${piece[0]==='w'?'white':'black'}`;sp.textContent=symbols[piece[0]][piece[1]];sq.appendChild(sp)}
    if(r===7){const co=document.createElement('span');co.className='coord';co.textContent=String.fromCharCode(97+c);sq.appendChild(co)}
    sq.addEventListener('click',()=>handleSquareClick(r,c));
    boardEl.appendChild(sq);
  }
  capturedByWhiteEl.textContent=capturedByWhite.map(p=>symbols[p[0]][p[1]]).join(' ')||'無';
  capturedByBlackEl.textContent=capturedByBlack.map(p=>symbols[p[0]][p[1]]).join(' ')||'無';
}

function handleSquareClick(r,c){
  if(gameOver) return;
  const piece=board[r][c];
  if(selected){
    const move=legalMoves.find(m=>m.r===r&&m.c===c);
    if(move){makeMove(selected.r,selected.c,move);selected=null;legalMoves=[];render();updateStatus();return}
  }
  if(piece&&piece[0]===turn){selected={r,c};legalMoves=getLegalMoves(r,c)}
  else{selected=null;legalMoves=[]}
  render();
}

function makeMove(fr,fc,move){
  const piece=board[fr][fc]; const captured=board[move.r][move.c];
  if(captured){ if(turn==='w') capturedByWhite.push(captured); else capturedByBlack.push(captured); updateRookCaptureRights(captured,move.r,move.c)}
  board[move.r][move.c]=piece; board[fr][fc]=null;
  if(piece[1]==='p'&&(move.r===0||move.r===7)) board[move.r][move.c]=`${turn}q`;
  if(piece[1]==='k'&&Math.abs(move.c-fc)===2){
    if(move.c===6){board[fr][5]=board[fr][7];board[fr][7]=null}
    if(move.c===2){board[fr][3]=board[fr][0];board[fr][0]=null}
  }
  updateCastlingRights(piece,fr,fc);
  lastMove={from:{r:fr,c:fc},to:{r:move.r,c:move.c}};
  turn=opposite(turn);
}

function updateCastlingRights(piece,r,c){
  if(piece==='wk'){castlingRights.wKing=false;castlingRights.wQueen=false}
  if(piece==='bk'){castlingRights.bKing=false;castlingRights.bQueen=false}
  if(piece==='wr'&&r===7&&c===0) castlingRights.wQueen=false;
  if(piece==='wr'&&r===7&&c===7) castlingRights.wKing=false;
  if(piece==='br'&&r===0&&c===0) castlingRights.bQueen=false;
  if(piece==='br'&&r===0&&c===7) castlingRights.bKing=false;
}
function updateRookCaptureRights(piece,r,c){
  if(piece==='wr'&&r===7&&c===0) castlingRights.wQueen=false;
  if(piece==='wr'&&r===7&&c===7) castlingRights.wKing=false;
  if(piece==='br'&&r===0&&c===0) castlingRights.bQueen=false;
  if(piece==='br'&&r===0&&c===7) castlingRights.bKing=false;
}

function getLegalMoves(r,c){
  const piece=board[r][c]; if(!piece) return [];
  const color=piece[0]; const moves=getPseudoMoves(r,c);
  return moves.filter(move=>{
    const snap=cloneBoard(board); const p=snap[r][c];
    snap[move.r][move.c]=p; snap[r][c]=null;
    if(p[1]==='k'&&Math.abs(move.c-c)===2){
      if(move.c===6){snap[r][5]=snap[r][7];snap[r][7]=null}
      if(move.c===2){snap[r][3]=snap[r][0];snap[r][0]=null}
    }
    return !isKingInCheck(color,snap);
  });
}

function getPseudoMoves(r,c){
  const piece=board[r][c]; if(!piece) return [];
  const color=piece[0], type=piece[1], moves=[];
  if(type==='p') addPawnMoves(r,c,color,moves);
  if(type==='n') addKnightMoves(r,c,color,moves);
  if(type==='b') addSlidingMoves(r,c,color,moves,[[1,1],[1,-1],[-1,1],[-1,-1]]);
  if(type==='r') addSlidingMoves(r,c,color,moves,[[1,0],[-1,0],[0,1],[0,-1]]);
  if(type==='q') addSlidingMoves(r,c,color,moves,[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]);
  if(type==='k') addKingMoves(r,c,color,moves);
  return moves;
}

function addPawnMoves(r,c,color,moves){
  const dir=color==='w'?-1:1,start=color==='w'?6:1;
  if(inside(r+dir,c)&&!board[r+dir][c]){moves.push({r:r+dir,c,capture:false}); if(r===start&&!board[r+dir*2][c]) moves.push({r:r+dir*2,c,capture:false})}
  for(const dc of[-1,1]){const nr=r+dir,nc=c+dc;if(inside(nr,nc)&&board[nr][nc]&&board[nr][nc][0]!==color)moves.push({r:nr,c:nc,capture:true})}
}
function addKnightMoves(r,c,color,moves){for(const [dr,dc] of [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]]) addMoveIfValid(r+dr,c+dc,color,moves)}
function addSlidingMoves(r,c,color,moves,dirs){for(const [dr,dc] of dirs){let nr=r+dr,nc=c+dc;while(inside(nr,nc)){if(!board[nr][nc]) moves.push({r:nr,c:nc,capture:false}); else{if(board[nr][nc][0]!==color)moves.push({r:nr,c:nc,capture:true});break}nr+=dr;nc+=dc}}}
function addKingMoves(r,c,color,moves){for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc)addMoveIfValid(r+dr,c+dc,color,moves);addCastlingMoves(r,c,color,moves)}
function addMoveIfValid(r,c,color,moves){if(!inside(r,c))return;if(!board[r][c]){moves.push({r,c,capture:false});return}if(board[r][c][0]!==color)moves.push({r,c,capture:true})}
function addCastlingMoves(r,c,color,moves){
  if(isKingInCheck(color,board)) return;
  if(color==='w'&&r===7&&c===4){
    if(castlingRights.wKing&&board[7][7]==='wr'&&!board[7][5]&&!board[7][6]&&!isSquareAttacked(7,5,'b',board)&&!isSquareAttacked(7,6,'b',board))moves.push({r:7,c:6,capture:false,castle:true});
    if(castlingRights.wQueen&&board[7][0]==='wr'&&!board[7][1]&&!board[7][2]&&!board[7][3]&&!isSquareAttacked(7,3,'b',board)&&!isSquareAttacked(7,2,'b',board))moves.push({r:7,c:2,capture:false,castle:true});
  }
  if(color==='b'&&r===0&&c===4){
    if(castlingRights.bKing&&board[0][7]==='br'&&!board[0][5]&&!board[0][6]&&!isSquareAttacked(0,5,'w',board)&&!isSquareAttacked(0,6,'w',board))moves.push({r:0,c:6,capture:false,castle:true});
    if(castlingRights.bQueen&&board[0][0]==='br'&&!board[0][1]&&!board[0][2]&&!board[0][3]&&!isSquareAttacked(0,3,'w',board)&&!isSquareAttacked(0,2,'w',board))moves.push({r:0,c:2,capture:false,castle:true});
  }
}

function isKingInCheck(color,testBoard){
  let k=null; for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(testBoard[r][c]===`${color}k`)k={r,c};
  if(!k) return true; return isSquareAttacked(k.r,k.c,opposite(color),testBoard);
}
function isSquareAttacked(r,c,byColor,testBoard){
  const pawnDir=byColor==='w'?-1:1;
  for(const dc of[-1,1]){const pr=r-pawnDir,pc=c+dc;if(inside(pr,pc)&&testBoard[pr][pc]===`${byColor}p`)return true}
  for(const [dr,dc] of [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]]){const nr=r+dr,nc=c+dc;if(inside(nr,nc)&&testBoard[nr][nc]===`${byColor}n`)return true}
  if(attackedBySlider(r,c,byColor,testBoard,[[1,0],[-1,0],[0,1],[0,-1]],['r','q']))return true;
  if(attackedBySlider(r,c,byColor,testBoard,[[1,1],[1,-1],[-1,1],[-1,-1]],['b','q']))return true;
  for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const kr=r+dr,kc=c+dc;if(inside(kr,kc)&&testBoard[kr][kc]===`${byColor}k`)return true}
  return false;
}
function attackedBySlider(r,c,byColor,testBoard,dirs,attackers){for(const [dr,dc] of dirs){let nr=r+dr,nc=c+dc;while(inside(nr,nc)){const p=testBoard[nr][nc];if(p){if(p[0]===byColor&&attackers.includes(p[1]))return true;break}nr+=dr;nc+=dc}}return false}
function updateStatus(){
  const inCheck=isKingInCheck(turn,board), has=playerHasLegalMoves(turn);
  turnText.textContent=turn==='w'?'白方':'黑方';
  if(!has&&inCheck){gameOver=true;statusText.textContent=`${turn==='w'?'白方':'黑方'}被將死，${turn==='w'?'黑方':'白方'}獲勝`;return}
  if(!has&&!inCheck){gameOver=true;statusText.textContent='和棋，無合法步';return}
  statusText.textContent=inCheck?'將軍！':'對局進行中';
}
function playerHasLegalMoves(color){for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(board[r][c]&&board[r][c][0]===color&&getLegalMoves(r,c).length>0)return true;return false}
function cloneBoard(b){return b.map(row=>[...row])}
function inside(r,c){return r>=0&&r<8&&c>=0&&c<8}
function opposite(color){return color==='w'?'b':'w'}
resetBtn.addEventListener('click',newGame);
newGame();
