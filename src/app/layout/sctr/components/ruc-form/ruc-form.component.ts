import {
  Component,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SessionService } from '../../../soat/shared/services/session.service';
import { Vidaley } from '../../shared/models/vidaley';
import { AppConfig } from '../../../../app.config';
import { UtilsService } from '@shared/services/utils/utils.service';

@Component({
  selector: 'app-ruc-form',
  templateUrl: './ruc-form.component.html',
  styleUrls: ['./ruc-form.component.css'],
})
export class RucFormComponent implements OnInit {
  @ViewChild('privacyModal')
  privacyContent;

  @Output()
  formSubmitted = new EventEmitter<Vidaley>();

  @Input()
  loading: boolean;

  @Input()
  user: Vidaley;
  @Output() rucvalidate = new EventEmitter<any>();

  rucForm: FormGroup;

  terms: string[];

  modalRef: BsModalRef;

  rucisvalid = false;
  constructor(
    private readonly fb: FormBuilder,
    private readonly modalService: BsModalService,
    private readonly sessionService: SessionService,
    private readonly _utilsService: UtilsService
  ) {}

  get rForm() {
    return this.rucForm.controls;
  }

  ngOnInit() {
    this.rucvalidate.emit(this.rucisvalid);
    this.terms = this.sessionService.getTerms();

    this.rucForm = this.fb.group({
      ruc: [
        this.user.ruc,
        [Validators.required, Validators.pattern(/^(20|10|15|17)(\d{9})$/)],
      ],
      email: [
        this.user.email,
        [Validators.required, Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN)],
      ],
      privacy: [this.user.privacy],
    });
    this.sessionService.renewSellingPoint().subscribe(() => {});
  }
  validarRUC() {
    if (this.rForm.ruc.valid) {
      const req = {
        numerodocumento: this.rForm.ruc.value,
        branchId: 77,
      };
      this._utilsService.clienteInformation(req).subscribe((response) => {
        console.dir(response);

        this.rucisvalid = response.clienteDeuda || response.clienteEstado;
        this.rucvalidate.emit(this.rucisvalid);

        const formValues = this.rucForm.value;
        this.formSubmitted.emit(formValues);
      });
    }
  }
  onSubmit() {
    if (this.rucForm.valid) {
      const formValues = this.rucForm.value;
      this.formSubmitted.emit(formValues);
      this.validate();
      this.validarRUC();
    }
  }

  validate() {
    this.rucForm.markAllAsTouched();
  }

  showPrivacyModal() {
    this.modalRef = this.modalService.show(this.privacyContent);
    this.enablePrivacy();
  }

  enablePrivacy() {
    // this.rucForm['privacy'].setValue(true);
  }

  closePrivacyModal() {
    this.modalRef.hide();
  }

  showError(controlName: string): boolean {
    return (
      this.rForm[controlName].invalid &&
      (this.rForm[controlName].dirty || this.rForm[controlName].touched)
    );
  }

  emailSuggestion(val: string): void {
    this.rForm['email'].setValue(val);
  }
}
