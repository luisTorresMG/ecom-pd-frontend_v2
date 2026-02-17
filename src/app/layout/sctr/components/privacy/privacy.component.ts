import { Component, Output, EventEmitter } from '@angular/core';
import { Vidaley } from '../../shared/models/vidaley';


@Component({
  selector: 'app-privacyvidaley',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.css'],
})
export class PrivacyVidaLeyComponent {

  @Output() closeaction = new EventEmitter();

  constructor(

  ) { }

  onClose() {
    this.closeaction.emit();
  }

}
