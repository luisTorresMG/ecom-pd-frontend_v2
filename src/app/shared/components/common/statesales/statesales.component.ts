import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { StateSalesService } from '../../../services/statesales/statesales.service';
import { StateSales } from '../../../models/statesales/statesales';

@Component({
  selector: 'app-statesales',
  templateUrl: './statesales.component.html',
  styleUrls: ['./statesales.component.css']
})
export class StatesalesComponent implements OnInit {
  @Output() evResultStateSales = new EventEmitter<number>();
  ResultStateSales = 0;
  mensaje: string;
  ListStateSales: any[];
  stateSales = new StateSales('0', '');
  constructor(private stateSalesService: StateSalesService) { }

  ngOnInit() {
    this.stateSalesService.getPostStateSales(this.stateSales)
      .subscribe(
        data => {
          this.ListStateSales = <any[]>data;
        },
        error => {
          console.log(error);
        }
      );
  }

  throwStateSales(resultStateSales: number) {
    this.evResultStateSales.emit(resultStateSales);
  }

  onSelectStateSales(stateSalesId) {
    this.ResultStateSales = stateSalesId;
    this.throwStateSales(stateSalesId);
  }

}
