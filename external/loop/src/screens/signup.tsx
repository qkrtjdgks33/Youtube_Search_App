// 📄 Signup 화면 - Firebase를 통한 회원가입을 처리합니다.
// Signup page를 구성
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";  // 🧾 Firebase 이메일 회원가입
import { useState } from "react";
import styled from "styled-components";
import { auth } from "../firebaseConfig";
import { FirebaseError } from "firebase/app";
import { error } from "console";
import { Link, useNavigate } from "react-router-dom";

const Container = styled.div`  // 🎨 styled-components 스타일 정의
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
  padding: 30px;
`;
const Title = styled.h1`  // 🎨 styled-components 스타일 정의
  font-size: 25px;
  font-weight: bold;
`;
// 로고 이미지
const LogoImg = styled.img`  // 🎨 styled-components 스타일 정의
  width: 300px;
  height: 150px;
`;

// Text 입력 필드 구역
const Form = styled.form`  // 🎨 styled-components 스타일 정의
  margin-top: 30px;
  gap: 10px;
  display: flex;
  flex-direction: column;
`;
// Text 입력칸
const Input = styled.input`  // 🎨 styled-components 스타일 정의
  border-radius: 5px;
  border: none;
  padding: 5px 20px;
  &::placeholder {
    font-size: 10px;
  }
  &[type="submit"] {
    cursor: pointer;
    margin-top: 20px;
  }
`;
const SubTitle = styled.p`  // 🎨 styled-components 스타일 정의
  font-size: 9px;
`;
// 회원가입 버튼 컴포넌트
const SignupBtn = styled.div`  // 🎨 styled-components 스타일 정의
  padding: 10px 20px;
  border-radius: 20px;
  background-color: #19315d;
  font-size: 10px;
  font-weight: 600;
  color: white;
  display: flex;
  justify-content: center;
  cursor: pointer;
  margin-top: 20px;
`;
const ErrorMsg = styled.div`  // 🎨 styled-components 스타일 정의
  display: flex;
  justify-content: center;
  margin: 5px 0px;
  color: tomato;
  font-size: 11px;
  font-weight: bold;
`;

// 로그인 페이지로 이동 안내
const Guide = styled.span`  // 🎨 styled-components 스타일 정의
  font-size: 10px;
  text-align: center;
  a {
    color: orange;
    margin-left: 5px;
  }
`;

export default () => {
  // 회원가입을 위한 Process 작성
  // Hook 생성 : 페이지 이동을 위한
  const navi = useNavigate();

  // A.입력한 회원 정보를 저장(State)공간 -- useState Hook
  const [nickName, setNickName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  // B.입력한 회원 정보를 가공/수정한다.
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // 2. 입력한 정보(입력값,입력위치)
    // const name = event.target.name; // 입력위치
    // const value = event.target.value;// 입력값
    const {
      target: { name, value },
    } = event;
    // 1. 입력한 정보를 분류(닉네임,이메일,비번)
    // Goal : 각각 정보를 State(닉네임,이메일,비번) 저장
    switch (name) {
      case "nickname":
        setNickName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
    }
  };
  // C.가입버튼을 누른 경우, 입력한 회원정보를 SERVER에 전달 > 회원가입처리한다.
  const onSubmit = async () => {
    console.log("가입하기 버튼 눌림");
    // A. 방어코드 -- ex)입력을 안한 경우..
    if (loading) return;
    if (nickName === "" || email === "" || password === "") {
      alert("회원 정보를 모두 입력해주세요");
    }
    // B. 회원가입 프로세스 진행
    try {
      // b-1. 로딩 start
      setLoading(true);
      // b-2. 회원정보(닉네임,이메일,암호)를 모아서 서버(Firebase)에 전달(API)
      // 잠깐만 기다려..! 가입완료될 때까지만!
      const credential = await createUserWithEmailAndPassword(  // 🧾 Firebase 이메일 회원가입
        auth,
        email,
        password
      );
      // b-2-1. 유저의 닉네임 UPDate
      await updateProfile(credential.user, {
        displayName: nickName,
      });
      // b-3. 서버에서.. 가입 진행..
      // b-4. 가입완료 > 1.로그인화면 or 2.자동로그인>ho*me
      navi("/");
    } catch (error) {
      // C. 예외적인 경우(Error) .. 중복계정,잘못된정보
      // c-0. 만일 Firebase 관련 Error인 경우에만
      if (error instanceof FirebaseError) {
        // c-1. 에러메시지 출력
        setError(error.code);
      }
    } finally {
      // D. 로딩 exit..
      setLoading(false);
      // always 에러가 나든 안나든 실행
    }
  };
  // Page Design Rndering (화면 디자인)
  return (  // 🔚 컴포넌트의 JSX 반환 시작
    <Container>
      <LogoImg src={`${process.env.PUBLIC_URL}/Sonac_Title.png`} />
      {/* <Title>회원 가입 하기</Title> */}
      <Form>
        <SubTitle>이름*</SubTitle>
        <Input
          name="nickname"
          onChange={onChange}
          type="text"
          placeholder="예) Daelim"
          value={nickName}
        />
        <SubTitle>이메일*</SubTitle>
        <Input
          name="email"
          onChange={onChange}
          type="email"
          placeholder="예) Daelim@daelim.ac.kr"
          value={email}
        />
        <SubTitle>비밀번호*</SubTitle>
        <Input
          name="password"
          onChange={onChange}
          type="password"
          placeholder="예) 6자리 이상 입력하세요"
          value={password}
        />
        <SignupBtn onClick={loading ? undefined : onSubmit}>
          {loading ? "로딩 중..." : "가입하기"}
        </SignupBtn>
        <ErrorMsg>{errorMsgGroup[error]}</ErrorMsg>
        <Guide>
          계정이 이미 있으신가요?
          <Link to={"/signin"}>로그인</Link>
        </Guide>
      </Form>
    </Container>
  );
};
// 1. 동일한 이메일
// 2. 비밀번호가 6자리 미만
// 3. 이메일,비번 잘못 입력
interface errorMsgGroupType {
  [key: string]: string;
}
const errorMsgGroup: errorMsgGroupType = {
  "auth/email-already-in-use": "이미 존재하는 계정입니다.",
  "auth/weak-password": "비밀번호를 6자리 이상 입력해주세요",
  "auth/invalid-email": "잘못된 이메일 혹은 비밀번호입니다.",
};