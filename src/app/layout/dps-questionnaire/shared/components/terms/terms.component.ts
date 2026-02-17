import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit {
  @Output() close: EventEmitter<boolean>;

  constructor() {
    this.close = new EventEmitter<boolean>();
  }

  ngOnInit() {
  }

  closeModal(): void {
    this.close.emit(true);
  }
}
