#!/bin/bash

# Development Environment Setup Script
# Complete setup for Corporate Nexus Stream development

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Corporate Nexus Stream - Development Setup   ${NC}"
echo -e "${BLUE}================================================${NC}"
echo

# Check prerequisites
echo -e "${GREEN}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
else
    echo -e "${GREEN}✓ Node.js $(node -v)${NC}"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
else
    echo -e "${GREEN}✓ npm $(npm -v)${NC}"
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠ Docker is not installed${NC}"
    echo "Docker is required for backend services"
    echo "Install from: https://docs.docker.com/get-docker/"
    read -p "Continue without Docker? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ Docker $(docker -v | cut -d' ' -f3 | cut -d',' -f1)${NC}"
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}⚠ Docker Compose is not installed${NC}"
    echo "Docker Compose is required for running services"
else
    if docker compose version &> /dev/null; then
        echo -e "${GREEN}✓ Docker Compose $(docker compose version | cut -d' ' -f4)${NC}"
    else
        echo -e "${GREEN}✓ Docker Compose $(docker-compose -v | cut -d' ' -f3 | cut -d',' -f1)${NC}"
    fi
fi

echo

# Install dependencies
echo -e "${GREEN}Installing frontend dependencies...${NC}"
npm install

echo

# Setup environment files
echo -e "${GREEN}Setting up environment files...${NC}"
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✓ Created .env.local from template${NC}"
else
    echo -e "${YELLOW}⚠ .env.local already exists, skipping${NC}"
fi

# Create necessary directories
echo -e "${GREEN}Creating project directories...${NC}"
mkdir -p docker/{nginx/conf.d,nginx/ssl,postgres/init}
mkdir -p src/{pages/{auth,dashboard,knowledge,workLogs,projects,teams,analytics,search,profile,settings},services,stores,types,utils}
echo -e "${GREEN}✓ Directories created${NC}"

echo

# Docker services
if command -v docker &> /dev/null; then
    echo -e "${GREEN}Starting Docker services...${NC}"
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker daemon is not running${NC}"
        echo "Please start Docker Desktop and try again"
        exit 1
    fi
    
    # Pull images
    echo -e "${BLUE}Pulling Docker images (this may take a few minutes)...${NC}"
    docker-compose pull
    
    # Start services
    echo -e "${BLUE}Starting services...${NC}"
    docker-compose up -d postgres redis elasticsearch rabbitmq minio
    
    # Wait for services to be ready
    echo -e "${BLUE}Waiting for services to be ready...${NC}"
    sleep 10
    
    # Check service health
    echo -e "${GREEN}Checking service health...${NC}"
    
    # Check PostgreSQL
    if docker-compose exec -T postgres pg_isready -U nexus &> /dev/null; then
        echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
    else
        echo -e "${YELLOW}⚠ PostgreSQL is starting...${NC}"
    fi
    
    # Check Redis
    if docker-compose exec -T redis redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✓ Redis is ready${NC}"
    else
        echo -e "${YELLOW}⚠ Redis is starting...${NC}"
    fi
    
    # Check Elasticsearch
    if curl -s http://localhost:9200/_cluster/health &> /dev/null; then
        echo -e "${GREEN}✓ Elasticsearch is ready${NC}"
    else
        echo -e "${YELLOW}⚠ Elasticsearch is starting...${NC}"
    fi
    
    echo
    echo -e "${GREEN}Docker services status:${NC}"
    docker-compose ps
fi

echo

# Initialize backend (optional)
read -p "Initialize backend project? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f scripts/init-backend.sh ]; then
        bash scripts/init-backend.sh
    else
        echo -e "${RED}Backend initialization script not found${NC}"
    fi
fi

echo
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}       Development Environment Ready!           ${NC}"
echo -e "${GREEN}================================================${NC}"
echo
echo -e "${BLUE}Available commands:${NC}"
echo "  npm run dev           - Start frontend dev server"
echo "  npm run docker:up     - Start Docker services"
echo "  npm run docker:down   - Stop Docker services"
echo "  npm run docker:logs   - View service logs"
echo "  npm run backend:init  - Initialize backend project"
echo "  npm run backend:dev   - Start backend dev server"
echo "  npm run dev:all       - Start everything"
echo
echo -e "${BLUE}Service URLs:${NC}"
echo "  Frontend:        http://localhost:5173"
echo "  Backend API:     http://localhost:3000"
echo "  API Docs:        http://localhost:3000/api-docs"
echo "  PostgreSQL:      localhost:5432"
echo "  Redis:           localhost:6379"
echo "  Elasticsearch:   http://localhost:9200"
echo "  RabbitMQ:        http://localhost:15672"
echo "  MinIO:           http://localhost:9001"
echo "  Adminer:         http://localhost:8080"
echo "  Mailhog:         http://localhost:8025"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review and update .env.local with your settings"
echo "2. Run 'npm run dev' to start the frontend"
echo "3. Initialize backend if needed"
echo "4. Start coding! 🚀"
echo
