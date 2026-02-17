import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { filter, finalize, map } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import { EmisionService } from '../../../client/shared/services/emision.service';
import { SessionService } from '../../../soat/shared/services/session.service';
import { Vidaley } from '../../shared/models/vidaley';

@Component({
  selector: 'app-employee-info',
  templateUrl: './employee-info.component.html',
  styleUrls: ['./employee-info.component.css'],
})
export class EmployeeInfoComponent implements OnInit {
  @Input() user: Vidaley;

  @Output()
  formSubmitted = new EventEmitter<{ form: any }>();

  employeeForm: FormGroup;
  loading = false;

  documentTypes = [
    { value: '4', label: 'CE' },
    { value: '2', label: 'DNI' },
    { value: '6', label: 'Pasaporte' },
  ];

  sexTypes = [
    { value: 'M', label: 'MASCULINO' },
    { value: 'F', label: 'FEMENINO' },
  ];

  employeeTypes = [
    { value: 'riesgo bajo', label: 'EMPLEADO' },
    { value: 'riesgo alto', label: 'OBRERO' },
  ];

  documentNumberLimit = {
    min: 8,
    max: 8,
  };

  loaders = {
    userInfo: false,
  };

  datePickerConfig: Partial<BsDatepickerConfig>;

  clientForm: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly userInfo: EmisionService,
    private readonly sessionService: SessionService,
  ) { }

  ngOnInit() {
    this.datePickerConfig = Object.assign(
      {},
      {
        locale: 'es',
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY',
      }
    );

    this.clientForm = JSON.parse(sessionStorage.getItem('sctrClient')) || {};
    this.initForm();
    this.setDocumentValidation();

    const selling = this.sessionService.getSellingPoint();
    if (Number(selling.sellingChannel) === 2020000797 || Number(selling.sellingChannel) === 2020000798) {
      this.employeeTypes = [
        { value: 'riesgo alto', label: 'OBRERO' },
      ];
    }

  }

  initForm() {

    const lastname = this.user.lastName && this.user.lastName.length > 0 ? this.user.lastName.trim() : null;
    const surname = this.user.surname && this.user.surname.length > 0 ? this.user.surname.trim() : null;
    const name = this.user.name && this.user.name.length > 0 ? this.user.name.trim() : null;
    const email = this.user.email && this.user.email.length > 0 ? this.user.email.trim() : null;
    const phoneNumber = this.user.phoneNumber && this.user.phoneNumber.length > 0 ? this.user.phoneNumber.trim() : null;

    let initForm = {
      lastname: this.clientForm.lastname || lastname,
      surname: this.clientForm.surname || surname,
      name: this.clientForm.name || name,
      email: this.clientForm.email || email,
      phoneNumber: this.clientForm.phoneNumber || phoneNumber,
      documentType: this.clientForm.documentType,
      documentNumber: this.clientForm.documentNumber,
      sex: this.clientForm.sex,
      birthdate: this.clientForm.birthdate
        ? new Date(this.clientForm.birthdate)
        : null,
      workerType: this.clientForm.workerType,
      country: this.clientForm.country,
    };

    if (/^(10)(\d{9})$/.test(<any>this.user.ruc)) {
      initForm = {
        ...initForm,
        documentType: '2',
        documentNumber: `${this.user.ruc}`.substr(2, 8),
      };
    }

    this.employeeForm = this.fb.group({
      documentType: [initForm.documentType, [Validators.required]],
      documentNumber: [initForm.documentNumber, [Validators.required]],
      lastname: [initForm.lastname, [Validators.required]],
      surname: [initForm.surname],
      name: [initForm.name, [Validators.required]],
      sex: [initForm.sex, [Validators.required]],
      birthdate: [initForm.birthdate, [Validators.required]],
      workerType: [initForm.workerType, [Validators.required]],
      email: [initForm.email, [Validators.required]],
      phoneNumber: [initForm.phoneNumber, [Validators.required]],
      country: [initForm.country, [Validators.required]],
    });

    this.getPersonalInfo();
  }

  onSubmit() {
    this.employeeForm.markAllAsTouched();

    if (this.employeeForm.valid) {
      const values = this.employeeForm.value;
      this.formSubmitted.emit(values);
    }
  }

  get eForm() {
    return this.employeeForm.controls;
  }

  showError(controlName: string): boolean {
    return (
      this.eForm[controlName].invalid &&
      (this.eForm[controlName].dirty || this.eForm[controlName].touched)
    );
  }

  setDocumentValidation() {
    this.eForm['documentType'].valueChanges.subscribe((documentType) => {
      let pattern = /^\d{8}$/;

      if (documentType === '2') {
        pattern = /^\d{8}$/;
        this.documentNumberLimit = { min: 8, max: 8 };
      }

      if (documentType === '4' || documentType === '6') {
        pattern = /^[\w\d_.-]{3,12}$/;
        this.documentNumberLimit = { min: 3, max: 12 };
      }

      this.eForm['documentNumber'].setValidators([
        Validators.required,
        Validators.pattern(pattern),
      ]);

      this.eForm['documentNumber'].updateValueAndValidity({ onlySelf: true });
    });
  }

  getPersonalInfo() {
    if (
      this.eForm['documentNumber'].errors ||
      this.eForm['documentType'].errors
    ) {
      return;
    }

    this.loaders.userInfo = true;

    this.userInfo
      .clientePorDocumento(
        this.eForm['documentType'].value,
        this.eForm['documentNumber'].value
      )
      .pipe(
        filter(
          (val) =>
            Array.isArray(val) &&
            val.length > 0 &&
            !isNullOrUndefined(val[0].p_SDOCUMENT)
        ),
        map((response: Array<any>) => response.pop()),
        finalize(() => (this.loaders.userInfo = false))
      )
      .subscribe((userInfo) => {
        this.setUserInfo(userInfo);
      });
  }

  setUserInfo(user) {
    this.eForm['name'].setValue(user.p_SCLIENT_NAME);
    this.eForm['lastname'].setValue(user.p_SCLIENT_APPPAT);
    this.eForm['surname'].setValue(user.p_SCLIENT_APPMAT);
    this.eForm['phoneNumber'].setValue(user.p_SPHONE || this.user.phoneNumber);
  }
}
