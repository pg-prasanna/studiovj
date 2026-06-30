# ==========================================
# Stage 1: Build
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Cache dependencies separately from source
COPY package*.json ./
RUN npm ci --silent

# Build args become VITE_ env vars at build time
# Pass them with: docker build --build-arg VITE_API_URL=https://api.yourdomain.com/api
ARG VITE_API_URL
ARG VITE_APP_TITLE=Studio\ VJ\ Admin
ARG VITE_APP_VERSION=1.0.0
ARG VITE_ENABLE_DEBUG=false
ARG VITE_ENABLE_MOCK_DATA=false

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_TITLE=$VITE_APP_TITLE
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_ENABLE_DEBUG=$VITE_ENABLE_DEBUG
ENV VITE_ENABLE_MOCK_DATA=$VITE_ENABLE_MOCK_DATA

COPY . .
RUN npm run build

# ==========================================
# Stage 2: Serve with Nginx
# ==========================================
FROM nginx:1.25-alpine

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our config
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
