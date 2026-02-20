import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { AdjuntoInterface, AdjuntoResponse } from '../../../interfaces/Adjunto.Interface';
import { CommonMethods } from '../../common-methods';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { AccPersonalesService } from '../../quote/acc-personales/acc-personales.service';
import { QuotationService } from '../../../services/quotation/quotation.service';
import { LogWSPlataformaService } from '../../../services/logs/log-wsplataforma.service';
import { error } from 'console';
import { CryptoService } from '../../../../../services/crypto.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: false,
  selector: 'app-policy-link',
  templateUrl: './policy-link.component.html',
  styleUrls: ['./policy-link.component.css']
})
export class PolicyLinkComponent implements OnInit {

  @ViewChild('payment')
  content;
  modalRef: BsModalRef;

  /*paymentUrl_Pension: SafeResourceUrl;
  paymentUrl_Salud: SafeResourceUrl;*/
  successfullPayment = false;
  paymentUrl_Pension: string = "";
  paymentUrl_Salud: string = "";
  paymentUrl: string = "";
  loading = true;
  loading_prin = false;
  valid = false;
  approve = false;
  pagadocip = false;
  existentecip = false;
  expiradocip = false;
  flagCipExistente = 0;
  cipNumber: string = "";
  cipNumberPension: string = "";
  cipNumberSalud: string = "";
  flagMixSCTR: any = 1;
  compProducto: string = "";
  compPension: string = "Protecta";
  compSalud: string = "GRANDIA EPS";
  desTipoPago: string = "";
  desMoneda: string = "";
  codPago: string = "";
  desTransaction: string = "";
  transac: string = "";
  idPaymentPEN: any = "";
  idPaymentSAL: any = "";
  cod_pago_PEN: any = "";
  cod_pago_SAL: any = "";
  cod_pago: string = "";
  
  policyData = JSON.parse(localStorage.getItem('policydata'));
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  epsItem = JSON.parse(localStorage.getItem('eps'));

  visaKushki = false;
  paymentUrlKushki: SafeResourceUrl;
  FlagPagoNC: any;
  flagBotonNC: any;
  CreditDataNC: any;

  constructor(
    private cryptoService: CryptoService,
    private readonly modalService: BsModalService,
    private readonly sanitizer: DomSanitizer,
    private policyemit: PolicyemitService,
    private readonly router: Router,
    private accPersonalesService: AccPersonalesService,
    private quotationService: QuotationService,
    private LogService : LogWSPlataformaService,
    public toastr: ToastrService
  ) { }

