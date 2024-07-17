from flask import Flask, request, jsonify
from flask_cors import CORS

from skimage.io import imread
from skimage.transform import resize
from skimage.color import rgb2gray
import pickle
import datetime

categories = ['glioma', 'meningioma', 'notumor', 'pituitary']

app = Flask(__name__)
CORS(app, resources={r"/predict": {"origins": "http://localhost:8080"}})

# Load the SVM model
with open('mri-model-v2(dimension-increase-100x100).p', 'rb') as model_file:
    model = pickle.load(model_file)

def create_fhir_objects(predicted_class):
    diagnostic_report = {
        "resourceType": "DiagnosticReport",
        "id": "diagnostic-report-example",
        "status": "final",
        "category": {
            "coding": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/v2-0074",
                    "code": "RAD",
                    "display": "Radiology"
                }
            ]
        },
        "code": {
            "coding": [
                {
                    "system": "http://loinc.org",
                    "code": "24606-6",
                    "display": "MRI of Head and Brain"
                }
            ],
            "text": "MRI of Head and Brain"
        },
        "subject": {
            "reference": "Patient/xcda"
        },
        "issued": datetime.datetime.now().isoformat(),
        "result": [
            {
                "reference": "Observation/tumor-type"
            }
        ],
        "media": [
            {
                "link": {
                    "reference": "Media/mri-scan-example"
                },
                "comment": "MRI scan showing tumor"
            }
        ]
    }

    observation = {
        "resourceType": "Observation",
        "id": "tumor-type",
        "status": "final",
        "category": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                        "code": "imaging",
                        "display": "Imaging"
                    }
                ],
                "text": "Imaging"
            }
        ],
        "code": {
            "coding": [
                {
                    "system": "http://loinc.org",
                    "code": "21905-5",
                    "display": "Tumor Identification"
                }
            ],
            "text": "Tumor Identification"
        },
        "subject": {
            "reference": "Patient/xcda"
        },
        "effectiveDateTime": datetime.datetime.now().isoformat(),
        "valueString": predicted_class
    }

    return diagnostic_report, observation


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

    # Create FHIR objects
    diagnostic_report, observation = create_fhir_objects(predicted_class)

    # Return the FHIR objects as JSON response
    return jsonify({'diagnostic_report': diagnostic_report, 'observation': observation})


if __name__ == '__main__':
    app.run(port=5001, debug=True)
