import { YouTubeVideo } from "../types/youtube";
import { getThumbnailUrl } from "../utils/validation";

interface VideoItemProps {
  video: YouTubeVideo;
}

export default function VideoItem({ video }: VideoItemProps) {
   // 로그 추가
  
  // video 객체가 유효한지 확인
  if (!video || !video.snippet) {
    console.warn("⚠️ 유효하지 않은 비디오 데이터:", video); // 로그 추가
    return (
      <div style={{ border: "1px solid red", margin: "8px", padding: "8px" }}>
        <p>비디오 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const { snippet } = video;
  const thumbnailUrl = getThumbnailUrl(snippet.thumbnails);
  const title = snippet.title || "제목 없음";
  const channelTitle = snippet.channelTitle || "채널명 없음";

  return (
    <div style={{ border: "1px solid gray", margin: "8px", padding: "8px" }}>
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt={title}
          style={{ maxWidth: "100%", height: "auto" }}
          onError={(e) => {
            console.error("❌ 썸네일 로드 실패:", thumbnailUrl); // 로그 추가
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      <h3>{title}</h3>
      <p>{channelTitle}</p>
    </div>
  );
}
  