# Strapi CMS. Railway: Dockerfile path cms/Dockerfile, build context = repo root.
# Locally: docker build -f cms/Dockerfile -t supertext-integrations-cms . && docker run -p 1337:1337 --env-file cms/.env supertext-integrations-cms
FROM node:22-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY cms/package.json cms/package-lock.json cms/.npmrc ./
COPY cms/scripts ./scripts
# The Supertext translation plugin, built from its GitHub repo (PLUGIN_REF = branch or tag);
# package.json depends on the resulting plugins/supertext.tgz.
ARG PLUGIN_REF=main
RUN PLUGIN_REF="$PLUGIN_REF" sh scripts/fetch-plugin.sh
RUN npm ci --omit=optional --no-audit --no-fund
COPY cms/ ./
RUN NODE_ENV=production npm run build

FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app ./
RUN mkdir -p public/uploads && echo ok > public/health
EXPOSE 1337
CMD ["npm", "run", "start"]
