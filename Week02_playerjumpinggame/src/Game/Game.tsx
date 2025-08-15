import { useRef, useEffect } from "react";
import Phaser from "phaser";


class Platfrom extendes Phaser.Scene{}

const Game: React.FC = () => {

  const gamref = useRef<HTMLDivElement>(null);
  const PhaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(()=>{
    if(gameref && !PhaserGameRef.current){
      
    }
  },[])
  return (
    <>
      <div></div>
    </>
  );
};

export { Game };
