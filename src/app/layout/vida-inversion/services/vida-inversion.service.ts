import { Injectable } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })

export class VidaInversionService {

    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private Url = AppConfig.URL_API_SCTR;
    private ScoringUrl = AppConfig.URL_API_SCORING;
    private IdeconUrl = AppConfig.URL_API_IDECON;
    private WorldCheckUrl = AppConfig.URL_API_WORLD_CHECK;
    private RegNegativoUrl = AppConfig.URL_API_REG_NEGATIVO; // VIGP 13112025

    constructor(private http: HttpClient) { }

    public insertProspect(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/InsertProspect', body, { headers: this.headers });
    }

    public consultProspect(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/ConsultProspect', body, { headers: this.headers });
    }

    public getHolidays(): Observable<any> {
        return this.http.get(this.Url + '/ProspectsManager/GetHolidaysBetweenCurrentMonth', { headers: this.headers });
    }

    public ConsultDataComplementary(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/ConsultDataComplementary', body, { headers: this.headers });
    }


    public getProspects(data: any = {}): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/GetAllProspect', body, { headers: this.headers });
    }

    /* DGC - VIGP PEP - 06/02/2024 - INICIO */
    public getIdecon(data: any): Observable<any> {
        try {
        const body = JSON.stringify(data);
        return this.http.post(this.IdeconUrl + '/idecon/getCoincidenceNotPep', body, { headers: this.headers });
        } catch (error) {
            throw error;
        }
    }

    public getWorldCheck(data: any): Observable<any> {
        const body = JSON.stringify(data);
        // return this.http.post('https://serviciosqa.protectasecurity.pe/WC1ApiQA_Before/API' + '/WC1/getCoincidenceNotPep', body, { headers: this.headers }); // API TEMPORAL POR MOTIVO DE ERROR
        return this.http.post(this.WorldCheckUrl + '/WC1/getCoincidenceNotPep', body, { headers: this.headers });  // COMENTADO TEMPORALMENTE , DESCOMENTAR CUANDO EL SERVICIO ANTERIOR ESTE ESTABLE
    }

    public invokeServiceExperia(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ClientManager/InvokeServiceExperia', body, { headers: this.headers });
    }
    /* DGC - VIGP PEP - 06/02/2024 - FIN */

    // INI VIGP 13112025
    public getRegNegativo(data: any): Observable<any> {
        console.log("data-reg-negativo: ", data);
        const body = JSON.stringify(data);
        console.log("body-reg-negativo: ", body);
        return this.http.post(this.RegNegativoUrl + '/REGNEGATIVO/getCoincidenceRegNegativo', body, { headers: this.headers });
    }
    // FIN VIGP 13112025

    public saveDirection(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/SaveDirection', body, { headers: this.headers });
    }

    public searchByProspect(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/GetProspectById', body, { headers: this.headers });
    }

    public investmentFunds(): Observable<any> {
        return this.http.get(this.Url + '/QuotationManager/InvestmentFunds', { headers: this.headers });
    }

    public savingTime(): Observable<any> {
        return this.http.get(this.Url + '/QuotationManager/SavingTime', { headers: this.headers });
    }

    public getIntermeds(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/GetIntermeds', body, { headers: this.headers });
    }

    public reasignarIntermediario(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/ReasignarIntermediario', body, { headers: this.headers });
    }

    public SendDocument(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/PDFGenerator/SendDocument', body, { headers: this.headers });
    }

    public SendDocumentList(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/PDFGenerator/SendDocumentList', body, { headers: this.headers });
    }
    public AddEmailVIGPList(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/PDFGenerator/AddEmailVIGPList', body, { headers: this.headers });
    }

    public ConsultaIdecom(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/ConsultaIdecom', body, { headers: this.headers });
    }

    public ConsultaRegistroNegativo(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/ConsultaRegistroNegativo', body, { headers: this.headers });
    }

    public InsUpdRegistroNegativo(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/InsUpdRegistroNegativo', body, { headers: this.headers });
    }

    public ConsultaOriginPep(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/ConsultaOriginPep', body, { headers: this.headers });
    }


    public InsUpdIdecom(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/InsUpdIdecom', body, { headers: this.headers });
    }
    public updateIdecom(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/updateIdecom', body, { headers: this.headers });
    }
    public ConsultaWorldCheck(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/ConsultaWorldCheck', body, { headers: this.headers });
    }

    public InsUpdWorldCheck(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/InsUpdWorldCheck', body, { headers: this.headers });
    }
    // VIGP ARJG

    public InsUpdQOPep(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/InsUpdQOPep', body, { headers: this.headers });
    }

    // DGC - VIGP - 19/01/2024
    public InsUpdDatosPEPVIGP(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/InsUpdDatosPEPVIGP', body, { headers: this.headers });
    }

    public UpdDataComplementaryVIGP(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/UpdDataComplementaryVIGP', body, { headers: this.headers });
    }

    public reGenDocumentsVIGP(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/ReGenDocumentsVIGP', body, { headers: this.headers });
    }

    public SelDatosPEPVIGP(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/SelDatosPEPVIGP', body, { headers: this.headers });
    }

    public ReadDocumentsVIGP(data: any): Observable<any> {
        return this.http.post(this.Url + '/QuotationManager/ReadDocumentsVIGP', data);
    }

    public SaveDocumentsVIGP(data: FormData): Observable<any> {
        return this.http.post(this.Url + '/QuotationManager/SaveDocumentsVIGP', data);
    }

    public DeleteDocumentsVIGP(data: any): Observable<any> {
        return this.http.post(this.Url + '/QuotationManager/DeleteDocumentsVIGP', data);
    }

    // public DownloadDocumentsVIGP(_filePath: string): Observable<any> {
    //     let data = { filePath: _filePath };
    //     return this.http.get(this.Url + "/QuotationManager/DownloadDocumentsVIGP", { params: data, responseType: 'blob' });
    // }

    public GetProviderListVIGP(ramo: number): Observable<any> {
        const data = { ramo };
        return this.http.post(this.Url + '/QuotationManager/GetProviderListVIGP', data);
    }

    public InsOriginDetailCab(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/InsUpdOriginDetailCab', body, { headers: this.headers });
    }

    public GetOriginDetailCab(cotizacion_id: any): Observable<any> {
        const body = { P_NID_COTIZACION: cotizacion_id };
        return this.http.post(this.Url + '/QuotationManager/GetOriginDetailCab', body);
    }

    public InsOriginDetailDet(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/InsUpdOriginDetailDet', body, { headers: this.headers });
    }

    public GetOriginDetailDet(cotizacion_id: any): Observable<any> {
        const body = { P_NID_COTIZACION: cotizacion_id };
        return this.http.post(this.Url + '/QuotationManager/GetOriginDetailDet', body);
    }

    public DeleteOriginDetail(cotizacion_id: any): Observable<any> {
        const body = { P_NID_COTIZACION: cotizacion_id };
        return this.http.post(this.Url + '/QuotationManager/DeleteOriginDetail', body);
    }

    public InsPerfilamiento(formData: FormData): Observable<any> {
        return this.http.post(this.Url + '/QuotationManager/InsPerfilamiento', formData);
    }

    public RequestScoring(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/RequestScoring', body, { headers: this.headers });
    }

    public getScoringOptions(): Observable<any> {
        return this.http.get(this.Url + '/QuotationManager/GetScoringOptions', { headers: this.headers });
    }

    public CleanBeneficiar(formData: FormData): Observable<any> {
        return this.http.post(this.Url + '/QuotationManager/CleanBeneficiar', formData);
    }

    public validateClientProspect(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/ValidateClientProspect', body, { headers: this.headers });
    }

    public ListarReportePolizaTransaccionVIGP(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/PolicyManager/ListarReportePolizaTransaccionVIGP', body, { headers: this.headers });
    }

    public getDateIdecon(P_SCLIENT: any): Observable<any> {
        let _params = { P_SCLIENT: P_SCLIENT }
        return this.http.get(this.Url + `/ProspectsManager/GetDateIdecom?P_SCLIENT=${_params.P_SCLIENT}`);
    }

    public ListarSolicitudesSuscripcion(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/PolicyManager/ListarSolicitudesSuscripcion', body, { headers: this.headers });
    }
    public InsertarSuscripcion(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/PolicyManager/INS_SUSCRIPTION_VIGP', body, { headers: this.headers });
    }

    public GetBeneficiaries(P_NID_COTIZACION: any, P_NID_PROC: any): Observable<any> {
        let _params = { P_NID_COTIZACION: P_NID_COTIZACION, P_NID_PROC: P_NID_PROC }
        return this.http.get(this.Url + `/PolicyManager/GetBeneficiaries?P_NID_COTIZACION=${_params.P_NID_COTIZACION}&P_NID_PROC=${_params.P_NID_PROC}`);
    }

    public GetQuotationFunds(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetQuotationFunds', body, { headers: this.headers });
    }

    public InsQuotationFunds(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/InsQuotationFunds', body, { headers: this.headers });
    }

    public getListaPlanes(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetListaPlanes', body, { headers: this.headers });
    }

    // EECC - VIGP - DGC - 23/10/2024
    public InsertEeccRecordVigp(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/InsertEeccRecordVigp', body, { headers: this.headers });
    }
    public InsertEeccReportListVigp(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/InsertEeccReportListVigp', body, { headers: this.headers });
    }
    public GetMonthsEeccVigp(): Observable<any> {
        return this.http.get(this.Url + '/QuotationManager/GetMonthsEeccVigp', { headers: this.headers });
    }
    public GetYearsEeccVigp(): Observable<any> {
        return this.http.get(this.Url + '/QuotationManager/GetYearsEeccVigp', { headers: this.headers });
    }
    public GetMaxRecordEeccVigp(): Observable<any> {
        return this.http.get(this.Url + '/QuotationManager/GetMaxRecordEeccVigp', { headers: this.headers });
    }
    public GetRecordEeccVigp(): Observable<any> {
        return this.http.get(this.Url + '/QuotationManager/GetRecordEeccVigp', { headers: this.headers });
    }

    public GetFileClientStates(): Observable<any> {
        return this.http.get(this.Url + '/QuotationManager/GetFileClientStates', { headers: this.headers });
    }

    public ValidateFundDate(date: Date): Observable<any> {
        const data = {
            P_FECHA_ABONO: date
        };
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/ValidateFundDate', body, { headers: this.headers });
    }

    public GetCalculatedScore(quoteId: number, typeClient: number = 1): Observable<any> {
        return this.http.get(this.Url + `/QuotationManager/Scoring?quoteId=${quoteId}&typeClient=${typeClient}`, { headers: this.headers });
    }

    public GetScoreQualification(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + `/QuotationManager/GetScoringQualification`, body, { headers: this.headers });
    }

    public searchByProspectQuotation(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/SearchProspectQuotation', body, { headers: this.headers });
    }

    public RechazoUsuarioVIGP(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/RechazoUsuarioVIGP', body, { headers: this.headers });
    }

    public GetHistorialEvaluaciones(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/GetHistorialEvaluaciones', body, { headers: this.headers });
    }
    public downloadQuotationDocument(quotationNumber: string, documentType: string): Observable<Blob> {
        if (!quotationNumber || !documentType) {
            throw new Error('Parámetros incompletos');
        }
        return this.http.post(
            `${this.Url}/SharedManager/DonwloadSLipVIGP`,
            {
                QuotationNumber: quotationNumber,
                FilePath: documentType
            },
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                }),
                responseType: 'blob'
            }
        );
    }

    public UpdDataComplementaryCotProspect(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/UpdDataComplementaryCotProspect', body, { headers: this.headers });
    }

    public getIsActiveDataQuality(codRamo: string): Observable<any> {
        const body = JSON.stringify({ NBRANCH: codRamo });
        return this.http.post(`${this.Url}/QuotationManager/GetIsActiveDataQuality`, body, { headers: this.headers });
    }

    public updateStatusTotalPayment(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(`${this.Url}/QuotationManager/UpdateStatusTotalPayment`, body, { headers: this.headers });
    }

    public getBanksVigp(): Observable<any> {
        return this.http.get(this.Url + '/QuotationManager/GetBancosVigp', { headers: this.headers });
    }
    
    public getStatusPaymentQuotationVigp(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(`${this.Url}/QuotationManager/GetStatusPaymentQuotationVigp`, body, { headers: this.headers });
    }

    public UpdateCambioFirma(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/UpdateCambioFirma', body, { headers: this.headers });
    }

    // INI VIGP 13112025
    public approveNegativeRecord(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ProspectsManager/ApproveNegativeRecord', body, { headers: this.headers });
    }
    // FIN VIGP 13112025

    // INI VIGP-485
    public AcceptPromotions(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/QuotationManager/AcceptPromotions', body, { headers: this.headers });
    }

    public GetCurrentPromotionValue(P_NID_COTIZACION: any): Observable<any> {
        return this.http.get(this.Url + `/QuotationManager/GetCurrentPromotionValue?NidCotizacion=${P_NID_COTIZACION}`);
    }
    // FIN VIGP-485
    
    // INI VIGP-190
    //TODO ===> Colocar la Url en un archivo de configuracion
    public ResendPolicyKit(P_NPOLICY: any): Observable<any> {
        return this.http.get(`https://protectavigp.protectasecurity.pe/backend/api/document/resend-kit/${P_NPOLICY}/1`);
    }
    // FIN VIGP-190
}
