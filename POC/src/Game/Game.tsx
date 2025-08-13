import { useRef, useEffect } from "react";
import Phaser from "phaser";
import { GameWrapper } from "./Game.styles";

const TILE = 60;
const CANVAS_W = 1600;
const CANVAS_H = 1000;
const GRID_W = Math.floor(CANVAS_W / TILE); // 40
const GRID_H = Math.floor(CANVAS_H / TILE); // 25

const COLOR_WALL = 0x2a0b3d;
const COLOR_FLOOR = 0x3a1550;
const COLOR_ROOM_FILL = 0x5a1a78;
const COLOR_ROOM_OUTLINE = 0x9b59b6;
const COLOR_OPTION_PAD = 0xc084fc;
const COLOR_PLAYER_TINT = 0x6ee7f9;
const COLOR_ENEMY = 0xff77aa;
const TOP_QUESTION_BG = 0x2b0f2f;
const TEXT_COLOR = "#EEDCFF";

type Room = {
  x: number;
  y: number;
  w: number;
  h: number;
  door: { x: number; y: number } | null;
};
type Q = { q: string; options: string[]; correct: number };

function gridToPixel(x: number, y: number) {
  return { x: x * TILE + TILE / 2, y: y * TILE + TILE / 2 };
}
function pixelToGrid(px: number, py: number) {
  return { x: Math.floor(px / TILE), y: Math.floor(py / TILE) };
}

function generatePerfectMaze(w: number, h: number) {
  const maze = Array.from({ length: h }, () => Array(w).fill(1));
  function carve(cx: number, cy: number) {
    maze[cy][cx] = 0;
    const dirs = [
      [0, -2],
      [2, 0],
      [0, 2],
      [-2, 0],
    ].sort(() => Math.random() - 0.5);
    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx > 0 && ny > 0 && nx < w - 1 && ny < h - 1 && maze[ny][nx] === 1) {
        maze[cy + dy / 2][cx + dx / 2] = 0;
        carve(nx, ny);
      }
    }
  }
  carve(1, 1);
  maze[1][1] = 0;
  return maze;
}

function carvePathToNearestFloor(maze: number[][], sx: number, sy: number) {
  const h = maze.length,
    w = maze[0].length;
  const visited = Array.from({ length: h }, () => Array(w).fill(false));
  const parent: { x: number; y: number }[][] = Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ x: -1, y: -1 }))
  );
  const q: { x: number; y: number }[] = [{ x: sx, y: sy }];
  visited[sy][sx] = true;
  let found: { x: number; y: number } | null = null;
  while (q.length) {
    const cur = q.shift()!;
    if (!(cur.x === sx && cur.y === sy) && maze[cur.y][cur.x] === 0) {
      found = cur;
      break;
    }
    for (const d of [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ]) {
      const nx = cur.x + d.x,
        ny = cur.y + d.y;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      if (visited[ny][nx]) continue;
      visited[ny][nx] = true;
      parent[ny][nx] = { x: cur.x, y: cur.y };
      q.push({ x: nx, y: ny });
    }
  }
  if (found) {
    let p = found;
    while (!(p.x === sx && p.y === sy)) {
      maze[p.y][p.x] = 0;
      p = parent[p.y][p.x];
    }
    maze[sy][sx] = 0;
    return true;
  }
  let cx = sx,
    cy = sy;
  for (const d of [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ]) {
    for (let s = 0; s < 40; s++) {
      cx += d.x;
      cy += d.y;
      if (
        cx <= 0 ||
        cy <= 0 ||
        cx >= maze[0].length - 1 ||
        cy >= maze.length - 1
      )
        break;
      maze[cy][cx] = 0;
    }
  }
  maze[sy][sx] = 0;
  return false;
}

