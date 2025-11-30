FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

COPY src ./src

RUN mkdir -p /usr/src/app/uploads

ENV PORT=5005
EXPOSE 5005

CMD ["node", "src/index.js"]