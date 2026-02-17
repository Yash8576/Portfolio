# Docker Deployment Guide

This guide will help you build, push, and deploy your portfolio to your Raspberry Pi.

## Prerequisites

- Docker installed on your development machine
- Docker installed on your Raspberry Pi
- Docker Hub account (or another container registry)

## Step 1: Build the Docker Image

Build the image for multiple architectures (including ARM for Raspberry Pi):

```bash
# Build for your current architecture
docker build -t your-username/portfolio:v1.0 .

# OR build for multi-architecture (recommended for Raspberry Pi)
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t your-username/portfolio:v1.0 --push .
```

## Step 2: Push to Docker Registry

### Using Docker Hub:

```bash
# Login to Docker Hub
docker login

# Tag the image (if not already tagged)
docker tag portfolio:v1.0 your-username/portfolio:v1.0

# Push to Docker Hub
docker push your-username/portfolio:v1.0
```

### Using GitHub Container Registry:

```bash
# Login to GitHub Container Registry
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Tag the image
docker tag portfolio:v1.0 ghcr.io/your-username/portfolio:v1.0

# Push to GitHub Container Registry
docker push ghcr.io/your-username/portfolio:v1.0
```

## Step 3: Deploy on Raspberry Pi

### SSH into your Raspberry Pi:

```bash
ssh pi@your-pi-ip-address
```

### Pull and Run the Container:

```bash
# Login to your registry (if needed)
docker login

# Pull the image
docker pull your-username/portfolio:v1.0

# Run the container
docker run -d \
  --name portfolio \
  --restart unless-stopped \
  -p 80:80 \
  your-username/portfolio:v1.0
```

### OR use Docker Compose (recommended):

Create a `docker-compose.yml` file on your Pi or copy the existing one:

```bash
# Copy docker-compose.yml to your Pi
scp docker-compose.yml pi@your-pi-ip:/home/pi/portfolio/

# SSH into Pi
ssh pi@your-pi-ip

# Navigate to directory
cd /home/pi/portfolio

# Edit docker-compose.yml to use your image
nano docker-compose.yml
# Change: image: portfolio:v1.0
# To: image: your-username/portfolio:v1.0

# Start the container
docker-compose up -d
```

## Step 4: Verify Deployment

Check if the container is running:

```bash
docker ps
```

View logs:

```bash
docker logs portfolio
```

Access your portfolio:
```
http://your-pi-ip
```

## Useful Commands

### Update the deployment:

```bash
# Pull latest image
docker pull your-username/portfolio:v1.0

# Stop and remove old container
docker stop portfolio
docker rm portfolio

# Run new container
docker run -d --name portfolio --restart unless-stopped -p 80:80 your-username/portfolio:v1.0

# OR with docker-compose
docker-compose pull
docker-compose up -d
```

### View logs:

```bash
docker logs -f portfolio
```

### Stop the container:

```bash
docker stop portfolio
```

### Restart the container:

```bash
docker restart portfolio
```

## Setting up a Custom Domain

If you have a domain name:

1. Point your domain's A record to your Raspberry Pi's public IP
2. Set up port forwarding on your router (port 80 and 443)
3. Consider using a reverse proxy like Nginx Proxy Manager or Traefik for HTTPS

## Automatic Updates

Create a cron job to automatically pull and update:

```bash
# Edit crontab
crontab -e

# Add this line to check for updates daily at 2 AM
0 2 * * * cd /home/pi/portfolio && docker-compose pull && docker-compose up -d
```

## Troubleshooting

### Container won't start:
```bash
docker logs portfolio
```

### Check container health:
```bash
docker inspect portfolio | grep -A 10 Health
```

### Remove all unused images:
```bash
docker system prune -a
```

### Check disk space on Pi:
```bash
df -h
docker system df
```

## Security Tips

1. Use environment variables for sensitive data
2. Keep Docker and your Pi updated
3. Use HTTPS (Let's Encrypt with Certbot)
4. Consider using a firewall (ufw)
5. Regularly update your Docker images

## Performance Optimization

- The image uses nginx alpine for minimal size (~25MB compressed)
- Gzip compression is enabled
- Health checks ensure the container is responsive
- Multi-stage build reduces image size significantly
