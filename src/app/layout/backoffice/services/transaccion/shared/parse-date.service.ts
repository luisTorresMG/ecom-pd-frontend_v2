import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ParseDateService {
  private date: any;
  constructor() {
    this.date = {
      Jan: '01',
      Feb: '02',
      Mar: '03',
      Apr: '04',
      May: '05',
      Jun: '06',
      Jul: '07',
      Aug: '08',
      Sep: '09',
      Oct: '10',
      Nov: '11',
      Dec: '12',
    };
  }
  parseDate(value: string): string {
    value = value.substring(4, 15);
    const dateBeg = this.date[value.substring(0, 3)];
    value = value.substring(4, value.length);
    value = `${dateBeg} ${value}`;
    value = value.replace(' ', '-');
    value = value.replace(' ', '-');
    const dia = value.substring(3, 5);
    const mes = value.substring(0, 2);
    const anio = value.substring(6, value.length);
    return `${anio}-${mes}-${dia}`;
  }
}
