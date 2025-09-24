// 📄 Signin 화면 - 이메일 및 비밀번호 기반 로그인 기능을 제공합니다.
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import styled from "styled-components";
import { auth } from "../firebaseConfig";
import { FirebaseError } from "firebase/app";
import { useNavigate } from "react-router-dom";
import EmailSignUpButton from "../components/EmailSignUpButton";
import GoogleSignUpButton from "../components/GoogleSignUpButton";

const Container = styled.div`
  // 🎨 styled-components 스타일 정의
  background-color: rgb(0, 0, 0, 0.5);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-items: center;
  justify-items: center;
  width: 100%;
  height: 100vh;
  padding: 30px;
  z-index: 2;
  @media (max-width: 500px) {
    display: flex;
    flex-direction: column;
  }
`;

const Title = styled.h1`
  // 🎨 styled-components 스타일 정의
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const LogoImg = styled.img`
  // 🎨 styled-components 스타일 정의
  width: 100%;
  max-width: 350px;
  height: auto;
`;

const Form = styled.form`
  // 🎨 styled-components 스타일 정의
  margin-top: 30px;
  gap: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center; // 상하 중앙 정렬
  align-items: center; // 좌우 중앙 정렬
  height: 100%; // 부모 높이를 상속받아 전체를 사용
`;

// 추가: 구글 버튼을 감싸는 새로운 styled-component
// GoogleButtonWrapper 부분만 수정
const GoogleButtonWrapper = styled.div`
  button {
    width: 250px;
    height: 50px;
    font-size: 16px;
    transition: background-color 0.3s ease; // 부드러운 전환 효과 추가

    &:hover {
      background-color: #4285f4; // 호버 시 배경색 변경
    }
  }
`;

const YoutubeBackground = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 1,
      overflow: "hidden",
      pointerEvents: "none",
    }}
  >
    <video
      src="https://sonacstudio.kro.kr/loop_login/login.mp4"
      autoPlay
      loop
      muted
      playsInline
      style={{
        width: "100vw",
        height: "100vh",
        objectFit: "cover",
      }}
    />
  </div>
);

export default () => {
  const navi = useNavigate();

  return (
    <>
      <YoutubeBackground />
      <Container>
        <LogoImg src={`${process.env.PUBLIC_URL}/LOOP_LOGO.png`} />
        <Form>
          <Title>음악으로 소통하는 공간</Title>
          <GoogleButtonWrapper>
            <GoogleSignUpButton showPlaylists={false} />
          </GoogleButtonWrapper>
        </Form>
      </Container>
    </>
  );
};

interface errorMsgGroupType {
  [key: string]: string;
}

const errorMsgGroup: errorMsgGroupType = {
  "auth/email-already-in-use": "이미 존재하는 계정입니다.",
  "auth/weak-password": "비밀번호를 6자리 이상 입력해주세요",
  "auth/invalid-email": "잘못된 이메일 혹은 비밀번호입니다.",
  "auth/invalid-credential": "잘못된 회원 정보입니다.",
};
