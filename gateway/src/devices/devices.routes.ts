import { Injectable } from "@nestjs/common";

@Injectable()
export class DeviceRoutes {
  private readonly deviceRfidUrl = process.env.DEVICES_SERVICE_URL + '/rfid'
  private readonly deviceMicrocontrollerUrl = process.env.DEVICES_SERVICE_URL + '/microcontrollers'
  private readonly deviceMobileUrl = process.env.DEVICES_SERVICE_URL + '/mobile'

  constructor () {}

  dashboardConsultData(): string {
    return `${process.env.DEVICES_SERVICE_URL}/dashboard`;
  }

  coldStartMicrocontroller(id: number): string {
    return `${this.deviceMicrocontrollerUrl}/cold-start?id=${id}`;
  }

  createMicrocontroller(): string {
    return `${this.deviceMicrocontrollerUrl}`;
  }

  activeMicrocontroller(id: number, environmentId: string): string {
    return `${this.deviceMicrocontrollerUrl}/activate?environmentId=${environmentId}&id=${id}`;
  }

  keepAliveMicrocontroller(id: number, healthCode: number, doorStatus: boolean): string {
    return `${this.deviceMicrocontrollerUrl}/keep-alive?id=${id}&healthCode=${healthCode}&doorStatus=${doorStatus}`;
  }

  getMicrocontrollerInfo(id: number): string {
    return `${this.deviceMicrocontrollerUrl}/keep-alive?id=${id}`;
  }

  searchRemoteAccess(id: number): string {
    return `${this.deviceMicrocontrollerUrl}/remote-access/${id}`;
  }

  findOneMicrocontroller(id: number): string {
    return `${this.deviceMicrocontrollerUrl}/one/${id}`;
  }

  findAllMicrocontroller(): string {
    return `${this.deviceMicrocontrollerUrl}/paginate`;
  }

  findAllMicrocontrollersInactives(skip: number, take: number): string {
    return `${this.deviceMicrocontrollerUrl}/inactives?skip=${skip}&take=${take}`;
  }

  findAllMicrocontrollersByEnvironmentId(environmentId: string): string {
    return `${this.deviceMicrocontrollerUrl}/environment/${environmentId}`;
  }


  updateMicrocontroller(id: number): string {
    return `${this.deviceMicrocontrollerUrl}/${id}`;
  }

  updateMicrocontrollerStatus(id: number): string {
    return `${this.deviceMicrocontrollerUrl}/${id}/status`;
  }

  createRfid(): string {
    return `${this.deviceRfidUrl}`;
  }

  findOneRfid(id: string): string {
    return `${this.deviceRfidUrl}/${id}`;
  }

  findAllRfid(): string {
    return `${this.deviceRfidUrl}/paginate`;
  }

  updateRfidStatus(id: string): string {
    return `${this.deviceRfidUrl}/status`;
  }

  removeRfid(id: string): string {
    return `${this.deviceRfidUrl}/${id}`;
  }

  createMobile(userId: string): string {
    return `${this.deviceMobileUrl}?userId=${userId}`;
  }

  getMobileEnvironments(id: string, userId: string): string {
    return `${this.deviceMobileUrl}?id=${id}&userId=${userId}`; // /?id=
  }

  findAllMobile(): string {
    return `${this.deviceMobileUrl}/paginate`;
  }
}