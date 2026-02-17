// *FALTA
export class ChannelResultModel {
  totalItems: number;
  status: number;
  items: Array<{
    fechaInicioVigencia: string,
    fechaFinVigencia: string,
    compDate: string,
    porcentajeMaximoRechazo: number,
    tipoDistribucion: string,
    canal: {
      estado: string,
      estadoId: string,
      codigoTipoCanal: string,
      descripcionTipoCanal: string,
      codigoCanal: string,
      codigoGestorPadre: string,
      codigoCanalPadre: string,
      codigoCliente: string,
      tipoDocumento: number,
      tipoDocumentoDescripcion: string,
      numeroDocumento: string,
      nombres: string,
      apellidoPaterno: string,
      apellidoMaterno: string,
      nombreCanal: string;
    },
    ubigeo: {
      departamento: number,
      provincia: number,
      distrito: number,
      direccion: string
    },
    contacto: {
      nombreContacto: string,
      email: string,
      celular: string
    },
    stock: {
      minimo: number,
      maximo: number,
      actual: number
    }
  }>;

  constructor(payload?: any) {
    this.totalItems = payload?.ROWTOTAL || 0;
    this.status = payload?.STATUS || 0;
    this.items = payload?.entities?.map((val: any) => ({
      fechaInicioVigencia: val.DSTARTDATE,
      fechaFinVigencia: val.DEXPIRDAT,
      compDate: val.DCOMPDATE,
      porcentajeMaximoRechazo: val.NPERCREJECTION,
      tipoDistribucion: val.SDISTRIBUTION_TYPE_,
      canal: {
        estado: val.SCHANNEL_STATE_,
        estadoId: val.NCHANNELONOFF,
        codigoTipoCanal: val.SCHANNEL_TYPE_ID,
        descripcionTipoCanal: val.SCHANNEL_TYPE_,
        codigoCanal: val.NPOLICY,
        codigoGestorPadre: val.NPOLICYFATHER,
        codigoCanalPadre: val.NPOLICYFATHER,
        codigoCliente: val.SCLIENT,
        tipoDocumento: val.NTYPEDOC,
        tipoDocumentoDescripcion: val.SDOCUMENT_TYPE_,
        numeroDocumento: val.SDOCUMENTNRO_,
        nombres: val.SFIRTSNAME,
        apellidoPaterno: val.SLASTNAME,
        apellidoMaterno: val.SLASTNAME2,
        nombreCanal: val.SCLIENAME
      },
      ubigeo: {
        departamento: val.NPROVINCE,
        provincia: val.NLOCAL,
        distrito: val.NMUNICIPALITY,
        direccion: val.SSTREET
      },
      contacto: {
        nombreContacto: val.SCONTACT,
        email: val.SEMAILCLI,
        celular: val.SPHONE1
      },
      stock: {
        minimo: val.NSTOCKMIN,
        maximo: val.NSTOCKMAX,
        actual: val.NSTOCKCURRENT
      }
    })) || [];
  }
}
