# User Management & Authentication Service Development Plan

## 개요
Corporate Nexus Stream의 사용자 관리, 인증, 권한 부여를 담당하는 핵심 보안 서비스입니다. 조직의 구조와 역할에 맞는 세밀한 권한 관리와 안전한 인증 시스템을 제공합니다.

## 주요 기능

### 1. 사용자 관리
- **사용자 등록/프로파일**: 사용자 계정 생성 및 프로파일 관리
- **조직 구조**: 부서, 팀, 역할 기반 조직 구조 관리
- **사용자 디렉토리**: 통합 사용자 디렉토리 및 검색
- **프로필 커스터마이징**: 개인 프로필, 스킬, 관심사 설정
- **사용자 상태 관리**: 활성/비활성, 휴가/부재 상태 관리

### 2. 인증 시스템
- **다중 인증 방식**: 이메일/패스워드, SSO, 소셜 로그인
- **다중 인증 (MFA)**: TOTP, SMS, 이메일 기반 2차 인증
- **세션 관리**: 안전한 세션 관리 및 자동 만료
- **디바이스 관리**: 로그인 디바이스 추적 및 관리
- **보안 이벤트**: 의심스러운 로그인 시도 감지 및 알림

### 3. 권한 관리 (RBAC)
- **역할 기반 접근**: 세밀한 역할 정의 및 권한 매핑
- **동적 권한**: 컨텍스트 기반 동적 권한 부여
- **프로젝트별 권한**: 프로젝트/팀별 특별 권한
- **승인 워크플로우**: 권한 변경 승인 프로세스
- **권한 감사**: 권한 부여 및 사용 기록 추적

### 4. 조직 관리
- **부서 관리**: 조직도 생성 및 관리
- **팀 구성**: 프로젝트/기능별 팀 구성 관리
- **보고 체계**: 상하관계 및 보고 체계 설정
- **위임 관리**: 임시 권한 위임 및 대리 설정
- **조직 변경**: 조직 개편 시 권한 자동 이전

### 5. 외부 통합
- **SSO 통합**: SAML, OAuth 2.0, OpenID Connect
- **LDAP/AD**: Active Directory 통합
- **HR 시스템**: 인사 시스템과 연동
- **외부 ID**: Google, Microsoft, GitHub 등 소셜 로그인
- **API 인증**: 서비스 간 API 인증 관리

## 기술 스택

### Backend
- **Framework**: Node.js + Fastify 또는 NestJS
- **Database**: PostgreSQL (사용자 데이터) + Redis (세션/캐시)
- **Authentication**: Passport.js + JWT
- **Authorization**: CASL 또는 Casbin
- **Crypto**: bcrypt, crypto-js, node-forge
- **Validation**: Joi 또는 Zod

### Security
- **SSL/TLS**: Let's Encrypt 인증서 자동 갱신
- **Rate Limiting**: express-rate-limit
- **CSRF Protection**: csurf 또는 Double Submit Cookie
- **Helmet**: 보안 헤더 설정
- **Audit Logging**: Winston + ELK Stack

### Infrastructure
- **Container**: Docker + Kubernetes
- **Secret Management**: HashiCorp Vault 또는 AWS Secrets Manager
- **Monitoring**: Prometheus + Grafana
- **WAF**: Cloudflare 또는 AWS WAF
- **Backup**: 자동 데이터베이스 백업 및 복구

### External Services
- **Email**: SendGrid, AWS SES
- **SMS**: Twilio, AWS SNS
- **Identity Providers**: Okta, Auth0, Azure AD
- **Monitoring**: DataDog, New Relic

## 데이터 모델

### User Entity
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    
    -- Profile Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200),
    avatar_url TEXT,
    bio TEXT,
    phone VARCHAR(20),
    
    -- Authentication
    password_hash VARCHAR(255), -- nullable for SSO users
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    
    -- Security
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(100),
    recovery_codes TEXT[], -- encrypted backup codes
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended, pending
    last_login_at TIMESTAMP,
    last_activity_at TIMESTAMP,
    
    -- Organization
    department VARCHAR(100),
    job_title VARCHAR(100),
    manager_id UUID REFERENCES users(id),
    hire_date DATE,
    
    -- Preferences
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    notification_preferences JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP -- soft delete
);
```

### Role Entity
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Hierarchy
    parent_role_id UUID REFERENCES roles(id),
    level INTEGER DEFAULT 0, -- for role hierarchy
    
    -- Permissions
    permissions JSONB NOT NULL, -- {"resource": ["action1", "action2"]}
    
    -- Scope
    scope VARCHAR(20) DEFAULT 'organization', -- organization, department, team, project
    is_system_role BOOLEAN DEFAULT FALSE,
    is_assignable BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### User Roles Entity
```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    
    -- Scope Context
    context_type VARCHAR(50), -- organization, department, team, project
    context_id UUID, -- references departments.id, teams.id, projects.id
    
    -- Temporal
    granted_at TIMESTAMP DEFAULT NOW(),
    granted_by UUID REFERENCES users(id),
    expires_at TIMESTAMP,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit
    revoked_at TIMESTAMP,
    revoked_by UUID REFERENCES users(id),
    revoke_reason TEXT,
    
    UNIQUE(user_id, role_id, context_type, context_id)
);
```

### Teams Entity
```sql
CREATE TABLE teams (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    team_type VARCHAR(50) DEFAULT 'functional', -- functional, project, cross_functional
    
    -- Organization
    department_id UUID REFERENCES departments(id),
    parent_team_id UUID REFERENCES teams(id),
    
    -- Leadership
    lead_id UUID REFERENCES users(id),
    manager_id UUID REFERENCES users(id),
    
    -- Settings
    is_public BOOLEAN DEFAULT TRUE,
    max_members INTEGER,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    archived_at TIMESTAMP
);

