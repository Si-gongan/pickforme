# 🛒 픽포미 (Pick for Me)

> 시각장애인을 위한 **AI 기반 상품 정보 접근성** 서비스

쿠팡 링크 입력 또는 추천 상품 선택만으로 **상품 이미지·리뷰를 분석**해 **고품질 대체 텍스트**를 제공하고, **자연어 Q&A**와 **매니저 문의**로 누구나 쉽고 빠르게 상품 정보를 확인할 수 있는 서비스입니다.

<p align="left">
  <a href="#"><img alt="Node" src="https://img.shields.io/badge/Node.js-18+-brightgreen"></a>
  <a href="#"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-blue"></a>
  <a href="#"><img alt="React Native" src="https://img.shields.io/badge/React%20Native-0.7x-61dafb"></a>
  <a href="#"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-13+-000000"></a>
  <a href="#"><img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas-47a248"></a>
  <a href="#"><img alt="CI" src="https://img.shields.io/badge/GitHub-Actions-2088FF"></a>
</p>

---

## 📑 목차

- [프로젝트 개요](#-프로젝트-개요)
- [아키텍처 요약](#-아키텍처-요약)
- [데이터 흐름](#-데이터-흐름)
- [배포·인프라](#-배포인프라)
- [기술 스택](#-기술-스택)
- [모노레포 구조](#-모노레포-구조)
- [빠른 시작](#-빠른-시작)
- [환경 변수](#-환경-변수)
- [주요 기능](#-주요-기능)
- [테스트](#-테스트)
- [배포 가이드](#-배포-가이드)
- [보안·접근성 정책](#-보안접근성-정책)
- [문의](#-문의)

---

## 📋 프로젝트 개요

- **대체 텍스트 자동 생성**: 상품 이미지/리뷰 분석 → 접근성 정보 제공
- **AI 질의응답 / 매니저 문의**: 상품 관련 자연어 Q&A + 실시간 상담
- **접근성 최적화 UI**: iOS VoiceOver / Android TalkBack 완전 지원

---

## 🧱 아키텍처 요약

| 레이어         | 구성요소                                      | 주요 책임                                 | 호스팅/런타임         |
| -------------- | --------------------------------------------- | ----------------------------------------- | --------------------- |
| **클라이언트** | Mobile App(React Native), Admin(Next.js)      | 링크 입력, 결과 표시, 분석 대시보드       | iOS/Android, Vercel   |
| **백엔드 API** | Node.js(Koa), Socket.io, Nginx(Reverse Proxy) | 비즈니스 로직, 외부 연동, 인증, 캐싱/SSL  | AWS EC2               |
| **AI 연동**    | OpenAI, Google Gemini                         | 이미지 분석, 텍스트 변환, Q&A             | 외부 API              |
| **데이터**     | MongoDB Atlas(Primary), BigQuery(Analytics)   | 상품·사용자·접근성 로그 저장, 통계/리포팅 | Atlas, GCP            |
| **CI/CD**      | GitHub Actions, Docker, PM2                   | 테스트/빌드/배포 자동화                   | GitHub, EC2           |
| **보안**       | HTTPS, JWT, Secrets 관리                      | 전송/저장 보안, 키 관리                   | Nginx, GitHub Secrets |

> 복잡한 박스/다이어그램 대신 **표와 불릿**으로 핵심 정보를 요약해 GitHub에서 깨짐 없이 읽히도록 구성했습니다.

---

## 🔁 데이터 흐름

1. **사용자**가 쿠팡 링크를 앱에 입력하거나 추천 상품을 선택합니다.
2. 원본을 **AI 서비스(OpenAI/Gemini)**에 전달해 **캡셔닝·OCR·요약**을 수행합니다.
3. 결과를 **접근성 스키마**에 맞춰 정규화하고 **MongoDB**에 저장합니다.
4. 성공/실패/지연 정보는 **접근성 로그**로 기록되고, 집계는 **BigQuery**로 수집되어 **Admin 대시보드**에서 시각화합니다.
5. 앱은 **REST/WebSocket**으로 결과를 구독하고, 필요 시 **쿠팡 구매 버튼**으로 연결합니다.

---

## 🌐 배포·인프라

- **Mobile**: React Native + Expo (iOS/Android)
- **Admin**: Vercel (Next.js · SSR/SSG · CDN)
- **Backend**: AWS EC2 + Nginx (Reverse Proxy/SSL/캐싱)
- **Database**
  - MongoDB Atlas: 상품/사용자/접근성 로그/세션 (Primary)
  - Google BigQuery: 사용자 분석/성공률 통계 (Analytics)
- **AI 연동**: Google Gemini, OpenAI (이미지 분석/텍스트 변환)
- **CI/CD**: GitHub Actions (자동 테스트/빌드/배포, Docker)
- **암호화**: HTTPS(SSL), JWT 기반 인증

---

## 🛠 기술 스택

**Backend (`/back`)**

- Runtime: Node.js · Lang: TypeScript · Framework: Koa.js
- DB: MongoDB(Mongoose) · Auth: JWT · RT: Socket.io
- AI: OpenAI, Gemini · Scraping: Playwright/Puppeteer
- Analytics: BigQuery, Firebase Analytics · Tests: Jest
- Proc: PM2

**Frontend (`/front`)**

- React Native · Expo Router · 상태: Jotai · UI: React Native Paper
- 접근성: VoiceOver/TalkBack · Auth: Google/Apple/Kakao
- 결제: React Native IAP(멤버십) · RT: Socket.io Client
- Tests: Jest, React Native Testing Library · Build: EAS

**Admin (`/admin`)**

- Next.js 13 · UI: Ant Design · 상태: Jotai · 차트: Recharts
- Auth: Google OAuth · Analytics: Firebase/BigQuery · RT: Socket.io

---

## 📁 모노레포 구조

```
pickforme/
├─ back/                   # 백엔드 API
│  ├─ src/
│  │  ├─ feature/          # 도메인별 로직 정리
│  │  ├─ models/           # DB 모델
│  │  ├─ router/           # API 라우터
│  │  ├─ services/         # 비즈니스 로직
│  │  ├─ scripts/          # 마이그레이션, 이벤트 처리 등에 사용되었던 스크립트들 저장.
│  │  ├─ middleware/       # 공통 미들웨어
│  │  ├─ scheduler/        # 배치/크론
│  │  ├─ cache/            # 공통적으로 사용되는 캐시 모듈
│  │  └─ utils/
│  └─ package.json
├─ front/                  # 모바일 앱
│  ├─ app/                 # Expo Router
│  │  ├─ (tabs)/
│  │  ├─ (onboarding)/
│  │  └─ (settings)/
│  ├─ components/ hooks/ stores/ services/
│  └─ package.json
├─ admin/                  # 관리자 대시보드
│  ├─ src/pages/analytics, src/pages/log
│  ├─ components/ stores/ hooks/
│  └─ package.json
└─ docker-compose.dev.yml
```

---

## ⚡ 백엔드 개발환경 시작.

### 1) 사전 요구사항

- Docker & Docker Compose
- (모바일) Xcode / Android Studio

### 2) 설치

```bash
git clone https://github.com/junseok44/pickforme
cd pickforme
```

## 3) 🔐 환경 변수

각 서비스 루트에 `.env.local`(또는 `.env`)을 생성하세요.
환경변수 내용은 픽포미 노션 > 3.0 개발문서 > .ENV 페이지에 있습니다.
back 부분의 .env.local back 폴더에, admin 부분의 .env.local 파일을 admin 폴더에 복사해주세요.

## 3-1) 데이터베이스 시드

pickforme-dev 덤프 폴더를 back/backups 폴더에 복사하시고 컨테이너를 실행하시면
데이터베이스 초기화 과정에서 자동으로 백업 데이터가 insert됩니다.

### 3) 개발용 도커 실행

```bash

# MongoDB, Backend, Admin 동시 실행
./scripts/dev-up.sh
# 혹은
docker-compose -f docker-compose.dev.yml up -d
# 또는 개별 서비스
docker-compose -f docker-compose.dev.yml up db server admin
```

서버 -> 3001 포트
어드민 -> 3000 포트에서 접근 가능.

### 4) 서비스별 로컬 실행

```bash
# Backend
cd back
npm install
npm run dev

# Frontend
cd ../front
yarn install
yarn start

# Admin
cd ../admin
npm install
npm run dev
```

## 📱 주요 기능

**모바일 앱**

- 쿠팡 링크/추천 → 이미지·리뷰 분석 → **대체 텍스트 제공**
- **AI 챗봇**(Q&A), **매니저 실시간 문의**(WebSocket)
- 검색/필터, 위시리스트, 멤버십(IAP), 구매 연결(쿠팡)

**관리자 대시보드**

- **성공률 모니터링**, 사용자 분석(Firebase/BigQuery)
- 시스템 로그/에러 추적, 공지/푸시 관리

**백엔드 API**

- REST + WebSocket
- AI 연동(이미지 분석/텍스트 변환/Q&A)
- 크롤링(쿠팡 상품 수집/파싱)
- 접근성 로깅(성공/실패/지연)

---

## 🧪 테스트

```bash
# Backend
cd back
npm run test
npm run test:coverage

# Frontend
cd ../front
yarn test

# Admin
cd ../admin
npm run test
```

---

## 🚀 배포 가이드

**모바일 앱 (EAS 예시)**

```bash
cd front
yarn update:staging     # 스테이징
yarn update:production  # 프로덕션
```

**백엔드 (PM2 예시)**

```bash
cd back
npm run build
npm run pm2
```

**관리자 대시보드 (Vercel)**

```bash
cd admin
npm run build
npm run start
```

**GitHub Actions**

- PR 시: Lint/Test → Preview (옵션)
- main 병합 시: Docker 빌드 → EC2 배포 / Vercel 프로덕션 Promote

---

## 🔒 보안·접근성 정책

- **보안**: HTTPS 전면 적용, JWT 만료/갱신, 민감정보는 KMS/Secrets Manager 또는 GitHub Secrets 관리
- **접근성**: 스크린리더 라벨, 포커스 순서, 색 대비 준수, 이미지 ALT 자동/수동 병행 제공

---

## 📬 문의

- 운영/보안 이슈, 기여 제안은 관리자에게 문의해 주세요.
