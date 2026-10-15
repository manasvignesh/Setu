# Dockerfile for SETU Accessible Classroom (Standalone Frontend)
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
ENV PORT=8000
EXPOSE 8000
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8000}"]
