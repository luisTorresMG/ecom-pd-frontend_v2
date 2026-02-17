import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.css']
})
export class Step2Component implements OnInit {
  private days: number[];
  private months: {
    val: number,
    desc: string
  }[];
  private years: number[];
  constructor() {
    this.days = [];
    this.months = [];
    this.years = [];
    for (let i = 1; i <= 31; i++) {
      this.days.push(i);
    }
    this.months = [
      {
        val: 1,
        desc: 'Enero'
      },
      {
        val: 2,
        desc: 'Febrero'
      },
      {
        val: 3,
        desc: 'Marzo'
      },
      {
        val: 4,
        desc: 'Abril'
      },
      {
        val: 5,
        desc: 'Mayo'
      },
      {
        val: 6,
        desc: 'Junio'
      },
      {
        val: 7,
        desc: 'Julio'
      },
      {
        val: 8,
        desc: 'Agosto'
      },
      {
        val: 9,
        desc: 'Septiembre'
      },
      {
        val: 10,
        desc: 'Octubre'
      },
      {
        val: 11,
        desc: 'Noviembre'
      },
      {
        val: 12,
        desc: 'Diciembre'
      }
    ];
    for (let i = new Date().getFullYear() - 18; i >= 1950; i--) {
      this.years.push(i);
    }
  }
  // TODO: GETTERS/SETTERS
  // *DIA - MES - AÑO
  //#region
  get dias(): number[] {
    return this.days;
  }
  get meses(): object[] {
    return this.months;
  }
  get anios(): number[] {
    return this.years;
  }
  //#endregion

  ngOnInit(): void {
  }

}
