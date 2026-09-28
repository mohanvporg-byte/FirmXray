FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    nmap binwalk python3 python3-pip && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY analyzer ./analyzer
RUN pip install --break-system-packages -r analyzer/requirements.txt
WORKDIR /app/backend
COPY backend/package.json ./
RUN npm install --omit=dev
COPY backend/ ./
EXPOSE 4000
CMD ["node", "src/index.js"]
