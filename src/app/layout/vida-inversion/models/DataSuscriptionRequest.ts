export class DataSuscriptionRequest {

    APORTE_TOTAL: number;
    NUMERO_DOCUMENTO: string;
    NUMERO_POLIZA: string;
    PROD_DESCRIPT: string;
    RAMO_DESCRIPT: string;
    SCLIENT: string;
    MONTO_SUSCRIPCION: number;
    CURRENCY_DESCRIPT: string;
    FULL_NAME: string;
    LAST_NAME: string;
}

export class DataSuscription {
    P_NID_COTIZACION: number;
    P_NID_PROC: string;
    P_NTYPE_SCORE: number;
    P_NSTATE_SOLID: number;
    P_NMONTO_SUSCRIPCION: number;
    P_NAPORTE_TOTAL: number;
    P_NVALOR_CUOTA: number;
    P_DCHANGDAT: Date;
    P_DCOMPDATE: Date;
}