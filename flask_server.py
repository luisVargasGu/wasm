from flask import Flask, request, jsonify
from flask_cors import CORS

from skimage.io import imread
from skimage.transform import resize
from skimage.color import rgb2gray
import pickle

categories = ['glioma', 'meningioma', 'notumor', 'pituitary']

app = Flask(__name__)
CORS(app, resources={r"/predict": {"origins": "http://localhost:5173"}})

# Load the SVM model
with open('mri-model-v2(dimension-increase-100x100).p', 'rb') as model_file:
    model = pickle.load(model_file)


# Endpoint for predicting on new images
@app.route('/predict', methods=['POST'])
def predict():
    # Get the image file from the POST request
    file = request.files['image']

    # Read the image
    img = imread(file)
    img = rgb2gray(img)
    print('Original image shape:', img.shape)

    # Resize the image
    img_resized = resize(img, (100, 100))
    print('Resized image shape:', img_resized.shape)

    # Flatten the image data
    img_data = img_resized.flatten().reshape(1, -1)
    print('Flattened image shape:', img_data.shape)

    # Ensure the number of features matches the model's expectation
    if img_data.shape[1] != 10000:
        return jsonify({'error': 'Incorrect image size, expected 100x100 pixels'}), 400

    # Predict using the loaded SVM model
    prediction = model.predict(img_data)
    predicted_class = categories[prediction[0]]  # Map the prediction to the corresponding category

    print('Prediction:', predicted_class)
    # Return the predicted class as JSON response
    return jsonify({'prediction': predicted_class})

if __name__ == '__main__':
    app.run(port=8080, debug=True)
