import { useRef, useState } from "react";
import { searchVideos } from "../services/youtubeApi";
import { YouTubeVideo } from "../types/youtube";
import { MIN_SEARCH_LENGTH } from "../constants/search";


export function useYouTubeSearch() {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const handleSearch = async (keyword: string) => {
        const q = keyword.trim();
        if (!q || q.length < MIN_SEARCH_LENGTH) return;

        try {
            setLoading(true);
            setError(null);

            if (abortRef.current) abortRef.current.abort();
            abortRef.current = new AbortController();

            const results = await searchVideos(q, { signal: abortRef.current.signal });
            setVideos(Array.isArray(results) ? results : []);
        } catch (e: any) {
            if (e?.name !== "AbortError") {
                setError("오류가 발생했습니다. 다시 시도하세요");
                setVideos([]);
            }
        } finally {
            setLoading(false);
        }
    };

    return { videos, loading, error, handleSearch };
}