import React from "react";
import { ContainerCom } from "./Game.style";
import Header from "./Header";
import Footer from "./Footer";
import Game from "./Game";

const Container = () => {
  return (
    <ContainerCom>
      <Header />
      <Game />
      <Footer />
    </ContainerCom>
  );
};

export default Container;
