import { Injectable } from "@nestjs/common";

@Injectable()
export class DeviceRoutes {
  private readonly deviceRfidUrl = process.env.DEVICES_SERVICE_URL + '/rfid'

  constructor () {}

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