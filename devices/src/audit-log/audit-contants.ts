import { AuditLog } from "./audit-log.service";

export class AuditConstants {
  public static createMicrocontrollerSuccess(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "Info",
      message: `Microcontrolador ${metaData.type} criado, aguardando ativação.`,
      meta: metaData
    };
  }

  public static createMicrocontrollerConflict(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "Error",
      message: 'Falha ao criar microcontrolador, conflito com registro existente.',
      meta: metaData
    };
  }

  public static createMicrocontrollerError(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "Error",
      message: 'Erro inesperado ao criar microcontrolador.',
      meta: metaData
    };
  }

  public static findManyMicrocontrollersBadRequest(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "Error",
      message: 'Solicitação inválida para listar microcontroladores.',
      meta: metaData
    };
  }

  public static findOneMicrocontrollerBadRequest(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "Error",
      message: 'Solicitação inválida para buscar microcontrolador.',
      meta: metaData
    };
  }

  public static findOneMicrotrollerNotFound(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "Error",
      message: `Microcontrolador ${metaData.type} não encontrado.`,
      meta: metaData
    };
  }

  public static findOneMicrontorllerError(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "Error",
      message: 'Erro inesperado ao buscar microcontrolador.',
      meta: metaData
    };
  }

  public static findAllByEnvironmentIdNotFound(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "Error",
      message: 'Ambiente não encontrado para listagem de microcontroladores.',
      meta: metaData
    };
  }

  public static findAllByEnvironmentIdError(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "Error",
      message: 'Erro inesperado ao listar microcontroladores.',
      meta: metaData
    };
  }

  public static updateMicrocontrollerSuccess(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "Info",
      message: `Microcontrolador ${metaData.type} atualizado.`,
      meta: metaData
    };
  }

  public static updateMicrocontrollerBadRequest(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "Error",
      message: 'Solicitação inválida para atualizar microcontrolador.',
      meta: metaData
    };
  }

  public static updateMicrocontrollerError(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "Error",
      message: 'Erro inesperado ao atualizar microcontrolador.',
      meta: metaData
    };
  }
}