import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute } from '@angular/router';
import { fadeAnimation } from '@root/shared/animations/animations';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';

import { UtilsService } from '@shared/services/utils/utils.service';

@Component({
  selector: 'app-compare-plan',
  templateUrl: './compare-plan.component.html',
  styleUrls: ['./compare-plan.component.css'],
  animations: [fadeAnimation],
})
export class ComparePlanComponent implements OnInit {
  subscription: Subscription;
  insuranceType: string;
  insuranceCategory: string;
  optionPlan: number;

  planesInfo: Array<any>;
  selectedPlans: Array<number>;
  coverages: Array<any>;
  assists: Array<any>;
  benefits: Array<any>;

  slideIndex: number;

  detailAssist = new Array();

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly ga: GoogleAnalyticsService,
    private readonly utilsService: UtilsService
  ) {
    this.selectedPlans = [];
    this.planesInfo = [];
    this.coverages = [];
    this.assists = [];
    this.benefits = [];
    this.optionPlan = 1;
    this.subscription = new Subscription();
    this.subscription.add(
      this.route.params.subscribe((params) => {
        this.insuranceType = params.insuranceType;
        this.insuranceCategory = params.insuranceCategory;
      })
    );
    this.coverages = this.session.coverage;
    this.assists = this.session.services;
    this.benefits = this.session.benefits;

    this.session.plans.forEach((e) => {
      if (this.selectedPlans.length < 2) {
        this.selectedPlans.push(e.id);
      }
    });

    this.selectedPlans.forEach((e) => {
      this.planesInfo.push(
        this.session.plans.find((x) => Number(x.id) === Number(e))
      );
    });
    this.coverages = this.session.coverage;
    this.assists = this.session.services;
    this.benefits = this.session.benefits;

    this.slideIndex = 1;
  }

  ngOnInit(): void {
    this.getDetailAssist();
  }

  getDetailAssist(): void {
    const uri =
      'assets/accidentes-personales/resources/detalle-asistencias.json';
    this.utilsService.fetchResource(uri).subscribe({
      next: (response: any) => {
        console.log(response);
        this.detailAssist = response || [];
      },
      error: (error: any) => {
        console.error(error);
        this.detailAssist = [];
      },
    });
  }

  changePlanToCompare(type: number): void {
    if (type === 1) {
      if (this.slideIndex + 3 > this.session?.plans?.length) {
        this.slideIndex = this.session?.plans?.length;
      } else {
        this.slideIndex += 3;
      }
    } else {
      if (this.slideIndex - 3 < 1) {
        this.slideIndex = 1;
      } else {
        this.slideIndex -= 3;
      }
    }
  }
  validityShowItemSlide(index: number): boolean {
    return (
      this.slideIndex - index === 0 ||
      this.slideIndex - index === 1 ||
      this.slideIndex - index === 0 ||
      this.slideIndex - 1 - index === -2
    );
  }

  selectPlan(id: number): void {
    if (!this.selectedPlans.find((x) => x === id)) {
      this.planesInfo = [];
      if (this.selectedPlans.length >= 2) {
        this.selectedPlans.shift();
      }
      this.selectedPlans.push(id);
      this.selectedPlans.forEach((val) => {
        this.planesInfo.push(
          this.session.plans.find((x) => Number(x.id) === Number(val))
        );
      });
    }
    this.planesInfo.sort((a, b) => Number(a.id) - Number(b.id));
  }
  findPlanSelected(id: number): boolean {
    return this.selectedPlans.find((x) => x === id) ? true : false;
  }

  backStep3Comparison(): void {
    this.ga.emitGenericEventAP(`Clic en 'Anterior'`);
    this.router.navigate([
      `/accidentespersonales/${this.insuranceCategory}/${this.insuranceType}/step-3/comparison`,
    ]);
  }
  backStep3(): void {
    this.ga.emitGenericEventAP(`Clic en 'Anterior'`);
    sessionStorage.removeItem('planes');
    sessionStorage.removeItem('planSelected');
    sessionStorage.removeItem('planSelectedUpdated');
    this.router.navigate([
      `/accidentespersonales/${this.insuranceCategory}/${this.insuranceType}/step-3`,
    ]);
  }
  get session(): any {
    return JSON.parse(sessionStorage.getItem('insurance') || '{}');
  }
  set changeOptionPlan(type) {
    this.optionPlan = type;
  }
  applyCoverage(id: any, plan: any): boolean {
    const coverage = this.session.plans
      .find((x) => Number(x.id) === Number(plan))
      .coberturas.find((x) => Number(x.id) === Number(id));
    return !!coverage?.selected || Number(coverage?.obligatoria) === 1;
  }
  ammoutCoverage(id: any, plan: any): string {
    return (
      (+this.session.plans
        .find((x) => Number(x.id) === Number(plan))
        .coberturas.find((x) => Number(x.id) === Number(id))?.capital)?.toFixed(
        2
      ) || null
    );
  }
  applyServices(id: any, plan: any): boolean {
    return !!this.session.plans
      .find((x) => Number(x.id) === Number(plan))
      .asistencias.find((x) => Number(x.id) === Number(id))?.selected;
  }
  applyBenefits(id: any, plan: any): boolean {
    return !!this.session.plans
      .find((x) => Number(x.id) === Number(plan))
      .beneficios.find((x) => Number(x.id) === Number(id))?.selected;
  }
  get currencyDescription(): string {
    switch (+this.session.idMoneda) {
      case 1:
        return 'S/';
      default:
        return '$';
    }
  }

  getPrimaSinIGV(value): string {
    return (value / 1.18).toFixed(2);
  }

  get selectedProduct(): any {
    return JSON.parse(sessionStorage.getItem('_producto_selecionado'));
  }

  findDetailAssist(code: number): string {
    return this.detailAssist.find((x) => x.code == code)?.detail || '-';
  }
}
