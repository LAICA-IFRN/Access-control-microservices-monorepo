import { Injectable } from "@nestjs/common";

@Injectable()
export class UserRoutes {
  private readonly baseUrl = process.env.USERS_SERVICE_URL;

  constructor() {}
  
  create(): string {
    return `${this.baseUrl}`;
  }

  findOne(id: string): string {
    return `${this.baseUrl}/${id}`;
  }

  findAllFrequenters(): string {
    return `${this.baseUrl}/frequenter`;
  }

  findAllAdmins(): string {
    return `${this.baseUrl}/admin`;
  }

  findAllEnvironmentManager(): string {
    return `${this.baseUrl}/environment-manager`;
  }

  findAllInactive(): string {
    return `${this.baseUrl}/inactive`;
  }

  updateStatus(id: string): string {
    return `${this.baseUrl}/${id}/status`;
  }

  update(id: string): string {
    return `${this.baseUrl}/${id}`;
  }

  createRole(id: string): string {
    return `${this.baseUrl}/${id}/roles`;
  }

  findAllRoles(id: string): string {
    return `${this.baseUrl}/${id}/roles`;
  }

  changeRoleStatus(id: string, roleId: string): string {
    return `${this.baseUrl}/${id}/roles/${roleId}/status`;
  }

  removeRole(id: string): string {
    return `${this.baseUrl}/${id}/roles`;
  }
}
