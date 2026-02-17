import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelWidgetModule } from './panel-widget/panel-widget.module';
import { PanelTableModule } from './panel-table/panel-table.module';
import { PanelModalModule } from './panel-modal/panel-modal.module';
import { PanelCardModule } from './panel-card/panel-card.module';
import { FormButtonModule } from './form-button/form-button.module';
import { FormInputSelectModule } from './form-input-select/form-input-select.module';
import { FormInputTextModule } from './form-input-text/form-input-text.module';
import { FormInputDateModule } from './form-input-date/form-input-date.module';
import { LoadingScreenModule } from './loading-screen/loading-screen.module';
import { PanelHeaderProductoModule } from './panel-header-producto/panel-header-producto.module';
import { PanelInfoContratanteModule } from './panel-info-contratante/panel-info-contratante.module';
import { PanelInfoContactosModule } from './panel-info-contactos/panel-info-contactos.module';
import { PanelInfoBrokersModule } from './panel-info-brokers/panel-info-brokers.module';
import { PanelInfoPolizaModule } from './panel-info-poliza/panel-info-poliza.module';
import { PanelInfoTramaModule } from './panel-info-trama/panel-info-trama.module';
import { PanelInfoCotizadorModule } from './panel-info-cotizador/panel-info-cotizador.module';
import { PanelInfoEvaluacionModule } from './panel-info-evaluacion/panel-info-evaluacion.module';
import { FormSearchClientModule } from './form-search-client/form-search-client.module';
import { PanelInfoExclusionModule } from './panel-info-exclusion/panel-info-exclusion.module';
import { PanelContainerModule } from './panel-container/panel-container.module';
import { NavmenusctrModule } from '../../../../layout/broker/components/navmenusctr/navmenusctr.module';
import { BrokerPipesModule } from '../../../../layout/broker/pipes/broker.pipes.module';
import { BrokerModule } from '../../../../layout/broker/broker.module';
import { StorageService } from '../../../../layout/broker/components/quote/acc-personales/core/services/storage.service';
import { FileService } from '../../../../layout/broker/components/quote/acc-personales/core/services/file.service';
import { CommonMethods } from '../../../../layout/broker/components/common-methods';
import { PanelInfoEndosatariosModule } from './panel-info-endosatarios/panel-info-endosatarios.module';
import { PanelInfoPagoModule } from '../../../../layout/broker/components/quote/acc-personales/components/panel-info-pago/panel-info-pago.module';
import { NavMenuProdModule } from '../../../../shared/components/navmenuprod/navmenuprod.module';
import { PanelDpsModule } from './panel-dps/panel-dps.module';
import { PanelDpsEstadoModule } from './panel-dps-estado/panel-dps-estado.module';

//import { AddEndorseeComponent } from './add-endorsee/add-endorsee.component';


@NgModule({
    exports: [
        CommonModule,
        NavMenuProdModule,
        BrokerPipesModule,
        PanelWidgetModule,
        PanelContainerModule,
        PanelTableModule,
        PanelModalModule,
        PanelCardModule,
        FormButtonModule,
        FormInputSelectModule,
        FormInputTextModule,
        FormInputDateModule,
        LoadingScreenModule,
        PanelHeaderProductoModule,
        PanelInfoContratanteModule,
        PanelInfoContactosModule,
        PanelInfoBrokersModule,
        PanelInfoPolizaModule,
        PanelInfoTramaModule,
        PanelInfoCotizadorModule,
        PanelInfoEvaluacionModule,
        PanelInfoExclusionModule,
        PanelInfoEndosatariosModule,
        FormSearchClientModule,
        BrokerModule,
        PanelInfoPagoModule,
        PanelDpsModule,
        PanelDpsEstadoModule
    ],
    imports: [BrokerModule],
    providers: [
        StorageService,
        FileService,
        CommonMethods
    ],
    //declarations: [PanelDpsEstadoComponent],
    //declarations: [AddEndorseeComponent]
})
export class SharedComponentsModulePD { }
