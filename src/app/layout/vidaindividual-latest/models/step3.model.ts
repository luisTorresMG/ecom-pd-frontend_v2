export class Step3Request {
  idProcess: number;
  jsondps: string;
  constructor({
    idProcess,
    jsondps
  }) {
    this.idProcess = idProcess;
    this.jsondps = jsondps;
  }
}
export class Step3Response {
  success: boolean;
  idProcess: number;
  errorMessage: string;
  constructor({
    success,
    idProcess,
    errorMessage
  }) {
    this.success = success;
    this.idProcess = idProcess;
    this.errorMessage = errorMessage;
  }
}
