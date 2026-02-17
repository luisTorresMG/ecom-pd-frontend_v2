export interface IOtp {
  processId: number;
  documentNumber: string;
  names: string;
  surnames: string;
  email: string;
  cellphone: number;
  branchId: number;
  selectedMethod?: number; // 1: biometrico 2: sms 3: email
  methods?: Array<number>; // metodos de autenticacion permitidos
  avatar?: string; // avatar base64 para biometrico
  isDps?: boolean;
}

export interface IOtpResult {
  success: boolean;
  hasError: boolean;
  message: string;
  type: string;
  payload: any;
  response: any;
}
