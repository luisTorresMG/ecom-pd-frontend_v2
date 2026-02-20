import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

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
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'panel-dps-estado',
  templateUrl: './panel-dps-estado.component.html',
  styleUrls: ['./panel-dps-estado.component.css'],
})
export class PanelDpsEstadoComponent implements OnInit {
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
    private router: Router,

    public fileService: FileService
  ) {
    this.CONSTANTS.RAMO = CommonMethods.branchXproduct(
      JSON.parse(localStorage.getItem('codProducto'))['productId']
    );
  }

  ngOnInit() {
    console.log('cotizaixon', this.cotizacion);
  }
  ReenviarDPS() {
    const params = {
      idRamo: this.CONSTANTS.RAMO,
      idProducto: this.cotizacion.poliza.tipoPerfil.COD_PRODUCT,
      externalId: this.cotizacion.numeroCotizacion,
      idTipoDocumento: this.cotizacion.contratante.tipoDocumento.Id,
      numeroDocumento: this.cotizacion.contratante.numDocumento,
      nombre: this.cotizacion.contratante.nombres,
      apellidoPaterno: this.cotizacion.contratante.apellidoPaterno,
      apellidoMaterno: this.cotizacion.contratante.apellidoMaterno,
      correo: this.cotizacion.contratante.email,
      fechaNacimiento: this.cotizacion.contratante.fnacimiento,
      idUsuario: this.storageService.userId,
    };

    this.isLoadingChange.emit(true);

    this.accPersonalesService.reenviarDPS(params).subscribe(
      (res) => {
        /*
        this.trama = Object.assign(this.trama, res);
        this.tramaChange.emit(this.trama);
        this.cotizador.calculado = true;

        this.isLoadingChange.emit(false);
*/
        swal
          .fire({
            title: 'Información',
            text: res,
            icon: 'success',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
          })
          .then((result) => {
            if (result.value) {
              this.router.navigate(['/extranet/desgravamen/consulta-poliza']);
            }
          });
      },
      (error) => {
        this.isLoadingChange.emit(false);
      }
    );
  }
}
