import * as sqlite3 from 'sqlite3';
import * as fs from 'fs'
import * as path from 'path';
import { CreateLog, Log, LogConfig } from '../interfaces/log.interface';

export class DatabaseManagerService {
  constructor(
    private readonly db = {},
    private readonly log = {},
    private readonly config = {}
  ) { }

  async createDatabase(name: string): Promise<void> {
    await new Promise((resolve, reject) => {
      fs.writeFile(path.join(__dirname, `../databases/${name}.db`), '', (err) => {
        if (err) {
          console.error('Failed to create database', err);
          reject(err);
          return;
        }
        resolve(null);
      });
    });
  }

  async connectToDatabase(name: string): Promise<sqlite3.Database> {
    const db = await new Promise<sqlite3.Database>((resolve, reject) => {
      const dbPath = path.join(__dirname, `../databases/${name}.db`);
      const database = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Failed to connect to database', err);
          reject(err);
          return;
        }
        resolve(database);
      });
    });
    return db;
  }

  async createTables(
    db: sqlite3.Database,
    userId: string,
    userName: string,
    createdById: string,
  ): Promise<void> {
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS log_config (
          id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          user TEXT NOT NULL,
          user_name TEXT NOT NULL,
          created_by TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          enabled BOOLEAN NOT NULL
        )`,
        (err) => {
          if (err) {
            this.restartDatabase(db, userId);
            reject(err);
            return;
          }
          resolve(null);
        }
      );
    }).then(async () => {
      await new Promise((resolve, reject) => {
        db.run(
          `CREATE TABLE IF NOT EXISTS logs (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            topic TEXT NOT NULL,
            message TEXT NOT NULL,
            meta TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            log_config_id INTEGER NOT NULL,
            CONSTRAINT logs_log_config_id_fkey FOREIGN KEY (log_config_id) REFERENCES log_config (id) ON DELETE RESTRICT ON UPDATE CASCADE
          )`,
          (err) => {
            if (err) {
              this.restartDatabase(db, userId);
              reject(err);
              return;
            }
            resolve(null);
          }
        );
      })
    });
    this.insertLogConfig(db, userId, userName, createdById);
  }

  private async insertLogConfig(
    db: sqlite3.Database,
    userId: string,
    userName: string,
    createdById: string,
  ): Promise<void> {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO log_config (user, user_name, created_by, enabled) VALUES (?, ?, ?, ?)',
        [userId, userName, createdById, true],
        (err) => {
          if (err) {
            // TODO: log
            reject(err);
            return;
          }
          resolve(null);
        }
      );
    });
  }

  async insertLog(db: sqlite3.Database | null, createLog: CreateLog): Promise<void> {
    if (!db) return;

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO logs (type, topic, message, meta, log_config_id) VALUES (?, ?, ?, ?, (SELECT id FROM log_config WHERE user = ? AND enabled = true))',
        [createLog.type, createLog.topic, createLog.message, createLog.meta, createLog.userId],
        (err) => {
          if (err) {
            console.log(err);
            reject(err);
            return;
          }
          resolve(null);
        }
      );
    })
  }

  async selectLogs(
    db: sqlite3.Database | null,
    userId: string,
    offset: number,
    limit: number,
    order: 'asc' | 'desc',
  ): Promise<any> {
    if (!db)
      return null;
    const logs = new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM logs WHERE log_config_id = (SELECT id FROM log_config WHERE user = ?) ORDER BY created_at ' + order + ' LIMIT ? OFFSET ?',
        [userId, limit, offset],
        (err, rows: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows);
        }
      );
    });
    const total = new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as total FROM logs WHERE log_config_id = (SELECT id FROM log_config WHERE user = ?)',
        [userId],
        (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row.total);
        }
      );
    });

    return await Promise.all([logs, total]);
  }

  async selectLogConfigs(
    offset: number,
    limit: number,
    order: 'asc' | 'desc',
  ): Promise<any> {
    const result = await this.executeInAllDatabases(this.selectLogConfig);
    result.sort((a, b) => {
      const dateA = new Date(a.created_at) as any;
      const dateB = new Date(b.created_at) as any;
      if (order === 'asc') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
    const total = result.length;
    const data = result.slice(offset, offset + limit);
    return { data, total };
  }

  async selectLogConfig(db: sqlite3.Database | null): Promise<LogConfig | null> {
    if (!db)
      return null;
    return await new Promise((resolve, reject) => {
      db.get('SELECT * FROM log_config', (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      });
    });
  }

  async executeInAllDatabases(func: (db: sqlite3.Database) => Promise<any>) {
    const databases = fs.readdirSync(path.join(__dirname, '../databases'));
    const results = [];
    for (const database of databases) {
      const db = await this.connectToDatabase(database.split('.')[0]);
      if (!db) {
        console.log(`Failed to connect to database during executeInAllDatabases: ${database}`);
        continue;
      }
      const result = await func(db);
      results.push(result);
      db.close();
    }
    return results;
  }

  private async restartDatabase(db: sqlite3.Database, userId: string): Promise<void> {
    const dropLogsPromisse = new Promise((resolve, reject) => {
      db.run('DROP TABLE IF EXISTS logs', (err) => {
        if (err) {
          console.error('Failed to drop logs table', err);
          reject(err);
          return;
        }
        resolve(null);
      });
    })
    const dropLogConfigPromisse = new Promise((resolve, reject) => {
      new Promise((resolve, reject) => {
        db.run('DROP TABLE IF EXISTS log_config', (err) => {
          if (err) {
            console.error('Failed to drop log_config table', err);
            reject(err);
            return;
          }
          resolve(null);
        });
      });
    })

    await Promise.all([dropLogsPromisse, dropLogConfigPromisse])
      .then(() => {
        console.error(`Database restarted: ${userId}`);
      })
      .catch((err) => {
        console.error(`Failed to restart database: ${userId}`, err);
      });
  }
}