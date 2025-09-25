# Knowledge Base Service

## 개요
Corporate Nexus Stream의 핵심 지식 저장소 서비스입니다. 2025-09-26 기준으로 **NestJS Documents 모듈**과 **Prisma** 기반의 실제 문서 CRUD, 버전 관리, 태그 시스템이 구현되었으며, 향후 에디터, 검색, 협업 기능을 순차적으로 확장할 예정입니다.

## 현재 구현 상태 (2025-09-26)
- ✅ `POST /documents` 문서 생성 (JWT 인증 필요)
- ✅ `GET /documents` 페이지네이션 목록 조회 (필터: 타입, 발행 여부)
- ✅ `GET /documents/:id` 단일 문서 조회 + 조회수 증가
- ✅ `PATCH /documents/:id` 문서 수정 (버전 기록 자동 생성)
- ✅ `DELETE /documents/:id` 문서 삭제 (작성자 본인만)
- ✅ `GET /documents/search?q=` 태그/제목/본문 기반 부분 검색
- ✅ `GET /documents/:id/versions` 최근 버전 히스토리 조회
- ✅ `GET /documents/category/:categoryId` 카테고리별 문서 목록
- ✅ Prisma 모델: `Document`, `DocumentVersion`, `Category`, `Tag`, `Comment`
- ⚠️ 파일 첨부, 고급 검색(Elasticsearch), 권한/공유 설정은 **미구현**

## 주요 기능 로드맵

### 1. 지식 문서 관리
- ✅ 생성/수정/삭제 API 구현 (`documents.service.ts`)
- ✅ 버전 관리 (변경 시 `DocumentVersion` 기록)
- ✅ 카테고리 및 태그 관계 설정 (Prisma `connectOrCreate`)
- ☐ 문서 템플릿 시스템
- ☐ 문서 승인/게시 워크플로우
- ☐ 라이프사이클 관리 (보존/아카이브)

### 2. 콘텐츠 및 편집 경험
- ✅ 기본 텍스트 컨텐츠 저장 (Markdown/HTML 문자열)
- ☐ Rich Text Editor (Tiptap/Monaco) 연동
- ☐ 이미지/파일 첨부 (S3/MinIO)
- ☐ 문서 내 링크/메타데이터 자동 추출
- ☐ 공동 편집 (실시간 협업) 기능

### 3. 검색 및 탐색
- ✅ 단순 텍스트/태그 검색 (`findMany` + `contains`)
- ☐ Elasticsearch 연동 및 스코어링
- ☐ 필터/정렬 UX (카테고리, 작성자, 태그, 날짜)
- ☐ 추천/연관 문서 (AI Insights 연계)
- ☐ 즐겨찾기/북마크 시스템

### 4. 권한 및 보안
- ✅ JWT 기반 인증 + 작성자 검증
- ☐ 문서 권한(공개/비공개/팀 공유) 모델
- ☐ 감사 로그 및 액세스 이력
- ☐ 콘텐츠 승인 워크플로우 및 감사 단계

## 기술 스택

### Frontend
- **Framework**: React 18 + TypeScript
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: TanStack Query + Zustand
- **Editor**: Monaco Editor 또는 Tiptap
- **Styling**: Tailwind CSS

### Backend (현행)
- **Framework**: NestJS 10 (Express Adapter)
- **Modules**: `DocumentsModule`, `AuthModule`, `PrismaModule`
- **Database**: PostgreSQL 15 (Docker Compose)
- **ORM**: Prisma Client (Generated @ `backend/generated/prisma`)
- **Authentication**: JWT (Access Token)
- **Validation**: `class-validator`

### Backend (계획)
- Redis 기반 캐싱/세션
- Elasticsearch 검색 인덱스
- MinIO/S3 파일 저장 연동
- WebSocket 기반 협업 (Socket.IO)

### 인프라
- **Container**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack

## 데이터 모델

### Prisma 모델 발췌
```prisma
model Document {
  id          String    @id @default(uuid())
  title       String
  content     String
  type        DocumentType
  authorId    String
  categoryId  String?
  isPublished Boolean   @default(false)
  version     Int       @default(1)
  viewCount   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  author      User      @relation(fields: [authorId], references: [id])
  category    Category? @relation(fields: [categoryId], references: [id])
  tags        Tag[]
  comments    Comment[]
  versions    DocumentVersion[]
}

model DocumentVersion {
  id         String   @id @default(uuid())
  documentId String
  content    String
  version    Int
  changelog  String?
  createdAt  DateTime @default(now())
  createdBy  String
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
}

model Category {
  id         String     @id @default(uuid())
  name       String     @unique
  parentId   String?
  documents  Document[]
  children   Category[] @relation("CategoryTree")
  parent     Category?  @relation("CategoryTree", fields: [parentId], references: [id])
}

model Tag {
  id        String     @id @default(uuid())
  name      String     @unique
  documents Document[]
}
```

