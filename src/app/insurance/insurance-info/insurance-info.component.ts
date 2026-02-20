import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { District } from '@shared/models/district/district';
import { Municipality } from '@shared/models/municipality/municipality';
import { Province } from '@shared/models/province/province';
import { UbigeoService } from '@shared/services/ubigeo/ubigeo.service';
import { ProductResponse } from '../shared/models/product-response';
import { ClientInfoService } from '../shared/services/client-info.service';
import { UtilsService } from '@root/shared/services/utils/utils.service';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  ParametersResponse,
  INacionalidadModel,
  IDepartamentoModel
} from '@root/shared/models/ubigeo/parameters.model';
import { fadeAnimation } from '@root/shared/animations/animations';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { MainService } from '../shared/services/main.service';
import { HttpErrorResponse } from '@angular/common/http';
import { RegularExpressions } from '@shared/regexp/regexp';

@Component({
  standalone: false,
  selector: 'app-insurance-info',
  templateUrl: './insurance-info.component.html',
  styleUrls: ['./insurance-info.component.scss'],
  animations: [fadeAnimation]
})
export class InsuranceInfoComponent implements OnInit, OnDestroy {
  hasErrorParameters = false;
  derivationAdvisor = false;

  paramSubject = new Subscription();
  startValidityConfig: Partial<BsDatepickerConfig> = Object.assign(
    {},
    {
      locale: 'es',
      showWeekNumbers: false,
      minDate: new Date(),
      dateInputFormat: 'DD/MM/YYYY'
    }
  );
  endValidityConfig: Partial<BsDatepickerConfig> = Object.assign(
    {},
    {
      locale: 'es',
      showWeekNumbers: false,
      minDate: new Date(),
      dateInputFormat: 'DD/MM/YYYY'
    }
  );

  insuranceType: string;
  insuranceCategory: string;
  paymentFrequency: string;

  form!: FormGroup;  

  loaders = {
    validityType: true,
    paymentFrequency: true,
    activity: true,
    temporality: true,
    scope: true
  };

  loaders_u = {
    user: false,
    department: false,
    province: false,
    district: false
  };

  validityTypes = [];
  paymentFrequencies = [];
  activities = [];
  temporalities = [];
  scopes = [];

  product: ProductResponse;

  placeholderActivities: string;

  showCountry = false;
  showDepartments = false;

  flightTypes = [{ value: '1', label: 'Nacional' }];

  departments: Province[] = [];
  provinces: District[];
  districts: Municipality[];
  countries: any[] = [];

  nacionalidades$: Array<INacionalidadModel>;
  nacionalidadesCopy$: Array<INacionalidadModel>;

  departamentos$: Array<IDepartamentoModel>;
  departamentosCopy$: Array<IDepartamentoModel>;

  onDepartmentSuccess: Subject<void> = new Subject<void>();
  onProvinceSuccess: Subject<void> = new Subject<void>();
  onDistrictSuccess: Subject<void> = new Subject<void>();

  rawValues = {};

  constructor(
    private readonly router: ActivatedRoute,
    private readonly builder: FormBuilder,
    private readonly clientInfoService: ClientInfoService,
    private readonly locationService: UbigeoService,
    private readonly route: Router,
    private readonly utilsService: UtilsService,
    private readonly analyticsService: GoogleAnalyticsService,
    private readonly mainService: MainService,
    private readonly spinner: NgxSpinnerService,
  ) {
    this.form = this.builder.group({
    idMoneda: [null, Validators.required],
    validityType: [null, [Validators.required]],
    paymentFrequency: [null, [Validators.required]],
    startValidity: [null, [Validators.required]],
    endValidity: [null, [Validators.required]],
    activity: [null, [Validators.required]],
    temporality: [null, [Validators.required]],
    sinister: [null],
    sinisterAmount: [null],
    premium: [null],
    scope: [null, [Validators.required]],
    idZone: [null],
    idZonaRiesgo: [null],
    idPaisDestino: [null],
    idPaisOrigen: [null],
    idDepartamentoOrigen: [null],
    idDepartamentoDestino: [null],
    tipoPlan: [null],
    typeDestiny: [null],
    cantidadTrabajadores: [null, Validators.pattern(/^[0-9]*$/)]
  });
  }

