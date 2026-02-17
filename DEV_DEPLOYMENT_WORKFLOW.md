# Development & Deployment Workflow

## Overview

**Development**: Windows Laptop → GitHub → Docker Hub/GHCR
**Deployment**: Raspberry Pi pulls from Docker Hub/GHCR

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WINDOWS LAPTOP                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. Code Changes (VS Code)                             │ │
│  │  2. Test locally: npm start                            │ │
│  │  3. Git commit & push to GitHub                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       GITHUB                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  GitHub Actions CI/CD triggers on push                 │ │
│  │  1. Runs tests                                         │ │
│  │  2. Builds Docker image                                │ │
│  │  3. Pushes to Docker Hub/GHCR                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              DOCKER HUB / GHCR                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Image Registry stores:                                │ │
│  │  - yourusername/portfolio:latest                       │ │
│  │  - yourusername/buzzcart:latest                        │ │
│  │  - yourusername/rideshare:latest                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   RASPBERRY PI                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Watchtower (auto-update) OR manual pull               │ │
│  │  1. docker-compose pull                                │ │
│  │  2. docker-compose up -d                               │ │
│  │  3. Services restart with new code                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Step-by-Step Workflow

### 1. Development on Windows

```bash
# Make code changes in VS Code
# Test locally
cd C:\Users\dravi\Downloads\react-portfolio-template-master
npm start

# When ready, commit and push
git add .
git commit -m "Updated portfolio contact form"
git push origin main
```

### 2. GitHub Actions (Automatic Build & Push)

Create `.github/workflows/deploy.yml` in your project:

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    # Alternative: GitHub Container Registry
    # - name: Login to GHCR
    #   uses: docker/login-action@v2
    #   with:
    #     registry: ghcr.io
    #     username: ${{ github.actor }}
    #     password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: |
          yourusername/portfolio:latest
          yourusername/portfolio:${{ github.sha }}
        platforms: linux/arm64  # Important for Raspberry Pi!
        cache-from: type=registry,ref=yourusername/portfolio:buildcache
        cache-to: type=registry,ref=yourusername/portfolio:buildcache,mode=max
```

### 3. Raspberry Pi Configuration

**On Raspberry Pi - docker-compose.yml:**

```yaml
version: '3.8'

services:
  nginx:
    build: ./nginx
    ports:
      - "80:80"
    depends_on:
      - landing-page
      - portfolio
      - buzzcart-frontend
    restart: unless-stopped
    networks:
      - web

  landing-page:
    image: yourusername/landing-page:latest  # Pull from registry
    expose:
      - "80"
    restart: unless-stopped
    networks:
      - web

  portfolio:
    image: yourusername/portfolio:latest  # Pull from registry
    expose:
      - "80"
    restart: unless-stopped
    networks:
      - web

  buzzcart-frontend:
    image: yourusername/buzzcart-frontend:latest  # Pull from registry
    expose:
      - "80"
    environment:
      - REACT_APP_API_URL=/api/buzzcart
    restart: unless-stopped
    networks:
      - web

  buzzcart-backend:
    image: yourusername/buzzcart-backend:latest  # Pull from registry
    expose:
      - "8080"
    environment:
      - DATABASE_URL=postgresql://buzzuser:buzzpass@postgres:5432/buzzcart
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - web
      - backend

  rideshare:
    image: yourusername/rideshare:latest  # Pull from registry
    expose:
      - "80"
    restart: unless-stopped
    networks:
      - web

  # Auto-update container (watches for new images)
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_POLL_INTERVAL=300  # Check every 5 minutes
      - WATCHTOWER_INCLUDE_STOPPED=false
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=buzzuser
      - POSTGRES_PASSWORD=buzzpass
      - POSTGRES_DB=buzzcart
    restart: unless-stopped
    networks:
      - backend

networks:
  web:
    driver: bridge
  backend:
    driver: bridge

volumes:
  postgres_data:
```

### 4. Manual Update on Raspberry Pi

```bash
# SSH into Raspberry Pi
ssh pi@raspberrypi.local

cd /home/pi/websites

# Pull latest images from registry
docker-compose pull

# Restart services with new images
docker-compose up -d

