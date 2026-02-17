import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Vidaley } from '../../shared/models/vidaley';

@Component({
  selector: 'app-insurance-types',
  templateUrl: './insurance-types.component.html',
  styleUrls: ['./insurance-types.component.css'],
})
export class InsuranceTypesComponent implements OnInit {
  @Input()
  user: Vidaley;

  @Output()
  insuranceChange = new EventEmitter();

  insuranceType = 0;

  constructor() { }

  ngOnInit() {
    this.insuranceType = 2; // this.user.totalWorkers === 1 ? 2 : 0;
    this.typeChange(2);
  }

  typeChange(val) {
    this.insuranceType = val;
    this.insuranceChange.emit(this.insuranceType);
  }
}
