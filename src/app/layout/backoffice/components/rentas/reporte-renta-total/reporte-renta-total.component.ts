import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { base64ToArrayBuffer } from '../../../../../shared/helpers/utils';
import { RentasService } from '../../../services/rentas/rentas.service';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-reporte-renta-total',
  templateUrl: './reporte-renta-total.component.html',
  styleUrls: ['./reporte-renta-total.component.css'],
})
export class ReporteRentaTotalComponent implements OnInit {
  bsConfig: Partial<BsDatepickerConfig>;
  form: FormGroup;
  fecha: Date = new Date();
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 1));
  bsValueFin: Date = new Date();
  @ViewChild('modal', { static: true }) modal: ModalDirective;
  constructor(
    private readonly _builder: FormBuilder,
    private readonly _spinner: NgxSpinnerService,
    private readonly _RentasService: RentasService
  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
      }
    );
    this.form = _builder.group({
      fechaInicio: [this.bsValueIni, Validators.required],
      fechaFin: [this.bsValueFin, Validators.required],
    });
  }

  downloadURL: any;
  MENSAJE: any;

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.f['fechaInicio'].valueChanges.subscribe((val) => {
      if (val) {
        moment(this.f['fechaInicio'].value).format('DD/MM/YYYY');
      }
    });
  }

  limpiar() {
    this.form.reset();
  }

  exportar() {
    if (
      Date.parse(this.f['fechaInicio'].value) >
      Date.parse(this.f['fechaFin'].value)
    ) {
      this.MENSAJE =
        'El rango de fecha inicial de búsqueda no puede ser menor al rango de fecha final.';
      this.modal.show();
    } else {
      const startDate = moment(this.f['fechaInicio'].value).format(
        'YYYY-MM-DD'
      );
      const endDate = moment(this.f['fechaFin'].value).format('YYYY-MM-DD');
      const request = {
        // tslint:disable-next-line:max-line-length
        url: `https://servicios.protectasecurity.pe/backoffice/Rentas/Core/reportProductionRT?P_DRANGESTART=${startDate}&P_DRANGEEND=${endDate}&P_NPOLICY=&P_NNUMPOINT=`,
      };
      this._spinner.show();
      this._RentasService
        .exportarReporte(request)
        .subscribe((response: { success: boolean; archivo: string }) => {
          this.downloadArchivo(response);
          this._spinner.hide();
        });
    }
  }

  downloadArchivo(response) {
    if (response) {
      const arrBuffer = base64ToArrayBuffer(response.archivo);
      const data: Blob = new Blob([arrBuffer], {
        type: 'application/pdf',
      });
      FileSaver.saveAs(data, 'reporte.xls');
    }
  }

  ocultarModal() {
    this.modal.hide();
  }
}
