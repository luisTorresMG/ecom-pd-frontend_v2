import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormaDePagoPlanillaDto, PlanillaVentaDto } from './DTOs/planillaVenta.dto';
@Component({
  selector: 'app-planilla-venta',
  templateUrl: './planilla-venta.component.html',
  styleUrls: ['./planilla-venta.component.css']
})
export class PlanillaVentaComponent implements OnInit {

  constructor(private readonly _spinner: NgxSpinnerService) { }
  currentPage = 0;
  p = 0;
  dataPlanillaVenta: PlanillaVentaDto[] = [];
  dataFormasPagoPlanillaVenta: FormaDePagoPlanillaDto[] = [];
  nPlanilla = 0;
  totalEmitidos = 0;
  totalVendidos = 0;
  total = 0;
  ngOnInit(): void {
    window.scrollTo(0, 0);
    this._spinner.show();
    setTimeout(() => {
      for (let i = 0; i <= 28; i++) {
        const data = {
          id: 10000 + i,
          ncertificado: 10000 + i,
          canalVenta: 'CANAL DE VENTA',
          state: 'ESTADO',
          tarifaProtecta: 10000 + i,
          tarifaManual: 10000 + i,
          proforma: 10000 + i,
        };
        this.dataPlanillaVenta.push(data);
      }
      const data2 = {
        moneda: 'MONEDA',
        tipoPago: 'TIPO DE PAGO',
        banco: 'BANCO',
        cuenta: 10000,
        nOperacion: 10000,
        fecha: '03/03/2021',
        monto: 10000,
      };
      this.dataFormasPagoPlanillaVenta.push(data2);
      this._spinner.hide();
    }, 2500);
  }
  searchData() {
    this._spinner.show();
    setTimeout(() => {
      this._spinner.hide();
    }, 1000);
  }
}
