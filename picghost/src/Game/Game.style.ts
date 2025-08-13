import styled from "styled-components";

const ContainerCom = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 1900px;
  height: 1200px;
  flex-direction: column;
`;
const HeaderCom = styled.div`
  width: 100%;
  height: 10%;
`;
const GameWrapper = styled.div`
  width: 100%;
  height: 80%;
`;

const FooterCom = styled.div`
  width: 100%;
  height: 10%;
`;

export { GameWrapper, HeaderCom, FooterCom, ContainerCom };
