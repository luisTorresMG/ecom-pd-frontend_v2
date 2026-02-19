import { DigitOnlyModule } from '@uiowa/digit-only';
import { SessionStorageService } from './../../shared/services/storage/storage-service';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, LOCALE_ID } from '@angular/core';
import {
    CommonModule,
    DatePipe,
    DecimalPipe,
    registerLocaleData,
} from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Modules
import { BackOfficeRoutingModule } from './backoffice-routing.module';
import { SharedComponentsModule } from '../../shared/modules/shared-components.module';
import { ModalModules } from '../../shared/components/modal/modal.module';
import { ConfirmModule } from '../../shared/components/confirm/confirm.module';
import { RecaptchaModule } from 'ng-recaptcha';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxFileDropModule } from 'ngx-file-drop';

// Components
import { HomeComponent } from './components/home/home.component';
import { BackOfficeComponent } from './backoffice.component';

import { ngfModule } from 'angular-file';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';

// Services
// import { AuthGuard } from './guards/auth.guard';
import { BrokerHttpInterceptor } from './../broker/guards/broker-http-interceptor';
import { AppConfig } from '../../app.config';
import { GlobalEventsManager } from '../../shared/services/gobal-events-manager';
import { ApiService } from '../../shared/services/api.service';
import { ExcelService } from '../../shared/services/excel/excel.service';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ConfigService } from '../../shared/services/general/config.service';
import { UbigeoService } from '../../shared/services/ubigeo/ubigeo.service';
import { UsoService } from '../../shared/services/uso/uso.service';
import { SalesModeService } from '../../shared/services/salesmode/salesmode.service';
import { PaymentTypeService } from '../../shared/services/paymenttype/paymenttype.service';
import { StateSalesService } from '../../shared/services/statesales/statesales.service';
import { ChannelSalesService } from '../../shared/services/channelsales/channelsales.service';
import { ChannelPointService } from '../../shared/services/channelpoint/channelpoint.service';
import { FlowTypeService } from '../../shared/services/flowtype/flowtype.service';
import { UtilityService } from '../../shared/services/general/utility.service';
import { ValidatorService } from '../../shared/services/general/validator.service';
import { ClienteService } from '../client/shared/services/cliente.service';
import { VisaService } from '../../shared/services/pago/visa.service';
import { EmisionService } from '../client/shared/services/emision.service';
import { BankService } from '../../shared/services/bank/bank.service';
import { CurrencyTypeService } from '../../shared/services/currencytype/currencytype.service';
import { AccountBankService } from '../../shared/services/accountbank/accountbank.service';
import { PagoEfectivoService } from '../../shared/services/pago/pago-efectivo.service';
import { ConfirmService } from '../../shared/components/confirm/confirm.service';
import { SidebarService } from '../../shared/services/sidebar/sidebar.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartsModule } from 'ng2-charts';
import { NgxPaginationModule } from 'ngx-pagination';

import { SharedAppModule } from '../shared-app/shared-app.module';
import { ProduccionComponent } from './components/reportes/produccion/produccion.component';
import {
    AsignadosReasignadosComponent
} from './components/reportes/asignados-reasignados/asignados-reasignados.component';
import { EndososComponent } from './components/reportes/endosos/endosos.component';
import { EspeciesValoradasComponent } from './components/reportes/especies-valoradas/especies-valoradas.component';
import {
    CanalPuntoVentaComponent
} from './components/reportes/especies-valoradas-canal-puntoventa/canal-puntoventa.component';
import { LoteComponent } from './components/reportes/especies-valoradas-lote/lote.component';
import { DescargosComponent } from './components/reportes/descargos/descargos.component';
import { TarifasComponent } from './components/reportes/tarifas/tarifas.component';
import { ArqueoComponent } from './components/reportes/arqueo/arqueo.component';

// tslint:disable-next-line:max-line-length
import {
    ProduccionPlataformaDigitalComponent
} from './components/reportes/produccion-plataforma-digital/produccion-plataforma-digital.component';
import { NotasCreditoComponent } from './components/reportes/notas-credito/notas-credito.component';
import { ProductionReportService } from './services/productionreport/productionreport.service';
import { LeadService } from './../broker/services/lead/lead.service';
import { AuthenticationService } from '../broker/services/authentication.service';
import { EndorsementReportService } from './services/endorsementreport/endorsementreport.service';
import { HistoryReportService } from './services/historyreport/historyreport.service';
import { BatchReportService } from './services/batchreport/batchreport.service';
import { DischargeReportService } from './services/dischargereport/dischargereport.service';
import { CreditNoteReportService } from './services/creditnotereport/creditnotereport.service';
import { DigitalPlatformReportService } from './services/digitalplatformreport/digitalplatformreport.service';
import { ArqueoReportService } from './services/arqueoreport/arqueoreport.service';
import { RateReportService } from './services/ratereport/ratereport.service';
import { ChannelBatchReportService } from './services/channelbatchreport/channelbatchreport.service';
import { CommissionLotService } from './../broker/services/commisslot/comissionlot.service';
import { AssignReassignReportService } from './services/assignreassignreport/assignreassignreport.service';

