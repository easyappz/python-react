# ================================
# Stage 1: Build React Frontend
# ================================
FROM node:18-alpine AS react-builder

WORKDIR /app/react

# Копируем package files из текущей директории
COPY react/package*.json ./
RUN npm ci --only=production

# Собираем React
COPY react/ ./
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

# Виртуальное окружение
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Python зависимости
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

# Django settings
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV DJANGO_SUPERUSER_USERNAME=admin
ENV DJANGO_SUPERUSER_PASSWORD=admin
ENV DJANGO_SUPERUSER_EMAIL=admin@mail.ru

WORKDIR /app

# Runtime зависимости
RUN apt-get update && apt-get install -y \
    libpq5 \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Копируем Python venv
COPY --from=python-builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Копируем собранный React
COPY --from=react-builder /app/react/build /app/react/build

# Копируем приложение
COPY . .

# Собираем Django static
RUN python manage.py collectstatic --noinput

# Настраиваем Nginx
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/django-api.conf /etc/nginx/sites-available/default
RUN rm -f /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Настраиваем Supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Non-root пользователь
RUN useradd -m -u 1234 appuser && \
    touch /run/nginx.pid && \
    chown -R appuser:appuser /run/nginx.pid /app && \
    chmod +x /app/docker-entrypoint.sh

EXPOSE 8080

USER appuser

CMD ["/bin/bash", "/app/docker-entrypoint.sh"]