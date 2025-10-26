FROM alpine:3.20
RUN apk add --no-cache nodejs-current npm python3 make g++
WORKDIR /app

COPY apps/shared/package.json apps/shared/
COPY apps/match/package.json apps/match/

RUN npm i --prefix apps/shared
RUN npm i --prefix apps/match

COPY apps/shared/tsconfig.json apps/shared/
COPY apps/shared/src apps/shared/src
RUN npm run --prefix apps/shared build

COPY apps/match/tsconfig.json apps/match/
COPY apps/match/src apps/match/src
RUN npm run --prefix apps/match build

RUN npm prune --omit=dev --prefix apps/match

WORKDIR /app/apps/match
EXPOSE 3003
CMD ["node","dist/index.js"]
