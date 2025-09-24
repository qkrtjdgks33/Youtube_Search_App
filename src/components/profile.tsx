import React, { useState, useRef, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

// 프로필 데이터 구조를 정의하는 인터페이스
interface ProfileData {
  name: string; // 사용자 이름
  email: string; // 사용자 이메일
  photoUrl: string; // 프로필 사진 URL
  bio: string; // 자기소개
  location: string; // 위치 정보
}

// 인라인 스타일 객체 타입 정의
interface StylesDictionary {
  [key: string]: React.CSSProperties;
}

const ProfileEditor: React.FC = () => {
  // 프로필 상태 초기화 - useState 훅을 사용하여 프로필 데이터 상태 관리
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    photoUrl: "/default_profile.png", // 기본 이미지 경로 수정
    bio: "",
    location: "",
  });

  // 미리보기 표시 여부를 관리하는 상태 변수
  const [showPreview, setShowPreview] = useState(true);

  // 프로필 저장 성공 여부 상태
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 호버 상태를 관리하는 상태 변수들 - UI 상호작용을 위한 것
  const [hoverPhoto, setHoverPhoto] = useState(false); // 사진 위에 마우스가 있는지 상태
  const [hoverCancel, setHoverCancel] = useState(false); // 취소 버튼 위에 마우스가 있는지 상태
  const [hoverSave, setHoverSave] = useState(false); // 저장 버튼 위에 마우스가 있는지 상태
  const [hoverToggle, setHoverToggle] = useState(false); // 토글 버튼 위에 마우스가 있는지 상태
  const [hoverBackToEdit, setHoverBackToEdit] = useState(false); // 편집으로 돌아가기 버튼 호버 상태

  // 파일 입력 요소에 대한 참조 생성
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 입력 필드가 변경될 때 호출되는 핸들러 함수
  // e.target에서 name과 value를 추출하여 해당 필드만 업데이트함
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev, // 이전 상태의 모든 필드를 유지
      [name]: value, // 변경이 발생한 필드만 새 값으로 업데이트 (계산된 속성명 사용)
    }));
  };

  // 토글 버튼 클릭 시 미리보기 표시/숨김 전환
  const togglePreview = () => {
    setShowPreview((prev) => !prev);
  };

  // 프로필 데이터 로드
  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const profileDoc = await getDoc(doc(db, "profiles", user.uid));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          setProfile({
            name: data.name || "",
            email: data.email || "",
            photoUrl: data.photoUrl || "/default_profile.png", // 기본 이미지 경로 수정
            bio: data.bio || "",
            location: data.location || "",
          });
        }
      } catch (error) {
        console.error("프로필 로드 실패:", error);
      }
    };

    loadProfile();
  }, []);

  // 폼 제출 시 호출되는 핸들러 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      // photoUrl이 undefined이거나 잘못된 형식인 경우 기본 이미지 URL 사용
      const photoUrl =
        profile.photoUrl && !profile.photoUrl.includes("undefined")
          ? profile.photoUrl
          : "/default_profile.png";

      console.log("저장할 프로필 데이터:", { ...profile, photoUrl });

      await setDoc(doc(db, "profiles", user.uid), {
        name: profile.name,
        email: profile.email,
        photoUrl: photoUrl,
        bio: profile.bio,
        location: profile.location,
        updatedAt: Date.now(),
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("프로필 저장 실패:", error);
      alert("프로필 저장에 실패했습니다.");
    }
  };

  // 편집 페이지로 돌아가기
  const handleBackToEdit = () => {
    setIsSubmitted(false);
  };

  // 파일 선택 다이얼로그를 열기 위한 함수
  const handleUploadButtonClick = () => {
    // 파일 입력 요소의 클릭 이벤트를 트리거
    fileInputRef.current?.click();
  };

  // 파일이 선택되었을 때 호출되는 함수
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 유효성 검사 - 이미지 파일인지 확인
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드할 수 있습니다.");
        return;
      }

      // 파일 크기 제한 (예: 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert("파일 크기가 5MB를 초과할 수 없습니다.");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", auth.currentUser?.uid || "");

        console.log("프로필 이미지 업로드 시작:", file.name);
        const response = await fetch(
          "https://loopmusic.kro.kr:4001/upload/profile",
          {
            method: "POST",
            body: formData,
          }
        );

        const responseText = await response.text();
        console.log("서버 응답:", responseText);

        if (!response.ok) {
          throw new Error(
            `업로드 실패: ${response.status} ${response.statusText}`
          );
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error("JSON 파싱 실패:", e);
          throw new Error("서버 응답 형식이 올바르지 않습니다.");
        }

        if (data.success && data.data && data.data.filename) {
          const imageUrl = `https://loopmusic.kro.kr:4001/uploads/profile_images/${data.data.filename}`;
          console.log("이미지 업로드 성공:", imageUrl);
          setProfile((prev) => ({
            ...prev,
            photoUrl: imageUrl,
          }));
        } else {
          console.error("업로드 실패 응답:", data);
          console.error("data 객체 내용:", JSON.stringify(data.data, null, 2));
          throw new Error(data.error || "업로드 실패");
        }
      } catch (error) {
        console.error("프로필 사진 업로드 실패:", error);
        alert("프로필 사진 업로드에 실패했습니다.");
        // 업로드 실패 시 기본 이미지로 설정
        setProfile((prev) => ({
          ...prev,
          photoUrl: "/default_profile.png",
        }));
      }
    }
  };

  // 인라인 스타일 객체 - 컴포넌트의 모든 스타일 정의
  const styles: StylesDictionary = {
    container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center", // 컨텐츠를 중앙에 배치
      padding: "40px 20px", // 상하 40px, 좌우 20px 패딩
      fontFamily: '"Roboto", Arial, sans-serif', // 폰트 패밀리 설정
      backgroundColor: "#f8f9fa", // 배경색 - 연한 회색
      color: "#202124", // 텍스트 색상 - 거의 검정색
      minHeight: "100vh", // 최소 높이를 뷰포트 높이로 설정
    },
    contentWrapper: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      maxWidth: "750px",
      margin: "0 auto",
    },
    card: {
      backgroundColor: "white", // 카드 배경색
      borderRadius: "8px", // 둥근 모서리
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)", // 카드 그림자 효과
      width: "100%", // 부모 요소의 전체 너비 사용
      overflow: "hidden", // 내용이 넘치면 숨김 처리
      marginBottom: "24px", // 아래쪽 마진 추가
    },
    header: {
      padding: "24px 24px 0", // 상단과 좌우 패딩, 하단은 없음
      borderBottom: "1px solid #dadce0", // 하단 경계선
    },
    headerTitle: {
      fontSize: "22px", // 제목 글자 크기
      fontWeight: 400, // 폰트 굵기 - 일반
      margin: "0 0 8px", // 하단에만 마진 적용
    },
    headerSubtitle: {
      color: "#5f6368", // 부제목 색상 - 회색
      fontSize: "14px", // 글자 크기
      margin: "0 0 16px", // 하단에만 마진 적용
    },
    form: {
      padding: "24px", // 폼 전체에 패딩 적용
    },
    photoSection: {
      display: "flex",
      justifyContent: "center", // 사진 섹션 중앙 정렬
      marginBottom: "32px", // 아래쪽 여백
    },
    photoContainer: {
      position: "relative", // 내부 요소의 절대 위치 지정을 위함
      width: "120px", // 컨테이너 너비
      height: "120px", // 컨테이너 높이
      borderRadius: "50%", // 원형 모양
      overflow: "hidden", // 원 밖으로 넘치는 부분 숨김
      backgroundColor: "#e8eaed", // 사진이 없을 때 배경색
    },
    photo: {
      width: "100%", // 컨테이너 전체 너비 차지
      height: "100%", // 컨테이너 전체 높이 차지
      objectFit: "cover", // 비율을 유지하면서 컨테이너를 채움
    },
    photoOverlay: {
      position: "absolute", // 사진 위에 절대 위치로 배치
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: hoverPhoto ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)", // 호버 시 어두운 배경으로 변경
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: hoverPhoto ? 1 : 0, // 호버 시에만 보이게 함
      transition: "opacity 0.2s, background-color 0.2s", // 부드러운 전환 효과
    },
    photoButton: {
      backgroundColor: "transparent", // 투명 배경
      color: "white", // 흰색 텍스트
      border: "none", // 테두리 없음
      padding: "8px 12px", // 패딩
      fontSize: "14px", // 글자 크기
      cursor: "pointer", // 마우스 오버 시 커서 모양 변경
      borderRadius: "4px", // 둥근 모서리
      transition: "background-color 0.2s", // 배경색 변경 시 부드러운 전환
    },
    formRow: {
      marginBottom: "24px", // 각 폼 행 사이의 간격
    },
    label: {
      display: "block", // 라벨을 블록 요소로 표시
      fontSize: "12px", // 작은 글자 크기
      fontWeight: 500, // 중간 정도 굵기
      marginBottom: "8px", // 라벨과 입력 필드 사이 간격
      color: "#5f6368", // 라벨 색상 - 회색
    },
    textInput: {
      width: "100%", // 부모 요소의 전체 너비 사용
      padding: "12px", // 내부 여백
      fontSize: "16px", // 글자 크기
      border: "1px solid #dadce0", // 테두리 스타일
      borderRadius: "4px", // 둥근 모서리
      outline: "none", // 포커스 시 기본 아웃라인 제거
      transition: "border-color 0.2s", // 테두리 색상 변경 시 부드러운 전환
      boxSizing: "border-box", // 패딩과 테두리를 너비에 포함
    },
    disabledInput: {
      backgroundColor: "#f8f9fa", // 비활성화된 입력 필드 배경색
      color: "#5f6368", // 비활성화된 텍스트 색상
    },
    textarea: {
      resize: "vertical", // 수직으로만 크기 조절 가능
      minHeight: "80px", // 최소 높이
    },
    helperText: {
      display: "block", // 블록 요소로 표시
      fontSize: "12px", // 작은 글자 크기
      color: "#5f6368", // 도움말 텍스트 색상 - 회색
      marginTop: "4px", // 입력 필드와의 간격
    },
    actions: {
      display: "flex",
      justifyContent: "flex-end", // 버튼들을 오른쪽으로 정렬
      gap: "12px", // 버튼 사이의 간격
      marginTop: "32px", // 폼과 버튼 사이 간격
    },
    cancelBtn: {
      backgroundColor: hoverCancel ? "rgba(26, 115, 232, 0.04)" : "transparent", // 호버 시 배경색 변경
      color: "#1a73e8", // 파란색 텍스트
      border: "none", // 테두리 없음
      padding: "10px 24px", // 패딩
      fontSize: "14px", // 글자 크기
      fontWeight: 500, // 글자 굵기
      borderRadius: "4px", // 둥근 모서리
      cursor: "pointer", // 마우스 오버 시 커서 모양 변경
      transition: "background-color 0.2s", // 배경색 변경 시 부드러운 전환
    },
    saveBtn: {
      backgroundColor: hoverSave ? "#0b5cbe" : "#1a73e8", // 호버 시 더 진한 파란색으로 변경
      color: "white", // 흰색 텍스트
      border: "none", // 테두리 없음
      padding: "10px 24px", // 패딩
      fontSize: "14px", // 글자 크기
      fontWeight: 500, // 글자 굵기
      borderRadius: "4px", // 둥근 모서리
      cursor: "pointer", // 마우스 오버 시 커서 모양 변경
      transition: "background-color 0.2s", // 배경색 변경 시 부드러운 전환
    },
    // 미리보기 관련 스타일
    toggleBtn: {
      backgroundColor: hoverToggle ? "rgba(26, 115, 232, 0.04)" : "transparent",
      color: "#1a73e8",
      border: "1px solid #1a73e8",
      padding: "8px 16px",
      fontSize: "14px",
      fontWeight: 500,
      borderRadius: "4px",
      cursor: "pointer",
      alignSelf: "flex-end",
      marginBottom: "16px",
      transition: "background-color 0.2s",
    },
    previewCard: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
      width: "100%",
      overflow: "hidden",
      marginBottom: showPreview ? "24px" : "0",
      maxHeight: showPreview ? "1000px" : "0",
      opacity: showPreview ? 1 : 0,
      transition: "all 0.3s ease-in-out",
    },
    previewHeader: {
      backgroundColor: "#1a73e8",
      color: "white",
      padding: "16px 24px",
    },
    previewTitle: {
      fontSize: "18px",
      fontWeight: 500,
      margin: "0",
    },
    previewContent: {
      padding: "24px",
    },
    previewSection: {
      marginBottom: "16px",
    },
    previewLabel: {
      fontSize: "12px",
      color: "#5f6368",
      marginBottom: "4px",
    },
    previewValue: {
      fontSize: "16px",
      fontWeight: 400,
      margin: "0",
      paddingBottom: "8px",
      borderBottom: "1px solid #f0f0f0",
    },
    previewPhoto: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "2px solid #1a73e8",
    },
    noDataText: {
      fontStyle: "italic",
      color: "#9e9e9e",
    },
    // 성공 페이지 스타일
    successContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 20px",
      textAlign: "center",
    },
    successIcon: {
      fontSize: "64px",
      color: "#34A853",
      marginBottom: "24px",
    },
    successTitle: {
      fontSize: "24px",
      fontWeight: 500,
      margin: "0 0 16px",
      color: "#202124",
    },
    successMessage: {
      fontSize: "16px",
      color: "#5f6368",
      margin: "0 0 32px",
      maxWidth: "500px",
    },
    profileDetailCard: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
      width: "100%",
      maxWidth: "500px",
      overflow: "hidden",
      marginBottom: "32px",
    },
    profileDetailHeader: {
      backgroundColor: "#1D7FFFFF",
      color: "white",
      padding: "20px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    profileDetailContent: {
      padding: "24px",
    },
    profileDetailPhoto: {
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "2px solid white",
    },
    profileDetailItem: {
      marginBottom: "16px",
      padding: "0 0 16px",
      borderBottom: "1px solid #f0f0f0",
    },
    profileDetailLabel: {
      fontSize: "12px",
      color: "#5f6368",
      marginBottom: "4px",
    },
    profileDetailValue: {
      fontSize: "16px",
      color: "#202124",
    },
    backToEditBtn: {
      backgroundColor: hoverBackToEdit
        ? "rgba(26, 115, 232, 0.04)"
        : "transparent",
      color: "#1a73e8",
      border: "1px solid #1a73e8",
      padding: "10px 24px",
      fontSize: "14px",
      fontWeight: 500,
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
  };

  // useEffect 훅을 사용하여 컴포넌트 마운트 및 리사이즈 시 모바일 대응 스타일 적용
  React.useEffect(() => {
    // 모바일 디바이스에서 작동하는 미디어 쿼리 처리 함수
    const handleResize = () => {
      if (window.innerWidth <= 600) {
        // 화면 너비가 600px 이하일 때 (모바일 환경으로 판단)
        // 모바일 스타일을 적용하는 로직
        const actionsElement = document.querySelector("[data-mobile-actions]"); // data-mobile-actions 속성을 가진 요소 선택
        if (actionsElement) {
          const actionsStyle = actionsElement as HTMLElement; // HTMLElement로 타입 캐스팅
          // 모바일 환경에서의 버튼 영역 스타일 적용
          Object.assign(actionsStyle.style, {
            position: "fixed", // 고정 위치
            bottom: "0", // 화면 하단에 고정
            left: "0", // 왼쪽 가장자리
            right: "0", // 오른쪽 가장자리
            padding: "12px 16px", // 패딩
            backgroundColor: "white", // 배경색
            boxShadow: "0 -1px 3px rgba(0, 0, 0, 0.12)", // 상단에 그림자 효과
            margin: "0", // 마진 제거
          });
        }
      }
    };

    // 초기 로드 및 리사이즈 이벤트에 대한 핸들러
    handleResize();
    window.addEventListener("resize", handleResize);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 프로필 저장 성공 페이지 렌더링
  if (isSubmitted) {
    return (
      <div style={styles.container}>
        <div style={styles.contentWrapper}>
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>✓</div>
            <h1 style={styles.successTitle}>
              프로필이 성공적으로 업데이트되었습니다!
            </h1>
            <p style={styles.successMessage}>
              프로필 정보가 LOOP 서비스에 반영되었습니다. 아래에서 업데이트된
              정보를 확인하세요.
            </p>

            <div style={styles.profileDetailCard}>
              <div style={styles.profileDetailHeader}>
                <img
                  src={profile.photoUrl || "/default_profile.png"}
                  alt="프로필 이미지"
                  style={styles.profileDetailPhoto}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/default_profile.png";
                  }}
                />
                <div>
                  <h2
                    style={{ margin: "0", fontSize: "20px", fontWeight: 500 }}
                  >
                    {profile.name || (
                      <span style={styles.noDataText}>이름 미입력</span>
                    )}
                  </h2>
                  <p style={{ margin: "4px 0 0", fontSize: "14px" }}>
                    {profile.location || (
                      <span style={styles.noDataText}>위치 미입력</span>
                    )}
                  </p>
                </div>
              </div>

              <div style={styles.profileDetailContent}>
                <div style={styles.profileDetailItem}>
                  <div style={styles.profileDetailLabel}>이메일</div>
                  <div style={styles.profileDetailValue}>
                    {profile.email || (
                      <span style={styles.noDataText}>이메일 미입력</span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    ...styles.profileDetailItem,
                    borderBottom: "none",
                    marginBottom: 0,
                    paddingBottom: 0,
                  }}
                >
                  <div style={styles.profileDetailLabel}>소개</div>
                  <div style={styles.profileDetailValue}>
                    {profile.bio || (
                      <span style={styles.noDataText}>소개 미입력</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              style={styles.backToEditBtn}
              onMouseEnter={() => setHoverBackToEdit(true)}
              onMouseLeave={() => setHoverBackToEdit(false)}
              onClick={handleBackToEdit}
            >
              프로필 편집으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        {/* 미리보기 토글 버튼 */}
        <button
          type="button"
          style={styles.toggleBtn}
          onMouseEnter={() => setHoverToggle(true)}
          onMouseLeave={() => setHoverToggle(false)}
          onClick={togglePreview}
        >
          {showPreview ? "미리보기 숨기기" : "미리보기 표시"}
        </button>

        {/* 미리보기 섹션 */}
        <div style={styles.previewCard}>
          <div style={styles.previewHeader}>
            <h2 style={styles.previewTitle}>프로필 미리보기</h2>
          </div>
          <div style={styles.previewContent}>
            <div
              style={{
                ...styles.previewSection,
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <img
                src={profile.photoUrl || "/default_profile.png"}
                alt="프로필 이미지"
                style={styles.previewPhoto}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/default_profile.png";
                }}
              />
              <div>
                <h3 style={{ margin: "0", fontSize: "20px" }}>
                  {profile.name || (
                    <span style={styles.noDataText}>이름 미입력</span>
                  )}
                </h3>
                <p style={{ margin: "0", color: "#5f6368" }}>
                  {profile.location || (
                    <span style={styles.noDataText}>위치 미입력</span>
                  )}
                </p>
              </div>
            </div>

            <div style={styles.previewSection}>
              <div style={styles.previewLabel}>이메일</div>
              <div style={styles.previewValue}>
                {profile.email || (
                  <span style={styles.noDataText}>이메일 미입력</span>
                )}
              </div>
            </div>

            <div style={styles.previewSection}>
              <div style={styles.previewLabel}>소개</div>
              <div style={styles.previewValue}>
                {profile.bio || (
                  <span style={styles.noDataText}>소개 미입력</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 프로필 편집 카드 */}
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.headerTitle}>프로필 정보</h1>
            <p style={styles.headerSubtitle}>
              LOOP 서비스에서 사용되는 기본 정보를 관리하세요
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.photoSection}>
              <div
                style={styles.photoContainer}
                onMouseEnter={() => setHoverPhoto(true)}
                onMouseLeave={() => setHoverPhoto(false)}
              >
                <img
                  src={profile.photoUrl || "/default_profile.png"}
                  alt="프로필 이미지"
                  style={styles.photo}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/default_profile.png";
                  }}
                />
                <div style={styles.photoOverlay}>
                  <button
                    type="button"
                    style={styles.photoButton}
                    onClick={handleUploadButtonClick}
                  >
                    사진 변경
                  </button>
                </div>
              </div>
            </div>

            {/* 파일 업로드를 위한 숨겨진 input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept="image/*"
            />

            <div style={styles.formRow}>
              <label htmlFor="name" style={styles.label}>
                이름
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                style={styles.textInput}
                placeholder="이름을 입력하세요"
              />
            </div>

            <div style={styles.formRow}>
              <label htmlFor="email" style={styles.label}>
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                style={styles.textInput}
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div style={styles.formRow}>
              <label htmlFor="bio" style={styles.label}>
                소개
              </label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                style={{ ...styles.textInput, ...styles.textarea }}
                rows={3}
                placeholder="자기소개를 입력하세요"
              />
            </div>

            <div style={styles.formRow}>
              <label htmlFor="location" style={styles.label}>
                위치
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={profile.location}
                onChange={handleChange}
                style={styles.textInput}
                placeholder="위치를 입력하세요 (예: 서울특별시)"
              />
            </div>

            <div style={styles.actions} data-mobile-actions>
              <button
                type="button"
                style={styles.cancelBtn}
                onMouseEnter={() => setHoverCancel(true)}
                onMouseLeave={() => setHoverCancel(false)}
              >
                취소
              </button>
              <button
                type="submit"
                style={styles.saveBtn}
                onMouseEnter={() => setHoverSave(true)}
                onMouseLeave={() => setHoverSave(false)}
              >
                변경사항 저장
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
