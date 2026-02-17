export interface IKushki {
  channelCode: number; // Código de canal
  userId: number; // ID Usuario
  branchId: number; // ID Ramo
  productId: number; // ID Producto
  processId: number; // ID Proceso
  productName?: string; // Nombre de producto (descripción)
  guid: string; // UUID - Ejemplo: c2af952c-ea54-4dd8-bdbf-24cd7b8d224d
  client: {
    documentType: 'RUC' | 'DNI' | 'CE'; // Tipo de documento
    documentNumber: string; // Número de documento
    names?: string; // Nombres
    paternalSurname?: string; // Apellido paterno
    maternalSurname?: string; // Apellido materno
    legalName?: string; // Razón social
    email?: string; // Correo electrónico
    phoneNumber: number; // Número celular
  };
  payment: {
    currency: 'PEN' | 'USD'; // Tipo de moneda
    amount: number; // Monto a cobrar
    allowedMethods: Array<'card' | 'cash' | 'transfer'>; // Array de los metodos de pago disponibles
    isSubscription?: boolean;
    /*
    * true si el tipo de pago es suscripción
    * cuando es "true" el método de pago siempre es tarjeta
    */
  };
}

export interface IKushkiResult {
  success: boolean; // Indica si el proceso terminó correctamente o con algún error
  message: string; // Mensaje informativo o token cuando es tarjeta
  paymentInfo: IKushkiPaymentInfo; // Información de pago
}

export interface IKushkiPaymentInfo {
  processId: number; // Codigo de proceso del pago
  secureId?: string; // Codigo de seguridad cuando está activada la validación OTP o 3DS
  token: string; // Token generado por kushki
  pin?: string; // Codigo PIN cuando es Pago en Efectivo y Transferencia
  paymentMethod: 'subscription' | 'card' | 'cash' | 'transfer'; // Método de pago seleccionado
  tokenSubscription?: string; // Token generado por kushki cuando es subscription
}