CREATE TABLE team_members (
    id UUID PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Membership
    role_in_team VARCHAR(50) DEFAULT 'member', -- lead, member, guest
    joined_at TIMESTAMP DEFAULT NOW(),
    left_at TIMESTAMP,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(team_id, user_id, left_at)
);
```

### Auth Sessions Entity
```sql
CREATE TABLE auth_sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session Info
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    
    -- Device/Client Info
    user_agent TEXT,
    ip_address INET,
    device_fingerprint VARCHAR(255),
    device_name VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    revoked_at TIMESTAMP,
    revoke_reason VARCHAR(100)
);
```

### Audit Logs Entity
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    
    -- Who
    user_id UUID REFERENCES users(id),
    session_id UUID REFERENCES auth_sessions(id),
    
    -- What
    action VARCHAR(100) NOT NULL, -- login, logout, permission_grant, role_change, etc.
    resource_type VARCHAR(50), -- user, role, team, project
    resource_id UUID,
    
    -- Details
    old_values JSONB,
    new_values JSONB,
    metadata JSONB, -- IP, user agent, etc.
    
    -- Result
    success BOOLEAN NOT NULL,
    error_message TEXT,
    
    -- When/Where
    performed_at TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);
```

## API 설계

### Authentication API
```typescript
// POST /api/auth/register - 사용자 등록
interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyCode?: string; // for organization invitation
  invitationToken?: string;
}

interface RegisterResponse {
  user: PublicUser;
  requiresEmailVerification: boolean;
  message: string;
}

// POST /api/auth/login - 로그인
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceName?: string;
}

interface LoginResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  requiresMfa?: boolean;
  mfaToken?: string; // temporary token for MFA completion
}

// POST /api/auth/mfa/verify - MFA 검증
interface MfaVerifyRequest {
  mfaToken: string;
  code: string;
  method: 'totp' | 'sms' | 'email';
}

// POST /api/auth/refresh - 토큰 갱신
interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
```

### User Management API
```typescript
// GET /api/users - 사용자 목록 조회
interface GetUsersRequest {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  team?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
}

interface GetUsersResponse {
  users: PublicUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    departments: { id: string; name: string; count: number }[];
    teams: { id: string; name: string; count: number }[];
    roles: { id: string; name: string; count: number }[];
  };
}

// PUT /api/users/:id - 사용자 정보 수정
interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  managerId?: string;
  language?: string;
  timezone?: string;
  notificationPreferences?: NotificationPreferences;
}

// POST /api/users/:id/roles - 역할 할당
interface AssignRoleRequest {
  roleId: string;
  contextType?: 'organization' | 'department' | 'team' | 'project';
  contextId?: string;
  expiresAt?: string;
  reason?: string;
}
```

### Role Management API
```typescript
// POST /api/roles - 새 역할 생성
interface CreateRoleRequest {
  name: string;
  displayName: string;
  description?: string;
  parentRoleId?: string;
  permissions: { [resource: string]: string[] };
  scope?: 'organization' | 'department' | 'team' | 'project';
}

// GET /api/roles/:id/permissions - 역할 권한 조회
interface RolePermissions {
  roleId: string;
  roleName: string;
  permissions: {
    resource: string;
    actions: string[];
    inherited: boolean; // from parent role
  }[];
  effectivePermissions: {
    resource: string;
    actions: string[];
  }[];
}

// POST /api/roles/:id/permissions/check - 권한 확인
interface CheckPermissionRequest {
  userId: string;
  resource: string;
  action: string;
  context?: {
    type: string;
    id: string;
  };
}

interface CheckPermissionResponse {
  allowed: boolean;
  reason?: string;
  appliedRoles: string[];
}
```

