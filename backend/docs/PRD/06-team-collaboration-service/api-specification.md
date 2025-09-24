# Team Collaboration Service API 명세서

## 📊 API 개요

Team Collaboration Service는 실시간 협업, 메시징, 화상회의, 문서 공동 편집을 위한 RESTful API와 WebSocket API를 제공합니다.

**Base URL**: `/api/v1/collaboration`

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
    "code": "COLLABORATION_ERROR",
    "message": "협업 서비스 오류가 발생했습니다",
    "details": "상세 오류 정보"
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req-123456"
  }
}
```

## 🏢 워크스페이스 API

### 1. 워크스페이스 생성

**Endpoint**: `POST /workspaces`

새로운 협업 워크스페이스를 생성합니다.

#### Request Body
```typescript
interface CreateWorkspaceRequest {
  name: string;                    // 워크스페이스 이름 (필수)
  description?: string;            // 설명
  type: WorkspaceType;            // 워크스페이스 유형
  visibility: WorkspaceVisibility; // 공개 범위
  settings?: WorkspaceSettings;    // 워크스페이스 설정
}

enum WorkspaceType {
  TEAM = "TEAM",                 // 팀 워크스페이스
  PROJECT = "PROJECT",           // 프로젝트 워크스페이스
  TEMPORARY = "TEMPORARY"        // 임시 워크스페이스
}

enum WorkspaceVisibility {
  PUBLIC = "PUBLIC",             // 조직 내 공개
  PRIVATE = "PRIVATE",           // 초대된 사용자만
  RESTRICTED = "RESTRICTED"      // 특정 부서/그룹만
}

interface WorkspaceSettings {
  allowFileUpload: boolean;
  maxFileSize: number;           // MB 단위
  allowExternalInvites: boolean;
  requireApproval: boolean;
  defaultChannelPermissions: ChannelPermission;
  messageRetentionDays?: number;
}
```

#### Response
```typescript
interface WorkspaceResponse {
  id: number;
  name: string;
  description: string;
  type: WorkspaceType;
  visibility: WorkspaceVisibility;
  owner: UserSummary;
  memberCount: number;
  channelCount: number;
  settings: WorkspaceSettings;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
  role: WorkspaceRole;           // 현재 사용자의 역할
}

interface UserSummary {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  title?: string;
}

enum WorkspaceRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN", 
  MEMBER = "MEMBER",
  GUEST = "GUEST"
}
```

### 2. 워크스페이스 목록 조회

**Endpoint**: `GET /workspaces`

사용자가 참여한 워크스페이스 목록을 조회합니다.

#### Request Parameters
```typescript
interface WorkspaceListRequest {
  type?: WorkspaceType[];
  status?: WorkspaceStatus[];
  search?: string;               // 이름으로 검색
  page?: number;                // 페이지 번호 (기본값: 1)
  size?: number;                // 페이지 크기 (기본값: 20)
  sort?: WorkspaceSortOption;   // 정렬 옵션
}

enum WorkspaceStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
  SUSPENDED = "SUSPENDED"
}

enum WorkspaceSortOption {
  NAME = "name",
  CREATED_DATE = "created_date", 
  LAST_ACTIVITY = "last_activity",
  MEMBER_COUNT = "member_count"
}
```

### 3. 워크스페이스 상세 조회

**Endpoint**: `GET /workspaces/{workspaceId}`

특정 워크스페이스의 상세 정보를 조회합니다.

#### Response
```typescript
interface WorkspaceDetailResponse extends WorkspaceResponse {
  channels: ChannelSummary[];
  recentMessages: MessageSummary[];
  members: WorkspaceMemberSummary[];
  statistics: WorkspaceStatistics;
}

