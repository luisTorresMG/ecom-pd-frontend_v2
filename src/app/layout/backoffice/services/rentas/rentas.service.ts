import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from '@root/app.config';
import { map, tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { GenericResponse } from '../../../broker/models/shared/generic-response';

@Injectable({
  providedIn: 'root',
})
export class RentasService {
  private urlAPI: string;
  private urlApiSCTR: string;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private readonly http: HttpClient) {
    this.urlAPI = AppConfig.PD_API;
    this.urlApiSCTR = AppConfig.URL_API_SCTR
  }

  private _refresh$ = new Subject<void>();
  private _refresh_upd$ = new Subject<void>();
  private _refreshDetail$ = new Subject<void>();

  get refresh$(){
    return this._refresh$
  }

  get refresh_upd$(){
    return this._refresh_upd$
  }
  get refreshDetail$(){
    return this._refreshDetail$
  }

  exportarReporte(data: any) {
    const url = `${this.urlAPI}/rentas/descarga`;
    const api = this.http.post(url, data);
    return api.pipe(
      map((response: { success: boolean; archivo: string }) => response)
    );
  }

  //SERVICIO PARA LISTAR LOS TICKET
  public getListTickets(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_REA_CLIENT_TICKETS', body, {
        headers: this.headers
      });
  }
//SERVICIO PARA LISTAR UN TICKET
  public getListTicket(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_REA_CLIENT_TICKET', body, {
        headers: this.headers
      });
  }
  //SERVICIO PARA LISTAR LOS PRODUCTOS
  public getListProducts(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_PRODUCTOS', {
        headers: this.headers
      });
  }
  //SERVICIO PARA LISTAR LOS MOTIVOS
  public getListMotivos(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_MOTIVOS', {
        headers: this.headers
      });
  }
  //SERVICIO PARA LISTAR LOS SUBMOTIVOS
  public getListSubMotivos(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_SUBMOTIVOS', body,{
        headers: this.headers
      });
  }
  //SERVICIO PARA PARA LISTAR LOS ESTADOS
  public getListEstados(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_ESTADOS',{
        headers: this.headers
      });
  }
