import { useRef, useEffect, useState } from "react";
import Phaser from "phaser";
import { GameWrapper } from "./Game.style";
import W from "../assets/W.gif";
import LB from "../assets/LB.gif";
import BaG from "../assets/BaG.png";
import RG from "../assets/RG.gif";
import texture from "../assets/texture.png";

const mazeMap = [
// 0 = empty space, 1 = wall
[
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
],
[
1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
],
[
1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0,
0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1,
],
[
1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0,
1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1,
],
[
1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0,
1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1,
],
[
1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
],
[
1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
],
[
1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
],
[
1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0,
1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1,
],
[
1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1,
1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
],
[
1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0,
1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1,
],
[
1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0,
1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1,
],
[
1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0,
1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1,
],
[
1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
],
[
1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
],
[
1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
],
[
1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0,
1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1,
],
[
1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
],
[
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
],
[
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
],
[
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
],
[
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
],
];

function gridToPixelX(gx: number) {
return gx _ TILE + TILE / 2;
}
function gridToPixelY(gy: number) {
return gy _ TILE + TILE / 2;
}
const TILE = 48;
const SPEED = 140;
const MAX_LIVES = 3;

class MainScene extends Phaser.Scene {
player!: Phaser.Physics.Arcade.Sprite;
ghosts: Phaser.Physics.Arcade.Sprite[] = [];
walls!: Phaser.Physics.Arcade.StaticGroup;
cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
livesText!: Phaser.GameObjects.Text;
lives: number = MAX_LIVES;

constructor() {
super("MainScene");
}

preload() {
this.load.image(
"player",
"https://labs.phaser.io/assets/sprites/phaser-dude.png"
);
this.load.image("ghost-one", W);
this.load.image("ghost-two", RG);
this.load.image("ghost-three", LB);
this.load.image("ghost-four", BaG);
this.load.image("texture", texture);
}

create() {
this.cursors = this.input.keyboard.createCursorKeys();

    // Draw map and walls
    this.walls = this.physics.add.staticGroup();

    // Single graphics object for borders
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(2, 0x888888, 1); // width, color, alpha

    for (let y = 0; y < mazeMap.length; y++) {
      for (let x = 0; x < mazeMap[0].length; x++) {
        const px = x * TILE;
        const py = y * TILE;

        if (mazeMap[y][x] === 0) {
          // Floor tile
          this.add.tileSprite(
            px + TILE / 2,
            py + TILE / 2,
            TILE,
            TILE,
            "texture"
          );

          // Draw borders along adjacent walls
          if (y === 0 || mazeMap[y - 1][x] === 1)
            borderGraphics.strokeLineShape(
              new Phaser.Geom.Line(px, py, px + TILE, py)
            ); // top
          if (y === mazeMap.length - 1 || mazeMap[y + 1][x] === 1)
            borderGraphics.strokeLineShape(
              new Phaser.Geom.Line(px, py + TILE, px + TILE, py + TILE)
            ); // bottom
          if (x === 0 || mazeMap[y][x - 1] === 1)
            borderGraphics.strokeLineShape(
              new Phaser.Geom.Line(px, py, px, py + TILE)
            ); // left
          if (x === mazeMap[0].length - 1 || mazeMap[y][x + 1] === 1)
            borderGraphics.strokeLineShape(
              new Phaser.Geom.Line(px + TILE, py, px + TILE, py + TILE)
            ); // right
        } else {
          // Wall (invisible for collisions)
          const wall = this.add.rectangle(
            px + TILE / 2,
            py + TILE / 2,
            TILE,
            TILE,
            0x000000,
            0
          );
          this.walls.add(wall);
        }
      }
    }

    // Spawn player
    outer: for (let y = 0; y < mazeMap.length; y++) {
      for (let x = 0; x < mazeMap[0].length; x++) {
        if (mazeMap[y][x] === 0) {
          this.player = this.physics.add.sprite(
            x * TILE + TILE / 2,
            y * TILE + TILE / 2,
            "player"
          );
          this.player.setCollideWorldBounds(true);
          break outer;
        }
      }
    }

    // Spawn ghosts
    const ghostKeys = ["ghost-one", "ghost-two", "ghost-three", "ghost-four"];
    ghostKeys.forEach((key) => {
      let gx = 0,
        gy = 0;
      do {
        gx = Phaser.Math.Between(0, mazeMap[0].length - 1);
        gy = Phaser.Math.Between(0, mazeMap.length - 1);
      } while (mazeMap[gy][gx] !== 0);
      const ghost = this.physics.add.sprite(
        gx * TILE + TILE / 2,
        gy * TILE + TILE / 2,
        key
      );
      ghost.setData("dir", Phaser.Math.Between(0, 3));
      this.ghosts.push(ghost);
    });

    // Collisions
    this.physics.add.collider(this.player, this.walls);
    this.ghosts.forEach((ghost) => {
      this.physics.add.overlap(
        this.player,
        ghost,
        this.hitGhost,
        undefined,
        this
      );
    });

    this.livesText = this.add.text(16, 16, `Lives: ${this.lives}`, {
      fontSize: "24px",
      color: "#fff",
    });

}

hitGhost(
player: Phaser.GameObjects.GameObject,
ghost: Phaser.GameObjects.GameObject
) {
this.lives--;
this.livesText.setText(`Lives: ${this.lives}`);
if (this.lives <= 0) {
this.scene.restart();
this.lives = MAX_LIVES;
} else {
outer: for (let y = 0; y < mazeMap.length; y++) {
for (let x = 0; x < mazeMap[0].length; x++) {
if (mazeMap[y][x] === 0) {
this.player.setPosition(x _ TILE + TILE / 2, y _ TILE + TILE / 2);
break outer;
}
}
}
}
}

update() {
// Player movement
this.player.setVelocity(0);
if (this.cursors.left?.isDown) this.player.setVelocityX(-SPEED);
else if (this.cursors.right?.isDown) this.player.setVelocityX(SPEED);
if (this.cursors.up?.isDown) this.player.setVelocityY(-SPEED);
else if (this.cursors.down?.isDown) this.player.setVelocityY(SPEED);

    // Ghost movement
    this.ghosts.forEach((ghost) => {
      const gx = Math.floor(ghost.x / TILE);
      const gy = Math.floor(ghost.y / TILE);

      let dir = ghost.getData("dir");

      // Check if next tile in current direction is blocked
      const blocked = () => {
        switch (dir) {
          case 0:
            return mazeMap[gy][gx + 1] === 1; // right
          case 1:
            return mazeMap[gy][gx - 1] === 1; // left
          case 2:
            return mazeMap[gy + 1][gx] === 1; // down
          case 3:
            return mazeMap[gy - 1][gx] === 1; // up
          default:
            return true;
        }
      };

      if (
        blocked() ||
        (Math.abs((ghost.x % TILE) - TILE / 2) < 2 &&
          Math.abs((ghost.y % TILE) - TILE / 2) < 2)
      ) {
        // Pick a new random valid direction
        const dirs: number[] = [];
        if (mazeMap[gy][gx + 1] === 0) dirs.push(0);
        if (mazeMap[gy][gx - 1] === 0) dirs.push(1);
        if (mazeMap[gy + 1][gx] === 0) dirs.push(2);
        if (mazeMap[gy - 1][gx] === 0) dirs.push(3);

        dir = Phaser.Utils.Array.GetRandom(dirs);
        ghost.setData("dir", dir);

        // Snap to center to avoid clipping
        ghost.setPosition(gx * TILE + TILE / 2, gy * TILE + TILE / 2);
      }

      // Move ghosts
      switch (dir) {
        case 0:
          ghost.setVelocity(SPEED, 0);
          break;
        case 1:
          ghost.setVelocity(-SPEED, 0);
          break;
        case 2:
          ghost.setVelocity(0, SPEED);
          break;
        case 3:
          ghost.setVelocity(0, -SPEED);
          break;
      }
    });

}
}

const Game = () => {
const gameRef = useRef<HTMLDivElement>(null);
const phasergameref = useRef<Phaser.Game | null>(null);

useEffect(() => {
if (gameRef.current && !phasergameref.current) {
const width = gameRef.current.clientWidth;
const height = gameRef.current.clientHeight;

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width,
        height,
        parent: gameRef.current,
        physics: {
          default: "arcade",
          arcade: { debug: false, gravity: { x: 0, y: 0 } },
        },
        scene: MainScene,
        backgroundColor: "#000000",
        transparent: true,
      };

      phasergameref.current = new Phaser.Game(config);
    }

    return () => {
      if (phasergameref.current) {
        phasergameref.current.destroy(true);
        phasergameref.current = null;
      }
    };

}, []);

return <GameWrapper ref={gameRef} />;
};

export default Game;
