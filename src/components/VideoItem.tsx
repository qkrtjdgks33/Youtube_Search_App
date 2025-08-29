import { YouTubeVideo } from "../types/youtube";
import { getThumbnailUrl } from "../utils/validation";
import VideoPlayer from "./VideoPlayer";

interface VideoItemProps {
  video: YouTubeVideo;
  onVideoPlay: (videoId: string) => void;
  selectedVideoId: string | null;
}

export default function VideoItem({ video, onVideoPlay, selectedVideoId }: VideoItemProps) {
   // 로그 추가
  
  // video 객체가 유효한지 확인
  if (!video || !video.snippet) {
    console.warn("⚠️ 유효하지 않은 비디오 데이터:", video); // 로그 추가
    return (
      <div className="video-card--error">
        <p>비디오 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const isSelected = selectedVideoId === video.id.videoId;
  const { snippet } = video;
  const thumbnailUrl = getThumbnailUrl(snippet.thumbnails);
  const title = snippet.title || "제목 없음";
  const channelTitle = snippet.channelTitle || "채널명 없음";

  const handlePlayClick = () => {
    onVideoPlay(video.id.videoId);
  };

  return (
    <div className="video-card">
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt={title}
         className="video-thumbnail"
          onError={(e) => {
            console.error("❌ 썸네일 로드 실패:", thumbnailUrl); // 로그 추가
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      <h3>{title}</h3>
      <p>{channelTitle}</p>
      
      <button onClick={handlePlayClick} className="play-button">
        ▶ 재생
      </button>

      {isSelected && (
        <VideoPlayer
        videoId={video.id.videoId}
        onClose={() => onVideoPlay('')}
        />
      )}
    </div>
  );
}
  