# View logs
docker-compose logs -f portfolio
```

### 5. Automatic Updates with Watchtower

Watchtower automatically:
- Checks for new images every 5 minutes
- Pulls new versions
- Restarts containers with zero downtime
- Cleans up old images

**No manual intervention needed!**

## What Goes Where?

### On Windows Laptop (Development)
```
C:\Users\dravi\projects\
├── portfolio\
│   ├── .git\
│   ├── .github\workflows\deploy.yml  ← CI/CD config
│   ├── Dockerfile                    ← Build instructions
│   ├── package.json
│   └── src\
├── buzzcart-frontend\
│   ├── .git\
│   ├── .github\workflows\deploy.yml
│   ├── Dockerfile
│   └── ...
└── buzzcart-backend\
    ├── .git\
    ├── .github\workflows\deploy.yml
    ├── Dockerfile
    └── ...
```

### On Raspberry Pi (Production)
```
/home/pi/websites/
├── docker-compose.yml          ← Points to registry images
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf
├── .env                        ← Secrets (DB passwords, etc.)
└── scripts/
    └── update.sh               ← Optional manual update script
```

**NO SOURCE CODE ON PI!** Only docker-compose.yml and configs.

## Complete Workflow Example

### Initial Setup (One-time)

**1. On Windows - Create Dockerfile for Portfolio:**

```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . ./
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Handle React Router (all routes to index.html)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**2. Setup GitHub Secrets:**
```
GitHub Repo → Settings → Secrets → Actions
Add:
- DOCKER_USERNAME: your-dockerhub-username
- DOCKER_PASSWORD: your-dockerhub-token
```

**3. Push to GitHub:**
```bash
git add .
git commit -m "Add Docker and CI/CD"
git push origin main
```

**4. GitHub Actions runs automatically:**
- Builds Docker image for ARM64 (Pi architecture)
- Pushes to Docker Hub: `yourusername/portfolio:latest`

**5. On Raspberry Pi (first time):**
```bash
# Create directory structure
mkdir -p /home/pi/websites/nginx
cd /home/pi/websites

# Create docker-compose.yml (use the one above)
nano docker-compose.yml

# Login to Docker Hub
docker login

# Start everything
docker-compose up -d
```

### Daily Development Workflow

**On Windows:**
```bash
# 1. Make changes
code .

# 2. Test locally
npm start

# 3. When ready, push to GitHub
git add .
git commit -m "Fixed contact form styling"
git push
# GitHub Actions builds and pushes to registry automatically
```

**On Raspberry Pi:**
```bash
# If using Watchtower: Do nothing! Auto-updates in 5 min
# If manual: SSH and run:
docker-compose pull && docker-compose up -d
```

## Dockerfile Examples for Different Projects

### React/TypeScript (Portfolio, BuzzCart Frontend)
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Go Backend (BuzzCart Backend)
```dockerfile
FROM golang:1.21-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=build /app/main .
EXPOSE 8080
CMD ["./main"]
```

### Java (RideShare)
```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

## Quick Update Script for Pi

Create `/home/pi/websites/update.sh`:

```bash
#!/bin/bash
cd /home/pi/websites
echo "Pulling latest images..."
docker-compose pull
echo "Restarting services..."
docker-compose up -d
echo "Cleaning up old images..."
docker image prune -f
echo "Done!"
docker-compose ps
```

```bash
chmod +x update.sh
./update.sh  # Run anytime to update all services
```

## Registry Options

### Option 1: Docker Hub (Easiest)
- **Free**: Unlimited public repos
- **Pricing**: $5/month for private repos
- **URL**: hub.docker.com
- **Images**: `yourusername/portfolio:latest`

### Option 2: GitHub Container Registry (GHCR)
- **Free**: Unlimited public/private repos
- **Built into GitHub**
- **Images**: `ghcr.io/yourusername/portfolio:latest`
- **Best if already using GitHub**

### Option 3: Self-hosted Registry
- **Free** but requires setup
- Run registry on Pi itself
- Only for advanced users

## Recommended: Docker Hub + Watchtower

**Pros:**
✅ Develop on Windows, push to GitHub
✅ GitHub Actions builds for ARM64 automatically
✅ Watchtower auto-updates Pi every 5 minutes
✅ Zero manual intervention
✅ Can rollback to any version

**Workflow:**
1. Code on Windows
2. `git push`
3. Wait 5-10 minutes
4. Changes live on yourdomain.com

That's it! 🚀

## Troubleshooting

**Build fails for ARM64?**
```yaml
# In GitHub Actions, ensure:
platforms: linux/arm64
```

**Can't pull images on Pi?**
```bash
# Login to Docker Hub on Pi
docker login
```

**Watchtower not updating?**
```bash
# Check Watchtower logs
docker logs watchtower
```

**Want to see build progress?**
```bash
# GitHub → Actions tab → Click on latest workflow run
```
