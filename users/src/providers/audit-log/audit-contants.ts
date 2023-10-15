import { AuditLog } from "./audit-log.service";

export class AuditConstants {
  public static createUserP2002(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao criar usuário: conflito com registro existente',
      meta: metaData
    };
  }

  public static createUserBadRequest(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao criar usuário: usuário admin não pode ter outros papéis',
      meta: metaData
    };
  }



  public static createUser(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao criar usuário: erro interno, verificar logs de erro do serviço',
      meta: metaData
    };
  }
}