import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  totalItemsValue = new BehaviorSubject(this.getValueTotal);
  constructor() { }
  set setValueTotal(val) {
    this.totalItemsValue.next(val);
    sessionStorage.setItem('countProductsCar', val);
  }
  get getValueTotal() {
    return sessionStorage.getItem('countProductsCar');
  }
}
