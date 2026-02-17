// import { PolizaAsegurados } from './../../../../models/polizaEmit/PolizaAsegurados';
import { AppConfig } from '../../../../app.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { SavedPolicyEmit } from '../../models/polizaEmit/savedPolicyEmit';
import { InsuredPolicySearch } from '../../models/polizaEmit/request/insured-policy-search';
import { PolicyProofSearch } from '../../models/polizaEmit/request/policy-proof-search';
import { PolicyTransactionSearch } from '../../models/polizaEmit/request/policy-transaction-search';
import { QuotationTrackingSearch } from '../../models/quotation/request/quotation-tracking-search';
import { TableType } from '../../models/payroll/tabletype';
import { map, timeout } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class PolicyemitService {
    private _baseUrl = AppConfig.URL_API_SCTR;
    private _urlPayment = AppConfig.PD_API;
    private _urlPayment2 = AppConfig.WSPD_API;

    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    constructor(private http: HttpClient) { }

    public ValidatePolicyRenov(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(
            this._baseUrl + '/PolicyManager/ValidatePolicyRenov',
            body,
            {
                headers: this.headers,
            }
        );
    }

    public CancelMovement(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(
            this._baseUrl + '/PolicyManager/CancelMovement',
            body,
            {
                headers: this.headers,
            }
        );
    }

    public getValidateExistPolicy(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(
            this._baseUrl + '/PolicyManager/GetValidateExistPolicy',
            body,
            {
                headers: this.headers,
            }
        );
    }

    public getPolicyMovementsTransAllList(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(
            this._baseUrl + '/PolicyManager/GetPolicyMovementsTransAllList',
            body,
            {
                headers: this.headers,
            }
        );
    }

    public getDocumentsList(data: any): Observable<any> {
        const url = this._baseUrl + '/PolicyManager/GetDocuments?sruta=' + data;
        return this.http.get(url);
    }

    public getTransactionAllList(): Observable<any[]> {
        return this.http.get<any[]>(
            this._baseUrl + '/PolicyManager/GetTransactionAllList'
        );
    }

    public GetPolicyTransAllList(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(
            this._baseUrl + '/PolicyManager/GetPolicyTransactionAllList',
            body,
            {
                headers: this.headers,
            }
        );
    }

    public GetPolicyTransAllListExcel(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post<string>(
            this._baseUrl + '/PolicyManager/GetPolicyTransactionAllListExcel',
            body,
            { headers: this.headers }
        );
    }

    getPolicyEmitCab(nroCotizacion: any, typeMovement: string, userCode: any, trama: any = 0, stransac: any = null, cot_detalle: any = 0): Observable<any> {
        const url = this._baseUrl + '/PolicyManager/PolizaEmitCab?nroCotizacion=' + nroCotizacion + '&typeMovement=' + typeMovement + '&userCode=' + userCode + '&trama=' + trama + '&stransac=' + stransac + '&cot_detalle=' + cot_detalle;
        return this.http.get(url);
    }

    getPolicyEmitComer(nroCotizacion: any, isCotizacion = 0, stransac: any = null): Observable<any> {
        const url = `${this._baseUrl}/PolicyManager/PolizaEmitComer?nroCotizacion=${nroCotizacion}&isCotizacion=${isCotizacion}&stransac=${stransac}`;
        return this.http.get(url);
    }

    getPolicyEmitDet(nroCotizacion: any, userCode: string): Observable<any> {
        const url =
            this._baseUrl +
            '/PolicyManager/PolizaEmitDet?nroCotizacion=' +
            nroCotizacion +
            '&userCode=' +
            userCode;
        return this.http.get(url);
    }

    getPolicyEmitDetTX(data: any): Observable<any> {
        const body = JSON.stringify(data);
        const url = this._baseUrl + '/PolicyManager/PolizaEmitDetTX';
        return this.http.post(url, body, { headers: this.headers });
    }
    getPolicyCot(nroCotizacion: any, transac: number = 0): Observable<any> {
        const url =
            this._baseUrl +
            '/PolicyManager/PolizaCot?nroCotizacion=' +
            nroCotizacion +
            '&nroTransac=' +
            transac;
        return this.http.get(url);
    }  
    getTipoRenovacion(data: any): Observable<any> {
        const body = JSON.stringify(data);
        const url = this._baseUrl + '/PolicyManager/TipoRenovacion';
        return this.http.post(url, body, {
            headers: this.headers,
        });
    }
    GetTipoRenovacionGraph(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(
            this._baseUrl + '/PolicyManager/GetTipoRenovacionGraph',
            params,
            { headers: this.headers }
        );
    }
    GetAnnulment() {
        const url = this._baseUrl + '/PolicyManager/MotivoAnulacion';
        return this.http.get(url);
    }
    // tipo endoso
    GetTypeEndoso() {
        const url = this._baseUrl + '/PolicyManager/TypeEndoso';
        return this.http.get(url);
    }
    getFrecuenciaPago(codrenovacion: any, producto: any = 0): Observable<any> {
        const url =
            this._baseUrl +
            '/PolicyManager/FrecuenciaPago?codrenovacion=' +
            codrenovacion +
            '&producto=' +
            producto;
        return this.http.get(url);
    }
    getFrecuenciaPagoGraph(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(
            this._baseUrl + '/PolicyManager/GetFrecuenciaPagoGraph',
            params,
            { headers: this.headers }
        );
    }
    savePolicyEmit(paquete: FormData): Observable<any> {
        const url = this._baseUrl + '/PolicyManager/SavedPolicyEmit';
        return this.http.post(url, paquete);
    }
    nroPolizas(salud: any, pension: any): Observable<any> {
        const url =
            this._baseUrl +
            '/PolicyManager/NroPoliza?salud=' +
            salud +
            '&pension=' +
            pension;
        return this.http.post(url, null);
    }
    getProductTypeList(): Observable<any> {
        const url = this._baseUrl + '/PolicyManager/GetProductTypeList';
        return this.http.get(url);
    }
    getMovementTypeList(): Observable<any> {
        const url = this._baseUrl + '/PolicyManager/GetMovementTypeList';
        return this.http.get(url);
    }
    getInsuredPolicyList(data: InsuredPolicySearch): Observable<any> {
        const body = JSON.stringify(data);
        const url = this._baseUrl + '/PolicyManager/GetInsuredPolicyList';
        return this.http.post(url, body, {
            headers: this.headers,
        });
    }
    getPolicyProofList(data: PolicyProofSearch): Observable<any> {
        const body = JSON.stringify(data);
        const url = this._baseUrl + '/PolicyManager/GetPolicyProofList';
        return this.http.post(url, body, {
            headers: this.headers,
        });
    }
    getPolicyTransactionList(data: PolicyTransactionSearch): Observable<any> {
        const body = JSON.stringify(data);
        const url = this._baseUrl + '/PolicyManager/GetPolicyTransactionList';
        return this.http.post(url, body, {
            headers: this.headers,
        });
    }
    valGestorList(paquete: FormData): Observable<any> {
        return this.http.post(
            this._baseUrl + '/PolicyManager/savedAsegurados',
            paquete
        );
    }

    reportErrors(listErrores: any) {
        const body = JSON.stringify(listErrores);
        const url = this._baseUrl + '/PolicyManager/GenerarExcelError';
        return this.http.post(url, body, {
            headers: this.headers
        });
    }

    transactionPolicy(renew: FormData): Observable<any> {
        return this.http.post(
            this._baseUrl + '/PolicyManager/TransactionPolicy',
            renew
        );
    }

    savePolicyMovementsVCF(my_form_data: FormData): Observable<any> {
        return this.http.post(this._baseUrl + '/PolicyManager/SavePolicyMovementsVCF', my_form_data);
    }

    getPolicyMovementsVCF(my_form_data: FormData): Observable<any> {
        return this.http.post(this._baseUrl + '/PolicyManager/GetPolicyMovementsVCF', my_form_data);
    }

    sendMailMovementsVCF(my_form_data: FormData): Observable<any> {
        return this.http.post(this._baseUrl + '/PolicyManager/SendMailMovementsVCF', my_form_data);
  } 

    renewMod(data: any, myTotalData: FormData = null): Observable<any> {
        if (myTotalData == null) {
            const body = JSON.stringify(data);
            const url = this._baseUrl + '/PolicyManager/RenewMod';
            return this.http.post(url, body, {
                headers: this.headers
            });
        } else {
            myTotalData.append('objeto', JSON.stringify(data));
            const url = this._baseUrl + '/PolicyManager/RenewModFiles';
            return this.http.post(url, myTotalData);
        }
    }

    renewModSCTR(data: FormData = null): Observable<any> {
        const url = this._baseUrl + '/PolicyManager/RenewModSctr';
        return this.http.post(url, data).pipe(
            timeout(100000) // espera máximo 100 segundos
        );
    }

    downloadExcel(data: any): Observable<any> {
        const body = JSON.stringify(data);
        const url = this._baseUrl + '/PolicyManager/downloadExcel';
        return this.http.post(url, body, {
            headers: this.headers
        });

    }
    valBilling(data: any): Observable<any> {
        const body = JSON.stringify(data);
        const url = this._baseUrl + '/PolicyManager/valBilling';
        return this.http.post(url, body, {
            headers: this.headers
        });
    }
    getPolicyTrackingList(data: QuotationTrackingSearch): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(
            this._baseUrl + '/PolicyManager/GetPolicyTrackingList',
            body,
            {
                headers: this.headers,
            }
        );
    }
    savedPolicyTransac(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(
            this._baseUrl + '/PolicyManager/SavedPolicyTransac',
            body,
            {
                headers: this.headers,
            }
        );
    }

    registerPayment(data: any): Observable<any> {
        const customerName =
            data.cliente.p_SCLIENT_NAME +
            ' ' +
            data.cliente.p_SCLIENT_APPPAT +
            ' ' +
            data.cliente.p_SCLIENT_APPMAT;

        const request = {
            TransactionToken: data.transactionToken,
            SessionToken: data.sessionToken,
            ProcesoId: data.processId,
            PlanillaId: data.planillaId,
            FlujoId: data.flujoId,
            UserId: data.userId,
            TipoPago: data.tipoPago,
            Nombres: data.nombres,
            Apellidos: data.apellidos,
            Correo: data.correo,
            Total: data.total,
            // PDF Information ---------------------
            Pdf_Email: data.cliente.p_SMAIL,
            Pdf_CustomerName: customerName,
            Pdf_PhoneNumber: data.cliente.p_SPHONE,
            CodigoCanal: data.canal,
            CodigoPuntoDeVenta: data.puntoDeVenta,
            Modalidad: data.modalidad,
            ChannelCode: sessionStorage.getItem('referenteCode'),
            Policy: data.policy,
            Movement: data.typeMovement,
        };

        const body = JSON.stringify(request);
        return this.http.post(this._baseUrl + '/Payment/registerPayment', body, {
            headers: this.headers,
        });

    }
    
    downloadExcelRecargoVG(data: any): Observable<any> {
        const body = JSON.stringify(data);
        const url = this._baseUrl + '/PolicyManager/downloadExcelRecargoVG';
        return this.http.post(url, body, {
            headers: this.headers
        });

    }

    
    generateProcess(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this._baseUrl + '/Payment/generarProcess', body, {
            headers: this.headers,
        });
    }

    public getTransaccionList(): Observable<any[]> {
        return this.http.get<any[]>(
            this._baseUrl + '/PolicyManager/GetTransaccionList'
        );
    }

    public getPolicyTransList(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(
            this._baseUrl + '/PolicyManager/GetPolicyTransList',
            body,
            {
                headers: this.headers,
            }
        );
    }

    public getPolicyMovementsTransList(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(
            this._baseUrl + '/PolicyManager/GetPolicyMovementsTransList',
            body,
            {
                headers: this.headers,
            }
        );
    }

        /* CASUÍSTICA RMV */
    reversoCotizacionSCTR(
        nroCotizacion: number, 
        perfil: number
    ): Observable<any> {
        const url = this._baseUrl + 
        '/PolicyManager/reversoCotizacionSCTR?nroCotizacion=' + 
        nroCotizacion + 
        '&perfil=' + 
        perfil;
        return this.http.post(url, { nroCotizacion, perfil });
    }
    /* CASUÍSTICA RMV */


    public valTransactionPolicy(
        nroCotizacion: any,
        idTipo?: any,
        perfil?: any,
        origen?: any
    ): Observable<any> {
        const url =
        this._baseUrl +
        '/PolicyManager/valTransactionPolicy?nroCotizacion=' +
        nroCotizacion +
        '&idTipo=' +
        idTipo +
        '&perfil=' +
        perfil +
        '&origen=' +
        origen;
        return this.http.get(url);
    }

    public GetVisualizadorProc(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(
            this._baseUrl + '/PolicyManager/GetVisualizadorProc',
            body,
            {
                headers: this.headers,
            }
        );
    }

    public getDataConfig(stype: any): Observable<any> {
        const url = this._baseUrl + '/PolicyManager/getDataConfig?stype=' + stype;
        return this.http.get(url);
    }

    public checkPaymentTypes(data: any): Observable<any> {
        const httpOption = {
            headers: new HttpHeaders({ Authorization: 'Bearer ' + data.token }),
        };
        const url =
            this._urlPayment +
            '/codechannel/obtenertipopagocanal/' +
            data.canal +
            '/2';
        return this.http.get(url, httpOption);
    }

    public generateTokenVisa(dataVisa: any, token: any): Observable<any> {
        const data: any = {};
        data.Data = btoa(JSON.stringify(dataVisa));
        const httpOption = new HttpHeaders({ Authorization: 'Bearer ' + token });
        const url = this._urlPayment + '/pago/GenerateVisaSecurityToken';
        return this.http.post<any>(url, data, {
            headers: httpOption,
        });
    }

    public verifyVisa(dataVisa: any, token: any): Observable<any> {
        const data: any = {};
        data.Data = btoa(JSON.stringify(dataVisa));
        const httpOption = new HttpHeaders({ Authorization: 'Bearer ' + token });
        const url =
            this._urlPayment + '/emissionproc/emissionprocesscompletepolicy';
        return this.http.post<any>(url, data, {
            headers: httpOption,
        });
    }

    public verifyNiubiz(dataVisa: any, token: any): Observable<any> {
        // const data: any = {};
        // data.Data = JSON.stringify(dataVisa);
        const data = JSON.parse(JSON.stringify(dataVisa));
        const httpOption = new HttpHeaders({ Authorization: 'Bearer ' + token });
        const url = this._urlPayment2 + '/pago/niubiz/procesar';
        return this.http.post<any>(url, data, {
            headers: httpOption,
        });
    }

    public generateCIP(dataCip: any, token: any): Observable<any> {
        const data: any = {};
        data.Data = btoa(JSON.stringify(dataCip));
        const httpOption = new HttpHeaders({ Authorization: 'Bearer ' + token });
        const url = this._urlPayment + '/Pago/pagoefectivo/generarcip';
        return this.http.post<any>(url, data, {
            headers: httpOption,
        });
    }


    public generateCIPNC(dataCip: any, token: any): Observable<any> { //AVS - App Nota de Credito
        const data: any = {};
        data.Data = btoa(JSON.stringify(dataCip));
        const httpOption = new HttpHeaders({ 'Authorization': 'Bearer ' + token });
        const url = this._urlPayment + '/Pago/pagoefectivo/generarcip';
        return this.http.post<any>(url, data, {
            headers: httpOption
        });
    }

    public insertPrePayment(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(
            this._baseUrl + '/PolicyManager/insertPrePayment',
            body,
            {
                headers: this.headers,
            }
        );
    }

    public getTypesPolicy(pbranch: any): Observable<any> {
        return this.http.get(
            this._baseUrl + '/PolicyManager/getTypePolicy?pbranch=' + pbranch
        );
    }

    getUrl() {
        return this._baseUrl;
    }

    public getProductsPE(table: TableType) {
        const body = JSON.stringify(table);
        const url = this._urlPayment + '/Pago/getProductosPE';
        return this.http.post(url, body, {
            headers: this.headers,
        });
    }

    public totalPremiumFix(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(
            this._baseUrl + '/QuotationManager/totalPremiumFix',
            body,
            {
                headers: this.headers,
            }
        );
    }
    public totalPremiumCred(data: any): Observable<any> { //AVS - App Nota de Credito
        const body = JSON.stringify(data);
        return this.http.post(this._baseUrl + '/QuotationManager/TotalPremiumCred', body, {
            headers: this.headers
        });
    }
    public validarCipExistente(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(
            this._baseUrl + '/QuotationManager/validarCipExistente',
            body,
            {
                headers: this.headers,
            }
        );
    }

    public AjustedAmounts(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(
            this._baseUrl + '/PolicyManager/AjustedAmounts',
            body,
            {
                headers: this.headers,
            }
        );
    }

    public GetFlagPremiumMin(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(
            this._baseUrl + '/QuotationManager/GetFlagPremiumMin',
            body,
            {
                headers: this.headers,
            }
        );
    }

    public getPrimasProrrat(nroCotizacion: any): Observable<any> {
        const url =
            this._baseUrl +
            '/QuotationManager/GetPrimaProrrateo?ncotizacion=' +
            nroCotizacion;
        return this.http.get(url);
    }

    public getTypesPolicyPD(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(
            this._baseUrl + '/PolicyManager/getTypePolicyPD',
            body,
            {
                headers: this.headers,
            }
        );
    }
    public procesarTramaEstado(params: any, myTotalData: FormData = null): Observable<any> {
        if (myTotalData == null) {
            const body = JSON.stringify(params);
            console.log(body);
            const url = this._baseUrl + '/PolicyManager/ProcesarTramaEstado';
            return this.http.post(url, body, {
                headers: this.headers,
            });
        } else {
            myTotalData.append('objEstado', JSON.stringify(params));
            const url = this._baseUrl + '/PolicyManager/ProcesarTramaEstadoFiles';
            return this.http.post(url, myTotalData);
        }
    }

    public emitirCertificadoEstado(params: FormData): Observable<any> {
        console.log(params);
        return this.http.post(
            this._baseUrl + '/PolicyManager/EmitirCertificadoEstado',
            params
        );
    }


    ReverHISDETSCTR(P_NID_COTIZACION: any, P_NMOVEMENT_PH: any, P_NID_PROC: any): Observable<any> {
        const params = { P_NID_COTIZACION: P_NID_COTIZACION, P_NMOVEMENT_PH: P_NMOVEMENT_PH };
        return this.http.post<any[]>(this._baseUrl + '/PolicyManager/ReverHISDETSCTR?P_NID_COTIZACION=' + P_NID_COTIZACION + '&P_NMOVEMENT_PH=' + P_NMOVEMENT_PH + '&P_NID_PROC=' + P_NID_PROC, params);
    }

    public Msj_TecnicsSCTR(data: FormData): Observable<any> {
        return this.http
            .post(
                this._baseUrl + '/PolicyManager/Msj_TecnicsSCTR', data);
    }

    public DeleteDataSCTR(data: FormData): Observable<any> {
        return this.http
            .post(
                this._baseUrl + '/PolicyManager/DeleteDataSCTR', data);
    }

    public GetMonthsSCTR(data: any): Observable<any> { //AVS PRY ESTIMACIONES
        const body = JSON.stringify(data)
        return this.http.post(this._baseUrl + '/PolicyManager/GetMonthsSCTR', body, {headers: this.headers})
    }

    public GenerateCipPD(formData: FormData): Observable<any> {
        return this.http.post(this._baseUrl + '/PolicyManager/GenerarCIPTransaccionesPD', formData);
    }

    public GenerateCipKushkiPD(formData: FormData): Observable<any> {
        return this.http.post(this._baseUrl + '/PolicyManager/GenerarCIPKushkiTransaccionesPD', formData);
    }

    DownloadExcelPlantillaVidaLey(data: any): Observable<any> {
        const body = JSON.stringify(data);
        const url = this._baseUrl + '/PolicyManager/downloadExcelVL'
        return this.http.post(url, body, {
            headers: this.headers
        });
    }

    // INI COMISION VL
    public getCommission(data: any) : Observable<any>{
      const body =JSON.stringify(data);
        console.log(body);
        const url = this._baseUrl + '/PolicyManager/getCommissionVL';
      return this.http.post(url,body, {
            headers: this.headers
        });
    }
    //FIN COMISION VL

    //AGF 12052023 Beneficiarios VCF
    public DownloadExcelPlantillaVCF(data: any): Observable<any> {
        const body = JSON.stringify(data);
        const url = this._baseUrl + '/PolicyManager/downloadExcelVCF'
        return this.http.post(url, body, {
            headers: this.headers
        });
    }
    public valBrokerVCF(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this._baseUrl + '/PolicyManager/valBrokerVCF', body, {
            headers: this.headers
        });
    }
    
    public getExpirAseg(nroCotizacion: any): Observable<any> {
        const url = this._baseUrl + '/PolicyManager/GetExpirAseg?nroCotizacion=' + nroCotizacion;
        return this.http.get(url);
    }

    public getValFact(valfact: any): Observable<any> {
        const body = JSON.stringify(valfact);
        return this.http.post(this._baseUrl + '/PolicyManager/GetValFact', body, {
            headers: this.headers
        });
    }

    relanzarDocumento(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this._baseUrl + '/PolicyManager/relanzarDocumento', body, {
            headers: this.headers
        });
    }
    //INI AVS - INTERCONEXION SABSA
    insertdetTR(data: FormData): Observable<any> {
        return this.http.post(this._baseUrl + '/PolicyManager/insertDETPF', data);
    }

    getPayMethodsTypeValidate(riesgo: any, prima: any, typeMovement: any): Observable<any> {
        const url = this._baseUrl + '/PolicyManager/PayMethodsTypeValidate?riesgo=' + riesgo + '&prima=' + prima + '&typeMovement=' + typeMovement;
        return this.http.get(url);
    }
    //FIN AVS - INTERCONEXION SABSA

    //<!-- INI RQ2024-48 GJLR-->
    getPayDirectMethods(nroCotizacion: any, typeMovement: any, prima: any, riesgo: any, p_SCLIENT:any): Observable<any> {
        const url = this._baseUrl + '/PolicyManager/PayDirectMethods?nroCotizacion=' + nroCotizacion + '&typeMovement=' + typeMovement + '&prima=' + prima + '&riesgo=' + riesgo + '&P_SCLIENT=' + p_SCLIENT;
        return this.http.get(url);
    }
    //<!-- FIN RQ2024-48 GJLR-->

    public getPolicyTransListExcel(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this._baseUrl + '/PolicyManager/getPolicyTransListExcel', body, {
            headers: this.headers
        });
    }

    getInsuredForTransactionPolicy(data: any): Observable<any> {
        return this.http.post(this._baseUrl + '/PolicyManager/GetInsuredForTransactionPolicy', data);
    }

    updateInsuredPolicy(data: any): Observable<any> {
        return this.http.post(this._baseUrl + '/PolicyManager/UpdateInsuredPolicy', data);
    }

    public validateAgencySCTR(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this._baseUrl + '/PolicyManager/ValidateAgencySCTR', body, {
            headers: this.headers
        });
    }

    getCalcExecSCTR(nidproc: any, ramo: any, producto: any, nrocotizacion: any, npolicy: any, varCalcExec: any, fecha_exclusion: any, prima_alto: any, prima_medio: any, prima_bajo: any): Observable<any> {
        const params = { nidproc, ramo, producto, nrocotizacion, npolicy, varCalcExec, fecha_exclusion,prima_alto,prima_medio,prima_bajo};
        return this.http.post<any[]>(this._baseUrl + '/PolicyManager/GetCalcExecSCTR?nidproc=' + nidproc + '&ramo=' + ramo + '&producto=' + producto + '&nrocotizacion=' + nrocotizacion + '&npolicy=' + npolicy+ '&varCalcExec=' + varCalcExec + '&fecha_exclusion=' + fecha_exclusion+ '&prima_alto=' + prima_alto + '&prima_medio=' + prima_medio + '&prima_bajo=' + prima_bajo, params);
    }

    getPolicyEmitColegio(nroCotizacion: any): Observable<any> {
        const url = this._baseUrl + '/PolicyManager/GetPolizaColegio?nroCotizacion=' + nroCotizacion;
        return this.http.get(url);
    }

    validateProcessInsured(data: any, myTotalData: FormData = null): Observable<any> {
        const body = JSON.stringify(data);
        const url = this._baseUrl + '/PolicyManager/ValidateProcessInsured';
        return this.http.post(url, body, {
            headers: this.headers
        });
    }

    getPagoKushki(nroCotizacion_pen: any, nidProc_pen: any, nroCotizacion_sal: any, nidProc_sal: any, stype_transac: any): Observable<any> {
        const url = this._baseUrl + '/PolicyManager/getPagoKushki?nroCotizacion_pen=' + nroCotizacion_pen + '&nidProc_pen=' + nidProc_pen + '&nroCotizacion_sal=' + nroCotizacion_sal + '&nidProc_sal=' + nidProc_sal + '&stype_transac=' + stype_transac;
        return this.http.get(url);
    }
    GetProcessTrama(nroCotizacion: any): Observable<any> {
        const url = this._baseUrl + '/PolicyManager/GetProcessTrama?nroCotizacion=' + nroCotizacion;
        return this.http.get(url);
    }

    getCodPagoKushki(ramo: any, idPayment_pen: any, idPayment_sal: any): Observable<any> {
        const url = this._baseUrl + '/PolicyManager/getCodPagoKushki?ramo=' + ramo + '&idPayment_pen=' + idPayment_pen + '&idPayment_sal=' + idPayment_sal;
        return this.http.get(url);
    }
    public valTecnicaTransaction(nroCotizacion: any, idTipo?: any): Observable<any> {
        const url = this._baseUrl + '/PolicyManager/ValTecnicaTransaction?nroCotizacion=' + nroCotizacion + '&idTipo=' + idTipo;
        return this.http.get(url);
    }

    getPrimaMinAut(nroCotizacion: any, tipoTransac: any, nbranch: any, nproduct: any): Observable<any>{
        const url = this._baseUrl + '/PolicyManager/getPrimaMinAut?nroCotizacion=' + nroCotizacion + '&tipoTransac=' + tipoTransac + '&nbranch=' + nbranch + '&nproduct=' + nproduct;
        return this.http.get(url);
    }

    getValReglasAnulSCTR(nroCotizacion: any, nMovement: any): Observable<any>{
        const url = this._baseUrl + '/PolicyManager/getValReglasAnulSCTR?nroCotizacion=' + nroCotizacion + '&nMovement=' + nMovement;
        return this.http.get(url);
    }
    
    //PROCESA PAGO VISA KUSHKI
    processVisaKushki(payload:any): Observable<any>{
        const url = `${this._urlPayment2}/pago/kushki/procesar`;
        return this.http
            .post(url, payload)
            .pipe(map((response: any) => response.data));
    }

    public valTransactionQuotation(data: any): Observable<any> {
        
        // const url = this._baseUrl + '/PolicyManager/PolicyValidateQuotationTransac';
        //const url = `${this._baseUrl}/PolicyManager/PolicyValidateQuotationTransac/${P_NID_COTIZACION}`;
        const body = JSON.stringify(data);
        return this.http.post(this._baseUrl + '/PolicyManager/PolicyValidateQuotationTransac', body, {
            headers: this.headers
        });
    }

    getValidarTasaDiferenciada(nroCotizacion: any, tipo: any): Observable<any> {
        const url = this._baseUrl + '/QuotationManager/getValidarTasaDiferenciada?quotationNumber=' + nroCotizacion + '&tipo=' + tipo;
        return this.http.get(url);
    }

    getValidateTrama(data: any, flag?: number, sctr?: string, eps?: string) {
        const url = this._baseUrl + '/PolicyManager/getValidateTrama?flag=' + flag + '&sctr=' + sctr + '&eps=' + eps;
        return this.http.post<number>(url,data, {
            headers: this.headers
        });
    }

    getUpdateEps (data: any): Observable<any> {
        return this.http.post<any[]>(this._baseUrl + '/PolicyManager/getUpdateEps', data, {
            headers: this.headers
        });
    }

    insPreTransac(data: FormData): Observable<any> {
      const url = this._baseUrl + '/PolicyManager/InsPreTransac';
      return this.http.post(url, data);
    }

    public AjusteAmountsNeteo(data: any): Observable<any> {  // NETEO ED
        const body = JSON.stringify(data);
        return this.http.post(this._baseUrl + '/PolicyManager/AjusteAmountsNeteo', body, {
            headers: this.headers
        });
    }
    
    downloadInsuredReport(data: any): Observable<any> {
        const url = this._baseUrl + '/PolicyManager/DownloadInsuredReport';
        return this.http.post(url, data);
    }

    validateProcessEmission(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this._baseUrl + '/PolicyManager/validateProcessEmission', body, {
            headers: this.headers
        });
    }

    saveDetailQuotation(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this._baseUrl + '/PolicyManager/saveDetailQuotation', body, {
            headers: this.headers
        });
    }

    saveFilesDerivation(paquete: FormData): Observable<any> {
        const url = this._baseUrl + '/PolicyManager/SaveFilesDerivation';
        return this.http.post<void>(url, paquete);
    }

    public getDetailRouteTransac(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this._baseUrl + '/PolicyManager/GetDetailRouteTransac', body, {
            headers: this.headers
        });
    }

    cancelPolicySuscription(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this._baseUrl + '/QuotationManager/SavedRulesSuscription', params, { headers: this.headers });
    }

    public getDetalleEPS(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this._baseUrl + '/PolicyManager/GetDetalleEPS', body, {
            headers: this.headers
        });
    }

    // KUSHKI SCTR ED 
    public SendKushkiSctr(data: any): Observable<any> {
        return this.http.post(this._baseUrl + '/PolicyManager/SendKushkiSctr', data);
    }

    public reportInsuredList(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this._baseUrl + '/PolicyManager/reportInsuredList', body, {
            headers: this.headers
        });
    }

    public generateExcelReportInsured(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this._baseUrl + '/PolicyManager/generateExcelReportInsured', body, {
            headers: this.headers
        });
    }

    relanzarDataEPS(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this._baseUrl + '/PolicyManager/relanzarDataEPS', body, {
            headers: this.headers
        });
    }

    public getSiniestros(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this._baseUrl + '/PolicyManager/getSiniestros', body, {
            headers: this.headers
        });
    }
}