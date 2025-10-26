// Valors constants de configuracio del joc
const boardWidth: number = 800;     // ample area de joc (px)
const boardHeight: number = 600;    // alt area de joc (px)
const lineSize: number = 20;        // mida de dibuix (pales, bola, linees laterals...) (px)
const paddleHeight: number = 80;    // mida de les pales (px)
const speedMap = { slow: 8, medium: 16, fast: 32 } as const; // opcions de velocitat

export type WinScore = 5 | 11 | 15 | 21;
export type SpeedSetting = "slow" | "medium" | "fast";

class Paddle {
  width: number = lineSize;
  height: number = paddleHeight;
  yVel: number = 0;

  constructor(public xPos: number, public yPos: number) {}
}

class Ball extends Paddle {
  height = lineSize;
  xVel: number = 0;
}

export default function pong(scoreToWin: WinScore, gameSpeed: SpeedSetting) {
  const app: HTMLElement = document.getElementById("app")!;
  const canvas = document.getElementById("board") as HTMLCanvasElement;

  // nos aseguramos de que el canvas esté visible al empezar
  canvas.style.display = "block";

  // --- UI superpuesta: botón Exit (sin depender del panel) ---
  const uiId = "game-ui-exit";
  // por si acaso viene de una partida anterior
  document.getElementById(uiId)?.remove();

  const exitBtn = document.createElement("button");
  exitBtn.id = uiId;
  exitBtn.className = "btn game-exit";  
  exitBtn.textContent = "Exit";
  document.getElementById("app")!.appendChild(exitBtn);

  const paddleYVel = speedMap[gameSpeed]; // velocitat de les pales (px/frame)
  const ballVel = paddleYVel / 2;         // velocutat de la bola (px/frame)

  const player1 = new Paddle(lineSize, boardHeight / 2 - paddleHeight / 2);
  const player2 = new Paddle(boardWidth - 2 * lineSize, boardHeight / 2 - paddleHeight / 2);
  const ball = new Ball(boardWidth / 2 - lineSize / 2, boardHeight / 2 - lineSize / 2);

  const pressedKeys: Record<string, number> = {};
  const scores: number[] = [0, 0];

  let gameOver: boolean = false;
  let winner: number = 0;
  let intervalId: number | undefined;

  function resetBall(xDir: number) {
    ball.xPos = boardWidth / 2 - lineSize / 2;
    ball.yPos = boardHeight / 2 - lineSize / 2;
    ball.xVel = ballVel * xDir;
    ball.yVel = ballVel / 2;
  }

  function draw() {
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.font = "48px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // clear previous frame
    ctx.clearRect(0, 0, boardWidth, boardHeight);
    // draw side walls at top & bottom
    ctx.fillRect(0, 0, boardWidth, lineSize);
    ctx.fillRect(0, boardHeight - lineSize, boardWidth, lineSize);
    // draw middle line
    for (let yPos = lineSize * 2; yPos < boardHeight; yPos += lineSize * 3) {
      ctx.fillRect(boardWidth / 2 - lineSize / 2, yPos, lineSize, lineSize * 2);
    }
    // draw paddles
    ctx.fillRect(player1.xPos, player1.yPos, player1.width, player1.height);
    ctx.fillRect(player2.xPos, player2.yPos, player2.width, player2.height);
    // draw ball
    ctx.fillRect(ball.xPos, ball.yPos, ball.width, ball.height);
    // draw scores
    ctx.fillText(scores[0]!.toString(), boardWidth / 4, lineSize * 2);
    ctx.fillText(scores[1]!.toString(), (boardWidth * 3) / 4, lineSize * 2);

    // draw winner message
    if (gameOver) {
      ctx.clearRect(lineSize * 2, lineSize * 10, boardWidth - lineSize * 4, lineSize * 10);
      ctx.textAlign = "center";
      ctx.font = "72px 'Press Start 2P', monospace";
      ctx.textBaseline = "bottom";
      ctx.fillText("GAME OVER", boardWidth / 2, boardHeight / 2);
      ctx.font = "48px 'Press Start 2P', monospace";
      ctx.textBaseline = "top";
      ctx.fillText(`PLAYER ${winner} WINS`, boardWidth / 2, boardHeight / 2 + lineSize);
    }
  }

  function update() {
    // check inputs and move paddles
    player1.yVel = paddleYVel * ((pressedKeys["KeyS"] ?? 0) - (pressedKeys["KeyW"] ?? 0));
    player1.yPos = Math.max(
      lineSize,
      Math.min(boardHeight - (lineSize + paddleHeight), player1.yPos + player1.yVel),
    );
    player2.yPos = Math.max(
      lineSize,
      Math.min(
        boardHeight - (lineSize + paddleHeight),
        player2.yPos + paddleYVel * ((pressedKeys["ArrowDown"] ?? 0) - (pressedKeys["ArrowUp"] ?? 0)),
      ),
    );

    // move ball
    ball.xPos += ball.xVel;
    ball.yPos += ball.yVel;

    // check side wall collision
    if (ball.yPos <= lineSize) {
      ball.yPos = lineSize;
      ball.yVel *= -1;
    }
    if (ball.yPos >= boardHeight - 2 * lineSize) {
      ball.yPos = boardHeight - 2 * lineSize;
      ball.yVel *= -1;
    }

    // check paddle collision
    // player 1
    if (
      ball.xPos <= player1.xPos + lineSize &&
      ball.yPos + lineSize > player1.yPos &&
      ball.yPos < player1.yPos + paddleHeight
    ) {
      ball.xPos = player1.xPos + lineSize;
      ball.xVel *= -1;
    }
    // player 2
    if (
      ball.xPos + lineSize >= player2.xPos &&
      ball.yPos + lineSize > player2.yPos &&
      ball.yPos < player2.yPos + paddleHeight
    ) {
      ball.xPos = player2.xPos - lineSize;
      ball.xVel *= -1;
    }

    // check goal
    if (ball.xPos <= 0) {
      scores[1]!++;
      if (scores[1] == scoreToWin) {
        gameOver = true;
        winner = 2;
      }
      resetBall(gameOver ? 0 : 1);
    }
    if (ball.xPos + lineSize >= boardWidth) {
      scores[0]!++;
      if (scores[0] == scoreToWin) {
        gameOver = true;
        winner = 1;
      }
      resetBall(gameOver ? 0 : -1);
    }

    draw();

    // end game
    if (gameOver) endGame(false); // false = no navegar automáticamente
  }

  function keyHandler(e: KeyboardEvent) {
    // Escape para salir rápido (si lo quieres quitar, borra este bloque)
    if (e.type === "keydown" && e.code === "Escape") {
      exitToMenu();
      return;
    }
    pressedKeys[e.code] = e.type == "keydown" ? 1 : 0;
  }

  function cleanupUI() {
    document.getElementById(uiId)?.remove();
  }

  function endGame(navigateHome: boolean) {
    if (intervalId !== undefined) {
      clearInterval(intervalId);
      intervalId = undefined;
    }
    document.removeEventListener("keydown", keyHandler);
    document.removeEventListener("keyup", keyHandler);
    document.removeEventListener("hashchange", onHashChange);

    if (navigateHome) {
      // ocultamos el canvas cuando salimos manualmente
	  cleanupUI();
      canvas.style.display = "none";
      location.hash = "#home";
    }
  }

  function exitToMenu() {
    endGame(true);
  }

  function onHashChange() {
    endGame(true);
  }

  // listeners
  document.addEventListener("keydown", keyHandler);
  document.addEventListener("keyup", keyHandler);
  document.addEventListener("hashchange", onHashChange);
  exitBtn.addEventListener("click", exitToMenu);

  // start game loop
  resetBall(-1); // tmp, randomize
  intervalId = setInterval(update, 1000 / 60) as unknown as number;
}
