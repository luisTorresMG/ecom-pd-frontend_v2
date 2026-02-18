import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import { UtilsService } from '@shared/services/utils/utils.service';
import { Subscription } from 'rxjs/Subscription';
import { BenefitResponse } from '../shared/models/benefit-response';
import { PlanResponse } from '../shared/models/plan-response';
import { ServiceResponse } from '../shared/models/service-response';
import { ClientInfoService } from '../shared/services/client-info.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { fadeAnimation } from '@root/shared/animations/animations';
import moment from 'moment';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { MainService } from '../shared/services/main.service';
import { ValidateQuotationService } from '../shared/services/validate-quotation.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ComparisonRequest } from '../shared/models/comparison-request';
import { AseguradoDto } from '../shared/models/asegurado.model';
import { GoogleTagService } from '../shared/services/google-tag-service';
import { Strings } from './constans/strings';
import {
  FormBuilder,
  FormControl
} from '@angular/forms';

interface ProductAssistance {
  desc: string;
  coverage: string;
  amount: string;
}

@Component({
  selector: 'app-insurance-comparison',
  templateUrl: './insurance-comparison.component.html',
  styleUrls: ['./insurance-comparison.component.scss'],
  animations: [fadeAnimation]
})
export class InsuranceComparisonComponent implements OnInit, AfterViewInit {
  paramSubject = new Subscription();
  insuranceType: string;
  insuranceCategory: string;

  insurance: {
    success?: boolean;
    errorMessage?: string;
    plans?: PlanResponse[];
    asistencias?: ServiceResponse[];
    beneficios?: BenefitResponse[];
    cotizacion?: number;
  } = {};

  dataAsegurados: Array<AseguradoDto> = JSON.parse(
    sessionStorage.getItem('dataAsegurados') || '[]'
  );

  planes: object = {};
  derivationAdvisor = false;

  idPlanSelected: number;

  slideIndex: number = 1;

  hasErrorSubmit: boolean = false;
  hasErrorPlans: boolean = false;

  productAssistanceList: ProductAssistance[] = [];

  productSelected =
    JSON.parse(sessionStorage.getItem('_producto_selecionado')) ?? {};

  plansSelected: any[] = [];

  // checkAssistanceControl: FormControl = this.builder.control(true);
   checkAssistanceControl!: FormControl ;

  indexGroup = 1;
  itemsPerView = 3;

  @ViewChild('modalAssistance', { static: true, read: TemplateRef })
  modalAssistance: TemplateRef<ElementRef>;

  constructor(
    private readonly vcr: ViewContainerRef,
    private readonly builder: FormBuilder,
    private readonly clientService: ClientInfoService,
    private readonly router: ActivatedRoute,
    private readonly route: Router,
    private readonly spinner: NgxSpinnerService,
    private readonly ga: GoogleAnalyticsService,
    private readonly mainService: MainService,
    private readonly validateQuotationService: ValidateQuotationService,
    private readonly utilsService: UtilsService,
    private readonly el: ElementRef,
    private readonly renderer: Renderer2,
    private readonly gts: GoogleTagService
  ) {
    this.checkAssistanceControl = this.builder.control(true);
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.mainService.nstep = 3;

    if (sessionStorage.getItem('planes')) {
      this.insurance = JSON.parse(sessionStorage.getItem('planes'));
      this.updatePlan();
    } else {
      this.getPlans();
    }

    if (this.sessionPlanSelected) {
      this.idPlanSelected = this.sessionPlanSelected.plan?.id;
    } else {
      this.idPlanSelected = 0;
    }

    this.paramSubject = this.router.params.subscribe((params) => {
      this.insuranceType = params.insuranceType;
      this.insuranceCategory = params.insuranceCategory;
    });

    /*if (window.innerWidth < 620) {
      this.itemsPerView = 1
    }

    if (window.innerWidth > 620) {
      this.itemsPerView = 2
    }

    if (window.innerWidth > 820) {
      this.itemsPerView = 3
    }
    window.addEventListener('resize', () => {
      if (window.innerWidth < 620) {
        this.itemsPerView = 1
      }

      if (window.innerWidth > 620) {
        this.itemsPerView = 2
      }

      if (window.innerWidth > 820) {
        this.itemsPerView = 3
      }
    });*/
  }

