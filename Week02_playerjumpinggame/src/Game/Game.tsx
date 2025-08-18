import { useEffect, useRef, useState } from "react";
import { Footer, GameWrapper, Header } from "./Game.style";
import Phaser from "phaser";

class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private setScore!: React.Dispatch<React.SetStateAction<number>>;

  constructor(setScore: React.Dispatch<React.SetStateAction<number>>) {
    super("MainScene");
    this.setScore = setScore;
  }

  preload() {
    this.load.image("sky", "https://labs.phaser.io/assets/skies/space3.png");
    this.load.image(
      "ground",
      "https://labs.phaser.io/assets/sprites/platform.png"
    );
    this.load.spritesheet(
      "dude",
      "https://labs.phaser.io/assets/sprites/dude.png",
      {
        frameWidth: 32,
        frameHeight: 48,
      }
    );
  }

  create() {
    // Stretch background to fill parent
    const { width, height } = this.scale;
    this.add
      .image(width / 2, height / 2, "sky")
      .setDisplaySize(width, height)
      .setDepth(-1);

    // Platforms
    const platforms = this.physics.add.staticGroup();
    for (let i = 0; i <= width; i += 320) {
      platforms
        .create(i, height - 20, "ground")
        .setOrigin(0, 0.5)
        .refreshBody();
    }

    // Player
    this.player = this.physics.add.sprite(80, height - 100, "dude");
    this.player.setBounce(0.1).setCollideWorldBounds(true);
    this.physics.add.collider(this.player, platforms);

    // Animations
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (!this.player || !this.cursors) return;

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      if (this.player.anims.exists("turn")) {
        this.player.anims.play("turn");
      }
    }

    // Jump
    if (this.cursors.up.isDown && this.player.body.blocked.down) {
      this.player.setVelocityY(-500);
    }
  }
}

const Game = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phasergameRef = useRef<Phaser.Game | null>(null);

  const [score, setscore] = useState(0);
  const [lives, setlives] = useState(3);

  useEffect(() => {
    if (gameRef.current && !phasergameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: gameRef.current,
        width: gameRef.current.clientWidth,
        height: gameRef.current.clientHeight,
        backgroundColor: "black",
        physics: {
          default: "arcade",
          arcade: { gravity: { y: 1000 }, debug: false },
        },
        scene: new MainScene(setscore),
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      };
      phasergameRef.current = new Phaser.Game(config);
    }

    return () => {
      if (phasergameRef.current) {
        phasergameRef.current.destroy(true);
        phasergameRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <Header>Score: {score}</Header>
      <GameWrapper ref={gameRef} />
      <Footer>Lives: {lives}</Footer>
    </>
  );
};

export { Game };
