import { AuditLog } from "./audit-log.service";

export class AuditConstants {
  public static sendInviteEmailOk(
    invitedBy: string,
    metaData: any
  ): AuditLog {
    return {
      topic: "Usuários",
      type: "Info",
      message: `${invitedBy} enviou convite ao email ${metaData.email} para auto cadastro de usuário interno`,
      meta: metaData
    };
  }

  public static sendInviteEmailError(
    invitedBy: string,
    email: string,
    metaData: any
  ): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: `${invitedBy} tentou enviar convite para ${email} para auto cadastro de usuário interno, mas ocorreu um erro`,
      meta: metaData
    };
  }

  public static createUserByInvitationUnauthorizedCredencials(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao gerar token para cadastrar usuário, credenciais inválidas',
      meta: metaData
    };
  }

  public static createUserByInvitationUnauthorizedToken(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao buscar dados para cadastrar usuário, token inválido ou expirado',
      meta: metaData
    };
  }

  public static createUserConflict(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao criar usuário, conflito com registro existente',
      meta: metaData
    };
  }

  public static createExternalUserOk(
    userName: string,
    createdBy: string,
    metaData: any
  ): AuditLog {
    return {
      topic: "Usuários",
      type: "Info",
      message: `${createdBy} cadastrou o usuário externo ${userName}`,
      meta: metaData
    };
  }
  
  public static createInternalUserOk(
    userName: string,
    createdBy: string,
    metaData: any
  ): AuditLog {
    return {
      topic: "Usuários",
      type: "Info",
      message: `${userName} se cadastrou como usuário interno após receber convite de ${createdBy}`,
      meta: metaData
    };
  }

  public static createUserBadRequest(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao criar usuário, usuário admin não pode ter outros papéis',
      meta: metaData
    };
  }

  public static createUserError(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao criar usuário, erro interno, verificar logs de erro do serviço',
      meta: metaData
    };
  }

  public static createUserRolesError(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao criar papés de usuário, erro interno, verificar logs de erro do serviço',
      meta: metaData
    };
  }

  public static findUserImageBadRequest(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao buscar foto de usuário, id inválido',
      meta: metaData
    }
  }

  public static findUserImageNotFound(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao buscar foto de usuário, usuário não encontrado',
      meta: metaData
    }
  }

  public static findOneBadRequest(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao buscar usuário, id inválido',
      meta: metaData
    }
  }

  public static findOneNotFound(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao usuário, usuário não encontrado',
      meta: metaData
    }
  }

  public static findOneToAccessNotFound(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao buscar usuário durante acesso, usuário não encontrado',
      meta: metaData
    }
  }

  public static findOneToAccessUnauthorizhed(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao buscar usuário durante acesso, senha incorreta',
      meta: metaData
    }
  }

  public static validateToTokenNotFound(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao buscar usuário durante criação de token, usuário não encontrado',
      meta: metaData
    }
  }

  public static validateToTokenUnauthorizhed(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao buscar usuário durante criação de token, senha incorreta',
      meta: metaData
    }
  }

  public static findAllError(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao buscar usuários, um erro inesperado ocorreu necessário verificar logs de erro do serviço',
      meta: metaData
    }
  }

  public static updateStatusBadRequest(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao atualizar status de usuário, id inválido',
      meta: metaData
    }
  }

  public static updateStatusOk(
    userName: string,
    updatedBy: string,
    active: boolean,
    metaData: any
  ): AuditLog {
    return {
      topic: "Usuários",
      type: "Info",
      message: `${updatedBy} atualizou status de ${userName} para ${ active ? 'ativo' : 'inativo' }`,
      meta: metaData
    }
  }

  public static updateStatusNotFound(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao atualizar status de usuário, id inválido',
      meta: metaData
    }
  }

  public static updateStatusError(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao atualizar status de usuário, erro interno verificar logs de erro do serviço',
      meta: metaData
    }
  }

  public static updateBadRequest(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao atualizar usuário, id inválido',
      meta: metaData
    }
  }

  public static updateOk(
    userName: string,
    updatedBy: string,
    metaData: any
  ): AuditLog {
    return {
      topic: "Usuários",
      type: "Info",
      message: `${updatedBy} atualizou dados de ${userName}`,
      meta: metaData
    }
  }

  public static updateNotFound(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao atualizar usuário, usuário não encontrado',
      meta: metaData
    }
  }

  public static updateConflict(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao atualizar usuário, conflito com registro existente',
      meta: metaData
    }
  }

  public static updateError(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao atualizar usuário, erro interno verificar logs de erro do serviço',
      meta: metaData
    }
  }

  public static updateRolesBadRequest(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao atualizar papéis de usuário, id inválido',
      meta: metaData
    }
  }

  public static createRolesOk(
    userName: string,
    updatedBy: string,
    roles: string,
    metaData: any
  ): AuditLog {
    return {
      topic: "Usuários",
      type: "Info",
      message: `${updatedBy} adcionou os papéis ${roles} a ${userName}`,
      meta: metaData
    }
  }

  public static createRolesBadRequest(metaData: object): AuditLog {
    return {
      topic: "Usuários",
      type: "Error",
      message: 'Falha ao adicionar papéis de usuário, id inválido',
      meta: metaData
    }
  }

  public static updateRoleStatusOk(
    userName: string,
    updatedBy: string,
    role: string,
    metaData: any
  ): AuditLog {
    return {
      topic: "Usuários",
      type: "Info",
      message: `${updatedBy} atualizou status do papel ${role} de ${userName} para ${metaData.active ? 'ativo' : 'inativo'}`,
      meta: metaData
    }
  }

  public static deleteRolesOk(
    userName: string,
    updatedBy: string,
    roles: string,
    metaData: any
  ): AuditLog {
    return {
      topic: "Usuários",
      type: "Info",
      message: `${updatedBy} removeu os papéis ${roles} de ${userName}`,
      meta: metaData
    }
  }
}