# Youtube_Search_App

YouTube 검색 애플리케이션입니다. 사용자가 YouTube에서 동영상을 검색하고 결과를 확인할 수 있는 웹 애플리케이션입니다.

## 🚀 주요 기능

- **YouTube 동영상 검색**: 키워드 기반 실시간 검색
- **동적 결과 표시**: 검색 결과를 카드 형태로 깔끔하게 표시
- **반응형 디자인**: 모바일과 데스크톱에서 모두 최적화된 UI
- **로딩 상태 관리**: 검색 중 로딩 스피너와 에러 처리

## 🛠️ 기술 스택

### Frontend
- **React 18** - 사용자 인터페이스 구축
- **TypeScript** - 타입 안전성과 개발 경험 향상
- **CSS3** - 모던하고 반응형 디자인

### Backend
- **Node.js** - 서버 런타임 환경
- **Express.js** - 웹 서버 프레임워크
- **CORS** - 크로스 오리진 요청 처리

### API
- **YouTube Data API v3** - 동영상 검색 및 메타데이터 제공
- **Google Cloud Console** - API 키 관리 및 할당량 모니터링

## 📁 프로젝트 구조

```
youtube-search-app/
├── src/                    # React 소스 코드
│   ├── components/        # 재사용 가능한 UI 컴포넌트
│   ├── hooks/            # 커스텀 React 훅
│   ├── services/         # API 서비스 로직
│   ├── types/            # TypeScript 타입 정의
│   └── utils/            # 유틸리티 함수
├── server/               # Express 서버 코드
├── public/               # 정적 파일
└── package.json          # 프로젝트 의존성
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

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 🔑 YouTube Data API 설정

### 1. Google Cloud Console 접속
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

## 📖 사용법

1. **검색 시작**: 메인 페이지의 검색창에 찾고 싶은 동영상 키워드를 입력
2. **검색 실행**: Enter 키를 누르거나 검색 버튼 클릭
3. **결과 확인**: 검색 결과가 카드 형태로 표시됩니다
4. **동영상 정보**: 각 카드에는 제목, 채널명, 업로드 날짜, 썸네일이 포함됩니다

## 🎨 주요 컴포넌트

- **SearchBar**: 사용자 입력을 받는 검색 컴포넌트
- **VideoList**: 검색 결과를 그리드 형태로 표시
- **VideoItem**: 개별 동영상 정보를 카드로 표시
- **LoadingSpinner**: 검색 중 로딩 상태 표시
- **ErrorMessage**: 에러 발생 시 사용자에게 알림

## 🔒 보안 고려사항

- **API 키 보호**: `.env` 파일을 통해 API 키를 안전하게 관리
- **환경 변수**: `REACT_APP_` 접두사로 클라이언트 사이드에서만 필요한 변수 관리
- **CORS 설정**: 서버에서 적절한 CORS 정책 설정

## 🚀 배포

### 빌드
```bash
npm run build
```

### 정적 호스팅
빌드된 `build` 폴더를 Netlify, Vercel, GitHub Pages 등에 배포할 수 있습니다.

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 [이슈](https://github.com/qkrtjdgks33/Youtube_Search_App/issues)를 생성해 주세요.

---

⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!
