import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PolicyMovementDetailsAllComponent } from '../../../../layout/broker/components/policy-all/policy-movement-details-all/policy-movement-details-all.component';
import { AccPersonalesService } from '../../../../layout/broker/components/quote/acc-personales/acc-personales.service';
import { StorageService } from '../../../../layout/broker/components/quote/acc-personales/core/services/storage.service';
import { PolicyemitService } from '../../../../layout/broker/services/policy/policyemit.service';
import { QuotationService } from '../../../../layout/broker/services/quotation/quotation.service';
import { CommonMethods } from '../../../../layout/broker/components/common-methods';
import { DesgravamentConstants } from '../../shared/core/desgravament.constants';
import swal from 'sweetalert2';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-request-policy',
  templateUrl: './request-policy.component.html',
  styleUrls: ['./request-policy.component.css'],
})
export class RequestPolicyComponent implements OnInit {
  lblProducto: any;
  lblFecha: any;
  template: any = {};
  variable: any = {};
  nbranch: string;
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  epsItem = JSON.parse(sessionStorage.getItem('eps'));
  filters: any = {};
  limpiar: any = { filtros: false };
  show: any = {};
  reload: any = {};

  polizas: any = [];
  polizasParams = {};
  polizaSeleccionada: any;

  CONSTANTS: any = DesgravamentConstants;

  constructor(
    private modalService: NgbModal,
    public accPersonalesService: AccPersonalesService,
    public storageService: StorageService,
    public quotationService: QuotationService,
    public policyemitService: PolicyemitService,
    private router: Router
  ) {
    this.CONSTANTS.RAMO = CommonMethods.branchXproduct(
      JSON.parse(localStorage.getItem('codProducto'))['productId']
    );
    this.filters.contratante = {};
    this.filters.contratante = {
      tipoBusqueda: {
        codigo: 'POR_DOC',
      },
    };
  }

  async ngOnInit() {}
  clickSearch() {
    let msgValidate = this.getValidations();

    if (msgValidate != '') {
      swal.fire('Información', msgValidate, 'error');
      return;
    }

    this.polizasParams = {
      NTYPE_HIST: this.filters.tipoTransaccion.codigo,
      NBRANCH: this.CONSTANTS.RAMO, // this.filters.ramo.codigo,
      NPRODUCT: this.filters.producto.codigo, //(this.filters.ramo || {}).COD_PRODUCT || '',
      NPOLICY: this.filters.numPoliza || null,

      NTYPE_DOC: (this.filters.contratante.tipoDocumento || {}).Id || '',
      SIDDOC: this.filters.contratante.numDocumento || '',
      SFIRSTNAME: this.filters.contratante.nombres || '',
      SLASTNAME: this.filters.contratante.apellidoPaterno || '',
      SLASTNAME2: this.filters.contratante.apellidoMaterno || '',
      SLEGALNAME: this.filters.contratante.razonSocial || '',

      DINI: CommonMethods.formatDate(this.filters.fechaDesde) || '',
      DFIN: CommonMethods.formatDate(this.filters.fechaHasta) || '',
      NUSERCODE: this.storageService.userId,
    };

    this.reload.cotizaciones = true;
  }

  openMovimientos(poliza) {
    const modalRef = this.modalService.open(PolicyMovementDetailsAllComponent, {
      size: 'lg',
      windowClass: 'modalCustom',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.reference = modalRef;
    modalRef.componentInstance.itemTransaccionList = this.polizas;
    modalRef.componentInstance.NBRANCH = poliza.NBRANCH;
    modalRef.componentInstance.NPRODUCT = poliza.NPRODUCT;
    modalRef.componentInstance.NPOLICY = poliza.NPOLIZA;

    modalRef.componentInstance.SBRANCH = poliza.SRAMO;
    modalRef.componentInstance.SPRODUCT = poliza.SPRODUCTO;
    modalRef.componentInstance.SCONTRATANTE = poliza.SCONTRATANTE;
    modalRef.componentInstance.NID_COTIZACION = poliza.NID_COTIZACION;
  }

  verificarPolizas() {
    this.polizas.forEach((poliza) => {
      poliza.showFile =
        poliza.NFLAG_TRAMA == this.CONSTANTS.FLAG_TRAMA.SIN_TRAMA;
    });
  }

  clickDetail(cotizacion) {
    this.router.navigate(
      [
        '/extranet/desgravamen/evaluacion-cotizacion/' +
          cotizacion.NID_COTIZACION +
          '/Visualizar',
      ],
      { queryParams: { trama: '1' } }
    );
  }

  clickTransac(nTransacc: any, modoVista: any) {
    if (this.polizaSeleccionada == undefined) {
      swal.fire('Información', 'Primero deberá seleccionar una póliza', 'info');
      return;
    }
    this.policyemitService
      .valTransactionPolicy(this.polizaSeleccionada.NID_COTIZACION)
      .subscribe((res) => {
        if (res.P_COD_ERR == '0') {
          const data: any = {};
          data.NBRANCH = this.polizaSeleccionada.NBRANCH;
          data.NPRODUCT = this.polizaSeleccionada.NPRODUCT;
          data.NPOLICY = this.polizaSeleccionada.NPOLIZA;
          data.NID_COTIZACION = this.polizaSeleccionada.NID_COTIZACION;
          data.NTYPE_TRANSAC = nTransacc;

          this.policyemitService.ValidatePolicyRenov(data).subscribe((res) => {
            if (Number(res.P_NCODE) === 0) {
              this.router.navigate([
                '/extranet/desgravamen/evaluacion-poliza/' +
                  this.polizaSeleccionada.NID_COTIZACION +
                  '/' +
                  modoVista,
              ]);
            } else {
              swal.fire('Información', res.P_SMESSAGE, 'error');
              console.log(res);
            }
          });
        } else {
          swal
            .fire({
              title: 'Información',
              text: res.P_MESSAGE,
              icon: 'error',
              confirmButtonText: 'OK',
              allowOutsideClick: false,
            })
            .then((result) => {
              if (result.value) {
                return;
              }
            });
        }
      });
  }
  getValidations(): any {
    let msg = '';

    if (
      !!this.filters.contratante.tipoDocumento &&
      !!this.filters.contratante.numDocumento &&
      this.filters.contratante.numDocumento.trim().length > 0
    ) {
      if (
        this.filters.contratante.tipoDocumento.Id === 1 &&
        CommonMethods.validateRucAP(this.filters.contratante.numDocumento)
      ) {
        msg += 'El número de RUC del contratante no es válido <br>';
      }
      if (
        this.filters.contratante.tipoDocumento.Id === 2 &&
        CommonMethods.validateDNI(this.filters.contratante.numDocumento)
      ) {
        msg += 'El número de DNI del contratante no es válido <br>';
      }
      if (
        this.filters.contratante.tipoDocumento.Id === 4 &&
        CommonMethods.validateCE(this.filters.contratante.numDocumento)
      ) {
        msg += 'El número de CE del contratante no es válido <br>';
      }
      if (
        this.filters.contratante.tipoDocumento.Id === 6 &&
        CommonMethods.validatePass(this.filters.contratante.numDocumento)
      ) {
        msg += 'El número de PASAPORTE del contratante no es válido <br>';
      }
    }

    return msg;
  }
}
