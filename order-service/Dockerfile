FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

COPY src ./src

RUN mkdir -p /usr/src/app/qrcodes

ENV PORT=5006
EXPOSE 5006

CMD ["node", "src/index.js"]