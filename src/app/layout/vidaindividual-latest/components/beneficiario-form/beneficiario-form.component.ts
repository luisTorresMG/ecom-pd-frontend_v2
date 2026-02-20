// tslint:disable-next-line:max-line-length
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { BeneficiarioDto } from '../../models/beneficiario.model';
import { Step2Service } from '../../services/step2/step2.service';
import { Step1Service } from '../../services/step1/step1.service';
import { DocumentResponse } from '../../models/document.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConfig } from '@root/app.config';

import { UtilsService } from '@root/shared/services/utils/utils.service';
import { IDocumentInfoClientRequest } from '@shared/interfaces/document-information.interface';
import { DocumentInfoResponseModel } from '@shared/models/document-information/document-information.model';
import { RecaptchaComponent } from 'ng-recaptcha';

@Component({
  standalone: false,
  selector: 'app-beneficiario-form',
  templateUrl: './beneficiario-form.component.html',
  styleUrls: ['./beneficiario-form.component.css']
})
export class BeneficiarioFormComponent implements OnInit {

  @Input() dataBeneficiario: BeneficiarioDto;
  @Input() index: number;
  @Input() isForUpdate: boolean;
  @Input() parameters$: any;
  @Input() disableField: boolean;

  @Output() formSubmitted = new EventEmitter<any>();
  @Output() dataFormForUpdate = new EventEmitter();
  @Output() dataFormForDrop = new EventEmitter();
  @Output() sumaPorcentajeParticipacionBeneficiarios = new EventEmitter();

  departamentos$: Array<any> = [];

  bsConfig: Partial<BsDatepickerConfig>;
  fecha = new Date();
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();

  formBeneficiario: FormGroup;

  percents: Array<number> = [];

  numberDocumentLimit: { min: number, max: number };

  limitDate: Date;
  siteKey = AppConfig.CAPTCHA_KEY;

  @ViewChild('errorForm', { static: true, read: ElementRef }) errorForm: ElementRef;
  @ViewChild('inputFechaNacimiento', { static: true, read: ElementRef }) inputFechaNacimiento: ElementRef;
  @ViewChild('recaptchaRef', { static: true }) recaptcha: RecaptchaComponent;

  constructor(
    private readonly _builder: FormBuilder,
    private readonly _Step2Service: Step2Service,
    private readonly _Step1Service: Step1Service,
    private readonly _spinner: NgxSpinnerService,
    private readonly _utilsService: UtilsService,
    private readonly _appConfig: AppConfig
  ) {
    this.limitDate = new Date(new Date().setFullYear(Number(new Date().getFullYear())));
    this.bsConfig = Object.assign(
      {},
      {
        locale: 'es',
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY',
        maxDate: this.limitDate
      }
    );
    this.numberDocumentLimit = { min: 8, max: 8 };
    this.formBeneficiario = this._builder.group({
      index: [null, [Validators.required]],
      idTipoDocumento: [undefined, Validators.required],
      numeroDocumento: [undefined, Validators.compose([
        Validators.required,
        Validators.pattern(/^[0-9]*$/),
        Validators.minLength(this.numberDocumentLimit.min),
        Validators.maxLength(this.numberDocumentLimit.max)
      ]),
      ],
      nombre: [undefined, Validators.required],
      apellidoPaterno: [undefined, Validators.required],
      apellidoMaterno: [undefined, Validators.required],
      departamento: [undefined],
      idSexo: [undefined, Validators.required],
      provincia: [undefined],
      distrito: [undefined],
      direccion: [undefined],
      email: [undefined],
      telefono: [undefined],
      fechaNacimiento: [undefined, Validators.required],
      relacion: [undefined, Validators.required],
      porcentajeParticipacion: [undefined, Validators.required],
      // tslint:disable-next-line:max-line-length
      idNacionalidad: [{ value: undefined, disabled: Number(this.dataBeneficiario?.idTipoDocumento) === 2 }]
    });
  }

