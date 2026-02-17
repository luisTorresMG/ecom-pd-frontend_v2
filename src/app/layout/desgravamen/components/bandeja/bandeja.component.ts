import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccPersonalesService } from '../../../../layout/broker/components/quote/acc-personales/acc-personales.service';
import { StorageService } from '../../../../layout/broker/components/quote/acc-personales/core/services/storage.service';
import { QuotationService } from '../../../../layout/broker/services/quotation/quotation.service';
import { CommonMethods } from '../../../../layout/broker/components/common-methods';
import { DesgravamentConstants } from '../../shared/core/desgravament.constants';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'bandeja',
  templateUrl: './bandeja.component.html',
  styleUrls: ['./bandeja.component.css']
})
export class BandejaComponent implements OnInit {
  filters: any = {};
  show: any = {};
  reload: any = {};
  cotizacionesParams = {};
  CONSTANTS: any = DesgravamentConstants;

  lblProducto: any;
  lblFecha: any;
  template: any = {};
  variable: any = {};
  nbranch: string;
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  epsItem = JSON.parse(sessionStorage.getItem('eps'));

   constructor(
    public accPersonalesService: AccPersonalesService,
    public storageService: StorageService,
    public quotationService: QuotationService,
    private router: Router) {
    this.CONSTANTS.RAMO = CommonMethods.branchXproduct(JSON.parse(localStorage.getItem('codProducto'))['productId']);
     }

  async ngOnInit() {
      
  }

  clickSearch() {
    this.cotizacionesParams = {
      NPRODUCT: (this.filters.tipoProducto || {}).COD_PRODUCT,
      SSTATREGT: (this.filters.estado || {}).Id || '',
      NID_COTIZACION: this.filters.numCotizacion || '',
      DDESDE: CommonMethods.formatDate(this.filters.fechaDesde) || '',
      DHASTA: CommonMethods.formatDate(this.filters.fechaHasta) || '',
      NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
      NBRANCH:  this.CONSTANTS.RAMO,
    };

    this.reload.cotizaciones = true;
  }

  clickDetail(cotizacion) {
    this.router.navigate([
      '/extranet/accidentes-personales/evaluacion-cotizacion/' +
      cotizacion.NUM_COTIZACION +
      '/' +
      cotizacion.MODO
    ],
      { queryParams: { trx: cotizacion.STRANSAC } });
  }

  validarItems(items) {
    (items || []).forEach((item) => {
      if (!item.Rutas_archivo.length) {
        item.showFile = false;
      }
    });
  }

}