interface WorkspaceStatistics {
  totalMessages: number;
  activeMembers: number;
  filesShared: number;
  meetingsHeld: number;
  avgResponseTime: number;       // 분 단위
}
```

### 4. 워크스페이스 멤버 관리

**Endpoint**: `POST /workspaces/{workspaceId}/members`

워크스페이스에 새 멤버를 초대합니다.

#### Request Body
```typescript
interface InviteMemberRequest {
  userIds?: number[];           // 기존 사용자 초대
  emails?: string[];            // 이메일로 초대
  role: WorkspaceRole;         // 부여할 역할
  message?: string;            // 초대 메시지
  channels?: number[];         // 자동 참여할 채널 ID
}
```

**Endpoint**: `PUT /workspaces/{workspaceId}/members/{userId}`

멤버 역할을 변경합니다.

#### Request Body
```typescript
interface UpdateMemberRequest {
  role: WorkspaceRole;
  permissions?: WorkspacePermission[];
}
```

## 💬 채널 API

### 1. 채널 생성

**Endpoint**: `POST /workspaces/{workspaceId}/channels`

워크스페이스에 새 채널을 생성합니다.

#### Request Body
```typescript
interface CreateChannelRequest {
  name: string;                 // 채널 이름 (필수)
  description?: string;         // 채널 설명
  type: ChannelType;           // 채널 유형
  visibility: ChannelVisibility; // 채널 공개 범위
  autoJoin?: boolean;          // 워크스페이스 멤버 자동 참여
  settings?: ChannelSettings;
}

enum ChannelType {
  TEXT = "TEXT",               // 텍스트 채널
  VOICE = "VOICE",             // 음성 채널
  VIDEO = "VIDEO",             // 화상 채널  
  ANNOUNCEMENT = "ANNOUNCEMENT" // 공지 채널
}

enum ChannelVisibility {
  PUBLIC = "PUBLIC",           // 워크스페이스 내 공개
  PRIVATE = "PRIVATE"          // 초대된 멤버만
}

interface ChannelSettings {
  allowThreads: boolean;
  allowFileUpload: boolean;
  allowMentions: boolean;
  moderationLevel: ModerationLevel;
  messageRetentionDays?: number;
}
```

### 2. 채널 목록 조회  

**Endpoint**: `GET /workspaces/{workspaceId}/channels`

워크스페이스의 채널 목록을 조회합니다.

#### Response
```typescript
interface ChannelListResponse {
  channels: ChannelSummary[];
  categories: ChannelCategory[];
}

interface ChannelSummary {
  id: number;
  name: string;
  type: ChannelType;
  visibility: ChannelVisibility;
  memberCount: number;
  unreadCount: number;
  lastMessage?: MessageSummary;
  lastActivity: string;
  isMember: boolean;
  isMuted: boolean;
}
```

## 💌 메시지 API

### 1. 메시지 전송

**Endpoint**: `POST /channels/{channelId}/messages`

채널에 메시지를 전송합니다.

#### Request Body
```typescript
interface SendMessageRequest {
  content?: string;             // 메시지 내용
  type: MessageType;           // 메시지 유형
  format?: MessageFormat;      // 메시지 형식
  threadId?: number;           // 스레드 ID (답글인 경우)
  mentions?: MessageMention[]; // 멘션 정보
  attachments?: MessageAttachment[]; // 첨부 파일
  metadata?: {[key: string]: any}; // 메타데이터
}

enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE", 
  FILE = "FILE",
  VOICE = "VOICE",
  VIDEO = "VIDEO",
  SYSTEM = "SYSTEM",
  POLL = "POLL"
}

enum MessageFormat {
  PLAIN = "PLAIN",
  MARKDOWN = "MARKDOWN",
  HTML = "HTML"
}

interface MessageMention {
  type: MentionType;
  targetId?: number;           // 사용자/채널 ID
  displayName: string;
  offset: number;              // 텍스트 내 위치
  length: number;              // 멘션 길이
}