//SERVICIO PARA ASIGNAR EJECUTIVO
  public updAsignar(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_UPD_ASSIGNEXEC', body,{
        headers: this.headers
      }).pipe(
        tap(()=>{
            this._refresh_upd$.next()
        })
      );
  }
  //SERVICIO PARA LISTAR LOS CLIENTES
  public getListClients(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_REA_CLIENTS', body,{
        headers: this.headers
      });
  }
  //SERVICIO PARA LISTAR LOS EJECUTIVOS
  public getListEjecutivos(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_EJECUTIVOS', body, {
        headers: this.headers
    });
  }
  //SERVICIO PARA LISTAR LOS TIPOS DE DOCUMENTOS
  public getListTipoDocumentos(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_TYPE_DOCUMENT', {
        headers: this.headers
      });
  }
  //SERVICIO PARA LISTAR EL TIPO DE PERSONA
  public getListTipoPersonas(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_TYPE_PERSON', {
        headers: this.headers
      });
  }
  //SERVICIO PARA OBTENER LA CANTIDAD DE DIAS A RETROCEDERPARA OBTENER LA CANTIDAD DE DIAS A RETROCEDER
  public getFilterDay(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_FILTERDAY_START', {
        headers: this.headers
      });
  }
  //SERVICIO PARA VALIDAD LA CANTIDAD DE CARACTERES DE LOS DOCUMENTOS
  public valFormat(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_VALFORMATVALUES', body, {
        headers: this.headers
      });
  }
  //SERVICIO PARA RECUPERAR EL PRODUCTO
  public getProductCanal(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_NPRODUCTCANAL', {
        headers: this.headers
      });
  }
  //SERVICIO PARA LISTAR LAS ACCIONES PERMITIDAS PARA EL PERFIL
  public getListActions(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_REA_LIST_ACTIONS', body, {
        headers: this.headers
      });
  }
  //SERVICIO PARA RECUPERAR EL ID DE PERFIL
  public getNidProfile(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_NIDPROFILE', body, {
        headers: this.headers
      });
  }
  //SERVICIO PARA RECUPERAR LAS ACCIONES DE LOS TICKETS
  public getListActionsTicket(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_REA_LIST_ACTIONS_TICKET', body, {
        headers: this.headers
      });
  }
  //SERVICIO PARA ACTUALIZAR EL ESTADO DE TICKET
  public updStatusTicket(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_UPD_STATUS_TICKET', body, {
        headers: this.headers
      }).pipe(
        tap(()=>{
            this._refresh_upd$.next()
        })
      );
  }
  //SERVICIO PARA ACTUALIZAR EL ESTADO DE TICKET EN LA PESTAÑA DE  DETALLE
  public updStatusTicketDetail(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_UPD_STATUS_TICKET', body, {
        headers: this.headers
      }).pipe(
        tap(()=>{
            this._refreshDetail$.next()
        })
      );
  }
  //OBTIENE LOS DAROS DE LA POLIZA
  public getPolicyData(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/GET_POLICY_DATA', body, {
        headers: this.headers
      });
  }
  //CALCULA EL IMPORTE Y DEVUELVE LA MONEDA
  public getCalculationAmount(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/GET_CALCULATION_AMOUNT', body, {
        headers: this.headers
      });
  }
  //SERVICIO PARA ACTUALIZAR LA MONEDA Y EL IMPORTE DEL TICKET
  public updAmountTicket(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_UPD_AMOUNT_TICKET', body, {
        headers: this.headers
      }).pipe(
        tap(()=>{
            this._refresh$.next()
        })
      );
  }

  public updAmountTicketDetail(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_UPD_AMOUNT_TICKET', body, {
        headers: this.headers
      }).pipe(
        tap(()=>{
            this._refreshDetail$.next()
        })
      );
  }
  //LISTA LOS ARCHIVOS ADJUNTO REGISTRADOS (NTYPE: 1) POR EL CLIENTE
  public getListAdj(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_LIST_ADJ', body, {
        headers: this.headers
      });
  }
  //ACTUALIZA EL ARCHIVO SI SE DESEA ADJUNTAR // 1 : SE ADJUNTA  2 : NO SE ADJUNTA
  public updAttachmentAdj(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_UPD_ATTACHMENT', body, {
        headers: this.headers
      });
  }

  //REALIZA LA INSERCIÓN DE CORREO POR NRO DE TICKET
  public insDataEmail(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_INS_DATA_EMAIL', body, {
        headers: this.headers
      });
  }

  public uploadFile(_fileName: string, _formData: FormData): Observable<GenericResponse> {
    let data = { fileName: _fileName };
    return this.http.post<GenericResponse>(this.urlApiSCTR  + "/Rentas/UploadFile", _formData, { params: data }).pipe(
        tap(()=>{
            this._refreshDetail$.next()
        })
      );
  }

  //SE INSERTA EN LA TABLA TBL_TICK_ADJUNT
  public insTickAdjunt(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_INS_TBL_TICK_ADJUNT', body, {
        headers: this.headers
        }).pipe(
            tap(()=>{
                this._refreshDetail$.next()
        })
          );
  }
  //ELIMINA EL REGISTRO DEL ARCHIVO ADJUNTO DEL TICKET
  public delTickAdjunt(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_DEL_TBL_TICK_ADJUNT', body, {
        headers: this.headers
      }).pipe(
        tap(()=>{
            this._refreshDetail$.next()
        })
      );
  }

  //ACTUALIZA LA DESCRIPCION DEL TICKET
  public updtTicketDescript(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_UPD_TICKET_DESCRIPT', body, {
        headers: this.headers
      });
  }
  public updtTicketNmotiv(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_UPD_TICKET_NMOTIV', body, {
        headers: this.headers
      }).pipe(
        tap(()=>{
            this._refreshDetail$.next()
        })
      );
  }

  //ACTUALIZA LA DESCRIPCION DEL TICKET
  public getUserResponsible(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_USER_RESPONSIBLE', body, {
        headers: this.headers
      });
  }

  //VALIDA QUE VENTANA EMERGENTE DEBE IR DE ACUERDO A CADA BOTON
  public getValpopup(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_VALPOPUP', body, {
        headers: this.headers
      });
  }

  // OBTIENE LOS TIPOS DE COMENTARIOS
  public getListTypeComments(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_TYPECOMMENT',{
        headers: this.headers
      });
  }

  //OBTIENE LOS DESTINATARIOS DEL CORREO
  public getListDestination(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_DESTINATION', body, {
        headers: this.headers
      });
  }

  //OBTIENE LOS CORREOS DESTINATARIOS DE ACUERDO AL TIPO DE DESTINATARIO
  public getEmailDestination(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_EMAIL_DESTINATION', body, {
        headers: this.headers
      });
  }

  public valEmailDestination(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_VAL_EMAIL_DESTINATION', body, {
        headers: this.headers
      });
  }

    //OBTIENE EL CORREO DEL USUARIO EN SESION (MÁSCARA)
  public getEmailUser(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_EMAIL_USER', body, {
        headers: this.headers
      });
  }

  //PD_GET_CONF_FILE
  public getConfFile(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_CONF_FILE',{
        headers: this.headers
      });
  }

  //OBTIENE EL MENSAJE DE ACUERDO AL NRO DE ERROR
  public getMessage(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_MESSAGE', body, {
        headers: this.headers
      });
  }

  //valida si el archivo a eliminar esta siendo usado
  public valTblAttachedfile(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_VAL_TBL_ATTACHEDFILE', body, {
        headers: this.headers
      });
  }

  //lista los colores de los botones de acciones
  public getColorActions(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_COLOR', body, {
        headers: this.headers
      });
  }

  //valida el estadoi del ticket antes de  abrir el modal
  public valStatusTicket(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_VAL_STATUS_TICKET', body, {
        headers: this.headers
      })
  }
  //funciona para aprobar el ticket para desencadenar otros procesos y cambiar el estado de aprobado
  public aprobarTicket(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_APROBAR', body, {
        headers: this.headers
      }).pipe(
        tap(()=>{
            this._refresh_upd$.next()
        })
      );
  }

  public aprobarTicketDetail(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_APROBAR', body, {
        headers: this.headers
      }).pipe(
        tap(()=>{
            this._refreshDetail$.next()
        })
      );
  }

  public valAmountTicket(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_VAL_AMOUNT_TICKET', body, {
        headers: this.headers
      })
  }

  public valAmountTicketDetail(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_VAL_AMOUNT_TICKET', body, {
        headers: this.headers
      })
  }

  public updTicketEmail(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_UPD_TICKET_EMAIL', body, {
        headers: this.headers
      }).pipe(
        tap(()=>{
            this._refreshDetail$.next()
        })
      );
  }

  public EquivalenciaUsuario(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/EquivalenciaUsuario', body, {
        headers: this.headers
      })
  }

  public insTicketCotizaDet(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_INS_TBL_PD_TICKET_COTIZA_DET', body, {
        headers: this.headers
      }).pipe(
        tap(()=>{
            this._refreshDetail$.next()
        })
      );
  }

  public delTicketCotizaDet(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_DEL_TBL_PD_TICKET_COTIZA_DET', body, {
        headers: this.headers
      }).pipe(
        tap(()=>{
            this._refreshDetail$.next()
        })
      );
  }

  public confirmPayment(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_CONFIRM_PAYMENT', body, {
        headers: this.headers
      })
  }

  public updTicketPayment(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_UPD_TICKET_PAYMENT', body, {
        headers: this.headers
      }).pipe(
        tap(()=>{
            this._refreshDetail$.next()
        })
      );
  }

  public getTypePayment(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_NTYP_PAY', {
        headers: this.headers
      })
  }

  public valConfirmPayment (data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_VAL_CONFIRM_PAYMENT', body, {
        headers: this.headers
      })
  }

  public getMaxPerAdvance (data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_MAX_PERADVANCE', body, {
        headers: this.headers
      })
  }

  public updTicketPensions (data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_UPD_TICKET_PENSIONS', body, {
        headers: this.headers
      })
  }

  public getPaymentInformation (data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/GET_PAYMENT_INFORMATION', body, {
        headers: this.headers
      })
  }

  public getFormaPago (): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_FORMA_PAGO', {
        headers: this.headers
      })
  }
  public getBankOrigin (data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_BANK_ORIGIN',  body,{
        headers: this.headers
      })
  }

  public getTypeFile(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_TYPE_FILE', {
        headers: this.headers
      })
  }

