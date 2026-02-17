import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SalesModeService } from '../../../services/salesmode/salesmode.service';
import { SalesMode } from '../../../models/salesmode/salesmode';

@Component({
  selector: 'app-salesmode',
  templateUrl: './salesmode.component.html',
  styleUrls: ['./salesmode.component.css']
})
export class SalesmodeComponent implements OnInit {
  @Output() evResultSalesMode = new EventEmitter<number>();
  ResultSalesMode = 0;
  mensaje: string;
  ListSalesMode: any[];
  salesMode = new SalesMode('0', '');
  constructor(private salesModeService: SalesModeService) { }

  ngOnInit() {
    this.salesModeService.getPostSalesMode(this.salesMode)
      .subscribe(
        data => {
          this.ListSalesMode = <any[]>data;
        },
        error => {
          console.log(error);
        }
      );
  }

  throwSalesMode(resultSalesMode: number) {
    this.evResultSalesMode.emit(resultSalesMode);
  }

  onSelectSalesMode(salesModeId) {
    this.ResultSalesMode = salesModeId;
    this.throwSalesMode(salesModeId);
  }


}
