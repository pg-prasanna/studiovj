# ==========================================
# Stage 1: Build
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

# Pass the backend API URL at build time
# docker build --build-arg VITE_API_BASE_URL=https://api.yourdomain.com/api
ARG VITE_API_BASE_URL
ARG VITE_APP_TITLE=Studio\ VJ\ -\ Photo\ Gallery
ARG VITE_APP_VERSION=1.0.0
ARG VITE_SITE_TITLE=Studio\ VJ\ Photography
ARG VITE_SITE_DESCRIPTION=Professional\ Photography\ Portfolio
ARG VITE_ENABLE_DEBUG=false
ARG VITE_ENABLE_MOCK_DATA=false

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_TITLE=$VITE_APP_TITLE
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_SITE_TITLE=$VITE_SITE_TITLE
ENV VITE_SITE_DESCRIPTION=$VITE_SITE_DESCRIPTION
ENV VITE_ENABLE_DEBUG=$VITE_ENABLE_DEBUG
ENV VITE_ENABLE_MOCK_DATA=$VITE_ENABLE_MOCK_DATA

COPY . .
RUN npm run build

# ==========================================
# Stage 2: Serve with Nginx
# ==========================================
FROM nginx:1.25-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/app.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
