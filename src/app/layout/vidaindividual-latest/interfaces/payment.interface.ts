export interface IPaymentVisa {
  authorizedAmount: string;
  cardNumber: string;
  errorCode: string;
  errorDesc: string | null;
  idProcess: number;
  orderNumber: string;
  policy: string;
  success: boolean;
  transactionDateTime: string;
}
