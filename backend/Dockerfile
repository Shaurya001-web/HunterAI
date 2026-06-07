FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copy pyproject.toml first to cache dependency installation
COPY pyproject.toml /app/

# Install dependencies
RUN pip install --no-cache-dir .

# Copy backend files
COPY backend /app/backend

WORKDIR /app/backend

EXPOSE 8000

# Start production server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
