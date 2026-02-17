export class Auto {
  p_NIDPROCESS: string; // Para el retorno a la pantalla
  p_NIDFLOW: string; // FLUJO 1: CLIENTE FINAL | 2: CANAL DE VENTA
  p_NREMINDER: string; // 1: ACTIVADO (Para Cliente siempre es 1) | 0 : DESACTIVADO (Para canal de Venta 0)
  p_SREGIST: string; // PLACA
  p_NIDCLASE: string; // IDENTIFICADOR DE LA CLASE
  p_SNAMECLASE: string; // NOMBRE DE LA CLASE
  p_NIDUSO: string; // IDENTIFICADOR DE LA USO
  p_SNAME_USO: string; // IDENTIFICADOR DE LA USO
  p_NVEHBRAND: string; // CODIGO DE MARCA
  p_SNAME_VEHBRAND: string; // NOMBRE DE LA MARCA
  p_NVEHMODEL: string; // CODIGO DE MODELO
  p_SNAME_VEHMODEL: string; // NOMBRE DE MODELO
  p_SNUMSERIE: string; // NUMERO DE SERIE
  p_SEATNUMBER: string; // NUMERO DE ASIENTOS
  p_NYEAR: string; // AÑO
  p_NAUTOZONE: string; // CODIGO DE ZONA DE CIRCULACION
  p_SNAME_AUTOZONE: string; // CODIGO DE ZONA DE CIRCULACION
  p_NUSERCODE: string; // CODIGO DE USUARIO
  p_STYPE_REGIST: string; // TIPO DE PLACA
  V_NIDPROCESS: string;
  p_NVEHMAINMODEL: string; // CODIGO DE MODELO
  p_SNAME_VEHMAINMODEL: string; // NOMBRE DE MODELO
  p_ORIGIN?: string;
  ZONA_CIRCULACION: any; // ZONA DE CIRCULACIÓN
  AceptaTerminos?: boolean;
  AceptaPrivacidad?: boolean;
  versionId?: string;
  versionName?: string;
  registrationZone?: infoUbigeo[];
}

export class infoUbigeo {
  idZonaRegistral: string;
  prioridad: string;
  ubigeoTarifario: string;
  zonaRegistral: string;
}
