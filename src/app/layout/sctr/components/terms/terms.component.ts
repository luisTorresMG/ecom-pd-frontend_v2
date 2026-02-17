import { Component, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-termsvidaley',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css'],
})
export class TermsVidaLeyComponent {

  @Output() closeaction = new EventEmitter();

  constructor(

  ) { }

  onClose() {
    this.closeaction.emit();
  }

}
