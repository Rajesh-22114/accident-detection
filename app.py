import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

from flask import Flask, render_template, request, jsonify
import numpy as np
import tensorflow as tf
from keras_image_helper import create_preprocessor

app = Flask(__name__)

# Load TFLite model
interpreter = tf.lite.Interpreter(model_path="accident_model.tflite")
interpreter.allocate_tensors()

input_index = interpreter.get_input_details()[0]['index']
output_index = interpreter.get_output_details()[0]['index']

preprocessor = create_preprocessor('xception', target_size=(299, 299))

CLASS_NAMES = ['accident', 'non accident']


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    if not data or "image_url" not in data:
        return jsonify({"error": "image_url is required"}), 400

    image_url = data["image_url"]

    x = preprocessor.from_url(image_url)

    interpreter.set_tensor(input_index, x)
    interpreter.invoke()

    preds = interpreter.get_tensor(output_index)[0]
    predicted_index = int(np.argmax(preds))

    return jsonify({
        "prediction": CLASS_NAMES[predicted_index]
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

