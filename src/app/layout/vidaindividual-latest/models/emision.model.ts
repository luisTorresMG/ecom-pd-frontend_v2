export class EmissionResponse {
  authorizedAmount: number;
  cardNumber: string;
  errorCode: string;
  errorDesc: string;
  idProcess: number;
  orderNumber: string;
  policy: any;
  success: boolean;
  transactionDateTime: string;
  constructor({
    authorizedAmount,
    cardNumber,
    errorCode,
    errorDesc,
    idProcess,
    orderNumber,
    policy,
    success,
    transactionDateTime
  }) {
    this.authorizedAmount = authorizedAmount;
    this.cardNumber = cardNumber;
    this.errorCode = errorCode;
    this.errorDesc = errorDesc;
    this.idProcess = idProcess;
    this.orderNumber = orderNumber;
    this.policy = policy;
    this.success = success;
    this.transactionDateTime = transactionDateTime;
  }
}
