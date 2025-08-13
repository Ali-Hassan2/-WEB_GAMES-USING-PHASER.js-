import { useRef, useEffect } from "react";
import Phaser from "phaser";
import { GameWrapper } from "./Game.style";

class PlatformScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private jumpSound!: Phaser.Sound.BaseSound;

  constructor() {
    super("PlatformScene");
  }

  preload() {
    this.load.image("sky", "https://labs.phaser.io/assets/skies/sky4.png");
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
    this.load.audio(
      "jump",
      "https://labs.phaser.io/assets/audio/SoundEffects/jump.mp3"
    );
  }

  create() {
    // Background
    this.add.image(500, 450, "sky").setDisplaySize(1000, 900);

    // Platforms
    const platforms = this.physics.add.staticGroup();
    platforms.create(500, 880, "ground").setScale(3).refreshBody();
    platforms.create(600, 700, "ground");
    platforms.create(50, 500, "ground");
    platforms.create(750, 350, "ground");

    // Player
    this.player = this.physics.add.sprite(100, 750, "dude");
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

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

    // Collisions
    this.physics.add.collider(this.player, platforms);

    // Keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.addCapture(["UP", "DOWN", "LEFT", "RIGHT", "SPACE"]);

    // Pointer click jump
    this.input.on("pointerdown", () => {
      if (this.player.body.touching.down) {
        this.player.setVelocityY(-450);
        this.jumpSound.play();
      }
    });

    // Audio
    this.jumpSound = this.sound.add("jump");

    // Force focus on canvas
    const canvas = this.game.canvas;
    canvas.setAttribute("tabindex", "0");
    canvas.focus();
  }

  update() {
    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
    } else if (this.cursors.right?.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    if (this.cursors.up?.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-450);
      this.jumpSound.play();
    }
  }
}

const Game = () => {
  const gameref = useRef<HTMLDivElement>(null);
  const phasergameref = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameref.current && !phasergameref.current) {
      gameref.current.id = "phaser-container";

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 1900,
        height: 900,
        parent: "phaser-container",
        physics: {
          default: "arcade",
          arcade: { gravity: { y: 500 }, debug: false },
        },
        scene: PlatformScene,
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

  return <GameWrapper ref={gameref} />;
};

export { Game };
