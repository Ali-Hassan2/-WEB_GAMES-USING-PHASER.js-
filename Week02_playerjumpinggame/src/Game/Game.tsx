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

    
  }
}

const Game = () => {
  const gameref = useRef<HTMLDivElement>(null);
  const phasergameref = useRef<Phaser.Game | null>(null);
  const [score, setscore] = useState<number>(0);
  const [lives, setlives] = useState<number>(3);

  useEffect(() => {
    if (gameref.current && !phasergameref.current) {
      const width = gameref.current.clientWidth;
      const height = gameref.current.clientHeight;
      phasergameref.current = new Phaser.Game({
        type: Phaser.AUTO,
        width,
        height,
        parent: gameref.current,
        backgroundColor: "black",
        physics: {
          default: "arcade",
          arcade: { gravity: { y: 1000 }, debug: false },
        },
        scene: new MainScene(setscore),
      });
    }
  }, []);
  return (
    <>
      <Header>Score: </Header>
      <GameWrapper ref={gameref} />
      <Footer>Lives: </Footer>
    </>
  );
};

export { Game };
