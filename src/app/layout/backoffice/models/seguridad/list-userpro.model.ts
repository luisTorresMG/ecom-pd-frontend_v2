export class UsuariosPro {
  success: boolean;
  items: Array<{
    canalVenta: string;
    estado: string;
    idSistema: number;
    idUser: number;
    nombreCompleto: string;
    nombreUsuarioSistema: string;
    numeroDocumento: string;
  }>;

  constructor(payload?: any) {
    this.success = payload?.success;
    this.items =
      payload?.listaUsuario?.map((val) => ({
        canalVenta: val.canalVenta,
        estado: val.estado,
        idSistema: val.idSistema,
        idUser: val.idUser,
        nombreCompleto: val.nombreCompleto,
        nombreUsuarioSistema: val.nombreUsuarioSistema,
        numeroDocumento: val.numeroDocumento,
      })) || [];
  }
}
