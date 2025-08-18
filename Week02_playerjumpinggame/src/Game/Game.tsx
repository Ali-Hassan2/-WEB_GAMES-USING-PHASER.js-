import { useEffect, useRef } from "react";
import { Footer, GameWrapper, Header } from "./Game.style";

const Game = () => {
  return (
    <>
      <Header>Score: </Header>
      <GameWrapper></GameWrapper>
      <Footer>Lives: </Footer>
    </>
  );
};

export { Game };
