const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// API 키는 서버에만 저장
const API_KEY = process.env.YOUTUBE_API_KEY;

// 캐시 저장소 (검색 결과 저장을 위한 개발)
const cache = new Map(); // 검색어를 키로, 결과를 값으로 저장
const CACHE_TTL = 60 * 60 * 1000; // 1시간 (밀리초 단위)

if (!API_KEY) {
  console.error('❌ YouTube API 키가 설정되지 않았습니다.');
  console.error('server/.env 파일에 YOUTUBE_API_KEY를 설정해주세요.');
  process.exit(1);
}

// 캐시에서 데이터 가져오기 함수
function getFromCache(key) {
  const cached = cache.get(key);
  if (!cached) return null; // 캐시에 없음
  

  // 시간이 지났는지 확인 (TTL 체크)
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  console.log('💾 캐시에서 결과 반환:', key);
  return cached.data;
}

// 프론트엔드에서 오는 요청을 받아서 YouTube API로 전달
app.get('/api/search', async (req, res) => {
  try {
    const rawQ = req.query.q;
    const pageToken = (req.query.pageToken || '').toString();
    const query = (typeof rawQ === 'string' ? rawQ : '').trim();

    
    // 검색어 검증
  if (!query) {
    return res.status(400).json({
      error: '검색어를 입력해주세요.'
    });
  }

  // 캐시 키: 쿼리 + 페이지 토큰(무한스크롤 대비)
  const cacheKey = `search_${query}_${pageToken || 'first'}`;

    // 1단계: 캐시에서 먼저 확인
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // 2단계: 캐시에 없으면 기존 로직 실행
    console.log('🌐 YouTube search.list 호출:', query, pageToken ? `(pageToken=${pageToken})` : '');

    // YouTube API 호출
    const searchResp = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      new URLSearchParams({
        part: 'snippet',
        type: 'video',
        q: query,
        maxResults: 50,
        key: API_KEY,
        ...(pageToken ? { pageToken } : {})
      })
    );

    if (!searchResp.ok) {
      console.error('❌ YouTube search 오류:', searchResp.status);
      return res.status(searchResp.status).json({ error: `YouTube API 오류: ${searchResp.status}`}); 
    }

    const searchData = await searchResp.json();
    if (searchData.error) {
      console.error('❌ YouTube search 오류:', searchData.error);
      return res.status(400).json({ error: `Youtube API 오류: ${searchData.error.message}`});
    } 

    const searchItems = searchData.items || [];
    const ids = searchItems.map(v => v?.id?.videoId).filter(Boolean);
    const nextPageToken = searchData.nextPageToken || null;

    if (ids.length === 0) {
      const payload = {
        success: true,
        query,
        results: [],
        totalResults: 0,
        nextPageToken
      };
      cache.set(cacheKey, { data: payload, timestamp: Date.now() });
      return res.json(payload);
    }

    // 3단계 videos.list 상태/제한 확인
    console.log('🌐 YouTube videos.list 호출(상세 검사):', ids.length, '개');
    const videoResp = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      new URLSearchParams({
        part: 'status,contentDetails,snippet,statistics',
        id: ids.join(','),
        key: API_KEY
      })
    );

    if (!videoResp.ok) {
      console.error('❌ YouTube videos 오류:', videoResp.status);
      return res.status(videoResp.status).json({ error: `YouTube API 오류: ${videoResp.status}`});
    }

    const videosData = await videoResp.json();
    const details = videosData.items || [];

    // 허용 맵: 공개 + 임베드 가능 + 지역 차단 없음
    const allow = new Set(
      details
      .filter(v =>
        v?.status?.privacyStatus === 'public' &&
        v?.status?.embeddable === true &&
        !(v?.contentDetails?.regionRestriction?.blocked?.length > 0)
      )
      .map(v => v.id)
    );

    // 4) 원래 검색 순서 유지하면서 허용된 것만 남김
    const cleanItems = searchItems.filter(it => allow.has(it?.id?.videoId));

    const payload = {
      success: true,
      query,
      // ✅ 기존 필드 유지: results/totalResults
      results: cleanItems,
      totalResults: cleanItems.length,
      // ✅ 새 필드: 다음 페이지 토큰(무한 스크롤용)
      nextPageToken
    };

    // 5) 캐시에 저장
    cache.set(cacheKey, { data: payload, timestamp: Date.now() });

    return res.json(payload);
  } catch (error) {
    console.error('❌ 서버 오류:', error);
    res.status(500).json({ 
      error: '서버 오류가 발생했습니다.' 
    });
  }
});

// 서버 상태 확인 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'YouTube 검색 프록시 서버가 정상 작동 중입니다.',
    timestamp: new Date().toISOString()
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(' YouTube 검색 프록시 서버가 시작되었습니다!');
  console.log(`📍 서버 주소: http://localhost:${PORT}`);
  console.log(`🔑 API 키 상태: ${API_KEY ? '설정됨' : '설정되지 않음'}`);
  console.log(`🌐 프론트엔드: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log('📝 로그가 기록됩니다...');
});