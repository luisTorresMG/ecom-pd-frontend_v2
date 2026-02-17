import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-show-steps',
  templateUrl: './show-steps.component.html',
  styleUrls: ['./show-steps.component.css']
})
export class ShowStepsComponent implements OnInit {
  @Input() NSTEP: number;
  DATA_STEPS: number[] = [];
  constructor() {
    this.NSTEP = 1;
    for (let i = 1; i <= 4; i++) {
      this.DATA_STEPS.push(i);
    }
  }
  ngOnInit(): void {
  }

}
