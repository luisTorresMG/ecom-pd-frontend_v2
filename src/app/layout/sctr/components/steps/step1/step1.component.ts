import { Component, OnInit, ViewChild } from '@angular/core';
import { buildUserFromJSON, Vidaley } from '../../../shared/models/vidaley';
import { VehiculoService } from '../../../../client/shared/services/vehiculo.service';
import { catchError, map } from 'rxjs/operators';
import { TokenService } from '../../../../soat/shared/services/token.service';
import { EmisionService } from '../../../../client/shared/services/emision.service';
import { Contratante } from '../../../../client/shared/models/contratante.model';
import { SessionService } from '../../../../soat/shared/services/session.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { isNullOrUndefined } from 'util';
import { GoogleTagManagerService } from '../../../shared/services/google-tag-manager.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { VidaleyService } from '../../../../sctr/shared/services/vidaley.service';

@Component({
  selector: 'app-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.css'],
})
export class Step1Component implements OnInit {
  @ViewChild('informationModal') informationContent;
  loading = false;
  vidaleyUser: Vidaley;
  modalRef: BsModalRef;
  rucdeuda = false;
  resultdeuda = false;

  constructor(
    private readonly carService: VehiculoService,
    private readonly tokenService: TokenService,
    private readonly userInfo: EmisionService,
    private readonly sessionService: SessionService,
    private readonly route: Router,
    private spinner: NgxSpinnerService,
    private readonly googleService: GoogleTagManagerService,
    private readonly modalService: BsModalService,
    private readonly vidaleyService: VidaleyService,
  ) { }

  ngOnInit() {
    this.vidaleyUser = JSON.parse(sessionStorage.getItem('sctr')) || {};

    setTimeout(() => {
      this.showInformationModal();
    }, 250);
  }

  onSubmit(payload: Vidaley) {
    this.loading = true;
    this.googleService.setIntentButtonStep1(payload.privacy);
    this.carService
      .validarToken()
      .pipe(catchError(() => this.tokenService.getToken()))
      .subscribe(() => this.getUserInfo(payload));
  }

  getUserInfo(payload: Vidaley) {
    this.spinner.show();
    this.userInfo
      .clientePorDocumento('1', `${payload.ruc}`)
      .pipe(map((response: Contratante[]) => response.pop() || <any>{}))
      .subscribe((user) => {
        this.vidaleyUser = {
          ...payload,
          userInfo: user
        };

        this.vidaleyService.getSctrUserFromProcessId(1, -1, '1', `${payload.ruc}`, 0).subscribe(
          (resp) => {
            if (resp) {
              const response = buildUserFromJSON(resp);
              this.vidaleyUser = { ...response, ...this.vidaleyUser };
            }

            this.vidaleyUser.lock = false;
            // tslint:disable-next-line:max-line-length
            const IsEmptyLegalName = user.p_SLEGALNAME == null || user.p_SLEGALNAME === undefined || user.p_SLEGALNAME === '' ? true : false;
            if (!IsEmptyLegalName) {
              this.vidaleyUser.lock = true;
            }
            this.googleService.setProtectaClient(this.vidaleyUser.lock);
            this.sessionService.saveToLocalStorage('sctr', this.vidaleyUser);
            this.spinner.hide();
            this.rucdeuda = this.resultdeuda;
            console.log(this.rucdeuda);
            if (this.resultdeuda) {
              sessionStorage.clear();
              return;
            }
            if (this.vidaleyUser.lastStep > 0) {
              this.route.navigate([`sctr/step-${this.vidaleyUser.lastStep}`]);
            } else {
              this.route.navigate(['sctr/step-2']);
            }
          });

      });
  }

  showInformationModal() {
    this.modalRef = this.modalService.show(this.informationContent);
  }

  closeInformationModal() {
    this.modalRef.hide();
  }
  validateruc(val) {
    this.resultdeuda = val;
  }
  refreshPage() {
    location.reload();
  }
}
