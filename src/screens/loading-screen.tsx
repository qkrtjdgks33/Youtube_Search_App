// 📄 LoadingScreen 컴포넌트 - 로그인 전 로딩 중 표시되는 애니메이션 화면입니다.
import styled, { keyframes } from "styled-components";

const Container = styled.div`  // 🎨 styled-components 스타일 정의
  height: 100vh;
  background-color: rgb(0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
`;

// animation : transition(시작-끝)/속도/+효과
const BounceAnim = keyframes`
    0%{transform: scale(1);}
    50%{transform: scale(1.5);}
    100%{transform: scale(1);}
`;
// dot
const Dot = styled.div`  // 🎨 styled-components 스타일 정의
  background-color: white;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin: 0px 4px;
  animation: ${BounceAnim} 1s infinite ease-in-out;
  &:nth-child(1) {
    animation-delay: 0s;
  }
  &:nth-child(2) {
    animation-delay: 0.25s;
  }
  &:nth-child(3) {
    animation-delay: 0.5s;
  }
`;

export default () => {
  return (  // 🔚 컴포넌트의 JSX 반환 시작
    <Container>
      <Dot />
      <Dot />
      <Dot />
    </Container>
  );
};