  ngOnInit(): void {
    this.departamentos$ = this.parameters$?.ubigeos;
    for (let i = 10; i <= 100; i += 10) {
      this.percents.push(i);
    }
    this.percents.push(25);
    this.percents.push(35);
    this.percents = this.percents.sort((x, y) => x - y);
    this.f['idTipoDocumento'].valueChanges.subscribe((val) => {
      switch (Number(val)) {
        case 2: {
          this.f['apellidoMaterno'].clearValidators();
          this.f['apellidoMaterno'].setValidators([
            Validators.required
          ]);

          this.numberDocumentLimit = { min: 8, max: 8 };
          // this.f['idNacionalidad'].setValue(1);
          // this.f['departamento'].setValue(undefined);
          // this.f['provincia'].setValue(undefined);
          // this.f['distrito'].setValue(undefined);
          // this.f['idNacionalidad'].disable();
          // this.f['idNacionalidad'].clearValidators();

          // this.f['departamento'].enable();
          /*this.f['departamento'].setValidators([
            Validators.required
          ]);*/

          // this.f['provincia'].enable();
          /*this.f['provincia'].setValidators([
            Validators.required
          ]);*/

          // this.f['distrito'].enable();
          /*this.f['distrito'].setValidators([
            Validators.required
          ]);*/
          break;
        }
        case 4: {
          this.numberDocumentLimit = { min: 9, max: 12 };
          // this.f['idNacionalidad'].setValue(undefined);
          this.f['apellidoMaterno'].clearValidators();
          this.f['apellidoMaterno'].setValidators([
            Validators.required
          ]);

          // this.f['idNacionalidad'].enable();
          /*this.f['idNacionalidad'].setValidators([
            Validators.required
          ]);*/

          // this.f['departamento'].setValue(14);
          // this.f['departamento'].disable();
          // this.f['departamento'].clearValidators();

          // this.f['provincia'].setValue(1401);
          // this.f['provincia'].disable();
          // this.f['provincia'].clearValidators();

          // this.f['distrito'].setValue(140101);
          // this.f['distrito'].disable();
          // this.f['distrito'].clearValidators();
          break;
        }
      }
      this.f['numeroDocumento'].setValidators([
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(this.numberDocumentLimit.min),
          Validators.maxLength(this.numberDocumentLimit.max)
        ])
      ]);
    });
    this.f['telefono'].valueChanges.subscribe((val) => {
      /* if (val) {
        if (this.f['telefono'].value?.toString()?.substring(0, 1) !== '9') {
          this.f['telefono'].setValue(val.toString().substring(0, val.toString().length - 1));
        }
      } */
      const errors: ValidationErrors | null = this.f['telefono'].errors || null;
      const typeError: string | {} = (Object.keys(errors || {})[0])?.toLocaleLowerCase();
      switch (typeError) {
        case 'pattern':
        case 'maxlength': {
          this.f['telefono'].setValue(val?.toString().substring(0, val.toString().length - 1));
        }
      }
    });
    this.f['numeroDocumento'].valueChanges.subscribe((val) => {
      if (!this.resumen) {
        this.f['nombre'].setValue(undefined);
        this.f['apellidoPaterno'].setValue(undefined);
        this.f['apellidoMaterno'].setValue(undefined);
        this.f['departamento'].setValue(undefined);
        this.f['idSexo'].setValue(undefined);
        this.f['provincia'].setValue(undefined);
        this.f['distrito'].setValue(undefined);
        this.f['direccion'].setValue(undefined);
        this.f['email'].setValue(undefined);
        this.f['telefono'].setValue(undefined);
        this.f['fechaNacimiento'].setValue(undefined);
        this.f['relacion'].setValue(undefined);
        this.f['porcentajeParticipacion'].setValue(undefined);
        this.f['idNacionalidad'].setValue(undefined);
      }

      this.errorForm.nativeElement.textContent = '';
      const errors: ValidationErrors | null = this.f['numeroDocumento'].errors || null;
      const typeError = Object.keys(errors || {})[0]?.toLocaleLowerCase();
      if (typeError === 'pattern') {
        this.f['numeroDocumento'].setValue(val?.substring(0, val?.length - 1));
      }
    });
    this.formBeneficiario.valueChanges.subscribe((_) => {
      this.submit();
    });
    /*
    this.f['departamento'].valueChanges.subscribe((val: any) => {
      this.f['provincia'].setValue(undefined);
      this.f['distrito'].setValue(undefined);
      this.provincias$ = this.parameters$?.ubigeos?.find(x => Number(x.id) === Number(val))?.provincias;
    });
    this.f['provincia'].valueChanges.subscribe((val: any) => {
      this.f['distrito'].setValue(undefined);
      this.distritos$ = this.provincias$?.find(x => Number(x.idProvincia) === Number(val))?.distritos;
    });*/
    this.formBeneficiario.patchValue(this.dataBeneficiario || undefined);
    // this.f['idNacionalidad'].setValue(Number(this.dataBeneficiario.idNacionalidad) || undefined);
    this.f['idTipoDocumento'].setValue(this.dataBeneficiario.idTipoDocumento || 2);
    this.f['relacion'].setValue(this.dataBeneficiario.relacion?.id || undefined);
    this.f['idSexo'].setValue(this.dataBeneficiario?.idSexo || 3);
    // this.f['departamento'].setValue(this.dataBeneficiario.departamento?.id || undefined);
    // this.f['provincia'].setValue(this.dataBeneficiario.provincia?.id || undefined);
    // this.f['distrito'].setValue(this.dataBeneficiario.distrito?.id || undefined);
    this.f['porcentajeParticipacion'].setValue(this.dataBeneficiario.porcentajeParticipacion || undefined);

    /*   this.formBeneficiario.valueChanges
        .subscribe(() => {
          this.submit();
        }); */
    if (this.disableField) {
      this.f['relacion'].disable();
      this.f['idTipoDocumento'].disable();
      this.f['idSexo'].disable();
      this.f['nombre'].disable();
      this.f['apellidoPaterno'].disable();
      this.f['apellidoMaterno'].disable();
      this.f['porcentajeParticipacion'].disable();
      this.f['fechaNacimiento'].disable();
      this.f['numeroDocumento'].disable();
    }
  }

  get resumen(): any {
    return sessionStorage.getItem('resumen-atp');
  }

  validarSumaPorcentajeParticipacionBeneficiarios(): boolean {
    this.errorForm.nativeElement.textContent = '';
    let sumaPorcentajeParticipacionBeneficiarios = 0;
    const dataBeneficiarios: Array<BeneficiarioDto> = JSON.parse(sessionStorage.getItem('dataBeneficiarios'));
    if (!!dataBeneficiarios) {
      /*if (this.isForUpdate) {
        const benf = dataBeneficiarios.filter(x => Number(x.numeroDocumento) !== Number(this.f['numeroDocumento'].value));
        benf.forEach(e => {
          sumaPorcentajeParticipacionBeneficiarios += Number(e.porcentajeParticipacion);
        });
      } else {
        dataBeneficiarios.forEach(e => {
          sumaPorcentajeParticipacionBeneficiarios += Number(e.porcentajeParticipacion);
        });
      }*/
      dataBeneficiarios.forEach(e => {
        sumaPorcentajeParticipacionBeneficiarios += Number(e.porcentajeParticipacion);
      });
    }
    if (sumaPorcentajeParticipacionBeneficiarios > 100) {
      this.errorForm.nativeElement.textContent = 'La suma de beneficiaros debe ser 100%';
      return false;
    }
    return true;
  }

  get sumaPorcentajeParticicionBeneficiarios(): number {
    let sumaPorcentajeParticipacionBeneficiarios = 0;
    const dataBeneficiarios: Array<BeneficiarioDto> = JSON.parse(sessionStorage.getItem('dataBeneficiarios'));
    if (!!dataBeneficiarios) {
      dataBeneficiarios.forEach(e => {
        sumaPorcentajeParticipacionBeneficiarios += Number(e.porcentajeParticipacion);
      });
    }
    return sumaPorcentajeParticipacionBeneficiarios;
  }

  get f(): any {
    return this.formBeneficiario.controls;
  }

  submit(): void {
    let data = null;
    let fechaNac;
    let year;
    let mes;
    let dia;
    if (this.f['fechaNacimiento'].value?.toString().length > 10) {
      year = new Date(this.f['fechaNacimiento'].value).getFullYear();
      mes = new Date(this.f['fechaNacimiento'].value).getMonth() + 1;
      dia = new Date(this.f['fechaNacimiento'].value).getDate();
      fechaNac = `${dia}/${mes}/${year}`;
    } else {
      fechaNac = this.f['fechaNacimiento'].value;
    }
    if (this.formBeneficiario.valid && this.formBeneficiario.dirty) {
      data = {
        complete: this.formBeneficiario.valid,
        idTipoPersona: 1,
        ...this.formBeneficiario.getRawValue(),
        idNacionalidad: null, // Number(this.f['idNacionalidad'].value),
        departamento: {
          id: null, // this.f['departamento'].value,
          descripcion: null, // this.parameters$?.ubigeos?.find(x => Number(x.id) === Number(this.f['departamento'].value))?.descripcion
        },
        provincia: {
          id: null, // this.f['provincia'].value,
          descripcion: null // this.provincias$?.find(x => Number(x.idProvincia) === Number(this.f['provincia'].value))?.provincia
        },
        distrito: {
          id: null, // this.f['distrito'].value,
          descripcion: null, // this.distritos$?.find(x => Number(x.idDistrito) === Number(this.f['distrito'].value))?.distrito
        },
        relacion: {
          id: this.f['relacion'].value,
          descripcion: this.parameters$?.parentescos?.find(x => Number(x.id) === Number(this.f['relacion'].value))?.descripcion
        },
        fechaNacimiento: fechaNac,
        // *cambio email, direccion, cellphone
        direccion: null,
        email: null,
        telefono: null
      };
      this.formSubmitted.emit({ valid: this.formBeneficiario.valid, data: new BeneficiarioDto(data) });
      return;
    }
    this.formSubmitted.emit({ valid: this.formBeneficiario.valid, data: null });
    // this.formBeneficiario.markAllAsTouched();
  }

  get validarFormulario(): boolean {
    this.submit();
    return this.formBeneficiario.valid && this.validarSumaPorcentajeParticipacionBeneficiarios();
  }

  get validarExistBeneficiario(): boolean {
    this.errorForm.nativeElement.textContent = '';
    const beneficiariosOfStorage: Array<BeneficiarioDto> = JSON.parse(sessionStorage.getItem('dataBeneficiarios'));
    if (!!beneficiariosOfStorage) {
      const codigoCliente = this.f['idTipoDocumento'].value + this.f['numeroDocumento'].value;
      // tslint:disable-next-line:max-line-length
      if (beneficiariosOfStorage.filter(x => x.codigoCliente?.toString() === codigoCliente && x.index !== this.f['index'].value).length !== 0) {
        this.errorForm.nativeElement.textContent = 'El beneficiario ya fue agregado.';
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  getDataOfDocument(token): void {
    if (this.f['numeroDocumento'].valid && this.validarExistBeneficiario) {
      if (this.insurance?.nDoc?.toString() !== this.f['numeroDocumento'].value?.toString()) {
        this.errorForm.nativeElement.textContent = '';
        this._spinner.show();
        const payload: IDocumentInfoClientRequest = {
          idRamo: 71,
          idProducto: 1,
          idTipoDocumento: +this.f['idTipoDocumento'].value,
          numeroDocumento: this.f['numeroDocumento'].value,
          idUsuario: 3822,
          token: token,
        };
        this._utilsService.documentInfoClientResponse(payload).subscribe(
          (response: any) => {
            let res = [this.parseDocumentResponse(response)];
            this.f['nombre'].setValue(res[0]?.p_SCLIENT_NAME);
            this.f['apellidoPaterno'].setValue(res[0]?.p_SCLIENT_APPPAT);
            this.f['apellidoMaterno'].setValue(res[0]?.p_SCLIENT_APPMAT);
            // this.f['email'].setValue(res[0]?.p_SMAIL);
            // this.f['telefono'].setValue(res[0]?.p_SPHONE);
            this.f['idSexo'].setValue(res[0]?.p_SSEXCLIEN || undefined);
            this.f['fechaNacimiento'].setValue(res[0]?.p_DBIRTHDAT);
            // this.f['direccion'].setValue(res[0]?.p_SADDRESS);
            /*if (Number(this.f['idTipoDocumento'].value) === 4) {
              this.f['departamento'].setValue(Number(res[0]?.p_NPROVINCE) || 14);
              this.f['provincia'].setValue(Number(res[0]?.p_NLOCAT) || 1401);
              this.f['distrito'].setValue(Number(res[0]?.p_NMUNICIPALITY) || 140101);
            } else {
              this.f['departamento'].setValue(Number(res[0]?.p_NPROVINCE) || undefined);
              this.f['provincia'].setValue(Number(res[0]?.p_NLOCAT) || undefined);
              this.f['distrito'].setValue(Number(res[0]?.p_NMUNICIPALITY) || undefined);
            }*/
            this.submit();
            this._spinner.hide();
          },
          (err: any) => {
            console.log(err);
            this._spinner.hide();
          }
        );
      } else {
        this.f['numeroDocumento'].setValue(null);
        this.errorForm.nativeElement.textContent = 'El contratante no puede ser beneficiario';
      }
    }
  }

  get isUpdateOrAddForm(): string {
    if (this.isForUpdate) {
      return 'Actualizar';
    } else {
      return 'Agregar Beneficiario';
    }
  }

  eliminarBeneficiario() {
    const gtmPayload = {
      event: 'virtualEvent',
      payload: {
        category: 'Vida Devolución - Paso 2',
        action: 'Eliminar beneficiario',
        label: 'Eliminar'
      }
    };
    this._appConfig.gtmTrackEvent(gtmPayload);
    const data: BeneficiarioDto = {
      idTipoPersona: 1,
      codigoCliente: this.f['idTipoDocumento'].value + this.f['numeroDocumento'].value,
      ...this.formBeneficiario.value
    };
    this.dataFormForDrop.emit(data);
    this.sumaPorcentajeParticipacionBeneficiarios.emit(this.sumaPorcentajeParticicionBeneficiarios);
  }

  isFormControlError(control: string): boolean {
    return this.f[control].invalid && this.f[control].touched;
  }

  get lengthOfDataBeneficiariosStorage(): number {
    return JSON.parse(sessionStorage.getItem('dataBeneficiarios'))?.length;
  }

  get insurance(): any {
    return JSON.parse(sessionStorage.getItem('step1'));
  }

  openCalendar(): void {
    this.inputFechaNacimiento.nativeElement.focus();
    this.inputFechaNacimiento.nativeElement.click();
  }

  requestClientInfo() {
    this.recaptcha.execute();
  }

  resolved(token: string) {
    if (token) {
      this.getDataOfDocument(token);
      this.recaptcha.reset();
      return;
    }
  }

  private parseDocumentResponse(datosDocumento: DocumentInfoResponseModel): DocumentResponse {
    return new DocumentResponse({
      p_DBIRTHDAT: datosDocumento.birthdate,
      p_NDOCUMENT_TYP: datosDocumento.documentType,
      p_NLOCAT: datosDocumento.department,
      p_NMUNICIPALITY: datosDocumento.district,
      p_NPERSON_TYP: 1,
      p_NPROVINCE: datosDocumento.province,
      p_SADDRESS: datosDocumento.address,
      p_SCLIENT: null,
      p_SCLIENT_APPMAT: datosDocumento.apeMat,
      p_SCLIENT_APPPAT: datosDocumento.apePat,
      p_SCLIENT_NAME: datosDocumento.names,
      p_SDOCUMENT: datosDocumento.documentNumber,
      p_SLEGALNAME: datosDocumento.legalName,
      p_SMAIL: datosDocumento.email,
      p_SPHONE: datosDocumento.phoneNumber,
      p_SSEXCLIEN: datosDocumento.sex,
      p_SISCLIENT_GBD: null,
      historicoSCTR: null,
      p_SFOTO: ''
    });
  }
}
