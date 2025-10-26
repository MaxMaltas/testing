FROM alpine:3.20
RUN apk add --no-cache nodejs-current npm
WORKDIR /usr/src/app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm i; fi
COPY . .
RUN npm run build
