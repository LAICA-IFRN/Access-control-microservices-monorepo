from flask import Flask, request, abort
from flask_cors import CORS
import face_recognition
import os

app = Flask(__name__)
CORS(app)

@app.route("/service/facial-recognition/verify/user", methods=['GET'])
def endpoint():
  captured_image_path = request.json.get('capturedImagePath', None)
  if captured_image_path is None:
    abort(400, "capturedImagePath is required")

  user_image_path = request.json.get('userImagePath', None)
  if user_image_path is None:
    abort(400, "userImagePath is required")
  
  captured_image = face_recognition.load_image_file('../' + captured_image_path)
  user_image = face_recognition.load_image_file('../' + user_image_path)

  user_image_encoding = None
  captured_image_encoding = None

  try:
    user_image_encoding = face_recognition.face_encodings(user_image)[0]
  except IndexError:
    return {
      "result": False,
      "error": "Não foi possível identificar o rosto na imagem do usuário",
      "statusCode": 400
    }

  try:
    captured_image_encoding = face_recognition.face_encodings(captured_image)[0]
  except IndexError:
    return {
      "result": False,
      "error": "Não foi possível identificar o rosto na imagem capturada",
      "statusCode": 400
    }

  os.remove('../' + captured_image_path)
  os.remove('../' + user_image_path)

  results = face_recognition.compare_faces([user_image_encoding], captured_image_encoding, tolerance=0.5)

  response = True if int(results[0]) == 1 else False

  return {
    "result": response
  }

if __name__ == '__main__':
  app.run(host='0.0.0.0', port=6008, debug=True)


