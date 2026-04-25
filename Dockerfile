FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npm run build

EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0 NODE_ENV=production
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm start"]
