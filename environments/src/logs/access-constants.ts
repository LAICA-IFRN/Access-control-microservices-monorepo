import { AccessLog } from "./access-log.service";

export class AccessConstants {
  public static remoteAccessSuccess(
    environmentName: string,
    microcontrollerMac: string,
    userName: string,
    metaData: any
  ): AccessLog {
    return {
      type: "info",
      message: `${userName} solicitou acesso remoto para o ambiente ${environmentName}`,
      meta: metaData
    };
  }
}
