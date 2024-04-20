import { AccessLog } from "./access-log.service";

export class AccessConstants {
  public static webRemoteAccessSuccess(
    userName: string,
    environmentName: string,
    microcontrollerMac: string,
    type: string,
    metaData: any
  ): AccessLog {
    return {
      type: "Info",
      message: `${type} de mac ${microcontrollerMac} realizou acesso remoto do usuário ${userName} solicitado pela aplicação web ao ambiente ${environmentName}`,
      meta: metaData
    };
  }

  public static mobileRemoteAccessSuccess(
    userName: string,
    environmentName: string,
    microcontrollerMac: string,
    type: string,
    metaData: any
  ): AccessLog {
    return {
      type: "Info",
      message: `${type} de mac ${microcontrollerMac} realizou acesso remoto do usuário ${userName} solicitado pelo dispositivo móvel ao ambiente ${environmentName}`,
      meta: metaData
    };
  }
}