  ngAfterViewInit() {
    const slider = this.el.nativeElement.querySelector('.plans');
    let isDragging = false;
    let startPos = 0;

    this.renderer.listen(slider, 'mousedown', (event) => {
      isDragging = true;
      startPos = event.clientX;
      slider.style.cursor = 'grabbing';
    });

    this.renderer.listen(slider, 'mouseup', () => {
      isDragging = false;
      slider.style.cursor = 'grab';
    });

    this.renderer.listen(slider, 'mousemove', (event) => {
      if (!isDragging) return;

      const delta = event.clientX - startPos;
      slider.scrollLeft -= delta;
      startPos = event.clientX;
    });

    this.renderer.listen('document', 'mouseup', () => {
      isDragging = false;
      slider.style.cursor = 'grab';
    });
  }

  /**
   * The changePlan function is used to change the plan that is displayed on the screen.
   * @return Nothing, so it's return type is void
   * @param type
   */

  /*changePlan(type: number): void {
    if (type == 1) {
      if ((this.itemsPerView * (this.indexGroup + 1)) - this.itemsPerView > this.insurance?.plans?.length) {
        return;
      }

      this.indexGroup++;
      return;
    }

    if ((this.itemsPerView * (this.indexGroup - 1)) < 0) {
      return;
    }

    this.indexGroup--;
    if (this.slideIndex - 2 < 1) {
      this.slideIndex = 1;
    } else {
      this.slideIndex -= 2;
    }
  }*/

  get session() {
    return JSON.parse(sessionStorage.getItem('insurance')) || null;
  }

  get sessionPlanSelected(): any {
    return JSON.parse(sessionStorage.getItem('planSelected')) || null;
  }

  get sessionPlanSelectedUpdated(): any {
    return JSON.parse(sessionStorage.getItem('planSelectedUpdated')) || null;
  }

  updatePlan(): void {
    if (this.sessionPlanSelectedUpdated !== null) {
      const findPlan = this.insurance.plans.find(
        (x) => Number(x.id) === Number(this.sessionPlanSelectedUpdated.plan.id)
      );
      const idx = this.insurance.plans.indexOf(findPlan);
      this.insurance.plans[idx] = this.sessionPlanSelectedUpdated.plan;
    }
    const session = {
      ...this.session,
      ...this.insurance
    };
    sessionStorage.setItem('insurance', JSON.stringify(session));
    sessionStorage.setItem(
      'planSelected',
      JSON.stringify(
        this.sessionPlanSelectedUpdated || this.sessionPlanSelected
      )
    );
  }

