// Profile 화면 - 사용자 프로필을 수정하고 미리보기할 수 있는 화면
import React from "react";
import { auth } from "../firebaseConfig";
import { useProfileFunctions } from "../components/ProfileFunction";
import { useTheme } from "../components/ThemeContext";
import styled from "styled-components";

const Container = styled.div<{ $isDark: boolean }>`
  background: ${(props) => (props.$isDark ? "#000000" : "#ffffff")};
  color: ${(props) => (props.$isDark ? "#ffffff" : "#1a1a1a")};
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  padding: 24px;
  transition: all 0.3s ease;
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
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const CardTitle = styled.h2<{ $isDark: boolean }>`
  margin: 0;
  color: ${(props) => (props.$isDark ? "#ffffff" : "#1a1a1a")};
  font-size: 24px;
  font-weight: 700;
`;

const ThemeToggle = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${(props) => (props.$isDark ? "#404040" : "#f8f9fa")};
  border: 1px solid ${(props) => (props.$isDark ? "#606060" : "#e9ecef")};
  border-radius: 25px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${(props) => (props.$isDark ? "#ffffff" : "#6c757d")};
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: ${(props) => (props.$isDark ? "#505050" : "#e9ecef")};
    transform: translateY(-1px);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const PreviewCard = styled(Card)`
  margin-bottom: 0;
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
  padding: 16px;
  border: 2px solid ${(props) => (props.$isDark ? "#404040" : "#f0f0f0")};
  border-radius: 12px;
  font-size: 15px;
  color: ${(props) => (props.$isDark ? "#ffffff" : "#1a1a1a")};
  background: ${(props) => (props.$isDark ? "#303030" : "#fafafa")};
  margin-bottom: 20px;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007aff;
    background: ${(props) => (props.$isDark ? "#404040" : "#ffffff")};
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }

  &::placeholder {
    color: ${(props) => (props.$isDark ? "#cccccc" : "#8e8e93")};
  }
