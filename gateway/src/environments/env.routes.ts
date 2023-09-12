// igual ao ../user/user.routes.ts mas com o prefixo 'gateway' no path
import { Injectable } from "@nestjs/common";

@Injectable()
export class EnvRoutes {
  private readonly envBaseUrl: string;
  private readonly envManagerBaseUrl: string;
  private readonly envAccessBaseUrl: string;

  constructor() {
    this.envBaseUrl = 'http://localhost:6002/environments/env'
    this.envManagerBaseUrl = 'http://localhost:6002/environments/env-manager'
    this.envAccessBaseUrl = 'http://localhost:6002/environments/env-access'
  }

  create(): string {
    return `${this.envBaseUrl}`;
  }

  findOne(id: string): string {
    return `${this.envBaseUrl}/${id}`;
  }

  findAll(skip: number, take: number): string {
    return `${this.envBaseUrl}?skip=${skip}&take=${take}`;
  }

  update(id: string): string {
    return `${this.envBaseUrl}/${id}`;
  }

  updateStatus(id: string): string {
    return `${this.envBaseUrl}/${id}/status`;
  }

  remove(id: string): string {
    return `${this.envBaseUrl}/${id}`;
  }

  // faça métodos para todos os endpoints do env_manager ../../../environments/src/env_manager/env_manager.controller.ts
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

  // faça métodos para todos os endpoints do env_access ../../../environments/src/env_access/env_access.controller.ts
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