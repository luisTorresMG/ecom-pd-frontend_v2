import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BackOfficeComponent } from './backoffice.component';

// *SOAT
import { EnvioCertificadoComponent } from './components/soat/envio-certificado/envio-certificado.component';

// *REPORTES
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

// *TRANSACCIONES
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
import {
    ReporteRentasVitaliciasComponent
} from './components/rentas/reporte-rentas-vitalicias/reporte-rentas-vitalicias.component';
import { ReporteRentaTotalComponent } from './components/rentas/reporte-renta-total/reporte-renta-total.component';
import { HomeComponent } from './components/home/home.component';

// *MANTENIMIENTOS
//#region
import {
    MantCanalPuntoVentaComponent
} from './components/mantenimientos/canal-punto-venta/canal-punto-venta.component';
import {
    GestionDeRegistrosComponent
} from './components/mantenimientos/gestion-de-registros/gestion-de-registros.component';
import { MarcaModeloComponent } from './components/mantenimientos/marca-modelo/marca-modelo.component';
import { PlanillasComponent } from './components/mantenimientos/planillas/planillas.component';
import { PaymentMaintenanceComponent } from './components/mantenimientos/payment-maintenance/payment-maintenance.component';
import { ComChannelAuthGuard } from './guards/comission-channel.guard';

//#endregion

// *SEGURIDAD
// #region
import {
    MantenimientoPerfilesComponent
} from './components/seguridad/mantenimiento-perfiles/mantenimiento-perfiles.component';
import { RegistroUsuariosComponent } from './components/seguridad/registro-usuarios/registro-usuarios.component';
import {
    RestablecerContraseniaComponent
} from './components/seguridad/restablecer-contrasenia/restablecer-contrasenia.component';
// #endregion

// *VALIDACION DE TRAMA
import { ValidacionComponent } from './components/validacion-trama/components/validation/validation.component';
import { NewPlotComponent } from './components/validacion-trama/components/new-plot/new-plot.component';

import { RestrictGuard } from '@shared/guards/restrict.guard';
import {
    ConfigurationPlotComponent
} from './components/validacion-trama/components/configuration-plot/configuration-plot.component';
import { BandejaTramaComponent } from './components/validacion-trama/components/bandeja-trama/bandeja-trama.component';

// *SIA
import { ConfigurationComponent } from './components/desgravamen/configuration/configuration.component';
import { TrayComponent } from './components/desgravamen/tray/tray.component';
import { HorarioComponent } from './components/desgravamen/horario/horario.component'; //INI <RQ2024-57 - 03/04/2024>

import { BulkLoadComponent } from './components/desgravamen/bulk-load/bulk-load.component';
import { NewBulkLoadComponent } from './components/desgravamen/bulk-load/new-bulk-load/new-bulk-load.component';
import { ProcessLogComponent } from './components/desgravamen/bulk-load/process-log/process-log.component';
import {
    BulkLoadDetailComponent
} from './components/desgravamen/bulk-load/bulk-load-detail/bulk-load-detail.component';
import {
    NewRequestComponent
} from '@root/layout/backoffice/components/mantenimientos/new-request/new-request.component';
import { EstructuraComercialComponent } from './components/estructura-comercial/components/estructura-comercial/estructura-comercial.component';

