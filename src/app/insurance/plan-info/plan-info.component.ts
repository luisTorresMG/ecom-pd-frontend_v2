import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import moment from 'moment';
import * as FileSaver from 'file-saver';
import { Subscription } from 'rxjs/Subscription';
import { Strings } from './constans/strings';
import { BenefitResponse } from '../shared/models/benefit-response';
import { ComparisonRequest } from '../shared/models/comparison-request';
import { PlanResponse } from '../shared/models/plan-response';
import { ServiceResponse } from '../shared/models/service-response';
import { ClientInfoService } from '../shared/services/client-info.service';
import { fadeAnimation } from '@root/shared/animations/animations';
import { base64ToArrayBuffer } from '@root/shared/helpers/utils';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { UtilsService } from '@shared/services/utils/utils.service';
import { GoogleTagService } from '../shared/services/google-tag-service';

@Component({
  selector: 'app-plan-info',
  templateUrl: './plan-info.component.html',
  styleUrls: ['./plan-info.component.scss'],
  animations: [fadeAnimation]
})
export class PlanInfoComponent implements OnInit {
  paramSubject = new Subscription();
  form: FormGroup;
  coverageForm: FormArray;
  productSelected: any;

  insuranceType: string;
  insuranceCategory: string;
  tabSelected = 'coverage';

  cantidadTrabajadores: number;

  assistanceCoverage: any = [];

  insurance: {
    plan?: PlanResponse;
    asistencias?: ServiceResponse[];
    beneficios?: BenefitResponse[];
    idTarifario?: string;
    nombreTarifario?: string;
    versionTarifario?: string;
  } = {};

  get planSeleccionado(): any {
    return JSON.parse(sessionStorage.getItem('planSelected'));
  }

  insuranceInfo = JSON.parse(sessionStorage.getItem('insurance'));

  currencyConfiguration = {
    prefix: this.insuranceInfo.idMoneda == 1 ? 'S/ ' : '$ ',
    thousands: ',',
    decimal: '.'
  };

  detailAssist = [];

  acceptTermsAssist = sessionStorage.getItem('acceptTermsAssistStorage') == '1';

  constructor(
    private readonly router: ActivatedRoute,
    private readonly route: Router,
    private readonly clientService: ClientInfoService,
    private readonly fb: FormBuilder,
    private readonly _decimalPipe: DecimalPipe,
    private readonly _spinner: NgxSpinnerService,
    private readonly _ga: GoogleAnalyticsService,
    private readonly utilsService: UtilsService,
    private readonly _vc: ViewContainerRef,
    private readonly gts: GoogleTagService
  ) {
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.getDetailAssist();

    this.paramSubject = this.router.params.subscribe((params) => {
      this.insuranceType = params.insuranceType;
      this.insuranceCategory = params.insuranceCategory;
    });

    this.insurance = JSON.parse(sessionStorage.getItem('planSelected') || '{}');

    this.cantidadTrabajadores = +sessionStorage.getItem('cantidadTrabajadores');

    this.productSelected = JSON.parse(
      sessionStorage.getItem('_producto_selecionado')
    );

    if (this.productSelected.key == 'individual_hits') {
      this.insurance.plan.asistencias = this.insurance.plan.asistencias.map(
        (x) => ({
          ...x,
          selected: true,
          disabled: true
        })
      );
    }

    switch (+this.productSelected.productId) {
      case 1:
        this.assistanceCoverage = Strings.personalIndividual;
        break;
      case 2:
        this.assistanceCoverage = Strings.personalFamiliar;
        this.productSelected.name = 'Familiar (considerar hasta 5 asegurados)';
        break;
      case 3:
        this.assistanceCoverage = Strings.personalEstudiantil;
        break;
      case 5:
        this.assistanceCoverage = Strings.empresasLaborales;
        this.productSelected.name = 'Empresas';
        break;
      case 7:
        this.assistanceCoverage = Strings.empresasEstudiantil;
        break;
      default:
        this.assistanceCoverage = [];
    }

    this.form = this.fb.group({
      coverage: this.fb.array([])
    });

    this.insurance.plan.coberturas.forEach((coverage) => {
      this.coverageForm = this.form.get('coverage') as FormArray;
      coverage.selected = coverage.obligatoria?.toString() === '1' || coverage.selected;
      sessionStorage.setItem('planSelected', JSON.stringify(this.insurance));
      this.coverageForm.push(this.createCoverageForm(coverage));
    });
  }

  getDetailAssist(): void {
    const uri =
      'assets/accidentes-personales/resources/detalle-asistencias.json';
    this.utilsService.fetchResource(uri).subscribe({
      next: (response: any) => {
        this.detailAssist = response || [];
      },
      error: (error: any) => {
        console.error(error);
        this.detailAssist = [];
      }
    });
  }

