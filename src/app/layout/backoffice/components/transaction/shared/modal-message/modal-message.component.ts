import { Component, Input, OnInit, OnChanges, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-modal-message',
  templateUrl: './modal-message.component.html',
  styleUrls: ['./modal-message.component.css']
})
export class ModalMessageComponent implements OnInit, OnChanges {

  constructor() {
  }
  @Input() message: string;
  @Input() isShow: boolean;
  @Input() rndNumber: string;
  @ViewChild('modalMessage', { static: true }) modalMessage: ModalDirective;
  ngOnInit(): void {
  }
  ngOnChanges(): void {
    if (this.isShow === true) {
      this.modalMessage.show();
      this.isShow = null;
    }
  }
  hideModalMessage() {
    this.modalMessage.hide();
  }
}
