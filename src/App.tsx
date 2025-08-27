import EmptyState from "./components/EmptyState";
import ErrorMessage from "./components/ErrorMessage";
import LoadingSpinner from "./components/LoadingSpinner";
import SearchBar from "./components/SearchBar";
import VideoList from "./components/VideoList";
import { useYouTubeSearch } from "./hooks/useYouTubeSearch";
import './App.css';
import { useState } from "react";


function App() {
  const { videos, loading, error, handleSearch } = useYouTubeSearch();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVideoPlay = (videoId: string) => {
    setSelectedVideoId(videoId);
    setIsPlaying(true);
  };

  const handleVideoStop = () => {
    setSelectedVideoId(null);
    setIsPlaying(false);
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
      <h1>Youtube 검색 연습 사이트</h1>
      <SearchBar onSearch={handleSearch} loading={loading} />


      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && videos.length === 0 && <EmptyState />}

      <VideoList 
      videos={videos} 
      onVideoPlay={handleVideoPlay}
      selectedVideoId={selectedVideoId}
      />

    </main>

  );
}

export default App;