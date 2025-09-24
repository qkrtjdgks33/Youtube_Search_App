import { useImageModal } from "../screens/layout";
import { useState, useEffect, useRef } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { auth, db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { useMusicPlayer } from "../components/MusicFunction";
import { useTheme } from "../components/ThemeContext";
import MiniProfileHover from "./MiniProfileHover";
import { Link } from "react-router-dom";
import { useRelations } from "../components/RelationsContext";

interface PostProps {
  id: string;
  userId: string;
  nickname: string;
  post: string;
  createdAt: number;
  photoUrl?: string;
  photoUrls?: string[];
  comments?: {
    userId: string;
    nickname: string;
    content: string;
    createdAt: number;
    id?: string;
  }[];
  playlist?: {
    id: string;
    title: string;
    thumbnail: string;
    tracks?: {
      videoId: string;
      title: string;
      thumbnail: string;
    }[];
  } | null;
  playlistFileUrl?: string;
}

const defaultProfileImg =
  "https://static-00.iconduck.com/assets.00/profile-circle-icon-2048x2048-cqe5466q.png";

// 업로드 서버 경로 보정
const normalizeImageUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://loopmusic.o-r.kr:4003/uploads/post_images/${url}`;
};

const Post = ({
  id,
  userId,
  nickname,
  post,
  createdAt,
  photoUrl,
  comments,
  playlist,
  playlistFileUrl,
}: PostProps) => {
  const { isDarkMode } = useTheme();
  const { isMuted, isFollowing } = useRelations();
  const myUid = auth.currentUser?.uid || null;

  // === 상태 ===
  const { openModal } = useImageModal();
  const [commentList, setCommentList] = useState(comments || []);
  const user = auth.currentUser;
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | undefined>(
    photoUrl
  );
  const [currentNickname, setCurrentNickname] = useState<string | undefined>(
    nickname
  );
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPost, setEditedPost] = useState(post);
  const [currentPost, setCurrentPost] = useState(post);
  const { playPlaylist } = useMusicPlayer();
  const [fetchedPlaylist, setFetchedPlaylist] = useState<any>(null);

  const [zoomedImage, setZoomedImage] = useState<{
    url: string;
    rect: DOMRect;
  } | null>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [isZooming, setIsZooming] = useState(false);

  // === 데이터 로딩 ===
  useEffect(() => {
    const fetchPost = async () => {
      const postRef = doc(db, "posts", id);
      const docSnap = await getDoc(postRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setLikes(data.likeCount || 0);
        setHasLiked(data.likedBy?.includes(user?.uid));
        setCurrentPhotoUrl(data.photoUrl || defaultProfileImg);
        setCurrentNickname(data.nickname || nickname);
        setPhotoUrls(
          (data.photoUrls || [])
            .filter((url: any) => url)
            .map(normalizeImageUrl)
        );
        setCurrentPost(data.post);
        setEditedPost(data.post);
      }
    };
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.uid, nickname]);

  useEffect(() => {
    const fetchComments = async () => {
      const postRef = doc(db, "posts", id);
      const docSnap = await getDoc(postRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setCommentList(data.comments || []);
      }
    };
    fetchComments();
  }, [id]);

  useEffect(() => {
    const fetchPlaylistFile = async () => {
      if (!playlistFileUrl) return;
      try {
        const playlistRes = await fetch(playlistFileUrl.replace("4000", "4001"));
        const data = await playlistRes.json();
        setFetchedPlaylist(data);
      } catch (err) {
        console.error("재생목록 JSON 불러오기 실패:", err);
      }
    };
    fetchPlaylistFile();
  }, [playlistFileUrl]);

  // === 이벤트 ===
  const handleLike = async () => {
    const postRef = doc(db, "posts", id);
    if (hasLiked) {
      await updateDoc(postRef, {
        likeCount: increment(-1),
        likedBy: arrayRemove(user?.uid),
      });
      setLikes((v) => v - 1);
    } else {
      await updateDoc(postRef, {
        likeCount: increment(1),
        likedBy: arrayUnion(user?.uid),
      });
      setLikes((v) => v + 1);
    }
    setHasLiked(!hasLiked);
  };

  const onDeletePost = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      if (photoUrls && photoUrls.length > 0) {
        for (const url of photoUrls) {
          try {
            const filename = url.split("/").pop();
            await fetch("https://loopmusic.o-r.kr:4003/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ filename }),
            });
          } catch (error) {
            console.error("서버 이미지 삭제 실패:", error);
          }
        }
      }
      if (playlistFileUrl) {
        try {
          const filename = playlistFileUrl.split("/").pop();
          await fetch("https://loopmusic.o-r.kr:4003/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename }),
          });
        } catch (error) {
          console.error("서버 JSON 파일 삭제 실패:", error);
        }
      }
      await deleteDoc(doc(db, "posts", id));
      alert("게시물이 삭제되었습니다.");
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  const handleImageClick = (url: string, index: number) => {
    const rect = imgRefs.current[index]?.getBoundingClientRect();
    if (!rect) return;
    setZoomedImage({ url, rect });
    setTimeout(() => setIsZooming(true), 10);
  };

  const handleZoomClose = () => {
    setIsZooming(false);
    setTimeout(() => setZoomedImage(null), 400);
  };

  // === 뮤트된 사용자 글 숨기기 (내 글은 제외) ===
  if (myUid && userId !== myUid && isMuted(userId)) {
    return null;
  }

  // === 렌더 ===
  return (
    <Container $isDark={isDarkMode}>
      <ZoomStyle />

      {/* 헤더 */}
      <Header $isDark={isDarkMode}>
        <ProfileSection>
          <MiniProfileHover userId={userId}>
            <Link to={`/user/${userId}`} style={{ display: "inline-flex" }}>
              <ProfileImg
                src={currentPhotoUrl || defaultProfileImg}
                alt="Profile"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = defaultProfileImg;
                }}
              />
            </Link>
          </MiniProfileHover>

          <UserInfo>
            <div style={{ display: "flex", alignItems: "center" }}>
              <UserName $isDark={isDarkMode}>{currentNickname}</UserName>
              {myUid && userId !== myUid && isFollowing(userId) && (
                <FollowBadge $isDark={isDarkMode}>팔로잉</FollowBadge>
              )}
            </div>
            <PostTime $isDark={isDarkMode}>
              {new Date(createdAt).toLocaleDateString()}
            </PostTime>
          </UserInfo>
        </ProfileSection>

        {/* 수정/삭제 (내 글일 때만) */}
        {user?.uid === userId && (
          <ActionButtons>
            <ActionBtn
              $isDark={isDarkMode}
              onClick={() => {
                setIsEditing((v) => !v);
                setEditedPost(currentPost);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
                  fill="currentColor"
                />
                <path
                  d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                  fill="currentColor"
                />
              </svg>
            </ActionBtn>
            <ActionBtn $isDark={isDarkMode} onClick={onDeletePost}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                  fill="currentColor"
                />
              </svg>
            </ActionBtn>
          </ActionButtons>
        )}
      </Header>

      {/* 본문 + 수정영역 */}
      <ContentArea>
        <PostContent $isDark={isDarkMode}>{currentPost}</PostContent>

        <EditingAreaWrapper show={isEditing}>
          <EditingArea>
            <EditTextarea
              $isDark={isDarkMode}
              value={editedPost}
              onChange={(e) => setEditedPost(e.target.value)}
              placeholder="게시글을 작성해주세요..."
              autoFocus
            />
            <div style={{ display: "flex", gap: 8 }}>
              <SaveBtn
                onClick={async () => {
                  try {
                    await updateDoc(doc(db, "posts", id), { post: editedPost });
                    setIsEditing(false);
                    setCurrentPost(editedPost);
                  } catch (err) {
                    console.error("게시글 수정 오류:", err);
                  }
                }}
              >
                저장
              </SaveBtn>
              <SaveBtn
                style={{ background: "#bbb", color: "#fff" }}
                onClick={() => {
                  setIsEditing(false);
                  setEditedPost(currentPost);
                }}
              >
                취소
              </SaveBtn>
            </div>
          </EditingArea>
        </EditingAreaWrapper>
      </ContentArea>

      {/* 이미지 갤러리 */}
      {photoUrls.length > 0 && (
        <ImageGallery>
          {photoUrls.map((url, index) => (
            <ImageContainer $isDark={isDarkMode} key={index}>
              <StyledImage
                src={url}
                alt={`Post image ${index + 1}`}
                ref={(el) => (imgRefs.current[index] = el)}
                onClick={() => openModal(url)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/image_error.png";
                }}
              />
            </ImageContainer>
          ))}
        </ImageGallery>
      )}

      {/* 확대 모달 (줌 애니메이션) */}
      {zoomedImage && (
        <div
          className={`zoom-overlay${isZooming ? " active" : ""}`}
          onClick={handleZoomClose}
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            background: isZooming ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0)",
            transition: "background 0.4s",
            cursor: "zoom-out",
            overflow: "hidden",
          }}
        >
          <button
            className="zoom-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomClose();
            }}
            aria-label="닫기"
          >
            ×
          </button>
          <img
            src={zoomedImage.url}
            alt="Zoomed"
            className={`zoom-img${isZooming ? " active" : ""}`}
            style={{
              position: "fixed",
              left: zoomedImage.rect.left,
              top: zoomedImage.rect.top,
              width: zoomedImage.rect.width,
              height: zoomedImage.rect.height,
              objectFit: "contain",
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </div>
      )}

      {/* 하단 액션 */}
      <BottomSection $isDark={isDarkMode}>
        <InteractionBar>
          <InteractionBtn
            $isDark={isDarkMode}
            onClick={handleLike}
            active={hasLiked}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill={hasLiked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span>{likes}</span>
          </InteractionBtn>

          <InteractionBtn
            $isDark={isDarkMode}
            onClick={() => setShowComments((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span>{commentList.length}</span>
          </InteractionBtn>

          {playlistFileUrl && fetchedPlaylist && (
            <PlaylistButton
              onClick={() => {
                if (!fetchedPlaylist?.tracks?.length) return;

                const existingPlaylists = JSON.parse(
                  sessionStorage.getItem("playlists") || "[]"
                );
                const playlistExists = existingPlaylists.some(
                  (p: any) => p.id === fetchedPlaylist.id
                );
                if (!playlistExists) {
                  const newPlaylist = {
                    id: fetchedPlaylist.id,
                    snippet: {
                      title: fetchedPlaylist.title,
                      thumbnails: {
                        high: { url: fetchedPlaylist.thumbnail },
                        medium: { url: fetchedPlaylist.thumbnail },
                        default: { url: fetchedPlaylist.thumbnail },
                      },
                    },
                  };
                  existingPlaylists.push(newPlaylist);
                  sessionStorage.setItem(
                    "playlists",
                    JSON.stringify(existingPlaylists)
                  );
                }
                sessionStorage.setItem(
                  "currentPlaylistId",
                  fetchedPlaylist.id
                );
                sessionStorage.setItem("currentVideoIndex", "0");

                window.dispatchEvent(
                  new CustomEvent("play_playlist_from_file", {
                    detail: {
                      videos: fetchedPlaylist.tracks.map((track: any) => ({
                        id: { videoId: track.videoId },
                        snippet: {
                          title: track.title,
                          thumbnails: {
                            default: { url: track.thumbnail },
                            medium: { url: track.thumbnail },
                            high: { url: track.thumbnail },
                          },
                          playlistId: fetchedPlaylist.id,
                        },
                      })),
                      playlistMeta: {
                        id: fetchedPlaylist.id,
                        title: fetchedPlaylist.title,
                        thumbnail: fetchedPlaylist.thumbnail,
                      },
                      existingPlaylists,
                    },
                  })
                );
              }}
            >
              <PlaylistIcon
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"
                  fill="currentColor"
                />
              </PlaylistIcon>
              <PlaylistInfo>
                <PlaylistThumb
                  src={fetchedPlaylist?.thumbnail}
                  alt="Playlist Thumbnail"
                />
                <PlaylistTitle>{fetchedPlaylist?.title}</PlaylistTitle>
              </PlaylistInfo>
            </PlaylistButton>
          )}
        </InteractionBar>
      </BottomSection>
    </Container>
  );
};

export default Post;

/* ===================== 스타일 ===================== */

const ZoomStyle = createGlobalStyle`
  .zoom-img.active {
    left: 50% !important;
    top: 50% !important;
    width: 80vw !important;
    height: 80vh !important;
    transform: translate(-50%, -50%) !important;
    border-radius: 16px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.45) !important;
  }
  .zoom-overlay.active {
    background: rgba(0,0,0,0.9) !important;
  }
  .zoom-close-btn {
    position: fixed;
    top: 32px;
    right: 48px;
    z-index: 1100;
    background: none;
    border: none;
    color: #fff;
    font-size: 3rem;
    cursor: pointer;
    padding: 0 10px;
    opacity: 0.7;
    transition: opacity 0.2s;
    line-height: 1;
  }
  .zoom-close-btn:hover {
    opacity: 1;
    color: #ff6262;
  }
`;

const EditingAreaWrapper = styled.div<{ show: boolean }>`
  overflow: hidden;
  max-height: ${({ show }) => (show ? "400px" : "0")};
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: max-height 0.44s cubic-bezier(0.43, 0.22, 0.16, 1), opacity 0.33s;
  pointer-events: ${({ show }) => (show ? "auto" : "none")};
`;

const Container = styled.div<{ $isDark: boolean }>`
  background: ${(p) => (p.$isDark ? "#1c1c1c" : "#ffffff")};
  border-radius: 20px;
  margin-bottom: 24px;
  box-shadow: ${(p) =>
    p.$isDark
      ? "0 4px 20px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)"
      : "0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)"};
  border: 1px solid ${(p) => (p.$isDark ? "#333333" : "#f0f0f0")};
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: ${(p) =>
      p.$isDark
        ? "0 8px 32px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(0, 0, 0, 0.4)"
        : "0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)"};
    transform: translateY(-2px);
  }
`;

const Header = styled.div<{ $isDark: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProfileImg = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f8f9fa;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.div<{ $isDark: boolean }>`
  font-weight: 600;
  font-size: 15px;
  color: ${(p) => (p.$isDark ? "#ffffff" : "#1a1a1a")};
  line-height: 1.2;
`;

const FollowBadge = styled.span<{ $isDark?: boolean }>`
  margin-left: 8px;
  padding: 2px 8px;
  font-size: 11px;
  border-radius: 10px;
  border: 1px solid ${(p) => (p.$isDark ? "#3a66f7" : "#bcd2ff")};
  color: ${(p) => (p.$isDark ? "#dbe6ff" : "#1d4ed8")};
  background: ${(p) =>
    p.$isDark ? "rgba(30, 64, 175, 0.25)" : "rgba(59,130,246,0.08)"};
`;

const PostTime = styled.div<{ $isDark: boolean }>`
  font-size: 13px;
  color: ${(p) => (p.$isDark ? "#aaaaaa" : "#8e8e93")};
  line-height: 1.2;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionBtn = styled.button<{ $isDark: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: ${(p) => (p.$isDark ? "#333333" : "#f8f9fa")};
  color: ${(p) => (p.$isDark ? "#aaaaaa" : "#6c757d")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &:hover {
    background: ${(p) => (p.$isDark ? "#404040" : "#e9ecef")};
    color: ${(p) => (p.$isDark ? "#ffffff" : "#495057")};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ContentArea = styled.div`
  padding: 0 24px 16px;
  width: 100%;
  box-sizing: border-box;
`;

const PostContent = styled.div<{ $isDark: boolean }>`
  color: ${(p) => (p.$isDark ? "#ffffff" : "#1a1a1a")};
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
`;

const EditingArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  margin-top: 14px;
`;

const EditTextarea = styled.textarea<{ $isDark: boolean }>`
  width: 100%;
  min-height: 100px;
  padding: 16px;
  border: 2px solid ${(p) => (p.$isDark ? "#404040" : "#f0f0f0")};
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.5;
  resize: vertical;
  font-family: inherit;
  color: ${(p) => (p.$isDark ? "#ffffff" : "#1a1a1a")};
  background: ${(p) => (p.$isDark ? "#2c2c2c" : "#fafafa")};
  transition: border-color 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007aff;
    background: ${(p) => (p.$isDark ? "#333333" : "#ffffff")};
  }

  &::placeholder {
    color: ${(p) => (p.$isDark ? "#888888" : "#8e8e93")};
  }
`;

const SaveBtn = styled.button`
  align-self: flex-start;
  padding: 8px 16px;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #0051d0;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ImageGallery = styled.div`
  padding: 0 24px 16px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
`;

const ImageContainer = styled.div<{ $isDark: boolean }>`
  border-radius: 16px;
  overflow: hidden;
  background: ${(p) => (p.$isDark ? "#333333" : "#f8f9fa")};
  aspect-ratio: 4/3;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const BottomSection = styled.div<{ $isDark: boolean }>`
  border-top: 1px solid ${(p) => (p.$isDark ? "#333333" : "#f0f0f0")};
  padding: 16px 24px 20px;
`;

const InteractionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const InteractionBtn = styled.button<{ $isDark: boolean; active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: ${(p) => (p.active ? "#ff6b6b" : p.$isDark ? "#aaaaaa" : "#8e8e93")};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.15s ease;

  &:hover {
    background: ${(p) =>
      p.active ? (p.$isDark ? "#3d1a1a" : "#ffe6e6") : p.$isDark ? "#333333" : "#f8f9fa"};
    color: ${(p) => (p.active ? "#ff5252" : p.$isDark ? "#ffffff" : "#495057")};
  }

  svg {
    transition: transform 0.15s ease;
  }
  &:hover svg {
    transform: scale(1.1);
  }
`;

const PlaylistButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  max-width: 200px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  &:active {
    transform: translateY(0);
  }
`;

const PlaylistIcon = styled.svg`
  flex-shrink: 0;
`;

const PlaylistInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const PlaylistThumb = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
`;

const PlaylistTitle = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
`;

const CommentSectionWrapper = styled.div<{ show: boolean }>`
  border-top: 1px solid #f0f0f0;
  overflow: hidden;
  max-height: ${({ show }) => (show ? "1000px" : "0")};
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: max-height 0.44s cubic-bezier(0.43, 0.22, 0.16, 1), opacity 0.33s;
`;
