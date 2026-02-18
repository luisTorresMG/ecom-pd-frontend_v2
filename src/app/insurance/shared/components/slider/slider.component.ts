import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnInit {
  @Input() data: Array<any> = [];
  @Input() isProducts: boolean = false;
  @Output() event = new EventEmitter<any>();

  @ViewChild('contentSlider', { static: true }) contentSlider: ElementRef;

  limitLeft: boolean = false;
  limitRight: boolean = false;

  constructor() {}

  ngOnInit() {}

  scrollPrevious() {
    this.contentSlider.nativeElement.scrollLeft -= 220;
    this.validateContainer();
  }

  scrollNext() {
    this.contentSlider.nativeElement.scrollLeft += 220;
    this.validateContainer();
  }

  selectItem(data: any) {
    this.event.emit(data);
  }

  validateContainer() {
    if (this.contentSlider.nativeElement.scrollLeft === 0) {
      this.limitLeft = true; // Si el scroll está en el extremo izquierdo
      this.limitRight = false;
      return;
    }

    if (
      this.contentSlider.nativeElement.scrollLeft +
        this.contentSlider.nativeElement.clientWidth +
        1 >=
      this.contentSlider.nativeElement.scrollWidth
    ) {
      this.limitRight = true; // Si el scroll alcanza el extremo derecho
      this.limitLeft = false;
      return;
    }

    this.limitLeft = false;
    this.limitRight = false;
  }
}
