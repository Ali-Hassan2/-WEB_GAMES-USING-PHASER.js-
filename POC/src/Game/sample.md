import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

const MAZE_WIDTH = 20;
const MAZE_HEIGHT = 20;
const TILE_SIZE = 32;

const mazeMap = [
// 20x20 grid: 1 = wall, 0 = floor
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
[1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
[1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
[1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
[1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
[1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
[1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
[1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
[1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
[1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
[1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
[1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
[1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
[1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
[1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
[1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const WALL_COLOR = 0x003344;
const FLOOR_COLOR = 0x004466;
const PLAYER_COLOR = 0x00ffff;
const ENEMY_COLOR = 0xff5555;
const DOT_COLOR = 0xffcc33;

const SPEED = 100; // pixels per second

class MazeScene extends Phaser.Scene {
player!: Phaser.GameObjects.Arc;
enemies: Phaser.GameObjects.Arc[] = [];
cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
direction: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
nextDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
mapGraphics!: Phaser.GameObjects.Graphics;
dots: Phaser.GameObjects.Arc[] = [];
score = 0;
scoreText!: Phaser.GameObjects.Text;
lives = 3;
livesText!: Phaser.GameObjects.Text;
tileSize = TILE_SIZE;
playerGridPos = new Phaser.Math.Vector2(1, 1);

constructor() {
super("MazeScene");
}

preload() {}

create() {
this.mapGraphics = this.add.graphics();
this.drawMap();

    // Player at start pos
    this.playerGridPos.set(1, 1);
    const playerPixel = this.gridToPixel(
      this.playerGridPos.x,
      this.playerGridPos.y
    );
    this.player = this.add.circle(
      playerPixel.x,
      playerPixel.y,
      this.tileSize / 3,
      PLAYER_COLOR
    );

    // Dots (collectibles)
    this.dots = [];
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        if (mazeMap[y][x] === 0 && !(x === 1 && y === 1)) {
          const pos = this.gridToPixel(x, y);
          const dot = this.add.circle(pos.x, pos.y, 6, DOT_COLOR);
          this.dots.push(dot);
        }
      }
    }

    // Enemies (3 enemies for example) at fixed positions
    this.enemies = [];
    const enemyPositions = [
      new Phaser.Math.Vector2(18, 18),
      new Phaser.Math.Vector2(18, 1),
      new Phaser.Math.Vector2(1, 18),
    ];
    enemyPositions.forEach((pos) => {
      const pixel = this.gridToPixel(pos.x, pos.y);
      const enemy = this.add.circle(
        pixel.x,
        pixel.y,
        this.tileSize / 3,
        ENEMY_COLOR
      );
      (enemy as any).gridPos = pos.clone();
      (enemy as any).moveTimer = 0;
      this.enemies.push(enemy);
    });

    // Input
    this.cursors = this.input?.keyboard.createCursorKeys();

    // UI Text
    this.scoreText = this.add.text(10, 10, "Score: 0", {
      fontSize: "18px",
      color: "#ffffff",
    });
    this.livesText = this.add.text(10, 30, "Lives: 3", {
      fontSize: "18px",
      color: "#ffffff",
    });

    this.direction.set(0, 0);
    this.nextDirection.set(0, 0);

}

drawMap() {
this.mapGraphics.clear();
for (let y = 0; y < MAZE_HEIGHT; y++) {
for (let x = 0; x < MAZE_WIDTH; x++) {
const color = mazeMap[y][x] === 1 ? WALL_COLOR : FLOOR_COLOR;
this.mapGraphics.fillStyle(color, 1);
this.mapGraphics.fillRect(
x _ this.tileSize,
y _ this.tileSize,
this.tileSize,
this.tileSize
);
}
}
}

gridToPixel(x: number, y: number) {
return {
x: x _ this.tileSize + this.tileSize / 2,
y: y _ this.tileSize + this.tileSize / 2,
};
}

pixelToGrid(x: number, y: number) {
return new Phaser.Math.Vector2(
Math.floor(x / this.tileSize),
Math.floor(y / this.tileSize)
);
}

canMoveTo(gridX: number, gridY: number) {
if (gridX < 0 || gridY < 0 || gridX >= MAZE_WIDTH || gridY >= MAZE_HEIGHT)
return false;
return mazeMap[gridY][gridX] === 0;
}

update(time: number, delta: number) {
const deltaSec = delta / 1000;

    // Handle input to set nextDirection
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left!)) {
      this.nextDirection.set(-1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right!)) {
      this.nextDirection.set(1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
      this.nextDirection.set(0, -1);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down!)) {
      this.nextDirection.set(0, 1);
    }

    // Check if nextDirection can be taken from current grid position
    const tryGridX = this.playerGridPos.x + this.nextDirection.x;
    const tryGridY = this.playerGridPos.y + this.nextDirection.y;

    if (this.nextDirection.x !== 0 || this.nextDirection.y !== 0) {
      if (this.canMoveTo(tryGridX, tryGridY)) {
        this.direction.copy(this.nextDirection);
      }
    }

    // Move player continuously in direction if possible
    if (this.direction.x !== 0 || this.direction.y !== 0) {
      const nextX = this.player.x + this.direction.x * SPEED * deltaSec;
      const nextY = this.player.y + this.direction.y * SPEED * deltaSec;

      // Check collision with walls by grid
      const nextGridX = Math.floor(nextX / this.tileSize);
      const nextGridY = Math.floor(nextY / this.tileSize);

      if (this.canMoveTo(nextGridX, nextGridY)) {
        this.player.x = nextX;
        this.player.y = nextY;
        this.playerGridPos.set(nextGridX, nextGridY);
      } else {
        // Hit wall, stop moving
        this.direction.set(0, 0);
      }
    }

    // Check collision with dots (collectibles)
    this.dots = this.dots.filter((dot) => {
      const dist = Phaser.Math.Distance.Between(
        dot.x,
        dot.y,
        this.player.x,
        this.player.y
      );
      if (dist < 10) {
        this.score += 10;
        this.scoreText.setText("Score: " + this.score);
        dot.destroy();
        return false;
      }
      return true;
    });

    // Move enemies randomly every 1 second
    this.enemies.forEach((enemy) => {
      (enemy as any).moveTimer += deltaSec;
      if ((enemy as any).moveTimer > 1) {
        (enemy as any).moveTimer = 0;

        // Random direction
        const dirs = [
          new Phaser.Math.Vector2(1, 0),
          new Phaser.Math.Vector2(-1, 0),
          new Phaser.Math.Vector2(0, 1),
          new Phaser.Math.Vector2(0, -1),
        ];

        const currentPos = (enemy as any).gridPos;
        // Filter possible moves
        const possibleMoves = dirs.filter((d) =>
          this.canMoveTo(currentPos.x + d.x, currentPos.y + d.y)
        );
        if (possibleMoves.length > 0) {
          const move = Phaser.Math.RND.pick(possibleMoves);
          currentPos.x += move.x;
          currentPos.y += move.y;

          // Update enemy pixel position smoothly
          this.tweens.add({
            targets: enemy,
            x: this.gridToPixel(currentPos.x, currentPos.y).x,
            y: this.gridToPixel(currentPos.x, currentPos.y).y,
            duration: 900,
            ease: "Linear",
          });
        }
      }
    });

    // Check collision with enemies
    this.enemies.forEach((enemy) => {
      const dist = Phaser.Math.Distance.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y
      );
      if (dist < 20) {
        this.lives--;
        this.livesText.setText("Lives: " + this.lives);
        // Reset player position
        const startPixel = this.gridToPixel(1, 1);
        this.player.x = startPixel.x;
        this.player.y = startPixel.y;
        this.playerGridPos.set(1, 1);
        this.direction.set(0, 0);
        this.nextDirection.set(0, 0);

        if (this.lives <= 0) {
          alert("Game Over! Your score: " + this.score);
          this.scene.restart();
          this.score = 0;
          this.lives = 3;
          this.scoreText.setText("Score: 0");
          this.livesText.setText("Lives: 3");
        }
      }
    });

}
}

function App() {
const gameRef = useRef<Phaser.Game | null>(null);
const gameContainerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
if (!gameRef.current) {
const config: Phaser.Types.Core.GameConfig = {
type: Phaser.AUTO,
width: MAZE_WIDTH _ TILE_SIZE,
height: MAZE_HEIGHT _ TILE_SIZE,
backgroundColor: "#000000",
parent: gameContainerRef.current!,
scene: MazeScene,
};

      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };

}, []);

return (
<div
ref={gameContainerRef}
style={{
        margin: "0 auto",
        width: MAZE_WIDTH * TILE_SIZE,
        height: MAZE_HEIGHT * TILE_SIZE,
      }}
/>
);
}

export default App; acha yar please meri job ka swal hai please ye smjha do kya kr rhe ho ye kis tarah horha kn sa kam kese horha
