import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StorageService } from '../../../../../layout/broker/components/quote/acc-personales/core/services/storage.service';
import { AccPersonalesService } from '../../../../../layout/broker/components/quote/acc-personales/acc-personales.service';
import { DesgravamentConstants } from '../../core/desgravament.constants';
import { SearchEndoserComponent } from '../../../../../layout/broker/modal/search-endoser/search-endoser.component';

@Component({
  standalone: false,
  selector: 'panel-info-endosatarios',
  templateUrl: './panel-info-endosatarios.component.html',
  styleUrls: ['./panel-info-endosatarios.component.css'],
})
export class PanelInfoEndosatariosComponent implements OnInit {
  @Input() detail: boolean;
  @Input() vista: any;
  @Input() endosers: any = [];
  @Output() changes: EventEmitter<any> = new EventEmitter();
  @Input() initialize: boolean;
  CONSTANTS: any = DesgravamentConstants;

  constructor(
    private modal: NgbModal,
    public storageService: StorageService,
    public accPersonalesService: AccPersonalesService
  ) {}

  ngOnInit() {
    this.endosers = this.endosers || [];
    this.changes.emit(this.endosers);
  }

  clickAdd() {
    const modalRef = this.modal.open(SearchEndoserComponent, {
      size: 'lg',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.list = this.endosers;
    modalRef.result.then((brokerData) => {
      if (brokerData) {
        this.endosers.push(brokerData);
        console.log(this.endosers);
      }
    });
  }

  clickDelete(item) {
    swal
      .fire({
        title: 'Eliminar endosatario',
        text: '¿Estás seguro que deseas eliminar este endosatario?',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        allowOutsideClick: false,
        cancelButtonText: 'Cancelar',
      })
      .then((result) => {
        if (result.value) {
          let index = this.endosers.indexOf(item);
          this.endosers.splice(index, 1);
        }
      });
  }
}
