import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { isNullOrUndefined } from 'util';
@Injectable()
export class PagoEfectivoService {
  endpoint = 'pago';
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  constructor(private api: ApiService) {}

  generarCip(
    nombres,
    apellidos,
    correo,
    monto,
    procesoId,
    planillaId,
    flujoId,
    usuario
  ) {
    const action = 'generarcip';
    const url = `${this.endpoint}/${action}`;

    const data = {
      Nombres: nombres,
      Apellidos: apellidos,
      Correo: correo,
      Total: monto,
      ProcesoId: procesoId,
      PlanillaId: planillaId,
      FlujoId: flujoId,
      Usuario: usuario,
    };
    return this.api.postHeader(url, data, this.headers);
  }

  generarCipPlanillas(
    nombres,
    apellidos,
    correo,
    nombreCanal,
    monto,
    procesoId,
    planillaId,
    flujoId,
    usuario,
    ramo,
    producto,
    conceptoPago,
    moneda
  ) {
    const action = 'pagoefectivo/generarcip';
    const url = `${this.endpoint}/${action}`;

    correo = isNullOrUndefined(correo) ? 'no@posee.com' : correo;
    const data = {
      tipoSolicitud: 3,
      monto: monto,
      correo: correo,
      conceptoPago: conceptoPago,
      nombres: nombreCanal,
      apellidos: '',
      ubigeoINEI: '150101',
      tipoDocumento: '6',
      numeroDocumento: '20517207331',
      telefono: '3913030',
      ramo,
      producto,
      externalId: planillaId,
      moneda,
    };
    return this.api.postHeader(url, data, this.headers);
  }

  generarCipRest(
    idProcess,
    nombres,
    apellidos,
    tipoDocumento,
    numeroDocumento,
    telefono,
    correo,
    monto,
    externalId,
    tipoSolicitud,
    ramo,
    producto,
    conceptoPago
  ) {
    const action = 'pagoefectivo/generarcip';
    const url = `${this.endpoint}/${action}`;

    correo = isNullOrUndefined(correo) ? 'no@posee.com' : correo;
    const data = {
      idProcess,
      tipoSolicitud,
      monto: monto,
      correo: correo,
      conceptoPago,
      nombres,
      apellidos,
      ubigeoINEI: '150101',
      tipoDocumento,
      numeroDocumento,
      telefono,
      ramo,
      producto,
      externalId,
    };
    return this.api.postHeader(url, data, this.headers);
  }
}