// TRANSACCIONES
import {
    AnulacionCertificadoComponent
} from './components/transaction/anulacion-certificado/anulacion-certificado.component';
import { AsignarSolicitudComponent } from './components/transaction/asignar-solicitud/asignar-solicitud.component';
import {
    ConsultaCertificadoComponent
} from './components/transaction/consulta-certificado/consulta-certificado.component';
import {
    DescargarCertificadoComponent
} from './components/transaction/descargar-certificado/descargar-certificado.component';
import { EndososGeneralComponent } from './components/transaction/endosos-general/endosos-general.component';
import { GenerarStockComponent } from './components/transaction/generar-stock/generar-stock.component';
import {
    ImpresionCertificadoComponent
} from './components/transaction/impresion-certificado/impresion-certificado.component';
import { PlanillaVentaComponent } from './components/transaction/planilla-venta/planilla-venta.component';
import {
    ReasignarSolicitudComponent
} from './components/transaction/reasignar-solicitud/reasignar-solicitud.component';
import {
    TransferenciaApesegComponent
} from './components/transaction/transferencia-apeseg/transferencia-apeseg.component';
import {
    CargaMasivaUploadFileComponent
} from './components/transaction/CargaMasiva/CargaMasiva-Add/CargaMasivaUploadFile.component';
import { CargaMasivaComponent } from './components/transaction/CargaMasiva/CargaMasiva-List/CargaMasiva.component';
import {
    CargaMasivaMainComponent
} from './components/transaction/CargaMasiva/CargaMasiva-Main/CargaMasiva-Main.component';
import {
    CargaMasivaStateComponent
} from './components/transaction/CargaMasiva/CargaMasiva-State/CargaMasiva-State.component';
import {
    CargaMasivaAddStateComponent
} from './components/transaction/CargaMasiva/CargaMasiva-AddState/CargaMasivaAddState/CargaMasivaAddState.component';

// TRANSACCIONES SHARED COMPONENTS
import { DatosContratanteModule } from './components/transaction/shared/datos-contratante/datos-contratante.module';
import { DatosVehiculoModule } from './components/transaction/shared/datos-vehiculo/datos-vehiculo.module';
import { DatosPolizaModule } from './components/transaction/shared/datos-poliza/datos-poliza.module';
import { ModalMessageModule } from './components/transaction/shared/modal-message/modal-message.module';
import { esLocale } from 'ngx-bootstrap/locale';
import localeEs from '@angular/common/locales/es-PE';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ChannelPointModule } from './components/transaction/shared/channel-point/channel-point.module';
import { NavMenuProdModule } from '@shared/components/navmenuprod/navmenuprod.module';
import { EnvioCertificadoComponent } from './components/soat/envio-certificado/envio-certificado.component';
import { PlanillasComponent } from './components/mantenimientos/planillas/planillas.component';
import {
    GestionDeRegistrosComponent
} from './components/mantenimientos/gestion-de-registros/gestion-de-registros.component';
import { RestrictGuard } from '@shared/guards/restrict.guard';

registerLocaleData(localeEs, 'es');

// *COMPONENTES
//#region
// *RENTAS
import {
    ReporteRentasVitaliciasComponent
} from './components/rentas/reporte-rentas-vitalicias/reporte-rentas-vitalicias.component';
import { ReporteRentaTotalComponent } from './components/rentas/reporte-renta-total/reporte-renta-total.component';

// *MANTENIMIENTOS
import {
    MantCanalPuntoVentaComponent
} from './components/mantenimientos/canal-punto-venta/canal-punto-venta.component';
import { MarcaModeloComponent } from './components/mantenimientos/marca-modelo/marca-modelo.component'; // *MARCA MODELO
import {
    AttachmentsComponent
} from './components/mantenimientos/gestion-de-registros/attachments/attachments.component';
import { PaymentMaintenanceComponent } from './components/mantenimientos/payment-maintenance/payment-maintenance.component';
// tslint:disable-next-line:max-line-length
import {
    CreditLineDataComponent
} from './components/mantenimientos/gestion-de-registros/credit-line-data/credit-line-data.component';

