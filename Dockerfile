FROM node:18-alpine AS base
RUN npm install -g pnpm
COPY . /paraspace-bot
WORKDIR /paraspace-bot
RUN pnpm install && pnpm build
EXPOSE 3000
ENTRYPOINT ["pnpm", "start"]