  ngOnInit(): void {
    sessionStorage.removeItem('planes');
    sessionStorage.removeItem('planSelected');
    sessionStorage.removeItem('planSelectedUpdated');

    window.scrollTo(0, 0);
    this.mainService.nstep = 3.1;

    this.f['idMoneda'].valueChanges.subscribe((value: string) => {
      if (value) {
        this.getActivitiesBySegment();
      }
    });

    this.f['idMoneda'].setValue(this.session?.idMoneda || null, {
      emitEvent: false
    });
    const today = moment(this.session.startValidity || new Date()).toDate();

    this.paramSubject = this.router.params.subscribe((params) => {
      this.insuranceType = params.insuranceType;
      this.insuranceCategory = params.insuranceCategory;

      const productSelected = JSON.parse(
        sessionStorage.getItem('productSelected')
      );

      this.product = productSelected.find(
        (item) => item.key === this.insuranceType
      );
    });

    this.f['typeDestiny'].valueChanges.subscribe((val) => {
      if (val) {
        this.onTypeDestinySelected(Number(val));
      }
    });

    this.setDataFormOfSession();
    this.f['startValidity'].setValue(today);
    this.endValidityConfig = {
      ...this.endValidityConfig,
      minDate: today
    };

    this.getPaymentFrequencies();
    this.getTemporalities();
    this.parameters();
    this.setZone();

    this.f['validityType'].valueChanges.subscribe(() =>
      this.onValidityTypeSelected()
    );

    this.f['startValidity'].valueChanges.subscribe(() => {
      this.onValidityTypeSelected();
    });

    this.f['validityType'].valueChanges.subscribe((val) => {
      this.f['paymentFrequency'].setValue(val);
    });

    this.placeholderActivities = this.documentTypeInsurance !== 1 ? 'Ocupación del asegurado titular' : 'Actividad del contratante';

    this.form.valueChanges.subscribe(() => {
      this.saveInsuranceToStorage();
    });

    this.f['cantidadTrabajadores'].valueChanges.subscribe((val) => {
      if (this.f.cantidadTrabajadores.hasError('pattern')) {
        if (val) {
          this.f.cantidadTrabajadores.setValue(
            val.toString().substring(0, val.toString().length - 1)
          );
        }
      }
    });

    setTimeout(() => {
      this.analyticsService.emitGenericEventAP('Visualiza paso 3');
    }, 100);

    if (this.isProductTravel) {
      this.f['idZone'].setValidators(Validators.required)
      this.f['idZone'].updateValueAndValidity()
      this.f['idZone'].valueChanges.subscribe((val) => {
        if (val != 1) {
          this.f['idZonaRiesgo'].clearValidators();
        } else {
          this.f['idZonaRiesgo'].setValidators(Validators.required);
        }
        this.f['idZonaRiesgo'].updateValueAndValidity();
      });
    }

    this.f['idPaisOrigen'].valueChanges.subscribe((val: string) => {
      this.f['idPaisDestino'].setValue(null);
      this.nacionalidadesCopy$ = this.nacionalidades$?.filter(
        (x) => +x.id !== +val
      );
    });

    this.f['idDepartamentoOrigen'].valueChanges.subscribe((val: string) => {
      this.f['idDepartamentoDestino'].setValue(null);
      this.departamentosCopy$ = this.departamentos$?.filter(
        (x) => +x.id !== +val
      );
    });
  }

  ngOnDestroy(): void {
    this.paramSubject.unsubscribe();
  }

  get productSelected(): any {
    return JSON.parse(sessionStorage.getItem('productIdPolicy'));
  }

  setDataFormOfSession(): void {
    this.form.patchValue(this.session);
    this.f['scope'].setValue(2);
    this.f['temporality'].setValue(24);
    this.f['sinister'].setValue(false);
    this.f['typeDestiny'].setValue(
      [4, 8].includes(+this.productIdSelected) ? 1 : null
    );
  }

  parameters(): void {
    this.utilsService.parameters().subscribe(
      (res: ParametersResponse) => {
        this.nacionalidades$ = this.nacionalidadesCopy$ = res.nacionalidades;
        this.departamentos$ = this.departamentosCopy$ = res.ubigeos;

        // TODO: Show student occupation as the only option (CC)
        if (this.productIdSelected == 3 || this.productIdSelected == 7) {
          const studentActivity = res.ocupaciones.find((x) => x.id == 5);

          if (studentActivity) {
            this.activities = [{
              id: studentActivity.id,
              description: studentActivity.descripcion
            }];
            this.f['activity'].setValue(studentActivity.id);
            this.f['activity'].disable({ emitEvent: false });
          }
        }

        if (!!this.f['idPaisOrigen'].value) {
          this.nacionalidadesCopy$ = this.nacionalidades$?.filter(
            (x) => +x.id !== +this.f['idPaisOrigen'].value
          );
        }
        if (!!this.f['idDepartamentoOrigen'].value) {
          this.departamentosCopy$ = this.departamentos$?.filter(
            (x) => +x.id !== +this.f['idDepartamentoOrigen'].value
          );
        }
      },
      (err: any) => {
        console.error(err);
        this.hasErrorParameters = true;
        this.analyticsService.emitGenericEventAP(
          `Obtener ubigeo`,
          0,
          'Error al obtener el ubigeo',
          2
        );
      }
    );
  }

