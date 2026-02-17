export class Contratante {
  p_NIDPROCESS: string;
  p_NPERSON_TYP: string; // TIPO DE PERSONA
  p_NDOCUMENT_TYP: string; // TIPO DE DOCUMENTO
  p_SDOCUMENT: string; // NUMERO DE DOCUMENTO
  p_SLEGALNAME: string; // RAZON SOCIAL
  p_SCLIENT_NAME: string; // NOMBRE
  p_SCLIENT_APPPAT: string; // APELLIDO PATERNO
  p_SCLIENT_APPMAT: string; // APELLIDO MATERNO
  p_NMUNICIPALITY: string; // DISTRITO
  p_NLOCAT: string; // PROVINCIA
  p_NPROVINCE: string; // DEPARTAMENTO
  p_SADDRESS: string; // DIRECCION
  p_SMAIL: string; // MAIL
  p_SPHONE: string; // TELEFONO
  V_NIDPROCESS: string;
  v_CONTRATANTE: any;
  p_NFACTURA: number;

  public getFullName(): string {
    return (
      this.p_SCLIENT_NAME.trim() +
      ' ' +
      this.p_SCLIENT_APPPAT.trim() +
      ' ' +
      this.p_SCLIENT_APPMAT.trim()
    );
  }

  public get p_FULL_NAME(): string {
    return (
      this.p_SCLIENT_NAME +
      ' ' +
      this.p_SCLIENT_APPPAT.trim() +
      ' ' +
      this.p_SCLIENT_APPMAT.trim()
    );
  }
}
