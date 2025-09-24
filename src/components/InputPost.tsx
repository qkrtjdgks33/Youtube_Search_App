import { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { auth, db } from "../firebaseConfig";
import {
  useMusic,
  fetchPlaylistVideosReturn,
} from "../components/MusicFunction";
import { addDoc, collection, getDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../components/ThemeContext";
import React from "react";

const Container = styled.div<{ $isDark: boolean }>`
  background: ${(props) => (props.$isDark ? "#1c1c1c" : "#ffffff")};
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px
    ${(props) => (props.$isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.08)")};
  border: 1px solid ${(props) => (props.$isDark ? "#333333" : "#f0f0f0")};
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 6px 24px
      ${(props) =>
        props.$isDark ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.12)"};
    transform: translateY(-2px);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const ProfileArea = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #f8f9fa;
  flex-shrink: 0;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.div<{ $isDark: boolean }>`
  font-weight: 600;
  font-size: 15px;
  color: ${(props) => (props.$isDark ? "#ffffff" : "#1a1a1a")};
`;

const UserEmail = styled.div<{ $isDark: boolean }>`
  font-size: 13px;
  color: ${(props) => (props.$isDark ? "#aaaaaa" : "#8e8e93")};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const TextArea = styled.textarea<{ $isDark: boolean }>`
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 2px solid ${(props) => (props.$isDark ? "#404040" : "#f0f0f0")};
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.5;
  resize: vertical;
  font-family: inherit;
  color: ${(props) => (props.$isDark ? "#ffffff" : "#1a1a1a")};
  background: ${(props) => (props.$isDark ? "#2c2c2c" : "#fafafa")};
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007aff;
    background: ${(props) => (props.$isDark ? "#333333" : "#ffffff")};
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }

  &::placeholder {
    color: ${(props) => (props.$isDark ? "#888888" : "#8e8e93")};
  }
`;

const ImagePreviewSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ImagePreviewContainer = styled.div<{ $isDark: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  padding: 16px;
  background: ${(props) => (props.$isDark ? "#333333" : "#f8f9fa")};
  border-radius: 12px;
  border: 2px dashed ${(props) => (props.$isDark ? "#555555" : "#e9ecef")};
`;

const ImagePreviewWrapper = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 59, 48, 0.9);
    transform: scale(1.1);
  }
`;

const ImageCountBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 122, 255, 0.9);
  color: white;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
`;

const BottomSection = styled.div<{ $isDark: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid ${(props) => (props.$isDark ? "#404040" : "#f0f0f0")};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ActionButton = styled.button<{ $isDark: boolean; active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: ${(props) => {
    if (props.active) return "#007aff";
    return props.$isDark ? "#333333" : "#f8f9fa";
  }};
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;

  &:hover {
    background: ${(props) => {
      if (props.active) return "#0051d0";
      return props.$isDark ? "#404040" : "#e9ecef";
    }};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg,
  img {
    width: 20px;
    height: 20px;
    color: ${(props) => {
      if (props.active) return "#ffffff";
      return props.$isDark ? "#aaaaaa" : "#6c757d";
    }};
    filter: ${(props) => (props.active ? "brightness(0) invert(1)" : "none")};
  }
`;

const AttachPhotoInput = styled.input`
  display: none;
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #007aff 0%, #0051d0 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 122, 255, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #c7c7cc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const PlaylistAttachment = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const PlaylistThumbnail = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

const PlaylistInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PlaylistTitle = styled.div`
  font-weight: 600;
  font-size: 15px;
  line-height: 1.3;
`;

const PlaylistSubtitle = styled.div`
  font-size: 13px;
  opacity: 0.8;
`;

const PlaylistIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

interface Playlist {
  id: string;
  snippet: {
    title: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
  };
}

const InputPost = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [post, setPost] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const { currentPlaylistId, playlists, videos } = useMusic();
  const [attachPlaylist, setAttachPlaylist] = useState(false);
  const [attachedPlaylist, setAttachedPlaylist] = useState<Playlist | null>(
    null
  );

  useEffect(() => {
    const loadProfilePhoto = async () => {
      const user = auth.currentUser;
      if (!user) return;

      setUserEmail(user.email || "");
      let photoUrl = user.photoURL || "";
      try {
        const profileDoc = await getDoc(doc(db, "profiles", user.uid));
        if (profileDoc.exists() && profileDoc.data().photoUrl) {
          photoUrl = profileDoc.data().photoUrl;
        }
      } catch (err) {
        console.error("프로필 사진 로드 실패:", err);
      }
      setProfilePhotoUrl(photoUrl);
    };
    loadProfilePhoto();
  }, []);

  useEffect(() => {
    console.log("현재 재생목록 ID:", currentPlaylistId);
    console.log("재생목록 목록:", playlists);
    console.log("현재 비디오:", videos);
  }, [currentPlaylistId, playlists, videos]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPost(value);
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles).slice(0, 5 - files.length);
      const newPreviews: string[] = [];
      const newFilesToAdd: File[] = [];

      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          newFilesToAdd.push(file);

          if (newPreviews.length === newFiles.length) {
            setFiles((prev) => [...prev, ...newFilesToAdd]);
            setPreviews((prev) => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setPreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
    if (textAreaRef.current) textAreaRef.current.value = "";
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (post.trim() === "" && files.length === 0) {
      alert("게시물 내용이나 이미지를 입력해주세요.");
      return;
    }

    if (loading) return;
    setLoading(true);

    let playlistFileUrl = null;
    let playlistInfo = null;

    if (attachPlaylist && currentPlaylistId && attachedPlaylist) {
      try {
        const playlistTracks = await fetchPlaylistVideosReturn(
          attachedPlaylist.id
        );
        playlistInfo = {
          id: attachedPlaylist.id,
          title: attachedPlaylist.snippet.title,
          thumbnail:
            attachedPlaylist.snippet.thumbnails.high?.url ||
            attachedPlaylist.snippet.thumbnails.medium?.url ||
            attachedPlaylist.snippet.thumbnails.default?.url,
          tracks: playlistTracks.map((video: any) => ({
            videoId: video.snippet.resourceId.videoId,
            title: video.snippet.title,
            thumbnail:
              video.snippet.thumbnails.high?.url ||
              video.snippet.thumbnails.medium?.url ||
              video.snippet.thumbnails.default?.url,
          })),
        };

        const blob = new Blob([JSON.stringify(playlistInfo)], {
          type: "application/json",
        });
        const formData = new FormData();
        formData.append("file", blob, "playlist.json");
        formData.append("userId", user.uid);
        formData.append("playlistTitle", playlistInfo.title);

        const response = await fetch(
          "https://loopmusic.kro.kr:4001/upload/playlist",
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await response.json();
        if (data.success && data.data && data.data.filename) {
          playlistFileUrl = `https://loopmusic.kro.kr:4001/uploads/shared_playlists/${data.data.filename}`;
        }
      } catch (err) {
        console.error("재생목록 처리 중 오류:", err);
        alert("재생목록 첨부에 실패했습니다.");
      }
    }

    let photoUrls: string[] = [];
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("postId", Date.now().toString());

        const response = await fetch(
          "https://loopmusic.kro.kr:4001/upload/post",
          {
            method: "POST",
            body: formData,
          }
        );

        const responseText = await response.text();
        const data = JSON.parse(responseText);

        if (data.success && data.data && data.data.filename) {
          const imageUrl = `https://loopmusic.kro.kr:4001/uploads/post_images/${data.data.filename}`;
          photoUrls.push(imageUrl);
        } else {
          throw new Error(data.error || "이미지 업로드 실패");
        }
      }

      let profileName = user.displayName ?? "";
      let profilePhoto = user.photoURL ?? "";

      try {
        const profileDoc = await getDoc(doc(db, "profiles", user.uid));
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          if (profileData.name) profileName = profileData.name;
          if (profileData.photoUrl) profilePhoto = profileData.photoUrl;
        }
      } catch (err) {
        console.error("프로필 정보 가져오기 실패:", err);
      }

      const myPost = {
        nickname: profileName ?? "",
        userId: user.uid,
        email: user.email ?? "",
        createdAt: Date.now(),
        post: post ?? "",
        photoUrls: photoUrls ?? [],
        photoUrl: profilePhoto ?? "",
        likeCount: 0,
        commentCount: 0,
        likedBy: [],
        playlist: playlistInfo ?? null,
        playlistFileUrl: playlistFileUrl ?? null,
      };

      await addDoc(collection(db, "posts"), myPost);

      setPost("");
      setFiles([]);
      setPreviews([]);
      setAttachPlaylist(false);
      setAttachedPlaylist(null);
      if (textAreaRef.current) {
        textAreaRef.current.style.height = "auto";
        textAreaRef.current.value = "";
      }

      navigate("/");
    } catch (e) {
      console.error("게시물 작성 중 오류:", e);
      alert("게시물 작성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistAttach = () => {
    let currentPlaylist = playlists.find(
      (p: Playlist) => p.id === currentPlaylistId
    );
    if (!currentPlaylist && videos.length > 0 && currentPlaylistId) {
      currentPlaylist = {
        id: currentPlaylistId,
        snippet: {
          title:
            videos[0].snippet.playlistTitle ||
            videos[0].snippet.title ||
            "재생목록",
          thumbnails: {
            high: { url: videos[0].snippet.thumbnails?.high?.url || "" },
            medium: { url: videos[0].snippet.thumbnails?.medium?.url || "" },
            default: { url: videos[0].snippet.thumbnails?.default?.url || "" },
          },
        },
      };
    }
    if (!currentPlaylist) {
      alert("현재 재생 중인 재생목록을 찾을 수 없습니다.");
      return;
    }
    setAttachPlaylist(!attachPlaylist);
    setAttachedPlaylist(currentPlaylist);
  };

  return (
    <Container $isDark={isDarkMode}>
      <Header>
        <ProfileArea>
          {profilePhotoUrl && (
            <ProfileImage src={profilePhotoUrl} alt="프로필 사진" />
          )}
        </ProfileArea>
        <UserInfo>
          <UserName $isDark={isDarkMode}>
            {auth.currentUser?.displayName || "사용자"}
          </UserName>
          <UserEmail $isDark={isDarkMode}>{userEmail}</UserEmail>
        </UserInfo>
      </Header>

      <Form onSubmit={onSubmit}>
        <TextArea
          $isDark={isDarkMode}
          ref={textAreaRef}
          value={post}
          onChange={onChange}
          placeholder="무슨 일이 일어났나요?"
        />

        {previews.length > 0 && (
          <ImagePreviewSection>
            <ImagePreviewContainer $isDark={isDarkMode}>
              {previews.map((preview, index) => (
                <ImagePreviewWrapper key={index}>
                  <ImagePreview src={preview} alt={`preview ${index}`} />
                  <RemoveImageButton
                    type="button"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </RemoveImageButton>
                  <ImageCountBadge>
                    {index + 1} / {previews.length}
                  </ImageCountBadge>
                </ImagePreviewWrapper>
              ))}
            </ImagePreviewContainer>
          </ImagePreviewSection>
        )}

        {attachPlaylist && attachedPlaylist && (
          <PlaylistAttachment>
            <PlaylistThumbnail
              src={
                attachedPlaylist.snippet.thumbnails.high?.url ||
                attachedPlaylist.snippet.thumbnails.medium?.url ||
                attachedPlaylist.snippet.thumbnails.default?.url
              }
              alt="playlist"
            />
            <PlaylistInfo>
              <PlaylistTitle>{attachedPlaylist.snippet.title}</PlaylistTitle>
              <PlaylistSubtitle>재생목록이 첨부됩니다</PlaylistSubtitle>
            </PlaylistInfo>
            <PlaylistIcon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
              </svg>
            </PlaylistIcon>
          </PlaylistAttachment>
        )}

        <BottomSection $isDark={isDarkMode}>
          <ActionButtons>
            <label htmlFor="photo">
              <ActionButton $isDark={isDarkMode} as="div">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </ActionButton>
            </label>
            <AttachPhotoInput
              ref={fileInputRef}
              onChange={onChangeFile}
              id="photo"
              type="file"
              accept="image/*"
              multiple
              disabled={previews.length >= 5}
            />

            <ActionButton
              $isDark={isDarkMode}
              type="button"
              onClick={handlePlaylistAttach}
              active={attachPlaylist}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
              </svg>
            </ActionButton>
          </ActionButtons>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <LoadingSpinner />
                게시 중...
              </>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22,2 15,22 11,13 2,9 22,2" />
                </svg>
                게시하기
              </>
            )}
          </SubmitButton>
        </BottomSection>
      </Form>
    </Container>
  );
};

export default InputPost;
