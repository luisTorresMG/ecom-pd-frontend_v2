import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ActivatedRoute } from '@angular/router';
import * as SDto from '../../../../services/transaccion/carga-masiva/DTOs/carga-masiva.dto';
import { Router } from '@angular/router';
import { CargaMasivaService } from '../../../../services/transaccion/carga-masiva/carga-masiva.service';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-carga-masiva-upload-file',
  templateUrl: './CargaMasivaUploadFile.component.html',
  styleUrls: ['./CargaMasivaUploadFile.component.css'],
})
export class CargaMasivaUploadFileComponent implements OnInit, OnDestroy {
  EmisionSoatPageFocus = 1;
  @ViewChild('modal', { static: true }) modal: ModalDirective;
  @ViewChild('modalConfirmBackToPage', { static: true })
  modalConfirmBackToPage: ModalDirective;
  @ViewChild('modalCargaMasivaEmitida', { static: true })
  modalCargaMasivaEmitida: ModalDirective;
  constructor(
    private readonly _ActivatedRoute: ActivatedRoute,
    private readonly _Router: Router,
    private readonly _CargaMasivaService: CargaMasivaService,
    private readonly _spinner: NgxSpinnerService
  ) {
    this.PAGE_IS_VIEW_DETALLE = false;
  }
  @ViewChild('skeletonLoading', { static: false, read: ElementRef })
  skeletonLoading: ElementRef;
  dataOfParam: any = null;
  pageWithParam = false;
  idFacturaOfParam: number = null;
  titleOfPage = 'Carga Masiva de Pólizas';
  N_ERRORES = 0;
  DATA_CARGA_MASIVA: SDto.DataCargaMasiva | null = null;
  PAGE_IS_VIEW_DETALLE: boolean;
  LENGTH_POLIZAS = 0;
  PRIMA_TOTAL_POLIZA = 0;
  SECUENCUA: number;
  NSKELETON = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  PRIMA_TOTAL = 0;
  COMISION_TOTAL_BROKER = 0;
  COMISION_TOTAL_INTERMEDIARIO = 0;
  ngOnInit(): void {
    window.scrollTo(0, 0);
    this._ActivatedRoute.queryParamMap.subscribe((params) => {
      this.dataOfParam = { ...params.keys, ...params };
    });
    if (this.dataOfParam.params.IdCargaMasiva) {
      this.pageWithParam = true;
      this.titleOfPage = 'Detalle de Carga Masiva';
      this.idFacturaOfParam = this.dataOfParam.params.IdCargaMasiva;
      this.PAGE_IS_VIEW_DETALLE = true;
      this._CargaMasivaService.verDetalleTrama(this.idFacturaOfParam).subscribe(
        (res: any) => {
          this.skeletonLoading.nativeElement.hidden = true;
          this.DATA_CARGA_MASIVA = res;
          this.DATA_CARGA_MASIVA.cargaMasivaModelGroup.forEach((e) => {
            this.COMISION_TOTAL_BROKER += Number.parseFloat(
              e.montoComisionBroker.toString()
            );
            this.COMISION_TOTAL_INTERMEDIARIO += Number.parseFloat(
              e.montoComisionIntermediario.toString()
            );
            this.PRIMA_TOTAL += Number.parseFloat(e.prima.toString());
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
      this.titleOfPage = 'Carga Masiva de Pólizas';
      this.PAGE_IS_VIEW_DETALLE = false;
      this.DATA_CARGA_MASIVA = this._CargaMasivaService.getDataCargaMasiva();
      
      if (this.DATA_CARGA_MASIVA) {

        this.SECUENCUA = this.DATA_CARGA_MASIVA.secuencia;

        if (
            this.DATA_CARGA_MASIVA.cargaMasivaModelError == null &&
            this.DATA_CARGA_MASIVA.cargaMasivaModelGroup[0].cantidad !== null
          ) {
            Object.values(this.DATA_CARGA_MASIVA.cargaMasivaModelGroup).forEach(
              (e) => {
                this.PRIMA_TOTAL_POLIZA += Number.parseInt(e.prima.toString());
                this.LENGTH_POLIZAS += e.cantidad;
              }
            );
          }
          if (this.DATA_CARGA_MASIVA.cargaMasivaModelError !== null) {
            this.N_ERRORES = this.DATA_CARGA_MASIVA.cargaMasivaModelError.length;
            this.EmisionSoatPageFocus = 3;
          } else {
            this.DATA_CARGA_MASIVA.cargaMasivaModelGroup.forEach((e) => {
              this.COMISION_TOTAL_BROKER += Number.parseFloat(
                e.montoComisionBroker.toString()
              );
              this.COMISION_TOTAL_INTERMEDIARIO += Number.parseFloat(
                e.montoComisionIntermediario.toString()
              );
              this.PRIMA_TOTAL += Number.parseFloat(e.prima.toString());
            });
          }
      } else {
        this._Router.navigate(['/backoffice/transaccion/CargaMasiva']);
      }
    }

    window.onbeforeunload = function (e) {
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
  closeModal(): void {
    this.modal.hide();
  }
  backToPage(): void {
    this._Router.navigate(['/backoffice/transaccion/CargaMasiva']);
  }
  showModalBackToPage(): void {
    if (this.PAGE_IS_VIEW_DETALLE === true) {
      this._Router.navigate(['/backoffice/transaccion/CargaMasiva']);
    } else {
      this.modalConfirmBackToPage.show();
    }
  }
  hideModalBackToPage(): void {
    this.modalConfirmBackToPage.hide();
  }
  emitirCargaMasiva() {
    this._spinner.show();
    this._CargaMasivaService.emitirCargaMasiva(this.SECUENCUA).subscribe(
      (res: any) => {
        if (res.success) {
          this._spinner.hide();
          this._CargaMasivaService.setDataCargaMasiva(null);
          this.modal.hide();
          this.modalCargaMasivaEmitida.show();
        }
      },
      (err: any) => {
        this.modal.hide();
        this._spinner.hide();
        console.log(err);
      }
    );
  }
  hideModalEmitirCargaMasiva(): void {
    this.modalCargaMasivaEmitida.hide();
    this._Router.navigate(['/backoffice/transaccion/CargaMasiva']);
  }
  exportarExcelCotizacion(): void {
    this._spinner.show();
    this._CargaMasivaService
      .exportarExcelCargaMasiva(this.DATA_CARGA_MASIVA?.secuencia)
      .subscribe(
        (res: any) => {
          this._spinner.hide();
          if (res.success === true) {
            this.downloadArchivo(res);
          }
        },
        (err: any) => {
          this._spinner.hide();
          console.log(err);
        }
      );
  }
  downloadArchivo(response) {
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
