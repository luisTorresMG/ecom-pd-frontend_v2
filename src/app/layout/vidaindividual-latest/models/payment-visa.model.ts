export class PaymentVisaResponse {
  indProcess: number;
  errorCode: any;
  errorDesc: string;
  numPolicy: number;
  numProforma: number;
  email: string;
  phoneNumber: string;
  orderNumber: any;
  transactionDateTime: string;
  authorizedAmount: number | string;
  customerName: string;
  fullDate: string;
  cardNumber: any;
  pdf_ID: number | string;
  pdf_Email: string;
  pdf_CustomerName: string;
  pdf_PhoneNumber: string;
  pdf_Error: boolean;
  actionCodeDescription: string;
  numPolicySalud: number;
  numPolicyPension: number;
  constructor({
    indProcess,
    errorCode,
    errorDesc,
    numPolicy,
    numProforma,
    email,
    phoneNumber,
    orderNumber,
    transactionDateTime,
    authorizedAmount,
    customerName,
    fullDate,
    cardNumber,
    pdf_ID,
    pdf_Email,
    pdf_CustomerName,
    pdf_PhoneNumber,
    pdf_Error,
    actionCodeDescription,
    numPolicySalud,
    numPolicyPension
  }) {
    this.indProcess = indProcess;
    this.errorCode = errorCode;
    this.errorDesc = errorDesc;
    this.numPolicy = numPolicy;
    this.numProforma = numProforma;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.orderNumber = orderNumber;
    this.transactionDateTime = transactionDateTime;
    this.authorizedAmount = authorizedAmount;
    this.customerName = customerName;
    this.fullDate = fullDate;
    this.cardNumber = cardNumber;
    this.pdf_ID = pdf_ID;
    this.pdf_Email = pdf_Email;
    this.pdf_CustomerName = pdf_CustomerName;
    this.pdf_PhoneNumber = pdf_PhoneNumber;
    this.pdf_Error = pdf_Error;
    this.actionCodeDescription = actionCodeDescription;
    this.numPolicySalud = numPolicySalud;
    this.numPolicyPension = numPolicyPension;
  }
}