// *SEGURIDAD
// tslint:disable-next-line:max-line-length
import {
    MantenimientoPerfilesComponent
} from './components/seguridad/mantenimiento-perfiles/mantenimiento-perfiles.component'; // *RESTABLECER CONTRASEÑA
import { RegistroUsuariosComponent } from './components/seguridad/registro-usuarios/registro-usuarios.component';
// tslint:disable-next-line:max-line-length
import {
    RestablecerContraseniaComponent
} from './components/seguridad/restablecer-contrasenia/restablecer-contrasenia.component';
//#endregion

// *VALIDACION DE TRAMA
import { ValidacionComponent } from './components/validacion-trama/components/validation/validation.component';
import { NewPlotComponent } from './components/validacion-trama/components/new-plot/new-plot.component';
import { EstructuraComercialComponent } from './components/estructura-comercial/components/estructura-comercial/estructura-comercial.component'
import {
    ConfigurationPlotComponent
} from './components/validacion-trama/components/configuration-plot/configuration-plot.component';
import { BandejaTramaComponent } from './components/validacion-trama/components/bandeja-trama/bandeja-trama.component';

// *SIA
import { ConfigurationComponent } from './components/desgravamen/configuration/configuration.component';
import { TrayComponent } from './components/desgravamen/tray/tray.component';
import { HorarioComponent } from './components/desgravamen/horario/horario.component'; //INI <RQ2024-57 - 03/04/2024>
// tslint:disable-next-line:max-line-length
import {
    StructureConfigurationReadComponent
} from './components/desgravamen/configuration/phases/structure-configuration-read/structure-configuration-read.component';
// tslint:disable-next-line:max-line-length
import {
    StructureConfigurationRegisterComponent
} from './components/desgravamen/configuration/phases/structure-configuration-register/structure-configuration-register.component';
// tslint:disable-next-line:max-line-length
import {
    StructureConfigurationValidateComponent
} from './components/desgravamen/configuration/phases/structure-configuration-validate/structure-configuration-validate.component';
// tslint:disable-next-line:max-line-length
import {
    StructureConfigurationMigrateComponent
} from './components/desgravamen/configuration/phases/structure-configuration-migrate/structure-configuration-migrate.component';

// *SIA: CARGA MASIVA
import { BulkLoadComponent } from './components/desgravamen/bulk-load/bulk-load.component';
import { NewBulkLoadComponent } from './components/desgravamen/bulk-load/new-bulk-load/new-bulk-load.component';
import { ProcessLogComponent } from './components/desgravamen/bulk-load/process-log/process-log.component';
import {
    BulkLoadDetailComponent
} from './components/desgravamen/bulk-load/bulk-load-detail/bulk-load-detail.component';

// *Services
import { DesgravamenService } from './components/desgravamen/shared/services/desgravamen/desgravamen.service';
import { ConfigurationService } from './components/desgravamen/shared/services/configuration/configuration.service';
// tslint:disable-next-line:max-line-length
import {
    StructureConfigurationNotificationsComponent
} from './components/desgravamen/shared/components/structure-configuration-notifications/structure-configuration-notifications.component';
// tslint:disable-next-line:max-line-length
import {
    StructureConfigurationBillingComponent
} from './components/desgravamen/configuration/phases/structure-configuration-billing/structure-configuration-billing.component';
import { NewRequestComponent } from './components/mantenimientos/new-request/new-request.component';
import {
    ProductListComponent
} from './components/mantenimientos/shared/components/product-list/product-list.component';
import { PaymentMaintenanceService } from './services/mantenimientos/paytment-maintenance.service';
import { FormInputTextModule } from '../vida-inversion/components/form-input-text/form-input-text.module';
import { EstructuraComercialModalComponent } from './components/estructura-comercial/components/structura-comercial-modal/estructura-comercial-modal.component';
import { FormInputSelectModule } from '../vida-inversion/components/form-input-select/form-input-select.module';
import { FormButtonModule } from '../vida-inversion/components/form-button/form-button.module';


