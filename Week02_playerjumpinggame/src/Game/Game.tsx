import Phaser, { Physics } from "phaser";
import { useRef, useEffect, useState } from "react";
import { GameWrapper, Header, Footer } from "./Game.style";

class MainScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private setscore: React.Dispatch<React.SetStateAction<number>>;

  constructor(setscore: React.Dispatch<React.SetStateAction<number>>) {
    super("MainScene");
    this.setscore = setscore;
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
    const { width, height } = this.scale;
    this.add
      .image(width / 2, height / 2, "sky")
      .setDisplaySize(width, height)
      .setDepth(-1);

    const platfroms = this.physics.add.staticGroup();
    for (let i = 0; i <= 950; i += 320) {
      platfroms
        .create(i, height - 40, "ground")
        .setOrigin(0, 0.5)
        .refreshBody();
    }

    this.player = this.physics.add.sprite(80, height - 100, "dude");
    this.player.setBounce(0.1).setCollideWorldBounds(true);
    this.physics.add.collider(this.player, platfroms);

    this.anims.create({
      key: "left",
      frame: this.anims.generateFrameNumbers("dude", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "turn",
      frames: [
        {
          key: "dude",
          frame: 4,
        },
      ],
      frameRate: 20,
    });
    this.anims.create({
      key: "right",
      anims: this.anims.generateFrameNames("dude", {
        start: 5,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.cursors = this.input.keyboard?.createCursorKeys();
  }

  update() {
    if (!this.player || !this.cursors) return;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.anims.play("left", true);
    }
    else if(this.cursors.right.isDown){
      this.player.setVelocity(200);
      this.player
    }
  }
}

const Game: React.FC = () => {
  const gameref = useRef<HTMLDivElement>(null);
  const phasergameRef = useRef<Phaser.Game | null>(null);
  const [Lives, setLives] = useState<number>(3);
  const [score, setscore] = useState<number>(0);

  useEffect(() => {
    const width = gameref.current?.clientWidth;
    const height = gameref.current?.clientHeight;
    if (gameref.current && !phasergameRef.current) {
      const config: Phaset.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        height,
        width,
        parent: gameref.current,
        physics: {
          default: "arcade",
          arcade: { gravity: { y: 1000 }, debug: false },
        },
        backgroundColor: "black",
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
        phasergameRef.current.destroy(1);
        phasergameRef.current = null;
      }
    };
  }, []);
  return (
    <>
      <Header>Score: {score}</Header>
      <GameWrapper ref={gameref} />
      <Footer>Lives: {Lives}</Footer>
    </>
  );
};

export { Game };
