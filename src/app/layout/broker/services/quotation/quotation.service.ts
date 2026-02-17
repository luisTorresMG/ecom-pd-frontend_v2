import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../../app.config';
import { BrokerAgencySearch } from '../../models/maintenance/agency/request/broker-agency-search';
import { BrokerAgency } from '../../models/maintenance/agency/response/broker-agency';
import { Agency } from '../../models/maintenance/agency/request/agency';
import { GenericResponse } from '../../models/shared/generic-response';
import { QuotationSearch } from '../../models/quotation/request/quotation-search';
import { QuotationStatusChange } from '../../models/quotation/request/quotation-status-change';
import { QuotationTrackingSearch } from '../../models/quotation/request/quotation-tracking-search';

@Injectable({
    providedIn: 'root'
})
export class QuotationService {
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }

    public getInfoQuotationAuth(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetInfoQuotationAuth', body, {
            headers: this.headers
        });
    }

    public getProcessCode(numeroCotizacion: any): Observable<any> {
        let _params = { numeroCotizacion: numeroCotizacion }
        return this.http.get(this.Url + '/QuotationManager/GetProcessCode', { params: _params });
    }

    public getBandejaList(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetBandejaList', body, {
            headers: this.headers
        });
    }

    public UpdateCodQuotation(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http.post(
            this.Url + '/QuotationManager/UpdateCodQuotation', request, { headers: this.headers });
    }

    public UpdateReQuotation(data: any): Observable<any> {
        const request = data;
        return this.http.post(
            this.Url + '/QuotationManager/ReQuotationVL', request, { headers: this.headers });
    }

    public getQuotationList(data: QuotationSearch): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetQuotationList', body, {
            headers: this.headers
        });
    }

    public getPolicyList(data: QuotationSearch): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetPolicyList', body, {
            headers: this.headers
        });
    }

    public getTrackingList(data: QuotationTrackingSearch): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetTrackingList', body, {
            headers: this.headers
        });
    }

    public changeStatus(formData: FormData): Observable<any> {
        return this.http.post(this.Url + '/QuotationManager/ChangeStatus', formData);
    }
    public changeStatusVL(formData: FormData): Observable<any> {
        return this.http.post(this.Url + '/QuotationManager/ChangeStatusVL', formData);
    }
    public modifyQuotation(formData: FormData): Observable<any> {
        return this.http.post(this.Url + '/QuotationManager/ModifyQuotation', formData);
    }

    public searchBroker(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http
            .post(
                this.Url + '/QuotationManager/SearchBroker', request, {
                headers: this.headers
            });
    }
    public insertQuotation(data: FormData): Observable<any> {
        return this.http
            .post(
                this.Url + '/QuotationManager/InsertQuotation', data);
    }
    public envioTecnicaPolizaMatriz(data: FormData): Observable<any> {
        return this.http
            .post(
                this.Url + '/QuotationManager/envioTecnicaPolizaMatriz', data);
    }
    public approveQuotation(data: any): Observable<any> {

        return this.http
            .post(
                this.Url + '/QuotationManager/ApproveQuotation', data);
    }
    public ValidarReglasPagos(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http
            .post(this.Url + '/QuotationManager/ValidarReglasPago', request, { headers: this.headers });
    }
    public getStatusList(certype: string, codProduct: string): Observable<any> {
        const _params = { certype: certype, codProduct: codProduct }
        return this.http.get(this.Url + '/QuotationManager/GetStatusList', { params: _params });
    }

    public getReasonList(statusCode: string, branch: string = "0"): Observable<any> {
        statusCode = statusCode === undefined ? '0' : statusCode;
        const _params = { statusCode: statusCode, branch: branch };
        return this.http.get(this.Url + '/QuotationManager/GetReasonList', {
            params: _params,
        });
    }
    public equivalentMunicipality(municipality: string): Observable<any> {
        const _params = { municipality: municipality }
        return this.http.get(this.Url + '/QuotationManager/EquivalentMunicipality', { params: _params });
    }
    public getPlanList(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http.post(
            this.Url + '/QuotationManager/GetPlansList', request, {
            headers: this.headers
        });
    }

    public getPlanListAcc(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http.post(
            this.Url + '/QuotationManager/GetPlansListAcc', request, {
            headers: this.headers
        });
    }

    public getComisionList(nrocotizacion: any): Observable<any> {
        return this.http.get(this.Url + '/QuotationManager/ComisionGet?nroCotizacion=' + nrocotizacion, {});
    }

    public getGlossList(): Observable<any> {
        return this.http.get(this.Url + '/QuotationManager/GlossGet', {});
    }

    public getTasaVL(value: string): Observable<any> {
        const _params = { codComision: value }
        return this.http.get(this.Url + '/QuotationManager/TasaVLGet', { params: _params });
    }

    public valTrama(paquete: FormData): Observable<any> {
        return this.http.post(this.Url + '/QuotationManager/validarTramaVL', paquete);
    }

    public getEquivalente(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http.post(this.Url + '/MapfreIntegration/EquivalenciaMapfre', request, {
            headers: this.headers
        });
    }

    public getIGV(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http.post(
            this.Url + '/QuotationManager/GetIgv', request, {
            headers: this.headers
        });
    }

    public getPlans(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(
            this.Url + '/QuotationManager/GetPlan', body, {
            headers: this.headers
        }
        )
    }

    public getQuotationCoverByNumQuotation(_numCotizacion: string): Observable<any> {
        const _params = { numCotizacion: _numCotizacion }
        return this.http.get(this.Url + '/QuotationManager/GetQuotationCoverByNumQuotation', { params: _params });
    }

    public ValidateRetroactivity(data: FormData): Observable<any> {
        return this.http
            .post(
                this.Url + '/QuotationManager/ValidateRetroactivity', data);
    }

    public GetExcelQuotationList(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post<string>(this.Url + "/QuotationManager/GetExcelQuotationList", body, { headers: this.headers })
    }

    public GetFechaFin(fecha: any, freq: any): Observable<any> {
        const url = this.Url + '/QuotationManager/GetFechaFin?fecha=' + fecha + '&freq=' + freq;
        return this.http.get(url);
    }

    public reverseMovementsIncomplete(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/ReverseMovementsIncomplete', body, {
            headers: this.headers
        });
    }

    public GetSobrevivencia(params: any): Observable<any> {
        const url = this.Url + '/QuotationManager/GetSobrevivencia?nidcotizacion=' + params.nidcotizacion + '&nbranch=' + params.nbranch;
        return this.http.post(url, { headers: this.headers });
    }

    public UpdateCotizacionClienteEstado(data: FormData): Observable<any> {
        return this.http
            .post(
                this.Url + '/QuotationManager/UpdateCotizacionClienteEstado', data);
    }

    public validateBroker(data: FormData): Observable<any> {
        return this.http
            .post(
                this.Url + '/QuotationManager/validateBroker', data);
    }

    public NullQuotationCIP(data: any): Observable<any> {
        return this.http
            .post(
                this.Url + '/QuotationManager/NullQuotationCIP', data);
    }

    public getBrokerAgenciadosCTR(data: any): Observable<any> {
        const url = this.Url + '/QuotationManager/GetBrokerAgenciadoSCTR?P_SCLIENT=' + data.P_SCLIENT + '&P_TIPO=' + data.P_TIPO;
        return this.http.post(url, { headers: this.headers });
    }

    public equivalentINEI(municipality: string): Observable<any> {
        const _params = { municipality: municipality }
        return this.http.get(this.Url + '/QuotationManager/equivalentINEI', { params: _params });
    }

    public obtRMV(P_DATE: string): Observable<any> {
        const url = this.Url + '/QuotationManager/obtRMV?P_DATE=' + P_DATE;
        return this.http.post(url, { headers: this.headers });
    }

    public getComisionTecnica(P_SCLIENT: string): Observable<any> {
        const url = this.Url + '/QuotationManager/GetComisionTecnica?P_SCLIENT=' + P_SCLIENT;
        return this.http.post(url, { headers: this.headers });
    }

    public getTasastecnica(P_SCLIENT: string): Observable<any> {
        const url = this.Url + '/QuotationManager/GetTasastecnica?P_SCLIENT=' + P_SCLIENT;
        return this.http.post(url, { headers: this.headers });
    }

    public getEstadoClienteNuevo(P_SCLIENT: string): Observable<any> {
        const url = this.Url + '/QuotationManager/GetEstadoClienteNuevo?P_SCLIENT=' + P_SCLIENT;
        return this.http.post(url, { headers: this.headers });
    }

    public relanzarCip(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post<string>(this.Url + "/QuotationManager/RelanzarCip", body, { headers: this.headers })
    }

    public getCuponesExclusion(P_CUPON: string): Observable<any> {
        const url = this.Url + '/QuotationManager/getCuponesExclusion?nid_proc=' + P_CUPON;
        return this.http.get(url);
    }

    public getValReversar(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post<string>(this.Url + "/QuotationManager/getValReversar", body, { headers: this.headers })
    }


    public getRecotizacion(P_TIPO: string, COTIZACION: string): Observable<any> {
        const url = this.Url + '/QuotationManager/getRecotizacion?tipo=' + P_TIPO + '&cotizacion=' + COTIZACION;
        return this.http.post(url, { headers: this.headers });
    }

    public ValidarPrima(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http
            .post(this.Url + '/QuotationManager/ValidarPrima', request, { headers: this.headers });
    }

    public getJefeVIGP(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/GetJefe', request, {
            headers: this.headers
        });
    }

    public getSupervisorVIGP(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/GetSupervisorVIGP', request, {
            headers: this.headers
        });
    }

    public getAsesorVIGP(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/GetAsesorVIGP', request, {
            headers: this.headers
        });
    }

    public getQuotationsVIGP(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetQuotationsVIGP', body, {
            headers: this.headers
        });
    }

    public cancelCotizacionesVigentesVIGP(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/CancelQuote', body, {
            headers: this.headers
        });
    }

    public GetFechaFinVigenciaPoliza(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetFechaFinVigenciaPoliza', body, { headers: this.headers });
    }

    public getCotizacionesVigentesVIGP(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetCotizacionesVigentesVIGP', body, {
            headers: this.headers
        });
    }

    public getCotizacionesNoVigentesVIGP(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetCotizacionesNoVigentesVIGP', body, {
            headers: this.headers
        });
    }

    public insUpdDatosPep(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/InsUpdDatosPep', body, {
            headers: this.headers
        });
    }

    public postFamily(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/PostFamily', body, {
            headers: this.headers
        });
    }

    public getDatosPep(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetDatosPep', body, {
            headers: this.headers
        });
    }

    public getDatosPepFam(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetDatosPepFam', body, {
            headers: this.headers
        });
    }

    public getRelationBenefeciaries(): Observable<any> {
        return this.http.get(this.Url + '/QuotationManager/GetRelationBenefeciaries', { headers: this.headers });
    }

    public GetCotizacionPre(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetCotizacionPre', body, {
            headers: this.headers
        });
    }

    public ValidateLastsDaysMonths(date: any): Observable<any> {
        const url = this.Url + '/QuotationManager/ValidateLastsDaysMonths?val_date=' + date;
        return this.http.get(url);
    }

    public UpdDateFundQuotation(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/UpdDateFundQuotation', body, { headers: this.headers });
    }

    public InsUpdCotiStatesVIGP(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/InsUpdCotiStatesVIGP', body, { headers: this.headers });
    }

    public InsUpdCotiStatesVIGPDoc(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/InsUpdCotiStatesVIGPDoc', body, { headers: this.headers });
    }

    public InsCommentsCotiVIGP(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/InsCommentsCotiVIGP', body, { headers: this.headers });
    }

    public GetCommentsCotiVIGP(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetCommentsCotiVIGP', body, { headers: this.headers });
    }

    public GetNidStateAndDefState(NID_COTIZACION: any): Observable<any> {
        let _params = { NID_COTIZACION: NID_COTIZACION }
        return this.http.get(this.Url + `/QuotationManager/GetNidStateAndDefState?NID_COTIZACION=${_params.NID_COTIZACION}`, {
            headers: this.headers
        });
    }

    public InsFirmaElectronicaVIGP(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/InsFirmaElectronicaVIGP', body, { headers: this.headers });
    }

    public ChangeInsuredPd(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/ChangeInsuredPd', body, { headers: this.headers });
    }

    public postWorks(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/PostWorks', body, {
            headers: this.headers
        });
    }

    public getDatoWorks(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetDatosWork', body, {
            headers: this.headers
        });
    }

    public postRelative(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/PostRelative', body, {
            headers: this.headers
        });
    }

    public getDatosPepRelatives(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetDatosPepRelatives', body, {
            headers: this.headers
        });
    }

    public GetNidStateCotizac(NID_COTIZACION: any): Observable<any> {
        let _params = { NID_COTIZACION: NID_COTIZACION }
        return this.http.get(this.Url + `/QuotationManager/GetNidStateCotizac?NID_COTIZACION=${_params.NID_COTIZACION}`, {
            headers: this.headers
        });
    }

    public getQuotationDefinitiveConsult(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetQuotationDefinitiveConsult', body, {
            headers: this.headers
        });
    }

    public GetAdditionalInformationPolicy(nid_cotizacion: any, nid_proc: any): Observable<any> {

        const data = {
            Nid_cotizacion: nid_cotizacion,
            Nid_proc: nid_proc
        }
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetAdditionalInformationPolicy', body, { headers: this.headers });
    }

    public GetExpirDate(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetExpirDate', body, { headers: this.headers });
    }

    public getRequestSuscription(P_NID_COTIZACION: any): Observable<any> {
        let _params = { P_NID_COTIZACION: P_NID_COTIZACION }
        return this.http.get(this.Url + `/PolicyManager/GetRequestSuscription?P_NID_COTIZACION=${_params.P_NID_COTIZACION}`);
    }

    public InsSolicitud(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/InsSolicitud', body, { headers: this.headers });
    }

    public getPremiumByRules(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/getPremiumByRules', request, {
            headers: this.headers
        });
    }

    public getDerivationRules(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/getDerivationRules', request, {
            headers: this.headers
        });
    }

    public getValidateRetroactivityRules(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/getValidateRetroactivityRules', request, {
            headers: this.headers
        });
    }

    public getValidateDelimitationRules(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/getValidateDelimitationRules', request, {
            headers: this.headers
        });
    }

    public getValidateMovementCupon(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/ValidateMovementCupon', request, {
            headers: this.headers
        });
    }

    public UpdateSignatureStatus(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/UpdateHandwrittenStatus', body, {
            headers: this.headers
        });
    }

    public GetRoutesDocsPep(Nid_Cotizacion: any): Observable<any> {
        return this.http.get(this.Url + `/QuotationManager/GetRoutesDocsPep?Nid_Cotizacion=${Nid_Cotizacion}`);
    }

    public UpdateSignatureType(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/UpdateSignatureType', body, { headers: this.headers });
    }

    public ValidarListoParaEmitir(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/ValidarListoParaEmitir', body, {
            headers: this.headers
        });
    }

    public getRelationsPep(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/getRelationsPep', body, {
            headers: this.headers
        });
    }

    public TriggerDocumentGenerationByType(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.put(this.Url + '/QuotationManager/TriggerDocumentGenerationByType', body, {
            headers: this.headers
        });
    }

    public getValidateStatusCoupon(P_NIC_PROC: string): Observable<any> {
        const url = this.Url + '/QuotationManager/GetValidateStatusCoupon?NID_PROC=' + P_NIC_PROC;
        return this.http.get(url);
    }

    public getValTramaFin(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetEstadoTrama', request, {
          headers: this.headers
        });
    }

    public UpdateTramaAsegurados(params: any): Observable<any> {
        const url = this.Url + '/QuotationManager/UpdateTramaAsegurados?nid_proc=' + params;
        return this.http.post(url, { headers: this.headers });
    }

    public insertLogAuth(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/InsertLogAuth', request, {
          headers: this.headers
        });
    }
}
