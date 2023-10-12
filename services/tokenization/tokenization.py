from flask import Flask, jsonify, request, Blueprint
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

seconds = 3600
app.config['JWT_EXPIRATION_DELTA'] = int(os.getenv('JWT_EXPIRATION_DELTA', seconds))
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default-secret-key')

jwt = JWTManager(app)

prefix = Blueprint('prefix', __name__, url_prefix='/security/tokenization')
# TODO: avaliar se vai ser preciso gerar tokens pros esp32
#       se sim, então criar blueprint para as seções de tokenização e verificação
#       ficando: /security/tokenization/tokenize e /security/tokenization/verify
#       e então em cada rota adicionar /user ou /esp

@prefix.route('/tokenize', methods=['POST'])
def tokenize():
  user_id = request.json.get('userId', None)

  if user_id is None:
    return jsonify({"msg": "UserId não fornecido"}), 400

  access_token = create_access_token(identity=user_id)

  return jsonify(access_token=access_token), 200

@prefix.route('/verify', methods=['GET'])
@jwt_required()
def verify():
  user_id = get_jwt_identity()

  return jsonify(user_id=user_id), 200

if __name__ == '__main__':
  app.run(host='0.0.0.0', port=6007, debug=True)