//   public getMailSubject (data: any): Observable<any> {
//     const body = JSON.stringify(data);
//     return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_MAIL_SUBJECT',  body,{
//         headers: this.headers
//       })
//   }

  public getUpdNtypeActtachment (data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_UPD_NTYPEATTACHMENT',  body,{
        headers: this.headers
        }).pipe(
            tap(()=>{
                this._refreshDetail$.next()
        })
    );
  }

  public valTicketCotizaDet (data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_VAL_TBL_PD_TICKET_COTIZA_DET',  body,{
        headers: this.headers
    });
  }

  public ListTblPdTicketCotizaDet (data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_LIST_TBL_PD_TICKET_COTIZA_DET',  body,{
        headers: this.headers
    });
  }

  public getDescription (data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/TablasMaestras',  body,{
        headers: this.headers
    });
  }


  public getDatePayment (data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_DATE_PAYMENT',  body,{
        headers: this.headers
    });
  }

  public getDateMaxPayment (): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_DATE_MAX_PAYMENT',{
        headers: this.headers
    });
  }

    //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
   public getDateMaxRequest (): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_DATE_MAX_REQUEST',{
        headers: this.headers
    });
  }
   public updTicketRequest(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_UPD_TICKET_REQUEST', body, {
        headers: this.headers
      }).pipe(
        tap(()=>{
            this._refreshDetail$.next()
        })
      );
  }
  ////terminar de esto
  public valDateRequest(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_VAL_DATEREQUEST', body, {
        headers: this.headers
      });
  }
    public getlistarProvisionAuto(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_LIST_PROVISIONAUTOMATIC', body, {
        headers: this.headers
      });
  }
  public getListStatusApro(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_TYPE_STATUS_APRO', {
        headers: this.headers
      });
   }
  public updAprobarProvisionAuto(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_INSUPD_APPROVAL', body, {
        headers: this.headers
      });
  }
  public updApiProvisorioDevolucion(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/updApiProvisorioDevolucion', body, {
        headers: this.headers
      });
  }
    public GetDataReportProvisionAuto(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/GetDataReportProvisionAuto', body, {
        headers: this.headers
      });
  }
   public PD_GET_TYPE_REPORT_DEVO(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_TYPE_REPORT_DEVO', {
        headers: this.headers
      });
   } 
  public GetDataReportDevolucion(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/GetDataReportDevolucion', body, {
        headers: this.headers
      });
  }  
     public PD_VAL_DEV_AUTOMATIC(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_VAL_DEV_AUTOMATIC', body, {
        headers: this.headers
      });
  }  
  public ENDOSODATOSBANCARIOS(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/ENDOSODATOSBANCARIOS', body, {
        headers: this.headers
      });
  }   
  
   public downloadFile(_filePath: string): Observable<any> {
          let data = { filePath: _filePath };
          return this.http.get(this.urlApiSCTR + "/Rentas/DownloadFile", { params: data, responseType: 'blob' });
      }
    //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >


  public updateValidityPolicy (data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_UPD_VALIDITY_POLICY',  body,{
        headers: this.headers
    });
  }

  public updTblPdTicketCotizaDet (data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_UPD_TBL_PD_TICKET_COTIZA_DET',  body,{
        headers: this.headers
        }).pipe(
            tap(()=>{
                this._refreshDetail$.next()
        })
    );
  }

  public getListAdjunt (data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_LIST_ADJUNTOS', body,{
        headers: this.headers
    });
  }

  public getListTipoBeneficiarios(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_RECEIVER', {
        headers: this.headers
      });
  }

  public valAddReceiverPayment(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_VAL_ADD_RECEIVER_PAYMENT', body, {
        headers: this.headers
      });
  }

  public GestionarCliente(data:any): Observable<any>{
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/GestionarCliente', body, {
        headers: this.headers
    });
  }

  public getListTipoDocumentosB(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_TYPE_DOCUMENT_B',{
        headers: this.headers
      });
  }
  public getListSexo(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_LIST_SEX',{
        headers: this.headers
      });
  }
  public getLisEstadoCivil(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_LIST_CIVIL',{
        headers: this.headers
      });
  }
  public getListNacionalidad(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_LIST_NATIONALITY',{
        headers: this.headers
      });
  }
  public getListTipoVia(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_LIST_VIA',{
        headers: this.headers
      });
  }
  public getListDepartamento(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_LIST_DEPARTAMENT',{
        headers: this.headers
      });
  }
  public getListProvincia(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_LIST_PROVINCE',  body, {
        headers: this.headers
    });
  }
  public getListDistrito(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_LIST_MUNICIPALITY',  body, {
        headers: this.headers
    });
  }
  public getListTipoTelefono(): Observable<any> {
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_LIST_TYPEPHONE',{
        headers: this.headers
      });
  }

  public registroclientes(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/RegistroClientes',  body, {
        headers: this.headers
    });
  }


  public registroHerederos(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/RegistroHerederos',  body, {
        headers: this.headers
    }).pipe(
        tap(()=>{
            this._refreshDetail$.next()
    }));
  }

  public getPaymentInformationAfp(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_PAYMENT_INFORMATION',  body, {
        headers: this.headers
    });
  }

  public flagListAfp(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_FLAG_LIST_AFP',  body, {
        headers: this.headers
    });
  }

  public getEquivalenceInformation(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.urlApiSCTR + '/Rentas/PD_GET_EQUIVALENCE_INFORMATION',  body, {
        headers: this.headers
    });
  }
}