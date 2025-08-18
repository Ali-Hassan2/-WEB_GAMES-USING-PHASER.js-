import { useEffect, useRef, useState } from "react";
import { Footer, GameWrapper, Header } from "./Game.style";
import Phaser, { Scene } from "phaser";
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
    this.load.spritesheet(
      "coin",
      "https://labs.phaser.io/assets/sprites/coin.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
  }
  create() {
    this.add.image(480, 270, "sky").setAlpha(0.6);
    const platfroms = this.physics.add.staticGroup();

    for (let i = 0; i <= 960; i += 320) {
      platfroms.create(i, 520, "ground").setOrigin(0, 0.5).refreshBody();
    }

    this.player = this.physics.add.sprite(80, 460, "dude");
    this.player.setBounce(0.1).setCollideWorldBounds(true);

    this.physics.collide(this.player, platfroms);
    //adding animations

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "still",
      frame: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", {
        start: 5,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.cursors = this.input.keyboard?.createCursorKeys();
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocity(0);
      this.player.anims.play("turn");
    }
    if (this.cursors.up.isDown && this.player.body.touching.down) {
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
      const width = gameRef.current.clientWidth;
      const height = gameRef.current.clientHeight;
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width,
        height,
        physics: {
          default: "arcade",
          arcade: { gravity: { y: 1000 }, debug: false },
        },
        scene: new MainScene(setscore),
        parent: gameRef.current,
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
  return (
    <>
      <Header>Score: {score}</Header>
      <GameWrapper ref={gameRef} />
      <Footer>Lives: {lives} </Footer>
    </>
  );
};

export { Game };