function placeRooms(
  maze: number[][],
  count = 4,
  minW = 5,
  maxW = 9,
  minH = 4,
  maxH = 7
) {
  const rooms: Room[] = [];
  const h = maze.length,
    w = maze[0].length;
  let attempts = 0;
  while (rooms.length < count && attempts++ < 1200) {
    const rw = Phaser.Math.Between(minW, maxW);
    const rh = Phaser.Math.Between(minH, maxH);
    const rx = Phaser.Math.Between(2, w - rw - 3);
    const ry = Phaser.Math.Between(2, h - rh - 3);
    const overlaps = rooms.some(
      (r) =>
        !(
          rx + rw + 1 < r.x ||
          r.x + r.w + 1 < rx ||
          ry + rh + 1 < r.y ||
          r.y + r.h + 1 < ry
        )
    );
    if (overlaps) continue;
    for (let yy = ry; yy < ry + rh; yy++) {
      for (let xx = rx; xx < rx + rw; xx++) {
        const border =
          xx === rx || xx === rx + rw - 1 || yy === ry || yy === ry + rh - 1;
        maze[yy][xx] = border ? 1 : 0;
      }
    }
    const side = Phaser.Math.Between(0, 3);
    let dx = rx,
      dy = ry;
    if (side === 0) {
      dx = Phaser.Math.Between(rx + 1, rx + rw - 2);
      dy = ry;
    } else if (side === 1) {
      dx = rx + rw - 1;
      dy = Phaser.Math.Between(ry + 1, ry + rh - 2);
    } else if (side === 2) {
      dx = Phaser.Math.Between(rx + 1, rx + rw - 2);
      dy = ry + rh - 1;
    } else {
      dx = rx;
      dy = Phaser.Math.Between(ry + 1, ry + rh - 2);
    }
    maze[dy][dx] = 0;
    carvePathToNearestFloor(maze, dx, dy);
    rooms.push({ x: rx, y: ry, w: rw, h: rh, door: { x: dx, y: dy } });
  }
  return rooms;
}

class MainScene extends Phaser.Scene {
  maze!: number[][];
  rooms!: Room[];
  mapGraphics!: Phaser.GameObjects.Graphics;
  roomGraphics!: Phaser.GameObjects.Graphics;
  player!: Phaser.Physics.Arcade.Image;
  enemies: Phaser.GameObjects.Arc[] = [];
  optionPads!: Phaser.Physics.Arcade.Group;
  optionLabels: Phaser.GameObjects.Text[] = [];
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  topQuestionBg!: Phaser.GameObjects.Graphics;
  questionText!: Phaser.GameObjects.Text;
  scoreText!: Phaser.GameObjects.Text;
  livesText!: Phaser.GameObjects.Text;
  stageText!: Phaser.GameObjects.Text;

  questions: Q[] = [
    { q: "2 + 3 = ?", options: ["4", "5", "6"], correct: 1 },
    {
      q: "Capital of France?",
      options: ["Berlin", "Paris", "Rome", "Gujrat"],
      correct: 1,
    },
    { q: "5 * 4 = ?", options: ["10", "20", "25"], correct: 1 },
    { q: "Largest planet?", options: ["Jupiter", "Earth", "Mars"], correct: 0 },
    { q: "Binary of 2?", options: ["10", "11", "01"], correct: 0 },
  ];
  currentQ!: Q;
  score = 0;
  lives = 3;
  stage = 1;

  playerMoving = false;

  constructor() {
    super("MainScene");
  }

  preload() {
    this.load.image(
      "player_lab",
      "https://labs.phaser.io/assets/sprites/phaser-dude.png"
    );
  }

