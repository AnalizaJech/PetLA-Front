FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_RUN_HOST=0.0.0.0 \
    FLASK_RUN_PORT=5000 \
    FLASK_ENV=production

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

COPY backend_flask/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend_flask/app app

ENV MONGO_URI="mongodb://petla:petla123@mongo:27017/petla?authSource=admin" \
    MONGO_DB="petla" \
    JWT_SECRET="change_me_in_env" \
    UPLOAD_DIR="/app/uploads"

EXPOSE 5000
CMD ["python", "-m", "app"]
