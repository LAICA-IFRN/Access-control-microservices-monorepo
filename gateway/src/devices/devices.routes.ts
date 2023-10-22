import { Injectable } from "@nestjs/common";

@Injectable()
export class DeviceRoutes {
  private readonly deviceRfidUrl = process.env.DEVICES_SERVICE_URL + '/rfid'
  private readonly deviceMicrocontrollerUrl = process.env.DEVICES_SERVICE_URL + '/microcontrollers'

  constructor () {}

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

  findOneMicrocontroller(id: number): string {
    return `${this.deviceMicrocontrollerUrl}/${id}`;
  }

  findAllMicrocontroller(skip: number, take: number): string {
    return `${this.deviceMicrocontrollerUrl}?skip=${skip}&take=${take}`;
  }

  findAllMicrocontrollersInactives(skip: number, take: number): string {
    console.log(skip, take);
    
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

  findAllRfid(skip: number, take: number): string {
    return `${this.deviceRfidUrl}?skip=${skip}&take=${take}`;
  }

  updateRfidStatus(id: string): string {
    return `${this.deviceRfidUrl}/${id}/status`;
  }

  removeRfid(id: string): string {
    return `${this.deviceRfidUrl}/${id}`;
  }
}