`;

const Textarea = styled.textarea<{ $isDark: boolean }>`
  width: 100%;
  padding: 16px;
  border: 2px solid ${(props) => (props.$isDark ? "#404040" : "#f0f0f0")};
  border-radius: 12px;
  font-size: 15px;
  color: ${(props) => (props.$isDark ? "#ffffff" : "#1a1a1a")};
  background: ${(props) => (props.$isDark ? "#303030" : "#fafafa")};
  margin-bottom: 20px;
  box-sizing: border-box;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007aff;
    background: ${(props) => (props.$isDark ? "#404040" : "#ffffff")};
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }

  &::placeholder {
    color: ${(props) => (props.$isDark ? "#cccccc" : "#8e8e93")};
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
`;

const Button = styled.button`
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SaveButton = styled(Button)`
  background: linear-gradient(135deg, #007aff 0%, #0051d0 100%);
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 122, 255, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CancelButton = styled(Button)<{ $isDark: boolean }>`
  background: ${(props) => (props.$isDark ? "#404040" : "#f8f9fa")};
  color: ${(props) => (props.$isDark ? "#cccccc" : "#6c757d")};
  border: 1px solid ${(props) => (props.$isDark ? "#606060" : "#e9ecef")};

  &:hover {
    background: ${(props) => (props.$isDark ? "#505050" : "#e9ecef")};
    color: ${(props) => (props.$isDark ? "#ffffff" : "#495057")};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const PhotoContainer = styled.div<{ $isDark: boolean }>`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 32px;
  position: relative;
  cursor: pointer;
  border: 4px solid ${(props) => (props.$isDark ? "#404040" : "#f8f9fa")};
  transition: all 0.2s ease;

  &:hover {
    border-color: #007aff;
    transform: scale(1.02);
  }
`;

const Photo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 122, 255, 0.8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const SuccessBox = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 60px 40px;
  color: ${(props) => (props.$isDark ? "#ffffff" : "#1a1a1a")};
`;

const SuccessIcon = styled.div`
  font-size: 80px;
  margin-bottom: 24px;
`;

const SuccessTitle = styled.h1<{ $isDark: boolean }>`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${(props) => (props.$isDark ? "#ffffff" : "#1a1a1a")};
`;

const SuccessText = styled.p<{ $isDark: boolean }>`
  font-size: 16px;
  color: ${(props) => (props.$isDark ? "#cccccc" : "#8e8e93")};
  max-width: 400px;
  margin: 0 auto 32px;
  line-height: 1.5;
`;

const PreviewSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
`;

const PreviewPhoto = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #007aff;
`;

const PreviewInfo = styled.div`
  flex: 1;
`;

const PreviewName = styled.div<{ $isDark: boolean }>`
  font-size: 20px;
  font-weight: 600;
  color: ${(props) => (props.$isDark ? "#ffffff" : "#1a1a1a")};
  margin-bottom: 4px;
`;

const PreviewLocation = styled.div<{ $isDark: boolean }>`
  color: ${(props) => (props.$isDark ? "#cccccc" : "#8e8e93")};
  font-size: 14px;
`;

const PreviewField = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const PreviewLabel = styled.div<{ $isDark: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => (props.$isDark ? "#cccccc" : "#8e8e93")};
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PreviewValue = styled.div<{ $isDark: boolean }>`
  font-size: 15px;
  color: ${(props) => (props.$isDark ? "#ffffff" : "#1a1a1a")};
  line-height: 1.4;
`;

const EmptyValue = styled.span<{ $isDark: boolean }>`
  font-style: italic;
  color: ${(props) => (props.$isDark ? "#888888" : "#c7c7cc")};
`;

const ProfileEditor = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const {
    profile,
    showPreview,
    isSubmitted,
    handleChange,
    handleSubmit,
    handleBackToEdit,
    fileInputRef,
    handleFileChange,
    handleUploadButtonClick,
    hoverPhoto,
    setHoverPhoto,
    hoverSave,
    setHoverSave,
    hoverCancel,
    setHoverCancel,
  } = useProfileFunctions();

  if (isSubmitted) {
    return (
      <Container $isDark={isDarkMode}>
        <ContentArea>
          <Card $isDark={isDarkMode}>
            <SuccessBox $isDark={isDarkMode}>
              <SuccessIcon>🎉</SuccessIcon>
              <SuccessTitle $isDark={isDarkMode}>
                프로필이 업데이트되었습니다!
              </SuccessTitle>
              <SuccessText $isDark={isDarkMode}>
                변경한 정보가 성공적으로 저장되었습니다.
              </SuccessText>
              <SaveButton onClick={handleBackToEdit}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                돌아가기
              </SaveButton>
            </SuccessBox>
          </Card>
        </ContentArea>
      </Container>
    );
  }

  return (
    <Container $isDark={isDarkMode}>
      <ContentArea>
        {showPreview && (
          <PreviewCard $isDark={isDarkMode}>
            <HeaderSection>
              <CardTitle $isDark={isDarkMode}>프로필 미리보기</CardTitle>
            </HeaderSection>
            <PreviewSection>
              <PreviewPhoto
                src={
                  profile.photoUrl === ""
                    ? auth.currentUser?.photoURL ||
                      "https://via.placeholder.com/150"
                    : profile.photoUrl
                }
                alt="미리보기 이미지"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://via.placeholder.com/150";
                }}
              />
              <PreviewInfo>
                <PreviewName $isDark={isDarkMode}>
                  {profile.name || (
                    <EmptyValue $isDark={isDarkMode}>이름 미입력</EmptyValue>
                  )}
                </PreviewName>
                <PreviewLocation $isDark={isDarkMode}>
                  {profile.location || (
                    <EmptyValue $isDark={isDarkMode}>위치 미입력</EmptyValue>
                  )}
                </PreviewLocation>
              </PreviewInfo>
            </PreviewSection>

            <PreviewField>
              <PreviewLabel $isDark={isDarkMode}>이메일</PreviewLabel>
              <PreviewValue $isDark={isDarkMode}>
                {profile.email || (
                  <EmptyValue $isDark={isDarkMode}>이메일 미입력</EmptyValue>
                )}
              </PreviewValue>
            </PreviewField>

            <PreviewField>
              <PreviewLabel $isDark={isDarkMode}>소개</PreviewLabel>
              <PreviewValue $isDark={isDarkMode}>
                {profile.bio || (
                  <EmptyValue $isDark={isDarkMode}>소개 미입력</EmptyValue>
                )}
              </PreviewValue>
            </PreviewField>
          </PreviewCard>
        )}

        <Card $isDark={isDarkMode}>
          <HeaderSection>
            <CardTitle $isDark={isDarkMode}>프로필 편집</CardTitle>
            <ThemeToggle $isDark={isDarkMode} onClick={toggleTheme}>
              {isDarkMode ? (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                  라이트 모드
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  다크 모드
                </>
              )}
            </ThemeToggle>
          </HeaderSection>

          <PhotoContainer
            $isDark={isDarkMode}
            onClick={handleUploadButtonClick}
            onMouseEnter={() => setHoverPhoto(true)}
            onMouseLeave={() => setHoverPhoto(false)}
          >
            <Photo
              src={
                profile.photoUrl === ""
                  ? auth.currentUser?.photoURL ||
                    "https://via.placeholder.com/150"
                  : profile.photoUrl
              }
              alt="프로필 사진"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/150";
              }}
            />
            <Overlay style={{ opacity: hoverPhoto ? 1 : 0 }}>
              📷 사진 변경
            </Overlay>
          </PhotoContainer>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept="image/*"
          />

          <form onSubmit={handleSubmit}>
            <Label $isDark={isDarkMode} htmlFor="name">
              이름
            </Label>
            <Input
              $isDark={isDarkMode}
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="이름을 입력하세요"
            />

            <Label $isDark={isDarkMode} htmlFor="email">
              이메일
            </Label>
            <Input
              $isDark={isDarkMode}
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              placeholder="이메일을 입력하세요"
            />

            <Label $isDark={isDarkMode} htmlFor="bio">
              소개
            </Label>
            <Textarea
              $isDark={isDarkMode}
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              placeholder="자신을 소개해주세요"
            />

            <Label $isDark={isDarkMode} htmlFor="location">
              위치
            </Label>
            <Input
              $isDark={isDarkMode}
              type="text"
              id="location"
              name="location"
              value={profile.location}
              onChange={handleChange}
              placeholder="위치를 입력하세요"
            />

            <ButtonRow>
              <CancelButton
                $isDark={isDarkMode}
                type="button"
                onMouseEnter={() => setHoverCancel(true)}
                onMouseLeave={() => setHoverCancel(false)}
                onClick={handleBackToEdit}
              >
                취소
              </CancelButton>
              <SaveButton
                type="submit"
                onMouseEnter={() => setHoverSave(true)}
                onMouseLeave={() => setHoverSave(false)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17,21 17,13 7,13 7,21" />
                  <polyline points="7,3 7,8 15,8" />
                </svg>
                변경사항 저장
              </SaveButton>
            </ButtonRow>
          </form>
        </Card>
      </ContentArea>
    </Container>
  );
};

export default ProfileEditor;
