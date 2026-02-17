export class ResourcesModel {
  items: Array<IResource>;
  constructor(payload?: any) {
    this.items = payload?.entities?.map((val) => ({
      id: val.NIDRESOURCE,
      idFather: val.NIDFATHER,
      userCode: val.NUSERCODE,
      name: val.SNAME,
      description: val.SDESCRIPTION,
      update: {
        idUser: val.NUSERUPDATE,
        date: val.DUPDATE
      },
      register: {
        idUser: val.NUSERREGISTER,
        date: val.DREGISTER
      },
      childrens: new ResourcesModel({
        entities: val.CHILDREN
      })
    })) || [];
  }
}

export interface IResource {
  id: number;
  idFather: number;
  userCode: number;
  name: string;
  description: string;
  update: {
    idUser: number,
    date: string
  };
  register: {
    idUser: number,
    date: string
  };
  childrens: Array<IResource>;
}