  create() {
    this.physics.world.setBounds(0, 0, CANVAS_W, CANVAS_H);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.mapGraphics = this.add.graphics();
    this.roomGraphics = this.add.graphics();

    // UI
    this.topQuestionBg = this.add.graphics().setDepth(1000);
    this.questionText = this.add
      .text(CANVAS_W / 2, 16, "", { fontSize: "26px", color: TEXT_COLOR })
      .setOrigin(0.5, 0)
      .setDepth(1001);
    this.scoreText = this.add
      .text(12, 12, `Score: ${this.score}`, {
        fontSize: "20px",
        color: TEXT_COLOR,
      })
      .setDepth(1001);
    this.livesText = this.add
      .text(12, 38, `Lives: ${this.lives}`, {
        fontSize: "20px",
        color: TEXT_COLOR,
      })
      .setDepth(1001);
    this.stageText = this.add
      .text(CANVAS_W - 12, 12, `Stage: ${this.stage}`, {
        fontSize: "20px",
        color: TEXT_COLOR,
      })
      .setOrigin(1, 0)
      .setDepth(1001);

    this.optionPads = this.physics.add.group();

    this.buildStage();

    this.physics.add.overlap(this.player, this.optionPads, (_p, pad) => {
      const opt = pad as Phaser.Types.Physics.Arcade.ImageWithDynamicBody & {
        optIndex?: number;
      };
      if (typeof opt.optIndex === "number") {
        this.handleOption(opt.optIndex);
      }
    });

    this.time.addEvent({
      delay: 150,
      loop: true,
      callback: () => {
        for (const e of this.enemies) {
          if (
            Phaser.Math.Distance.Between(
              this.player.x,
              this.player.y,
              e.x,
              e.y
            ) <
            TILE * 0.6
          ) {
            this.onPlayerHit();
            break;
          }
        }
      },
    });
  }

  buildStage() {
    this.maze = generatePerfectMaze(GRID_W, GRID_H);
    this.rooms = placeRooms(this.maze, 4, 5, 8, 4, 6);

    if (!this.mapGraphics) this.mapGraphics = this.add.graphics();
    if (!this.roomGraphics) this.roomGraphics = this.add.graphics();
    this.drawMap();
    this.drawRooms();

    const start = gridToPixel(1, 1);
    if (!this.player) {
      this.player = this.physics.add
        .image(start.x, start.y, "player_lab")
        .setScale(0.7)
        .setDepth(900);
      this.player.setTint(COLOR_PLAYER_TINT);
      this.player.setCollideWorldBounds(true);
      (this.player.body as Phaser.Physics.Arcade.Body).setCircle(12, 4, 4);
    } else {
      this.player.setPosition(start.x, start.y);
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    }
    this.playerMoving = false;

    this.enemies.forEach((e) => e.destroy());
    this.enemies = [];
    this.spawnEnemies(4);

    this.setupQuestionAndOptions();
  }

  setupQuestionAndOptions() {
    this.optionPads.clear(true, true);
    this.optionLabels.forEach((t) => t.destroy());
    this.optionLabels = [];

    this.currentQ = Phaser.Utils.Array.GetRandom(this.questions);
    this.drawTopQuestion(this.currentQ.q);

    const shuffled = Phaser.Utils.Array.Shuffle([...this.rooms]);
    const chosen = shuffled.slice(0, 3);
    for (let i = 0; i < 3; i++) {
      const r = chosen[i];
      const rx = Math.floor(r.x + r.w / 2);
      const ry = Math.floor(r.y + r.h / 2);
      const pos = gridToPixel(rx, ry);

      const key = `opt_${this.stage}_${i}`;
      if (!this.textures.exists(key))
        this.createCircleTexture(key, TILE * 0.9, COLOR_OPTION_PAD);

      const pad = this.optionPads.create(
        pos.x,
        pos.y,
        key
      ) as Phaser.Types.Physics.Arcade.ImageWithDynamicBody & {
        optIndex?: number;
      };
      pad.setCircle(TILE * 0.45);
      pad.setImmovable(true);
      pad.optIndex = i;

      const label = this.add
        .text(pos.x, pos.y - TILE * 0.7, this.currentQ.options[i], {
          fontSize: "20px",
          color: TEXT_COLOR,
          backgroundColor: "#00000066",
          padding: { left: 8, right: 8, top: 4, bottom: 4 },
        })
        .setOrigin(0.5)
        .setDepth(950);
      this.optionLabels.push(label);
    }
  }

