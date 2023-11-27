import { AccessByType } from "../constants";
import { AccessLog } from "./audit-log.service";

export class AccessLogConstants {
  public static accessOkWhenMobileRequest(
    userName: string,
    environmentName: string,
    access_by: AccessByType,
    meta?: object,
  ): AccessLog {
    return { 
      type: "info",
      message: `${userName} solicitou acesso ao ambiente ${environmentName} utilizando ${access_by}`,
      meta: meta,
    };
  }
  public static accessFailedWhenMobileRequest(
    userName: string,
    environmentName: string,
    access_by: AccessByType,
    meta?: object,
  ): AccessLog {
    return { 
      type: "warn",
      message: `${userName} tentou solicitar acesso ao ambiente ${environmentName} utilizando ${access_by} mas a análise facial falhou`,
      meta: meta,
    };
  }

  public static accessOkWhenUserHasAccess(
    userName: string,
    environmentName: string,
    access_by: AccessByType,
    meta?: object,
  ): AccessLog {
    return { 
      type: "info",
      message: `${userName} acessou o ambiente ${environmentName} utilizando ${access_by}`,
      meta: meta,
    };
  }

  public static accessDeniedWhenUserDocumentNotFound(
    document: string, 
    environmentName: string,
    meta: object,
  ): AccessLog {
    return {
      type: "error",
      message: `Houve uma tentativa de acesso ao ambiente ${environmentName} com o documento ${document} não cadastrado`,
      meta: meta,
    };
  }

  public static accessDeniedWhenEnvironmentAccessNotFound(
    userName: string,
    environmentName: string,
    access_by: AccessByType,
    meta?: object,
  ): AccessLog {
    return {
      type: "error",
      message: `${userName} tentou acessar o ambiente ${environmentName} utilizando ${access_by} mas não possui acesso cadastrado`,
      meta: meta,
    };
  }

  public static accessDeniedWhenEnvironmentHasRestriction(
    userName: string,
    environmentName: string,
    access_by: AccessByType,
    meta?: object,
  ): AccessLog {
    return {
      type: "error",
      message: `${userName} tentou acessar o ambiente ${environmentName} utilizando ${access_by} mas o usuário não está livre da restrição de acesso aplicada`,
      meta: meta,
    };
  }

  public static accessDeniedWhenEsp32NotFound(
    access_by: AccessByType,
    mac: string,
    meta?: object,
  ): AccessLog {
    return {
      type: "error",
      message: `Houve uma tentativa de acesso utilizando ${access_by} mas o ESP32 de mac ${mac} não foi encontrado`,
      meta: meta,
    };
  }

  public static accessDeniedWhenEsp32MacAddressIsNotValid(
    access_by: AccessByType,
    mac: string,
    meta?: object,
  ): AccessLog {
    return {
      type: "error",
      message: `Houve uma tentativa de acesso utilizando ${access_by} mas o ESP32 de mac ${mac} não é válido`,
      meta: meta,
    };
  }

  public static failedToProcessAccessRequest(
    meta?: object,
  ): AccessLog {
    return {
      type: "error",
      message: 'Falha ao processar requisição de acesso, detalhes nos logs de erro do serviço',
      meta: meta,
    };
  }

  public static accessDeniedWhenTagRFIDNotFound(
    rfid: string,
    environmentName: string,
    meta?: object,
  ): AccessLog {
    return {
      type: "error",
      message: `Houve uma tentativa de acesso ao ambiente ${environmentName} utilizando tag RFID mas a tag ${rfid} não foi encontrada`,
      meta: meta,
    };
  }

  public static accessDeniedWhenDeviceMobileNotFound(
    mac: string,
    environmentName: string,
    meta?: object,
  ): AccessLog {
    return {
      type: "error",
      message: `Houve uma tentativa de acesso ao ambiente ${environmentName} utilizando dispositivo móvel mas o seu mac ${mac} não foi encontrado`,
      meta: meta,
    };
  }

  public static accessDeniedWhenUserPinIsNotValid(
    pin: string,
    userName: string,
    environmentName: string,
    meta?: object,
  ): AccessLog {
    return {
      type: "error",
      message: `${userName} tentou acessar o ambiente ${environmentName} utilizando documento e PIN mas o PIN ${pin} não é válido`,
      meta: meta,
    };
  }

  public static accessDeniedWhenFacialRecognitionIsNotValid(
    userName: string,
    environmentName: string,
    access_by: AccessByType,
    meta?: object,
  ): AccessLog {
    return { 
      type: "warn",
      message: `${userName} tentou acessar o ambiente ${environmentName} utilizando ${access_by} mas a verificação facial falhou`,
      meta: meta,
    };
  }

  public static failedToWriteUserImageToDisk(
    userName: string,
    environmentName: string,
    access_by: AccessByType,
    meta?: object,
  ): AccessLog {
    return {
      type: "error",
      message: `Falha ao gravar imagem captura do usuário ${userName} no disco para reconhecimento facial ao acessar o ambiente ${environmentName} utilizando ${access_by}, detalhes nos logs de erro do serviço`,
      meta: meta,
    };
  }

  public static failedToWriteAccessImageToDisk(
    userName: string,
    environmentName: string,
    access_by: AccessByType,
    meta?: object,
  ): AccessLog { 
    return {
      type: "error",
      message: `Falha ao gravar imagem captura do acesso do usuário ${userName} no disco para reconhecimento facial ao acessar o ambiente ${environmentName} utilizando ${access_by}, detalhes nos logs de erro do serviço`,
      meta: meta,
    };
  }
}