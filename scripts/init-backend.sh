#!/bin/bash

# Backend Project Initialization Script
# This script sets up the NestJS backend structure for Corporate Nexus Stream

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${PROJECT_ROOT}/backend"

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Corporate Nexus Stream Backend Setup ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js 18+ first"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js version 18+ is required${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi

# Check if backend directory exists
if [ -d "$BACKEND_DIR" ]; then
    echo -e "${YELLOW}Warning: Backend directory already exists${NC}"
    read -p "Do you want to continue? This will overwrite existing files (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create backend directory
echo -e "${GREEN}Creating backend directory...${NC}"
mkdir -p "$BACKEND_DIR"
cd "$BACKEND_DIR"

# Install NestJS CLI globally if not installed
if ! command -v nest &> /dev/null; then
    echo -e "${GREEN}Installing NestJS CLI...${NC}"
    npm install -g @nestjs/cli
fi

# Initialize NestJS project
echo -e "${GREEN}Initializing NestJS project...${NC}"
nest new . --package-manager npm --skip-git --skip-install --strict

# Create service directories
echo -e "${GREEN}Creating service directories...${NC}"
mkdir -p src/services/{auth,knowledge-base,work-logs,search,collaboration,analytics,ai-insights,projects}
mkdir -p src/common/{decorators,guards,interceptors,filters,pipes,dto}
mkdir -p src/database/{entities,migrations,seeds}
mkdir -p src/config
mkdir -p src/utils
mkdir -p src/queue
mkdir -p src/websocket

# Install dependencies
echo -e "${GREEN}Installing core dependencies...${NC}"
npm install \
    @nestjs/config \
    @nestjs/typeorm \
    @nestjs/passport \
    @nestjs/jwt \
    @nestjs/swagger \
    @nestjs/throttler \
    @nestjs/bull \
    @nestjs/websockets \
    @nestjs/platform-socket.io \
    @nestjs/cache-manager \
    @nestjs/schedule \
    @nestjs/event-emitter \
    typeorm \
    pg \
    redis \
    cache-manager \
    cache-manager-redis-store \
    passport \
    passport-jwt \
    passport-local \
    bcrypt \
    class-validator \
    class-transformer \
    helmet \
    compression \
    cookie-parser \
    express-session \
    multer \
    uuid \
    dotenv \
    joi \
    bull \
    socket.io \
    @elastic/elasticsearch \
    minio \
    amqplib \
    @nestjs/microservices

# Install dev dependencies
echo -e "${GREEN}Installing dev dependencies...${NC}"
npm install -D \
    @types/passport-jwt \
    @types/passport-local \
    @types/bcrypt \
    @types/multer \
    @types/cookie-parser \
    @types/express-session \
    @types/compression \
    @types/uuid \
    @types/amqplib \
    @nestjs/testing \
    @types/jest \
    jest \
    supertest \
    @types/supertest \
    ts-jest \
    ts-node \
    prettier \
    eslint-plugin-prettier \
    eslint-config-prettier

# Create configuration files
echo -e "${GREEN}Creating configuration files...${NC}"

# Create .env file
cat > .env << 'EOF'
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api
API_VERSION=v1

# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=nexus
DB_PASSWORD=nexus_secret
DB_DATABASE=nexus_stream
DB_SYNCHRONIZE=false
DB_LOGGING=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_secret

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRES_IN=7d

# Session
SESSION_SECRET=your-session-secret

# Elasticsearch
ELASTIC_NODE=http://localhost:9200

# RabbitMQ
RABBITMQ_URL=amqp://nexus:rabbitmq_secret@localhost:5672/nexus

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=nexus
MINIO_SECRET_KEY=minio_secret
MINIO_USE_SSL=false
EOF

# Create main.ts with enhanced configuration
cat > src/main.ts << 'EOF'
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.use(cookieParser());
  app.use(
    session({
      secret: configService.get('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: configService.get('NODE_ENV') === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),
  );

  // Compression
  app.use(compression());

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGINS')?.split(',') || true,
    credentials: true,
  });

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Corporate Nexus Stream API')
    .setDescription('Enterprise Knowledge Management Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('knowledge', 'Knowledge base endpoints')
    .addTag('work-logs', 'Work logs endpoints')
    .addTag('search', 'Search endpoints')
    .addTag('collaboration', 'Team collaboration endpoints')
    .addTag('analytics', 'Analytics endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
}

bootstrap();
EOF

echo -e "${GREEN}Backend initialization complete!${NC}"
echo
echo -e "${BLUE}Next steps:${NC}"
echo "1. cd backend"
echo "2. Update .env file with your database credentials"
echo "3. npm run start:dev"
echo
echo -e "${YELLOW}Important:${NC}"
echo "- Make sure Docker services are running: docker-compose up -d"
echo "- Database migrations will be created after entities are defined"
echo "- Check http://localhost:3000/api-docs for API documentation"
echo
echo -e "${GREEN}✅ Backend project structure created successfully!${NC}"
