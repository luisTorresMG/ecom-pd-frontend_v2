import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RedirectLoginGuard } from '@shared/guards/redirect-login.guard';
import { RedirectUrlComponent } from './layout/redirect-url/redirect-url.component';
import { RegistSiniestroSoatComponent } from './siniestro/component/regist-siniestro-soat/regist-siniestro-soat.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./inicio/inicio.module').then((m) => m.InicioModule),
  },
  {
    path: 'client',
    redirectTo: 'soat',
  },
  {
    path: 'extranet',
    loadChildren: () =>
      import('./layout/broker/broker.module').then((m) => m.BrokerModule),
    canActivate: [RedirectLoginGuard],
  },
  {
    path: 'backoffice',
    loadChildren: () =>
      import('./layout/backoffice/backoffice.module').then(
        (m) => m.BackOfficeModule
      ),
    canActivate: [RedirectLoginGuard],
  },
  {
    path: 'broker',
    redirectTo: 'extranet',
  },
  {
    path: 'soat',
    component: RedirectUrlComponent,
    data: {
      href: 'https://soat.protectasecurity.pe/shop',
    },
  },
  {
    path: 'soat/step1',
    component: RedirectUrlComponent,
    data: {
      href: 'https://soat.protectasecurity.pe/shop',
    },
  },
  {
    path: 'vidaley',
    component: RedirectUrlComponent,
    data: {
      href: 'https://vidaley.protectasecurity.pe',
    },
  },
  {
    path: 'vidaley/step-1',
    component: RedirectUrlComponent,
    data: {
      href: 'https://vidaley.protectasecurity.pe',
    },
  },
  {
    path: 'vidadevolucion',
    loadChildren: () =>
      import(
        './layout/vidaindividual-latest/vidaindividual-latest.module'
        ).then((m) => m.VidaindividualLatestModule),
  },
  {
    path: 'desgravamen',
    loadChildren: () =>
      import('./layout/desgravamen/desgravamen.module').then(
        (m) => m.DesgravamenModule
      ),
  },
  {
    path: 'sctr',
    loadChildren: () =>
      import('./layout/sctr/sctr.module').then((m) => m.SctrModule),
  },
  {
    path: 'shop',
    loadChildren: () => import('./shop/shop.module').then((m) => m.ShopModule),
  },
  {
    path: 'accidentespersonales',
    loadChildren: () =>
      import('./insurance/insurance.module').then((m) => m.InsuranceModule),
  },
  {
    path: 'dps',
    loadChildren: () =>
      import('./layout/dps-questionnaire/dps-questionnaire.module').then(
        (m) => m.DpsQuestionnaireModule
      ),
  },
  {
    path: 'visa',
    loadChildren: () =>
      import('./layout/visa-testing/visa-testing.module').then(
        (m) => m.VisaTestingModule
      ),
  },
  {
    path: 'siniestrosoat',
    component: RegistSiniestroSoatComponent
  },
  {
    path: 'resumen/pago',
    loadChildren: () =>
      import('./layout/kushki/kushki.module').then((m) => m.KushkiModule),
  },
  {
    path:'portal-consulta',
    loadChildren: ()=>
        import('./layout/qr-proof-validation/qr-proof-validation.module').then(
            (m) => m.QrProofValidationModule
        ),
  },
  {
    path: '**',
    redirectTo: ''
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
