export class ConfigurationModel {
    transaccion: string = '';
    ramo: string = '';
    aplicaCabecera: string = '';
    certificadoPorRol: string = '';
    filaOrdenadaPorRol: string = '';
    tipoArchivo: string = '';
    formatoFecha: string = '';
    facturaAgrupada: number = 0;//INI <RQ2024-57 - 03/04/2024>  
    facturaAutomatica: number = 0;//INI <RQ2024-57 - 03/04/2024>  

    listaPolizas: PolicyModel[] = [];
    listaAtributos: AttributeModel[] = [];
    cliente: RegisterEntityModel[] = [];
    certificado: RegisterEntityModel[] = [];
    rol: RegisterEntityModel[] = [];
    poliza: RegisterEntityModel[] = [];
    credito: RegisterEntityModel[] = [];
    notificacion: INotification[] = [];

    constructor(payload: any) {
        const generals = payload.generals;

        this.transaccion = generals.transaction;
        this.ramo = generals.branch;
        this.aplicaCabecera = generals.headerData;
        this.certificadoPorRol = generals.containsCertificateByRol;
        this.filaOrdenadaPorRol = generals.containsRowsSortedByRole;
        this.tipoArchivo = generals.fileFormat;
        this.formatoFecha = generals.dateFormat;

        payload.validate.policies?.map((obj: any): void => {
            this.listaPolizas.push(new PolicyModel(obj));
        });

        payload?.read?.transactions?.map((obj, index) => {
            this.listaAtributos.push(
                new AttributeModel({
                    ...obj,
                    index: index,
                })
            );
        });

        const entities = payload?.register?.entities ?? [];

        /* A way to dynamically access the properties of an object. */
        const dictionary = {
            clients: 'cliente',
            certificates: 'certificado',
            credits: 'credito',
            roles: 'rol',
            policies: 'poliza',
        };

        entities.map((obj: any) => {
            this[dictionary[obj.id]].push(new RegisterEntityModel(obj));
        });

        const notifications: any[] = [];
        payload.read.notifications?.data.forEach((notif: any): void => {
            notif.fase = '1';
            notifications.push(payloadNotification(notif));
        });
        payload.validate.notifications?.data.forEach((notif: any): void => {
            notif.fase = '2';
            notifications.push(payloadNotification(notif));
        });
        payload.migrate.notifications?.data.forEach((notif: any): void => {
            notif.fase = '3';
            notifications.push(payloadNotification(notif));
        });
        payload.billing.notifications?.data.forEach((notif: any): void => {
            notif.fase = '4';
            notifications.push(payloadNotification(notif));
        });

        this.notificacion = notifications;
    }
}

const payloadNotification = (notification: any): INotification => {
    return {
        canalVenta: notification.salesChannel,
        contratante: notification.contractor,
        transaccion: notification.transaction,
        numeroPoliza: notification.policy,
        asunto: notification.issue,
        listaCorreos: notification.to,
        listaCC: notification.cc,
        listaCCO: notification.cco,
        fase: notification.fase,
        // idNotificacion: null
    };
};

export interface INotification {
    canalVenta: string;
    contratante: string;
    transaccion: string;
    numeroPoliza: string;
    asunto: string;
    listaCorreos: string[];
    listaCC: string[];
    listaCCO: string[];
    fase: string;
}

class PolicyModel {
    producto = '';
    numeroPoliza = '';
    contratante = '';
    canal = '';
    moneda = '';
    fechaInicio = '';
    fechaFin = '';
    ruc = '';
    funciones: Array<number> = [];
    idProducto: number = null;
    facAgru: number = null;
    facAuto: number = null;

    constructor({
        producto,
        numeroPoliza,
        contratante,
        canal,
        moneda,
        fechaInicio,
        fechaFin,
        ruc,
        rules,
        idProducto,
        facAgru,
        facAuto,
    }) 

    {
        this.producto = producto;
        this.numeroPoliza = numeroPoliza;
        this.contratante = contratante;
        this.canal = canal;
        this.moneda = moneda;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.ruc = ruc;
        this.idProducto = idProducto;
        this.funciones = rules.map((x) => +x.id) ?? [];
        this.facAgru = facAgru;
        this.facAuto = facAuto;
    }
}

class AttributeModel {
    id = '';
    campo = '';
    idTipoDato: number = null;
    obligatorio = false;
    valorUnico = false;
    funcion: Array<string> = [];
    origen: Array<string> = [];
    argumento: Array<string> = [];
    dominio: Array<string> = [];

    constructor({
        index,
        inputData,
        dataType,
        required,
        uniqueValue,
        functions,
    }) 
    
    {
        this.id = index;
        this.campo = inputData;
        this.idTipoDato = +dataType;
        this.obligatorio = required;
        this.valorUnico = uniqueValue;
        functions.map((func: any) => {
        if (func.type) {
            this.funcion.push(func.type);
        }

        const origin = func.parameters?.map((obj) => obj.parameterType).join(',');
        this.origen.push(origin ?? '');

        const argument = func.parameters?.map((obj) => obj.parameter).join(',');
        this.argumento.push(argument ?? '');

        const domain = func.parameters?.map((obj) => obj.detail).join(',');
        this.dominio.push(domain ?? '');
        });
    }
}

class RegisterEntityModel {
    id: '';
    campo = '';
    descripcion = '';
    origen = '';
    valor = '';
    valorCampo: Array<FieldValueModel> = [];

    constructor({
        id: entityId,
        attribute,
        description,
        origin,
        value,
        equivalences,
    }) {
        this.id = entityId;
        this.campo = attribute;
        this.descripcion = description;
        this.origen = origin;
        this.valor = value;
        equivalences?.map((obj: any) => {
        this.valorCampo.push(new FieldValueModel(obj));
        });
    }
}

class FieldValueModel {
    campo = '';
    valor = '';

    constructor({field, value}) {
        this.campo = field;
        this.valor = value;
    }
}
