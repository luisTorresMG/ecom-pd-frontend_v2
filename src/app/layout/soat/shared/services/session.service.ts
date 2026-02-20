import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Selling } from '../interfaces/selling.interface';
import { ActivatedRoute } from '@angular/router';
import { VehiculoService } from '../../../client/shared/services/vehiculo.service';
import { map, switchMap, filter } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/internal/observable/of';
import SoatUser from '../models/soat-user';
import Rate from '../models/rate';
import { isNullOrUndefined } from '@shared/helpers/null-check';
import { SessionStorageService } from '../../../../shared/services/storage/storage-service';
import { Autorizacion } from '../../../client/shared/models/autorizacion.model';
import { ApiService } from '../../../../shared/services/api.service';
// import { ConsoleService } from '@ng-select/ng-select/lib/console.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  constructor(
    private readonly route: ActivatedRoute,
    private readonly carService: VehiculoService,
    private storage: SessionStorageService,
    private api: ApiService
  ) { }
  renewSellingPoint(): Observable<Selling> {
    const sellingConfig = {
      sellingChannel: environment.canaldeventadefault,
      sellingPoint: environment.puntodeventadefault,
    };

    this.saveToLocalStorage('selling', sellingConfig);

    return this.route.queryParams.pipe(
      switchMap((params) => {
        if (params.code) {
          return this.setSellingPoint(params.code);
        }
        return of(sellingConfig);
      })
    );
  }

  setSellingPoint(code: string) {
    return this.carService.obtenerCodigoCanal(code).pipe(
      filter(
        (val) =>
          val?.scodchannel !== undefined && val?.scodsalepoint !== undefined
      ),
      map((response) => {
        const sellingConfig = {
          sellingChannel: response.scodchannel,
          sellingPoint: response.scodsalepoint,
        };

        const ref = {
          referenteCode: code,
          referenteCanal: response.scodchannel,
          referenteDesCanal: response.sdeschannel,
          referentePuntoVenta: response.scodsalepoint,
          referenteDesPuntoVenta: response.sdessalepoint,
          referenteTipoCanal: response.ntypechannel,
          referentePlaceholder: response.splaceholder,
          referenteOrigenPublicidad: '1',
          referentePlan: response.nidplan,
          referenteAplicaCupon: '1',
        };

        if (!response.nidplan) {
          ref.referenteAplicaCupon = '0';
        }

        this.saveToLocalStorage('referenceChannel', ref);
        this.saveToLocalStorage('selling', sellingConfig);
        this.storage.refreshLogo();
        return sellingConfig;
      })
    );
  }

  getCurrentUser(): boolean {
    const currentUser = localStorage.getItem('currentUser');
    return isNullOrUndefined(currentUser) || currentUser === '';
  }

  getSellingPoint(): Selling {
    return JSON.parse(sessionStorage.getItem('selling') || '');
  }

  getSoatUser(): SoatUser {
    const soatUser = sessionStorage.getItem('soat-user') || '{}';
    return new SoatUser(JSON.parse(soatUser));
  }

  getRef(): Selling {
    return JSON.parse(sessionStorage.getItem('referenceChannel')) || {};
  }

  getRate(): Rate {
    return JSON.parse(sessionStorage.getItem('rate')) || {};
  }
  getCampaign() {
    return JSON.parse(sessionStorage.getItem('campaign')) || {};
  }
  getOTP() {
    return JSON.parse(sessionStorage.getItem('')) || {};
  }
  getCertificate() {
    return JSON.parse(sessionStorage.getItem('certificate')) || {};
  }

  getClientBill() {
    return JSON.parse(sessionStorage.getItem('contractor')) || {};
  }

  getVisa() {
    return JSON.parse(sessionStorage.getItem('visa')) || {};
  }

  getTerms() {
    return JSON.parse(sessionStorage.getItem('terms')) || [];
  }
  getSoatTerms() {
    return JSON.parse(sessionStorage.getItem('soat_terms')) || [];
  }
  getStepPayload() {
    return JSON.parse(sessionStorage.getItem('step2-3')) || {};
  }

  getVisaPayment() {
    return JSON.parse(sessionStorage.getItem('visaPayment')) || {};
  }

  saveToLocalStorage(key: string, payload: any) {
    sessionStorage.setItem(key, JSON.stringify(payload));
  }

  isEcommerce() {
    return sessionStorage.getItem('ecommerce') === 'soat';
  }

  generarVoucherDigitalPdf(auth: Autorizacion) {
    const producto = isNullOrUndefined(auth.producto) ? '' : auth.producto;

    const body = {
      email: auth.email,
      phoneNumber: auth.phoneNumber,
      customerName: auth.customerName,
      transactionDateTime:
        auth.transactionDateTime + ' ' + auth.fullDate.substr(-5),
      aprobado: auth.aprobado,
      authorizedAmount: auth.authorizedAmount,
      cardNumber: auth.cardNumber,
      orderNumber: auth.orderNumber,
      description: auth.description,
      quantity: 1,
      id: auth.id,
      producto: producto,
    };

    const endpoint = 'EmissionProc';
    const action = 'DownloadCustomerPdf';
    const url = `${endpoint}/${action}`;
    return this.api.post(url, body, this.headers);
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
    const url = `pago/${action}`;

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
