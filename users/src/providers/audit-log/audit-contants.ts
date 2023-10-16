import { AuditLog } from "./audit-log.service";

export class AuditConstants {
  public static createUserConflict(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao criar usuário: conflito com registro existente',
      meta: metaData
    };
  }

  public static createUserOk(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Info",
      message: 'Usuário criado com sucesso',
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

  public static createUserError(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao criar usuário: erro interno, verificar logs de erro do serviço',
      meta: metaData
    };
  }

  public static createUserRolesError(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao criar papés de usuário: erro interno, verificar logs de erro do serviço',
      meta: metaData
    };
  }

  public static findUserImageBadRequest(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao buscar foto de usuário: id inválido',
      meta: metaData
    }
  }

  public static findUserImageNotFound(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao buscar foto de usuário: usuário não encontrado',
      meta: metaData
    }
  }

  public static findOneBadRequest(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao buscar usuário: id inválido',
      meta: metaData
    }
  }

  public static findOneNotFound(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao usuário: usuário não encontrado',
      meta: metaData
    }
  }

  public static findOneToAccessNotFound(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao buscar usuário durante acesso: usuário não encontrado',
      meta: metaData
    }
  }

  public static findOneToAccessUnauthorizhed(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao buscar usuário durante acesso: senha incorreta',
      meta: metaData
    }
  }

  public static validateToTokenNotFound(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao buscar usuário durante criação de token: usuário não encontrado',
      meta: metaData
    }
  }

  public static validateToTokenUnauthorizhed(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao buscar usuário durante criação de token: senha incorreta',
      meta: metaData
    }
  }

  public static findAllError(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao buscar usuários: um erro inesperado ocorreu, necessário verificar logs de erro do serviço',
      meta: metaData
    }
  }

  public static updateStatusBadRequest(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao atualizar status de usuário: id inválido',
      meta: metaData
    }
  }

  public static updateStatusOk(metaData: any): AuditLog {
    return {
      topic: "Usuários",
      type: "Info",
      message: `Status de usuário atualizado: ${metaData.name} - ${metaData.active ? 'Ativo' : 'Inativo'}`,
      meta: metaData
    }
  }

  public static updateStatusNotFound(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao atualizar status de usuário: id inválido',
      meta: metaData
    }
  }

  public static updateStatusError(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao atualizar status de usuário: erro interno, verificar logs de erro do serviço',
      meta: metaData
    }
  }

  public static updateBadRequest(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao atualizar usuário: id inválido',
      meta: metaData
    }
  }

  public static updateOk(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Info",
      message: 'Falha ao atualizar usuário: id inválido',
      meta: metaData
    }
  }

  public static updateNotFound(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao atualizar usuário: usuário não encontrado',
      meta: metaData
    }
  }

  public static updateConflict(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao atualizar usuário: conflito com registro existente',
      meta: metaData
    }
  }

  public static updateError(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao atualizar usuário: erro interno, verificar logs de erro do serviço',
      meta: metaData
    }
  }
}