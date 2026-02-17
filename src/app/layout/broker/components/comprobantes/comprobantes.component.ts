import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import moment from 'moment';

import { AppConfig } from '../../../../app.config';
import { setSerialNumber, sortArray } from '../../../../shared/helpers/utils';
import { ChannelSales } from '../../../../shared/models/channelsales/channelsales';
import { ChannelSalesService } from '../../../../shared/services/channelsales/channelsales.service';
import { ExcelService } from '../../../../shared/services/excel/excel.service';
import { Comprobante } from '../../../client/shared/models/comprobante.model';
import { EmisionService } from '../../../client/shared/services/emision.service';
import { RegularExpressions } from '../../../../shared/regexp/regexp';


@Component({
  templateUrl: './comprobantes.component.html',
  styleUrls: ['./comprobantes.component.css'],
})
export class ComprobantesComponent implements OnInit {
  @ViewChild('childModalMensaje', { static: true })
  childModalMensaje: ModalDirective;
  @ViewChild('childModalEdicion', { static: true })
  childModalEdicion: ModalDirective;
  @ViewChild('childModalEdicionMail', { static: true })
  childModalEdicionMail: ModalDirective;
  @ViewChild('modalSuccessSenMail', { static: true })
  modalSuccessSenMail: ModalDirective;

  @ViewChild('errorSearchForm', { static: false, read: ElementRef })
  errorSearchForm: ElementRef;

  // CONFIGURACIÓN FECHAS
  bsConfig: Partial<BsDatepickerConfig>;
  currentDate: Date = new Date();
  bsStartValue: Date = new Date(this.currentDate.setFullYear(this.currentDate.getFullYear() - 1));
  bsEndValue: Date = new Date();
  isValidDate: boolean = true;

  messageErrorForm: string = '';
  userCode: number;
  channelUser: number;
  channelList: any[];
  billsDataGlobal: any[] = [];
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  haveBillsData = false;
  billsData: any[] = [];

  mailBroker: '';
  razonSocialBroker: '';
  numeroDocumentoBroker: '';
  codigoBroker: 0;
  codigoClienteBroker: '';

  searchtext = '';
  comprobantes = [];
  comprobantesRow = [];
  mailCollection = [];
  uniqueMailCollection = [];

  messagevalidation = '';
  loadingdata = false;
  searchcheck = '-1';
  p = 0;
  edicionForm: FormGroup;
  edicionMailForm: FormGroup;
  enviarContratantes = false;
  profile_admin = AppConfig.PROFILE_ADMIN_SOAT;
  isProtecta: boolean;
  showDescarga = false;
  IS_ADMIN: number;
  formSearch: FormGroup;
  startDateControl: FormControl = this.formBuilder.control(this.bsStartValue);
  endDateControl: FormControl = this.formBuilder.control(this.bsEndValue);


