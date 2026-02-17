import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LogoutDialogComponent } from '../component/logout-dialog.component';

@Injectable()
export class LogoutService {

  constructor(private modalService: NgbModal) { }

  public show() {
    const modalRef = this.modalService.open(LogoutDialogComponent);

    modalRef.componentInstance.changeRef.markForCheck();

    return modalRef.result;
  }
}