  async ngOnInit() {
    if (this.policyData != null) {
        console.log('this.policyData');
        console.log(this.policyData);
        if(this.policyData.dataCIP.mixta == 1){
            this.policyData.dataCIP.producto = 1;
            this.policyData.dataCIP.producto_EPS = 2;
        }
        const transacItem = CommonMethods.desTransaction(this.policyData.transaccion);
        this.desTransaction = transacItem.desTransaction;
        this.flagMixSCTR = this.policyData.savedPolicyList?.[0]?.P_NCOT_MIXTA ?? this.policyData.savedPolicyList?.P_NCOT_MIXTA ?? 0;
        this.transac = transacItem.transac;
        
        const data = {
            quotation: this.policyData.dataCIP.quotationNumber,
            nidproc: this.policyData.dataCIP.ExternalId,
            codBranch: this.policyData.dataCIP.ramo,
        };
        
        await this.policyemit.validarCipExistente(data).toPromise().then(
            async res => {
            this.flagCipExistente = res.flagCip;
            this.cipNumber = res.numberOperation;
            }
        );

        if (this.flagCipExistente == 1) {
            this.loading = false;
            this.existentecip = true;
            this.approve = true;
            this.valid = true;
        } else if (this.flagCipExistente == 2) {
            this.loading = false;
            this.pagadocip = true;
            this.approve = true;
            this.valid = true;
        } else if (this.flagCipExistente == 3) {
            this.loading = false;
            this.expiradocip = true;
            this.approve = true;
            this.valid = true;
        } else {
            var request = {
                quotation: this.policyData.dataCIP.quotationNumber,
                codBranch: this.policyData.dataCIP.ramo,
                premium: this.policyData.dataCIP.monto
            };

            this.FlagPagoNC = JSON.parse(localStorage.getItem('creditdata'));
            this.flagBotonNC = JSON.parse(localStorage.getItem('botonNC'));

            if (this.codProducto == 3 && this.FlagPagoNC != null && this.flagBotonNC == true){
                var premiumFixCred = await this.totalPremiumCred(request);
                if (premiumFixCred.codError == 0) {
                    this.policyData.dataCIP.monto = premiumFixCred.premium;
                    await this.generateCipNC();
                } else {
                    this.loading = false;
                    const res = {
                        existo: false,
                        mensaje: 'PRIMAFIX_ERROR'
                    };
                    this.verifyError(res);
                }


            }else{
            var premiumFix = await this.totalPremiumFix(request);

            if (premiumFix.codError == 0) {
                this.policyData.dataCIP.monto = premiumFix.premium;
                await this.generateCip();
            } else {
                this.loading = false;
                const res = {
                    existo: false,
                    mensaje: 'PRIMAFIX_ERROR'
                };
                
                this.verifyError(res);
            }
        }
        
        }
        
        console.log(this.policyData);
        this.desTipoPago = this.policyData.dataCIP.tipoPago == "3" ? "Transferencia" : (this.policyData.dataCIP.tipoPago == "2" ? "Cash" : "Visa Kushki"); 
        this.desMoneda = this.policyData.dataCIP.Moneda == 1 ? "Soles" : "Dólares";

        if(this.flagMixSCTR == 0){
            if(this.policyData.dataCIP.producto == 1){
                this.compProducto = this.compPension;
            }else{
                this.compProducto = this.compSalud;        
            }
        }
        /*
        await this.policyemit.getCodPagoKushki(this.policyData.dataCIP.ramo, , ,).toPromise().then(
            (res: any) =>{
                this.co_pago_PEN = res.
                this.co_pago_PEN = res.
            }
        ); */
    }
  }