## API 설계

### REST API (NestJS `DocumentsController`)
```http
POST   /documents                    # 문서 생성 (JWT 필요)
GET    /documents?page=&limit=&type= # 목록 조회
GET    /documents/search?q=          # 간단 검색
GET    /documents/:id                # 단일 문서 + 댓글/버전 일부
GET    /documents/:id/versions       # 버전 히스토리 (최근 5개)
GET    /documents/category/:id       # 카테고리별 문서 리스트
PATCH  /documents/:id                # 문서 수정 (작성자만)
DELETE /documents/:id                # 문서 삭제 (작성자만)
```

### 응답 페이로드 예시
```jsonc
{
  "data": [
    {
      "id": "...",
      "title": "Getting Started with Nexus Stream",
      "type": "GUIDE",
      "isPublished": true,
      "viewCount": 12,
      "tags": [ { "id": "...", "name": "getting-started" } ],
      "author": {
        "id": "...",
        "name": "Admin User",
        "email": "admin@nexus-stream.com"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

## 구현 단계

### Phase 1: Backend MVP (완료)
- [x] Prisma 스키마 설계 (Document, Category, Tag, Version, Comment)
- [x] NestJS DocumentsModule + Service + Controller 구현
- [x] JWT 인증 연동 및 작성자 권한 체크
- [x] 기본 검색/필터/페이지네이션

### Phase 2: 프론트엔드 통합 (진행 예정)
- [ ] 문서 리스트/상세 페이지 (React + TanStack Query)
- [ ] 문서 작성/편집 UI (Tiptap)
- [ ] 태그/카테고리 선택 UX
- [ ] 문서 히스토리/비교 UI

### Phase 3: 검색 & 협업 (예정)
- [ ] Elasticsearch 통합 및 인덱싱 파이프라인
- [ ] 고급 필터/정렬 기능
- [ ] 문서 즐겨찾기, 추천 시스템
- [ ] 실시간 편집/댓글/알림 (Team Collaboration 연계)

### Phase 4: 운영 및 품질 (예정)
- [ ] 캐싱 전략 (Redis)
- [ ] 권한/공유 정책 고도화
- [ ] 백업/아카이브 전략
- [ ] 접근성(i18n, a11y) 및 모바일 대응

## 성능 요구사항 (초기 가이드)
- **API 응답 시간**: < 500ms (p95, 로컬 기준)
- **검색 속도**: 기본 Prisma 검색 < 500ms / Elasticsearch 도입 후 < 200ms (p95)
- **동시 사용자**: Pre-MVP 100명, GA 목표 1,000명 동시 접속
- **가용성**: 개발 단계 95%, GA 이후 99.9%

## 보안 요구사항
- **인증**: JWT Access Token (Refresh Token 도입 예정)
- **권한**: 작성자/관리자 기반 접근 제어 (RBAC 확장 예정)
- **데이터 암호화**: 전송 중 TLS, 저장 시 DB 암호화 옵션 검토
- **감사 로그**: Prisma Middleware 기반 변경 이력 로깅 (예정)
- **백업**: PostgreSQL WAL/스냅샷 백업 전략 수립 (예정)

## 테스트 전략
- **Unit Tests**: `DocumentsService` 메서드 단위 검증 (Mock Prisma)
- **Integration Tests**: Supertest 기반 REST API 시나리오
- **E2E Tests**: Auth + Documents 플로우 (등록 → 문서 생성 → 조회 → 수정)
- **Performance Tests**: Prisma Query 성능 측정, Elasticsearch 도입 시 재평가

## 모니터링 및 로깅
- **현재**: Nest Logger + Console 출력 (개발용)
- **예정**: Winston + ELK Stack, OpenTelemetry Metrics
- **알림**: PagerDuty/Slack 연동 계획
- **대시보드**: Grafana 대시보드 템플릿 설계 예정

## 배포 및 운영
- **환경**: Development (로컬 Docker) → Staging/Production (Kubernetes 예정)
- **CI/CD**: GitHub Actions + ArgoCD 파이프라인 설계 예정
- **배포 전략**: Rolling Update + Blue/Green (장기 목표)
- **롤백**: Prisma Migrate Rollback, Docker 이미지 핫픽스 절차 마련 예정

## 참고 자료
- [시장 조사 보고서](./research/knowledge-base-market-analysis.md)
- [사용자 요구사항](./requirements/knowledge-base-requirements.md)
- [기술 아키텍처](./architecture/knowledge-base-architecture.md)