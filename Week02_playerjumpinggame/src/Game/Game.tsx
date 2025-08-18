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

    this.player = this.add.sprite(80, 460, "dude");
    this.player.setBounce(0.4).setCollideWorldBounds(true);

    this.physics.collide(this.player, platfroms);
    //adding animations
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
