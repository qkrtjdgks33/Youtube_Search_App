// 백엔드 프록시 서버를 통한 YouTube 검색 API
// 보안을 위해 API 키는 백엔드에만 저장

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export async function searchVideos(query: string, init?: RequestInit) {
  const url = `${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { method: "GET", ...init});
  console.log("🌐백엔드 서버로 검색 요청:", query);
  
  try {
    console.log("🔑 API 키 확인됨, 요청 URL:", url);
    
    // fatch 옵션 병합 (signal 포함)
    const res = await fetch(url, {
      method: 'GET',
      ...init,
    });

    if (!res.ok) {
      console.error("❌ API 응답 오류:", res.status, res.statusText);
      throw new Error(`YouTube API 오류: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log("📡 백엔드 서버 응답:", data);
    
    if (data?.error) {
      // data.error가 문자열일 수도 있음 -> 안전 처리
      const msg = typeof data.error === 'string' ? data.error : data.error?.message || '알 수 없는 오류';
      console.error("❌ 백엔드 서버 오류:", msg);
      throw new Error(`YouTube API 오류: ${msg}`);
    }

    const items = data.results || [];
    console.log("✅ 검색 결과 개수:", items.length);
    
    return items;
  } catch (error) {
    console.error("❌ 백엔드 서버 호출 실패:", error);
    throw error;
  }
} 


