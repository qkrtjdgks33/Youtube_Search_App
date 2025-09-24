// 📄 이메일 회원가입 버튼 컴포넌트 - 이메일 계정으로 가입 처리합니다.
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Button = styled.div`
  // 🎨 styled-components 스타일 정의
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #6366f1;
  padding: 6px 32px; // ✅ 세로로 더 두껍게
  border-radius: 24px; // ✅ 더 둥글게
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4f46e5; // ✅ 살짝 어두운 보라 (hover 효과)
  }
`;

const Title = styled.p`
  // 🎨 styled-components 스타일 정의
`;

export default () => {
  // navigate Hook
  const navigation = useNavigate();

  // 회원가입 페이지로 이동하는 함수
  const onClick = () => {
    navigation("/signup");
  };

  return (
    // 🔚 컴포넌트의 JSX 반환 시작
    <Button onClick={onClick}>
      <Title>이메일로 가입하기</Title>
    </Button>
  );
};
