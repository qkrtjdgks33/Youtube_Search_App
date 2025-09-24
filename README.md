# Youtube_Search_App

YouTube 검색 애플리케이션입니다. 사용자가 YouTube에서 동영상을 검색하고 결과를 확인할 수 있는 웹 애플리케이션입니다.

## 🚀 주요 기능

- **YouTube 동영상 검색**: 키워드 기반 실시간 검색
- **AI 음악 추천**: Gemini AI를 통해 노래 추천 결과 표시
- **로딩 상태 관리**: 검색 중 로딩과 유튜브에서 삭제 or 비공개 한 영상들(에러) 분리
- **무한 스크롤**: 자동 페이지 로딩으로 더 많은 결과 표시
- **비디오 플레이어**: 재생 버튼 클릭 시 YouTube 플레이어로 바로 재생 가능
- **스마트 캐싱**: 검색 결과 자동 캐싱으로 API 사용량 최적화

## 🛠️ 기술 스택

### Frontend
- **React 18** - 사용자 인터페이스 구축
- **TypeScript** - 타입 안전성과 개발 경험 향상
- **CSS3** - 모던하고 반응형 디자인
- **React Hooks** - 상태 관리 및 사이드 이펙트 처리

### Backend
- **Node.js** - 서버 런타임 환경
- **Express.js** - 웹 서버 프레임워크
- **CORS** - 크로스 오리진 요청 처리
- **메모리 캐시** - 검색 결과 캐싱 시스템

### API
- **YouTube Data API v3** - 동영상 검색 및 메타데이터 제공
- **Gemini API (Google Generative AI)** - 음악 추천
- **Google Cloud Console** - API 키 관리 및 할당량 모니터링

## 📁 프로젝트 구조

```
youtube-search-app/
├─ server/
│  ├─ .env                         # API 키/서버 설정 (YOUTUBE_API_KEY, GEMINI_API_KEY 등)
│  ├─ index.js                     # Express 서버: /api/search, /api/ai-search, 캐시, 헬스체크
│  ├─ package.json                 # 서버 의존성/스크립트
│  └─ package-lock.json
│
└─ src/
   ├─ App.tsx                      # 메인 페이지: 검색/AI 추천/목록/무한스크롤 연결
   ├─ App.css                      # (참조됨) 전반 스타일
   │
   ├─ components/
   │  ├─ AISearchBar.tsx           # AI 질의 입력폼(onAISearch)
   │  ├─ EmptyState.tsx            # 빈 결과 메시지
   │  ├─ ErrorMessage.tsx          # 에러 메시지(+재시도 버튼 옵션)
   │  ├─ LoadingSpinner.tsx        # 로딩 표시
   │  ├─ SearchBar.tsx             # 일반 검색 입력폼(onSearch, 2글자 검증)
   │  ├─ VideoItem.tsx             # 단일 카드(썸네일/제목/채널/재생 버튼, 선택 시 VideoPlayer 인라인 렌더)
   │  ├─ VideoList.tsx             # 비디오 목록 → VideoItem 반복 렌더
   │  └─ VideoPlayer.tsx           # react-youtube 플레이어(에러코드→한글 메시지)
   │
   ├─ services/
   │  ├─ aiApi.ts                  # POST /api/ai-search 호출(Gemini 추천)
   │  ├─ cache.ts                  # 프론트 메모리 캐시(1시간 TTL)
   │  └─ youtubeApi.ts             # GET /api/search 프록시 호출 + 응답 정규화 + 캐시
   │
   ├─ hooks/
   │  ├─ useAISearch.tsx           # AI 추천 훅(로딩/에러/추천문구 상태)
   │  └─ useYouTubeSearch.tsx      # 유튜브 검색 훅(첫 검색/다음 페이지/중복제거/무한스크롤)
   │
   ├─ constants/
   │  └─ search.ts                 # 검색 관련 상수(예: 최소 길이 등)
   │
   ├─ types/
   │  └─ youtube.ts                # YouTube API 응답 타입(YouTubeVideo 등)
   │
   └─ utils/
      └─ validation.ts             # (참조됨) getThumbnailUrl 등 유틸 — 파일은 아직 미업로드

```

