import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-terms-ap',
  templateUrl: './terms-ap.component.html',
  styleUrls: ['./terms-ap.component.scss']
})
export class TermsApComponent implements OnInit {

  @Output() close: EventEmitter<boolean>;

  constructor() {
    this.close = new EventEmitter<boolean>();
  }

  ngOnInit(): void {
  }

  closeModal(): void {
    this.close.emit(true);
  }

}
