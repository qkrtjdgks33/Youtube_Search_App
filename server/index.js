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
function getFromCache(query) {
  const cacheKey = `search_${query}`;
  const cached = cache.get(cacheKey);

  if (!cached) {
    return null; // 캐시에 없음
  }

  // 시간이 지났는지 확인 (TTL 체크)
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(cacheKey);
    return null;
  }

  console.log('💾 캐시에서 결과 반환:', query);
  return cached.data;
}

// 프론트엔드에서 오는 요청을 받아서 YouTube API로 전달
app.get('/api/search', async (req, res) => {
  try {
    const { q: query } = req.query; // 검색어
    
    // 검색어 검증
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ 
        error: '검색어를 입력해주세요.' 
      });
    }

    // 1단계: 캐시에서 먼저 확인
    const cachedResult = getFromCache(query);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    // 2단계: 캐시에 없으면 기존 로직 실행
    console.log('🌐 YouTube API 호출:', query);

    // YouTube API 호출
    const youtubeResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=50&key=${API_KEY}`
    );

    if (!youtubeResponse.ok) {
      console.error('❌ YouTube API 오류:', youtubeResponse.status);
      return res.status(youtubeResponse.status).json({ 
        error: `YouTube API 오류: ${youtubeResponse.status}` 
      });
    }

    const data = await youtubeResponse.json();
    
    // YouTube API 오류 응답 확인
    if (data.error) {
      console.error('❌ YouTube API 오류:', data.error);
      return res.status(400).json({ 
        error: `YouTube API 오류: ${data.error.message}` 
      });
    }

    const items = data.items || [];
    console.log('✅ 검색 완료:', query, '결과:', items.length, '개');

    // 3단계: 결과를 캐시에 저장
    const cacheKey = `search_${query}`;
    cache.set(cacheKey, {
      data: {
        success: true,
        query: query,
        results: items,
        totalResults: items.length
      },
      timestamp: Date.now()
    });
    
    // 검색 결과 반환
    res.json({
      success: true,
      query: query,
      results: items,
      totalResults: items.length
    });

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