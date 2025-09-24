import { useState, useRef, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";

interface ProfileData {
  name: string;
  email: string;
  photoUrl: string;
  bio: string;
  location: string;
}

export const useProfileFunctions = () => {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    photoUrl: "",
    bio: "",
    location: "",
  });

  const [showPreview, setShowPreview] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoverPhoto, setHoverPhoto] = useState(false);
  const [hoverSave, setHoverSave] = useState(false);
  const [hoverCancel, setHoverCancel] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 프로필 데이터 로드
  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Firebase Auth에서 기본 정보 가져오기
        const defaultProfile = {
          name: user.displayName || "",
          email: user.email || "",
          photoUrl: user.photoURL || "",
          bio: "",
          location: "",
        };

        // Firestore에서 추가 프로필 정보 가져오기
        const profileDoc = await getDoc(doc(db, "profiles", user.uid));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          setProfile({
            name: data.name || defaultProfile.name,
            email: data.email || defaultProfile.email,
            photoUrl: data.photoUrl || defaultProfile.photoUrl,
            bio: data.bio || "",
            location: data.location || "",
          });
        } else {
          // Firestore에 프로필이 없으면 Auth 정보로 초기화
          setProfile(defaultProfile);
        }
      } catch (error) {
        console.error("프로필 로드 실패:", error);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 유효성 검사
    if (!profile.name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (!profile.email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const photoUrl = profile.photoUrl || "";

      const profileData = {
        name: profile.name.trim(),
        email: profile.email.trim(),
        photoUrl: photoUrl,
        bio: profile.bio.trim(),
        location: profile.location.trim(),
        updatedAt: Date.now(),
        userId: user.uid,
      };

      console.log("저장할 프로필 데이터:", profileData);

      // 1. Firestore에 프로필 저장
      await setDoc(doc(db, "profiles", user.uid), profileData, { merge: true });

      // 2. Firebase Auth 프로필 업데이트 (displayName만 - photoURL은 길이 제한으로 제외)
      await updateProfile(user, {
        displayName: profileData.name,
      });

      console.log("프로필 저장 성공!");
      setIsSubmitted(true);
    } catch (error) {
      console.error("프로필 저장 실패:", error);
      alert(`프로필 저장에 실패했습니다: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEdit = () => {
    setIsSubmitted(false);
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드할 수 있습니다.");
        return;
      }

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
          throw new Error(data.error || "업로드 실패");
        }
      } catch (error) {
        console.error("프로필 사진 업로드 실패:", error);
        alert("프로필 사진 업로드에 실패했습니다.");
      }
    }
  };

  return {
    profile,
    showPreview,
    isSubmitted,
    isLoading,
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
  };
};
