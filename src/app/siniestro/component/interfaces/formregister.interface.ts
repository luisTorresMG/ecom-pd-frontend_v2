export interface DOMRegitersoliitud{
    
    cobertura:number;
    tipoPago:number;
    nombreAseg: string;
    tipoDocAseg: string;
    correoAseg: string;
    celAseg:number;
    dirAseg:string;
    nombreContacto: string;
    tipoDocContac: string;
    nroDocContac:string;
    correoContac: string;
    celContac: number;
    dirContac: string;
    nroplacavehiculo: string;
    banco: string;
    cuentaDestino: string;
    cuentaCCI: string;
    fechaSiniestro: Date;
    fechaRecepcion: Date;
    adjunto: File[]; 

    
}