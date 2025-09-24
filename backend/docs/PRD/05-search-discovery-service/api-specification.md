# Search & Discovery Service API 명세서

## 📊 API 개요

Search & Discovery Service는 RESTful API를 통해 통합 검색, AI 기반 추천, 지식 그래프 탐색 기능을 제공합니다.

**Base URL**: `/api/v1/search`

## 🔐 인증

모든 API 요청은 JWT 토큰을 통한 인증이 필요합니다.

```http
Authorization: Bearer <jwt_token>
```

## 📝 공통 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": {
    // 실제 데이터 
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req-123456"
  }
}
```

### 오류 응답
```json
{
  "success": false,
  "error": {
    "code": "SEARCH_ERROR",
    "message": "검색 중 오류가 발생했습니다",
    "details": "상세 오류 정보"
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req-123456"
  }
}
```

## 🔍 검색 API

### 1. 통합 검색

**Endpoint**: `GET /search`

전체 시스템에서 콘텐츠를 검색합니다.

#### Request Parameters
```typescript
interface SearchRequest {
  q: string;                    // 검색 쿼리 (필수)
  type?: DocumentType[];        // 문서 타입 필터
  author?: string[];            // 작성자 필터
  dateFrom?: string;            // 시작 날짜 (ISO 8601)
  dateTo?: string;              // 종료 날짜 (ISO 8601)
  tags?: string[];              // 태그 필터
  accessLevel?: AccessLevel[];  // 접근 권한 필터
  page?: number;                // 페이지 번호 (기본값: 1)
  size?: number;                // 페이지 크기 (기본값: 20, 최대: 100)
  sort?: SortOption;            // 정렬 옵션
  highlight?: boolean;          // 하이라이트 여부 (기본값: true)
}

enum DocumentType {
  KNOWLEDGE_BASE = "KNOWLEDGE_BASE",
  WORK_LOG = "WORK_LOG", 
  PROJECT = "PROJECT",
  COMMENT = "COMMENT",
  DOCUMENT = "DOCUMENT"
}

enum AccessLevel {
  PUBLIC = "PUBLIC",
  INTERNAL = "INTERNAL", 
  RESTRICTED = "RESTRICTED",
  CONFIDENTIAL = "CONFIDENTIAL"
}

