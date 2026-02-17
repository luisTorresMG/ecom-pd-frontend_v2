import { Component, OnInit, ViewContainerRef, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AppConfig } from '@root/app.config';
import { DesgravamenService } from '../../../shared/services/desgravamen.service';
import { NgxSpinnerService } from 'ngx-spinner';

import { DocumentFormatResponse } from '@root/shared/models/document/document.models';
import {
  ParametersResponse,
  INacionalidadModel,
  IDepartamentoModel,
  IProvinciaModel,
  IDistritoModel
} from '@root/shared/models/ubigeo/parameters.model';
import { UtilsService } from '@root/shared/services/utils/utils.service';

@Component({
  selector: 'app-step4',
  templateUrl: './step4.component.html',
  styleUrls: ['./step4.component.scss']
})
export class Step4Component implements OnInit {

  form: FormGroup;
  formFinancialEntity: FormGroup;
  insurance: DocumentFormatResponse;
  dps: any;
  nacionalidades$: Array<INacionalidadModel>;
  departamentos$: Array<IDepartamentoModel>;
  provincias$: Array<IProvinciaModel>;
  distritos$: Array<IDistritoModel>;

  @ViewChild('modalAsegurado', { static: true, read: TemplateRef }) _modalAsegurado: TemplateRef<any>;
  @ViewChild('modalDps', { static: true, read: TemplateRef }) _modalDps: TemplateRef<any>;
  @ViewChild('modalFinancialEntity', { static: true, read: TemplateRef }) _modalFinancialEntity: TemplateRef<any>;

  constructor(
    private readonly _router: Router,
    private readonly _builder: FormBuilder,
    private readonly _desgravamenService: DesgravamenService,
    private readonly _viewContainerRef: ViewContainerRef,
    private readonly _spinner: NgxSpinnerService,
    private readonly _utilsService: UtilsService
  ) {
    this.insurance = new DocumentFormatResponse();
    this.form = this._builder.group({
      documentType: [null, Validators.required],
      documentNumber: [null, Validators.compose([
        Validators.pattern(/^[0-9]*$/),
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(8)
      ])],
      apellidoPaterno: [null, Validators.required],
      apellidoMaterno: [null, Validators.required],
      names: [null, Validators.required],
      sex: [null, Validators.required],
      birthDate: [null, Validators.required],
      country: [null, Validators.required],
      department: [null, Validators.required],
      province: [null, Validators.required],
      district: [null, Validators.required],
      address: [null, Validators.required],
      email: [null, Validators.compose([
        Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN),
        Validators.required
      ])],
      phone: [null, Validators.compose([
        Validators.pattern(/^[0-8]*$/),
        Validators.required
      ])]
    });
    this.formFinancialEntity = this._builder.group({
      interesCompensatorio: [null, Validators.required],
      gastosAdministrativos: [null, Validators.required],
      seguroDesgravamen: [null, Validators.required],
      saldoPrestamo: [{
        value: null,
        disabled: true
      }, Validators.required],
      nCuotas: [{
        value: null,
        disabled: true
      }, Validators.required],
      cotizacionEntidadFinanciera: [{
        value: null,
        disabled: true
      }, Validators.required],
      importeCuota: [{
        value: null,
        disabled: true
      }, Validators.required],
      cotizacionProtecta: [{
        value: null,
        disabled: true
      }, Validators.required]
    });
  }

  ngOnInit(): void {
    console.log(this.departamentos$);
    this.form.patchValue(this._desgravamenService.storage);
    this.validateFormData();
    if (this._desgravamenService.storage?.dps) {
      this.dps = this._desgravamenService.storage?.dps;
    }
    this.form.valueChanges.subscribe(() => {
      this._desgravamenService.storage = {
        ...this.form.getRawValue()
      };
    });
  }
  validateFormData(): void {
    if (!!this.f['documentType'].value) {
      this.f['documentType'].disable();
    }
    if (!!this.f['documentNumber'].value) {
      this.f['documentNumber'].disable();
    }
    if (!!this.f['apellidoPaterno'].value) {
      this.f['apellidoPaterno'].disable();
    }
    if (!!this.f['apellidoMaterno'].value) {
      this.f['apellidoMaterno'].disable();
    }
    if (!!this.f['names'].value) {
      this.f['names'].disable();
    }
    if (!!this.f['birthDate'].value) {
      this.f['birthDate'].disable();
    }
    if (!!this.f['sex'].value) {
      this.f['sex'].disable();
    }
  }
  get f(): any {
    return this.form.controls;
  }
  get ff(): any {
    return this.formFinancialEntity.controls;
  }
  parameters(): void {
    this._spinner.show();
    this._utilsService.parameters().subscribe(
      (res: ParametersResponse) => {
        console.log(res);
        this._spinner.hide();
        this.nacionalidades$ = res.nacionalidades;
        this.departamentos$ = res.ubigeos;
      },
      (err: any) => {
        console.log(err);
        this._spinner.hide();
      }
    );
  }
  changeUbigeo(): void {
    this.f['departamento'].valueChanges.subscribe((val) => {
      this.distritos$ = [];
      this.f['provincia'].setValue(null);
      this.f['distrito'].setValue(null);
      this.provincias$ = this.departamentos$.find(x => x.id === val).provincias;
    });
    this.f['provincia'].valueChanges.subscribe((val) => {

    });
  }
  showModalDps(): void {
    this._viewContainerRef.createEmbeddedView(this._modalDps);
  }
  showModalFinancial(): void {
    this._viewContainerRef.createEmbeddedView(this._modalFinancialEntity);
  }
  showModalInsurance(): void {
    this._viewContainerRef.createEmbeddedView(this._modalAsegurado);
    if (!this.departamentos$) {
      this.parameters();
    }
  }
  hideModal(): void {
    this._viewContainerRef.clear();
  }
  submit(): void {
    // FIXME: VALIDAR FORMULARIO PARA AVANZAR EL STEP
    /* if (this.isValidForms) {
    } */
    this._desgravamenService.storage = {
      dps: this.dps,
      ...this.form.getRawValue()
    };
    this._desgravamenService.step = 5;
    this._router.navigate(['/desgravamen/step5']);
  }
  backStep(): void {
    this._desgravamenService.step = 3;
    this._router.navigate(['/desgravamen/step3']);
  }
  get isValidForms(): boolean {
    return this.form.valid && this.formFinancialEntity.valid;
  }
  submitInsurance(): void {
    this._desgravamenService.storage = {
      ...this.form.getRawValue()
    };
    this._viewContainerRef.clear();
  }
  dpsEmit(e: any): void {
    this.dps = e;
    if (e.isValid) {
      this._desgravamenService.storage = {
        dps: this.dps,
        ...this.form.getRawValue()
      };
    } else {
      alert('DPS INVALID');
    }
    this._viewContainerRef.clear();
  }
}