enum MentionType {
  USER = "USER",
  CHANNEL = "CHANNEL", 
  EVERYONE = "EVERYONE",
  HERE = "HERE"                // 온라인 사용자만
}
```

### 2. 메시지 히스토리 조회

**Endpoint**: `GET /channels/{channelId}/messages`

채널의 메시지 히스토리를 조회합니다.

#### Request Parameters
```typescript
interface MessageHistoryRequest {
  before?: number;             // 이전 메시지 ID
  after?: number;              // 이후 메시지 ID
  limit?: number;              // 개수 (기본값: 50, 최대: 100)
  includeThreads?: boolean;    // 스레드 메시지 포함
  messageTypes?: MessageType[]; // 특정 타입만 조회
}
```

#### Response
```typescript
interface MessageHistoryResponse {
  messages: MessageDetail[];
  hasMore: boolean;
  nextCursor?: string;
}

interface MessageDetail {
  id: number;
  content: string;
  type: MessageType;
  format: MessageFormat;
  sender: UserSummary;
  channel: ChannelSummary;
  threadId?: number;
  threadCount?: number;
  mentions: MessageMention[];
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
  sentAt: string;
  editedAt?: string;
  isPinned: boolean;
  isDeleted: boolean;
}
```

### 3. 메시지 반응

**Endpoint**: `POST /messages/{messageId}/reactions`

메시지에 이모지 반응을 추가합니다.

#### Request Body
```typescript
interface AddReactionRequest {
  emoji: string;               // 이모지 코드 (예: "👍", ":thumbsup:")
}
```

### 4. 메시지 편집/삭제

**Endpoint**: `PUT /messages/{messageId}`

메시지를 편집합니다.

#### Request Body
```typescript
interface EditMessageRequest {
  content: string;
  format?: MessageFormat;
}
```

**Endpoint**: `DELETE /messages/{messageId}`

메시지를 삭제합니다.

## 📞 화상회의 API

### 1. 회의 생성

**Endpoint**: `POST /meetings`

새 화상회의를 생성합니다.

#### Request Body
```typescript
interface CreateMeetingRequest {
  title: string;
  description?: string;
  workspaceId: number;
  channelId?: number;
  type: MeetingType;
  scheduledStart?: string;     // ISO 8601 format
  scheduledEnd?: string;
  participantIds?: number[];
  settings?: MeetingSettings;
}

enum MeetingType {
  INSTANT = "INSTANT",         // 즉시 회의
  SCHEDULED = "SCHEDULED",     // 예약 회의
  RECURRING = "RECURRING"      // 반복 회의
}

interface MeetingSettings {
  allowRecording: boolean;
  requirePassword: boolean;
  waitingRoom: boolean;
  allowScreenShare: boolean;
  allowChat: boolean;
  maxParticipants: number;
  autoAdmit: boolean;
}
```

#### Response
```typescript
interface MeetingResponse {
  id: number;
  title: string;
  meetingRoomId: string;       // 실제 회의 룸 ID
  joinUrl: string;             // 회의 참여 URL
  password?: string;           // 회의 비밀번호
  status: MeetingStatus;
  organizer: UserSummary;
  participants: MeetingParticipant[];
  scheduledStart: string;
  scheduledEnd: string;
  settings: MeetingSettings;
  createdAt: string;
}

enum MeetingStatus {
  SCHEDULED = "SCHEDULED",
  ACTIVE = "ACTIVE",
  ENDED = "ENDED",
  CANCELLED = "CANCELLED"
}
```

### 2. 회의 참여

**Endpoint**: `POST /meetings/{meetingId}/join`

회의에 참여합니다.

#### Request Body
```typescript
interface JoinMeetingRequest {
  password?: string;           // 회의 비밀번호
  deviceInfo: DeviceInfo;
}

