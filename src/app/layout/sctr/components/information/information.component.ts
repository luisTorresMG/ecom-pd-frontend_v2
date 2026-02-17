import { Component, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-information-sctr',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css'],
})
export class InformationSctrComponent {

  @Output() closeaction = new EventEmitter();

  constructor(

  ) { }

  onClose() {
    this.closeaction.emit();
  }

}