  saveInsuranceToStorage(): void {
    const viajes = [4, 8];
    const estudiantil = [3, 7];

    const data = {
      idMoneda: this.f['idMoneda'].value,
      tipoDestino: this.f.typeDestiny.value,
      cantidadTrabajadores: this.f['cantidadTrabajadores'].value || 1,
      tipoPeriodo: {
        id: this.f['validityType'].value,
        descripcion: this.validityTypes?.find(
          (x) => x.id == this.f['validityType'].value
        )?.description
      },
      frecuenciaPago: {
        id: this.f['validityType'].value,
        descripcion: this.validityTypes?.find(
          (x) => x.id == this.f['validityType'].value
        )?.description
      },
      actividad: {
        id: this.f['activity'].value,
        descripcion: this.activities?.find(
          (x) => Number(x.id) === Number(this.f['activity'].value)
        )?.description
      },
      temporalidad: {
        id: this.f['temporality'].value,
        descripcion: this.temporalities?.find(
          (x) => Number(x.id) === Number(this.f['temporality'].value)
        )?.descripcion
      },
      alcances: {
        id: this.f['scope'].value,
        descripcion: 'EXTERNO-INTERNO'
      },
      mina: {
        idDepartamentoMina: null, // this.session.idDepartamentoMina,
        departamentoMina: null, // 'LIMA',
        aplicaMina: false
      },
      riesgo: {
        idZona: viajes.includes(+this.productIdSelected)
          ? this.f['idZone'].value == 1
            ? 1
            : 2
          : 1,
        IdDepartamentoEmpresa: estudiantil.includes(+this.productIdSelected)
          ? this.f['idZonaRiesgo'].value
          : this.session.department || 14
      },
      viaje: {
        paisOrigen:
          this.session.paisOrigen || this.f.idPaisOrigen.value || null,
        paisDestino:
          this.session.paisDestino || this.f.idPaisDestino.value || null,
        idPaisOrigen: this.f.idPaisOrigen.value || null,
        idPaisDestino: this.f.idPaisDestino.value || null,
        idDepartamentoOrigen: this.f.idDepartamentoOrigen.value || null,
        departamentoOrigen: this.session.departamentoOrigen || null,
        idDepartamentoDestino: this.f.idDepartamentoDestino.value || null,
        departamentoDestino: this.session.departamentoDestino || null
      },
      siniestralidad: {
        aplicaSiniestralidad: false,
        montoSiniestralidad: this.f['sinisterAmount'].value || 0,
        montoDeducible: this.f['premium'].value || 0
      }
    };

    let endDate = null;

    if (this.f['endValidity'].value) {
      endDate =
        this.f['endValidity'].value?.toString().indexOf(' ') != -1
          ? moment(this.f['endValidity'].value).format('DD/MM/YYYY')
          : this.f['endValidity'].value;
    }

    const values = {
      ...this.form.getRawValue(),
      endValidity: endDate
    };

    const payload = {
      ...this.session,
      ...values,
      ...data,
      paymentFrequencyText: this.paymentFrequency
    };
    sessionStorage.setItem('insurance', JSON.stringify(payload));
    this.onSubmit();
  }

  get f() {
    return this.form.controls;
  }

