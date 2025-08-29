import { YouTubeVideo } from "../types/youtube";
import VideoItem from "./VideoItem";


interface VideoListProps {
  videos: YouTubeVideo[];
  onVideoPlay: (videoId: string) => void;
  selectedVideoId: string | null;
}

export default function VideoList({ videos, onVideoPlay, selectedVideoId }: VideoListProps) {
  console.log("📋 VideoList 렌더링, videos:", videos); // 로그 추가
  
  // videos가 없거나 빈 배열인 경우 처리
  if (!videos || videos.length === 0) {
    console.log("📭 비디오가 없음"); // 로그 추가
    return (
      <div className="empty-state">
        <p>검색어를 입력하여 비디오를 찾아보세요!</p>
      </div>
    );
  }

  console.log("🎬 비디오 렌더링 시작, 개수:", videos.length); // 로그 추가
  
  return (
    <div>
      {videos.map((video, index) => {
        console.log(`🎥 비디오 ${index + 1} 렌더링:`, video.snippet?.title); // 로그 추가
        return (
          <VideoItem key={video.id?.videoId || index}
           video={video}
           onVideoPlay={onVideoPlay}
           selectedVideoId={selectedVideoId}
           />
        );
      })}
    </div>
  );
}
