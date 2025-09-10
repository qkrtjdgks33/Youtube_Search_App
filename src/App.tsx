import EmptyState from "./components/EmptyState";
import ErrorMessage from "./components/ErrorMessage";
import LoadingSpinner from "./components/LoadingSpinner";
import SearchBar from "./components/SearchBar";
import VideoList from "./components/VideoList";
import { useYouTubeSearch } from "./hooks/useYouTubeSearch";
import './App.css';
import { useEffect, useRef, useState } from "react";


function App() {
  const {
    videos, loading, loadingMore, error,
    hasMore, handleSearch, loadMore,
  } = useYouTubeSearch();

  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const handleVideoPlay = (videoId: string) => {
    setSelectedVideoId(videoId);
    setIsPlaying(true);
  };

  const handleVideoStop = () => {
    setSelectedVideoId(null);
    setIsPlaying(false);
  };
  
  // 무한 스크롤 부분
  const loaderRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!loaderRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "400px"}
    );
    io.observe(loaderRef.current);
    return () => io.disconnect();
  }, [loaderRef.current, loadMore]);

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
      <h1>Youtube 검색 사이트(박성한)</h1>
      <SearchBar onSearch={handleSearch} loading={loading || loadingMore} />

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && videos.length === 0 && <EmptyState />}

      <VideoList 
      videos={videos} 
      onVideoPlay={handleVideoPlay}
      selectedVideoId={selectedVideoId}
      />

       {/* 센티널: 더 받을 게 있고, 현재 추가 로딩 중이 아닐 때 표시 */}
      {hasMore && !loading && <div ref={loaderRef} style={{height: 1 }}/>}

       {/* 더 보기 버튼: 동일한 조건 */}
      {!loading && hasMore && (
        <button onClick={loadMore} className="play-button" style={{margin: "16px auto"}}>
         더보기
         </button>
      )}

    {loadingMore && <LoadingSpinner />}
    </main>
  );
}

export default App;