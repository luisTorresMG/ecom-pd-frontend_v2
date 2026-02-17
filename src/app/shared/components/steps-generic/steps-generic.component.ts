import { Component, Input, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'app-steps-generic',
  templateUrl: './steps-generic.component.html',
  styleUrls: ['./steps-generic.component.css']
})
export class StepsGenericComponent implements OnInit, OnChanges {
  @Input() NSTEP: number;
  @Input() NSTEPS: number;
  DATA_STEPS: number[];
  constructor() {
    this.NSTEP = 1;
    this.DATA_STEPS = [];
    for (let i = 1; i <= this.NSTEPS; i++) {
      this.DATA_STEPS.push(i);
    }
  }
  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.DATA_STEPS = [];
    for (let i = 1; i <= this.NSTEPS; i++) {
      this.DATA_STEPS.push(i);
    }
  }

}
