export class ProfilesModel {
  totalItems: number;
  status: number;
  items: Array<IProfile>;

  constructor(payload?: any) {
    this.totalItems = payload?.ROWTOTAL || 0;
    this.status = payload?.STATUS || 0;
    this.items = payload?.entities.map((val: any) => ({
      idProduct: val.NIDPRODUCT,
      idSystem: val.NIDSYSTEM,
      active: !!val.STATUS,
      profile: {
        id: val.NIDPROFILE,
        description: val.STYPE_PROFILE
      },
      name: val.SNAME,
      description: val.SDESCRIPTION,
      update: {
        idUser: +val.NUSERUPDATE,
        userDescription: val.NUSERUPDATE_DES,
        date: val.DUPDATE
      },
      register: {
        idUser: +val.NUSERREGISTER,
        userDescription: val.NUSERREGISTER_DES,
        date: val.DREGISTER
      }
    })) || [];
  }
}

export class ProfilesResponse {
  totalItems: number;
  status: number;
  items: Array<IProfileResponse>;

  constructor(payload?: any) {
    this.totalItems = payload?.ROWTOTAL || 0;
    this.status = payload?.STATUS || 0;
    this.items = payload?.entities.map((val: any) => ({
      id: val.NIDSYSTEM,
      products: val.NIDPRODUCTS?.split(',').map((map: any) => (+map)),
      status: {
        id: val.SSTATE == 'ACTIVO' ? 1 : 0,
        description: val.SSTATE
      },
      channelSale: {
        id: val.NPOLICY,
        description: val.SPOLICY,
      },
      pointSale: {
        id: val.NSALEPOINT,
        description: val.SNUMPOINT,
      },
      location: {
        department: val.NPROVINCE,
        province: val.NLOCAL,
        district: val.NMUNICIPALITY,
        address: val.SADDRESS,
      },
      document: {
        id: +val.STIP_DOC,
        number: val.SDNI,
      },
      contact: {
        phone: val.SCELLPHONE,
        email: val.SEMAIL,
      },
      completeNames: val.SNAME,
      name: val.SFIRSTNAME,
      apePat: val.SLASTNAME,
      apeMat: val.SLASTNAME2,
      sex: {
        id: val.SSEX_EDIT,
        description: val.SSEX,
      },
      profile: {
        id: val.NIDPROFILES?.split(',').map((map: any) => (+map)),
        type: val.TYPEPROFILE,
        description: val.NIDPROFILEDESC?.split(',').map((map: any) => (map))
      },
      user: {
        id: val.NIDUSER,
        description: val.SUSER,
      },
      password: val.SPASSWORD,
    })) || [];
  }
  private transformTypeDocument(val: number): number {
    switch (val) {
      case 1:
        return 2;
      case 2:
        return 4;
      default:
        return val;
    }
  }
}

export interface IProfile {
  idProduct: number;
  idSystem: number;
  active: boolean;
  profile: {
    id: number,
    description: string
  };
  name: string;
  description: string;
  update: {
    idUser: number,
    userDescription: string,
    date: string
  };
  register: {
    idUser: number,
    userDescription: string,
    date: string
  };
}

export interface IProfileResponse {
  id: number;
  products: Array<number>;
  status: {
    id: number;
    description: string;
  };
  channelSale: {
    id: number;
    description: string;
  };
  pointSale: {
    id: number;
    description: string;
  };
  location: {
    department: number;
    province: number;
    district: number;
    address: string;
  };
  document: {
    id: number;
    number: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  completeNames: string;
  name: string;
  apePat: string;
  apeMat: string;
  sex: {
    id: number;
    description: string;
  };
  profile: {
    id: Array<number>;
    type: string;
    description: Array<string>
  };
  user: {
    id: number;
    description: string;
  };
  password: string;
}


