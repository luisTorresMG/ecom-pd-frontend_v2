import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CargaMasivaEstadoService } from '../../../../../services/transaccion/carga-masiva/carga-masiva-estado.service';
import { CargaMasivaService } from '../../../../../services/transaccion/carga-masiva/carga-masiva.service';
@Component({
  selector: 'app-CargaMasivaAddState',
  templateUrl: './CargaMasivaAddState.component.html',
  styleUrls: ['./CargaMasivaAddState.component.css'],
})
export class CargaMasivaAddStateComponent implements OnInit, OnDestroy {
  EmisionSoatPageFocus = 1;
  @ViewChild('modal', { static: true }) modal: ModalDirective;
  @ViewChild('skeletonLoading', { static: false, read: ElementRef })
  skeletonLoading: ElementRef;
  @ViewChild('modalConfirmBackToPage', { static: true, read: TemplateRef })
  modalConfirmBackToPage: TemplateRef<ElementRef>;
  @ViewChild('modalConfirmEmision', { static: true, read: TemplateRef })
  modalConfirmEmision: TemplateRef<ElementRef>;
  @ViewChild('modalConfirmEmisionResult', { static: true, read: TemplateRef })
  modalConfirmEmisionResult: TemplateRef<ElementRef>;
  @ViewChild('modalConfirmfalse', { static: true, read: TemplateRef })
  modalConfirmfalse: TemplateRef<ElementRef>;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly vc: ViewContainerRef,
    private readonly cargaMasivaService: CargaMasivaService,
    private readonly cargaMasivaEstadoService: CargaMasivaEstadoService,
    private readonly spinner: NgxSpinnerService
  ) {
    this.pageViewDetail = false;
  }

  dataOfParam: any = null;
  pageWithParam: boolean = false;
  idFacturaOfParam: number = null;
  amountErrors = 0;
  dataCargaMasivaEstado = null;
  pageViewDetail: boolean;
  amountPolizas = 0;
  primaTotalPoliza = 0;
  secuencia: number;
  NSKELETON = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  primaTotal = 0;
  comisionTotalBroker = 0;
  comisionTotalIntermediario = 0;
  titleOfPage = 'Carga Masiva de Estado';

  ngOnInit(): void {
    window.scrollTo(0, 0);

    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.dataOfParam = { ...params.keys, ...params };
    });
    if (this.dataOfParam.params.IdCargaMasiva) {
      this.pageWithParam = true;
      this.titleOfPage = 'Detalle de Carga Masiva de Estado';
      this.idFacturaOfParam = this.dataOfParam.params.IdCargaMasiva;
      this.pageViewDetail = true;
      this.cargaMasivaService.verDetalleTrama(this.idFacturaOfParam).subscribe(
        (res: any) => {
          this.skeletonLoading.nativeElement.hidden = true;
          this.dataCargaMasivaEstado = res;
          this.dataCargaMasivaEstado.cargaMasivaModelGroup.forEach((e: any) => {
            this.comisionTotalBroker += Number.parseFloat(
              e.montoComisionBroker.toString()
            );
            this.comisionTotalIntermediario += Number.parseFloat(
              e.montoComisionIntermediario.toString()
            );
            this.primaTotal += Number.parseFloat(e.prima.toString());
          });
        },
        (err: any) => {
          this.skeletonLoading.nativeElement.hidden = true;
          console.log(err);
        }
      );
    } else {
      this.pageWithParam = false;
      this.idFacturaOfParam = null;
      this.titleOfPage = 'Carga Masiva del Estado';
      this.pageViewDetail = false;
      this.dataCargaMasivaEstado =
        this.cargaMasivaEstadoService.getDataCargaMasivaEstado();
      
      if (this.dataCargaMasivaEstado) {
        this.secuencia = this.dataCargaMasivaEstado.secuencia;
        if (
          this.dataCargaMasivaEstado.cargaMasivaModelError == null &&
          this.dataCargaMasivaEstado.cargaMasivaModelGroup[0].cantidad !== null
        ) {
          Object.values(this.dataCargaMasivaEstado.cargaMasivaModelGroup).forEach(
            (e: any) => {
              this.primaTotalPoliza += Number.parseInt(e.prima.toString());
              this.amountPolizas += e.cantidad;
            }
          );
        }
        if (this.dataCargaMasivaEstado.cargaMasivaModelError !== null) {
          this.amountErrors =
            this.dataCargaMasivaEstado.cargaMasivaModelError.length;
          this.EmisionSoatPageFocus = 3;
        } else {
          this.dataCargaMasivaEstado.cargaMasivaModelGroup.forEach((e: any) => {
            this.comisionTotalBroker += Number.parseFloat(
              e.montoComisionBroker.toString()
            );
            this.comisionTotalIntermediario += Number.parseFloat(
              e.montoComisionIntermediario.toString()
            );
            this.primaTotal += Number.parseFloat(e.prima.toString());
          });
        }
      } else {
        this.router.navigate(['/backoffice/transaccion/CargaMasiva/estado']);
      }
    }

    window.onbeforeunload = function (e: any) {
      const dialogText = '¿Estás seguro que desea salir de esta página?';
      e.returnValue = dialogText;
      return dialogText;
    };
  }
  ngOnDestroy(): void {
    window.onbeforeunload = null;
  }
  GoResumen(): void {
    this.EmisionSoatPageFocus = 1;
  }
  GoEmisionSoat(): void {
    this.EmisionSoatPageFocus = 2;
  }
  GoErrores(): void {
    this.EmisionSoatPageFocus = 3;
  }
  showModal(): void {
    this.modal.show();
  }

  backToPage(): void {
    this.router.navigate(['/backoffice/transaccion/CargaMasiva/estado']);
  }

  showModalBackToPage(): void {
    if (this.pageViewDetail === true) {
      this.router.navigate(['/backoffice/transaccion/CargaMasiva/estado']);
    } else {
      this.vc.createEmbeddedView(this.modalConfirmBackToPage);
    }
  }

  showModalConfirmEmision(): void {
    this.hideModal();
    this.vc.createEmbeddedView(this.modalConfirmEmision);
  }

  hideModal(): void {
    this.vc.clear();
  }

  hideModalBackToPage(): void {
    this.vc.clear();
  }

  hideModalEmisionLoad(): void {
    this.hideModal();
    this.router.navigate(['/backoffice/transaccion/CargaMasiva/estado']);
  }

  emisionStateLoad() {
    this.hideModal();
    this.spinner.show();

    this.cargaMasivaEstadoService.emisionLoad(this.secuencia).subscribe(
      (res: any) => {
        if (res.success) {
          this.spinner.hide();
          this.cargaMasivaEstadoService.setDataCargaMasivaEstado(null)
          this.vc.createEmbeddedView(this.modalConfirmEmisionResult);
        } else {
          this.spinner.hide();
          this.hideModal();
          this.vc.createEmbeddedView(this.modalConfirmfalse);
        }
      },
      (err: any) => {
        this.spinner.hide();
        this.hideModal();
        this.vc.createEmbeddedView(this.modalConfirmfalse);
      }
    );
  }

  exportarExcelCotizacion(): void {
    this.spinner.show();
    this.cargaMasivaService
      .exportarExcelCargaMasiva(this.dataCargaMasivaEstado?.secuencia)
      .subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res.success === true) {
            this.downloadArchivo(res);
          }
        },
        (err: any) => {
          this.spinner.hide();
          console.log(err);
        }
      );
  }
  downloadArchivo(response: any): void {
    if (response) {
      let linkSource = 'data:application/pdf;base64,';
      linkSource += response.archivo;
      const a = document.createElement('a');
      a.setAttribute('href', linkSource);
      a.setAttribute('download', response.nombre);
      a.setAttribute('target', '_blank');
      a.setAttribute('style', 'display:none;');
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }
}
