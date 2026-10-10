# Next.js website. Railway: Dockerfile path web/Dockerfile, build context = repo root.
# STRAPI_PUBLIC_URL is needed at build time (image hosts and the frame-ancestors header).
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY web/package.json web/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY web/ ./
ARG STRAPI_PUBLIC_URL
ENV STRAPI_PUBLIC_URL=$STRAPI_PUBLIC_URL NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-bookworm-slim
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
