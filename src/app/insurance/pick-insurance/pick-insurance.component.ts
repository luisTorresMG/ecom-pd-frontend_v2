import { animate, style, transition, trigger } from '@angular/animations';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ChangeDetectorRef,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Category } from '../shared/interfaces/category';
import { Subcategory } from '../shared/interfaces/subcategory';
import { ProductResponse } from '../shared/models/product-response';
import { InsuranceTypesService } from '../shared/services/insurance-types.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoryResponse } from '../shared/models/category.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { MainService } from '../shared/services/main.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { UtilsService } from '@shared/services/utils/utils.service';
import { Strings } from './constants/strings';
import { ClientInfoService } from '../shared/services/client-info.service';
import { GoogleTagService } from '../shared/services/google-tag-service';

@Component({
  selector: 'app-pick-insurance',
  templateUrl: './pick-insurance.component.html',
  styleUrls: ['./pick-insurance.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(800, style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class PickInsuranceComponent implements OnInit {
  @ViewChild('list', { static: true }) subcategoriesEl: ElementRef;

  @ViewChild('switchCoverages', { static: true }) contentCoverages: ElementRef;

  categories: Category[] = [];
  subcategories: ProductResponse[] = [];

  subcategorySelected: number = 0;
  categoryId: string;

  status: string;

  productSelected: any;

  idProductSelected = 0;

  coverages: Array<{ img: string; description: string }>;
  process: Array<{ img: string; title: string; desc: string }>;
  plans: Array<{
    name: string;
    plan: string;
    desc: string;
    desc2: string;
    img: string;
  }>;

  pqpList: Array<any> = [];

  faqs: any = {
    coverages: Strings.acordion.coverages,
    hiring: Strings.acordion.hiring,
    sinister: Strings.acordion.sinister,
  };
  faqTabSelected: number = 1;

  dataClienteId: string = '';

  private readonly categoryGoogleAnalytics: string =
    'Ecommerce AP - Cliente - Paso 0';

  constructor(
    private readonly insuranceTypesService: InsuranceTypesService,
    private readonly sanitizer: DomSanitizer,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly _route: ActivatedRoute,
    private readonly _spinner: NgxSpinnerService,
    private readonly _ga: GoogleAnalyticsService,
    private readonly _mainService: MainService,
    private readonly _deviceDetectorService: DeviceDetectorService,
    private readonly _utilsService: UtilsService,
    private readonly clientInfoService: ClientInfoService,
    private readonly gts: GoogleTagService
  ) {
    this.coverages = Strings.coverages;
    this.process = Strings.process;
    this.plans = Strings.plans;
  }

  ngOnInit() {
    const sessionId = sessionStorage.getItem('0FF2C61A');
    sessionStorage.clear();
    if (sessionId) {
      sessionStorage.setItem('0FF2C61A', sessionId);
    }

    this.dataClienteId = this.clientInfoService.getClientID();

    this._mainService.nstep = 0;

    this._ga.emitGenericEventAP(
      'Visualiza pagina de inicio',
      0,
      this._deviceDetectorService.getDeviceInfo().deviceType
    );

    this._mainService.getToken().subscribe({
      next: (): void => {
        this.getPqpBenefits();
        this.getCategories();
        this.queryParamsRoute();
      },
    });
  }

  getCategories(): void {
    this.insuranceTypesService.getCategories().subscribe(
      (res: CategoryResponse) => {
        // tslint:disable-next-line:prefer-const
        let data: any = [];
        res.categorias.forEach((val) => {
          // tslint:disable-next-line:prefer-const
          let obj = new Category();
          obj.descripcion = val.descripcion;
          obj.id = val.id;
          obj.image = this.sanitizer.bypassSecurityTrustStyle(
            `url(assets/accidentes-personales/categoria${val.id}.svg)`
          );
          data.push(obj);
        });
        this.categories = data;
        if (this.categories.length > 0) {
          this.onCategoryClick(this.categories[0]);
        } else {
          this.status = 'EMPTY';
        }
        if (!res.success) {
          this._ga.emitGenericEventAP(
            'Obtener Categorias',
            0,
            'Error al obtener categorias',
            2
          );
        }
      },
      (err: any) => {
        console.log(err);
        this._ga.emitGenericEventAP(
          'Obtener Categorias',
          0,
          'Error al obtener categorias',
          2
        );
      }
    );
  }

  queryParamsRoute(): void {
    this._route.queryParams.subscribe((_: any) => {
      if (
        !!_?.utm_source &&
        !!_?.utm_medium &&
        !!_?.utm_campaign &&
        !!_?.utm_content &&
        !!_?.utm_term &&
        !!_?.embtrk
      ) {
        const payload = {
          idRamo: 61,
          idProducto: 0,
          idSession: sessionStorage.getItem('0FF2C61A'),
          idProcess: 0,
          categoria: 'Google UTM',
          tipo: 3,
          utm: [
            {
              key: 'utm_source',
              value: _.utm_source,
            },
            {
              key: 'utm_medium',
              value: _.utm_medium,
            },
            {
              key: 'utm_campaign',
              value: _.utm_campaign,
            },
            {
              key: 'utm_content',
              value: _.utm_content,
            },
            {
              key: 'utm_term',
              value: _.utm_term,
            },
            {
              key: 'embtrk',
              value: _.embtrk,
            },
          ],
        };
        this._utilsService.utmTrancking(payload);
      }
    });
  }

  getPqpBenefits() {
    const idSegmento = 30000001;
    this.insuranceTypesService.getBenefits(idSegmento).subscribe({
      next: (response: any) => {
        this.pqpList =
          (response?.beneficios || [])
            .map((x: any) => ({
              img: x.imagen,
              title: x.titulo,
              date: x.validez,
            }))
            ?.slice(0, 6) || [];
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  onCategoryClick(category: Category) {
    this._spinner.show();
    this._ga.emitGenericEventAP(
      `Selecciona categoría '${category.descripcion}'`
    );

    this.subcategories = [];
    this.categoryId = category.id;
    this.insuranceTypesService.getProducts(category.id).subscribe(
      (response: any) => {
        if (!response.success) {
          this._ga.emitGenericEventAP(
            `Obtener Productos`,
            0,
            'Error al obtener productos',
            2
          );
        }

        this.setStatus(response.items);

        sessionStorage.setItem(
          'productSelected',
          JSON.stringify(response.items)
        );
        this.subcategories = response.items.map((item) => ({
          ...item,
          name: this.plans.find((val) => val.name == item.key)?.plan || '',
          infoDescription:
            this.plans.find((val) => val.name == item.key)?.desc || '',
          infoDescription2:
            this.plans.find((val) => val.name == item.key)?.desc2 || '',
          img: this.plans.find((val) => val.name == item.key)?.img || '',
        }));
        this.subcategorySelected = response.items.some(
          (item) => item.categoryId == 1
        )
          ? 1
          : 2;

        setTimeout(() => {
          this._spinner.hide();
        }, 300);
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
        this._ga.emitGenericEventAP(
          `Obtener Productos`,
          0,
          'Error al obtener productos',
          2
        );
      }
    );
  }

  setStatus(response: ProductResponse[]) {
    if (!response || response.length === 0) {
      this.status = 'EMPTY';
    } else {
      this.status = null;
    }
  }

  selectedProduct(payload): void {
    this.idProductSelected = Number(payload.productId);
    this._ga.emitGenericEventAP(`Selecciona producto '${payload.name}'`);

    const tagManagerPayload = {
      event: 'virtualEventGA4_A1',
      Producto: 'Accidentes Personales',
      Paso: 'Paso 0',
      Sección: 'Botón central flotante',
      TipoAcción: 'Seleccionar botón',
      CTA: 'Comprar aquí',
      NombreSeguro: `${payload.name}`,
      pagePath: window.location.pathname,
      timeStamp: new Date().getTime(),
    };
    this.gts.virtualEvent(tagManagerPayload);

    sessionStorage.setItem(
      'productIdPolicy',
      JSON.stringify(Number(payload.productId))
    );

    sessionStorage.setItem('_producto_selecionado', JSON.stringify(payload));

    if (Number(payload?.modeCode) === 2) {
      sessionStorage.setItem('modalidad', 'true');
    } else {
      sessionStorage.setItem('modalidad', 'false');
    }
    this._mainService.nstep = 1;
    this.router.navigate([
      `/accidentespersonales/${
        payload.categoryId == 1 ? 'personales' : 'empresas'
      }/${payload.key}/step-1`,
    ]);
  }

  questionEvent(event: any): void {
    if (!event.isOpen) {
      return;
    }

    const tagManagerResponse = {
      event: 'virtualEventGA4_A1',
      Producto: 'Accidentes Personales',
      Paso: 'Paso 0',
      Sección: 'Preguntas frecuentes',
      TipoAcción: `Ver información - ${
        this.faqTabSelected == 1
          ? 'Sobre el seguro'
          : this.faqTabSelected == 2
          ? 'Sobre la contratación'
          : this.faqTabSelected == 3
          ? 'En caso de un siniestro'
          : ''
      }`,
      CTA: event.title,
      pagePath: window.location.pathname,
      timeStamp: new Date().getTime(),
    };
    this.gts.virtualEvent(tagManagerResponse);
  }

  selectCompulsiveOrOptative(checked): any {
    this.productSelected = checked;
  }

  redirect(): void {
    this.contentCoverages.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
}
