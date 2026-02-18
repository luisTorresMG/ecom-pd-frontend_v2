import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-show-steps',
  templateUrl: './show-steps.component.html',
  styleUrls: ['./show-steps.component.css']
})
export class ShowStepsComponent implements OnInit {
  @Input() NSTEP: number;
  DATA_STEPS: number[] = [];
  disableNStep: number;
  constructor() {
    this.NSTEP = 1;
    const session = JSON.parse(sessionStorage.getItem('_producto_selecionado'));
    if (+session['productId'] == 6) {
      console.log('disable step');
      this.disableNStep = 4;
    }
    for (let i = 1; i <= 4; i++) {
      this.DATA_STEPS.push(i);
    }
  }
  ngOnInit(): void {
  }

}
