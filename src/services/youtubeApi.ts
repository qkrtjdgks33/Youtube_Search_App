// 백엔드 프록시 서버를 통한 YouTube 검색 API
// 보안을 위해 API 키는 백엔드에만 저장

import { cacheManager } from "./cache";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function normalizeQuery(q: string) {
  return q
  .normalize("NFC")
  .trim()
  .replace(/\s+/g," ")
  .toLowerCase();
}

export async function searchVideos(rawQuery: string, init?: RequestInit) {

  // 1단계: 캐시에서 먼저 확인
  const query = normalizeQuery(rawQuery);
  const cacheKey = `youtube_search_${query}`;
  // const cachedResult = cacheManager.get(cacheKey);

  // if (cachedResult) {
  //   console.log("캐시에서 데이터 반환!");
  //   return cachedResult;
  // }

  // 2단계 캐시에 없으면 API 호출
  console.log("API 호출 시작!", query);

  const url = `${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      ...init,
    });

    if (!res.ok) {
      throw new Error(`YouTube API 오류: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (data?.error) {
      const msg = typeof data.error === `string` ? data.error : data.error?.message || `알 수 없는 오류`;
      throw new Error(`YouTube API 오류: ${msg}`);
    }

    const items = data.results || [];
    console.log("API 호출 성공, 결과 개수:", items.length);

    // 3단계: 결과를 캐시에 저장
    cacheManager.set(cacheKey, items);

    return items;
  } catch (error) {
    console.error("API 호출 실패:", error);
    throw error;
    
  }
} 


