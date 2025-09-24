import EmptyState from "./components/EmptyState";
import ErrorMessage from "./components/ErrorMessage";
import LoadingSpinner from "./components/LoadingSpinner";
import SearchBar from "./components/SearchBar";
import VideoList from "./components/VideoList";
import { useYouTubeSearch } from "./hooks/useYouTubeSearch";
import AISearchBar from "./components/AISearchBar";
import './App.css';
import { useAISearch } from "./hooks/useAISearch";
import { useEffect, useRef, useState } from "react";


function App() {
  const {
    videos, loading, loadingMore, error,
    hasMore, handleSearch, loadMore,
  } = useYouTubeSearch();

  const { recommendations, loading: aiLoading, error: aiError, searchWithAI} = useAISearch();
  
  console.log('🔍 App.tsx - AI 훅 상태:', { recommendations, aiLoading, aiError, searchWithAI });

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

      {/* AI 검색 바 추가*/}
      <div style={{background: 'red', padding: '10px', margin: '10px 0'}}>
        <AISearchBar onAISearch={searchWithAI} loading={aiLoading} />
      </div>

      {/* AI 추천 결과 표시 */}
      {recommendations && (
        <div style={{
          background: '#e8f5e8',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #4caf50'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>🤖 AI 추천 결과</h3>
          <p style={{ 
            margin: 0,
            lineHeight: ' 1.8',
            whiteSpace: 'pre-line'
             }}>{recommendations}</p>
        </div>
      )}

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {aiError && <ErrorMessage message={aiError} />}
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