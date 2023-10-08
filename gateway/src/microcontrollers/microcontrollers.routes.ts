// igual ao ../user/user.routes.ts mas com o prefixo 'gateway' no path
import { Injectable } from "@nestjs/common";

@Injectable()
export class MicrocontrollersRoutes {
  private readonly microcontrollersBaseUrl = 'http://localhost:6003/service/microcontrollers';
  private readonly esp32BaseUrl = this.microcontrollersBaseUrl + '/esp32';
  private readonly esp8266BaseUrl = this.microcontrollersBaseUrl + '/esp8266';

  createEsp32(): string {
    return `${this.esp32BaseUrl}`;
  }
  
  findOneEsp32(id: number): string {
    return `${this.esp32BaseUrl}/${id}`;
  }

  findAllEsp32(skip: number, take: number): string {
    return `${this.esp32BaseUrl}?skip=${skip}&take=${take}`;
  }

  findAllEsp32ByEnvironmentId(environmentId: string): string {
    return `${this.esp32BaseUrl}/environment/${environmentId}`;
  }

  updateEsp32(id: number): string {
    return `${this.esp32BaseUrl}/${id}`;
  }

  updateStatusEsp32(id: number): string {
    return `${this.esp32BaseUrl}/${id}/status`;
  }

  removeEsp32(id: number): string {
    return `${this.esp32BaseUrl}/${id}`;
  }

  disconnectEsp8266(id: number): string {
    return `${this.esp32BaseUrl}/${id}/disconnect/esp8266`;
  }

  createEsp8266(): string {
    return `${this.esp8266BaseUrl}`;
  }

  findOneEsp8266(id: number): string {
    return `${this.esp8266BaseUrl}/${id}`;
  }

  findAllEsp8266(skip: number, take: number): string {
    return `${this.esp8266BaseUrl}?skip=${skip}&take=${take}`;
  }

  findAllEsp8266ByEnvironmentId(environmentId: string): string {
    return `${this.esp8266BaseUrl}/environment/${environmentId}`;
  }

  updateEsp8266(id: number): string {
    return `${this.esp8266BaseUrl}/${id}`;
  }

  updateStatusEsp8266(id: number): string {
    return `${this.esp8266BaseUrl}/${id}/status`;
  }

  removeEsp8266(id: number): string {
    return `${this.esp8266BaseUrl}/${id}`;
  }
}