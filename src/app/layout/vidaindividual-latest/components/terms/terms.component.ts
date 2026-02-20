import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css']
})
export class TermsComponent implements OnInit {

  @Output() closeaction = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onClose() {
    this.closeaction.emit();
  }
}
