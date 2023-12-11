//import { AuditLog } from "./audit-log.service";

export class AuditLogConstants {
  public static createEnvironmentVerifyRolesFailedById(
    meta?: object,
  ): any {
    return { 
      type: "error",
      message: 'Falha ao verificar papel de usuário durante criação de ambiente, id inválido',
      topic: 'Ambiente',
      meta: meta,
    };
  }

  public static createEnvironmentVerifyRolesFailedByUser(
    meta?: object,
  ): any {
    return { 
      type: "error",
      message: 'Falha ao verificar papel de usuário durante criação de ambiente, usuário não encontrado',
      topic: 'Ambiente',
      meta: meta,
    };
  }

  public static createEnvironmentVerifyRolesFailedByRole(
    meta?: object,
  ): any {
    return { 
      type: "error",
      message: 'Falha ao verificar papel de usuário durante criação de ambiente, papel não encontrado',
      topic: 'Ambiente',
      meta: meta,
    };
  }

  public static verifyRolesFailedByEnvironment(
    meta?: object,
  ): any {
    return { 
      type: "error",
      message: 'Falha ao criar ambiente, conflito com registro existente',
      topic: 'Ambiente',
      meta: meta,
    };
  }

  public static createEnvironmentFailed(
    meta?: object,
  ): any {
    return { 
      type: "error",
      message: 'Falha ao criar ambiente, verificar causo nos logs de erro do serviço',
      topic: 'Ambiente',
      meta: meta,
    };
  }

  public static createEnvironmentSuccess(
    userName: string,
    environmentName: string,
    meta?: object,
  ): any {
    return { 
      type: "info",
      message: `${userName} cadastrou o ambiente ${environmentName}`,
      topic: 'Ambiente',
      meta: meta,
    };
  }

  public static createTemporaryAccessFailedById(
    environmentName: string,
    meta?: object,
  ): any {
    return { 
      type: "error",
      message: `Falha ao criar acesso temporário para o ambiente ${environmentName}, id inválido`,
      topic: 'Ambiente',
      meta: meta,
    };
  }

  public static createTemporaryAccessSuccess(
    userName: string,
    environmentName: string,
    createdByName: string,
    meta?: object,
  ): any {
    return { 
      type: "info",
      message: `${createdByName} criou acesso temporário para ${userName} no ambiente ${environmentName}`,
      topic: 'Ambiente',
      meta: meta,
    };
  }

  public static updateEnvironmentSuccess(
    userName: string,
    environmentName: string,
    meta?: object,
  ): any {
    return { 
      type: "info",
      message: `${userName} alterou o ambiente ${environmentName}`,
      topic: 'Ambiente',
      meta: meta,
    };
  }

  public static changeEnvironmentStatusSuccess(
    userName: string,
    environmentName: string,
    status: boolean,
    meta?: object,
  ): any {
    return { 
      type: "info",
      message: `${userName} alterou o status do ambiente ${environmentName} para ${status ? 'ativo' : 'inativo'}`,
      topic: 'Ambiente',
      meta: meta,
    };
  }

  public static removeEnvironmentSuccess(
    userName: string,
    environmentName: string,
    meta?: object,
  ): any {
    return { 
      type: "info",
      message: `${userName} removeu o ambiente ${environmentName}`,
      topic: 'Ambiente',
      meta: meta,
    };
  }

  public static removeEnvironmentNotFound(
    meta?: object,
  ): any {
    return { 
      type: "error",
      message: `Falha ao remover ambiente, ambiente não encontrado`,
      topic: 'Ambiente',
      meta: meta,
    };
  }

  public static removeEnvironmentFailed(
    meta?: object,
  ): any {
    return { 
      type: "error",
      message: `Falha ao remover ambiente, verificar causo nos logs de erro do serviço`,
      topic: 'Ambiente',
      meta: meta,
    };
  }
}
