export interface Log {
  id: number;
  type: string;
  topic: string;
  message: string;
  meta?: string;
  logConfigId: number;
  createdAt: Date;
}

export interface LogConfig {
  id: number;
  user: string;
  createdBy: string;
  createdAt: Date;
  enabled: boolean;
}

export interface CreateLog {
  type: string;
  topic: string;
  message: string;
  meta?: string;
  userId: string;
}
