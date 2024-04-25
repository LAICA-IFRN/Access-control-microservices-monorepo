import { AuditLog } from "./audit-log.service";

export class AuditConstants {
    public static findAllError(metaData: object): AuditLog {
        return {
            topic: "Ambientes",
            type: "Error",
            message: 'Falha ao buscar ambientes, um erro inesperado ocorreu necessário verificar logs de erro do serviço',
            meta: metaData
        }
    }
}
