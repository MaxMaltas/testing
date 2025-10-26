FROM alpine:3.20
RUN apk add --no-cache nodejs-current npm python3 make g++
WORKDIR /app

COPY apps/shared/package.json apps/shared/
COPY apps/game-matchmaking/package.json apps/game-matchmaking/

RUN npm i --prefix apps/shared
RUN npm i --prefix apps/game-matchmaking

COPY apps/shared/tsconfig.json apps/shared/
COPY apps/shared/src apps/shared/src
RUN npm run --prefix apps/shared build

COPY apps/game-matchmaking/tsconfig.json apps/game-matchmaking/
COPY apps/game-matchmaking/src apps/game-matchmaking/src
RUN npm run --prefix apps/game-matchmaking build

RUN npm prune --omit=dev --prefix apps/game-matchmaking

WORKDIR /app/apps/game-matchmaking
EXPOSE 3005
CMD ["node","dist/index.js"]
