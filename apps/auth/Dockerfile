FROM alpine:3.20
RUN apk add --no-cache nodejs-current npm python3 make g++
WORKDIR /app


COPY apps/shared/package.json apps/shared/
COPY apps/auth/package.json apps/auth/

RUN npm i --prefix apps/shared
RUN npm i --prefix apps/auth
RUN npm i --save-dev @types/better-sqlite3 --prefix apps/auth

COPY apps/shared/tsconfig.json apps/shared/
COPY apps/shared/src apps/shared/src
RUN npm run --prefix apps/shared build

COPY apps/auth/tsconfig.json apps/auth/
COPY apps/auth/src apps/auth/src

RUN npm run --prefix apps/auth build
RUN npm prune --omit=dev --prefix apps/auth

WORKDIR /app/apps/auth
EXPOSE 3001
CMD ["node","dist/index.js"]