@NgModule({
    imports: [
        CommonModule,
        BackOfficeRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        SharedComponentsModule,
        PaginationModule.forRoot(),
        ModalModule,
        ConfirmModule,
        BsDatepickerModule,
        ModalModules,
        RecaptchaModule,
        NgbModule,
        ChartsModule,
        NgxPaginationModule,
        DigitOnlyModule,
        ngfModule, // Kuntur 20190812
        NgSelectModule, // Kuntur 20190812,
        SharedAppModule,
        ReactiveFormsModule,
        TabsModule.forRoot(),
        // TRANSACCIONES SHARED
        DatosContratanteModule,
        DatosVehiculoModule,
        DatosPolizaModule,
        ModalMessageModule,
        ChannelPointModule,
        NavMenuProdModule,
        DragDropModule,
        NgxFileDropModule,
        FormInputTextModule,
        FormInputSelectModule,
        FormButtonModule
    ],
    exports: [FormsModule, StructureConfigurationNotificationsComponent, ProductListComponent],
    declarations: [
        // *HOME
        HomeComponent,
        BackOfficeComponent,
        AsignadosReasignadosComponent,
        ProduccionComponent,
        EndososComponent,
        EspeciesValoradasComponent,
        CanalPuntoVentaComponent,
        LoteComponent,
        DescargosComponent,
        TarifasComponent,
        ArqueoComponent,
        ProduccionPlataformaDigitalComponent,
        NotasCreditoComponent,


        // *TRANSACCIONES
        AnulacionCertificadoComponent,
        AsignarSolicitudComponent,
        ConsultaCertificadoComponent,
        DescargarCertificadoComponent,
        EndososGeneralComponent,
        GenerarStockComponent,
        ImpresionCertificadoComponent,
        PlanillaVentaComponent,
        ReasignarSolicitudComponent,
        TransferenciaApesegComponent,
        CargaMasivaMainComponent,
        CargaMasivaComponent,
        CargaMasivaStateComponent,
        CargaMasivaUploadFileComponent,
        CargaMasivaAddStateComponent,
        EnvioCertificadoComponent,
        ReporteRentasVitaliciasComponent,
        ReporteRentaTotalComponent,
        PlanillasComponent,
        GestionDeRegistrosComponent,
        RegistroUsuariosComponent,
        EnvioCertificadoComponent, // NavMenuProdComponent
        // *RENTAS
        ReporteRentaTotalComponent,

        EstructuraComercialModalComponent,

        // *MANTENIMIENTOS
        MantCanalPuntoVentaComponent,
        MarcaModeloComponent,
        PlanillasComponent,
        PaymentMaintenanceComponent,

        // *SEGURIDAD
        RegistroUsuariosComponent,
        RestablecerContraseniaComponent,
        AttachmentsComponent,
        CreditLineDataComponent,
        MantenimientoPerfilesComponent,
        // VALIDACION DE TRAMA,
        ValidacionComponent,
        EstructuraComercialComponent, /*VIGP 28112025*/
        NewPlotComponent,
        ConfigurationPlotComponent,
        BandejaTramaComponent,
        ConfigurationComponent,
        TrayComponent,
        HorarioComponent,
        StructureConfigurationReadComponent,
        StructureConfigurationRegisterComponent,
        StructureConfigurationValidateComponent,
        StructureConfigurationMigrateComponent,
        BulkLoadComponent,
        NewBulkLoadComponent,
        ProcessLogComponent,
        BulkLoadDetailComponent,
        StructureConfigurationNotificationsComponent,
        StructureConfigurationBillingComponent,
        NewRequestComponent,
        ProductListComponent,
    ],
    // entryComponents: [
    //     EstructuraComercialModalComponent
    // ],
    providers: [
        BsModalService,
        AuthenticationService,
        AppConfig,
        GlobalEventsManager,
        ApiService,
        ExcelService,
        FlowTypeService,
        ConfigService,
        UbigeoService,
        UsoService,
        PaymentTypeService,
        StateSalesService,
        ChannelSalesService,
        ChannelPointService,
        UtilityService,
        ValidatorService,
        SalesModeService,
        VisaService,
        BankService,
        CurrencyTypeService,
        ClienteService,
        EmisionService,
        ConfirmService,
        DatePipe,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: BrokerHttpInterceptor,
            multi: true,
        },
        DecimalPipe,
        SidebarService,
        SessionStorageService,
        AccountBankService,
        PagoEfectivoService,
        ProductionReportService,
        LeadService,
        EndorsementReportService,
        HistoryReportService,
        BatchReportService,
        DischargeReportService,
        CreditNoteReportService,
        DigitalPlatformReportService,
        ArqueoReportService,
        RateReportService,
        ChannelBatchReportService,
        CommissionLotService,
        AssignReassignReportService,
        { provide: LOCALE_ID, useValue: 'es' },
        RestrictGuard,
        DesgravamenService,
        ConfigurationService,
        PaymentMaintenanceService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BackOfficeModule {
    constructor(localeService: BsLocaleService) {
        defineLocale('es', esLocale);
        localeService.use('es');
    }
}
