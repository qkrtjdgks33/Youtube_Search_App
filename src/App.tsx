import EmptyState from "./components/EmptyState";
import ErrorMessage from "./components/ErrorMessage";
import LoadingSpinner from "./components/LoadingSpinner";
import SearchBar from "./components/SearchBar";
import VideoList from "./components/VideoList";
import { useYouTubeSearch } from "./hooks/useYouTubeSearch";


function App() {
  const { videos, loading, error, handleSearch } = useYouTubeSearch();

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
      <h1>Youtube 검색 연습 사이트</h1>
      <SearchBar onSearch={handleSearch} loading={loading} />


      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && videos.length === 0 && <EmptyState />}

      <VideoList videos={videos} />

    </main>

  );
}

export default App;