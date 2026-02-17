import {IKushki} from '@shared/interfaces/kushki.interface';

export class KushkiModel {
  channelCode: number;
  userId: number;
  branchId: number;
  productId: number;
  processId: number;
  productName: string;
  guid: string;
  client: {
    documentType: 'RUC' | 'DNI' | 'CE';
    documentNumber: string;
    names: string;
    paternalSurname: string;
    maternalSurname: string;
    completeNames: string;
    surnames: string;
    legalName: string;
    email: string;
    phoneNumber: string;
  };
  payment: {
    currency: 'PEN' | 'USD';
    amount: number;
    allowedMethods: Array<'card' | 'cash' | 'transfer'>
    isSubscription: boolean;
    type: 'unique' | 'subscription';
  };
  buttons: {
    showCardPayment: boolean;
    showCashPayment: boolean;
    showPaymentTransfer: boolean;
  };

  constructor(payload: IKushki) {
    this.channelCode = +payload.channelCode;
    this.userId = +payload.userId;
    this.branchId = +payload.branchId;
    this.productId = +payload.productId;
    this.processId = +payload.processId;
    this.productName = payload.productName;
    this.guid = payload.guid;
    this.client = {
      documentType: payload.client.documentType,
      documentNumber: payload.client.documentNumber,
      names: payload.client.documentType !== 'RUC' ? payload.client.names ?? '' : '',
      paternalSurname: payload.client.documentType !== 'RUC' ? payload.client.paternalSurname ?? '' : '',
      maternalSurname: payload.client.documentType !== 'RUC' ? payload.client.maternalSurname ?? '' : '',
      completeNames: payload.client.documentType !== 'RUC' ?
        `${payload.client.names ?? ''} ${payload.client.paternalSurname ?? ''} ${payload.client.maternalSurname ?? ''}`.trim() : '',
      surnames: payload.client.documentType !== 'RUC' ?
        `${payload.client.paternalSurname ?? ''} ${payload.client.maternalSurname ?? ''}`.trim() : '',
      legalName: payload.client.documentType == 'RUC' ? payload.client.legalName ?? '' : '',
      email: payload.client.email ?? '',
      phoneNumber: payload.client.phoneNumber.toString() ?? ''
    };
    this.payment = {
      ...payload.payment,
      isSubscription: !!payload.payment.isSubscription,
      type: !!payload.payment.isSubscription ? 'subscription' : 'unique'
    };

    if (this.payment.type == 'subscription') {
      this.payment.allowedMethods = ['card'];
    }

    this.buttons = {
      showCardPayment: this.payment.allowedMethods.includes('card'),
      showCashPayment: this.payment.allowedMethods.includes('cash'),
      showPaymentTransfer: this.payment.allowedMethods.includes('transfer')
    };
  }
}