interface DeviceInfo {
  type: "DESKTOP" | "MOBILE" | "TABLET";
  browser: string;
  os: string;
  capabilities: {
    video: boolean;
    audio: boolean;
    screenShare: boolean;
  };
}
```

### 3. 회의 제어

**Endpoint**: `POST /meetings/{meetingId}/control`

회의 진행을 제어합니다. (호스트 전용)

#### Request Body
```typescript
interface MeetingControlRequest {
  action: MeetingControlAction;
  targetUserId?: number;       // 특정 사용자 대상 액션
  settings?: Partial<MeetingSettings>;
}

enum MeetingControlAction {
  START_RECORDING = "START_RECORDING",
  STOP_RECORDING = "STOP_RECORDING", 
  MUTE_PARTICIPANT = "MUTE_PARTICIPANT",
  REMOVE_PARTICIPANT = "REMOVE_PARTICIPANT",
  LOCK_MEETING = "LOCK_MEETING",
  ENABLE_WAITING_ROOM = "ENABLE_WAITING_ROOM",
  CREATE_BREAKOUT_ROOM = "CREATE_BREAKOUT_ROOM"
}
```

## 📁 파일 공유 API

### 1. 파일 업로드

**Endpoint**: `POST /channels/{channelId}/files`

채널에 파일을 업로드합니다.

#### Request
- **Content-Type**: `multipart/form-data`
- **File Parameter**: `file`

#### Additional Form Data
```typescript
interface FileUploadMetadata {
  description?: string;
  tags?: string[];
  allowDownload?: boolean;
  expiresAt?: string;         // ISO 8601 format
}
```

#### Response
```typescript
interface FileUploadResponse {
  id: number;
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  downloadUrl: string;
  uploadedBy: UserSummary;
  uploadedAt: string;
  scanResult?: FileScanResult;
}

interface FileScanResult {
  status: "CLEAN" | "INFECTED" | "SUSPICIOUS";
  threats?: string[];
}
```

### 2. 파일 목록 조회

**Endpoint**: `GET /channels/{channelId}/files`

채널의 파일 목록을 조회합니다.

#### Request Parameters
```typescript
interface FileListRequest {
  type?: FileType[];          // 파일 타입 필터
  uploadedBy?: number[];      // 업로더 필터
  dateFrom?: string;          // 업로드 날짜 범위
  dateTo?: string;
  search?: string;            // 파일명 검색
  page?: number;
  size?: number;
}

enum FileType {
  IMAGE = "IMAGE",
  DOCUMENT = "DOCUMENT", 
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
  ARCHIVE = "ARCHIVE",
  OTHER = "OTHER"
}
```

## 📄 문서 공동 편집 API

### 1. 편집 세션 시작

**Endpoint**: `POST /files/{fileId}/editing-session`

문서 공동 편집 세션을 시작합니다.

#### Request Body
```typescript
interface StartEditingRequest {
  mode: EditingMode;
  collaborators?: number[];   // 초대할 협업자
}

enum EditingMode {
  EDIT = "EDIT",              // 편집 모드
  VIEW = "VIEW",              // 보기 모드
  COMMENT = "COMMENT"         // 댓글 모드
}
```

#### Response
```typescript
interface EditingSessionResponse {
  sessionId: string;
  websocketUrl: string;       // 실시간 협업을 위한 WebSocket URL
  documentContent: string;    // 현재 문서 내용
  version: number;            // 문서 버전
  collaborators: CollaboratorInfo[];
  permissions: EditingPermission[];
}

interface CollaboratorInfo {
  user: UserSummary;
  mode: EditingMode;
  cursorPosition?: number;
  lastActivity: string;
  isActive: boolean;
}
```

### 2. 문서 변경사항 적용

**Endpoint**: `POST /editing-sessions/{sessionId}/operations`

문서에 편집 작업을 적용합니다.

#### Request Body
```typescript
interface DocumentOperation {
  type: OperationType;
  position: number;           // 변경 위치
  content?: string;           // 삽입/교체할 내용
  length?: number;            // 삭제할 길이
  attributes?: TextAttributes; // 텍스트 속성
  clientId: string;           // 클라이언트 식별자
  timestamp: number;          // 작업 시간
}

