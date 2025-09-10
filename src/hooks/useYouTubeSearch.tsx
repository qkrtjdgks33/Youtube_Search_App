import { useCallback, useState } from "react";
import { YouTubeVideo } from "../types/youtube";
import { searchVideos, searchVideosNext, searchVideosRaw } from "../services/youtubeApi";

export function useYouTubeSearch() {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [keyword, setKeyword] = useState("");
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false); // 첫 페이지 로딩
    const [loadingMore, setLoadingMore] = useState(false) // 다음 페이지 로딩
    const [error, setError] = useState<string | null>(null);

    // 첫 검색
    const handleSearch = useCallback(async (raw: string) => {
        const q = raw.trim();
        if (q.length < 2) {
            setError("검색어는 2자 이상이어야 합니다.");
            return;
        }
        setKeyword(q);
        setVideos([]);
        setNextPageToken(null);
        setError(null);
        setLoading(true);
        try {
            const data = await searchVideosRaw(q);
            setVideos(data.results);
            setNextPageToken(data.nextPageToken ?? null);
        } catch (e: any) {
            setError(e?.message || "검색 중 오류가 발생하였습니다.");
        } finally {
            setLoading(false);
        }
    }, []);

    // 다음 페이지
    const loadMore = useCallback(async () => {
        if (!keyword || !nextPageToken || loadingMore) return;
        setLoadingMore(true);
        try {
            const data = await searchVideosNext(keyword, nextPageToken);
            // 중복 제거
            const exist = new Set(videos.map(v => v?.id?.videoId));
            const append = data.results.filter(v => !exist.has(v?.id?.videoId));
            setVideos(prev => [...prev, ...append]);
            setNextPageToken(data.nextPageToken ?? null);
        } catch {
            // 필요시 setError 추가
        } finally {
            setLoadingMore(false);
        }
    }, [keyword, nextPageToken, loadingMore, videos]);

    const hasMore = !!nextPageToken;

    return { 
        videos,
        loading,
        loadingMore,
        error,
        hasMore,
        keyword,
        handleSearch,
        loadMore,
    };
}