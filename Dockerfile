# Stage 1: Build React Frontend
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Django Backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y libpq-dev gcc

# Install python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy frontend build so Django can serve it
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Run collectstatic
WORKDIR /app/backend
RUN python manage.py collectstatic --noinput

# Start command
# We run migrations and seed data before starting gunicorn
# Ensure PORT is used if provided by Render, fallback to 8000
ENV PORT=8000
CMD sh -c "python manage.py migrate && python seed.py && gunicorn --bind 0.0.0.0:$PORT --timeout 120 --workers 2 config.wsgi:application"