enum OperationType {
  INSERT = "INSERT",
  DELETE = "DELETE",
  RETAIN = "RETAIN",
  FORMAT = "FORMAT"
}
```

## 🔔 알림 API

### 1. 알림 설정

**Endpoint**: `PUT /users/notification-preferences`

사용자의 알림 설정을 변경합니다.

#### Request Body
```typescript
interface NotificationPreferences {
  channels: {[channelId: string]: ChannelNotificationSetting};
  workspaces: {[workspaceId: string]: WorkspaceNotificationSetting};
  global: GlobalNotificationSetting;
}

interface ChannelNotificationSetting {
  enabled: boolean;
  mentions: boolean;
  allMessages: boolean;
  quietHours?: QuietHours;
}

interface QuietHours {
  enabled: boolean;
  startTime: string;          // HH:mm format
  endTime: string;
  timezone: string;
  weekendsOnly?: boolean;
}
```

## 📊 WebSocket 실시간 API

### 1. WebSocket 연결

**Endpoint**: `ws://{host}/api/v1/collaboration/ws`

실시간 협업을 위한 WebSocket 연결입니다.

#### Connection Parameters
```typescript
interface WebSocketConnection {
  token: string;              // JWT 토큰
  workspaceId?: number;       // 워크스페이스 ID
  channelId?: number;         // 채널 ID
  sessionId?: string;         // 편집 세션 ID
}
```

### 2. 메시지 형식

#### 클라이언트 → 서버
```typescript
interface ClientMessage {
  type: ClientMessageType;
  data: any;
  requestId?: string;
}

enum ClientMessageType {
  // 메시징
  SEND_MESSAGE = "SEND_MESSAGE",
  TYPING_START = "TYPING_START",
  TYPING_STOP = "TYPING_STOP",
  
  // 회의
  JOIN_MEETING = "JOIN_MEETING",
  LEAVE_MEETING = "LEAVE_MEETING",
  MEDIA_STATE_CHANGE = "MEDIA_STATE_CHANGE",
  
  // 문서 편집
  DOCUMENT_OPERATION = "DOCUMENT_OPERATION",
  CURSOR_POSITION = "CURSOR_POSITION",
  
  // 상태
  PRESENCE_UPDATE = "PRESENCE_UPDATE"
}
```

#### 서버 → 클라이언트
```typescript
interface ServerMessage {
  type: ServerMessageType;
  data: any;
  timestamp: string;
}

enum ServerMessageType {
  // 메시징
  MESSAGE_RECEIVED = "MESSAGE_RECEIVED",
  MESSAGE_UPDATED = "MESSAGE_UPDATED",
  MESSAGE_DELETED = "MESSAGE_DELETED",
  TYPING_INDICATOR = "TYPING_INDICATOR",
  
  // 회의
  PARTICIPANT_JOINED = "PARTICIPANT_JOINED",
  PARTICIPANT_LEFT = "PARTICIPANT_LEFT",
  MEETING_STARTED = "MEETING_STARTED",
  MEETING_ENDED = "MEETING_ENDED",
  
  // 문서 편집
  DOCUMENT_UPDATED = "DOCUMENT_UPDATED",
  COLLABORATOR_CURSOR = "COLLABORATOR_CURSOR",
  
  // 알림
  NOTIFICATION = "NOTIFICATION",
  PRESENCE_CHANGED = "PRESENCE_CHANGED"
}
```

## 📈 분석 및 통계 API

### 1. 협업 통계

**Endpoint**: `GET /workspaces/{workspaceId}/analytics`

워크스페이스의 협업 통계를 조회합니다.

