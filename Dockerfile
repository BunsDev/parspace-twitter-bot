FROM node:lts
RUN npm install -g pnpm
COPY . /paraspace-bot
WORKDIR /paraspace-bot
RUN pnpm install && pnpm build
EXPOSE 3000
RUN curl -fsSL -o /usr/local/bin/shush \
    https://github.com/realestate-com-au/shush/releases/download/v1.5.2/shush_linux_amd64 \
 && chmod +x /usr/local/bin/shush
ENTRYPOINT ["/usr/local/bin/shush", "exec", "--", "pnpm", "start"]

