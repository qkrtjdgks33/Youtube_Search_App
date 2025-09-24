import styled from "styled-components";
import { useMusicPlayer } from "./MusicFunction";
import { useTheme } from "./ThemeContext"; // ThemeContext 경로에 맞게 수정하세요

const Container = styled.div`
  padding: 2rem;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

const PlaylistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div<{ selected: boolean; $isDark: boolean }>`
  background-color: ${({ selected, $isDark }) => {
    if (selected) {
      return $isDark ? "#404040" : "#e3f2fd";
    }
    return $isDark ? "#2a2a2a" : "#ffffff";
  }};
  border: ${({ selected, $isDark }) => {
    if (selected) {
      return $isDark ? "2px solid #007aff" : "2px solid #1976d2";
    }
    return $isDark ? "1px solid #404040" : "1px solid #f0f0f0";
  }};
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${({ $isDark }) =>
    $isDark ? "0 2px 8px rgba(0, 0, 0, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.1)"};

  &:hover {
    background-color: ${({ selected, $isDark }) => {
      if (selected) {
        return $isDark ? "#505050" : "#bbdefb";
      }
      return $isDark ? "#363636" : "#f8f9fa";
    }};
    transform: translateY(-2px);
    box-shadow: ${({ $isDark }) =>
      $isDark
        ? "0 4px 16px rgba(0, 0, 0, 0.4)"
        : "0 4px 16px rgba(0, 0, 0, 0.15)"};
  }

  &:active {
    transform: translateY(0);
  }
`;

const Thumbnail = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 0.75rem;
  transition: transform 0.2s ease;

  ${Card}:hover & {
    transform: scale(1.02);
  }
`;

const Title = styled.p<{ $isDark: boolean }>`
  color: ${({ $isDark }) => ($isDark ? "#ffffff" : "#1a1a1a")};
  font-size: 0.9rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
  line-height: 1.4;
  transition: color 0.2s ease;
`;

export default function Playlist() {
  const { playlists, playPlaylist, currentPlaylistId } = useMusicPlayer();
  const { isDarkMode } = useTheme(); // 다크모드 상태 가져오기

  if (!playlists.length) {
    return (
      <Container>
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1rem",
            color: isDarkMode ? "#888888" : "#8e8e93",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎵</div>
          <h3
            style={{
              margin: "0 0 0.5rem 0",
              color: isDarkMode ? "#cccccc" : "#666666",
              fontWeight: "600",
            }}
          >
            재생목록이 없습니다
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "0.9rem",
              color: isDarkMode ? "#888888" : "#8e8e93",
            }}
          >
            첫 번째 재생목록을 추가해보세요
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <PlaylistGrid>
        {playlists.map((playlist) => (
          <Card
            key={playlist.id}
            selected={playlist.id === currentPlaylistId}
            $isDark={isDarkMode}
            onClick={() => {
              localStorage.setItem("last_playlist_id", playlist.id);
              localStorage.setItem("current_video_index", "0");
              playPlaylist(playlist.id);
            }}
          >
            <Thumbnail
              src={
                playlist.snippet.thumbnails?.medium?.url ||
                "https://via.placeholder.com/160"
              }
              alt={playlist.snippet.title}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/160?text=No+Image";
              }}
            />
            <Title $isDark={isDarkMode}>{playlist.snippet.title}</Title>
          </Card>
        ))}
      </PlaylistGrid>
    </Container>
  );
}
