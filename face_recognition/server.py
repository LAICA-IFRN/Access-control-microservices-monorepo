from flask import Flask, request, abort
import face_recognition

app = Flask(__name__)

@app.route("/security/verify/user", methods=['GET'])
def endpoint():
  captured_image_path = request.json.get('capturedImagePath', None)
  if captured_image_path is None:
    abort(400, "capturedImagePath is required")

  user_image_path = request.json.get('userImagePath', None)
  if user_image_path is None:
    abort(400, "userImagePath is required")

  captured_image = face_recognition.load_image_file('../' + captured_image_path)
  user_image = face_recognition.load_image_file('../' + user_image_path)

  user_image_encoding = face_recognition.face_encodings(user_image)[0]
  captured_image_encoding = face_recognition.face_encodings(captured_image)[0]

  results = face_recognition.compare_faces([user_image_encoding], captured_image_encoding, tolerance=0.5)

  response = True if int(results[0]) == 1 else False

  return {
    "result": response
  }

if __name__ == '__main__':
  app.run(host='0.0.0.0', port=6008, debug=True)


