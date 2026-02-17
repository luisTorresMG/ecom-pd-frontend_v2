export class Certificado {
  P_NIDPROCESS; // Identificador del proceso
  P_NPOLICY; // Numero de poliza
  P_DSTARTDATE; // Fecha de inicio de vigencia
  // P_NCODCHANNEL_BO; // Codigo de canal
  // P_SDESCHANNEL_BO;
  // P_NCODNUMPOINT_BO; // Codigo de punto de venta
  // P_SDESNUMPOINT_BO;
  // P_NTYPECHANNEL_BO; // Codigo de tipo de canal
  // P_NPLAN; // Plan de tarifario
  P_NPREMIUM; // Prima del tarifario
  P_NCOMMISSION; // Comision del tarifario
  V_NIDPROCESS;

  P_CHANNELEXTERNAL;
  P_NCODCHANNEL_BO;
  P_SDESCHANNEL_BO;
  P_NCODNUMPOINT_BO;
  P_SDESNUMPOINT_BO;
  P_NTYPECHANNEL_BO;
  P_NPLAN;
  P_NIDCAMPAIGN;
  P_DESCRIPTARIFARIO: string; // PLAN DE TARIFARIO VALOR DEL COMBO
  P_IDTARIFARIO: string; // PLAN DE TARIFARIO VALOR DEL COMBO
  P_NINTERMED_BROK: number; // CODIGO DE BROKER
  P_NCOMISSION_BROK: number; // COMISION DE BROKER
  P_NINTERMED_INTERM: number; // CODIGO DE INTERMEDIARIO
  P_NCOMISSION_INTERM: number; // COMISION DE INTERMEDIARIO
  P_NINTERMED_SPOINT: number; // CODIGO DE PUNTO DE VENTA
  P_NCOMISSION_SPOINT: number; // COMISION DE PUNTO DE VENTA
  P_NTIPOPAPEL: number;
  P_NSOATGRATIS: number;
  IsPD: boolean;
}