  async updatePlansIndividualHits(data: any, complete = false): Promise<any> {
    const covarageSelected = data.coberturas.filter(
      (item) => item['selected'] || item.obligatoria?.toString() === '1'
    );

    const benefitsSelected = data.beneficios.filter((item) => item['selected']);

    const servicesSelected = data.asistencias;

    const request = new ComparisonRequest({
      ...this.session,
      codigoProcesoPlan: data.codigoProceso,
      coverage: covarageSelected,
      benefits: benefitsSelected,
      services: servicesSelected,
      planId: data.id,
      endValidity: this.session.endValidity,
      startValidity: moment(this.session.startValidity).format('DD/MM/YYYY').toString(),
      idTarifario: data?.idTarifario,
      nombreTarifario: data?.nombreTarifario,
      versionTarifario: data?.versionTarifario
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

    this.spinner.show();
    return this.clientService.updatePlan(request).subscribe(
      (res: any) => {
        if (!res.success) {
          return;
        }

        data.prima = res.prima;

        const index = this.insurance?.plans?.findIndex(
          (x) => x.codigoProceso == data.codigoProceso
        );
        this.insurance.plans[index] = data;
        sessionStorage.setItem('planes', JSON.stringify(this.insurance));

        if (complete) {
          this.spinner.hide();
        }
      },
      (err: any) => {
        console.error(err);
        if (complete) {
          this.spinner.hide();
        }
      }
    );
  }

  getPlans() {
    const plans = JSON.parse(sessionStorage.getItem('service-plans'));

    const productSelected = JSON.parse(
      sessionStorage.getItem('_producto_selecionado')
    );

    this.insurance = plans;

    this.insurance.plans = this.insurance.plans?.filter(
      (x) => Number(x.prima) > 0
    );

    if (productSelected.key == 'individual_hits') {
      this.insurance.plans.forEach(async (x, index: number) => {
        await this.updatePlansIndividualHits(
          x,
          this.insurance.plans.length == index + 1
        );
      });
    }

    this.updatePlan();

    if (!plans.plans?.length || !plans.coverage?.length) {
      this.derivationAdvisor = true;
      this.ga.emitGenericEventAP(`Visualiza 'Derivación a asesor'`);
      return;
    }

    this.derivationAdvisor = false;
    sessionStorage.setItem('planes', JSON.stringify(plans));
  }

  onPlanSelected(plan, emit?: boolean) {
    const payload = {
      plan,
      benefits: this.insurance.beneficios,
      services: this.insurance.asistencias
    };
    if (!emit) {
      this.ga.emitGenericEventAP(`Selecciona plan ${plan.descripcion}`);
    }
    sessionStorage.setItem('planSelected', JSON.stringify(payload));
    sessionStorage.setItem('planSelectedUpdated', JSON.stringify(payload));
  }

  goToPlanDetail(plan): void {
    sessionStorage.setItem('acceptTermsAssistStorage', '0');
    this.onPlanSelected(plan, true);
    this.ga.emitGenericEventAP(`Clic en 'Ver detalle' ${plan.descripcion}`);

    const tagManagerPayloadInfo = {
      event: 'virtualEventGA4_A6',
      Producto: 'Accidentes Personales',
      Paso: 'Paso 3',
      Sección: 'Comparación del seguro',
      TipoAcción: 'Seleccionar boton',
      CTA: this.sessionPlanSelected.plan?.asistencias.length
        ? 'Elige tus asistencias'
        : 'Ver detalle',
      tipoPlan: this.sessionPlanSelected.plan?.descripcion,
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
      Canal: 'Venta Directa'
    };
    this.gts.virtualEvent(tagManagerPayloadInfo);

    this.mainService.nstep = 3.1;
    this.route.navigate([
      `/accidentespersonales/${this.insuranceCategory}/${this.insuranceType}/step-3/plan-info`
    ]);
  }

  backStep(): void {
    this.ga.emitGenericEventAP(`Clic en 'Anterior'`);
    sessionStorage.removeItem('planes');
    sessionStorage.removeItem('planSelected');
    sessionStorage.removeItem('planSelectedUpdated');
    this.route.navigate([`/accidentespersonales/${this.insuranceCategory}/${this.insuranceType}/step-3`]);
  }

  get productType(): number {
    return Number(sessionStorage.getItem('productIdPolicy') || '0');
  }

  nextStep(): void {
    this.ga.emitGenericEventAP(`Clic en 'Siguiente'`);

    const tagManagerPayload = {
      event: 'virtualEventGA4_A6',
      Producto: 'Accidentes Personales',
      Paso: 'Paso 3',
      Sección: 'Elegir Plan',
      TipoAcción: 'Intento de avance',
      CTA: 'Siguiente',
      tipoPlan: this.sessionPlanSelected.plan?.descripcion,
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
      Canal: 'Venta Directa'
    };
    this.gts.virtualEvent(tagManagerPayload);

    const coberturas: Array<any> = [];
    this.sessionPlanSelected?.plan.coberturas
      .filter((x) => x?.selected || x?.obligatoria === '1')
      .forEach((e) => {
      const cobs: any = {
        id: e.id?.toString(),
        descripcion: e.descripcion,
        obligatorio: Number(e.obligatoria) === 1,
        seleccionado: Number(e.selected) === 1 || Number(e.obligatoria) === 1,
        sumaAsegurada: Number(e.capital)
      };
      coberturas.push(cobs);
    });
    const beneficios: Array<any> = [];
    this.sessionPlanSelected?.plan.beneficios
      .filter((x) => x?.selected)
      .forEach((e) => {
      const benf: any = {
        id: e.id?.toString(),
        descripcion: e.descripcion,
        seleccionado: Number(e.selected) === 1
      };
      beneficios.push(benf);
    });
    const asistencias: Array<any> = [];
    const productSelected = JSON.parse(
      sessionStorage.getItem('_producto_selecionado')
    );

    this.sessionPlanSelected?.plan.asistencias
      .forEach((e) => {
        const asist: any = {
          id: e.id?.toString(),
          descripcion: e.descripcion,
          documento: e.documento,
          seleccionado: true,
          idProveedor: e.proveedor.id,
          proveedor: e.proveedor.description
        };
        asistencias.push(asist);
      });

    const planes: any = {
      cantidadTrabajadores: this.session?.cantidadTrabajadores || 1,
      idProcess: this.session?.processId,
      fechaInicio: moment(this.session.startValidity).format('DD/MM/YYYY').toString(),
      fechaFin: this.session?.endValidity,
      plan: {
        idPlan: this.sessionPlanSelected?.plan.id,
        idMoneda: this.session.idMoneda,
        nombrePlan: this.sessionPlanSelected?.plan.descripcion,
        codigoSegmentoPlan: this.sessionPlanSelected?.plan.codigoSegmento,
        codigoProcesoPlan: this.sessionPlanSelected?.plan.codigoProceso,
        montoPrima: this.sessionPlanSelected?.plan.prima,
        idTarifario: this.sessionPlanSelected?.plan.idTarifario,
        versionTarifario: this.sessionPlanSelected?.plan.versionTarifario,
        nombreTarifario: this.sessionPlanSelected?.plan.nombreTarifario
      },
      actividad: {
        id: this.session.actividad.id,
        descripcion: this.session.actividad.descripcion
      },
      tipoPeriodo: {
        id: this.session?.tipoPeriodo?.id,
        descripcion: this.session?.tipoPeriodo?.descripcion
      },
      frecuenciaPago: {
        id: this.session?.frecuenciaPago?.id,
        descripcion: this.session?.frecuenciaPago?.descripcion
      },
      temporalidad: {
        id: this.session?.temporalidad?.id,
        descripcion: this.session?.temporalidad?.descripcion
      },
      alcance: {
        id: this.session?.alcances?.id,
        descripcion: this.session?.alcances?.descripcion
      },
      mina: {
        idDepartamentoMina: this.session?.mina?.idDepartamentoMina || null,
        departamentoMina: this.session?.mina?.departamentoMina || null,
        aplicaMina: this.session?.mina?.aplicaMina || false
      },
      riesgo: {
        IdDepartamentoEmpresa: this.session?.riesgo?.IdDepartamentoEmpresa,
        idZona: this.session?.riesgo.idZona
      },
      viaje: {
        idPaisOrigen: this.session?.viaje?.idPaisOrigen,
        paisOrigen: this.session?.viaje?.paisOrigen,
        idPaisDestino: this.session?.viaje?.idPaisDestino,
        paisDestino: this.session?.viaje?.paisDestino,
        idDepartamentoOrigen: this.session?.viaje?.idDepartamentoOrigen,
        departamentoOrigen: this.session?.viaje?.departamentoOrigen,
        idDepartamentoDestino: this.session?.viaje?.idDepartamentoDestino,
        departamentoDestino: this.session?.viaje?.departamentoDestino
      },
      siniestralidad: {
        aplicaSiniestralidad:
          this.session?.siniestralidad?.aplicaSiniestralidad || false,
        montoSiniestralidad:
          this.session?.siniestralidad?.montoSiniestralidad || 0,
        montoDeducible: this.session?.siniestralidad?.montoDeducible || 0
      },
      coberturas: coberturas,
      beneficios: beneficios,
      asistencias: asistencias,
      cantidadAsegurados: this.dataAsegurados?.length || 1,
      prima: this.sessionPlanSelected?.plan.prima
    };

    this.spinner.show();
    this.mainService.nstep = 3;

    const beneficiarios = [];
    const asegurados = [];

    this.dataAsegurados?.forEach((x) => {
      x.beneficiarios.forEach((e) => {
        beneficiarios.push({
          ...e,
          correo: e.email,
          nombres: e.nombre,
          idDepartamento: e.departamento.id,
          departamento: e.departamento.descripcion,
          idProvincia: e.provincia.id,
          provincia: e.provincia.descripcion,
          idDistrito: e.distrito.id,
          distrito: e.distrito.descripcion,
          idEstadoCivil: e.idEstadoCivil,
          porcentajeParticipacion: e.porcentaje,
          idRelacion: e.relacion.id,
          relacion: e.relacion.descripcion,
          celular: e.telefono
        });
      });
      const dataAsegurados = {
        idTipoPersona: x.idTipoPersona,
        nombres: x.nombre,
        apellidoMaterno: x.apellidoMaterno,
        apellidoPaterno: x.apellidoPaterno,
        direccion: x.direccion,
        correo: x.email,
        fechaNacimiento: x.fechaNacimiento,
        idNacionalidad: x.idNacionalidad,
        idSexo: x.idSexo,
        idEstadoCivil: x.idEstadoCivil,
        idTipoDocumento: x.idTipoDocumento,
        nombre: x.nombre,
        numeroDocumento: x.numeroDocumento,
        celular: x.telefono,
        idDepartamento: x.departamento.id,
        departamento: x.departamento.descripcion,
        idProvincia: x.provincia.id,
        provincia: x.provincia.descripcion,
        idDistrito: x.distrito.id,
        distrito: x.distrito.descripcion,
        idRelacion: x.idRelacionContratante,
        relacion: x.relacionContratante
      };
      asegurados.push(dataAsegurados);
    });

    this.planes = planes;

    const request = {
      idProcess: this.session?.processId,
      plan: {
        idPlan: this.sessionPlanSelected?.plan.id,
        idMoneda: this.session.idMoneda,
        nombrePlan: this.sessionPlanSelected?.plan.descripcion,
        codigoSegmentoPlan: this.sessionPlanSelected?.plan.codigoSegmento,
        codigoProcesoPlan: this.sessionPlanSelected?.plan.codigoProceso,
        montoPrima: this.sessionPlanSelected?.plan.prima,
        idTarifario: this.sessionPlanSelected?.plan.idTarifario,
        versionTarifario: this.sessionPlanSelected?.plan.versionTarifario,
        nombreTarifario: this.sessionPlanSelected?.plan.nombreTarifario
      },
      coberturas: coberturas,
      beneficios: beneficios,
      asistencias: asistencias,
      cantidadAsegurados: this.session?.cantidadTrabajadores || 1
    };

    this.validateQuotationService.generarCotizacion(request).subscribe((response: any) => {

      if (response?.data.reglaNegocio) {
        this.ga.emitGenericEventAP('Derivación al Asesor');
        this.spinner.hide();
        this.derivationAdvisor = true;
        return;
      }
      if (response?.statusDescription) {
        this.spinner.hide();
        sessionStorage.setItem('cotizacionId', response.data.cotizacion);

        const dataInsurance = {
          ...this.session,
          variant: response.data.detalleProducto
        };
        sessionStorage.setItem('insurance', JSON.stringify(dataInsurance));

        response.data.sessionNiubiz.flow = 'accidentes-personales';
        sessionStorage.setItem(
          'dataNiubiz',
          JSON.stringify(response.data.sessionNiubiz)
        );
        window['initDFP'](
          response.data.sessionNiubiz?.deviceFingerPrintId,
          response.data.sessionNiubiz?.numeroCompra,
          response.data.sessionNiubiz?.ip,
          response.data.sessionNiubiz?.codigoComercio
        );

        const tagManagerPayloadResponse = {
          ...tagManagerPayload,
          TipoAcción: 'Avance exitoso',
        };
        this.gts.virtualEvent(tagManagerPayloadResponse);

        this.mainService.nstep = 4;
        this.route.navigate([
          `/accidentespersonales/${this.insuranceCategory}/${this.insuranceType}/step-4/payment-method`
        ]);
      }
    });
  }

  private validateAttachment(): void {
    const payload = {
      idProcess: this.session.processId,
      prima: this.sessionPlanSelected.plan.prima,
      idCategoria: this.session.categoryId,
      idProducto: +this.idProductSelected,
      asegurados: [],
      beneficiarios: [],
      fileAttach: null,
      cantidadAsegurados: this.session?.cantidadTrabajadores || 0
    };
    this.spinner.show();
    this.mainService.nstep = 4;
    this.route.navigate([
      `/accidentespersonales/${this.insuranceCategory}/${this.insuranceType}/step-4/payment-method`
    ]);
    this.validateQuotationService.generarCotizacion(payload).subscribe(
      (response: any) => {
        this.spinner.hide();
        if (response.success) {
          const storage = JSON.parse(sessionStorage.getItem('planSelected'));

          this.mainService.nstep = 4;
          this.route.navigate([
            `/accidentespersonales/${this.insuranceCategory}/${this.insuranceType}/step-4/payment-method`
          ]);

          if (response.prima) {
            if (Number(response.prima) !== 0) {
              storage.plan.prima = response.prima;
            }
          }
          sessionStorage.setItem(
            'insurance',
            JSON.stringify({
              ...this.session,
              cotizacion: response.cotizacion
            })
          );
          sessionStorage.setItem('planSelected', JSON.stringify(storage));
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      }
    );
  }

  private calculatePremium(): void {
    const covarageSelected = this.sessionPlanSelected?.plan.coberturas.filter(
      (x) => +x.obligatoria == 1 || x?.selected
    );
    const benefitsSelected = this.sessionPlanSelected?.plan.beneficios.filter(
      (x) => x?.selected
    );
    const servicesSelected = this.sessionPlanSelected?.plan.asistencias.filter(
      (x) => x?.selected
    );
    const request = new ComparisonRequest({
      ...this.session,
      codigoProcesoPlan: this.sessionPlanSelected.plan.codigoProceso,
      coverage: covarageSelected,
      benefits: benefitsSelected,
      services: servicesSelected,
      planId: this.sessionPlanSelected.plan.id,
      endValidity: this.session.endValidity,
      startValidity: moment(this.session.startValidity).format('DD/MM/YYYY').toString(),
      idTarifario: this.sessionPlanSelected?.plan?.idTarifario,
      nombreTarifario: this.sessionPlanSelected?.plan?.nombreTarifario,
      versionTarifario: this.sessionPlanSelected?.plan?.versionTarifario
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
    this.spinner.show();
    this.clientService.updatePlan(request).subscribe(
      (response: any) => {
        this.sessionPlanSelected.plan.prima = response.prima;
        sessionStorage.setItem(
          'planSelected',
          JSON.stringify(this.sessionPlanSelected)
        );
        this.spinner.hide();
        this.validateAttachment();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      }
    );
  }

  get idProductSelected(): number {
    return +sessionStorage.getItem('productIdPolicy');
  }

  compararPlanes(): void {
    this.ga.emitGenericEventAP(`Clic en 'Comparar planes'`);

    const tagManagerPayloadComparison = {
      event: 'virtualEventGA4_A6',
      Producto: 'Accidentes Personales',
      Paso: 'Paso 3',
      Sección: 'Comparación del seguro',
      TipoAcción: 'Seleccionar botón',
      CTA: 'Haz clic aquí para comparar los planes',
      tipoPlan: this.sessionPlanSelected?.plan?.descripcion || '',
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
      Canal: 'Venta Directa'
    };
    this.gts.virtualEvent(tagManagerPayloadComparison);

    this.mainService.nstep = 3.1;
    this.route.navigate([
      `/accidentespersonales/${this.insuranceCategory}/${this.insuranceType}/step-3/compare-plan`
    ]);
  }

  get currencyDescription(): string {
    const idCurrency = +this.session.idMoneda;
    return idCurrency == 1 ? 'S/ ' : '$ ';
  }

  ammountTransform(val: any): string {
    return (+val / 1.18).toFixed(2);
  }

  backToHome(): void {
    const idSesion = sessionStorage.getItem('0FF2C61A');
    sessionStorage.clear();
    if (!!idSesion) {
      sessionStorage.setItem('0FF2C61A', idSesion);
    }
    this.route.navigate(['/accidentespersonales']);
  }

  closeModals(): void {
    this.vcr.clear();
  }

  showAssistanceList(): void {
    const productId = +this.productSelected?.productId;

    const assistanceList = {
      1: Strings.personalIndividual,
      2: Strings.personalFamiliar,
      3: Strings.personalEstudiantil,
      5: Strings.empresasLaborales,
      7: Strings.empresasEstudiantil
    };

    const productName = {
      2: 'Familiar (considerar hasta 5 asegurados)',
      5: 'Empresas'
    };

    this.productSelected.name = productName[productId] ?? this.productSelected.name;
    this.productAssistanceList = assistanceList[productId] ?? [];

    this.vcr.createEmbeddedView(this.modalAssistance);
  }

  downloadPdfAssistance(event): void {
    event.preventDefault();

    this.spinner.show();
    this.utilsService.fetchResource('assets/accidentes-personales/files/programa-asistencias.pdf', 'arraybuffer').subscribe({
      next: (response): void => {
        this.spinner.hide();
        this.utilsService.downloadFile({
          file: response,
          fileName: 'programa-asistencias_1705364699223.pdf'
        })
      },
      error: (): void => {
        this.spinner.hide();
      }
    })
  }

  showMoreCoverages(id): void {
    if (this.isPLanSelected(id)) {
      this.plansSelected = this.plansSelected.filter(x => x != id);
      return;
    }

    this.plansSelected.push(id);
  }

  isPLanSelected(id): boolean {
    return this.plansSelected.some(x => x == id);
  }

  get isInvalidStep(): boolean {
    if (!this.sessionPlanSelected) {
      return true;
    }

    const assistanceList = this.sessionPlanSelected?.plan?.asistencias ?? [];

    if (assistanceList.length) {
      return !this.checkAssistanceControl.value;
    }

    return false;
  }

  get isEveryPricingEquals(): boolean {
    const plans: PlanResponse[] = this.insurance?.plans ?? [];
    return plans.every((plan: PlanResponse): boolean => plans[0]?.prima == plan.prima);
  }
}
