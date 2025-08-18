import styled from "styled-components";

// GameWrapper: game ka main container, center align aur full viewport size
export const GameWrapper = styled.div`
  display: flex; // flex layout
  flex-direction: column; // vertical stacking: Header, Game Canvas, Footer
  align-items: center; // horizontally center
  justify-content: center; // vertically center
  height: 100vh; // full viewport height
  background-color: #222; // dark background
`;

// Header: upar score dikhayega
export const Header = styled.div`
  width: 100%;
  padding: 10px 20px;
  background-color: #333;
  color: #fff;
  font-size: 20px;
  display: flex;
  justify-content: space-between; // left aur right spacing
`;

// Footer: niche lives dikhayega
export const Footer = styled.div`
  width: 100%;
  padding: 10px 20px;
  background-color: #333;
  color: #fff;
  font-size: 18px;
  display: flex;
  justify-content: center; // center me lives show
`;
