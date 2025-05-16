from flask import Flask, request, jsonify
import easyocr
import cv2
import numpy as np

app = Flask(__name__)
reader = easyocr.Reader(['en'])

@app.route('/anpr', methods=['POST'])
def anpr():
    file = request.files['image']
    img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), 1)
    result = reader.readtext(img)
    plate = result[0][1] if result else ""
    return jsonify({'plate': plate})

if __name__ == '__main__':
    app.run(port=6000) 