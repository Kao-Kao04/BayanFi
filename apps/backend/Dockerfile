FROM node:20-alpine AS base
RUN apk add --no-cache openssl

# --- deps ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/stellar/package.json ./packages/stellar/
COPY packages/types/package.json ./packages/types/
RUN npm install

# --- builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run db:generate --workspace=apps/backend
RUN npm run build --workspace=apps/backend

# --- runner ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/packages ./packages
EXPOSE 4000
WORKDIR /app/apps/backend
CMD ["node", "dist/main"]
