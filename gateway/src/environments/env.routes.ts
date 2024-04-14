// igual ao ../user/user.routes.ts mas com o prefixo 'gateway' no path
import { Injectable } from "@nestjs/common";

@Injectable()
export class EnvRoutes {
  private readonly envServiceBaseUrl = process.env.ENVIRONMENTS_SERVICE_URL
  private readonly envBaseUrl = this.envServiceBaseUrl + '/env'
  private readonly envManagerBaseUrl = this.envServiceBaseUrl + '/env-manager'
  private readonly envAccessBaseUrl = this.envServiceBaseUrl + '/env-access'

  dashboardConsultData(): string {
    return `${this.envBaseUrl}/dashboard`;
  }

  create(): string {
    return `${this.envBaseUrl}`;
  }

  createTemporaryAccess(): string {
    return `${this.envBaseUrl}/temporary-access`
  }

  requestRemoteAccess(environmentId: string, esp8266Id: number, remoteAccessType: string, userId: string): string {
    return `${this.envBaseUrl}/remote-access?environmentId=${environmentId}&esp8266Id=${esp8266Id}&type=${remoteAccessType}&userId=${userId}`;
  }

  findRemoteAccess(esp8266Id: number): string {
    return `${this.envBaseUrl}/remote-access?esp8266Id=${esp8266Id}`;
  }

  findOne(id: string): string {
    return `${this.envBaseUrl}/${id}`;
  }

  findAll(): string {
    return `${this.envBaseUrl}/paginate`;
  }

  update(id: string): string {
    return `${this.envBaseUrl}/${id}`;
  }

  updateStatus(id: string): string {
    return `${this.envBaseUrl}/${id}/status`;
  }

  remove(id: string, userId: string): string {
    return `${this.envBaseUrl}/${id}?userId=${userId}`;
  }

  createManager(): string {
    return `${this.envManagerBaseUrl}`;
  }

  findOneManager(id: string): string {
    return `${this.envManagerBaseUrl}/${id}`;
  }

  // TODO: implementar paginação
  findAllManager(): string { // skip: number, take: number
    return `${this.envManagerBaseUrl}`; // ?skip=${skip}&take=${take}
  }

  findAllManagerByUserId(id: string): string {
    return `${this.envManagerBaseUrl}/user/${id}`;
  }

  findAllManagerByEnvironmentId(id: string): string {
    return `${this.envManagerBaseUrl}/environment/${id}`;
  }

  searchAccessByUserAndEnv(userId: string, envId: string): string {
    return `${this.envManagerBaseUrl}/user/${userId}/env/${envId}/verify`;
  }

  updateManagerStatus(id: string): string {
    return `${this.envManagerBaseUrl}/${id}`;
  }

  createAccess(): string {
    return `${this.envAccessBaseUrl}`;
  }

  findAccessParity(): string {
    return `${this.envAccessBaseUrl}/parity`;
  }

  // TODO: implementar paginação
  findAllAccess(): string { // skip: number, take: number
    return `${this.envAccessBaseUrl}`; // ?skip=${skip}&take=${take}
  }

  findOneAccess(id: string): string {
    return `${this.envAccessBaseUrl}/${id}`;
  }

  findAllByFrequenter(id: string): string {
    return `${this.envAccessBaseUrl}/frequenter/${id}`;
  }

  findAllInactives(): string {
    return `${this.envAccessBaseUrl}/inactives`;
  }

  findAllAccessByEnvironmentId(id: string): string {
    return `${this.envAccessBaseUrl}/environment/${id}`;
  }

  searchManagerByUserAndEnv(userId: string, envId: string): string {
    return `${this.envAccessBaseUrl}/user/${userId}/env/${envId}/verify`;
  }

  updateAccessStatus(id: string): string {
    return `${this.envAccessBaseUrl}/${id}/status`;
  }

  updateAccess(id: string): string {
    return `${this.envAccessBaseUrl}/${id}`;
  }
}