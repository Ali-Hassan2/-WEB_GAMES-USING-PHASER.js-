import { useEffect, useRef, useState } from "react";
import { Footer, GameWrapper, Header } from "./Game.style";

const Game = () => {
  const { gameref } = useRef<HTMLDivElement>(null);
  const { phasergameref } = useRef<Phaser.Game>(null);
  const [score, setscore] = useState<number>(0);
  const [lives, setlives] = useState<number>(3);


  useEffect(() => {

    if(gameref && !phasergameref){
      
    }
  }, []);
  return (
    <>
      <Header>Score: </Header>
      <GameWrapper></GameWrapper>
      <Footer>Lives: </Footer>
    </>
  );
};

export { Game };