  constructor(
    private spinner: NgxSpinnerService,
    private emissionService: EmisionService,
    private excelService: ExcelService,
    private channelService: ChannelSalesService,
    private formBuilder: FormBuilder
  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: false,
      }
    );
    this.isProtecta = AppConfig.IS_PROTECTA;
    this.IS_ADMIN = Number(
      JSON.parse(localStorage.getItem('currentUser')).profileId
    );
    this.formSearch = this.formBuilder.group({
      poliza: [null],
      comprobante: [null],
      documento: [null, Validators.pattern(RegularExpressions.numbers)],
      filterType: ['1']
    });
  }

  get IsAdmin() {
    this.IS_ADMIN = Number(this.IS_ADMIN);
    return (
      this.IS_ADMIN === 20 ||
      this.IS_ADMIN === 151 ||
      this.IS_ADMIN === 154 ||
      this.IS_ADMIN === 155
    );
  }

  ngOnInit() {
    this.channelUser = this.currentUser.canal;
    this.userCode = this.currentUser && this.currentUser.id;

    if (!this.IsAdmin) {
      this.listChannel();
    }

    this.edicionForm = this.formBuilder.group({
      tipoenvio: ['', Validators.required],
      envioContratante: [true, Validators.required],
      mailbroker: [
        '',
        [Validators.required, Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN)],
      ],
    });

    this.edicionMailForm = this.formBuilder.group({
      mailcontratante: [
        '',
        [Validators.required, Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN)],
      ],
      codigocontratante: ['', [Validators.required]],
    });
    this.habilitarDescargas();

    this.startDateControl.valueChanges.subscribe(() => this.checkDateRange());
    this.endDateControl.valueChanges.subscribe(() => this.checkDateRange());

    this.formSearch.valueChanges.subscribe(() => {
        this.messageErrorForm = '';
    })

    this.formSearch.get('filterType')?.valueChanges.subscribe(() => {
        this.messageErrorForm = '';
        this.formSearch.patchValue({
          poliza: null,
          comprobante: null,
          documento: null
        });
    });

    this.formSearch.get('documento')?.valueChanges.subscribe((value: string) => {
        if (value) {
            if (this.formSearch.get('documento').hasError('pattern')) {
                this.formSearch.get('documento').setValue(value.slice(0, value.length - 1));
            }
        }
    });
  }

  checkDateRange(): void {
    const startDate = new Date(this.startDateControl.value);
    const endDate = new Date(this.endDateControl.value);

    startDate.setFullYear(startDate.getFullYear() + 1);

    this.isValidDate = startDate >= endDate || startDate.toDateString()=== endDate.toDateString();
  }

  clearformSearch(): void {
    this.billsData = [];
    this.billsDataGlobal = [];
    this.comprobantes = [];
    this.formSearch.reset();
    this.formSearch.get('filterType')?.setValue('1');
    this.startDateControl.reset();
    this.endDateControl.reset();
    this.startDateControl.setValue(this.bsStartValue);
    this.endDateControl.setValue(this.bsEndValue);
    this.searchtext = '';
    this.searchcheck = '-1';
    this.messageErrorForm = '';
  }

  searchListData(): void {
    this.messageErrorForm = '';
    const isInvalidForm = this.validateForm()

    if (isInvalidForm) {
      return;
    }

    if (this.isProtecta) {
      this.listComprobantesForAdmin() 
    } else {
      this.listComprobantes(this.channelUser)
    }
  }

  validateForm(): boolean {
    const formValues = this.formSearch.value;

    const result = (!formValues.documento || formValues.documento === '') &&
    (!formValues.poliza || formValues.poliza === '') &&
    (!formValues.comprobante || formValues.comprobante === '');

    if (result) {
        switch (+formValues.filterType) {
            case 1:
              this.messageErrorForm = 'Debe ingresar el N° de RUC';
              break;
            case 2:
              this.messageErrorForm = 'Debe ingresar el N° de Póliza';
              break;
            default:
              this.messageErrorForm = 'Debe ingresar el N° de Comprobante';
              break;
        }
    }

    return result
  }
 
  listComprobantesForAdmin() {
    if (!this.isValidDate) {
      return;
    }

    const formValues = this.formSearch.value;
    const payload = {
      poliza: formValues.poliza ? formValues.poliza.toString().trim() : 0,
      comprobante: formValues.comprobante ? formValues.comprobante.toString().trim() : null,
      documento: formValues.documento ? formValues.documento.toString().trim(): null,
      fechaInicio: formValues.comprobante ? null : moment(this.startDateControl.value).format('DD/MM/YYYY'),
      fechaFin: formValues.comprobante ? null : moment(this.endDateControl.value).format('DD/MM/YYYY'),
      tipoBusqueda: +formValues.filterType 
    }
 
    this.billsData = [];
    this.billsDataGlobal = [];
    this.comprobantes = [];
    this.spinner.show();
    this.channelService.getComprobantesForAdmin(payload).subscribe(
      (data: any) => {
        const brokerData = <any>data;
        this.billsData = data.comprobanteDetail;

        this.mailBroker = brokerData.emailCorredor;
        this.razonSocialBroker = brokerData.razonSocial;
        this.numeroDocumentoBroker = brokerData.documento;
        this.codigoBroker = brokerData.codigoCorredor;
        this.codigoClienteBroker = brokerData.codigoCliente;

        this.billsDataGlobal = data.comprobanteDetail;
        this.haveBillsData = this.billsData.length > 0;
        this.spinner.hide();
        this.loadingdata = false;
      },
      (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }

  listChannel(): void {
    this.channelService
      .getPostChannelSales(new ChannelSales(this.userCode, '0', ''))
      .subscribe(
        (data) => {
          this.channelList = <any[]>data;
          if (AppConfig.FILTER_CHANNEL_ONLY_BROKER.res) {
            // tslint:disable-next-line:max-line-length
            this.channelList = this.channelList.filter(
              (x) =>
                x.nchannel.toString() ===
                AppConfig.FILTER_CHANNEL_ONLY_BROKER.channel?.toString()
            );
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  habilitarDescargas() {
    this.showDescarga = false;
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (this.profile_admin === user.profileId) {
      this.showDescarga = true;
    }
  }

  search() {
    let canalesFiltrados;
    const term = this.searchtext;
    if (!term) {
      canalesFiltrados = this.billsDataGlobal;
    } else {
      this.billsDataGlobal.forEach((e) => {
        e.documentoReferencia =
          e.documentoReferencia === null ? '' : e.documentoReferencia;
      });
      canalesFiltrados = this.billsDataGlobal.filter(
        (x) =>
          x.producto
            ?.trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase()) ||
          x.documentoReferencia
            ?.toString()
            .trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase()) ||
          x.tipoComprobante
            ?.toString()
            .trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase()) ||
          setSerialNumber(x.idTipoComprobante, x.serieNumero)
            ?.toString()
            .trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase()) ||
          x.montoTotal
            ?.toString()
            .trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase()) ||
          x.documentoContratante
            ?.toString()
            .trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase()) ||
          x.contratante
            ?.toString()
            .trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase()) ||
          x.poliza
            ?.toString()
            .trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase()) ||
          x.placa
            ?.toString()
            .trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase()) ||
          x.estado
            ?.toString()
            .trim()
            .toLowerCase()
            .includes(term.trim().toLowerCase())
      );
    }

    if (this.searchcheck !== '-1') {
      canalesFiltrados = canalesFiltrados.filter(
        (x) => Number(x.enviado) === Number(this.searchcheck)
      );
    }

    this.billsData = canalesFiltrados;
  }

  listComprobantes(canal: any): void {
    this.billsData = [];
    this.billsDataGlobal = [];
    this.searchtext = '';
    this.searchcheck = '-1';
    this.loadingdata = true;
    this.spinner.show();

    const formValues = this.formSearch.value;

    const payload = {
      codigoCanal: canal.toString(),
      fechaInicio: formValues.comprobante ? null : moment(this.startDateControl.value).format('DD/MM/YYYY'),
      fechaFin: formValues.comprobante ? null : moment(this.endDateControl.value).format('DD/MM/YYYY'),
      poliza: formValues.poliza ? formValues.poliza.toString().trim() : 0,
      comprobante: formValues.comprobante ? formValues.comprobante.toString().trim() : null,
      documento: formValues.documento ? formValues.documento.toString().trim(): null,
      tipoBusqueda: +formValues.filterType 
    }

    this.channelService.getComprobantes(payload).subscribe(
      (res: any) => {

        if(!res.data.success) {
          this.spinner.hide();
          this.loadingdata = false;
          return;
        }

        const brokerData = res.data;
        const documentList = sortArray(
          <any[]>brokerData.comprobanteListado,
          'fechaEmision',
          -1
        );
        this.billsData = documentList;

        this.mailBroker = brokerData.datosCanal.emailCorredor;
        this.razonSocialBroker = brokerData.datosCanal.razonSocial;
        this.numeroDocumentoBroker = brokerData.datosCanal.documento;
        this.codigoBroker = brokerData.datosCanal.codigoCorredor;
        this.codigoClienteBroker = brokerData.datosCanal.codigoCliente;

        this.billsDataGlobal = documentList;
        this.haveBillsData = this.billsData.length > 0;
        this.spinner.hide();
        this.loadingdata = false;
      },
      (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }

  getTotalAmount(type: string, amount: string): string {
    let text = '';
    if (type === '' || amount === '' || !type || !amount) {
      text = '';
    }
    if (type.toString().trim() === 'Soles') {
      text = 'S/ ' + parseFloat(amount).toFixed(2);
    }
    if (type.toString().trim() === 'Dolares') {
      text = '$ ' + parseFloat(amount).toFixed(2);
    }

    return text;
  }

  getDocumentType(type: number): string {
    let coreType = '';
    switch (Number(type)) {
      case 5:
        coreType = '01';
        break;
      case 6:
        coreType = '03';
        break;
      default:
        coreType = '07';
        break;
    }
    return coreType;
  }

  documentChecked(row: any) {
    const serialnumber = setSerialNumber(
      row.idTipoComprobante,
      row.serieNumero
    );
    return (
      this.comprobantes.filter((x) => x.serienumero === serialnumber).length > 0
    );
  }

  getSerialNumber(row: any) {
    return setSerialNumber(row.idTipoComprobante, row.serieNumero).toString();
  }

  onSelectChannelSales(channelSalesId) {
    this.channelUser = channelSalesId;
  }

  onSelectEnviado(enviado) {
    this.search();
  }

  enviarMail() {
    this.edicionForm.reset();
    this.edicionForm.get('tipoenvio').setValue('0');
    this.edicionForm.get('envioContratante').setValue(false);
    this.edicionForm.get('mailbroker').setValue(this.mailBroker);

    this.uniqueMailCollection = [];
    this.mailCollection = [];
    // this.comprobantesRow
    for (let index = 0; index < this.comprobantesRow.length; index++) {
      const element = this.comprobantesRow[index];

      const comprobanteOrigin = element.row.serieNumero.split('-');
      const sSerialOrigin = comprobanteOrigin[0];
      const sNumberOrigin = Number(comprobanteOrigin[1]).toString();

      const jsonContratante = {
        archivo: [
          {
            tipoComprobante: element.documentoConsulta.tipoComprobante,
            fecha: element.row.fechaEmision,
            tipoComprobanteDescription: element.row.tipoComprobante,
            serie: element.documentoConsulta.serie,
            numero: element.documentoConsulta.numero,
            TipoBill: element.row.idTipoComprobante,
            AreaBill: sSerialOrigin,
            NumBill: sNumberOrigin,
          },
        ],
        codigoCliente: element.row.codigoContratante,
        tipoDocumento: element.row.tipoDocumentoContratante,
        numeroDocumento: element.row.documentoContratante,
        razonSocial: element.row.contratante,
        email: element.row.mailContratante,
      };

      const existeContratante = this.uniqueMailCollection.find(
        (x) => x.codigoCliente === element.row.codigoContratante
      );
      if (!existeContratante) {
        this.uniqueMailCollection.push({
          razonSocial: element.row.contratante,
          email: element.row.mailContratante,
          codigoCliente: element.row.codigoContratante,
        });
      }
      this.mailCollection.push(jsonContratante);
    }
    this.enviarContratantes = false;
    this.childModalEdicion.show();
  }

  descargarComprobante() {
    this.spinner.show();
    this.emissionService
      .descargarComprobante(this.comprobantes)
      .subscribe((res) => {
        const mFile = res as any;
        mFile.file = res.archivo;
        mFile.id = mFile.nombre;
        if (res) {
          let linkSource = 'data:application/pdf;base64,';
          linkSource += res.file;
          const a = document.createElement('a');
          a.setAttribute('href', linkSource);
          a.setAttribute('download', res.id);
          a.setAttribute('target', '_blank');
          a.setAttribute('style', 'display:none;');
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
        this.spinner.hide();
      });
  }

  validarComprobante(event, row: any, ref: any) {
    const isChecked = event.target.checked;
    const documentoConsulta: Comprobante = new Comprobante();
    documentoConsulta.serienumero = setSerialNumber(
      row.idTipoComprobante,
      row.serieNumero
    );
    const serialNumberOrigin = documentoConsulta.serienumero.split('-');
    const sSerial = serialNumberOrigin[0];
    const sNumber = Number(serialNumberOrigin[1]).toString();

    documentoConsulta.tipoComprobante = this.getDocumentType(
      row.idTipoComprobante
    );
    documentoConsulta.serie = sSerial;
    documentoConsulta.numero = sNumber;
    documentoConsulta.fecha = row.fechaEmision;
    documentoConsulta.monto = row.montoTotal;
    documentoConsulta.ruc = '20517207331';
    documentoConsulta.isPDF = true;

    if (isChecked) {
      ref.checked = false;
      this.spinner.show();
      this.messagevalidation = '';
      this.emissionService.validarComprobante(documentoConsulta).subscribe(
        (res) => {
          if (res.valido) {
            this.comprobantes.push(documentoConsulta);
            this.comprobantesRow.push({ documentoConsulta, row });
          } else {
            this.messagevalidation =
              'Su comprobante se encuentra en proceso de validación, por favor intente nuevamente en unos minutos.';
            this.childModalMensaje.show();
          }
          this.spinner.hide();
        },
        (err) => {
          this.spinner.hide();
          console.log(err);
        }
      );
    } else {
      this.comprobantes = this.comprobantes.filter(
        (x) => x.serienumero !== documentoConsulta.serienumero
      );
      this.comprobantesRow = this.comprobantesRow.filter(
        (x) => x.documentoConsulta.serienumero !== documentoConsulta.serienumero
      );
    }
  }

  closeModalMensaje(): void {
    this.childModalMensaje.hide();
  }

  onClose() {
    this.childModalEdicion.hide();
  }

  onCloseMail() {
    this.childModalEdicionMail.hide();
  }

  onSave() {
    this.spinner.show();
    const mailBrokerEnvio = this.edicionForm.get('mailbroker').value;

    const broker = {
      codigoCliente: this.codigoClienteBroker,
      emailCorredor:
        this.edicionForm.get('tipoenvio').value === '0'
          ? mailBrokerEnvio
          : null,
      codigoCorredor: this.codigoBroker,
      numeroDocumento: this.numeroDocumentoBroker,
      razonSocial: this.razonSocialBroker,
      emailOtro:
        this.edicionForm.get('tipoenvio').value === '0'
          ? null
          : mailBrokerEnvio,
      contratante: this.mailCollection,
    };

    const payload = {
      idUsuario: this.userCode,
      tipoEnvio: Number(this.edicionForm.get('tipoenvio').value),
      incluyeContratantes: this.enviarContratantes,
      corredor: broker,
      origin: '2',
    };

    this.emissionService.notificar(payload).subscribe(
      (res) => {
        this.childModalEdicion.hide();
        this.spinner.hide();
        this.modalSuccessSenMail.show();
      },
      (err) => {
        this.spinner.hide();
      }
    );
    this.uniqueMailCollection = [];
    this.comprobantes = [];
    this.comprobantesRow = [];
    this.mailCollection = [];
  }

  changeEnvioContratante(x) {
    this.enviarContratantes = x.target.checked;
  }

  get cForm() {
    return this.edicionForm.controls;
  }

  showError(controlName: string): boolean {
    return (
      this.cForm[controlName].invalid &&
      (this.cForm[controlName].dirty || this.cForm[controlName].touched)
    );
  }

  get cFormMail() {
    return this.edicionMailForm.controls;
  }

  showErrorMail(controlName: string): boolean {
    return (
      this.cFormMail[controlName].invalid &&
      (this.cFormMail[controlName].dirty || this.cFormMail[controlName].touched)
    );
  }

  onEditarMail(contratante) {
    this.childModalEdicionMail.show();
    this.edicionMailForm.get('mailcontratante').setValue(contratante.email);
    this.edicionMailForm
      .get('codigocontratante')
      .setValue(contratante.codigoCliente);
  }

  onSaveMail() {
    const mail = this.edicionMailForm.get('mailcontratante').value;
    const codigo = this.edicionMailForm.get('codigocontratante').value;
    const coll1 = this.uniqueMailCollection.filter(
      (x) => x.codigoCliente === codigo
    );
    if (coll1) {
      for (let index = 0; index < coll1.length; index++) {
        const element = coll1[index];
        element.email = mail;
      }
    }

    const coll2 = this.mailCollection.filter((x) => x.codigoCliente === codigo);
    if (coll2) {
      for (let index = 0; index < coll2.length; index++) {
        const element = coll2[index];
        element.email = mail;
      }
    }

    this.childModalEdicionMail.hide();
  }

  descargarExcel() {
    if (this.IsAdmin) {
      this.excelService.exportAccountStateForAdmin(
        this.billsDataGlobal,
        'EstadoDeCuenta'
      );
    } else {
      this.excelService.exportAccountState(
        this.billsDataGlobal,
        'EstadoDeCuenta'
      );
    }
  }

  getReporteEnvios() {
    this.spinner.show();
    this.emissionService.generarReporteEnvio().subscribe((response) => {
      if (response) {
        let linkSource = 'data:application/pdf;base64,';
        linkSource += response.file;
        const a = document.createElement('a');
        a.setAttribute('href', linkSource);
        a.setAttribute('download', response.id);
        a.setAttribute('target', '_blank');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      this.spinner.hide();
    });
  }
  hideModalSuccessSendMail(): void {
    this.modalSuccessSenMail.hide();
  }
}
