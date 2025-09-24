// src/screens/ProfileSettings.tsx
import React from "react";
import { auth } from "../../firebaseConfig";
import { useProfileFunctions } from "../../components/ProfileFunction";
import { useTheme } from "../../components/ThemeContext";
import styled from "styled-components";

// -------------------- styled-components --------------------
const Container = styled.div<{ $isDark: boolean }>`
  background: ${(props) => (props.$isDark ? "#000000" : "#ffffff")};
  color: ${(props) => (props.$isDark ? "#ffffff" : "#1a1a1a")};
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  padding: 24px;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  gap: 24px;
`;

const Card = styled.div<{ $isDark: boolean }>`
  background: ${(props) => (props.$isDark ? "#202020" : "#ffffff")};
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid ${(props) => (props.$isDark ? "#404040" : "#f0f0f0")};
`;

const CardTitle = styled.h2<{ $isDark: boolean }>`
  margin: 0 0 16px;
  color: ${(props) => (props.$isDark ? "#ffffff" : "#1a1a1a")};
  font-size: 22px;
  font-weight: 700;
`;

const Label = styled.label<{ $isDark: boolean }>`
  font-size: 15px;
  font-weight: 600;
  color: ${(props) => (props.$isDark ? "#ffffff" : "#1a1a1a")};
  margin-bottom: 8px;
  display: block;
`;

const Input = styled.input<{ $isDark: boolean }>`
  width: 100%;
  padding: 14px;
  border: 2px solid ${(props) => (props.$isDark ? "#404040" : "#f0f0f0")};
  border-radius: 12px;
  font-size: 15px;
  margin-bottom: 16px;
  background: ${(props) => (props.$isDark ? "#303030" : "#fafafa")};
  color: ${(props) => (props.$isDark ? "#ffffff" : "#1a1a1a")};
`;

const Textarea = styled.textarea<{ $isDark: boolean }>`
  width: 100%;
  padding: 14px;
  border: 2px solid ${(props) => (props.$isDark ? "#404040" : "#f0f0f0")};
  border-radius: 12px;
  font-size: 15px;
  margin-bottom: 16px;
  background: ${(props) => (props.$isDark ? "#303030" : "#fafafa")};
  color: ${(props) => (props.$isDark ? "#ffffff" : "#1a1a1a")};
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  border: none;
`;

const SaveButton = styled(Button)`
  background: linear-gradient(135deg, #007aff 0%, #0051d0 100%);
  color: white;
`;

const CancelButton = styled(Button)<{ $isDark: boolean }>`
  background: ${(props) => (props.$isDark ? "#404040" : "#f8f9fa")};
  color: ${(props) => (props.$isDark ? "#cccccc" : "#6c757d")};
  border: 1px solid ${(props) => (props.$isDark ? "#606060" : "#e9ecef")};
`;

// -------------------- 컴포넌트 --------------------
const ProfileSettings = () => {
  const { isDarkMode } = useTheme();
  const {
    profile,
    handleChange,
    handleSubmit,
    handleBackToEdit,
    fileInputRef,
    handleFileChange,
    handleUploadButtonClick,
    hoverPhoto,
    setHoverPhoto,
  } = useProfileFunctions();

  return (
    <Container $isDark={isDarkMode}>
      <ContentArea>
        <Card $isDark={isDarkMode}>
          <CardTitle $isDark={isDarkMode}>프로필 편집</CardTitle>

          {/* 프로필 사진 */}
          <div
            style={{
              width: "120px",
              height: "120px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              overflow: "hidden",
              position: "relative",
              cursor: "pointer",
              border: `4px solid ${isDarkMode ? "#404040" : "#f8f9fa"}`,
            }}
            onClick={handleUploadButtonClick}
            onMouseEnter={() => setHoverPhoto(true)}
            onMouseLeave={() => setHoverPhoto(false)}
          >
            <img
              src={
                profile.photoUrl === ""
                  ? auth.currentUser?.photoURL ||
                    "https://via.placeholder.com/150"
                  : profile.photoUrl
              }
              alt="프로필 사진"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {hoverPhoto && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "600",
                }}
              >
                📷 사진 변경
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept="image/*"
          />

          {/* 프로필 수정 입력 */}
          <form onSubmit={handleSubmit}>
            <Label $isDark={isDarkMode}>이름</Label>
            <Input
              $isDark={isDarkMode}
              name="name"
              value={profile.name}
              onChange={handleChange}
            />

            <Label $isDark={isDarkMode}>이메일</Label>
            <Input
              $isDark={isDarkMode}
              name="email"
              value={profile.email}
              onChange={handleChange}
            />

            <Label $isDark={isDarkMode}>소개</Label>
            <Textarea
              $isDark={isDarkMode}
              name="bio"
              value={profile.bio}
              onChange={handleChange}
            />

            <Label $isDark={isDarkMode}>위치</Label>
            <Input
              $isDark={isDarkMode}
              name="location"
              value={profile.location}
              onChange={handleChange}
            />

            <ButtonRow>
              <CancelButton
                $isDark={isDarkMode}
                type="button"
                onClick={handleBackToEdit}
              >
                취소
              </CancelButton>
              <SaveButton type="submit">저장</SaveButton>
            </ButtonRow>
          </form>
        </Card>
      </ContentArea>
    </Container>
  );
};

export default ProfileSettings;