  handleOption(optIndex: number) {
    if (optIndex === this.currentQ.correct) {
      this.score += 10;
      this.stage += 1;
      this.scoreText.setText(`Score: ${this.score}`);
      this.stageText.setText(`Stage: ${this.stage}`);
      this.buildStage();
    } else {
      this.lives -= 1;
      this.livesText.setText(`Lives: ${this.lives}`);
      this.optionPads.getChildren().forEach((c: any) => {
        if (c.optIndex === optIndex) c.destroy();
      });
      this.optionLabels.forEach((lab) => {
        if (lab.text === this.currentQ.options[optIndex]) lab.destroy();
      });
      this.optionLabels = this.optionLabels.filter((l) => l && !l._destroyed);
      if (this.lives <= 0) {
        this.score = 0;
        this.lives = 3;
        this.stage = 1;
        this.buildStage();
      } else {
        const s = gridToPixel(1, 1);
        this.player.setPosition(s.x, s.y);
        (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        this.playerMoving = false;
      }
    }
  }

  createCircleTexture(key: string, diameter: number, color: number) {
    const g = this.make.graphics({ add: false });
    g.fillStyle(color, 1);
    g.fillCircle(diameter / 2, diameter / 2, diameter / 2);
    g.lineStyle(4, 0xffffff, 0.12);
    g.strokeCircle(diameter / 2, diameter / 2, diameter / 2 - 2);
    g.generateTexture(key, diameter, diameter);
    g.destroy();
  }

  drawTopQuestion(q: string) {
    this.topQuestionBg.clear();
    const width = CANVAS_W * 0.9;
    const height = 66;
    const x = (CANVAS_W - width) / 2;
    const y = 6;
    this.topQuestionBg.fillStyle(TOP_QUESTION_BG, 0.92);
    this.topQuestionBg.fillRoundedRect(x, y, width, height, 10);
    this.topQuestionBg.lineStyle(3, COLOR_ROOM_OUTLINE, 0.9);
    this.topQuestionBg.strokeRoundedRect(x, y, width, height, 10);
    this.questionText.setText(q);
    this.questionText.setPosition(CANVAS_W / 2, y + height / 2 - 6);
  }

  spawnEnemies(count = 4) {
    const picks: { x: number; y: number }[] = [];
    let tries = 0;
    while (picks.length < count && tries++ < 3000) {
      const gx = Phaser.Math.Between(2, GRID_W - 3);
      const gy = Phaser.Math.Between(2, GRID_H - 3);
      if (this.maze[gy][gx] !== 0) continue;
      if (Math.abs(gx - 1) + Math.abs(gy - 1) < 8) continue;
      if (picks.some((p) => Math.abs(p.x - gx) + Math.abs(p.y - gy) < 6))
        continue;
      picks.push({ x: gx, y: gy });
    }
    picks.forEach((p) => {
      const pix = gridToPixel(p.x, p.y);
      const arc = this.add.circle(
        pix.x,
        pix.y,
        TILE * 0.36,
        COLOR_ENEMY,
        1
      ) as Phaser.GameObjects.Arc & {
        moving?: boolean;
        dir?: { x: number; y: number };
        nextTime?: number;
        target?: { x: number; y: number };
      };
      this.physics.add.existing(arc);
      (arc.body as Phaser.Physics.Arcade.Body)
        .setImmovable(false)
        .setCircle(TILE * 0.36);
      arc.setDepth(850);
      arc.moving = false;
      arc.dir = { x: 0, y: 0 };
      arc.nextTime = 0;
      this.enemies.push(arc);
    });
  }

  drawMap() {
    this.mapGraphics.clear();
    for (let ry = 0; ry < this.maze.length; ry++) {
      for (let rx = 0; rx < this.maze[ry].length; rx++) {
        const color = this.maze[ry][rx] === 1 ? COLOR_WALL : COLOR_FLOOR;
        this.mapGraphics.fillStyle(color, 1);
        this.mapGraphics.fillRect(rx * TILE, ry * TILE, TILE, TILE);
      }
    }
    this.mapGraphics.lineStyle(1, 0xffffff, 0.03);
    for (let x = 0; x <= GRID_W; x++)
      this.mapGraphics.lineBetween(x * TILE, 0, x * TILE, CANVAS_H);
    for (let y = 0; y <= GRID_H; y++)
      this.mapGraphics.lineBetween(0, y * TILE, CANVAS_W, y * TILE);
  }

  drawRooms() {
    this.roomGraphics.clear();
    for (const r of this.rooms) {
      this.roomGraphics.fillStyle(COLOR_ROOM_FILL, 0.36);
      this.roomGraphics.fillRect(
        r.x * TILE,
        r.y * TILE,
        r.w * TILE,
        r.h * TILE
      );
      this.roomGraphics.lineStyle(3, COLOR_ROOM_OUTLINE, 0.95);
      this.roomGraphics.strokeRect(
        r.x * TILE + 1.5,
        r.y * TILE + 1.5,
        r.w * TILE - 3,
        r.h * TILE - 3
      );
      if (r.door) {
        this.roomGraphics.fillStyle(COLOR_FLOOR, 1);
        this.roomGraphics.fillRect(
          r.door.x * TILE,
          r.door.y * TILE,
          TILE,
          TILE
        );
      }
    }
  }

  onPlayerHit() {
    this.lives -= 1;
    this.livesText.setText(`Lives: ${this.lives}`);
    const s = gridToPixel(1, 1);
    this.player.setPosition(s.x, s.y);
    (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.playerMoving = false;
    if (this.lives <= 0) {
      this.score = 0;
      this.lives = 3;
      this.stage = 1;
      this.buildStage();
    }
  }

  update(_t: number, dt: number) {
    if (this.player && !this.playerMoving) {
      let dir = { x: 0, y: 0 };
      if (this.cursors.left?.isDown) dir = { x: -1, y: 0 };
      else if (this.cursors.right?.isDown) dir = { x: 1, y: 0 };
      else if (this.cursors.up?.isDown) dir = { x: 0, y: -1 };
      else if (this.cursors.down?.isDown) dir = { x: 0, y: 1 };

      if (dir.x !== 0 || dir.y !== 0) {
        const g = pixelToGrid(this.player.x, this.player.y);
        const nx = g.x + dir.x;
        const ny = g.y + dir.y;
        if (this.canMoveTo(nx, ny)) {
          const target = gridToPixel(nx, ny);
          this.playerMoving = true;
          this.tweens.add({
            targets: this.player,
            x: target.x,
            y: target.y,
            duration: 200,
            ease: "Linear",
            onComplete: () => {
              this.playerMoving = false;
            },
          });
        }
      }
    }

    this.enemies.forEach((e) => {
      if ((e as any).moving) return;
      const eg = pixelToGrid(e.x, e.y);
      const choices = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
      ].filter((d) => this.canMoveTo(eg.x + d.x, eg.y + d.y));
      if (!choices.length) return;
      const prev = (e as any).dir ?? { x: 0, y: 0 };
      const filtered = choices.filter(
        (d) => !(d.x === -prev.x && d.y === -prev.y)
      );
      const pick = filtered.length
        ? Phaser.Utils.Array.GetRandom(filtered)
        : Phaser.Utils.Array.GetRandom(choices);
      (e as any).dir = pick;
      const targ = gridToPixel(eg.x + pick.x, eg.y + pick.y);
      (e as any).moving = true;
      this.tweens.add({
        targets: e,
        x: targ.x,
        y: targ.y,
        duration: 300 + Phaser.Math.Between(0, 200),
        ease: "Linear",
        onComplete: () => {
          (e as any).moving = false;
        },
      });
    });

    this.optionPads.getChildren().forEach((pad: any, i: number) => {
      if (this.optionLabels[i]) {
        this.optionLabels[i].setPosition(pad.x, pad.y - TILE * 0.7);
      }
    });
  }

  canMoveTo(gx: number, gy: number) {
    if (gx < 0 || gy < 0 || gx >= GRID_W || gy >= GRID_H) return false;
    return this.maze[gy][gx] === 0;
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
        parent: gameref.current,
        backgroundColor: "#120018",
        physics: { default: "arcade", arcade: { debug: false } },
        scene: MainScene,
      };
      phasergameref.current = new Phaser.Game(config);
    }
    return () => {
      phasergameref.current?.destroy(true);
      phasergameref.current = null;
    };
  }, []);

  return <GameWrapper id="phaser-container" ref={gameref} />;
};

export { Game };
