# 1️⃣ Base image
FROM python:3.10-slim

# 2️⃣ Set working directory inside container
WORKDIR /app

# 3️⃣ System dependencies (needed for OpenCV / PIL / keras-image-helper)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 4️⃣ Copy requirements and install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5️⃣ Copy application files and static assets
COPY app.py .
COPY accident_model.tflite .
COPY templates ./templates
COPY static ./static

# 6️⃣ Environment variable port
ENV PORT=10000
EXPOSE 10000

# 7️⃣ Start app with Gunicorn (1 worker, 4 threads for low RAM footprint & instant boot)
CMD exec gunicorn --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 120 app:app
