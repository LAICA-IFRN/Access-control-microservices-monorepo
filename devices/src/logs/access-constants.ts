import { AccessLog } from "./access-log.service";

export class AccessConstants {
  public static remoteAccessSuccess(
    userName: string,
    environmentName: string,
    microcontrollerMac: string,
    metaData: any
  ): AccessLog {
    return {
      type: "info",
      message: `ESP8266 de mac ${microcontrollerMac} recebeu pedido de acesso remoto do usuário ${userName} no ambiente ${environmentName}`,
      meta: metaData
    };
  }
}
