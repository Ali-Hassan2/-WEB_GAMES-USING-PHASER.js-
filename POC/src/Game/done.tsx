import { useRef, useEffect } from "react";
import Phaser from "phaser";
import { GameWrapper } from "./Game.styles";

const Tile_Size = 40; // each tile is 40×40 pixels
const CANVAS_W = 1600;
const CANVAS_H = 1000;
const mazeWidth = Math.floor(CANVAS_W / Tile_Size); // 40 tiles
const mazeHeight = Math.floor(CANVAS_H / Tile_Size); // 25 tiles

// ===== Perfect maze + rooms =====
function generateMaze(width: number, height: number) {
  const maze = Array.from({ length: height }, () => Array(width).fill(1));

  function carve(x: number, y: number) {
    maze[y][x] = 0;
    const dirs = [
      [0, -2],
      [2, 0],
      [0, 2],
      [-2, 0],
    ].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (
        nx > 0 &&
        ny > 0 &&
        nx < width - 1 &&
        ny < height - 1 &&
        maze[ny][nx] === 1
      ) {
        maze[y + dy / 2][x + dx / 2] = 0; // knock wall between
        carve(nx, ny);
      }
    }
  }

  carve(1, 1);

  // Add 4 rectangular rooms
  for (let r = 0; r < 4; r++) {
    const rw = Phaser.Math.Between(4, 7);
    const rh = Phaser.Math.Between(3, 6);
    const rx = Phaser.Math.Between(1, width - rw - 2);
    const ry = Phaser.Math.Between(1, height - rh - 2);
    for (let y = ry; y < ry + rh; y++) {
      for (let x = rx; x < rx + rw; x++) {
        maze[y][x] = 0;
      }
    }
  }

  // Make sure start cell is open
  maze[1][1] = 0;
  return maze;
}

let mazeMap: number[][] = generateMaze(mazeWidth, mazeHeight);

const WALL_COLOR = 0x003344;
const FLOOR_COLOR = 0x004466;

type OptionSprite = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody & {
  optIndex: number;
};

class MainScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  enemies!: Phaser.GameObjects.Arc[]; // (unused right now, keeping your field)
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  direction: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  nextDirection!: Phaser.Math.Vector2;
  mapGraphics!: Phaser.GameObjects.Graphics;
  score = 0;
  scoreText!: Phaser.GameObjects.Text;
  lives = 3;
  livesText!: Phaser.GameObjects.Text;
  tileSize = Tile_Size;
  playerGridPos = new Phaser.Math.Vector2(1, 1);

  // quiz state
  stage = 1;
  questionText!: Phaser.GameObjects.Text;
  optionGroup!: Phaser.Physics.Arcade.Group;
  optionLabels: Phaser.GameObjects.Text[] = [];
  currentQuestion!: { q: string; options: string[]; correct: number };

  questions = [
    { q: "2 + 3 = ?", options: ["4", "5", "6"], correct: 1 },
    {
      q: "Capital of France?",
      options: ["Berlin", "Paris", "Rome"],
      correct: 1,
    },
    { q: "5 * 4 = ?", options: ["10", "20", "25"], correct: 1 },
    { q: "Largest planet?", options: ["Jupiter", "Earth", "Mars"], correct: 0 },
    { q: "Binary of 2?", options: ["10", "11", "01"], correct: 0 },
  ];

  constructor() {
    super("MainScene");
  }

  preload() {
    this.load.image(
      "player",
      "https://labs.phaser.io/assets/sprites/phaser-dude.png"
    );
    this.load.image(
      "ghost-red",
      "https://labs.phaser.io/assets/sprites/ghost.png"
    );
    this.load.image(
      "ghost-blue",
      "https://labs.phaser.io/assets/sprites/ghost-blue.png"
    );
    this.load.image(
      "ghost-pink",
      "https://labs.phaser.io/assets/sprites/ghost-pink.png"
    );
    this.load.image(
      "ghost-orange",
      "https://labs.phaser.io/assets/sprites/ghost-orange.png"
    );
    this.load.image(
      "option",
      "https://labs.phaser.io/assets/sprites/orb-blue.png"
    );
  }

  create() {
    // map
    this.mapGraphics = this.add.graphics();
    this.drawMap();

    // player
    this.playerGridPos.set(1, 1);
    const pPix = this.gridToPixel(this.playerGridPos.x, this.playerGridPos.y);
    this.player = this.physics.add.sprite(pPix.x, pPix.y, "player");
    this.player.setCircle(16, 8, 8); // small hitbox
    this.player.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.scoreText = this.add.text(10, 10, "Score: 0", {
      fontSize: "20px",
      color: "#ffffff",
    });
    this.livesText = this.add.text(10, 34, "Lives: 3", {
      fontSize: "20px",
      color: "#ffffff",
    });

    // question UI
    this.questionText = this.add
      .text(CANVAS_W / 2, 10, "", {
        fontSize: "22px",
        color: "#fffa",
      })
      .setOrigin(0.5, 0);

    this.optionGroup = this.physics.add.group();
    this.optionLabels = [];

    // overlap: player selects option
    this.physics.add.overlap(this.player, this.optionGroup, (_p, opt) => {
      const o = opt as OptionSprite;
      this.checkAnswer(o.optIndex);
    });

    // start first stage
    this.startStage();
  }

  // ---- STAGE / QUIZ ----
  startStage() {
    // regenerate maze for each stage
    mazeMap = generateMaze(mazeWidth, mazeHeight);
    this.drawMap();

    // reset player at start
    this.playerGridPos.set(1, 1);
    const pPix = this.gridToPixel(1, 1);
    this.player.setPosition(pPix.x, pPix.y);

    // pick question
    this.currentQuestion = Phaser.Utils.Array.GetRandom(this.questions);
    this.questionText.setText(`Stage ${this.stage}: ${this.currentQuestion.q}`);

    // clear old options
    this.optionGroup.clear(true, true);
    this.optionLabels.forEach((t) => t.destroy());
    this.optionLabels = [];

    // place three options on valid floor cells, spaced out
    const spots = this.pickDistinctFloorCells(3, 6);
    spots.forEach((cell, idx) => {
      const pos = this.gridToPixel(cell.x, cell.y);
      const orb = this.optionGroup.create(
        pos.x,
        pos.y,
        "option"
      ) as OptionSprite;
      orb.setImmovable(true);
      orb.setScale(0.8);
      orb.optIndex = idx;

      const label = this.add
        .text(pos.x, pos.y - 22, this.currentQuestion.options[idx], {
          fontSize: "18px",
          color: "#fff",
          backgroundColor: "#0008",
          padding: { left: 6, right: 6, top: 2, bottom: 2 },
        })
        .setOrigin(0.5);
      this.optionLabels.push(label);
    });
  }

  checkAnswer(optIndex: number) {
    if (optIndex === this.currentQuestion.correct) {
      this.score += 10;
      this.stage += 1;
      this.scoreText.setText(`Score: ${this.score}`);
      this.startStage();
    } else {
      this.lives -= 1;
      this.livesText.setText(`Lives: ${this.lives}`);
      if (this.lives <= 0) {
        this.scene.restart(); // simple reset
        return;
      }
      // nudge player back to start
      const pPix = this.gridToPixel(1, 1);
      this.player.setPosition(pPix.x, pPix.y);
    }
  }

  // picks N floor cells, each at least minManhattan apart
  pickDistinctFloorCells(n: number, minManhattan = 5) {
    const picks: { x: number; y: number }[] = [];
    let safety = 5000;
    while (picks.length < n && safety-- > 0) {
      const x = Phaser.Math.Between(2, mazeWidth - 3);
      const y = Phaser.Math.Between(2, mazeHeight - 3);
      if (mazeMap[y][x] !== 0) continue;

      const ok = picks.every(
        (p) => Math.abs(p.x - x) + Math.abs(p.y - y) >= minManhattan
      );
      if (ok) picks.push({ x, y });
    }
    // ensure at least 1 option is closer to start sometimes
    if (picks.length === n) picks[0] = { x: 3, y: 3 };
    return picks;
  }

  // ---- MOVEMENT (grid step) ----
  update() {
    if (!this.cursors) return;

    // allow a single grid step per key press
    const speed = 220;
    let vx = 0,
      vy = 0;

    if (this.cursors.left?.isDown) vx = -speed;
    else if (this.cursors.right?.isDown) vx = speed;

    if (this.cursors.up?.isDown) vy = -speed;
    else if (this.cursors.down?.isDown) vy = speed;

    // try to block into walls by cheap check ahead
    if (vx !== 0 || vy !== 0) {
      const next = this.pixelToGrid(
        this.player.x + Math.sign(vx) * 10,
        this.player.y + Math.sign(vy) * 10
      );
      if (this.canMoveTo(next.x, next.y)) {
        this.player.setVelocity(vx, vy);
      } else {
        this.player.setVelocity(0, 0);
      }
    } else {
      this.player.setVelocity(0, 0);
    }
  }

  // ---- MAP DRAW & HELPERS ----
  drawMap() {
    if (!this.mapGraphics) this.mapGraphics = this.add.graphics();
    this.mapGraphics.clear();

    for (let row = 0; row < mazeMap.length; row++) {
      for (let col = 0; col < mazeMap[row].length; col++) {
        const color = mazeMap[row][col] === 1 ? WALL_COLOR : FLOOR_COLOR;
        this.mapGraphics.fillStyle(color, 1);
        // NOTE: x = col, y = row (this fixes the old swap)
        this.mapGraphics.fillRect(
          col * this.tileSize,
          row * this.tileSize,
          this.tileSize,
          this.tileSize
        );
      }
    }
  }

  gridToPixel(x: number, y: number) {
    return {
      x: x * this.tileSize + this.tileSize / 2,
      y: y * this.tileSize + this.tileSize / 2,
    };
  }

  pixelToGrid(x: number, y: number) {
    return new Phaser.Math.Vector2(
      Math.floor(x / this.tileSize),
      Math.floor(y / this.tileSize)
    );
  }

  canMoveTo(gridX: number, gridY: number) {
    if (gridX < 0 || gridY < 0 || gridX >= mazeWidth || gridY >= mazeHeight)
      return false;
    return mazeMap[gridY][gridX] === 0;
  }
}

const Game = () => {
  const gameref = useRef<HTMLDivElement>(null);
  const phasergameref = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameref.current && !phasergameref.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: CANVAS_W,
        height: CANVAS_H,
        parent: "phaser-container",
        physics: {
          default: "arcade",
          arcade: { debug: false },
        },
        scene: MainScene,
      };
      phasergameref.current = new Phaser.Game(config);

      return () => {
        phasergameref.current?.destroy(true);
        phasergameref.current = null;
      };
    }
  }, []);

  return <GameWrapper id="phaser-container" ref={gameref} />;
};

export { Game };
