# ================================
# Stage 1: Build React Frontend
# ================================
FROM node:20-alpine AS react-builder
# ☝️ ИЗМЕНИЛИ 18 → 20

WORKDIR /app/react

# Копируем package.json
COPY react/package*.json ./

# Устанавливаем зависимости
RUN npm install --legacy-peer-deps

# Копируем исходники
COPY react/ ./

# Собираем production build
RUN npm run build

# ================================
# Stage 2: Build Python Backend
# ================================
FROM python:3.12-slim AS python-builder

WORKDIR /app

# Системные зависимости
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Python venv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Python пакеты
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# ================================
# Stage 3: Final Production Image
# ================================
FROM python:3.12-slim

ARG APP_ID
ENV APP_ID=${APP_ID}
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Runtime зависимости
RUN apt-get update && apt-get install -y \
    libpq5 \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Копируем из предыдущих stages
COPY --from=python-builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY --from=react-builder /app/react/build /app/react/build

# Копируем приложение
COPY . .

# Django collectstatic
RUN python manage.py collectstatic --noinput

# Nginx
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/django-api.conf /etc/nginx/sites-available/default
RUN rm -f /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Non-root user
RUN useradd -m -u 1234 appuser && \
    touch /run/nginx.pid && \
    chown -R appuser:appuser /run/nginx.pid /app && \
    chmod +x /app/docker-entrypoint.sh

EXPOSE 8080
USER appuser

CMD ["/bin/bash", "/app/docker-entrypoint.sh"]