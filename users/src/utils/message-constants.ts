export class MessageConstants {
  static readonly TOPIC = 'Usuários'
  static readonly TYPE = {
    INFO: 'Info',
    ERROR: 'Error',
    WARN: 'Warn'
  }
  static readonly MESSAGE = {
    CREATE: 'Usuário criado',
    UPDATE: 'Usuário atualizado',
    DELETE: 'Usuário deletado',
    LOGIN: 'Usuário logado',
    LOGOUT: 'Usuário deslogado',
    UNAUTHORIZED: 'Usuário não autorizado',
    FORBIDDEN: 'Usuário não tem permissão para acessar este recurso',
    NOT_FOUND: 'Usuário não encontrado',
    INVALID_CREDENTIALS: 'Credenciais inválidas',
    INVALID_TOKEN: 'Token inválido',
    INVALID_REFRESH_TOKEN: 'Refresh token inválido',
    EXPIRED_TOKEN: 'Token expirado',
    EXPIRED_REFRESH_TOKEN: 'Refresh token expirado',
    USER_NOT_FOUND: 'Usuário não encontrado',
    USER_ALREADY_EXISTS: 'Usuário já existe',
    USER_NOT_FOUND_OR_PASSWORD_DOES_NOT_MATCH: 'Usuário não encontrado ou senha não confere',
    USER_NOT_FOUND_OR_REGISTRATION_DOES_NOT_MATCH: 'Usuário não encontrado ou matrícula não confere',
    USER_NOT_FOUND_OR_DOCUMENT_DOES_NOT_MATCH: 'Usuário não encontrado ou documento não confere',
    USER_NOT_FOUND_OR_TAG_DOES_NOT_MATCH: 'Usuário não encontrado ou tag não confere',
    USER_NOT_FOUND_OR_EMAIL_DOES_NOT_MATCH: 'Usuário não encontrado ou email não confere',
    USER_NOT_FOUND_OR_PASSWORD_RESET_TOKEN_DOES_NOT_MATCH: 'Usuário não encontrado ou token de redefinição de senha não confere',
    USER_NOT_FOUND_OR_TOKEN_DOES_NOT_MATCH: 'Usuário não encontrado ou token não confere',
    USER_NOT_FOUND_OR_TOKEN_EXPIRED: 'Usuário não encontrado ou token expirado',
    USER_NOT_FOUND_OR_TOKEN_REVOKED: 'Usuário não encontrado ou token revogado',
    USER_NOT_FOUND_OR_TOKEN_USED: 'Usuário não encontrado ou token já utilizado',
    USER_NOT_FOUND_OR_TOKEN_EXPIRED_OR_REVOKED: 'Usuário não encontrado ou token expirado ou revogado',
    USER_NOT_FOUND_OR_TOKEN_EXPIRED_OR_REVOKED_OR_USED: 'Usuário não encontrado ou token expirado ou revogado ou já utilizado'
  }
}