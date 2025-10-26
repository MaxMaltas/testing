FROM alpine:3.20
RUN apk add --no-cache nodejs-current npm python3 make g++
WORKDIR /app

COPY apps/shared/package.json apps/shared/
COPY apps/user/package.json apps/user/

RUN npm i --prefix apps/shared
RUN npm i --prefix apps/user

COPY apps/shared/tsconfig.json apps/shared/
COPY apps/shared/src apps/shared/src
RUN npm run --prefix apps/shared build

COPY apps/user/tsconfig.json apps/user/
COPY apps/user/src apps/user/src
RUN npm run --prefix apps/user build

RUN npm prune --omit=dev --prefix apps/user

WORKDIR /app/apps/user
EXPOSE 3002
CMD ["node","dist/index.js"]