## ⚙️ 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/qkrtjdgks33/Youtube_Search_App.git
cd youtube-search-app
```

### 2. 의존성 설치
```bash
# 루트 의존성 설치
npm install

# 서버 의존성 설치
cd server
npm install
cd ..
```

### 3. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# YouTube Data API 키
REACT_APP_YOUTUBE_API_KEY=your_youtube_api_key_here

# Gemini API 키
GEMINI_API_KEY=your_gemini_api_key_here

# 프론트엔드 환경에서 서버 URL을 가져오려면 .env 파일에 아래도 추가합니다:

REACT_APP_BACKEND_URL=http://localhost:5000

# 서버 포트 (선택사항)
PORT=5000
```

### 4. 애플리케이션 실행
```bash
# 개발 서버 실행 (React)
npm start

# 백엔드 서버 실행 (새 터미널에서)
cd server
npm start
```

## 🔑 API 설정

### YouTube Data API
[Google Cloud Console](https://console.cloud.google.com/)에 접속하여 새 프로젝트를 생성하거나 기존 프로젝트를 선택합니다.

### 2. YouTube Data API v3 활성화
- **API 및 서비스** → **라이브러리**로 이동
- "YouTube Data API v3"를 검색하고 활성화

### 3. API 키 생성
- **API 및 서비스** → **사용자 인증 정보**로 이동
- **사용자 인증 정보 만들기** → **API 키** 선택
- 생성된 API 키를 `.env` 파일에 추가

### 4. 할당량 및 제한사항
- **일일 할당량**: 기본 10,000 유닛
- **검색 요청**: 100 유닛/요청
- **채널 정보**: 1 유닛/요청
- **동영상 정보**: 1 유닛/요청


### Gemini API
-- **Google AI Studio**
-- 에서 Gemini API 키 발급

-- .env에 GEMINI_API_KEY로 저장

## 📖 사용법

1. **검색 시작**: 메인 페이지의 검색창에 찾고 싶은 동영상 키워드를 입력
2. **검색 실행**: Enter 키를 누르거나 검색 버튼 클릭
3. **결과 확인**: 검색 결과가 카드 형태로 표시됩니다
4. **동영상 정보**: 각 카드에는 제목, 채널명, 업로드 날짜, 썸네일이 포함됩니다
5. **AI 검색**: “AI로 노래 찾기” 입력창에 요청 입력 → Gemini 추천 결과 표시

## 🎨 주요 컴포넌트

- **SearchBar**: 사용자 입력을 받는 검색 컴포넌트
- **AISearchBar**: AI 검색 입력
- **VideoList**: 검색 결과를 그리드 형태로 표시
- **VideoItem**: 개별 동영상 정보를 카드로 표시
- **VideoPlayer**: Youtube 플레이어
- **LoadingSpinner**: 검색 중 로딩 상태 표시
- **ErrorMessage**: 에러 발생 시 사용자에게 알림
- **EmptyState**: 빈 결과 표시

## 🔒 보안 고려사항

- **API 키 보호**: `.env` 파일을 통해 API 키를 안전하게 관리(깃에 올리지 말 것)
- **환경 변수**: `REACT_APP_` 접두사로 클라이언트 사이드에서만 필요한 변수 관리
- **CORS 설정**: 서버에서 적절한 CORS 정책 설정


## ✅ 구현 완료 기능
- **프론트엔드 캐시**: 브라우저 메모리 기반 임시 캐시
- **백엔드 서버 캐시**: 서버 메모리 기반 영구 캐시
- **YouTube API 사용량 절약**: 동일 검색어 재검색 시 API 호출 없음
- **응답 속도 향상**: 캐시된 결과 즉시 반환
- **TTL 설정**: 캐시 유효 시간 1시간으로 자동 정리
  

## 🚀 추가 할 점

- **UI 개선**
- **CSS 분류**
- **API 활용 기능 추가**
- **즐겨찾기 + 재생목록 기능**
- **사용자 로그인 연동 (예: Firebase, Gogle OAuth)**

- 