### Team Management API
```typescript
// POST /api/teams - 팀 생성
interface CreateTeamRequest {
  name: string;
  description?: string;
  teamType?: 'functional' | 'project' | 'cross_functional';
  departmentId?: string;
  leadId?: string;
  managerId?: string;
  isPublic?: boolean;
  maxMembers?: number;
}

// POST /api/teams/:id/members - 팀원 추가
interface AddTeamMemberRequest {
  userId: string;
  roleInTeam?: 'lead' | 'member' | 'guest';
}

// GET /api/teams/:id/members - 팀원 목록
interface TeamMember {
  user: PublicUser;
  roleInTeam: string;
  joinedAt: string;
  isActive: boolean;
}
```

### Organization API
```typescript
// GET /api/organization/structure - 조직도
interface OrganizationStructure {
  departments: {
    id: string;
    name: string;
    description: string;
    managerId: string;
    parentDepartmentId?: string;
    teams: {
      id: string;
      name: string;
      leadId: string;
      memberCount: number;
    }[];
    memberCount: number;
  }[];
}

// GET /api/organization/hierarchy/:userId - 사용자 조직 계층
interface UserHierarchy {
  user: PublicUser;
  manager?: PublicUser;
  directReports: PublicUser[];
  department?: {
    id: string;
    name: string;
    manager: PublicUser;
  };
  teams: {
    id: string;
    name: string;
    role: string;
  }[];
}
```

## 보안 구현

### 1. 패스워드 보안
```typescript
class PasswordSecurity {
  // 강력한 패스워드 정책
  private passwordPolicy = {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    preventPasswordReuse: 5, // 최근 5개 패스워드 재사용 방지
  };

  async hashPassword(password: string): Promise<string> {
    // bcrypt with salt rounds = 12
    return await bcrypt.hash(password, 12);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  validatePasswordStrength(password: string): ValidationResult {
    // 패스워드 강도 검증 로직
  }
}
```

### 2. MFA 구현
```typescript
class MfaService {
  async setupTotp(userId: string): Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }> {
    const secret = speakeasy.generateSecret({
      name: `Corporate Nexus (${user.email})`,
      issuer: 'Corporate Nexus Stream'
    });

    const backupCodes = this.generateBackupCodes();
    
    return {
      secret: secret.base32,
      qrCode: qrcode.generate(secret.otpauth_url),
      backupCodes: await this.encryptBackupCodes(backupCodes)
    };
  }

  async verifyTotp(userId: string, token: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps tolerance
    });
  }
}
```

### 3. 세션 관리
```typescript
class SessionManager {
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly REFRESH_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  async createSession(userId: string, deviceInfo: DeviceInfo): Promise<SessionTokens> {
    const sessionId = uuid();
    const accessToken = this.generateAccessToken(userId, sessionId);
    const refreshToken = this.generateRefreshToken(userId, sessionId);

    await this.sessionRepository.create({
      id: sessionId,
      userId,
      sessionToken: await this.hashToken(accessToken),
      refreshToken: await this.hashToken(refreshToken),
      userAgent: deviceInfo.userAgent,
      ipAddress: deviceInfo.ipAddress,
      deviceFingerprint: deviceInfo.fingerprint,
      expiresAt: new Date(Date.now() + this.SESSION_DURATION)
    });

    return { accessToken, refreshToken };
  }

  async validateSession(token: string): Promise<Session | null> {
    const payload = this.verifyToken(token);
    const session = await this.sessionRepository.findById(payload.sessionId);
    
    if (!session || !session.isActive || session.expiresAt < new Date()) {
      return null;
    }

    // Update last used timestamp
    await this.sessionRepository.updateLastUsed(session.id);
    
    return session;
  }
}
```

### 4. 권한 검증
```typescript
class AuthorizationService {
  async checkPermission(
    userId: string,
    resource: string,
    action: string,
    context?: Context
  ): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId, context);
    
    for (const role of userRoles) {
      const rolePermissions = await this.getRolePermissions(role.id);
      
      if (this.hasPermission(rolePermissions, resource, action)) {
        return true;
      }
    }
    
    return false;
  }

  private async getUserRoles(userId: string, context?: Context): Promise<Role[]> {
    let query = this.roleRepository
      .createQueryBuilder()
      .where('userRoles.userId = :userId', { userId })
      .andWhere('userRoles.isActive = true')
      .andWhere('(userRoles.expiresAt IS NULL OR userRoles.expiresAt > :now)', 
        { now: new Date() });

    if (context) {
      query = query.andWhere(
        '(userRoles.contextType IS NULL OR ' +
        '(userRoles.contextType = :contextType AND userRoles.contextId = :contextId))',
        { contextType: context.type, contextId: context.id }
      );
    }

    return query.getMany();
  }
}
```

## 구현 단계

