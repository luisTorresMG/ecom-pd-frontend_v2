import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  public bVisible = false;
  public bVisibleAnimate = false;
  @Input() close = true;
  @Input() extraCss = false;
  @Input() efectivoCss = false;
  @Input() whiteOverlay = false;
  @Input() mobileDisplay = false;
  @Input() mobileVehiculo = false;
  constructor() { }

  ngOnInit() { }

  public show() {
    document.body.classList.add('modal-open');

    this.bVisible = true;
    setTimeout(() => this.bVisibleAnimate = true, 100);
  }

  public hide() {
    document.body.classList.remove('modal-open');

    this.bVisibleAnimate = false;
    setTimeout(() => this.bVisible = false, 300);
  }

}
