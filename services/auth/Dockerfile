ARG NODE_VERSION=22
# Alpine image
FROM node:${NODE_VERSION}-alpine AS alpine
RUN apk update
RUN apk add --no-cache libc6-compat

# Setup pnpm and turbo on the alpine base
FROM alpine AS base
RUN npm install pnpm turbo --global
RUN pnpm config set store-dir ~/.pnpm-store

# Prune projects
FROM base AS pruner

WORKDIR /app
COPY . .
RUN turbo prune --scope=@opstd/auth --docker

# Build the project
FROM base AS builder

WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/.config/biome.json ./.config/biome.json
COPY --from=pruner /app/.gitignore ./.gitignore
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .

# First install the dependencies (as they change less often)
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm install --frozen-lockfile

# Copy source code of isolated subworkspace
COPY --from=pruner /app/out/full/ .

RUN turbo build --filter=@opstd/auth
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm prune --prod --no-optional
RUN rm -rf ./**/*/src

# Final image
FROM alpine AS runner
LABEL authors="frnwtr"

RUN apk add --no-cache curl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app .
WORKDIR /app/services/auth

ARG PORT=4001
ENV PORT=${PORT}
ENV NODE_ENV=production
EXPOSE ${PORT}
HEALTHCHECK \
  --interval=5s \
  --timeout=3s \
  --start-period=5s \
  --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

CMD ["npm","run","start"]