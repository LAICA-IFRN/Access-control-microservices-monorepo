import { AccessByType } from "src/access/providers/constants";
import { LogsCerberus } from "./logs.service";

export class LogsCerberusConstants {
    public static findAllError(metaData: object): LogsCerberus {
        return {
            topic: "Ambientes",
            type: "Error",
            message: 'Falha ao buscar ambientes, um erro inesperado ocorreu necessário verificar logs de erro do serviço',
            meta: metaData
        }
    }

    public static createEnvironmentVerifyRolesFailedById(
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Error",
            message: 'Falha ao verificar papel de usuário durante criação de ambiente, id inválido',
            topic: 'Ambiente',
            meta: meta,
        };
    }

    public static createEnvironmentVerifyRolesFailedByUser(
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Error",
            message: 'Falha ao verificar papel de usuário durante criação de ambiente, usuário não encontrado',
            topic: 'Ambiente',
            meta: meta,
        };
    }

    public static createEnvironmentVerifyRolesFailedByRole(
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Error",
            message: 'Falha ao verificar papel de usuário durante criação de ambiente, papel não encontrado',
            topic: 'Ambiente',
            meta: meta,
        };
    }

    public static verifyRolesFailedByEnvironment(
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Error",
            message: 'Falha ao criar ambiente, conflito com registro existente',
            topic: 'Ambiente',
            meta: meta,
        };
    }

    public static createEnvironmentFailed(
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Error",
            message: 'Falha ao criar ambiente, verificar causo nos logs de erro do serviço',
            topic: 'Ambiente',
            meta: meta,
        };
    }

    public static createEnvironmentSuccess(
        userName: string,
        environmentName: string,
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Info",
            message: `${userName} cadastrou o ambiente ${environmentName}`,
            topic: 'Ambiente',
            meta: meta,
        };
    }

    public static createTemporaryAccessFailedById(
        environmentName: string,
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Error",
            message: `Falha ao criar acesso temporário para o ambiente ${environmentName}, id inválido`,
            topic: 'Ambiente',
            meta: meta,
        };
    }

    public static createTemporaryAccessSuccess(
        userName: string,
        environmentName: string,
        createdByName: string,
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Info",
            message: `${createdByName} criou acesso temporário para ${userName} no ambiente ${environmentName}`,
            topic: 'Ambiente',
            meta: meta,
        };
    }

    public static updateEnvironmentSuccess(
        userName: string,
        environmentName: string,
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Info",
            message: `${userName} alterou o ambiente ${environmentName}`,
            topic: 'Ambiente',
            meta: meta,
        };
    }

    public static changeEnvironmentStatusSuccess(
        userName: string,
        environmentName: string,
        status: boolean,
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Info",
            message: `${userName} alterou o status do ambiente ${environmentName} para ${status ? 'ativo' : 'inativo'}`,
            topic: 'Ambiente',
            meta: meta,
        };
    }

    public static removeEnvironmentSuccess(
        userName: string,
        environmentName: string,
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Info",
            message: `${userName} removeu o ambiente ${environmentName}`,
            topic: 'Ambiente',
            meta: meta,
        };
    }

    public static removeEnvironmentNotFound(
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Error",
            message: `Falha ao remover ambiente, ambiente não encontrado`,
            topic: 'Ambiente',
            meta: meta,
        };
    }

    public static removeEnvironmentFailed(
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Error",
            message: `Falha ao remover ambiente, verificar causo nos logs de erro do serviço`,
            topic: 'Ambiente',
            meta: meta,
        };
    }

    public static coldStartMicrocontrollerSuccess(metaData: any): LogsCerberus {
        const coldStart = metaData.coldStart;
        const dateFormatted = coldStart.created_at.toLocaleDateString() + ' ' + coldStart.created_at.toLocaleTimeString();
        return {
            topic: "Dispositivos",
            type: "Info",
            message: `Microcontrolador de mac ${metaData.mac} iniciou em ${dateFormatted}`,
            meta: metaData
        };
    }

    public static activateMicrocontrollerSuccess(
        userName: string,
        environmentName: string,
        microcontrollerMac: string,
        type: string,
        metaData: any
    ): LogsCerberus {
        return {
            topic: "Dispositivos",
            type: "Info",
            message: `${userName} ativou o ${type} de mac ${microcontrollerMac} vinculando-o ao ambiente ${environmentName}`,
            meta: metaData
        };
    }

    public static createMicrocontrollerSuccess(metaData: any): LogsCerberus {
        return {
            topic: "Dispositivos",
            type: "Info",
            message: `Microcontrolador ${metaData.microcontroller_type.name} de mac ${metaData.mac} criado, aguardando ativação.`,
            meta: metaData
        };
    }

    public static createMicrocontrollerConflict(metaData: any): LogsCerberus {
        return {
            topic: "Dispositivos",
            type: "Error",
            message: 'Falha ao criar microcontrolador, conflito com registro existente.',
            meta: metaData
        };
    }

    public static createMicrocontrollerNotFound(metaData: any): LogsCerberus {
        return {
            topic: "Dispositivos",
            type: "Error",
            message: 'Falha na criação de microcontrolador, chave estrangeira não encontrada.',
            meta: metaData
        };
    }

    public static createMicrocontrollerError(metaData: any): LogsCerberus {
        return {
            topic: "Dispositivos",
            type: "Error",
            message: 'Erro inesperado ao criar microcontrolador.',
            meta: metaData
        };
    }

    public static findManyMicrocontrollersBadRequest(metaData: any): LogsCerberus {
        return {
            topic: "Dispositivos",
            type: "Error",
            message: 'Solicitação inválida para listar microcontroladores.',
            meta: metaData
        };
    }

    public static findOneMicrocontrollerBadRequest(metaData: any): LogsCerberus {
        return {
            topic: "Dispositivos",
            type: "Error",
            message: 'Solicitação inválida para buscar microcontrolador.',
            meta: metaData
        };
    }

    public static findOneMicrotrollerNotFound(metaData: any): LogsCerberus {
        return {
            topic: "Dispositivos",
            type: "Error",
            message: `Microcontrolador ${metaData.id} não encontrado.`,
            meta: metaData
        };
    }

    public static findOneMicrontorllerError(metaData: any): LogsCerberus {
        return {
            topic: "Dispositivos",
            type: "Error",
            message: 'Erro inesperado ao buscar microcontrolador.',
            meta: metaData
        };
    }

    public static findAllMicrontorllerError(metaData: any): LogsCerberus {
        return {
            topic: "Dispositivos",
            type: "Error",
            message: 'Erro inesperado ao buscar microcontroladores.',
            meta: metaData
        };
    }

    public static findAllByEnvironmentIdNotFound(metaData: any): LogsCerberus {
        return {
            topic: "Dispositivos",
            type: "Error",
            message: 'Ambiente não encontrado para listagem de microcontroladores.',
            meta: metaData
        };
    }

    public static findAllByEnvironmentIdError(metaData: any): LogsCerberus {
        return {
            topic: "Dispositivos",
            type: "Error",
            message: 'Erro inesperado ao listar microcontroladores.',
            meta: metaData
        };
    }

    public static updateMicrocontrollerSuccess(metaData: any): LogsCerberus {
        return {
            topic: "Dispositivos",
            type: "Info",
            message: `Microcontrolador ${metaData.type} atualizado.`,
            meta: metaData
        };
    }

    public static updateMicrocontrollerBadRequest(metaData: any): LogsCerberus {
        return {
            topic: "Dispositivos",
            type: "Error",
            message: 'Solicitação inválida para atualizar microcontrolador.',
            meta: metaData
        };
    }

    public static updateMicrocontrollerError(metaData: any): LogsCerberus {
        return {
            topic: "Dispositivos",
            type: "Error",
            message: 'Erro inesperado ao atualizar microcontrolador.',
            meta: metaData
        };
    }

    public static updateMicrocontrollerStatusSuccess(
        userName: string,
        environmentName: string,
        microcontrollerMac: string,
        type: string,
        metaData: any
    ): LogsCerberus {
        return {
            topic: "Dispositivos",
            type: "Info",
            message: `${userName} atualizou o status do ${type} de mac ${microcontrollerMac} para ${metaData.status} no ambiente ${environmentName}`,
            meta: metaData
        };
    }

    public static accessOkWhenMobileRequest(
        userName: string,
        environmentName: string,
        access_by: AccessByType,
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Info",
            message: `${userName} solicitou acesso ao ambiente ${environmentName} utilizando ${access_by}`,
            topic: "Acesso",
            meta: meta,
        };
    }
    public static accessFailedWhenMobileRequest(
        userName: string,
        environmentName: string,
        access_by: AccessByType,
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Warn",
            message: `${userName} tentou solicitar acesso ao ambiente ${environmentName} utilizando ${access_by} mas a análise facial falhou`,
            topic: "Acesso",
            meta: meta,
        };
    }

    public static accessOkWhenUserHasAccess(
        userName: string,
        environmentName: string,
        access_by: AccessByType,
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Info",
            message: `${userName} acessou o ambiente ${environmentName} utilizando ${access_by}`,
            topic: "Acesso",
            meta: meta,
        };
    }

    public static accessDeniedWhenUserDocumentNotFound(
        document: string,
        environmentName: string,
        meta: object,
    ): LogsCerberus {
        return {
            type: "Warn",
            message: `Houve uma tentativa de acesso ao ambiente ${environmentName} com o documento ${document} não cadastrado`,
            topic: "Acesso",
            meta: meta,
        };
    }

    public static accessDeniedWhenEnvironmentAccessNotFound(
        userName: string,
        environmentName: string,
        access_by: AccessByType,
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Warn",
            message: `${userName} tentou acessar o ambiente ${environmentName} utilizando ${access_by} mas não possui acesso ou está fora do horário permitido`,
            topic: "Acesso",
            meta: meta,
        };
    }

    public static accessDeniedWhenEnvironmentHasRestriction(
        userName: string,
        environmentName: string,
        access_by: AccessByType,
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Info",
            message: `${userName} tentou acessar o ambiente ${environmentName} utilizando ${access_by} mas o usuário não está livre da restrição de acesso aplicada`,
            topic: "Acesso",
            meta: meta,
        };
    }

    public static accessDeniedWhenEsp32NotFound(
        access_by: AccessByType,
        mac: string,
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Error",
            message: `Houve uma tentativa de acesso utilizando ${access_by} mas o ESP32 de mac ${mac} não foi encontrado`,
            topic: "Acesso",
            meta: meta,
        };
    }

    public static accessDeniedWhenEsp32MacAddressIsNotValid(
        access_by: AccessByType,
        mac: string,
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Warn",
            message: `Houve uma tentativa de acesso utilizando ${access_by} mas o ESP32 de mac ${mac} não é válido`,
            topic: "Acesso",
            meta: meta,
        };
    }

    public static failedToProcessAccessRequest(
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Error",
            message: 'Falha ao processar requisição de acesso, detalhes nos logs de erro do serviço',
            topic: "Acesso",
            meta: meta,
        };
    }

    public static accessDeniedWhenTagRFIDNotFound(
        rfid: string,
        environmentName: string,
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Error",
            message: `Houve uma tentativa de acesso ao ambiente ${environmentName} utilizando tag RFID mas a tag ${rfid} não foi encontrada`,
            topic: "Acesso",
            meta: meta,
        };
    }

    public static accessDeniedWhenDeviceMobileNotFound(
        mac: string,
        environmentName: string,
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Error",
            message: `Houve uma tentativa de acesso ao ambiente ${environmentName} utilizando dispositivo móvel mas o seu mac ${mac} não foi encontrado`,
            topic: "Acesso",
            meta: meta,
        };
    }

    public static accessDeniedWhenUserPinIsNotValid(
        pin: string,
        userName: string,
        environmentName: string,
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Error",
            message: `${userName} tentou acessar o ambiente ${environmentName} mas o PIN informado não é válido`,
            topic: "Acesso",
            meta: meta,
        };
    }

    public static accessDeniedWhenFacialRecognitionIsNotValid(
        userName: string,
        environmentName: string,
        access_by: AccessByType,
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Warn",
            message: `${userName} tentou acessar o ambiente ${environmentName} utilizando ${access_by} mas a verificação facial falhou`,
            topic: "Acesso",
            meta: meta,
        };
    }

    public static failedToWriteUserImageToDisk(
        userName: string,
        environmentName: string,
        access_by: AccessByType,
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Error",
            message: `Falha ao gravar imagem para reconhecimento facial do usuário ${userName} ao acessar o ambiente ${environmentName} utilizando ${access_by}, detalhes nos logs de erro do serviço`,
            topic: "Acesso",
            meta: meta,
        };
    }

    public static failedToWriteAccessImageToDisk(
        userName: string,
        environmentName: string,
        access_by: AccessByType,
        meta?: object,
    ): LogsCerberus {
        return {
            type: "Error",
            message: `Falha ao gravar imagem de acesso para reconhecimento facial do usuário ${userName} ao acessar o ambiente ${environmentName} utilizando ${access_by}, detalhes nos logs de erro do serviço`,
            topic: "Acesso",
            meta: meta,
        };
    }

    public static webRemoteAccessSuccess(
        environmentName: string,
        userName: string,
        metaData: any
    ): LogsCerberus {
        return {
            type: "Info",
            message: `${userName} solicitou acesso remoto ao ambiente ${environmentName} utilizando aplicação web`,
            topic: "Acesso",
            meta: metaData
        };
    }

    public static mobileRemoteAccessSuccess(
        environmentName: string,
        userName: string,
        metaData: any
    ): LogsCerberus {
        return {
            type: "Info",
            message: `${userName} solicitou acesso remoto ao ambiente ${environmentName} utilizando dispositivo móvel`,
            topic: "Acesso",
            meta: metaData
        };
    }

    public static rfidRemoteAccessSuccess(
        environmentName: string,
        userName: string,
        metaData: any
    ): LogsCerberus {
        return {
            type: "Info",
            message: `${userName} solicitou acesso remoto ao ambiente ${environmentName} utilizando RFID`,
            topic: "Acesso",
            meta: metaData
        };
    }

    public static pinRemoteAccessSuccess(
        environmentName: string,
        userName: string,
        metaData: any
    ): LogsCerberus {
        return {
            type: "Info",
            message: `${userName} solicitou acesso remoto ao ambiente ${environmentName} utilizando PIN`,
            topic: "Acesso",
            meta: metaData
        };
    }
}
