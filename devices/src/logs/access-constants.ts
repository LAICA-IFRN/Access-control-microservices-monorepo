import { AccessLog } from "./access-log.service";

export class AccessConstants {
  public static webRemoteAccessSuccess(
    userName: string,
    environmentName: string,
    microcontrollerMac: string,
    metaData: any
  ): AccessLog {
    return {
      type: "info",
      message: `ESP8266 de mac ${microcontrollerMac} realizou acesso remoto do usuário ${userName} solicitado pelo sistema web ao ambiente ${environmentName}`,
      meta: metaData
    };
  }

  public static mobileRemoteAccessSuccess(
    userName: string,
    environmentName: string,
    microcontrollerMac: string,
    metaData: any
  ): AccessLog {
    return {
      type: "info",
      message: `ESP8266 de mac ${microcontrollerMac} realizou acesso remoto do usuário ${userName} solicitado pelo dispositivo móvel ao ambiente ${environmentName}`,
      meta: metaData
    };
  }
}