  createCoverageForm(coverage): FormGroup {
    return this.fb.group({
      amount: [
        (+coverage.capital).toFixed(2),
        [
          Validators.required,
          Validators.max(coverage.capitalMaxima),
          Validators.min(coverage.capitalMinima)
        ]
      ]
    });
  }

  get session() {
    return JSON.parse(sessionStorage.getItem('insurance') || '{}');
  }

  changeTab(tabName: string) {
    this.tabSelected = tabName;
  }

  onCheckboxSelected(coverage: any) {
    coverage.selected = !coverage.selected;
    this.updatePlan();
  }

  onInputChange(coverage, val: string, i) {
    const splitValue: Array<string> | string = val.split('.');
    splitValue[0] = splitValue[0].replace(/[\D]/g, '');

    const valueTransform = `${splitValue[0]}.${splitValue[1]}`;

    if (+valueTransform == +coverage.capital) {
      return;
    }

    if (+valueTransform > +coverage.capitalMaxima) {
      coverage.capital = parseFloat(coverage.capitalMaxima).toFixed(2);
      coverage.selected = true;
      this.form
        .get('coverage')
        ['controls'][i]['controls'].amount.setValue(coverage.capitalMaxima);
      this.updatePlan();
      return;
    }

    if (+valueTransform < +coverage.capitalMinima) {
      coverage.capital = parseFloat(coverage.capitalMinima).toFixed(2);
      coverage.selected = true;
      this.form
        .get('coverage')
        ['controls'][i]['controls'].amount.setValue(coverage.capitalMinima);
      this.updatePlan();
      return;
    }

    if (
      +valueTransform >= +coverage.capitalMinima &&
      +valueTransform <= +coverage.capitalMaxima
    ) {
      coverage.capital = parseFloat(valueTransform).toFixed(2);
      coverage.selected = true;
      this.form
        .get('coverage')
        ['controls'][i]['controls'].amount.setValue(coverage.capital);
      this.updatePlan();
    }
  }

  onIncrease(coverage, formInput: number) {
    const cap = Number(coverage.capital) + 500;
    if (
      cap >= Number(coverage.capitalMinima) &&
      cap <= Number(coverage.capitalMaxima)
    ) {
      coverage.capital = parseFloat(cap.toString()).toFixed(2);
      coverage.selected = true;
      this.form
        .get('coverage')
        ['controls'][formInput]['controls'].amount.setValue(coverage.capital);
      this.updatePlan();
    }
  }

  onDecrease(coverage, formInput: number) {
    const cap = Number(coverage.capital) - 500;
    if (
      cap >= Number(coverage.capitalMinima) &&
      cap <= Number(coverage.capitalMaxima)
    ) {
      coverage.capital = parseFloat(cap.toString()).toFixed(2);
      coverage.selected = true;
      this.form
        .get('coverage')
        ['controls'][formInput]['controls'].amount.setValue(coverage.capital);
      this.updatePlan();
    }
  }

