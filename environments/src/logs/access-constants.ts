import { AccessLog } from "./access-log.service";

export class AccessConstants {
  public static webRemoteAccessSuccess(
    environmentName: string,
    userName: string,
    metaData: any
  ): AccessLog {
    return {
      type: "Info",
      message: `${userName} solicitou acesso remoto ao ambiente ${environmentName} utilizando aplicação web`,
      meta: metaData
    };
  }

  public static mobileRemoteAccessSuccess(
    environmentName: string,
    userName: string,
    metaData: any
  ): AccessLog {
    return {
      type: "Info",
      message: `${userName} solicitou acesso remoto ao ambiente ${environmentName} utilizando dispositivo móvel`,
      meta: metaData
    };
  }
}
