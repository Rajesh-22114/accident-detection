# accident-detection
## problem decription
Traffic accidents are a major issue in modern transportation systems. Automatically detecting accident scenes from images can be useful for traffic monitoring, emergency response systems, and smart city applications.
In this project, 
the task is formulated as a binary image classification problem:
    Given an image, predict whether it represents a traffic accident or non-accident scene.

    
## Dataset And Modeling
* Used Dataset : https://www.kaggle.com/datasets/ckay16/accident-detection-from-cctv-footage
  
The dataset consists of labeled images with two classes:
accident
non-accident

A pretrained CNN (Xception) was used with transfer learning.

Images are resized to 299 × 299 and preprocessed using the Xception preprocessing pipeline.

The model was trained and evaluated locally.

After training, the final model was exported as a TensorFlow Lite (.tflite) file for efficient inference.

## Model Output

The model produces a single class label:

Accident

Non-Accident

No confidence score is displayed — only the predicted class.

## Web Application

The trained model is deployed as a Flask web application

### How The Application Works

* The user provides an image URL
* The image is downloaded and preprocessed
* The model runs inference using TensorFlow Lite
* The prediction result is displayed on the web page

## Live Demo

The application is deployed and publicly accessible:

   https://accident-detection-jfhz.onrender.com 
   
Anyone can open the link, paste an image URL, and check the prediction

* After Opening this it will shows a website

* that website will asks for image url

* copy and paste the exact image addres in the blank

* after tha click predict, it will shows the prediction

### NOTE
* wait while the render server is loaded then we see website

* if it shows **server error** after clicking predict

* it means error while loading image kindly use another image

## Docker And Reproducibility

the project is fully containerized using Docker to ensure reproducibility.

### Build the image
     docker build -t accident-detector .
### Run the container locally
     docker run -p 5000:5000 accident-detector
###  Then open:
     http://localhost:5000

  in browser

  



