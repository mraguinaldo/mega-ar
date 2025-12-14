# ---------- Build Stage ----------
FROM node:22-alpine AS builder

# Instala pnpm (mais rápido e leve que npm/yarn)
RUN npm install -g pnpm@9

WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (melhor cache)
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copia o resto do código
COPY . .

# Gera o Prisma Client e compila o TypeScript
RUN pnpm prisma generate
RUN pnpm run build

# ---------- Runtime Stage (imagem final leve) ----------
FROM node:22-alpine AS runtime

WORKDIR /app

# Copia apenas o necessário do builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

CMD ["node", "dist/main"]