import { Injectable } from "@nestjs/common";

@Injectable()
export class DeviceRoutes {
  private readonly deviceRfidUrl: string;

  constructor() {
    this.deviceRfidUrl = 'http://laica.ifrn.edu.br/service/devices/rfid'
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