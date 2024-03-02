FROM node:21-alpine as build
WORKDIR /app
COPY --chown=node:node . .
RUN npm i && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production --no-optional
FROM node:21-alpine as run
USER node
WORKDIR /
COPY --from=build /app .
ENV NODE_ENV=production \
    TERM=linux \
    TERMINFO=/etc/terminfo \
    PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=30s \
    --timeout=2s \
    --start-period=10s \
    --retries=10 \
  CMD node ${appdir}/scripts/healthcheck.js
CMD ["node", "."]
