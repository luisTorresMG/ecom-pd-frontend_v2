import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// Modules
import { ClientRoutingModule } from './client-routing.module';
import { SharedComponentsModule } from '../../shared/modules/shared-components.module';
import { ModalModules } from '../../shared/components/modal/modal.module';
// Components
// Services/Providers
import { VehiculoService } from './shared/services/vehiculo.service';
import { UsoService } from '../../shared/services/uso/uso.service';
import { ConfigService } from '../../shared/services/general/config.service';
import { ApiService } from '../../shared/services/api.service';
import { ClienteService } from './shared/services/cliente.service';
import { UbigeoService } from '../../shared/services/ubigeo/ubigeo.service';
import { VisaService } from '../../shared/services/pago/visa.service';
import { PagoEfectivoService } from '../../shared/services/pago/pago-efectivo.service';
import { UtilityService } from '../../shared/services/general/utility.service';
import { EmisionService } from './shared/services/emision.service';
import { CertificadoService } from './shared/services/certificado.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ClientHttpInterceptor } from './shared/services/client-http-interceptor';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoggerService } from '../../shared/services/logger/logger.service';
import { SessionStorageService } from '../../shared/services/storage/storage-service';
/* import { ContratanteComponent } from '../broker/components/contratante/contratante.component'; */
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { Step03Service } from '../broker/services/step03/step03.service';
import { Step05Service } from '../broker/services/step05/step05.service';
import { ClientComponent } from './client.component';
import { CommonComponentsModule } from '@shared/modules/common-components.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClientRoutingModule,
    SharedComponentsModule,
    ModalModules,
    HttpClientModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    NgbModule,
    CommonComponentsModule,
  ],
  declarations: [ClientComponent],
  entryComponents: [],
  providers: [
    ApiService,
    ConfigService,
    CertificadoService,
    ClienteService,
    EmisionService,
    VehiculoService,
    UsoService,
    UbigeoService,
    VisaService,
    PagoEfectivoService,
    UtilityService,
    LoggerService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ClientHttpInterceptor,
      multi: true,
    },
    DatePipe,
    SessionStorageService,
    Step03Service,
    UbigeoService,
    Step05Service,
  ],
})
export class ClientModule {}
