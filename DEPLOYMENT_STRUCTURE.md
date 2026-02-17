# Raspberry Pi Deployment Structure

## Directory Structure on Pi

```
/home/pi/websites/
├── docker-compose.yml
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf
├── landing-page/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── portfolio/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── buzzcart-frontend/
│   ├── Dockerfile
│   └── ...
├── buzzcart-backend/
│   ├── Dockerfile
│   └── ...
├── rideshare/
│   ├── Dockerfile
│   └── ...
├── project3/
│   └── ...
└── project4/
    └── ...
```

## Nginx Configuration (Path-based Routing)

**nginx/nginx.conf:**
```nginx
events {
    worker_connections 1024;
}

http {
    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Main landing page
    server {
        listen 80;
        server_name _;

        # Landing page at root
        location / {
            proxy_pass http://landing-page:80;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Portfolio
        location /portfolio/ {
            proxy_pass http://portfolio:80/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # BuzzCart Frontend
        location /buzzcart/ {
            proxy_pass http://buzzcart-frontend:80/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # BuzzCart API
        location /api/buzzcart/ {
            proxy_pass http://buzzcart-backend:8080/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # RideShare
        location /rideshare/ {
            proxy_pass http://rideshare:80/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Project 3
        location /project3/ {
            proxy_pass http://project3:80/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Project 4
        location /project4/ {
            proxy_pass http://project4:80/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

**nginx/Dockerfile:**
```dockerfile
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Docker Compose Configuration

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  # Nginx Reverse Proxy
  nginx:
    build: ./nginx
    ports:
      - "80:80"
    depends_on:
      - landing-page
      - portfolio
      - buzzcart-frontend
      - buzzcart-backend
      - rideshare
    restart: unless-stopped
    networks:
      - web

  # Landing Page (Root /)
  landing-page:
    build: ./landing-page
    expose:
      - "80"
    restart: unless-stopped
    networks:
      - web

  # Portfolio (/portfolio)
  portfolio:
    build: ./portfolio
    expose:
      - "80"
    restart: unless-stopped
    networks:
      - web

  # BuzzCart Frontend (/buzzcart)
  buzzcart-frontend:
    build: ./buzzcart-frontend
    expose:
      - "80"
    environment:
      - REACT_APP_API_URL=/api/buzzcart
    restart: unless-stopped
    networks:
      - web

  # BuzzCart Backend (/api/buzzcart)
  buzzcart-backend:
    build: ./buzzcart-backend
    expose:
      - "8080"
    environment:
      - DATABASE_URL=postgresql://buzzuser:buzzpass@postgres:5432/buzzcart
      - MONGO_URL=mongodb://mongo:27017/buzzcart
    depends_on:
      - postgres
      - mongo
    restart: unless-stopped
    networks:
      - web
      - backend

  # RideShare (/rideshare)
  rideshare:
    build: ./rideshare
    expose:
      - "80"
    restart: unless-stopped
    networks:
      - web

  # Project 3
  project3:
    build: ./project3
    expose:
      - "80"
    restart: unless-stopped
    networks:
      - web

  # Project 4
  project4:
    build: ./project4
    expose:
      - "80"
    restart: unless-stopped
    networks:
      - web

  # PostgreSQL
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

  # MongoDB
  mongo:
    image: mongo:7-jammy
    volumes:
      - mongo_data:/data/db
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
  mongo_data:
```

## Fix React Router for Path-based Deployment

For each React project, update **package.json**:

**Portfolio (served at /portfolio):**
```json
{
  "homepage": "/portfolio",
  ...
}
```

**BuzzCart (served at /buzzcart):**
```json
{
  "homepage": "/buzzcart",
  ...
}
```

And in **App.tsx** or main router file:
```tsx
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter basename="/portfolio">
      {/* Your routes */}
    </BrowserRouter>
  );
}
```

## Cloudflare Tunnel Configuration

**~/.cloudflared/config.yml:**
```yaml
tunnel: <TUNNEL-ID>
credentials-file: /home/pi/.cloudflared/<TUNNEL-ID>.json

ingress:
  - hostname: yourdomain.com
    service: http://localhost:80
  - service: http_status:404
```

## Deployment Commands

```bash
# On Raspberry Pi
cd /home/pi/websites

# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart portfolio

# Stop all
docker-compose down

# Stop and remove volumes (careful!)
docker-compose down -v
```

## URL Structure

- `yourdomain.com` → Landing page
- `yourdomain.com/portfolio` → Your portfolio
- `yourdomain.com/buzzcart` → BuzzCart project
- `yourdomain.com/rideshare` → RideShare project
- `yourdomain.com/project3` → Project 3
- `yourdomain.com/project4` → Project 4

## Landing Page Navigation Example

```tsx
// Simple landing page with project buttons
export default function LandingPage() {
  const projects = [
    { name: 'Portfolio', path: '/portfolio', desc: 'My personal portfolio' },
    { name: 'BuzzCart', path: '/buzzcart', desc: 'AI Shopping Assistant' },
    { name: 'RideShare', path: '/rideshare', desc: 'Ride Sharing App' },
    { name: 'Project 3', path: '/project3', desc: 'Description' },
    { name: 'Project 4', path: '/project4', desc: 'Description' },
  ];

  return (
    <div>
      <h1>Welcome to My Projects</h1>
      <div className="projects-grid">
        {projects.map(project => (
          <a href={project.path} key={project.name}>
            <div className="project-card">
              <h3>{project.name}</h3>
              <p>{project.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
```

## Memory Usage Estimate (8GB Pi)

- **OS**: 500MB
- **Docker**: 200MB
- **Nginx**: 50MB
- **Landing Page**: 30MB
- **Portfolio**: 50MB
- **BuzzCart Frontend**: 50MB
- **BuzzCart Backend**: 150MB
- **RideShare**: 50MB
- **Project 3**: 50MB
- **Project 4**: 50MB
- **PostgreSQL**: 200MB
- **MongoDB**: 300MB
- **Cloudflared**: 50MB

**Total: ~1.7GB** (6.3GB free for caching, buffers, and traffic)

✅ You can comfortably host 5-7 small to medium projects!
