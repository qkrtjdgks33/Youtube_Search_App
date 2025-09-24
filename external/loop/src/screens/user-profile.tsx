// src/screens/user-profile.tsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { useTheme } from "../components/ThemeContext";
import { useRelations } from "../components/RelationsContext";

const Container = styled.div<{ $isDark: boolean }>`
  background: ${(p) => (p.$isDark ? "#000000" : "#ffffff")};
  color: ${(p) => (p.$isDark ? "#ffffff" : "#1a1a1a")};
  display: flex;
  justify-content: center;
  padding: 24px;
  min-height: calc(100vh - 70px);
`;

const Card = styled.div<{ $isDark: boolean }>`
  width: 100%;
  max-width: 800px;
  background: ${(p) => (p.$isDark ? "#202020" : "#ffffff")};
  border: 1px solid ${(p) => (p.$isDark ? "#404040" : "#f0f0f0")};
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding: 28px;
`;

const Header = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
`;

const Avatar = styled.img`
  width: 96px;
  height: 96px;
  border-radius: 20px;
  object-fit: cover;
  border: 4px solid rgba(0,0,0,0.06);
  background: #e9ecef;
`;

const Name = styled.h1<{ $isDark: boolean }>`
  margin: 0;
  font-size: 24px;
  color: ${(p) => (p.$isDark ? "#ffffff" : "#1a1a1a")};
`;

const Meta = styled.div<{ $isDark: boolean }>`
  color: ${(p) => (p.$isDark ? "#cccccc" : "#6c757d")};
  font-size: 14px;
  margin-top: 6px;
`;

const Section = styled.div`
  margin-top: 20px;
`;

const Label = styled.div<{ $isDark: boolean }>`
  font-size: 12px;
  font-weight: 700;
  color: ${(p) => (p.$isDark ? "#cccccc" : "#8e8e93")};
  text-transform: uppercase;
  letter-spacing: .5px;
  margin-bottom: 6px;
`;

const Value = styled.div<{ $isDark: boolean }>`
  font-size: 15px;
  color: ${(p) => (p.$isDark ? "#ffffff" : "#1a1a1a")};
  line-height: 1.5;
`;

const Empty = styled.span<{ $isDark: boolean }>`
  color: ${(p) => (p.$isDark ? "#888888" : "#c7c7cc")};
  font-style: italic;
`;

const BackBtn = styled.button<{ $isDark: boolean }>`
  margin-top: 24px;
  padding: 10px 14px;
  font-size: 14px;
  border-radius: 12px;
  border: 1px solid ${(p) => (p.$isDark ? "#555" : "#e9ecef")};
  background: ${(p) => (p.$isDark ? "#2a2a2a" : "#fafafa")};
  color: ${(p) => (p.$isDark ? "#fff" : "#1a1a1a")};
  cursor: pointer;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 12px;
`;

const ActionBtn = styled.button<{ $isDark: boolean; $primary?: boolean }>`
  padding: 10px 14px;
  font-size: 14px;
  border-radius: 12px;
  border: 1px solid ${(p) => (p.$isDark ? "#555" : "#e9ecef")};
  background: ${(p) =>
    p.$primary
      ? "linear-gradient(135deg, #007aff, #0051d0)"
      : p.$isDark
      ? "#2a2a2a"
      : "#fafafa"};
  color: ${(p) => (p.$primary ? "#fff" : p.$isDark ? "#fff" : "#1a1a1a")};
  cursor: pointer;
`;

type ProfileDoc = {
  name?: string;
  email?: string;
  photoUrl?: string;
  bio?: string;
  location?: string;
};

export default function UserProfileScreen() {
  const { isDarkMode } = useTheme();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const me = auth.currentUser?.uid || null;
  const { isFollowing, isMuted, follow, unfollow, mute, unmute } = useRelations();

  const [data, setData] = useState<ProfileDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        if (!uid) return;
        const snap = await getDoc(doc(db, "profiles", uid));
        setData(snap.exists() ? (snap.data() as ProfileDoc) : {});
      } catch (e) {
        console.error("프로필 로드 실패", e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [uid]);

  const avatarSrc =
    (data?.photoUrl && !data.photoUrl.includes("undefined") && data.photoUrl) ||
    "/default_profile.png";

  return (
    <Container $isDark={isDarkMode}>
      <Card $isDark={isDarkMode}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>불러오는 중...</div>
        ) : (
          <>
            <Header>
              <Avatar
                src={avatarSrc}
                alt="avatar"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/default_profile.png";
                }}
              />
              <div>
                <Name $isDark={isDarkMode}>{data?.name || "이름 미설정"}</Name>
                <Meta $isDark={isDarkMode}>
                  {data?.email || "이메일 미설정"}
                  {data?.location ? ` · ${data.location}` : ""}
                </Meta>

                {/* 내 프로필이 아닌 경우에만 버튼 노출 */}
                {uid && me && uid !== me && (
                  <ActionRow>
                    {isFollowing(uid) ? (
                      <ActionBtn $isDark={isDarkMode} $primary onClick={() => unfollow(uid)}>
                        팔로잉 취소
                      </ActionBtn>
                    ) : (
                      <ActionBtn $isDark={isDarkMode} $primary onClick={() => follow(uid)}>
                        팔로우
                      </ActionBtn>
                    )}

                    {isMuted(uid) ? (
                      <ActionBtn $isDark={isDarkMode} onClick={() => unmute(uid)}>
                        뮤트 해제
                      </ActionBtn>
                    ) : (
                      <ActionBtn $isDark={isDarkMode} onClick={() => mute(uid)}>
                        뮤트
                      </ActionBtn>
                    )}
                  </ActionRow>
                )}
              </div>
            </Header>

            <Section>
              <Label $isDark={isDarkMode}>소개</Label>
              <Value $isDark={isDarkMode}>
                {data?.bio ? data.bio : <Empty $isDark={isDarkMode}>소개 미입력</Empty>}
              </Value>
            </Section>

            <BackBtn $isDark={isDarkMode} onClick={() => navigate(-1)}>
              ← 돌아가기
            </BackBtn>
          </>
        )}
      </Card>
    </Container>
  );
}
