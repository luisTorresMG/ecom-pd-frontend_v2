export class Sisweb {
  public NPOLICY: string; // código del canal
  public NNUMPOINT: string; // codigo pto venta donde pertenece el certificado
  public NPOLESP: string; // nro certificado interno
  public DSTARTDATE: string; // inicio vigencia
  public DEXPIRDAT: string; // fecha vencimiento dd/mm/aaaa
  public DISSUEDAT: string; // fecha venta dd/mm/aaaa
  public NISSUETIME: string; // hora minuto venta
  public SCLIENT: string; // codigo cliente 14 digitos
  public NCLASS: string; // clase del vehiculo--no carrocería; sino la clase real
  public SPLATE: string; // placa
  public NMODEL: string; // codigo modelo del vehiculo
  public NMARK: string; // codigo marca vehiculo
  public NYEAR: string; // año de fabricación
  public NSEATING: string; // nro asientos
  public SSERIAL: string; // serie o chaziz
  public NMODULEC: string; // codigo del plan
  public NUSEVEHICLE: string; // uso del vehículo
  public NPROVINCE: string; // código departamento
  public NTIPPER: string; // cod tipo persona
  public NPREMIUM: string; // prima
  public SOBSERVATION: string; // ingresar Plataforma Digital
  public NBODY: string; // codigo carrocería-- aquí va el código que están ingresando como clase en plataforma
  public NPOLESP_COMP: string; // nro certificado completo (8  dígitos)
  public SMARK: string; // nombre marca
  public SMODEL: string; // nombre modelo
  public SVERTION: string; // versión de Modelo
  public NLOCAL: string; // código provincia
  public NMUNICIPALITY: string; // código distrito
  public NDIGITOVALIDADOR: string; // digito validador de Apeseg . Puede ir cero
  public STIPODOCUMENTO: string; // si es digital debe ir "D" caso contrario "F"
  public SNROCELULAR: string; // nro celular
  public SCLIENAME: string; // si es natural nombre completo caso contrario; razon social
  public SFIRSTNAME: string; // si es natural; nombre
  public SLASTNAME: string; // si es natural; apellido
  public NPERSON_TYP: string; // tipo de persona
  public SLEGALNAME: string; // si es persona juridica; ingresar razon social
  public SEMAILCLI: string; // email
  public SKEYADDRESS: string; // anteponer el 2 + codigo cliente 14 dígitos
  public SSTREET: string; // dirección
  public SDESCADD: string; // dirección
  public SPHONE: string; // nro teléfono

  constructor() {
    const oAuto = JSON.parse(sessionStorage.getItem('auto'));
    const oCert = JSON.parse(sessionStorage.getItem('certificado'));
    const oCont = JSON.parse(sessionStorage.getItem('contratante'));

    this.NPOLICY = sessionStorage.getItem('canalVentaCliente'); // código del canal
    this.NNUMPOINT = sessionStorage.getItem('puntoVentaCliente'); // codigo pto venta donde pertenece el certificado
    this.NPOLESP = oCert.P_NIDPROCESS; // nro certificado interno
    this.DSTARTDATE = oCert.P_DSTARTDATE; // inicio vigencia
    this.DEXPIRDAT = ''; // fecha vencimiento dd/mm/aaaa ---> ?
    this.DISSUEDAT = ''; // fecha venta dd/mm/aaaa ---> Fecha del momento?
    this.NISSUETIME = ''; // hora minuto venta ---> Hora minuto del sistema?
    this.SCLIENT = oCont.p_sDOCUMENT; // codigo cliente 14 digitos ---> cual es este código ?
    this.NCLASS = oAuto.p_NIDCLASE; // clase del vehiculo--no carrocería; sino la clase real
    this.SPLATE = oAuto.p_SREGIST; // placa
    this.NMODEL = oAuto.p_NVEHMODEL; // codigo modelo del vehiculo
    this.NMARK = oAuto.p_NVEHBRAND; // codigo marca vehiculo
    this.NYEAR = oAuto.p_NYEAR; // año de fabricación
    this.NSEATING = oAuto.p_SEATNUMBER; // nro asientos
    this.SSERIAL = oAuto.p_SNUMSERIE; // serie o chaziz
    this.NMODULEC = oAuto.p_NAUTOZONE; // codigo del plan
    this.NUSEVEHICLE = oAuto.p_SNAME_USO; // uso del vehículo
    this.NPROVINCE = oCont.p_NPROVINCE; // código departamento
    this.NTIPPER = oCont.p_NPERSON_TYP; // cod tipo persona
    this.NPREMIUM = oCert.P_NPREMIUM; // prima --> cual es la prima?
    this.SOBSERVATION = 'PLATAFORMA DIGITAL'; // ingresar Plataforma Digital
    this.NBODY = ''; // codigo carrocería-- aquí va el código que están ingresando como clase en plataforma ---> ?
    this.NPOLESP_COMP = oCert.P_NPOLICY; // nro certificado completo (8 dígitos)
    this.SMARK = oAuto.p_SNAME_VEHBRAND; // nombre marca
    this.SMODEL = oAuto.p_SNAME_VEHMODEL; // nombre modelo
    this.SVERTION = ''; // versión de Modelo ---> de donde viene ese dato?
    this.NLOCAL = oCont.p_NLOCAT; // código provincia
    this.NMUNICIPALITY = oCont.p_NMUNICIPALITY; // código distrito
    this.NDIGITOVALIDADOR = ''; // digito validador de Apeseg . Puede ir cero ---> CUAL ES?
    this.STIPODOCUMENTO = 'D'; // si es digital debe ir "D" caso contrario "F" ---> CUAL DEBE DE IR?
    this.SNROCELULAR = oCont.p_SPHONE; // nro celular
    this.SCLIENAME =
      oCont.p_NPERSON_TYP === '1' ?
        (oCont.p_SCLIENT_NAME + ' ' + oCont.p_SCLIENT_APPPAT + ' ' + oCont.p_SCLIENT_APPMAT) :
        oCont.p_SLEGALNAME; // si es natural nombre completo caso contrario; razon social
    this.SFIRSTNAME = oCont.p_NPERSON_TYP === '1' ? oCont.p_SCLIENT_NAME : ''; // si es natural; nombre
    this.SLASTNAME = oCont.p_NPERSON_TYP === '1' ? oCont.p_SCLIENT_NAME + ' ' + oCont.p_SCLIENT_APPMAT : ''; // si es natural; apellido
    this.NPERSON_TYP = oCont.p_NPERSON_TYP; // tipo de persona
    this.SLEGALNAME = oCont.p_NPERSON_TYP === '1' ? '' : oCont.p_SLEGALNAME; // si es persona juridica; ingresar razon social
    this.SEMAILCLI = oCont.p_SMAIL; // email
    this.SKEYADDRESS = ''; // anteponer el 2 + codigo cliente 14 dígitos ---> cual es el código de 14 dígitos???
    this.SSTREET = oCont.p_SADDRESS; // dirección
    this.SDESCADD = oCont.p_SADDRESS; // dirección
    this.SPHONE = oCont.p_SPHONE; // nro teléfono
  }
}