### Phase 1: 기본 인증 시스템 (6주)
- [ ] 사용자 모델 및 기본 CRUD
- [ ] 이메일/패스워드 인증
- [ ] JWT 토큰 기반 세션 관리
- [ ] 패스워드 재설정 기능
- [ ] 기본 프로필 관리

### Phase 2: 조직 관리 시스템 (8주)
- [ ] 부서/팀 모델 및 관리
- [ ] 조직도 생성 및 시각화
- [ ] 팀원 관리 및 역할 할당
- [ ] 사용자 디렉토리 및 검색
- [ ] 관리자 대시보드

### Phase 3: 역할 기반 접근 제어 (10주)
- [ ] 역할 모델 및 권한 시스템
- [ ] 동적 권한 검증
- [ ] 컨텍스트 기반 권한 (프로젝트별, 팀별)
- [ ] 권한 승인 워크플로우
- [ ] 권한 감사 시스템

### Phase 4: 고급 보안 기능 (8주)
- [ ] 다중 인증 (MFA) 구현
- [ ] SSO 통합 (SAML, OAuth)
- [ ] 디바이스 관리 및 추적
- [ ] 의심스러운 활동 탐지
- [ ] 보안 감사 로그

### Phase 5: 외부 통합 (6주)
- [ ] LDAP/Active Directory 통합
- [ ] 소셜 로그인 (Google, Microsoft, GitHub)
- [ ] HR 시스템 연동
- [ ] API 키 관리
- [ ] 웹훅 및 이벤트 시스템

### Phase 6: 고급 기능 및 최적화 (8주)
- [ ] 자동 프로비저닝/디프로비저닝
- [ ] 사용자 라이프사이클 관리
- [ ] 고급 감사 및 컴플라이언스
- [ ] 성능 최적화 및 확장성
- [ ] 모바일 앱 인증

## 보안 및 컴플라이언스

### 데이터 보호
- **암호화**: 전송 중/저장 중 데이터 암호화
- **개인정보 보호**: GDPR, CCPA 준수
- **데이터 최소화**: 필요한 정보만 수집
- **익명화**: 분석용 데이터 익명화

### 접근 제어
- **최소 권한 원칙**: 필요한 최소한의 권한만 부여
- **정기 권한 검토**: 자동 권한 만료 및 검토
- **분리된 환경**: 개발/스테이징/운영 환경 분리
- **특권 계정 관리**: 관리자 계정 특별 보호

### 감사 및 모니터링
- **실시간 모니터링**: 의심스러운 활동 실시간 감지
- **로그 보존**: 법적 요구사항에 맞는 로그 보존
- **정기 보안 감사**: 외부 보안 감사 및 취약점 평가
- **인시던트 대응**: 보안 사고 대응 절차

## 성능 및 확장성

### 성능 최적화
- **데이터베이스 최적화**: 인덱스 최적화, 쿼리 튜닝
- **캐싱 전략**: Redis 기반 세션/권한 캐싱
- **CDN 활용**: 정적 자산 CDN 배포
- **로드 밸런싱**: 트래픽 분산 및 고가용성

### 확장성 설계
- **마이크로서비스**: 독립적으로 확장 가능한 서비스 분리
- **수평 확장**: Kubernetes 기반 자동 스케일링
- **데이터베이스 샤딩**: 사용자 데이터 샤딩
- **글로벌 배포**: 지역별 인프라 배포

## 모니터링 및 유지보수

### 운영 모니터링
- **헬스 체크**: 서비스 상태 실시간 모니터링
- **성능 메트릭**: 응답 시간, 처리량, 에러율
- **보안 지표**: 로그인 실패율, 의심스러운 활동
- **사용자 활동**: 활성 사용자, 기능 사용 통계

### 장애 대응
- **자동 복구**: 서비스 자동 재시작 및 복구
- **백업 및 복원**: 자동 백업 및 재해 복구
- **알림 시스템**: 중요 이벤트 즉시 알림
- **인시던트 관리**: 체계적인 장애 대응 프로세스

## 미래 발전 방향

### 차세대 인증
- **생체 인증**: 지문, 얼굴 인식 인증
- **Zero Trust**: 제로 트러스트 보안 모델
- **적응형 인증**: AI 기반 리스크 평가
- **블록체인**: 탈중앙화 신원 관리

### AI 기반 보안
- **이상 행동 탐지**: ML 기반 비정상 활동 감지
- **자동 위협 대응**: AI 기반 자동 보안 대응
- **예측 분석**: 보안 위험 예측 및 예방
- **개인화 보안**: 사용자별 맞춤형 보안 정책

### 규제 대응
- **새로운 규제**: 신규 프라이버시 규제 대응
- **글로벌 표준**: 국제 보안 표준 준수
- **업계 특화**: 산업별 특화 보안 요구사항
- **자동 컴플라이언스**: 자동 규제 준수 검증