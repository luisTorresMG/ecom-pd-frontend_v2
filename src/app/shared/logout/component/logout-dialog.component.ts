import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthenticationService } from '../../../layout/broker/services/authentication.service';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    styleUrls: ['./logout-dialog.component.css'],
    template: `
  <div class="modal"
    role="dialog"
    data-backdrop="static"
    data-keyboard="false"
    tabindex="-1"
    [ngClass]="{ 'in': true }"
    [ngStyle]="{ 'display': 'block', 'opacity': 1 }">

  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-body modal-body-font">
        Su sesi&oacute;n ha expirado, por favor vuelva a iniciar sesi&oacute;n.
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-orange" (click)="cerrar()">Ok</button>
      </div>
    </div>
  </div>
</div>
`
})
export class LogoutDialogComponent implements OnInit {
    constructor(
        public activeModal: NgbActiveModal,
        public changeRef: ChangeDetectorRef,
        public authenticationService: AuthenticationService,
        public router: Router
    ) { }

    ngOnInit() { }

    cerrar() {
        this.authenticationService.removeSession();
        this.activeModal.close(true);

        setTimeout(() => {
            this.router.navigate(['/extranet/login']);
        }, 500);
    }
}
