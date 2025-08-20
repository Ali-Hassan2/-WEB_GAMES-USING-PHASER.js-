import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { GameWrapper } from "./Game.styels";

class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private Coins!: Phaser.Physics.Arcade.Group;
  private Cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private ScoreText!: Phaser.GameObjects.Text;
  private score = 0;
  private coinSound!: Phaser.Sound.BaseSound;

  constructor() {
    super("MainScene");
  }

  preload() {
    this.load.image(
      "background",
      "https://labs.phaser.io/assets/skies/space3.png"
    );
    this.load.image(
      "player",
      "https://labs.phaser.io/assets/sprites/phaser-dude.png"
    );
    this.load.image("coin", "https://labs.phaser.io/assets/sprites/gold_1.png");
    this.load.audio(
      "coinSound",
      "https://labs.phaser.io/assets/audio/SoundEffects/p-ping.mp3"
    );
  }

  create() {
    this.coinSound = this.sound.add("coinSound");
    this.add.image(400, 300, "background");
    this.player = this.physics.add.sprite(400, 300, "player");
    this.player.setCollideWorldBounds(true);
    this.Coins = this.physics.add.group({
      key: "coin",
      repeat: 100,
      setXY: { x: 40, y: 40, stepX: 70 },
    });

    this.ScoreText = this.add
      .text(16, 16, "Score: 0", {
        fontSize: "2vw",
        color: "#ffffff",
      })
      .setScrollFactor(0);
      
    this.Cursors = this.input.keyboard?.createCursorKeys();

    this.physics.add.overlap(
      this.player,
      this.Coins,
      this.collection,
      undefined,
      this
    );
  }

  update() {
    this.player.setVelocity(0);
    const speed = 500;
    if (this.Cursors.left?.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.Cursors.right?.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.Cursors.up?.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.Cursors.down?.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }

  private collection(
    player: Phaser.GameObjects.GameObject,
    coin: Phaser.GameObjects.GameObject
  ) {
    const c = coin as Phaser.Physics.Arcade.Image;
    c.disableBody(true, true);
    this.score += 10;
    this.ScoreText.setText(`Score: ${this.score}`);
    this.coinSound.play();
  }
}

const Game = (React.FC = () => {
  const gameref = useRef<HTMLDivElement>(null);
  const phasergameRef = useRef<Phaser.Game | null>(null);
  useEffect(() => {
    if (gameref.current && !phasergameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: gameref.current.id,
        physics: {
          default: "arcade",
          arcade: { debug: false },
        },
        scene: MainScene,
        backgroundColor: "black",
      };

      phasergameRef.current = new Phaser.Game(config);
    }

    return () => {
      if (phasergameRef.current) {
        phasergameRef.current.destroy(1);
        phasergameRef.current = null;
      }
    };
  }, []);

  return <GameWrapper id="phase-container" ref={gameref} />;
});

export { Game };
