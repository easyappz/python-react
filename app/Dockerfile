# ================================
# Stage 1: Build React Frontend
# ================================
FROM node:18-alpine AS react-builder

WORKDIR /app/react

# Копируем package files
COPY react/package.json ./
# Копируем package-lock.json только если он есть
COPY react/package-lock.json* ./

# Устанавливаем зависимости
# Используем npm install вместо npm ci
RUN npm install --legacy-peer-deps

# Копируем исходники и собираем
COPY react/ ./
RUN npm run build

# ================================
# Stage 2: Build Python Backend
# ================================
FROM python:3.12-slim AS python-builder

WORKDIR /app

# Системные зависимости для сборки
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Создаем виртуальное окружение
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Копируем и устанавливаем Python зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ================================
# Stage 3: Final Production Image
# ================================
FROM python:3.12-slim

# Application ID
ARG APP_ID
ENV APP_ID=${APP_ID}

# Python настройки
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Устанавливаем только runtime зависимости
RUN apt-get update && apt-get install -y \
    libpq5 \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Копируем Python venv из builder stage
COPY --from=python-builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Копируем собранный React из builder stage
COPY --from=react-builder /app/react/build /app/react/build

# Копируем приложение
COPY . .

# Собираем Django static files
RUN python manage.py collectstatic --noinput

# Настраиваем Nginx
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/django-api.conf /etc/nginx/sites-available/default
RUN rm -f /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Настраиваем Supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Создаем non-root пользователя
RUN useradd -m -u 1234 appuser && \
    touch /run/nginx.pid && \
    chown -R appuser:appuser /run/nginx.pid /app && \
    chmod +x /app/docker-entrypoint.sh

EXPOSE 8080

USER appuser

CMD ["/bin/bash", "/app/docker-entrypoint.sh"]