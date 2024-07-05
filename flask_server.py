from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/your-endpoint', methods=['POST'])
def test_endpoint():
    data = request.json
    print(data)

    print('Processing data...')
    reponse_data = { 'response': 'Processed data' }
    return jsonify(reponse_data)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
