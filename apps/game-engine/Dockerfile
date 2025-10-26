FROM alpine:3.20
RUN apk add --no-cache nodejs-current npm
WORKDIR /app

COPY apps/shared/package.json apps/shared/
COPY apps/game-engine/package.json apps/game-engine/

RUN npm i --prefix apps/shared
RUN npm i --prefix apps/game-engine

COPY apps/shared/tsconfig.json apps/shared/
COPY apps/shared/src apps/shared/src
RUN npm run --prefix apps/shared build

COPY apps/game-engine/tsconfig.json apps/game-engine/
COPY apps/game-engine/src apps/game-engine/src
RUN npm run --prefix apps/game-engine build

RUN npm prune --omit=dev --prefix apps/game-engine

WORKDIR /app/apps/game-engine
EXPOSE 3004
CMD ["node","dist/index.js"]
