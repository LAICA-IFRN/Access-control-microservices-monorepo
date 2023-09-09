from flask import Flask, request, abort
import face_recognition
import os

app = Flask(__name__)

@app.route("/security/verify/user", methods=['POST'])
def endpoint():
    if 'userImage' not in request.files:
        abort(400, "userImage is required")

    if 'verifyImage' not in request.files:
        abort(400, "verifyImage is required")

    request_user_image = request.files["userImage"]
    request_verify_image = request.files["verifyImage"]

    request_user_image.save("temp/user_image.jpg")
    request_verify_image.save("temp/verify_image.jpg")

    # todo: buscar a imagem do usuário no banco de dados em vez de receber na requisição
    user_image = face_recognition.load_image_file("temp/user_image.jpg")
    verify_image = face_recognition.load_image_file("temp/verify_image.jpg") 

    user_image_encoding = face_recognition.face_encodings(user_image)[0]
    verify_image_encoding = face_recognition.face_encodings(verify_image)[0]

    os.remove("temp/user_image.jpg")
    os.remove("temp/verify_image.jpg")

    results = face_recognition.compare_faces([user_image_encoding], verify_image_encoding)

    response = True if int(results[0]) == 1 else False

    return {
        "result": response
    }

if __name__ == '__main__':
    app.run(debug=True)