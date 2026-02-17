import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main/main.component';
import { VidaGrupoRoutingModule } from './vida-grupo-routing.module';
import { CheckoutComponent } from './checkout/checkout.component';
import { CommonComponentsModule } from '../shared/modules/common-components.module';
import { SharedComponentsModule } from '../shared/modules/shared-components.module';
import { PaymentPagoefectivoSuccessComponent } from './payment-pagoefectivo-success/payment-pagoefectivo-success.component';
import { PaymentVisaSuccessComponent } from './payment-visa-success/payment-visa-success.component';

@NgModule({
  declarations: [
    MainComponent,
    CheckoutComponent,
    PaymentPagoefectivoSuccessComponent,
    PaymentVisaSuccessComponent,
  ],
  imports: [
    CommonModule,
    VidaGrupoRoutingModule,
    CommonComponentsModule,
    SharedComponentsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VidaGrupoModule {}
