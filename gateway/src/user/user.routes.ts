import { Injectable } from "@nestjs/common";

@Injectable()
export class UserRoutes {
  private readonly baseUrl = process.env.USERS_SERVICE_URL;

  constructor() {}

  dashboardConsultData(): string {
    return `${this.baseUrl}/dashboard`;
  }
  
  create(): string {
    return `${this.baseUrl}`;
  }

  createByInvitation(): string {
    return `${this.baseUrl}/frequenter/invited`;
  }

  sendInviteEmail(): string {
    return `${this.baseUrl}/invite`;
  }

  findAllPaginated(): string {
    return `${this.baseUrl}/paginate`;
  }

  forgotPassword(): string {
    return `${this.baseUrl}/forgot-password`;
  }

  verifyForgotPassword(): string {
    return `${this.baseUrl}/verify/forgot-password`;
  }

  findDocumentTypes(): string {
    return `${this.baseUrl}/document-types`;
  }

  findUserImage(id: string): string {
    return `${this.baseUrl}/${id}/image`;
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

  findRolesTypes(): string {
    return `${this.baseUrl}/role/types`;
  }

  findAllRolesFromUser(id: string): string {
    return `${this.baseUrl}/${id}/roles`;
  }

  changeRoleStatus(id: string, roleId: string): string {
    return `${this.baseUrl}/${id}/roles/${roleId}/status`;
  }

  removeRole(id: string): string {
    return `${this.baseUrl}/${id}/roles`;
  }
}
