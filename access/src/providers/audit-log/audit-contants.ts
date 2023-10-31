import { AccessByType, AccessLog } from "./audit-log.service";

export class AccessLogConstants {
  public static accessOkWhenUserHasAccess(
    userName: string,
    environmentName: string,
    access_by: AccessByType,
    meta?: object,
  ): AccessLog {
    return { 
      type: "Info",
      message: `${userName} acessou o ambiente ${environmentName} utilizando ${access_by}`,
      meta: meta,
    };
  }

  public static accessDeniedWhenUserDocumentNotFound(
    access_by?: AccessByType,
    userId?: string, 
    environmentId?: string,
    meta?: object,
  ): AccessLog {
    return {
      type: "Error",
      message: 'Documento de usuário não encontrado',
      user_id: userId,
      environment_id: environmentId,
      access_by: access_by,
      meta: meta,
    };
  }

  public static accessDeniedWhenEnvironmentAccessNotFound(
    access_by?: AccessByType,
    userId?: string, 
    environmentId?: string,
    meta?: object,
  ): AccessLog {
    return {
      type: "Error",
      message: 'Acesso não encontrado',
      user_id: userId,
      environment_id: environmentId,
      access_by: access_by,
      meta: meta,
    };
  }

  public static accessDeniedWhenEnvironmentHasRestriction(
    access_by?: AccessByType,
    userId?: string, 
    environmentId?: string,
    meta?: object,
  ): AccessLog {
    return {
      type: "Error",
      message: 'Acesso não permitido por restrição de acesso no ambiente',
      user_id: userId,
      environment_id: environmentId,
      access_by: access_by,
      meta: meta,
    };
  }

  public static accessDeniedWhenEsp32NotFound(
    access_by?: AccessByType,
    userId?: string, 
    environmentId?: string,
    meta?: object,
  ): AccessLog {
    return {
      type: "Error",
      message: 'Dispositivo ESP32 não encontrado',
      user_id: userId,
      environment_id: environmentId,
      access_by: access_by,
      meta: meta,
    };
  }

  public static accessDeniedWhenEsp32MacAddressIsNotValid(
    access_by?: AccessByType,
    userId?: string, 
    environmentId?: string,
    meta?: object,
  ): AccessLog {
    return {
      type: "Error",
      message: 'Endereço MAC do ESP32 não é válido',
      user_id: userId,
      environment_id: environmentId,
      access_by: access_by,
      meta: meta,
    };
  }

  public static failedToProcessAccessRequest(
    access_by?: AccessByType,
    userId?: string, 
    environmentId?: string,
    meta?: object,
  ): AccessLog {
    return {
      type: "Error",
      message: 'Falha ao processar requisição de acesso, detalhes nos logs de erro do serviço',
      user_id: userId,
      environment_id: environmentId,
      access_by: access_by,
      meta: meta,
    };
  }

  public static accessDeniedWhenTagRFIDNotFound(
    access_by?: AccessByType,
    userId?: string, 
    environmentId?: string,
    meta?: object,
  ): AccessLog {
    return {
      type: "Error",
      message: 'Tag RFID não encontrada',
      user_id: userId,
      environment_id: environmentId,
      access_by: access_by,
      meta: meta,
    };
  }

  public static accessValidatedByTagRFID(
    access_by?: AccessByType,
    userId?: string, 
    environmentId?: string,
    meta?: object,
  ): AccessLog {
    return {
      type: "Info",
      message: 'Acesso validado por tag RFID',
      user_id: userId,
      environment_id: environmentId,
      access_by: access_by,
      meta: meta,
    };
  }

  public static accessDeniedWhenDeviceMobileNotFound(
    access_by?: AccessByType,
    userId?: string, 
    environmentId?: string,
    meta?: object,
  ): AccessLog {
    return {
      type: "Error",
      message: 'Dispositivo móvel não encontrado',
      user_id: userId,
      environment_id: environmentId,
      access_by: access_by,
      meta: meta,
    };
  }

  public static accessValidatedByDeviceMobile(
    access_by?: AccessByType,
    userId?: string, 
    environmentId?: string,
    meta?: object,
  ): AccessLog {
    return {
      type: "Info",
      message: 'Acesso validado por dispositivo móvel',
      user_id: userId,
      environment_id: environmentId,
      access_by: access_by,
      meta: meta,
    };
  }

  public static accessDeniedWhenUserPinIsNotValid(
    access_by?: AccessByType,
    userId?: string, 
    environmentId?: string,
    meta?: object,
  ): AccessLog {
    return {
      type: "Error",
      message: 'PIN do usuário não é válido',
      user_id: userId,
      environment_id: environmentId,
      access_by: access_by,
      meta: meta,
    };
  }

  public static accessValidatedByUserPin(
    access_by?: AccessByType,
    userId?: string, 
    environmentId?: string,
    meta?: object,
  ): AccessLog {
    return {
      type: "Info",
      message: 'Acesso validado por documento e PIN do usuário',
      user_id: userId,
      environment_id: environmentId,
      access_by: access_by,
      meta: meta,
    };
  }

  public static accessDeniedWhenFacialRecognitionIsNotValid(
    access_by?: AccessByType,
    userId?: string, 
    environmentId?: string,
    meta?: object,
  ): AccessLog {
    return { 
      type: "Warn",
      message: 'Reconhecimento facial não é válido',
      user_id: userId,
      environment_id: environmentId,
      access_by: access_by,
      meta: meta,
    };
  }

  public static failedToWriteUserImageToDisk(
    access_by?: AccessByType,
    userId?: string, 
    environmentId?: string,
    meta?: object,
  ): AccessLog {
    return {
      type: "Error",
      message: 'Falha ao gravar imagem do usuário no disco para reconhecimento facial, detalhes nos logs de erro do serviço',
      user_id: userId,
      environment_id: environmentId,
      access_by: access_by,
      meta: meta,
    };
  }

  public static failedToWriteAccessImageToDisk(
    access_by?: AccessByType,
    userId?: string, 
    environmentId?: string,
    meta?: object,
  ): AccessLog { 
    return {
      type: "Error",
      message: 'Falha ao gravar imagem captura do acesso no disco para reconhecimento facial, detalhes nos logs de erro do serviço',
      user_id: userId,
      environment_id: environmentId,
      access_by: access_by,
      meta: meta,
    };
  }
}