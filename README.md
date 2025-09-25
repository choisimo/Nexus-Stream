# Corporate Nexus Stream

> 🚀 **차세대 기업용 지식 관리 및 AI 기반 협업 플랫폼**

## 📋 프로젝트 개요

Corporate Nexus Stream은 조직의 암묵지를 형식지로 변환하고 AI 기반 인사이트를 제공하는 엔터프라이즈급 지식 관리 플랫폼입니다.

### 🎯 핵심 가치
- **지식의 체계화**: 흩어진 조직 지식을 중앙화하고 구조화
- **AI 기반 인사이트**: 데이터 패턴 분석을 통한 의사결정 지원
- **실시간 협업**: 팀 간 원활한 소통과 문서 공동 작업
- **경험 자산화**: 개인의 노하우를 조직의 자산으로 전환

## 🏗️ 프로젝트 현황

| 구분 | 상태 | 완성도 |
|------|------|--------|
| Frontend UI | ⚠️ 부분 구현 | 30% |
| Backend Services | ❌ 미구현 | 0% |
| Database | ❌ 미구축 | 0% |
| Infrastructure | ❌ 미구성 | 0% |
| **전체 진행률** | 🔴 **개발 초기** | **5%** |

> ⚠️ **중요**: 현재 프로덕션 배포 불가 상태. 상세 내용은 [배포 준비 문서](/docs/tasks/00-production-deployment-tasks.md) 참조

## 🛠️ 기술 스택

### Frontend (현재 구현)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI + shadcn/ui  
- **Styling**: Tailwind CSS
- **State Management**: Zustand (예정)
- **Data Fetching**: TanStack Query (예정)

### Backend (구현 예정)
- **Runtime**: Node.js + NestJS
- **Language**: TypeScript
- **API**: REST + GraphQL + WebSocket
- **Databases**: 
  - PostgreSQL (primary)
  - Redis (cache/sessions)
  - Elasticsearch (search)
  - Neo4j (knowledge graph)

### Infrastructure (구현 예정)
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions + ArgoCD
- **Monitoring**: Prometheus + Grafana + ELK Stack

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 18+ & npm 9+
- Docker Desktop (백엔드 개발 시)
- Git

### 개발 환경 설정

```bash
# 1. 저장소 클론
git clone https://github.com/your-org/corporate-nexus-stream.git
cd corporate-nexus-stream

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local

# 4. 개발 서버 실행
npm run dev

# 5. 브라우저에서 확인
# http://localhost:5173
```

### Docker를 이용한 전체 스택 실행 (준비 중)

```bash
# Docker Compose로 전체 서비스 실행
docker-compose up -d

# 서비스 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f
```

## 📁 프로젝트 구조

```
corporate-nexus-stream/
├── src/                    # Frontend 소스 코드
│   ├── components/         # React 컴포넌트
│   ├── pages/             # 페이지 컴포넌트
│   ├── hooks/             # Custom React Hooks
│   ├── lib/               # 유틸리티 함수
│   └── assets/            # 정적 리소스
├── backend/               # Backend 서비스 (구현 예정)
│   ├── services/          # 마이크로서비스
│   ├── shared/            # 공통 라이브러리
│   └── docs/              # PRD 문서
├── docs/                  # 프로젝트 문서
│   ├── tasks/             # 개발 태스크 문서
│   └── *.md               # 서비스별 PRD
├── docker/                # Docker 설정 (준비 중)
├── k8s/                   # Kubernetes 매니페스트 (준비 중)
└── scripts/               # 유틸리티 스크립트
```

## 🎯 8대 핵심 서비스

1. **Knowledge Base Service** - 중앙화된 지식 저장소
2. **Work Logs & Experience Service** - 경험 및 노하우 수집
3. **AI Insights Engine** - 지능형 분석 및 연결
4. **Project Management & Playbooks** - 프로젝트 관리 방법론
5. **User Management & Auth** - 사용자 및 보안 관리
6. **Analytics & Reporting** - 데이터 분석 및 리포팅
7. **Search & Discovery** - 통합 검색 및 발견
8. **Team Collaboration** - 실시간 팀 협업

## 📈 개발 로드맵

### Phase 0: Foundation (현재)
- [x] 프로젝트 초기 설정
- [x] PRD 문서 작성
- [ ] 백엔드 인프라 구축
- [ ] 데이터베이스 설계

### Phase 1: Core Services (4주)
- [ ] 사용자 인증 시스템
- [ ] 지식베이스 CRUD
- [ ] 기본 검색 기능
- [ ] 프론트엔드 통합

### Phase 2: Collaboration (4주)
- [ ] 실시간 메시징
- [ ] 문서 공동 편집
- [ ] 파일 공유
- [ ] 알림 시스템

### Phase 3: Intelligence (6주)
- [ ] AI 인사이트 엔진
- [ ] 추천 시스템
- [ ] 분석 대시보드
- [ ] 자동화 워크플로우

## 🧪 테스트

```bash
# 단위 테스트 실행
npm run test

# E2E 테스트 실행
npm run test:e2e

# 테스트 커버리지 확인
npm run test:coverage
```

## 📦 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# Docker 이미지 빌드
docker build -t corporate-nexus-stream .

# 배포 (CI/CD 파이프라인)
# GitHub Actions가 자동으로 처리
```

## 📚 문서

- [개발 계획서](/docs/00-master-development-plan.md)
- [프로덕션 배포 태스크](/docs/tasks/00-production-deployment-tasks.md)
- [실행 요약](/docs/tasks/00-EXECUTIVE-SUMMARY.md)
- [API 문서](http://localhost:3000/api-docs) (백엔드 실행 시)

## 🤝 기여 가이드

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

This project is proprietary and confidential.

## 📞 연락처

- **Project Lead**: project-lead@company.com
- **Tech Support**: tech-support@company.com
- **Documentation**: [Wiki](https://wiki.company.com/nexus-stream)

---

⚡ **Status**: Active Development | 🔄 **Last Updated**: 2025-09-25
