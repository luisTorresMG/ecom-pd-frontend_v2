import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ViewContainerRef,
  TemplateRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { IOtp, IOtpResult } from '../../interfaces/otp.interface';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'protecta-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.sass'],
})
export class OtpComponent implements OnInit, AfterViewInit {
  @Input() data: IOtp;
  @Output() result: EventEmitter<IOtpResult> = new EventEmitter<IOtpResult>();
  @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('modalMethods', { static: true, read: TemplateRef })
  modalMethods: TemplateRef<any>;

  @ViewChild('modalBiometric', { static: true, read: TemplateRef })
  modalBiometric: TemplateRef<any>;

  @ViewChild('modalOtp', { static: true, read: TemplateRef })
  modalOtp: TemplateRef<any>;

  constructor(private readonly viewContainerRef: ViewContainerRef) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.data.methods?.length == 1) {
        this.selectMethod(this.data.methods[0]);
        return;
      }

      this.viewContainerRef.createEmbeddedView(this.modalMethods);
    });
  }

  selectMethod(value: number) {
    this.viewContainerRef.clear();

    switch (value) {
      case 0:
        this.viewContainerRef.createEmbeddedView(this.modalMethods);
        break;
      case 1:
        this.viewContainerRef.createEmbeddedView(this.modalBiometric);
        break;
      case 2:
      case 3:
        this.data.selectedMethod = value;
        this.viewContainerRef.createEmbeddedView(this.modalOtp);
        break;
    }
  }

  resultEvent(e: IOtpResult) {
    this.result.emit(e);
  }

  closeModal(e: boolean): void {
    if (!e) {
      this.selectMethod(0);
      return;
    }
    this.close.emit(e);
  }

  showMethod(type: number): boolean {
    return this.data?.methods?.includes(type);
  }
}
