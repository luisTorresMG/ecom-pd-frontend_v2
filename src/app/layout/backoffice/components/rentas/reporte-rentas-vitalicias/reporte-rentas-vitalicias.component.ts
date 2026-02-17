import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConfig } from '../../../../../app.config';
import { RentasService } from '../../../services/rentas/rentas.service';
import * as FileSaver from 'file-saver';
import { base64ToArrayBuffer } from '../../../../../shared/helpers/utils';

@Component({
  selector: 'app-reporte-rentas-vitalicias',
  templateUrl: './reporte-rentas-vitalicias.component.html',
  styleUrls: ['./reporte-rentas-vitalicias.component.css'],
})
export class ReporteRentasVitaliciasComponent implements OnInit {
  bsConfig: Partial<BsDatepickerConfig>;
  form: FormGroup;
  urlApi: string;
  fecha: Date = new Date();
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 1));
  bsValueFin: Date = new Date();
  @ViewChild('modal', { static: true }) modal: ModalDirective;
  constructor(
    private readonly _builder: FormBuilder,
    private readonly _spinner: NgxSpinnerService,
    private readonly _RentasService: RentasService
  ) {
    this.urlApi = AppConfig.BACKOFFICE_API;
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
      Date.parse(this.f['fechaFin'].value) <
      Date.parse(this.f['fechaInicio'].value)
    ) {
      this.modal.show();
      this.MENSAJE =
        'El rango de fecha inicial de búsqueda no puede ser menor al rango de fecha final.';
    } else {
      const request = {
        // tslint:disable-next-line:max-line-length
        url:
          'https://servicios.protectasecurity.pe/backoffice/Rentas/Core/reportProductionRRVV?P_DRANGESTART=' +
          moment(this.f['fechaInicio'].value).format('YYYY-MM-DD') +
          '&P_DRANGEEND=' +
          moment(this.f['fechaFin'].value).format('YYYY-MM-DD') +
          '&P_NPOLICY=' +
          '&P_NNUMPOINT=',
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