enum SortOption {
  RELEVANCE = "relevance",
  DATE_DESC = "date_desc",
  DATE_ASC = "date_asc",
  POPULARITY = "popularity",
  TITLE = "title"
}
```

#### Example Request
```http
GET /api/v1/search?q=프로젝트 관리&type=KNOWLEDGE_BASE,PROJECT&page=1&size=10&sort=relevance
```

#### Response
```typescript
interface SearchResponse {
  results: SearchResult[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  aggregations: {
    documentTypes: TypeAggregation[];
    authors: AuthorAggregation[];
    tags: TagAggregation[];
    dateRanges: DateRangeAggregation[];
  };
  searchTime: number; // 검색 소요 시간 (ms)
  query: {
    original: string;
    processed: string;
    suggestions?: string[];
  };
}

interface SearchResult {
  id: string;
  type: DocumentType;
  title: string;
  summary: string;
  content?: string;          // 하이라이트된 콘텐츠
  author: {
    id: number;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  tags: string[];
  url: string;              // 원본 문서 URL
  relevanceScore: number;
  highlights: {
    title?: string[];
    content?: string[];
  };
  metadata: {
    [key: string]: any;
  };
}
```

### 2. 시맨틱 검색

**Endpoint**: `POST /search/semantic`

의미 기반 검색을 수행합니다.

#### Request Body
```typescript
interface SemanticSearchRequest {
  query: string;
  context?: string;           // 검색 컨텍스트
  similarityThreshold?: number; // 유사도 임계값 (0.0-1.0)
  maxResults?: number;        // 최대 결과 수
  includeEmbeddings?: boolean; // 임베딩 벡터 포함 여부
}
```

#### Example Request
```http
POST /api/v1/search/semantic
Content-Type: application/json

{
  "query": "팀 협업을 위한 최신 도구들",
  "context": "소프트웨어 개발팀",
  "similarityThreshold": 0.7,
  "maxResults": 15
}
```

### 3. 자동완성

**Endpoint**: `GET /search/autocomplete`

검색어 자동완성 제안을 제공합니다.

#### Request Parameters
```typescript
interface AutoCompleteRequest {
  q: string;        // 입력된 부분 쿼리 (최소 2글자)
  type?: DocumentType[]; // 문서 타입 필터
  limit?: number;   // 제안 개수 (기본값: 10, 최대: 20)
}
```

#### Response
```typescript
interface AutoCompleteResponse {
  suggestions: Suggestion[];
  searchTime: number;
}

interface Suggestion {
  text: string;
  type: "QUERY" | "DOCUMENT_TITLE" | "TAG" | "AUTHOR";
  score: number;
  frequency?: number; // 검색 빈도
  highlight: string;  // 하이라이트된 텍스트
}
```

## 🎯 패싯 검색 API

### 1. 패싯 정보 조회

**Endpoint**: `GET /search/facets`

사용 가능한 모든 패싯 정보를 조회합니다.

#### Response
```typescript
interface FacetsResponse {
  facets: {
    documentTypes: FacetInfo;
    authors: FacetInfo;
    tags: FacetInfo;
    dateRanges: FacetInfo;
    departments: FacetInfo;
    [key: string]: FacetInfo;
  };
}

interface FacetInfo {
  name: string;
  displayName: string;
  type: "TERMS" | "DATE_RANGE" | "NUMERIC_RANGE";
  values: FacetValue[];
}

interface FacetValue {
  value: string;
  label: string;
  count: number;
  selected?: boolean;
}
```

### 2. 패싯 기반 검색

**Endpoint**: `POST /search/faceted`

패싯을 활용한 고급 검색을 수행합니다.

#### Request Body
```typescript
interface FacetedSearchRequest {
  query?: string;
  facets: {
    [facetName: string]: string[] | DateRange | NumericRange;
  };
  page?: number;
  size?: number;
  sort?: SortOption;
}

interface DateRange {
  from: string;
  to: string;
}

interface NumericRange {
  min: number;
  max: number;
}
```

## 🤖 AI 추천 API

### 1. 개인화된 추천

**Endpoint**: `GET /recommendations`

사용자 맞춤 콘텐츠를 추천합니다.

#### Request Parameters
```typescript
interface RecommendationRequest {
  type?: RecommendationType[];
  limit?: number;           // 추천 개수 (기본값: 10)
  excludeViewed?: boolean;  // 조회한 콘텐츠 제외
  category?: string[];      // 카테고리 필터
}

enum RecommendationType {
  TRENDING = "trending",           // 인기 콘텐츠
  RELATED = "related",            // 관련 콘텐츠
  COLLABORATIVE = "collaborative", // 협업 필터링
  CONTENT_BASED = "content_based" // 콘텐츠 기반
}
```

#### Response
```typescript
interface RecommendationResponse {
  recommendations: RecommendationItem[];
  metadata: {
    algorithm: string;
    confidence: number;
    generatedAt: string;
  };
}

interface RecommendationItem {
  document: SearchResult;
  score: number;
  reason: string;           // 추천 이유
  type: RecommendationType;
  relatedDocuments?: string[]; // 관련 문서 ID
}
```

### 2. 콘텐츠 기반 추천

**Endpoint**: `GET /recommendations/similar/{documentId}`

특정 문서와 유사한 콘텐츠를 추천합니다.

#### Path Parameters
- `documentId`: 기준 문서 ID

#### Request Parameters
```typescript
interface SimilarRecommendationRequest {
  limit?: number;
  excludeSameAuthor?: boolean;
  minSimilarity?: number;
}
```

### 3. 추천 피드백

**Endpoint**: `POST /recommendations/{recommendationId}/feedback`

추천 결과에 대한 피드백을 제공합니다.

#### Request Body
```typescript
interface RecommendationFeedback {
  action: "CLICKED" | "LIKED" | "DISLIKED" | "SHARED" | "BOOKMARKED";
  rating?: number; // 1-5 점수
  comment?: string;
}
```

## 🗺 지식 그래프 API

### 1. 지식 그래프 조회

**Endpoint**: `GET /graph/knowledge`

지식 그래프 데이터를 조회합니다.

#### Request Parameters
```typescript
interface KnowledgeGraphRequest {
  nodeId?: string;      // 특정 노드 중심 그래프
  depth?: number;       // 탐색 깊이 (기본값: 2)
  nodeTypes?: string[]; // 노드 타입 필터
  minConnections?: number; // 최소 연결 수
  layout?: "FORCE" | "HIERARCHICAL" | "CIRCULAR";
}
```

#### Response
```typescript
interface KnowledgeGraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: Cluster[];
  metadata: {
    totalNodes: number;
    totalEdges: number;
    maxDepth: number;
  };
}

interface GraphNode {
  id: string;
  label: string;
  type: string;
  size: number;        // 중요도에 따른 크기
  color: string;
  properties: {
    [key: string]: any;
  };
  position?: {
    x: number;
    y: number;
  };
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  weight: number;      // 연관성 강도
  label?: string;
  properties: {
    [key: string]: any;
  };
}

interface Cluster {
  id: string;
  label: string;
  nodes: string[];
  color: string;
  center: {
    x: number;
    y: number;
  };
}
```

### 2. 노드 상세 정보

**Endpoint**: `GET /graph/nodes/{nodeId}`

특정 노드의 상세 정보를 조회합니다.

#### Response
```typescript
interface NodeDetailsResponse {
  node: GraphNode;
  connectedNodes: GraphNode[];
  documents: SearchResult[];
  statistics: {
    totalConnections: number;
    incomingConnections: number;
    outgoingConnections: number;
    popularity: number;
  };
}
```

## 📊 분석 및 통계 API

### 1. 검색 통계

**Endpoint**: `GET /analytics/search-stats`

검색 관련 통계를 조회합니다.

#### Request Parameters
```typescript
interface SearchStatsRequest {
  period: "DAY" | "WEEK" | "MONTH" | "YEAR";
  startDate?: string;
  endDate?: string;
  groupBy?: "HOUR" | "DAY" | "WEEK" | "MONTH";
}
```

#### Response
```typescript
interface SearchStatsResponse {
  totalSearches: number;
  uniqueUsers: number;
  avgResponseTime: number;
  topQueries: QueryStat[];
  searchTrends: TrendData[];
  performanceMetrics: {
    p95ResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
  };
}

interface QueryStat {
  query: string;
  count: number;
  avgResponseTime: number;
  clickThroughRate: number;
}
```

### 2. 인기 콘텐츠

**Endpoint**: `GET /analytics/trending`

인기 콘텐츠 통계를 조회합니다.

#### Response
```typescript
interface TrendingResponse {
  documents: TrendingDocument[];
  tags: TrendingTag[];
  authors: TrendingAuthor[];
  categories: TrendingCategory[];
}

interface TrendingDocument {
  document: SearchResult;
  views: number;
  searches: number;
  trend: "UP" | "DOWN" | "STABLE";
  changeRate: number;
}
```

## 🔧 관리 API

### 1. 인덱스 관리

**Endpoint**: `POST /admin/indexes/rebuild`

검색 인덱스를 재구성합니다. (관리자 전용)

#### Request Body
```typescript
interface IndexRebuildRequest {
  documentTypes?: DocumentType[];
  fullRebuild?: boolean;    // 전체 재구성 여부
  batchSize?: number;       // 배치 크기
}
```

### 2. 인덱스 상태 조회

**Endpoint**: `GET /admin/indexes/status`

인덱스 상태를 조회합니다.

#### Response
```typescript
interface IndexStatusResponse {
  indexes: IndexStatus[];
  overall: {
    status: "HEALTHY" | "WARNING" | "ERROR";
    totalDocuments: number;
    lastUpdated: string;
  };
}

interface IndexStatus {
  name: string;
  status: "HEALTHY" | "WARNING" | "ERROR";
  documentsCount: number;
  size: string;
  lastUpdated: string;
  errors?: string[];
}
```

## 📱 실시간 API (WebSocket)

### 1. 실시간 검색 제안

**Endpoint**: `ws://{host}/api/v1/search/live`

실시간 검색 제안을 위한 WebSocket 연결입니다.

#### Message Format
```typescript
// 클라이언트 → 서버
interface LiveSearchMessage {
  type: "SEARCH" | "SUGGESTION";
  query: string;
  sessionId: string;
}

// 서버 → 클라이언트
interface LiveSearchResponse {
  type: "SUGGESTIONS" | "RESULTS" | "ERROR";
  data: Suggestion[] | SearchResult[] | ErrorInfo;
  requestId: string;
}
```

## 🚨 오류 코드

| 코드 | 메시지 | 설명 |
|------|--------|------|
| `SEARCH_001` | Invalid query format | 잘못된 쿼리 형식 |
| `SEARCH_002` | Search engine unavailable | 검색 엔진 연결 불가 |
| `SEARCH_003` | Query too complex | 쿼리가 너무 복잡함 |
| `SEARCH_004` | Rate limit exceeded | 요청 한도 초과 |
| `SEARCH_005` | Insufficient permissions | 권한 부족 |
| `INDEX_001` | Index not found | 인덱스를 찾을 수 없음 |
| `INDEX_002` | Indexing in progress | 인덱싱 진행 중 |
| `RECOMMEND_001` | Insufficient data | 추천을 위한 데이터 부족 |
| `GRAPH_001` | Node not found | 노드를 찾을 수 없음 |

## 📏 API 제한사항

- **요청 한도**: 사용자당 분당 100회
- **쿼리 길이**: 최대 500자
- **결과 수**: 한 번에 최대 100개
- **동시 연결**: 사용자당 최대 5개 WebSocket 연결
- **파일 크기**: 업로드 파일 최대 10MB

## 📚 SDK 및 예제

### JavaScript SDK 예제
```javascript
import { SearchClient } from '@corp-nexus/search-sdk';

const client = new SearchClient({
  baseUrl: 'https://api.corp-nexus.com',
  apiKey: 'your-api-key'
});

// 기본 검색
const results = await client.search({
  q: '프로젝트 관리',
  type: ['KNOWLEDGE_BASE'],
  page: 1,
  size: 10
});

// 시맨틱 검색
const semanticResults = await client.semanticSearch({
  query: '팀 협업 도구',
  similarityThreshold: 0.7
});

// 추천 받기
const recommendations = await client.getRecommendations({
  type: ['TRENDING', 'RELATED'],
  limit: 5
});
```

### Python SDK 예제
```python
from corp_nexus_search import SearchClient

client = SearchClient(
    base_url='https://api.corp-nexus.com',
    api_key='your-api-key'
)

# 기본 검색
results = client.search(
    q='프로젝트 관리',
    type=['KNOWLEDGE_BASE'],
    page=1,
    size=10
)

# 자동완성
suggestions = client.autocomplete(q='프로젝')
```

## 🔄 버전 관리

현재 API 버전: **v1**
- 하위 호환성 보장
- 새로운 필드 추가 시 선택적(optional) 처리
- 주요 변경사항은 새로운 버전으로 제공