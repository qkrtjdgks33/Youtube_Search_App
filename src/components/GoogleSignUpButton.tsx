// 📄 Google 로그인 버튼 컴포넌트 - 구글 OAuth로 회원가입 처리합니다.
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { auth } from "../firebaseConfig";
import { FirebaseError } from "firebase/app";
import { useState, useEffect } from "react";

const Button = styled.div`
  // 🎨 styled-components 스타일 정의
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  background-color: #ffffff;
  color: black;
  padding: 10px 10px;
  border-radius: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease; // 부드러운 전환 효과 추가

  &:hover {
    background-color: #c9c9c9; // 호버 시 배경색 변경
  }
`;
const Title = styled.p``; // 🎨 styled-components 스타일 정의
const Icon = styled.img`
  // 🎨 styled-components 스타일 정의
  width: 12px;
  height: 12px;
`;

export default ({ showPlaylists = false }: { showPlaylists?: boolean }) => {
  const navigation = useNavigate();
  const [playlists, setPlaylists] = useState<any[]>([]); // 재생목록 저장

  const onClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/youtube.readonly");

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (token) {
        localStorage.setItem("ytAccessToken", token);
        console.log("Access Token 저장됨:", token);
      }

      navigation("/");
    } catch (e) {
      if (e instanceof FirebaseError) {
        alert(e.message);
      }
    }
  };

  useEffect(() => {
    // 🔁 컴포넌트 마운트 시 실행되는 훅
    const token = localStorage.getItem("ytAccessToken");
    if (!token) return;

    const fetchPlaylists = async () => {
      try {
        const response = await fetch(
          "https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=10",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        const data = await response.json();
        console.log("내 유튜브 재생목록:", data);
        setPlaylists(data.items || []);
      } catch (error) {
        console.error("YouTube API 호출 실패:", error);
      }
    };

    fetchPlaylists();
  }, []);

  return (
    // 🔚 컴포넌트의 JSX 반환 시작
    <div>
      <Button onClick={onClick}>
        <Icon src={`${process.env.PUBLIC_URL}/google-icon.png`} />
        <Title>Google 계정으로 로그인하기</Title>
      </Button>

      {showPlaylists && playlists.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>내 유튜브 재생목록</h3>
          <ul>
            {playlists.map((playlist) => (
              <li key={playlist.id}>{playlist.snippet.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