const routes: Routes = [
    {
        path: '',
        component: BackOfficeComponent,
        children: [
            // *HOME
            { path: 'home', component: HomeComponent },

            // *REPORTES
            { path: 'reportes/produccion', component: ProduccionComponent },
            {
                path: 'reportes/certificados',
                component: AsignadosReasignadosComponent,
            },
            { path: 'reportes/endosos', component: EndososComponent },
            {
                path: 'reportes/especiesvaloradas',
                component: EspeciesValoradasComponent,
            },
            {
                path: 'reportes/especiesvaloradas/canal-puntoventa',
                component: CanalPuntoVentaComponent,
            },
            {
                path: 'reportes/especiesvaloradas/lote-puntoventa',
                component: LoteComponent,
            },
            { path: 'reportes/descargos', component: DescargosComponent },
            { path: 'reportes/tarifas', component: TarifasComponent },
            { path: 'reportes/arqueo', component: ArqueoComponent },
            {
                path: 'reportes/produccion-plataforma-digital',
                component: ProduccionPlataformaDigitalComponent,
            },
            { path: 'reportes/notas-credito', component: NotasCreditoComponent },

            // *TRANSACCIONES
            { path: 'transaccion/GenerarStock', component: GenerarStockComponent },
            {
                path: 'transaccion/AsignarSolicitud',
                component: AsignarSolicitudComponent,
            },
            {
                path: 'transaccion/ReasignarSolicitud',
                component: ReasignarSolicitudComponent,
            },
            {
                path: 'transaccion/TransferenciaApeseg',
                component: TransferenciaApesegComponent,
            },
            {
                path: 'transaccion/DescargoCertificado',
                component: DescargarCertificadoComponent,
            },
            { path: 'transaccion/PlanillaVenta', component: PlanillaVentaComponent },
            {
                path: 'transaccion/AnulacionCertificado',
                component: AnulacionCertificadoComponent,
            },
            {
                path: 'transaccion/ImpresionCertificado',
                component: ImpresionCertificadoComponent,
            },
            {
                path: 'transaccion/EndososGeneral',
                component: EndososGeneralComponent,
            },
            {
                path: 'transaccion/ConsultaCertificado',
                component: ConsultaCertificadoComponent,
            },
            {
                path: 'transaccion/CargaMasiva',
                component: CargaMasivaMainComponent,
                canActivate: [RestrictGuard],
                children: [
                    {
                        path: '',
                        component: CargaMasivaComponent,
                    },
                    {
                        path: 'estado',
                        component: CargaMasivaStateComponent,
                    },
                ],
            },
            {
                path: 'transaccion/CargaMasivaAdd',
                component: CargaMasivaUploadFileComponent,
                canActivate: [RestrictGuard],
            },
            {
                path: 'transaccion/CargaMasivaAddState',
                component: CargaMasivaAddStateComponent,
                canActivate: [RestrictGuard],
            },

            // *SOAT
            { path: 'soat/envio-certificado', component: EnvioCertificadoComponent },

            // *MANTENIMIENTOS
            {
                path: 'mantenimientos/canal-punto-venta',
                component: MantCanalPuntoVentaComponent,
            },
            {
                path: 'mantenimientos/gestion-registro',
                component: GestionDeRegistrosComponent,
            },
            {
                path: 'mantenimientos/gestion-registro/nueva-solicitud',
                component: NewRequestComponent,
            },
            { path: 'mantenimientos/marca-modelo', component: MarcaModeloComponent },
            { path: 'mantenimientos/planillas', component: PlanillasComponent },
            {
                path: 'mantenimientos/formas-de-pago',
                component: PaymentMaintenanceComponent,
                canActivate: [ComChannelAuthGuard]
            },

            // *RENTAS
            {
                path: 'rentas/reporte-rentas-vitalicias',
                component: ReporteRentasVitaliciasComponent,
            },
            {
                path: 'rentas/reporte-renta-total',
                component: ReporteRentaTotalComponent,
            },

            // *SEGURIDAD
            {
                path: 'seguridad/registro-usuarios',
                component: RegistroUsuariosComponent,
            },
            {
                path: 'seguridad/restablecer-contra',
                component: RestablecerContraseniaComponent,
            },
            {
                path: 'seguridad/mantenimiento-perfiles',
                component: MantenimientoPerfilesComponent,
            },

            // * VALIDACION DE TRAMA
            { path: 'tramas', component: ValidacionComponent },
            { path: 'tramas/bandeja', component: BandejaTramaComponent },
            { path: 'tramas/configuracion', component: ConfigurationPlotComponent },
            { path: 'tramas/nuevo', component: NewPlotComponent },

            /*VIGP 28112025*/
            // ESTRUCTURA COMERCIAL
            { path: 'estructura-comercial', component: EstructuraComercialComponent },

            // *SIA
            { path: 'desgravamen/estructuras/bandeja', component: TrayComponent },
            { path: 'desgravamen/estructuras/horario', component: HorarioComponent }, //INI <RQ2024-57 - 03/04/2024>
            {
                path: 'desgravamen/estructuras/configuracion',
                component: ConfigurationComponent,
            },
            {
                path: 'desgravamen/estructuras/configuracion/:action/:id',
                component: ConfigurationComponent,
            },
            {
                path: 'desgravamen/carga-masiva/bandeja',
                component: BulkLoadComponent,
            },
            {
                path: 'desgravamen/carga-masiva/nuevo',
                component: NewBulkLoadComponent,
            },
            {
                path: 'desgravamen/carga-masiva/detalle/:id',
                component: BulkLoadDetailComponent,
            },
            {
                path: 'desgravamen/carga-masiva/historial-reproceso/:id',
                component: ProcessLogComponent,
            },
            {
                path: 'desgravamen/configuracion-correos',
                loadChildren: () => import('./components/desgravamen/email-configuration/email-configuration.module')
                    .then((m) => m.EmailConfigurationModule)
            },

            // *DEFAULT
            { path: '**', redirectTo: 'home', pathMatch: 'full' },
        ],
        canActivate: [RestrictGuard],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    declarations: [],
    exports: [RouterModule],
    providers: [ComChannelAuthGuard],
})
export class BackOfficeRoutingModule {
}
