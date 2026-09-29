# 🚦 AI-Powered Accident Detection System

An intelligent, production-ready AI web application that analyzes road images in real-time to detect traffic collisions using deep learning (**Xception Transfer Learning**). Featuring a modern glassmorphic SaaS dashboard, drag-and-drop file upload, URL analysis, 1-click preset sample testing, dynamic confidence gauges, risk level metrics, and downloadable diagnostic reports.

---

## 🌐 Live Web Application & Demo

- **Live URL**: [https://accident-detection-jfhz.onrender.com](https://accident-detection-jfhz.onrender.com)
- **Health Endpoint**: [https://accident-detection-jfhz.onrender.com/health](https://accident-detection-jfhz.onrender.com/health)

---

## 🌟 Key Features

- **Modern Glassmorphism UI**: High-end SaaS dark theme (`#070b14`), translucent glass cards (`backdrop-filter: blur(16px)`), animated radar sweep headers, and red/blue cyber glow accents.
- **Multi-Input Support**:
  - **Drag & Drop File Upload**: Supports local JPG, JPEG, PNG, WEBP images up to 10MB.
  - **Image URL Paste**: Paste any web image URL for direct remote analysis.
  - **1-Click Test Samples**: Test the AI classifier instantly using built-in sample images (no file upload required).
- **Futuristic AI Scanner Viewport**: Interactive animated laser scanning beam sweeping across images during neural network inference.
- **Rich Diagnostic Results**:
  - **Verdict Badges**: `Accident Detected` (Alert Red) vs `No Accident Detected` (Emerald Green).
  - **Confidence Meter**: Animated percentage progress bar and raw probability distribution.
  - **Risk Indicator**: `HIGH RISK DETECTED` vs `NORMAL ROAD CONDITIONS`.
  - **Contextual AI Explanation**: Automated safety action recommendations based on detected road conditions.
  - **Downloadable Reports**: Download structured JSON diagnostic reports for incident logs.
- **Sub-Second Latency**: Optimized TensorFlow Lite (TFLite) model execution ($< 0.3s$ per image).
- **Render Production Ready**: Configured with Gunicorn WSGI server, lazy model loading (< 0.1s server boot), and 512MB RAM memory optimization.

---

## 🧠 Dataset & Deep Learning Model Architecture

- **Dataset**: Kaggle CCTV Road Accident Dataset ([ckay16/accident-detection-from-cctv-footage](https://www.kaggle.com/datasets/ckay16/accident-detection-from-cctv-footage)).
- **Architecture**: **Xception CNN (Extreme Inception)** fine-tuned via Transfer Learning.
- **Input Dimensions**: $299 \times 299 \times 3$ RGB tensor normalized to range $[-1.0, 1.0]$.
- **Export Format**: Optimized TensorFlow Lite (`accident_model.tflite`) for fast CPU inference.

---

## 🔌 API Endpoints & Response Specs

### 1. Predict Endpoint (`POST /predict`)

Accepts three request formats:
1. `multipart/form-data` with `file` or `image` binary file.
2. `application/json` with `{"image_url": "https://..."}`.
3. `application/json` with `{"image_url": "data:image/jpeg;base64,..."}`.

#### Sample Response (`HTTP 200 OK`)
```json
{
  "prediction": "Accident",
  "confidence": 97.4,
  "accident_probability": 97.4,
  "non_accident_probability": 2.6,
  "risk_level": "High",
  "processing_time": "0.223s",
  "timestamp": "2026-09-30 00:26:28"
}
```

### 2. Health Endpoint (`GET /health`)
```json
{
  "service": "AccidentVision AI",
  "status": "healthy"
}
```

---

## ⚙️ Local Installation & Development

### 1. Clone the Repository
```bash
git clone https://github.com/Rajesh-22114/accident-detection.git
cd accident-detection
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Flask Server
```bash
python app.py
```
Open your browser and navigate to `http://localhost:5000`.

---

## 🐳 Docker Deployment & Reproducibility

The project is fully containerized using Docker for production deployment.

### Build the Docker Image
```bash
docker build -t accident-detection .
```

### Run the Container Locally
```bash
docker run -p 10000:10000 -e PORT=10000 accident-detection
```
Open your browser and navigate to `http://localhost:10000`.

---

## ☁️ Deploying to Render / Cloud Hosts

This repository includes pre-configured deployment files for Render, Heroku, and Docker cloud hosting:
- **`Dockerfile`**: Includes system dependencies, copies `static/` assets, and sets Gunicorn start command.
- **`Procfile`**: `web: gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 120`.
- **`render.yaml`**: Render Blueprint configuration for 1-click automatic deployments.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Glassmorphic Dark Theme), JavaScript (ES6+), Bootstrap 5, Bootstrap Icons.
- **Backend**: Python 3.10+, Flask, Gunicorn WSGI.
- **Machine Learning**: TensorFlow / TFLite, Keras Image Helper, NumPy, Pillow.
- **Deployment & Ops**: Docker, Render Cloud Services.

---

## 👤 Author & Maintainer

- **Developer**: Rajesh
- **Repository**: [Rajesh-22114/accident-detection](https://github.com/Rajesh-22114/accident-detection)
