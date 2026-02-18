import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InsuranceComparisonComponent } from './insurance-comparison/insurance-comparison.component';
import { InsuranceInfoComponent } from './insurance-info/insurance-info.component';
import { MainComponent } from './main/main.component';
import { PickInsuranceComponent } from './pick-insurance/pick-insurance.component';
import { PlanInfoComponent } from './plan-info/plan-info.component';
import { UserDocumentComponent } from './user-document/user-document.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { SelectPaymentMethodComponent } from './select-payment-method/select-payment-method.component';
import { ComparePlanComponent } from './compare-plan/compare-plan.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { PagoEfectivoPaymentSuccessComponent } from './pago-efectivo-payment-success/pago-efectivo-payment-success.component';

import { MainService } from './shared/services/main.service';
import { AuthGuard } from './shared/guards/auth.guard';
import {ProductSelectedResolver} from '@root/insurance/shared/resolvers/product-selected.resolver';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        component: PickInsuranceComponent,
      },
      {
        path: ':insuranceCategory/:insuranceType/step-1',
        component: UserDocumentComponent,
        canActivate: [AuthGuard],
        resolve: {
          productSelectedResolve: ProductSelectedResolver
        },
        data: {
          nstep: 1,
        },
      },
      {
        path: ':insuranceCategory/:insuranceType/step-2',
        component: UserInfoComponent,
        canActivate: [AuthGuard],
        data: {
          nstep: 2,
        },
      },
      {
        path: ':insuranceCategory/:insuranceType/step-3',
        component: InsuranceInfoComponent,
        canActivate: [AuthGuard],
        data: {
          nstep: 3,
        },
      },
      {
        path: ':insuranceCategory/:insuranceType/step-3/comparison',
        component: InsuranceComparisonComponent,
        canActivate: [AuthGuard],
        data: {
          nstep: 3.1,
        },
      },
      {
        path: ':insuranceCategory/:insuranceType/step-3/plan-info',
        component: PlanInfoComponent,
        canActivate: [AuthGuard],
        data: {
          nstep: 3.1,
        },
      },
      {
        path: ':insuranceCategory/:insuranceType/step-3/compare-plan',
        component: ComparePlanComponent,
        canActivate: [AuthGuard],
        data: {
          nstep: 3.1,
        },
      },
      {
        path: ':insuranceCategory/:insuranceType/step-4/payment-method',
        component: SelectPaymentMethodComponent,
        canActivate: [AuthGuard],
        data: {
          nstep: 4,
        },
      },
      {
        path: 'payment/visa/:id',
        component: PaymentSuccessComponent,
      },
      {
        path: 'payment/pago-efectivo',
        component: PagoEfectivoPaymentSuccessComponent,
      },
      {
        path: '**',
        redirectTo: '',
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InsuranceRoutingModule {}
