import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'index-steps',
  templateUrl: './index-steps.component.html',
  styleUrls: ['./index-steps.component.scss']
})
export class IndexStepsComponent implements OnInit {

  @Input() NSTEP: number;
  @Output() valorChange: EventEmitter<number> = new EventEmitter<number>();

  
  DATA_STEPS: number[] = [];
  @Input() DATA_STEPS_OBJECT: any;
  disableNStep: number;
  title_Step: Array<any>;
  constructor() {
    this.NSTEP = 1;

    // for (let i = 1; i <= 2; i++) {

    // this.DATA_STEPS_OBJECT =
    //   [{
    //     step_index: 1,
    //     tittle: "Datos del Contratante/Asegurado"
    //   },
    //   {
    //     step_index: 2,
    //     tittle: "Nueva Cotización"
    //   }
    //   ]
    // this.DATA_STEPS.push(i);
  }
  // }
  ngOnInit(): void {  }

  // onValorChange(newValue: number) {
  //   this.NSTEP = newValue;
  //   this.valorChange.emit(newValue);
  // }


  // ChangeSelected(value) {
  //   console.log("Selecciono el elemento", value);
  //   this.NSTEP=value;
  // }
}