# Multi-stage: build the static export, then serve it plus the API.
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run docs:index && bun run build

FROM oven/bun:1
WORKDIR /app
ENV NODE_ENV=production
# The server needs out/, public/, content/, and its own source only.
COPY --from=build /app/out ./out
COPY --from=build /app/public ./public
COPY --from=build /app/content ./content
COPY --from=build /app/server ./server
COPY --from=build /app/package.json ./package.json
EXPOSE 3000
CMD ["bun", "server/index.mjs"]