  async totalPremiumCred(request: any) {
    var response: any = {};
    await this.policyemit.totalPremiumCred(request).toPromise().then(
        async res => {
            response = res;
        }, error => {
            response = {
                codError: 1,
                desError: '',
                premium: 0
            }
        });
    return response;
}

async generateCipNC() {
    let dataCIP = new FormData();
    dataCIP = await this.generateDataCip();
    this.saveLog(this.transac + ' - ' + (this.policyData?.savedPolicyList?.P_NID_COTIZACION ?? ''), 'Llamado a Kushki - Inicio', 1);
    
    await this.policyemit.GenerateCipKushkiPD(dataCIP).toPromise().then(
        async res => {
            this.saveLog(this.transac + ' - ' + (this.policyData?.savedPolicyList?.P_NID_COTIZACION ?? ''), 'Respuesta de Kushki: ' + JSON.stringify(res, null, 2), 1);
            this.saveLog(this.transac + ' - ' + (this.policyData?.savedPolicyList?.P_NID_COTIZACION ?? ''), 'Llamado a Kushki - Fin', 1);
            await this.insertLogAuth(res);
            this.loading = false;
            this.valid = res.valid;
            this.approve = res.approve;
            if (res.P_COD_ERR == 0) {
                if (!!this.policyData.actualizarCotizacion) {
                    localStorage.setItem('CodPay', JSON.stringify(res.data.cupones[0].idPayment)); //AVS Nota de Credit 23/01/2023
                    await this.InsertPFNC(); 
                    await this.actualizarCotizacion(res);
                } else {
                    localStorage.setItem('CodPay', JSON.stringify(res.data.cupones[0].idPayment)); //AVS Nota de Credit 23/01/2023
                    await this.InsertPFNC(); 
                    await this.transactionPolicy(res);
                }
            } else {
                this.verifyError(res);
            }
        }, async error => {
            await this.insertLogAuth("Error en GenerateCipKushkiPD: " + JSON.stringify(error));
            if (error.status !== 200) {
                this.loading = false;
                const res: any = {};
                res.existo = false;
                res.mensaje = 'PEFECTIVO_ERROR';
                this.verifyError(res);
            }
        });
}

InsertPFNC() {
    this.CreditDataNC = JSON.parse(localStorage.getItem('creditdata'));
    let CodPay = JSON.parse(localStorage.getItem('CodPay'));
    let NCRollQuotation: any = {};
    NCRollQuotation.ListainsertNCPF = [];

    if (this.transac == 'Emisión') {
        var trans = 'EM';
    } else if (this.transac == 'Inclusión') {
        var trans = 'IN';
    } else if (this.transac == 'Renovación' && (this.policyData.savedPolicyList.P_STRAN ?? this.policyData.savedPolicyList[0]?.P_STRAN) != 'DE') {
        var trans = 'RE';
    } else if (this.transac == 'Endoso') {
        var trans = 'EN';
    } else {
        var trans = 'DE';
    }


    for (let i = 0; i < this.CreditDataNC.length; i++) {
        const itemNCPF: any = {};
        itemNCPF.P_NIDPAYMENT = Number(CodPay);
        itemNCPF.P_NCURRENCY = Number(this.policyData.monedaId) || Number(this.CreditDataNC[i].moneda) || 1;
        itemNCPF.P_NIDPAYTYPE = this.CreditDataNC[i].forma_pago == 'NC' ? 4 : this.CreditDataNC[i].forma_pago || this.CreditDataNC[i].forma_pago == 'PCP' ? 7 : this.CreditDataNC[i].forma_pago;
        itemNCPF.P_SOPERATION_NUMBER = Number(this.CreditDataNC[i].documento_nc);
        itemNCPF.P_NAMOUNT = Number(this.CreditDataNC[i].monto);
        itemNCPF.P_NID_COTIZACION = this.policyData.savedPolicyList[0]?.P_NID_COTIZACION ?? this.policyData.savedPolicyList.P_NID_COTIZACION;
        itemNCPF.P_CODIGOCANAL = this.policyData.dataCIP.codigoCanal;
        itemNCPF.P_NIDUSER = this.policyData.dataCIP.codUser;
        itemNCPF.P_ESTADO = 1;
        itemNCPF.P_NTYPE_TRANSAC = trans === 'DE' ? 11 : this.policyData.transaccion;
        itemNCPF.P_STRANSAC = trans;

        NCRollQuotation.ListainsertNCPF.push(itemNCPF);
    }

    const myFormData: FormData = new FormData()
    // this.f.forEach(file => {
    //     myFormData.append(file.name, file);
    // });

    myFormData.append('NCPF', JSON.stringify(NCRollQuotation));

    this.accPersonalesService.NCParcialPF(myFormData).subscribe();
}

async transactionPolicy(pdf) {
    const dataPrePayment = await this.dataPrePayment();
    await this.policyemit.insertPrePayment(dataPrePayment).toPromise().then(
        async res => {
            if (res.P_COD_ERR == '0') {
                this.loading = false;
                this.valid = true;
                this.approve = true;
                this.getModal(pdf.data);
            } else {
                this.loading = false;
                this.valid = true;
                this.approve = false;
            }

        });
}

async actualizarCotizacion(paramsCip) {
    const params = new FormData();

    if (this.policyData.adjuntos != null) {
        this.policyData.adjuntos.forEach(function (file) {
            params.append(file.name, file, file.name);
        });
    }

    this.policyData.actualizarCotizacion.FlagCIP = 1;
    this.policyData.actualizarCotizacion.origen = 'pasarela';
    params.append('statusChangeData', JSON.stringify(this.policyData.actualizarCotizacion));

    this.quotationService.changeStatusVL(params).subscribe(
        async res => {
            if (res.StatusCode == 0) {
                await this.policyemit.getPolicyEmitCab(
                    this.policyData.dataCIP.quotationNumber, '1',
                    JSON.parse(localStorage.getItem('currentUser'))['id']
                ).toPromise().then(async (resCab: any) => {
                    if (resCab.GenericResponse.COD_ERR == '0') {
                        if (this.policyData.transaccion == 1) {
                            this.policyData.savedPolicyList.forEach(item => {
                                item.P_NID_PROC = resCab.GenericResponse.NID_PROC;
                                item.P_SCOLTIMRE = resCab.GenericResponse.TIP_RENOV;
                                item.P_NPAYFREQ = resCab.GenericResponse.FREQ_PAGO;
                                // item.P_SCOMMENT = item.P_DSTARTDATE !=
                                //   CommonMethods.formatDate(new Date(resCab.GenericResponse.EFECTO_COTIZACION_VL)) ?
                                //   'Se ha modificado el inicio de vigencia: Antes = ' +
                                //   CommonMethods.formatDate(new Date(resCab.GenericResponse.EFECTO_COTIZACION_VL)) +
                                //   '.Ahora = ' + item.P_DEXPIRDAT : '';
                                item.P_NIDPAYMENT = 0;
                            });
                        } else {
                            this.policyData.savedPolicyList.P_NIDPAYMENT = 0;
                            this.policyData.savedPolicyList.P_NID_PROC = resCab.GenericResponse.NID_PROC;
                            this.policyData.savedPolicyList.P_SCOLTIMRE = resCab.GenericResponse.TIP_RENOV;
                            this.policyData.savedPolicyList.P_NPAYFREQ = resCab.GenericResponse.FREQ_PAGO;
                            /* this.policyData.savedPolicyList.P_SCOMMENT =  this.codProducto == 3 ? this.policyData.savedPolicyList.P_DSTARTDATE !=
                              CommonMethods.formatDate(new Date(resCab.GenericResponse.EFECTO_COTIZACION_VL)) ?
                              'Se ha modificado el inicio de vigencia: Antes = ' +
                              CommonMethods.formatDate(new Date(resCab.GenericResponse.EFECTO_COTIZACION_VL)) +
                              '.Ahora = ' + this.policyData.savedPolicyList.P_DEXPIRDAT : '' : '';*/
                        }
                        this.policyData.dataCIP.ExternalId = resCab.GenericResponse.NID_PROC;
                    }

                });
                await this.transactionPolicy(paramsCip);
            }
        });
}


async dataPrePayment() {
    const data: any = {};
    data.idProcess = this.policyData.dataCIP.ExternalId;
    data.quotationNumber = this.policyData.dataCIP.quotationNumber;
    data.typeTransaction = this.policyData.transaccion;
    if (this.policyData.transaccion == 1) {
        this.policyData.savedPolicyList.forEach(item => {
            item.P_NIDPAYMENT = 0;
        });
    } else {
        this.policyData.savedPolicyList.P_NIDPAYMENT = 0;
    }
    data.jsonPrt = JSON.stringify(this.policyData.savedPolicyList);
    data.jsonLnk = JSON.stringify(!!this.policyData.emisionMapfre || null);
    data.userCode = this.policyData.dataCIP.codUser;
    return data;
}