  updatePlan() {
    const covarageSelected = this.insurance.plan.coberturas.filter(
      (item) => item['selected'] || item.obligatoria?.toString() === '1'
    );

    const benefitsSelected = this.insurance.plan.beneficios.filter(
      (item) => item['selected']
    );

    const request = new ComparisonRequest({
      ...this.session,
      codigoProcesoPlan: this.insurance.plan.codigoProceso,
      cantidadTrabajadores: this.cantidadTrabajadores,
      coverage: covarageSelected,
      benefits: benefitsSelected,
      services: this.insurance.plan.asistencias,
      planId: this.insurance.plan.id,
      endValidity: this.session.endValidity,
      startValidity: moment(this.session.startValidity)
        .format('DD/MM/YYYY')
        .toString(),
      idTarifario: this.insurance?.plan?.idTarifario,
      nombreTarifario: this.insurance?.plan?.nombreTarifario,
      versionTarifario: this.insurance?.plan?.versionTarifario
    });

    switch (+this.session.productId) {
      case 3:
      case 7:
        if (+this.session.idZone !== 1) {
          request.idZona = 2;
          request.idZonaRiesgo = this.session.idZone;
        } else {
          request.idZona = 2;
          request.idZonaRiesgo = this.session.idZonaRiesgo;
        }
        break;
      case 4:
      case 8:
        if (+this.session.idZone !== 1) {
          request.idZona = 2;
          request.idZonaRiesgo = this.session.idPaisDestino;
        } else {
          request.idZona = 1;
          request.idZonaRiesgo = this.session.idDepartamentoDestino;
        }
        break;
      case 6:
        request.idZona = 1;
        request.idZonaRiesgo = this.session.idZonaRiesgo;
        break;
      default:
        request.idZona = this.session.country;
        request.idZonaRiesgo = this.session.department;
        break;
    }

    if (!request.idZonaRiesgo) {
      request.idZonaRiesgo = this.session.department;
    }

    this._spinner.show();
    this.clientService.updatePlan(request).subscribe(
      (res: any) => {
        this._spinner.hide();
        this.insurance.plan.prima = res.prima;
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  get planSelected(): any {
    return JSON.parse(sessionStorage.getItem('planSelected'));
  }

  backStepComparison() {
    this._ga.emitGenericEventAP(`Clic en 'Anterior'`);
    this.route.navigate([
      `/accidentespersonales/${this.insuranceCategory}/${this.insuranceType}/step-3/comparison`
    ]);
  }

  applyDataPlanSelected(save: boolean = false): void {
    if (save) {
      this._ga.emitGenericEventAP(`Clic en 'Aplicar'`);
      const tagManayerPayload = {
        event: 'virtualEventGA4_A7',
        Producto: 'Accidentes Personales',
        Paso: 'Paso 3',
        Sección: 'Detalles del plan',
        TipoAcción: 'Intento avance',
        CTA: 'Aplicar',
        CheckTerminos: this.acceptTermsAssist ? 'Activado' : 'Desactivado',
        ProgramaAsistencia: this.insurance.plan?.asistencias.some(
          (item) => item.selected === true
        )
          ? 'Activado'
          : 'Desactivado',
        tipoPlan: this.planSelected.plan?.descripcion,
        NombreSeguro: this.session.namePlan,
        TipoDocumento:
          this.session.documentType == 1
            ? 'RUC'
            : this.session.documentType == 2
              ? 'DNI'
              : 'CE',
        TipoMoneda: this.session.idMoneda == 1 ? 'Soles' : 'Dólares',
        Vigencia: this.session.frecuenciaPago?.descripcion,
        InicioVigencia: moment(this.session.startValidity).format('DD/MM/YYYY'),
        FinVigencia: this.session.endValidity,
        NumBeneficiarios: this.session.insuranceInfo.cantidadBeneficiarios,
        NumAsegurados: this.session.insuranceInfo.cantidadAsegurados,
        Ocupacion: this.session.actividad?.descripcion,
        pagePath: window.location.pathname,
        timeStamp: new Date().getTime(),
        user_id: this.session.id,
        TipoCliente: this.session.tipoCliente,
        ID_Proceso: this.session.processId,
        Canal: 'Venta Directa',
      };
      this.gts.virtualEvent(tagManayerPayload);

    const tagManayerPayloadResponse = {
      ...tagManayerPayload,
      TipoAcción: 'Avance exitoso'
    };
    this.gts.virtualEvent(tagManayerPayloadResponse);

    const dataInsurance = {
      ...this.session,
      checkTerminosAsistencia: this.acceptTermsAssist,
      checkProgramaAsistencia: this.insurance.plan?.asistencias.some(
        (item) => item.selected === true
      )
    };
    sessionStorage.setItem('insurance', JSON.stringify(dataInsurance));

      sessionStorage.setItem(
        'planSelectedUpdated',
        JSON.stringify(this.insurance)
      );
    }

    this.route.navigate([
      `/accidentespersonales/${this.insuranceCategory}/${this.insuranceType}/step-3/comparison`
    ]);
  }

  ammountTransform(val: any): string {
    return (+val).toFixed(2);
  }

  ammountTransformNoIgv(val: any): string {
    return (+val / 1.18).toFixed(2);
  }

  closeModal(): void {
    this._vc.clear();
  }

  get asistenciasValido(): boolean {
    const asistencias = this.insurance.plan.asistencias.filter(
      (x: any) => !x.disabled
    );

    const productSelected = JSON.parse(
      sessionStorage.getItem('_producto_selecionado')
    );

    if (productSelected.key == 'individual_hits') {
      return this.planSeleccionado?.plan?.asistencias.length == 0
        ? true
        : this.acceptTermsAssist;
    }

    if (asistencias.every((x) => !x.selected)) {
      return true;
    }

    return asistencias.some((x) => x.selected) && this.acceptTermsAssist;
  }

  downloadPdf(): void {
    this.utilsService
      .fetchResource(
        'assets/accidentes-personales/resources/programa-asistencias.pdf',
        'arraybuffer'
      )
      .subscribe({
        next: (response: ArrayBuffer) => {
          const payload = {
            fileName: 'programa-asistencias.pdf',
            file: response
          };

          this.utilsService.downloadFile(payload);
        },
        error: (error: any) => {
          console.error(error);
        }
      });
  }

  downloadFile(payload: { nombre: string; archivo: string }): void {
    if (payload) {
      const arrBuffer = base64ToArrayBuffer(payload.archivo);
      const data: Blob = new Blob([arrBuffer], { type: 'application/pdf' });
      FileSaver.saveAs(data, payload.nombre);
    }
  }

  changeTerms(checked: boolean): void {
    this.acceptTermsAssist = checked;
    sessionStorage.setItem(
      'acceptTermsAssistStorage',
      this.acceptTermsAssist ? '1' : '0'
    );
  }
}