  setZone() {
    this.f['idZone'].disable({
      emitEvent: false
    });
    switch (this.productIdSelected) {
      case 1: {
        this.f['tipoPlan'].setValue('Individual');
        this.f['idZone'].setValue('1');
        break;
      }
      case 2: {
        this.f['tipoPlan'].setValue('Familiar');
        this.f['idZone'].setValue('1');
        break;
      }
      case 3:
      case 7: {
        this.f['tipoPlan'].setValue('Estudiantil');
        break;
      }
      case 4:
      case 8: {
        this.f['tipoPlan'].setValue('Viajes');
        const tipoDestino = Number(this.f['typeDestiny']?.value || 0);
        this.f['idZone'].setValue(this.session.idZone || '1');
        this.f['idZone'].setValidators(Validators.required);
        this.f['idZonaRiesgo'].setValidators(Validators.required);

        this.f['idZone'].updateValueAndValidity({ emitEvent: false });
        this.f['idZonaRiesgo'].updateValueAndValidity({ emitEvent: false });

        if (tipoDestino === 1) {
          this.f['idPaisOrigen'].setValue(1);
          this.f['idPaisDestino'].setValue(1);
        } else {
          this.f['idDepartamentoOrigen'].setValue(null);
          this.f['idDepartamentoDestino'].setValue(null);
        }

        this.f['typeDestiny'].setValidators(Validators.required);
        this.f['typeDestiny'].updateValueAndValidity({ emitEvent: false });

        this.f['idZone'].enable({ emitEvent: false });
        break;
      }
      case 5: {
        this.f['tipoPlan'].setValue('Accidentes Laborales');
        this.f['idZone'].setValue(1);
        this.f['idZonaRiesgo'].setValue(this.session?.department);
        break;
      }
      case 6: {
        this.f['tipoPlan'].setValue('Aforo');
        this.f['idZone'].setValue('1');

        this.f['idZonaRiesgo'].setValidators(Validators.required);
        this.f['cantidadTrabajadores'].setValidators(
          Validators.compose([
            Validators.pattern(RegularExpressions.numbers),
            Validators.required
          ])
        );
        this.f['idZonaRiesgo'].updateValueAndValidity();
        this.f['cantidadTrabajadores'].updateValueAndValidity();
        break;
      }
      default: {
        this.f['tipoPlan'].setValue('Empresas');
        this.f['idZone'].setValue('1');
        break;
      }
    }
  }

  get session() {
    return JSON.parse(sessionStorage.getItem('insurance') || '{}');
  }

  get documentTypeInsurance(): number {
    return Number(JSON.parse(sessionStorage.getItem('insurance')).documentType);
  }

  showError(controlName: string): boolean {
    return (
      this.f[controlName].invalid &&
      (this.f[controlName].dirty || this.f[controlName].touched)
    );
  }

  get validityUnico(): boolean {
    if (Number(this.f.validityType?.value) === 6) {
      this.f.endValidity.enable();
      return true;
    }
    this.f.endValidity.disable();
    return false;
  }

