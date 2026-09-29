import os
import io
import time
import base64
from datetime import datetime
from PIL import Image
import numpy as np
from flask import Flask, render_template, request, jsonify
import requests

os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

app = Flask(__name__)

# Resilient TFLite interpreter loading
try:
    import ai_edge_litert.interpreter as tflite
except ImportError:
    try:
        import tflite_runtime.interpreter as tflite
    except ImportError:
        import tensorflow.lite as tflite

# Load TFLite model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "accident_model.tflite")
interpreter = tflite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()

input_index = interpreter.get_input_details()[0]['index']
output_index = interpreter.get_output_details()[0]['index']

CLASS_NAMES = ['accident', 'non accident']

def preprocess_image(pil_img):
    """
    Preprocesses PIL image to Xception format: (1, 299, 299, 3) normalized to [-1, 1].
    """
    pil_img = pil_img.convert('RGB')
    pil_img = pil_img.resize((299, 299), Image.Resampling.BILINEAR)
    img_array = np.array(pil_img, dtype=np.float32)
    # Xception normalization: (x / 127.5) - 1.0
    img_array = (img_array / 127.5) - 1.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    start_time = time.time()
    pil_image = None
    
    # 1. Check for file upload (multipart/form-data)
    if 'file' in request.files and request.files['file'].filename != '':
        file = request.files['file']
        try:
            pil_image = Image.open(file.stream)
        except Exception as e:
            return jsonify({"error": f"Invalid image file: {str(e)}"}), 400
    elif 'image' in request.files and request.files['image'].filename != '':
        file = request.files['image']
        try:
            pil_image = Image.open(file.stream)
        except Exception as e:
            return jsonify({"error": f"Invalid image file: {str(e)}"}), 400
            
    # 2. Check for JSON payload
    elif request.is_json:
        data = request.get_json()
        if data and "image_url" in data:
            image_url = data["image_url"]
            if image_url.startswith("data:image/"):
                # Handle Base64 image
                try:
                    header, encoded = image_url.split(",", 1)
                    image_data = base64.b64decode(encoded)
                    pil_image = Image.open(io.BytesIO(image_data))
                except Exception as e:
                    return jsonify({"error": f"Invalid base64 image data: {str(e)}"}), 400
            else:
                # Handle Image URL download
                try:
                    headers = {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                    }
                    resp = requests.get(image_url, headers=headers, timeout=10)
                    resp.raise_for_status()
                    pil_image = Image.open(io.BytesIO(resp.content))
                except Exception as e:
                    return jsonify({"error": f"Failed to download image from URL: {str(e)}"}), 400
                    
    # 3. Check form data for image_url
    elif "image_url" in request.form:
        image_url = request.form["image_url"]
        try:
            resp = requests.get(image_url, timeout=10)
            resp.raise_for_status()
            pil_image = Image.open(io.BytesIO(resp.content))
        except Exception as e:
            return jsonify({"error": f"Failed to download image: {str(e)}"}), 400

    if pil_image is None:
        return jsonify({"error": "No image uploaded. Please provide an image file or URL."}), 400

    try:
        # Preprocess and infer
        x = preprocess_image(pil_image)
        interpreter.set_tensor(input_index, x)
        interpreter.invoke()

        preds = interpreter.get_tensor(output_index)[0]
        
        # Softmax probability calculation
        exp_preds = np.exp(preds - np.max(preds))
        probs = exp_preds / np.sum(exp_preds)

        predicted_index = int(np.argmax(preds))
        class_label = CLASS_NAMES[predicted_index]
        
        # User API requirement mapping: 'Accident' or 'No Accident'
        prediction_text = "Accident" if class_label == "accident" else "No Accident"
        confidence_val = round(float(probs[predicted_index]) * 100, 1)

        # Additional metadata for modern dashboard UI
        accident_prob = round(float(probs[0]) * 100, 1)
        non_accident_prob = round(float(probs[1]) * 100, 1)

        risk_level = "High" if class_label == "accident" and confidence_val >= 70.0 else (
            "Moderate" if class_label == "accident" else "Low"
        )
        
        latency = round(time.time() - start_time, 3)

        return jsonify({
            "prediction": prediction_text,
            "confidence": confidence_val,
            "accident_probability": accident_prob,
            "non_accident_probability": non_accident_prob,
            "risk_level": risk_level,
            "processing_time": f"{latency}s",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })

    except Exception as e:
        return jsonify({"error": f"Model inference failed: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


