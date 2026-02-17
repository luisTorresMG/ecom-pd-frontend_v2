import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AccPersonalesConstants } from '../../../../../layout/broker/components/quote/acc-personales/core/constants/acc-personales.constants';
import { FileService } from '../../../../../layout/broker/components/quote/acc-personales/core/services/file.service';
import { FilePickerComponent } from '../../../../../layout/broker/modal/file-picker/file-picker.component';
import { CobranzasService } from '../../../../../layout/broker/services/cobranzas/cobranzas.service';
import { StorageService } from '../../../../../layout/broker/components/quote/acc-personales/core/services/storage.service';
import { AccPersonalesService } from '../../../../../layout/broker/components/quote/acc-personales/acc-personales.service';
import { DesgravamentConstants } from '../../core/desgravament.constants';
import { CommonMethods } from '../../../../../layout/broker/components/common-methods';
import { QuotationService } from '../../../../../layout/broker/services/quotation/quotation.service';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'panel-dps',
  templateUrl: './panel-dps.component.html',
  styleUrls: ['./panel-dps.component.css']
})
export class PanelDpsComponent implements OnInit {

  @Input() detail: boolean;

  @Input() cotizacion: any;

  @Input() isLoading: boolean;
  @Output() isLoadingChange: EventEmitter<any> = new EventEmitter();

  @Output() cambiaDatosPoliza: EventEmitter<any> = new EventEmitter();

  CONSTANTS: any = DesgravamentConstants;

  filtroEstados: any;

  constructor(
    private quotationService: QuotationService,
    private ngbModal: NgbModal,
    public accPersonalesService: AccPersonalesService,
    public storageService: StorageService,
    private cobranzasService: CobranzasService,

    public fileService: FileService) {
      this.CONSTANTS.RAMO = CommonMethods.branchXproduct(
        JSON.parse(localStorage.getItem('codProducto'))['productId']
      );
     }

  ngOnInit() {
    this.verificarFiltrosEstados();
    // console.log('cotizaixon', this.cotizacion)
  }

  openFilePicker(fileList: string[]) {
    if (fileList != null && fileList.length > 0) {
      const modalRef = this.ngbModal.open(FilePickerComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
      modalRef.componentInstance.fileList = fileList;
      modalRef.componentInstance.ngbModalRef = modalRef;
    } else {
      swal.fire('Información', 'La lista de archivos está vacía.', 'warning')
    }

  }
  getTramaFile(item: any): Promise<any> {
    this.isLoadingChange.emit(true);
    const params: any = {};
    params.idMovimiento = item.linea;
    params.idCotizacion = this.cotizacion.numeroCotizacion;
    params.documentCode = 59;
    return this.cobranzasService.getTramaFile(params).toPromise().then(
      res => {
        this.isLoadingChange.emit(false);
        if (res.indEECC === 0) {
          const nameFile: string = item.desMov + '_' + this.cotizacion.numeroCotizacion + '.xlsx';
          this.fileService.downloadFromBase64(res.path, nameFile, 'application/vnd.ms-excel');
        }
      },
      err => {
        this.isLoadingChange.emit(false);
        swal.fire('Información', 'Error inesperado, por favor contáctese con soporte.', 'error');
      }
    );
  }

  verificarFiltrosEstados() {
    if (this.CONSTANTS.PERFIL.TECNICA == this.storageService.user.profileId) {
      this.filtroEstados = [
        this.CONSTANTS.ESTADO.APROBADO_TECNICA,
        this.CONSTANTS.ESTADO.NO_PROCEDE
      ];
    } else {
      this.filtroEstados = [
        this.CONSTANTS.ESTADO.APROBADO,
        this.CONSTANTS.ESTADO.NO_PROCEDE
      ];
    }
  }

  onClear(){

    if (this.cotizacion.poliza.dps.presion.resp == "NO"){
      this.cotizacion.poliza.dps.presion.resultado = "IGNORA";
    }
    if (this.cotizacion.cotizador.calculado && !this.cotizacion.cotizador.recalculo){
      this.cotizacion.cotizador.recalculo = true;
      setTimeout(() => {
        this.cambiaDatosPoliza.emit();
      }, 100);
    }
    
    //this.cotizacion.isLoadingChange.emit(false);
/*
    this.cotizacion.cotizador.changeContratante = true;
    this.cotizacion.cotizador.changeDatosPoliza = false;
      */
     
  
  }
}
