import { Component, OnInit } from '@angular/core';
import { DesgravamenService } from '../../shared/services/desgravamen.service';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(
    private readonly _desgravamenService: DesgravamenService
  ) { }

  ngOnInit(): void {
    this.validityStep();
  }

  validityStep(): void {
    if (!this._desgravamenService.step) {
      this._desgravamenService.step = 1;
    }
  }
}
