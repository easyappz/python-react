FROM ubuntu:24.04

# Prevent interactive prompts during build
ENV DEBIAN_FRONTEND=noninteractive

# Set Python to not buffer stdout/stderr
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Superuser environment variables
ENV DJANGO_SUPERUSER_USERNAME=admin
ENV DJANGO_SUPERUSER_PASSWORD=admin
ENV DJANGO_SUPERUSER_EMAIL=admin@mail.ru

# Application ID (passed during build)
ARG APP_ID
RUN echo "Building with APP_ID: ${APP_ID}"
ENV APP_ID=${APP_ID}

# Set working directory
WORKDIR /app

# Install system dependencies including Node.js
RUN apt-get update && apt-get install -y \
    python3.12 \
    python3.12-dev \
    python3-pip \
    python3-venv \
    build-essential \
    libpq-dev \
    nginx \
    supervisor \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install and build React
WORKDIR /app/react
COPY react/package.json react/package-lock.json* ./
RUN npm install
COPY react/ .
RUN npm run build

WORKDIR /app

COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/django-api.conf /etc/nginx/sites-available/default

# Remove default nginx site and setup our config
RUN rm -f /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create non-root user
RUN useradd -m -u 1234 appuser && \
    touch /run/nginx.pid && \
    chown -R appuser:appuser /run/nginx.pid && \
    chown -R appuser:appuser /app

# Expose port
EXPOSE 8080

# Run supervisord
CMD ["/bin/bash", "/app/docker-entrypoint.sh"]