  goToMain(value, transaccion) {
    if (value) {
        if (this.policyData.flagTramite == 1) {
            this.router.navigate(['/']);
        } else {
            if (!!this.policyData.urlContinuar) {
                this.router.navigate([this.policyData.urlContinuar]);
            } else {
                if (transaccion == 1) {
                    if (this.codProducto == 2) { 
                        this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
                    }
                    if(this.codProducto == 3){
                        this.router.navigate(['/extranet/request-status']);
                    }
                } else {
                    if (this.codProducto == 2) { 
                        this.router.navigate(['/extranet/sctr/consulta-polizas']);
                    }
                    if(this.codProducto == 3){ 
                        this.router.navigate(['/extranet/policy-transactions-all']);
                    }
                }
            }
        }
    } 
  }

  async totalPremiumFix(request: any) {
    var response: any = {};
    await this.policyemit.totalPremiumFix(request).toPromise().then(
        async res => {
            response = res;
        }, error => {
            response = {
                codError: 1,
                desError: '',
                premium: 0
            }
        }
    );

    return response;
  }

  descargarPDFProm(producto: string): Promise<void>{
    return new Promise((resolve, reject) => {
        let enlace = "";
        let cupon = "";
        if(this.policyData.dataCIP.ramo == "73") {
            cupon = "cupon_VIDA_LEY";
            enlace = this.paymentUrl;
        } else{
        if(this.flagMixSCTR == 1){
            if(producto == "1"){
                enlace = this.paymentUrl_Pension;
                cupon = "cupon_PENSION";
            }else if(producto == "2"){
                enlace = this.paymentUrl_Salud;
                cupon = "cupon_SALUD";
            }
        }else{
            enlace = this.paymentUrl;

            if(this.policyData.dataCIP.producto == 1){
                cupon = "cupon_PENSION";
            }else{
                cupon = "cupon_SALUD";       
            }
        } 
        }
        
        const xhr = new XMLHttpRequest();
        xhr.open('GET', enlace, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function (oEvent) {
            const arrayBuffer = xhr.response;
            const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
            const dataUrl = URL.createObjectURL(blob);
        
            var link = document.createElement('a');
            link.href = dataUrl;
            link.download = cupon + '.pdf';
            link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

            setTimeout(function () {
                window.URL.revokeObjectURL(dataUrl);
                link.remove();
                resolve();
            }, 100);
        };

        xhr.onerror = function () {
            reject(new Error('Error al descargar el PDF'));
        };

        xhr.send();
    });
  }

  descargarPDF(producto: string) {
    this.loading_prin = true;

    this.descargarPDFProm(producto).then(() => {
        this.loading_prin = false;
    }).catch(error => {
        this.loading_prin = false;

        swal.fire({
            title: 'Información',
            text: "",
            icon: 'error',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
        })
    });
  }

  openLink(producto: string){
    let enlace = "";

    if(this.flagMixSCTR == 1){
        if(producto == "1"){
            enlace = this.paymentUrl_Pension;
        }else if(producto == "2"){
            enlace = this.paymentUrl_Salud;
        }
    }else{
        enlace = this.paymentUrl;
    }    
    
    window.open(enlace, '_blank');
  }

  copiarLink(producto: string){
    let enlaceACopiar = "";

    if(this.flagMixSCTR == 1){
        if(producto == "1"){
            enlaceACopiar = this.paymentUrl_Pension;
        }else if(producto == "2"){
            enlaceACopiar = this.paymentUrl_Salud;
        }
    }else{
        enlaceACopiar = this.paymentUrl;
    }

    navigator.clipboard.writeText(enlaceACopiar).then(() => {
      //alert('¡Enlace copiado al portapapeles!');
    }, (err) => {
      console.error('Error al copiar enlace: ', err);
    });
  }

  async generateDataCip(){
    let mixta = this.policyData.savedPolicyList[0]?.P_NCOT_MIXTA ?? this.policyData.savedPolicyList?.P_NCOT_MIXTA;

    let data: any = {};
    let dataCIP = new FormData();

    if (!!this.policyData.actualizarCotizacion) {
        data.actualizarCotizacion = this.policyData.actualizarCotizacion;
        data.actualizarCotizacion.FlagCIP = 1;
        data.actualizarCotizacion.origen = 'pasarela';
    }

    data.token              = this.currentUser.token;
    data.savedPolicyList    = JSON.stringify(this.policyData.savedPolicyList);
    data.dataCIPBM          = this.policyData.dataCIP;
    data.userCode           = this.policyData.dataCIP.codUser;
    data.idProcess          = this.policyData.dataCIP.ExternalId;
    data.idProcess_EPS      = mixta == 1 && Number(this.epsItem?.NCODE || '1') == 3 ? this.policyData.dataCIP.ExternalId_EPS : null; 
    data.quotationNumber    = this.policyData.dataCIP.quotationNumber;
    data.typeTransaction    = this.policyData.transaccion;
    data.flagRelanzarCip    = 0; 
    data.jsonLnk            = JSON.stringify(!!this.policyData.emisionMapfre || null);

    if (this.policyData.adjuntos != null) {
        for (let file of this.policyData.adjuntos) {
          let adjunto = await this.GetAdjuntoBase64(file)
          dataCIP.append(adjunto.name, adjunto, adjunto.name);
          console.log(adjunto);
        }
    }

    await this.insertLogAuth(data);

    const encryptedData = this.cryptoService.encrypt(data);
    dataCIP.append('dataTransaccionesPD', encryptedData);
    
    return dataCIP;
  }

  async generateCip() {
    let dataCIP = new FormData();
    dataCIP = await this.generateDataCip();
    
    let dataKushki: any = {};
    let mixta = this.policyData.savedPolicyList[0]?.P_NCOT_MIXTA ?? this.policyData.savedPolicyList?.P_NCOT_MIXTA;

    dataKushki.P_NID_COTIZACION = this.policyData.dataCIP.quotationNumber;
    dataKushki.P_NID_PROC_EPS = this.policyData.dataCIP.ExternalId_EPS;
    if(mixta == 1){
        dataKushki.P_NID_PROC_SCTR = this.policyData.dataCIP.ExternalId;
    }else{
        dataKushki.P_NID_PROC_SCTR = this.policyData.dataCIP.producto == 2 ? null : this.policyData.dataCIP.ExternalId;
    }
    
    dataKushki.P_NTYPE_TRANSAC = this.policyData.transaccion;
    dataKushki.P_NSTATE_KUSHKI = 2;

    if(this.transac == 'Emisión'){
        this.saveLog(this.transac + ' - ' + (this.policyData?.savedPolicyList[0]?.P_NID_COTIZACION ?? '') + ' - ' + (this.policyData?.savedPolicyList[0]?.P_NID_PROC  ?? ''), 'Llamado a Kushki - Inicio', 1);
    }else{
        this.saveLog(this.transac + ' - ' + (this.policyData?.savedPolicyList?.P_NID_COTIZACION ?? '') + ' - ' + (this.policyData?.savedPolicyList?.P_NID_PROC  ?? ''), 'Llamado a Kushki - Inicio', 1);
    }

    await this.policyemit.GenerateCipKushkiPD(dataCIP).toPromise().then(
        async res => {
            await this.insertLogAuth(res);
            if(this.transac == 'Emisión'){
                this.saveLog(this.transac + ' - ' + (this.policyData?.savedPolicyList[0]?.P_NID_COTIZACION ?? '') + ' - ' + (this.policyData?.savedPolicyList[0]?.P_NID_PROC  ?? ''), 'Respuesta de Kushki: ' + JSON.stringify(res, null, 2), 1);
                this.saveLog(this.transac + ' - ' + (this.policyData?.savedPolicyList[0]?.P_NID_COTIZACION ?? '') + ' - ' + (this.policyData?.savedPolicyList[0]?.P_NID_PROC  ?? ''), 'Llamado a Kushki - Fin', 1);

            }else{
                this.saveLog(this.transac + ' - ' + (this.policyData?.savedPolicyList?.P_NID_COTIZACION ?? '') + ' - ' + (this.policyData?.savedPolicyList?.P_NID_PROC  ?? ''), 'Respuesta de Kushki: ' + JSON.stringify(res, null, 2), 1);
                this.saveLog(this.transac + ' - ' + (this.policyData?.savedPolicyList?.P_NID_COTIZACION ?? '') + ' - ' + (this.policyData?.savedPolicyList?.P_NID_PROC  ?? ''), 'Llamado a Kushki - Fin', 1);
            }

            this.loading = false;
            this.valid = res.valid;
            this.approve = res.approve;
            if (res.P_COD_ERR == 0) {
              this.getModal(res.data); 
            } else {
                this.policyemit.SendKushkiSctr(dataKushki).subscribe(resp => {
                    /*this.toastr.warning("Los cupones asociados están en la sección de Consulta de cotización.",
                        'INFORMACIÓN',
                        { timeOut: 30000, toastClass: 'rmaClass ngx-toastr' }
                    );*/
                    this.loading = false;
                    if (!!res.cipResponse) {
                        res.mensaje = 'PKUSHKI_ERROR';
                        this.verifyError(res.cipResponse);
                      }
                  },
                  err => {
                    this.loading = false;
                  })
            //   if (!!res.cipResponse) {
            //     res.mensaje = 'PKUSHKI_ERROR';
            //     this.verifyError(res.cipResponse);
            //   }

            }
            console.log(res);
        }, async error => {
            await this.insertLogAuth("Error en GenerateCipKushkiPD: " + JSON.stringify(error));
            setTimeout(() => {
                this.policyemit.SendKushkiSctr(dataKushki).subscribe(resp => {
                    /*this.toastr.warning("Los cupones asociados están en la sección de Consulta de cotización.",
                        'INFORMACIÓN',
                        { timeOut: 30000, toastClass: 'rmaClass ngx-toastr' }
                    );*/
                    this.loading = false;
                    if (error.status !== 200) {
                        const res: any = {};
                        res.existo = false;
                        res.mensaje = 'PKUSHKI_ERROR';
                        this.verifyError(res.cipResponse);
                    }
                  },
                  err => {
                    this.loading = false;
                  })
              }, 30000)
            /*if (error.status !== 200) {
                this.loading = false;
                const res: any = {};
                res.existo = false;
                res.mensaje = 'PKUSHKI_ERROR';
                this.verifyError(res.cipResponse);
            }*/

            }    
    );    
  }

  verifyError(response: any) {
    if (response.mensaje === 'PKUSHKI_ERROR') {
        this.valid = true;
        this.approve = false;
    }
  }

  async GetAdjuntoBase64(file: any) {
    try {
        let adjunto: AdjuntoInterface = JSON.parse(file);
        let arr = adjunto.base64.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], adjunto.filename, { type: mime });

    } catch (e) {
        console.log(e);
    }
  }

  async getModal(response: any) {
    const modalConfig = { 
        class: 'custom-modal-width',
        animated: true,
    };

    if (response.cupones.length > 1) {
        this.paymentUrl_Pension = response.cupones[0].url;
        this.idPaymentPEN = response.cupones[0].idPayment;
        this.paymentUrl_Salud = response.cupones[1].url;
        this.idPaymentSAL = response.cupones[1].idPayment;        

        await this.policyemit.getCodPagoKushki(this.policyData.dataCIP.ramo, this.idPaymentPEN, this.idPaymentSAL).toPromise().then(
            async res =>{
                this.cod_pago_PEN = res.P_SCOD_PAGO_PEN;
                this.cod_pago_SAL = res.P_SCOD_PAGO_SAL;
            }
        );
    } else if (response.cupones.length === 1) {
        this.paymentUrl = response.cupones[0].url;

        if(this.policyData.dataCIP.producto == 1){
            this.idPaymentPEN = response.cupones[0].idPayment;
            this.idPaymentSAL = 0;
        }else{
            this.idPaymentPEN = 0;
            this.idPaymentSAL = response.cupones[0].idPayment;       
        }

        await this.policyemit.getCodPagoKushki(this.policyData.dataCIP.ramo, this.idPaymentPEN, this.idPaymentSAL).toPromise().then(
            async res =>{
                console.log(res);

                if(this.idPaymentPEN !== 0){
                    this.cod_pago = res.P_SCOD_PAGO_PEN;
                }else{
                    this.cod_pago = res.P_SCOD_PAGO_SAL;
                }
                
            }, error => {
                console.log('Error');
            }
        );

        console.log(this.cod_pago);
    }

    this.modalRef = this.modalService.show(this.content);
  }

  async saveLog(text1: string, text2: string, order: number){
    await this.LogService.save(text1, text2, order)
    .toPromise()
  }

  async insertLogAuth(data: any){
    let itemObj: any = {};
    itemObj.proceso = 'Front - Generar CIP Kushki';
    itemObj.url = 'KUSHKI';
    itemObj.parametros = JSON.stringify(data);
    itemObj.resultados = '';
    itemObj.cotizacion = this.policyData?.dataCIP?.quotationNumber ? this.policyData.dataCIP.quotationNumber : this.policyData?.savedPolicyList?.[0]?.P_NID_COTIZACION
                                                                    ? this.policyData.savedPolicyList[0].P_NID_COTIZACION : this.policyData?.savedPolicyList?.P_NID_COTIZACION || '';
    itemObj.cotizacion = Number(itemObj.cotizacion) || 0;
    itemObj.nid_proc = this.policyData?.dataCIP?.ExternalId ? this.policyData.dataCIP.ExternalId : this.policyData?.savedPolicyList?.[0]?.P_NID_PROC
                                                            ? this.policyData.savedPolicyList[0].P_NID_PROC : this.policyData?.savedPolicyList?.P_NID_PROC || '';
    
    await this.quotationService.insertLogAuth(itemObj).toPromise();
  }

}
