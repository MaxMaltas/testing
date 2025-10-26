FROM alpine:3.20
RUN apk add --no-cache nodejs-current npm
WORKDIR /app

COPY apps/shared/package.json apps/shared/
COPY apps/api-gateway/package.json apps/api-gateway/

# Instala node-fetch@2 para compatibilidad CommonJS
RUN npm i node-fetch@2 --prefix apps/api-gateway

RUN npm i --prefix apps/shared
RUN npm i --prefix apps/api-gateway

COPY apps/shared/tsconfig.json apps/shared/
COPY apps/shared/src apps/shared/src
RUN npm run --prefix apps/shared build

COPY apps/api-gateway/tsconfig.json apps/api-gateway/
COPY apps/api-gateway/src apps/api-gateway/src
RUN npm run --prefix apps/api-gateway build

RUN npm prune --omit=dev --prefix apps/api-gateway

WORKDIR /app/apps/api-gateway
EXPOSE 3000
CMD ["node","dist/index.js"]
