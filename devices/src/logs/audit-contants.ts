import { AuditLog } from "./audit-log.service";

export class AuditConstants {
  public static coldStartMicrocontrollerSuccess(metaData: any): AuditLog {
    const date = metaData.date;
    const dateFormatted = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    return {
      topic: "Dispositivos",
      type: "info",
      message: `Microcontrolador ${metaData.mac} reiniciado em ${dateFormatted}.`,
      meta: metaData
    };
  }

  public static activateMicrocontrollerSuccess(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "info",
      message: `Microcontrolador ${metaData.type} ativado.`,
      meta: metaData
    };
  }

  public static createMicrocontrollerSuccess(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "info",
      message: `Microcontrolador ${metaData.type} criado, aguardando ativação.`,
      meta: metaData
    };
  }

  public static createMicrocontrollerConflict(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "error",
      message: 'Falha ao criar microcontrolador, conflito com registro existente.',
      meta: metaData
    };
  }

  public static createMicrocontrollerNotFound(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "error",
      message: 'Falha na criação de microcontrolador, chave estrangeira não encontrada.',
      meta: metaData
    };
  }

  public static createMicrocontrollerError(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "error",
      message: 'Erro inesperado ao criar microcontrolador.',
      meta: metaData
    };
  }

  public static findManyMicrocontrollersBadRequest(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "error",
      message: 'Solicitação inválida para listar microcontroladores.',
      meta: metaData
    };
  }

  public static findOneMicrocontrollerBadRequest(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "error",
      message: 'Solicitação inválida para buscar microcontrolador.',
      meta: metaData
    };
  }

  public static findOneMicrotrollerNotFound(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "error",
      message: `Microcontrolador ${metaData.type} não encontrado.`,
      meta: metaData
    };
  }

  public static findOneMicrontorllerError(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "error",
      message: 'Erro inesperado ao buscar microcontrolador.',
      meta: metaData
    };
  }

  public static findAllByEnvironmentIdNotFound(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "error",
      message: 'Ambiente não encontrado para listagem de microcontroladores.',
      meta: metaData
    };
  }

  public static findAllByEnvironmentIdError(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "error",
      message: 'Erro inesperado ao listar microcontroladores.',
      meta: metaData
    };
  }

  public static updateMicrocontrollerSuccess(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "info",
      message: `Microcontrolador ${metaData.type} atualizado.`,
      meta: metaData
    };
  }

  public static updateMicrocontrollerBadRequest(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "error",
      message: 'Solicitação inválida para atualizar microcontrolador.',
      meta: metaData
    };
  }

  public static updateMicrocontrollerError(metaData: any): AuditLog {
    return {
      topic: "Dispositivos",
      type: "error",
      message: 'Erro inesperado ao atualizar microcontrolador.',
      meta: metaData
    };
  }
}