import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { GameWrapper, Header, Footer } from "./Game.style";
import tile from "../assets/tile.png";
import mazemap from "../assets/mazemap.json";

class MainScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private coins!: Phaser.Physics.Arcade.Group;
  private setScore!: React.Dispatch<React.SetStateAction<number>>;
  private setLives!: React.Dispatch<React.SetStateAction<number>>;
  private score: number = 0;
  private lives: number = 3;

  constructor(
    setScore: React.Dispatch<React.SetStateAction<number>>,
    setLives: React.Dispatch<React.SetStateAction<number>>
  ) {
    super({ key: "MainScene" });
    this.setScore = setScore;
    this.setLives = setLives;
  }

  preload() {
    this.load.image("tiles", tile);
    this.load.tilemapTiledJSON("map", mazemap);
    this.load.spritesheet(
      "player",
      "https://labs.phaser.io/assets/sprites/phaser-dude.png",
      { frameWidth: 32, frameHeight: 48 }
    );
    this.load.image("coin", "https://labs.phaser.io/assets/sprites/coin.png"); // coin image
  }

  create() {
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("tileset", "tiles");
    const worldLayer = map.createLayer("World", tileset, 0, 0);

    // Walls collision
    worldLayer.setCollisionBetween(1, 1000);

    // Player
    this.player = this.physics.add.sprite(50, 50, "player");
    this.player.setScale(0.6);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, worldLayer);

    // Coins individually
    const data = map.layers[0].data as any[];
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tileIndex = data[y][x].index;

        // Only floor tiles
        if ((tileIndex === -1 || tileIndex === 0) && Math.random() > 0.85) {
          const coin = this.physics.add.sprite(
            x * 32 + 16,
            y * 32 + 16,
            "coin"
          );
          coin.setScale(0.5);
          coin.body.setAllowGravity(false);
          coin.body.setImmovable(true);

          // Tween for spinning effect
          this.tweens.add({
            targets: coin,
            angle: 360,
            duration: 2000,
            repeat: -1,
          });

          // Coin overlap with player
          this.physics.add.overlap(
            this.player,
            coin,
            (player, c) => {
              (c as Phaser.GameObjects.GameObject).destroy();
              this.score += 10;
              this.setScore(this.score);
            },
            undefined,
            this
          );
        }
      }
    }

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  update() {
    if (!this.cursors) return;

    const speed = 150;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    this.setLives(this.lives);
  }
}

const Game: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 0 }, debug: false }, // ✅ gravity OFF
      },
      scene: new MainScene(setScore, setLives),
      parent: gameRef.current!,
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <GameWrapper>
      <Header>Score: {score}</Header>
      <div ref={gameRef} />
      <Footer>Lives: {lives}</Footer>
    </GameWrapper>
  );
};

export { Game };
