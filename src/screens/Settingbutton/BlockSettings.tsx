// src/screens/Settingbutton/BlockSettings.tsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useRelations } from "../../components/RelationsContext";
import { db, auth } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useTheme } from "../../components/ThemeContext";

interface ProfileData {
  uid: string;
  name: string;
  photoUrl: string;
}

const Container = styled.div<{ $isDark: boolean }>`
  background: ${(props) => (props.$isDark ? "#000000" : "#ffffff")};
  color: ${(props) => (props.$isDark ? "#ffffff" : "#1a1a1a")};
  min-height: 100vh;
  padding: 24px;
  transition: all 0.3s ease;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
`;

const UserItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  background: ${(props) => (props.$isDark ? "#202020" : "#f9f9f9")};
  border: 1px solid ${(props) => (props.$isDark ? "#404040" : "#e0e0e0")};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const UnblockButton = styled.button`
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  background: #ff4d4f;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #d9363e;
    transform: translateY(-2px);
  }
`;

const BlockSettings: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { unmute, loading } = useRelations();
  const [blockedUsers, setBlockedUsers] = useState<ProfileData[]>([]);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      const me = auth.currentUser?.uid;
      if (!me) return;

      const ref = doc(db, "user_relations", me);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        const mutedUids: string[] = data.muted || [];

        const users = await Promise.all(
          mutedUids.map(async (uid) => {
            const userSnap = await getDoc(doc(db, "profiles", uid));
            if (userSnap.exists()) {
              const u = userSnap.data();
              return {
                uid,
                name: u.name || "알 수 없음",
                photoUrl:
                  u.photoUrl || "https://via.placeholder.com/100?text=No+Image",
              };
            }
            return null;
          })
        );

        setBlockedUsers(users.filter(Boolean) as ProfileData[]);
      }
    };

    fetchBlockedUsers();
  }, [loading]);

  const handleUnblock = async (uid: string) => {
    await unmute(uid);
    setBlockedUsers((prev) => prev.filter((u) => u.uid !== uid));
  };

  return (
    <Container $isDark={isDarkMode}>
      <Title>차단된 사용자</Title>
      {blockedUsers.length === 0 ? (
        <p>현재 차단한 사용자가 없습니다.</p>
      ) : (
        blockedUsers.map((user) => (
          <UserItem key={user.uid} $isDark={isDarkMode}>
            <UserInfo>
              <Avatar src={user.photoUrl} alt={user.name} />
              <span>{user.name}</span>
            </UserInfo>
            <UnblockButton onClick={() => handleUnblock(user.uid)}>
              차단 해제
            </UnblockButton>
          </UserItem>
        ))
      )}
    </Container>
  );
};

export default BlockSettings;
