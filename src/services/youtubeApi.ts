// 백엔드 프록시 서버를 통한 YouTube 검색 API
// 보안을 위해 API 키는 백엔드에만 저장

import { cacheManager } from "./cache";
import { YouTubeVideo } from "../types/youtube";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function normalizeQuery(q: string) {
  return q
  .normalize("NFC")
  .trim()
  .replace(/\s+/g," ")
  .toLowerCase();
}

export interface SearchResponse {
  success?: boolean;
  query: string;
  results: YouTubeVideo[];
  totalResults?: number;
  nextPageToken: string | null;
  error?: string;
}

function buildCacheKey(query: string, pageToken?: string) {
  return `youtube_search_${query}_${pageToken || "first"}`;
}

export async function searchVideosRaw(
  rawQuery: string,
   pageToken?: string,
    init?: RequestInit
  ): Promise<SearchResponse> {

  // 1단계: 캐시에서 먼저 확인
  const query = normalizeQuery(rawQuery);
  const cacheKey = buildCacheKey(query, pageToken);

  // 2단계 캐시에 없으면 API 호출
  const cached = cacheManager.get(cacheKey) as SearchResponse | undefined;
  if (cached) {
  console.log("캐시에서 데이터 반환!", cacheKey);
  return cached;
  }

  // 3단계: API 호출출
  const url = new URL(`${BACKEND_URL}/api/search`);
  url.searchParams.set("q", query);
  if (pageToken) url.searchParams.set("pageToken", pageToken);

  console.log("🌐 API 호출 시작!", query, pageToken ? `(pageToken=${pageToken})` : "");

  const res = await fetch(url.toString(), {method: "GET", ...init});
  if (!res.ok) {
     throw new Error(`YouTube API 오류: ${res.status} ${res.statusText}`);
   }

    const data = await res.json();

    if (data?.error) {
      const msg = 
        typeof data.error === "string"
          ? data.error
          : data.error?.message || "알 수 없는 오류";
        throw new Error(`YouTube API 오류: ${msg}`);
    }
  
    // 4단계 서버 페이즈로드 정규화(안전하게 기본값 보강)
    const payload: SearchResponse = {
      success: data.success,
      query: data.query ?? query,
      results: (data.results as YouTubeVideo[]) ?? [],
      totalResults: data.totalResults ?? (data.results?.length ?? 0),
      nextPageToken: data.nextPageToken ?? null,
    };

    // 5단계 캐시에 저장
    cacheManager.set(cacheKey, payload);

    return payload;
  }

  export async function searchVideos(rawQuery:string, init?:RequestInit) {
    const { results } = await searchVideosRaw(rawQuery, undefined, init);
    return results
  }

  export async function searchVideosNext(
    rawQuery:string,
    nextPageToken: string,
    init?: RequestInit
  ) {
    return searchVideosRaw(rawQuery,nextPageToken, init);
  }

  



