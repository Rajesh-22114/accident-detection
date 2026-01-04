# 1️⃣ Base image
FROM python:3.10-slim

# 2️⃣ Set working directory inside container
WORKDIR /app

# 3️⃣ System dependencies (needed for keras-image-helper)
RUN apt-get update && apt-get install -y \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# 4️⃣ Copy requirements and install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5️⃣ Copy application files
COPY app.py .
COPY accident_model.tflite .
COPY templates ./templates

# 6️⃣ Expose Flask port
EXPOSE 5000

# 7️⃣ Start the app
CMD ["python", "app.py"]
