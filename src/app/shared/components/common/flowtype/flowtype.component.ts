import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FlowTypeService } from '../../../services/flowtype/flowtype.service';
import { FlowType } from '../../../models/flowtype/flowtype';

@Component({
  selector: 'app-flowtype',
  templateUrl: './flowtype.component.html',
  styleUrls: ['./flowtype.component.css']
})
export class FlowtypeComponent implements OnInit {
  @Output() evResultFlowType = new EventEmitter<number>();
  ResultSalesMode = 0;
  mensaje: string;
  ListFlowType: any[];
  flowType = new FlowType('0', '');
  constructor(private flowTypeService: FlowTypeService) { }

  ngOnInit() {
    this.flowTypeService.getPostFlowType(this.flowType)
      .subscribe(
        data => {
          this.ListFlowType = <any[]>data;
        },
        error => {
          console.log(error);
        }
      );
  }

  throwSalesMode(resultFlowType: number) {
    this.evResultFlowType.emit(resultFlowType);
  }

  onSelectFlowType(flowTypeId) {
    this.ResultSalesMode = flowTypeId;
    this.throwSalesMode(flowTypeId);
  }

}
