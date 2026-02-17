import { Injectable } from '@angular/core';

@Injectable()
export class DesgravamentConstants {
    
  public static REGEX: any = {
    PORCENTAJE: /^((100(\.0{1,2})?)|(\d{1,2}([\\.]{0,1})+(\.\d{1,6})?))$/,
    NUMBER: /^[0-9]+$/,
    HUNDREDS_NUMBER: /^[0-9,]+$/,
    DECIMAL: /^\d*\.?\d{0,2}$/,
    '1': /^[0-9]{1,11}$/, // RUC
    '2': /^[0-9]{1,8}$/, // DNI
    '4': /^[0-9A-Za-z]{1,12}$/, // CARNET DE EXTRANJERIA
    '6': /^[0-9A-Za-z]{1,12}$/, // PASAPORTE
    DOCUMENTO_DEFAULT: /^[0-9A-Za-z]{1,15}$/, // PASAPORTE
    ALFANUMERICO: /^[A-Za-z0-9\s]+$/g,
    LEGALNAME: /^[a-zA-ZñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü0-9-,:()&$#'. ]+$/,
  };

  public static MAXLENGTH: any = {
    '1': 11, // RUC
    '2': 8, // DNI
    '4': 12, // CARNET DE EXTRANJERIA
    '6': 12, // PASAPORTE

  };

  public static MINLENGTH: any = {
    '1': 11, // RUC
    '2': 8, // DNI
    '4': 8, // CARNET DE EXTRANJERIA
    '6': 8, // PASAPORTE
  };

  public static TIPO_RESPUESTA: any = {
    EXITOSO: '0',
    ERROR: '1',
    SUNAT_ERROR: '3'
  };

  public static TIPO_DOCUMENTO: any = {
    RUC: 1,
    DNI: 2
  };

  public static RAMO: any = 0;

  public static BKDIRECTO: any = "2015000003";

  public static NORENOVABLE = "3";

  public static COD_PRODUCTO: any = 0;

  public static PLANMAESTRO : any = "1";

  public static CERTYPE: any = 3;

  public static EMISIONDIRECTA : any = "S";

  PUBLIC

  public static PERFIL: any = {
    ADMIN: "5",
    TECNICA: "137",
    COMERCIAl:"7",
    OPERACIONES: "136",
    EXTERNO: "134",
  };

  public static ESTADO: any = {
    APROBADO: '2',
    APROBADO_TECNICA: '13',
    RECHAZADO: '3',
    NO_PROCEDE: '11',
  };

  public static TRANSACTION_CODE: any = {
    COTIZACION: 0,
    EMISION: 1,
    INCLUSION: 2,
    EXCLUSION: 3,
    RENOVACION: 4,
    ANULACION: 7,
    ENDOSAR: 8
  };

  public static USUARIO_OK: any = 0;
  public static USUARIO_BLOQUEADO: any = 1;
  public static USUARIO_PRIVILEGIOS: any = 2;

  public static TIPO_BUSQUEDA: any = {
    DOCUMENTO: 'POR_DOC',
    NOMBRE: 'POR_NOM'
  };

  public static TIPO_RESPUESTA_DPS: any = {
    SI: 'SI',
    NO: 'NO'
  };
  public static TIPO_RESPUESTA_PRESION: any = {
    BAJO: 'BAJO',
    NORMAL: 'NORMAL',
    ALTO: 'ALTO',
    IGNORA: 'IGNORA'
  };

  public static TIPOS_BUSQUEDA: any = [
    { codigo: DesgravamentConstants.TIPO_BUSQUEDA.DOCUMENTO, valor: 'POR NRO. DOCUMENTO' },
    { codigo: DesgravamentConstants.TIPO_BUSQUEDA.NOMBRE, valor: 'POR NOMBRES' },
  ];

  public static RESPUESTA_PRESION: any = [
    { codigo: DesgravamentConstants.TIPO_RESPUESTA_PRESION.BAJO, valor: 'BAJO' },
    { codigo: DesgravamentConstants.TIPO_RESPUESTA_PRESION.NORMAL, valor: 'NORMAL' },
    { codigo: DesgravamentConstants.TIPO_RESPUESTA_PRESION.ALTO, valor: 'ALTO' },
    { codigo: DesgravamentConstants.TIPO_RESPUESTA_PRESION.IGNORA, valor: 'IGNORA' }
  ];

  public static RESPUESTA_DPS: any = [
    { codigo: DesgravamentConstants.TIPO_RESPUESTA_DPS.SI, valor: 'SI' },
    { codigo: DesgravamentConstants.TIPO_RESPUESTA_DPS.NO, valor: 'NO' },
  ];


  public static TIPO_PERSONA: any = {
    NATURAL: 'PN',
    JURIDICA: 'PJ'
  };

  public static TIPOS_PERSONA: any = [
    { codigo: DesgravamentConstants.TIPO_PERSONA.NATURAL, valor: 'Persona natural' },
    { codigo: DesgravamentConstants.TIPO_PERSONA.JURIDICA, valor: 'Persona jurídica' },
  ];

  public static TIPO_CUENTA: any = {
    '1': 'Gobierno', GOBIERNO: '1',
    '2': 'Privado', PRIVADO: '2'
  };

  public static TIPO_POLIZA: any = {
    '1': 'Individual', INDIVIDUAL: '1',
    '2': 'Grupal', GRUPAL: '2'
  };

  public static TIPO_MONEDA: any = {
    SOLES: 1,
  };

  public static TIPO_RENOVACION: any = {
    ESPECIAL: 6,
  };

  public static MODO_VISTA: any = {
    COTIZAR: '',
    VISUALIZAR: 'Visualizar',
    EVALUAR: 'Evaluar',
    AUTORIZAR: 'Autorizar',
    EMITIR: 'Emitir',
    EMITIRR: 'EmitirR',
    RENOVAR: 'Renovar',
    POLIZARENOVAR: 'RenovarPoliza',
    INCLUIR: 'Incluir',
    POLIZAINCLUIR: 'InclusionPoliza',
    EXCLUIR: 'Excluir',
    ENDOSO: 'Endoso',
    ANULACION: 'Anulacion'

  };

  public static FLAG_TRAMA: any = {
    SIN_TRAMA: 0
  };

  public static NRO_TRANSACCTION: any = {
    VISTAS: [['', 0], ['Evaluar', 1], ['Emitir', 1], ['EmitirR', 1], ['Renovar', 4], ['RenovarPoliza', 4], ['InclusionPoliza', 2],  ['Incluir', 2], ['Excluir', 3],
    ['Endoso', 8], ['Anulacion', 7]]

  };

  public static VISTA_FORMA_PAGO: any = {
    VISTAS: [['', 0], ['Evaluar', 1], ['Emitir', 1], ['EmitirR', 1], ['Renovar', 4],['Incluir', 2] ]
  };

  public static TRX_PENDIENTES: any = {
    VISTAS: [['Emisión', 1], ['Renovación', 4], ['Declaración', 4],['Inclusión', 2]]
  };

  public static PAGO_ELEGIDO: any = {
    VOUCHER: 'voucher',
    DIRECTO: 'directo',
    EFECTIVO: 'efectivo',
    OMITIR: 'omitir'
  };

  // SSTATREGT  

  // // NID_TABLE
  
  // // NID_DETAIL


}