#### Request Parameters
```typescript
interface AnalyticsRequest {
  period: "DAY" | "WEEK" | "MONTH" | "QUARTER";
  startDate?: string;
  endDate?: string;
  metrics?: AnalyticsMetric[];
}

enum AnalyticsMetric {
  MESSAGE_COUNT = "MESSAGE_COUNT",
  ACTIVE_USERS = "ACTIVE_USERS",
  FILE_SHARES = "FILE_SHARES",
  MEETING_DURATION = "MEETING_DURATION",
  RESPONSE_TIME = "RESPONSE_TIME"
}
```

#### Response
```typescript
interface AnalyticsResponse {
  overview: {
    totalMessages: number;
    activeUsers: number;
    avgResponseTime: number;    // 분 단위
    filesShared: number;
    meetingHours: number;
  };
  trends: TrendData[];
  topChannels: ChannelActivity[];
  userActivity: UserActivity[];
  meetingStats: MeetingStatistics;
}
```

## 🚨 오류 코드

| 코드 | 메시지 | 설명 |
|------|--------|------|
| `COLLAB_001` | Workspace not found | 워크스페이스를 찾을 수 없음 |
| `COLLAB_002` | Channel not found | 채널을 찾을 수 없음 |
| `COLLAB_003` | Access denied | 접근 권한 없음 |
| `COLLAB_004` | Message too large | 메시지 크기 초과 |
| `COLLAB_005` | File upload failed | 파일 업로드 실패 |
| `COLLAB_006` | Meeting room full | 회의실 정원 초과 |
| `COLLAB_007` | Invalid file type | 지원하지 않는 파일 형식 |
| `COLLAB_008` | WebSocket connection failed | WebSocket 연결 실패 |
| `COLLAB_009` | Rate limit exceeded | 요청 한도 초과 |
| `COLLAB_010` | Editing conflict | 편집 충돌 발생 |

## 📏 API 제한사항

- **메시지 크기**: 최대 10MB (첨부파일 포함)
- **파일 업로드**: 개당 최대 100MB, 일일 1GB
- **요청 한도**: 사용자당 분당 200회
- **WebSocket 연결**: 사용자당 최대 10개 동시 연결
- **회의 참가자**: 기본 100명, 엔터프라이즈 500명
- **동시 편집자**: 문서당 최대 50명

## 📚 SDK 및 예제

### JavaScript SDK 예제
```javascript
import { CollaborationClient } from '@corp-nexus/collaboration-sdk';

const client = new CollaborationClient({
  baseUrl: 'https://api.corp-nexus.com',
  websocketUrl: 'wss://api.corp-nexus.com',
  apiKey: 'your-api-key'
});

// 워크스페이스 생성
const workspace = await client.createWorkspace({
  name: '개발팀',
  type: 'TEAM',
  visibility: 'PRIVATE'
});

// 실시간 메시징 연결
client.connect(workspace.id);
client.on('message', (message) => {
  console.log('새 메시지:', message);
});

// 메시지 전송
await client.sendMessage(channelId, {
  content: '안녕하세요!',
  type: 'TEXT'
});

// 화상회의 생성
const meeting = await client.createMeeting({
  title: '주간 회의',
  type: 'INSTANT',
  workspaceId: workspace.id
});
```

### React Hook 예제
```javascript
import { useCollaboration } from '@corp-nexus/react-collaboration';

function ChatChannel({ channelId }) {
  const {
    messages,
    sendMessage,
    isConnected,
    typing
  } = useCollaboration(channelId);

  return (
    <div>
      {messages.map(msg => (
        <Message key={msg.id} message={msg} />
      ))}
      {typing.length > 0 && (
        <TypingIndicator users={typing} />
      )}
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
```

## 🔄 버전 관리

현재 API 버전: **v1**
- 하위 호환성 보장
- 새로운 필드 추가 시 선택적(optional) 처리
- 주요 변경사항은 새로운 버전으로 제공
- WebSocket 프로토콜 버전 별도 관리