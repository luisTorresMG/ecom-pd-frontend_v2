export interface Request {
  idProcess: number;
  idFlujo: string;
  canalVenta: string;
  puntoVenta: string;
  idTipoPersona: number;
  idTipoDocumento: number;
  numeroDocumento: string;
  email: string;
  Telefono: string;
  FechaNacimiento: string;
  terminos: any;
  privacidad: any;
  codigoUsuario: string;
}
export interface Response {
  success: boolean;
  idProcess: string | number;
  errorMessage: string;
  rateAges: {
    nAge: number;
    currency: {
      sCurrency: string;
      nCurrency: number;
      capital: {
        nCapital: number;
        premium: {
          nPremium: number;
        }[]
      }[];
    }[];
  }[];
}
