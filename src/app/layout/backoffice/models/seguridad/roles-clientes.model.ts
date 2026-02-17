export class RolesClientesModel {
  items: Array<{
    idRol: string;
    rol: string;
  }>;

  constructor(payload?: any) {
    this.items =
      payload?.rolesClientes360?.map((val) => ({
        iD_ROL: +val.idRol,
        nombre: val.rol,
      })) || [];
  }
}