  getPaymentFrequencies() {
    this.clientInfoService.getPaymentFrequencies(this.product?.productId).pipe(
      finalize(() => {
        this.loaders.paymentFrequency = false;
      })
    ).subscribe(
      (response) => {
        this.paymentFrequencies = this.validityTypes = response;
        if (!this.session.validityType) {
          if (response?.length == 1) {
            this.f['validityType'].setValue(response[0]?.id);
            this.onValidityTypeSelected();
          }
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.analyticsService.emitGenericEventAP(
          `Obtener frecuencias de pago`,
          0,
          'Error al obtener las frecuencias de pago',
          2
        );
      }
    );
  }

  getActivitiesBySegment() {
    // if (this.f['idMoneda'].invalid || this.documentTypeInsurance != 1) {
    if (this.f['idMoneda'].invalid || this.productIdSelected == 3 || this.productIdSelected == 7) {
      return;
    }

    if (this.f['idMoneda'].dirty) {
      this.f['activity'].setValue(null);
    }

    this.spinner.show();
    this.activities = [];

    const payload = {
      IdProceso: +this.session.processId,
      IdMoneda: +this.f['idMoneda'].value
    };

    this.clientInfoService.getActivitiesBySegment(payload).pipe(
      finalize(() => {
        this.loaders.activity = false;
      })
    ).subscribe(
      (response) => {
        this.spinner.hide();
        this.activities = response;
      },
      (error: HttpErrorResponse) => {
        console.error(error);

        this.spinner.hide();
        this.analyticsService.emitGenericEventAP(
          `Obtener actividades`,
          0,
          'Error al obtener actividades',
          2
        );
      }
    );
  }

  getTemporalities() {
    this.clientInfoService.getTemporality().pipe(
      finalize(() => {
        this.loaders.temporality = false;
      })
    ).subscribe((response) => (this.temporalities = response));
  }

  onValidityTypeSelected(e = null) {
    const validatiyId = e ? e.id : this.f['validityType'].value;
    const startValidity = moment(this.f['startValidity'].value);

    this.endValidityConfig = {
      ...this.endValidityConfig,
      minDate: startValidity.toDate()
    };

    if (!this.f['startValidity'].value) {
      return;
    }

    switch (+validatiyId) {
      case 6:
        const nextMonth = new Date(this.f.startValidity.value).setMonth(
          new Date(this.f.startValidity.value).getMonth() + 1
        );
        this.f.endValidity.setValue(moment(nextMonth).format('DD/MM/YYYY'));
        this.f.endValidity.enable();
        break;
      case 5:
        this.f['endValidity'].setValue(
          moment(startValidity).add(1, 'M').subtract(1, 'd').format('DD/MM/YYYY')
        );
        break;
      case 4:
        this.f['endValidity'].setValue(
          moment(startValidity).add(2, 'M').subtract(1, 'd').format('DD/MM/YYYY')
        );
        break;
      case 3:
        this.f['endValidity'].setValue(
          moment(startValidity).add(3, 'M').subtract(1, 'd').format('DD/MM/YYYY')
        );
        break;
      case 2:
        this.f['endValidity'].setValue(
          moment(startValidity).add(6, 'M').subtract(1, 'd').format('DD/MM/YYYY')
        );
        break;
      case 1:
        this.f['endValidity'].setValue(
          moment(startValidity).add(1, 'y').subtract(1, 'd').format('DD/MM/YYYY')
        );
        break;
      default:
        this.f.endValidity.setValue(null);
        this.f.endValidity.disable();
        break;
    }
  }

  onSubmit() {
    /*switch (this.productIdSelected) {
      case 4:
      case 8:
        this.f['idZonaRiesgo'].setValue(this.f['idDepartamentoDestino'].value, {
          emitEvent: false
        });
        break;
    }*/

    const ubicacion = this.departamentos$?.find(
      (obj) => obj.id == this.f['idZonaRiesgo'].value
    );

    sessionStorage.setItem(
      'insurance',
      JSON.stringify({
        ...this.session,
        ...this.form.getRawValue(),
        endValidity: this.session.endValidity,
        paymentFrequencyText: this.paymentFrequency,
        ubicacionEstudiantil: ubicacion?.descripcion
      })
    );

    this.mainService.nstep = 3;
    this.rawValues = {
      ...this.form.getRawValue(),
      insuranceInfoIsValid: this.form.valid
    };
  }

  get isValidForm(): boolean {
    if (this.form.get('sinister').value === true) {
      const SINESTER_AMMOUNT_IS_VALID: boolean =
        this.form.get('sinisterAmount')?.value !== null &&
        this.form.get('sinisterAmount')?.value !== '' &&
        this.form.get('sinisterAmount')?.value > 0;
      const PREMIUM: boolean =
        this.form.get('premium')?.value !== null &&
        this.form.get('premium')?.value !== '' &&
        this.form.get('premium')?.value > 0;
      return SINESTER_AMMOUNT_IS_VALID && PREMIUM && this.form.valid;
    }

    return this.form.valid;
  }

  get isTypeProductViajes(): boolean {
    return this.productIdSelected === 4 || this.productIdSelected === 8;
  }

  get isProductTravel(): boolean {
    return this.productIdSelected === 4 || this.productIdSelected === 8;
  }

  get isTypeProductLaboral(): boolean {
    return this.productIdSelected === 10;
  }

  get productIdSelected(): number {
    return Number(sessionStorage.getItem('productIdPolicy'));
  }

  onTypeDestinySelected(tipoDestino: number) {
    this.showDepartments = +tipoDestino === 1;
    this.showCountry = +tipoDestino === 2;

    this.f['idZone'].setValue(tipoDestino);

    if (this.showDepartments) {
      this.f['idPaisOrigen'].setValue(null);
      this.f['idPaisDestino'].setValue(null);

      this.f['idDepartamentoOrigen'].setValidators(Validators.required);
      this.f['idDepartamentoDestino'].setValidators(Validators.required);

      this.f['idPaisOrigen'].clearValidators();
      this.f['idPaisDestino'].clearValidators();
    }

    if (this.showCountry) {
      this.f['idDepartamentoOrigen'].setValue(null);
      this.f['idDepartamentoDestino'].setValue(null);

      this.f['idPaisOrigen'].setValidators(Validators.required);
      this.f['idPaisDestino'].setValidators(Validators.required);

      this.f['idDepartamentoOrigen'].clearValidators();
      this.f['idDepartamentoDestino'].clearValidators();
    }

    this.f['idDepartamentoOrigen'].updateValueAndValidity();
    this.f['idDepartamentoDestino'].updateValueAndValidity();
    this.f['idPaisOrigen'].updateValueAndValidity();
    this.f['idPaisDestino'].updateValueAndValidity();
  }

  derivationAdvisorClose(event): void {
    this.derivationAdvisor = event;
  }

  backToHome(): void {
    const idSesion = sessionStorage.getItem('0FF2C61A');
    sessionStorage.clear();

    if (!!idSesion) {
      sessionStorage.setItem('0FF2C61A', idSesion);
    }

    this.route.navigate(['/accidentespersonales']);
  }

  onClickSubmit(): void {
    this.form.markAllAsTouched();
  }
}
