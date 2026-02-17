export class ChannelTypesModel {
  totalItems: number;
  status: number;
  items: Array<{
    canal: {
      id: number,
      codigoCanal: string,
      descripcion: string
    }
    estado: {
      id: number,
      descripcion: string
    },
    registro: {
      fechaRegistro: string,
    },
    user: {
      id: number,
      descripcion: string
    }
  }>;

  constructor(payload?: any) {
    this.totalItems = payload?.ROWTOTAL;
    this.status = payload?.STATUS;
    this.items = payload?.entities?.map((val: any) => ({
      canal: {
        id: val.NIDTYPECHANNEL,
        codigoCanal: val.SCODETYPECHANNEL,
        descripcion: val.SDESCRIPTIONTYPECHANNEL
      },
      estado: {
        id: Number(val.SSTATE),
        descripcion: val.SSTATEDESCRIPTION
      },
      registro: {
        fechaRegistro: val.DREGISTER
      },
      user: {
        id: val.NUSERREGISTER,
        descripcion: val.NUSERREGISTER_DES
      }
    }));
  }
}
