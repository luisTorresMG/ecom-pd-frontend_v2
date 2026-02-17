import { Component, OnInit, AfterViewChecked, ViewContainerRef, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DesgravamenService } from '../../../shared/services/desgravamen.service';
import { DocumentFormatResponse, DocumentRequest, DocumentResponse } from '@root/shared/models/document/document.models';
import { NgxSpinnerService } from 'ngx-spinner';
import { fadeAnimation } from '@root/shared/animations/animations';
import { UtilsService } from '@root/shared/services/utils/utils.service';
import { ParametersResponse, IDepartamentoModel, IDistritoModel, IProvinciaModel } from '@root/shared/models/ubigeo/parameters.model';
import { BeneficiarioModel } from '../../../shared/models/beneficiario.model';

@Component({
  selector: 'app-step5',
  templateUrl: './step5.component.html',
  styleUrls: ['./step5.component.scss'],
  animations: [fadeAnimation]
})
export class Step5Component implements OnInit, AfterViewChecked {

  parameters$: ParametersResponse;
  departamentos$: Array<IDepartamentoModel>;
  provincias$: Array<IProvinciaModel>;
  distritos$: Array<IDistritoModel>;

  form: FormGroup;
  limitDocumentNumber: { min: number, max: number };

  // *1: HEREDEROS LEGALES - 2: BENEFICIARIOS
  tipoCotizacion: number;

  beneficiarios: Array<BeneficiarioModel>;

  @ViewChild('modalContact', { static: true, read: TemplateRef }) _modalContact: TemplateRef<any>;
  @ViewChild('modalBeneficiario', { static: true, read: TemplateRef }) _modalBeneficiario: TemplateRef<any>;

  constructor(
    private readonly _viewContainerRef: ViewContainerRef,
    private readonly _builder: FormBuilder,
    private readonly _desgravamenService: DesgravamenService,
    private readonly _utilsService: UtilsService,
    private readonly _spinner: NgxSpinnerService,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    this.tipoCotizacion = 0;
    this.beneficiarios = [];
    this.limitDocumentNumber = {
      min: 8,
      max: 8
    };
    this.form = this._builder.group({
      tipoDocumento: [2, Validators.required],
      numeroDocumento: [null, Validators.compose([
        Validators.pattern(/^[0-9]*$/),
        Validators.minLength(this.limitDocumentNumber.min),
        Validators.maxLength(this.limitDocumentNumber.max),
        Validators.required
      ])],
      nombres: [null],
      apellidoPaterno: [null],
      apellidoMaterno: [null],
      departamento: [null, Validators.required],
      provincia: [null, Validators.required],
      distrito: [null, Validators.required],
      correo: [null, Validators.required],
      direccion: [null, Validators.required],
      numeroCelular: [null, Validators.compose([
        Validators.pattern(/^[0-9]*$/),
        Validators.minLength(9),
        Validators.maxLength(9),
        Validators.required
      ])]
    });
  }
  ngOnInit(): void {
    this.parameters();
    if (this._desgravamenService.storage?.tipoCotizacion) {
      this.tipoCotizacion = this._desgravamenService.storage.tipoCotizacion;
    }
    this.f['numeroDocumento'].valueChanges.subscribe((val) => {
      if (this.f['numeroDocumento'].hasError('pattern')) {
        this.f['numeroDocumento'].setValue(val?.toString()?.substring(0, val.length - 1));
      }
      if (this.f['numeroDocumento'].valid) {
        this.getDataOfDocument();
      }
    });
    this.f['numeroCelular'].valueChanges.subscribe((val) => {
      if (this.f['numeroCelular'].hasError('pattern')) {
        this.f['numeroCelular'].setValue(val?.toString()?.substring(0, val.length - 1));
      }
    });
    this.form.valueChanges.subscribe(() => {
      this.saveFormToStorage();
    });
    if (this._desgravamenService.storage?.contact) {
      this.form.patchValue(this._desgravamenService.storage.contact);
    }
  }
  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }
  private parameters(): void {
    this._utilsService.parameters().subscribe(
      (res: ParametersResponse) => {
        this.parameters$ = new ParametersResponse(res);
        this.departamentos$ = this.parameters$.ubigeos;
        this.parameterChanges();
      },
      (err: any) => {
        console.error(err);
      }
    );
  }
  private parameterChanges(): void {
    this.f['departamento'].valueChanges.subscribe((val) => {
      if (val) {
        this.provincias$ = this.departamentos$.find(x => Number(x.id) === Number(val)).provincias;
        this.distritos$ = [];
        this.f['provincia'].setValue(null);
        this.f['distrito'].setValue(null);
      }
    });
    this.f['provincia'].valueChanges.subscribe((val) => {
      if (val) {
        this.distritos$ = this.provincias$.find(x => Number(x.idProvincia) === Number(val)).distritos;
        this.f['distrito'].setValue(null);
      }
    });
    if (this._desgravamenService.storage?.contact) {
      this.form.patchValue(this._desgravamenService.storage?.contact);
    }
  }
  submit(): void {
    this.saveFormToStorage();
    this._viewContainerRef.clear();
  }
  private saveFormToStorage(): void {
    this._desgravamenService.storage = {
      contact: this.form.getRawValue()
    };
  }
  get f(): any {
    return this.form.controls;
  }
  showModalBeneficiario(): void {
    this._viewContainerRef.createEmbeddedView(this._modalBeneficiario);
  }
  showModalContact(): void {
    this._viewContainerRef.createEmbeddedView(this._modalContact);
  }
  hideModal(): void {
    this._viewContainerRef.clear();
  }
  private getDataOfDocument(): void {
    const request: DocumentRequest = new DocumentRequest({
      type: this.f['tipoDocumento'].value,
      documentNumber: this.f['numeroDocumento'].value
    });
    this._spinner.show();
    this._utilsService.documentData(request).subscribe(
      (res: DocumentResponse) => {
        const response: DocumentFormatResponse = new DocumentFormatResponse(res);
        console.dir(response);
        this._spinner.hide();
        this.form.patchValue(response);
        this.f['nombres'].setValue(response.names ? response.names : this.f['nombres'].value);
        this.f['departamento'].setValue(response.department ? response.department : this.f['departamento'].value);
        this.f['provincia'].setValue(response.province ? response.province : this.f['provincia'].value);
        this.f['distrito'].setValue(response.district ? response.district : this.f['distrito'].value);
        this.f['numeroCelular'].setValue(response.phone ? response.phone : this.f['numeroCelular']);
        this.f['direccion'].setValue(response.address ? response.address : this.f['direccion'].value);
        this.f['correo'].setValue(response.email ? response.email : this.f['correo'].value);
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }
  changeTypeCotizacion(val: number): void {
    this.tipoCotizacion = val;
    this._desgravamenService.storage = {
      tipoCotizacion: this.tipoCotizacion
    };
  }
  get namesComplete(): string {
    return (`${this.f['nombres']?.value} ${this.f['apellidoPaterno']?.value} ${this.f['apellidoMaterno']?.value}`).toLocaleLowerCase();
  }
  get sTipoDocumento(): string {
    return Number(this.f['tipoDocumento']?.value) === 2 ? 'DNI' : 'CE';
  }
  dropContactInsurance(): void {
    this.form.reset();
    this.f['tipoDocumento'].setValue(2);
    this._desgravamenService.storage = {
      ...this._desgravamenService.storage,
      contact: null
    };
  }
  agregarBeneficiario(data: BeneficiarioModel): void {
    this.beneficiarios.push(data);
  }
}
