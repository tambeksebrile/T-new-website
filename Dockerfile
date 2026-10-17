FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build
FROM base AS runner
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN addgroup -g 1001 -S marketplace && adduser -u 1001 -S marketplace -G marketplace
COPY --from=builder --chown=marketplace:marketplace /app/public ./public
COPY --from=builder --chown=marketplace:marketplace /app/.next/standalone ./
COPY --from=builder --chown=marketplace:marketplace /app/.next/static ./.next/static
COPY --from=builder --chown=marketplace:marketplace /app/node_modules/.prisma ./node_modules/.prisma
USER marketplace
EXPOSE 3000
CMD ["node","server.js"]
