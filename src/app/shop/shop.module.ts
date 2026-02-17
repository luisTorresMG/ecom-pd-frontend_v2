import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
// import { EcommerceRoutingModule } from './shop-routing.module';
import { ShopRoutingModule } from './shop-routing.module';
import { SharedComponentsModule } from '../shared/modules/shared-components.module';
import { BannerComponent } from './banner/banner.component';
import { SessionStorageService } from '../shared/services/storage/storage-service';
import { ShoppingCartModalComponent } from './shopping-cart-modal/shopping-cart-modal.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CheckOutComponent } from './check-out/check-out.component';
import { MainComponent } from './main/main.component';
import { ApiService } from '../shared/services/api.service';
import { ConfigService } from '../shared/services/general/config.service';
import { ShopService } from './services/shop.service';
import { UtilityService } from '../shared/services/general/utility.service';
import { PagoEfectivoPaymentComponent } from './pago-efectivo-payment/pago-efectivo-payment.component';
import { SharedAppModule } from '../layout/shared-app/shared-app.module';
import { VisaPaymentComponent } from './visa-payment/visa-payment.component';
import { CommonComponentsModule } from '@shared/modules/common-components.module';

@NgModule({
  declarations: [
    HomeComponent,
    BannerComponent,
    ShoppingCartModalComponent,
    CheckOutComponent,
    MainComponent,
    PagoEfectivoPaymentComponent,
    VisaPaymentComponent,
  ],
  imports: [
    CommonModule,
    // EcommerceRoutingModule,
    ShopRoutingModule,
    SharedComponentsModule,
    ModalModule.forRoot(),
    SharedAppModule,
    CommonComponentsModule,
  ],
  entryComponents: [HomeComponent],
  providers: [
    SessionStorageService,
    ApiService,
    ConfigService,
    ShopService,
    UtilityService,
  ],
  exports: [ShoppingCartModalComponent],
})
export class ShopModule {}
