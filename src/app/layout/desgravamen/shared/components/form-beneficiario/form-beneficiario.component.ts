import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import {
  IDepartamentoModel,
  IDistritoModel,
  INacionalidadModel,
  IProvinciaModel,
  ParametersResponse
} from '@root/shared/models/ubigeo/parameters.model';
import { UtilsService } from '@root/shared/services/utils/utils.service';
import { Subscription } from 'rxjs/Subscription';
import { AppConfig } from '@root/app.config';

@Component({
  selector: 'app-form-beneficiario',
  templateUrl: './form-beneficiario.component.html',
  styleUrls: ['./form-beneficiario.component.scss']
})
export class FormBeneficiarioComponent implements OnInit, OnDestroy {

  subscribtion: Subscription;

  form: FormGroup;
  limitDocumentNumber: { min: number, max: number };

  nacionalidades$: Array<INacionalidadModel>;
  departamentos$: Array<IDepartamentoModel>;
  provincias$: Array<IProvinciaModel>;
  distritos$: Array<IDistritoModel>;

  constructor(
    private readonly _utilsService: UtilsService,
    private readonly _fb: FormBuilder
  ) {
    this.subscribtion = new Subscription();
    this.nacionalidades$ = [];
    this.departamentos$ = [];
    this.provincias$ = [];
    this.distritos$ = [];
    this.limitDocumentNumber = {
      min: 8,
      max: 8
    };

    this.form = this._fb.group({
      tipoDocumento: [2, Validators.required],
      numeroDocumento: [null, Validators.compose([
        Validators.pattern(/^[0-9]*$/),
        Validators.required,
        Validators.minLength(this.limitDocumentNumber.min),
        Validators.maxLength(this.limitDocumentNumber.max)
      ])],
      nombres: [{
        value: null,
        disabled: true
      }, Validators.required],
      apellidoPaterno: [{
        value: null,
        disabled: true
      }, Validators.required],
      apellidoMaterno: [{
        value: null,
        disabled: true
      }, Validators.required],
      sexo: [{
        value: null,
        disabled: true
      }, Validators.required],
      fechaNacimiento: [{
        value: null,
        disabled: true
      }, Validators.required],
      nacionalidad: [{
        value: null,
        disabled: true
      }, Validators.required],
      departamento: [null, Validators.required],
      provincia: [null, Validators.required],
      distrito: [null, Validators.required],
      direccion: [null, Validators.required],
      correo: [null, Validators.compose([
        Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN),
        Validators.required
      ])],
      numeroCelular: [null, Validators.compose([
        Validators.pattern(/^[0-9]*$/),
        Validators.required
      ])],
      porcentajeParticipacion: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.parameters();
    this.f['tipoDocumento'].valueChanges.subscribe((val) => {
      switch (Number(val)) {
        case 2:
          this.limitDocumentNumber = {
            min: 8,
            max: 8
          };
          break;
        case 4:
          this.limitDocumentNumber = {
            min: 9,
            max: 12
          };
          break;
      }
      console.log(this.f['numeroDocumento']);
      this.f['numeroDocumento'].setValidators(
        Validators.compose([
          Validators.minLength(this.limitDocumentNumber.min),
          Validators.maxLength(this.limitDocumentNumber.max)
        ])
      );
      this.f['numeroDocumento'].updateValueAndValidity();
      console.log(this.f['numeroDocumento']);
    });
    this.f['numeroDocumento'].valueChanges.subscribe((val) => {
      if (this.f['numeroDocumento'].hasError('pattern')) {
        this.f['numeroDocumento'].setValue(val.substring(0, val.length - 1));
      }
    });
    this.f['numeroCelular'].valueChanges.subscribe((val) => {
      if (this.f['numeroCelular'].hasError('pattern')) {
        this.f['numeroCelular'].setValue(val.substring(0, val.length - 1));
      }
    });
  }

  ngOnDestroy(): void {
    this.subscribtion.unsubscribe();
  }

  private parameters(): void {
    this.subscribtion.add(this._utilsService.parameters().subscribe(
      (res: ParametersResponse) => {
        console.dir(res);
        this.nacionalidades$ = <Array<INacionalidadModel>>res.nacionalidades;
        this.departamentos$ = <Array<IDepartamentoModel>>res.ubigeos;
        this.changeParameters();
      },
      (err: any) => {
        console.error(err);
      }
    ));
  }

  private changeParameters(): void {
    this.f['departamento'].valueChanges.subscribe((val) => {
      this.f['provincia'].setValue(null);
      this.f['distrito'].setValue(null);
      this.provincias$ = this.departamentos$.find(x => Number(x.id) === Number(val)).provincias;
      this.distritos$ = [];
    });
    this.f['provincia'].valueChanges.subscribe((val) => {
      this.f['distrito'].setValue(null);
      this.distritos$ = this.provincias$.find(x => Number(x.idProvincia) === Number(val)).distritos;
    });
  }

  get f(): any {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.valid) {

    }
  }
}
