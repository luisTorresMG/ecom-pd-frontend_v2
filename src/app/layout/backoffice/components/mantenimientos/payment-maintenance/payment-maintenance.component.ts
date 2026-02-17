import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';

import { ChannelSalesService } from '@shared/services/channelsales/channelsales.service';
import { UtilsService } from '@shared/services/utils/utils.service';
import { IExportExcel } from '@shared/interfaces/export-excel.interface';

import { PaymentMaintenanceService } from '../../../services/mantenimientos/paytment-maintenance.service';
import { IItemApplication, IItemBranch, IItemChannel, IItemHistory, IItemProduct, IPaymentEnabledRequest, IPaymentEnabledResponse, IValueFormEdit } from '../../../interfaces/payment-maintenance.interface';
import { LineaCreditoGeneralService } from '../../../../broker/components/gestion-creditos/shared/services/linea-credito-general.service';

@Component({
  selector: 'app-payment-maintenance',
  templateUrl: './payment-maintenance.component.html',
  styleUrls: ['./payment-maintenance.component.sass'],
})
export class PaymentMaintenanceComponent implements OnInit {
  listChannels$: Array<IItemChannel> = [];
  listApplications$: Array<IItemApplication> = [];
  listBranchs$: Array<IItemBranch> = [];
  listProducts$: Array<IItemProduct> = [];
  listPaymentEnabled$: Array<IPaymentEnabledResponse> = [];
  listHistory$: Array<IItemHistory> = [];

  itemEditSelected: IPaymentEnabledResponse = undefined;
  itemHistorySelected: IPaymentEnabledResponse = undefined;
  originFormEdit: IValueFormEdit = undefined;
  changeFormEdit: boolean = false;
  isAllInactivePayment: boolean = false;
  isAuthorized: boolean = false;

  page: number = 1;
  pageHistory: number = 1;

  formFilter: FormGroup = this.builder.group({
    application: ['', Validators.required],
    branch: ['', Validators.required],
    product: ['', Validators.required],
    channel: ['', Validators.required],
  });

  formEdit: FormGroup = this.builder.group({
    cardNiubiz: ['', Validators.required],
    cashPayment: ['', Validators.required],
    cardKushki: ['', Validators.required],
    cashKushki: ['', Validators.required],
    transferKushki: ['', Validators.required],
    yapeNiubiz: ['', Validators.required],
  });

  @ViewChild('modalEdit', { static: true, read: TemplateRef })
  modalEdit: TemplateRef<ElementRef>;

  @ViewChild('modalConfirm', { static: true, read: TemplateRef })
  modalConfirm: TemplateRef<ElementRef>;

  @ViewChild('modalSuccess', { static: true, read: TemplateRef })
  modalSuccess: TemplateRef<ElementRef>;

  @ViewChild('modalRejected', { static: true, read: TemplateRef })
  modalRejected: TemplateRef<ElementRef>;

  @ViewChild('modalHistory', { static: true, read: TemplateRef })
  modalHistory: TemplateRef<ElementRef>;

  constructor(
    private readonly builder: FormBuilder,
    private readonly channelSalesService: ChannelSalesService,
    private readonly paymentMaintenanceService: PaymentMaintenanceService,
    private readonly utilsService: UtilsService,
    private readonly spinner: NgxSpinnerService,
    private readonly vc: ViewContainerRef,
    private readonly lineaCreditoService: LineaCreditoGeneralService

  ) {}

  ngOnInit() {
    this.getStatusAuthorized();
    this.getListChannels();
    this.getListApplications();
    this.getListBranchs();
    this.formValidations();
    this.getlistPaymentEnabled();
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  get formFilterControl(): { [key: string]: AbstractControl } {
    return this.formFilter.controls;
  }

  get formEditControl(): { [key: string]: AbstractControl } {
    return this.formEdit.controls;
  }

  get currentPage(): number {
    return this.page;
  }

  set changeCurrentPage(value: number) {
    this.page = value;
    this.getlistPaymentEnabled();
  }

  get currentPageHistory(): number {
    return this.pageHistory;
  }

  set currentPageHistory(value: number) {
    this.pageHistory = value;
  }

  getStatusAuthorized(): void {
    const user = +this.currentUser.id;

    this.lineaCreditoService.getAuthorized(user).subscribe({
      next: (response: any) => {
        if(!response.success) {
          return;
        }
        
        this.isAuthorized = response.autorizar
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  formValidations(): void {
    this.cleanData();

    this.formFilterControl['branch'].valueChanges.subscribe((val) => {
      if (!val) {
        return;
      }

      this.formFilterControl['product'].setValue('0');
      this.listProducts$ = [];
      this.getListProducts(val);
    });

    this.formEdit.valueChanges.subscribe((newVal) => {
      if (!newVal) {
        return;
      }

      this.changeFormEdit = !this.validateEqualsData(
        newVal,
        this.originFormEdit
      );
      this.isAllInactivePayment = !Object.values(newVal).some(
        (val) => +val == 1
      );
    });
  }

  cleanData(): void {
    this.formFilterControl['channel'].setValue('0');
    this.formFilterControl['application'].setValue('0');
    this.formFilterControl['branch'].setValue('0');
    this.formFilterControl['product'].setValue('0');

    this.getlistPaymentEnabled(true);
  }

  validateEqualsData(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) == JSON.stringify(obj2);
  }
  getListChannels(): void {
    const payload = {
      nusercode: +this.currentUser?.id,
      nchannel: '0',
      scliename: '',
    };
    this.channelSalesService.getPostChannelSales(payload).subscribe({
      next: (response: any) => {
        this.listChannels$ = response;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }

  getListApplications(): void {
    this.paymentMaintenanceService.getlistApplications().subscribe({
      next: (response: any) => {
        this.listApplications$ = response.listadadoAplicaciones;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }

  getListBranchs(): void {
    this.utilsService.getBranches().subscribe({
      next: (response: any) => {
        this.listBranchs$ = response;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }

  getListProducts(val: string): void {
    this.spinner.show();
    const payload = {
      branchId: +val,
      userType: this.currentUser['tipoCanal'],
    };
    this.utilsService.getProducts(payload).subscribe({
      next: (response: any) => {
        this.listProducts$ = response;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  getlistPaymentEnabled(resetPage = false): void {
    this.spinner.show();

    if (resetPage) {
      this.page = 1;
    }

    const payload: IPaymentEnabledRequest = {
      idAplicacion: this.formFilterControl['application'].value,
      idRamo: this.formFilterControl['branch'].value,
      idProducto: this.formFilterControl['product'].value,
      codigoCanal: this.formFilterControl['channel'].value,
      indice: this.page,
      cantidadRegistros: '10',
    };

    this.paymentMaintenanceService.getlistPaymentEnabled(payload).subscribe({
      next: (response: any) => {
        if (!response.success) {
          return;
        }

        this.listPaymentEnabled$ = response.listado;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  showModalEdit(item: any): void {

    if(!this.isAuthorized){
      return;
    }

    this.itemEditSelected = item;

    this.formEditControl['cardNiubiz'].setValue(item.pasarelaNiubiz);
    this.formEditControl['cashPayment'].setValue(item.pagoEfectivo);
    this.formEditControl['cardKushki'].setValue(item.pasarelaKushki);
    this.formEditControl['cashKushki'].setValue(item.cashKushki);
    this.formEditControl['transferKushki'].setValue(item.smartlinkKuhski);
    this.formEditControl['yapeNiubiz'].setValue(item.yapeNiubiz);

    this.originFormEdit = this.formEdit.getRawValue();
    this.changeFormEdit = false;

    this.vc.createEmbeddedView(this.modalEdit);
  }

  showModalConfirm(): void {
    if (!this.changeFormEdit || this.isAllInactivePayment) {
      return;
    }

    this.hideModal();

    this.vc.createEmbeddedView(this.modalConfirm);
  }

  showModalHistory(item: any): void {
    this.spinner.show();
    this.itemHistorySelected = item;

    const payload = {
      idAplicacion: item.idAplicacion,
      idRamo: item.idRamo,
      idProducto: item.idProducto,
      codigoCanal: item.codigoCanal,
    };

    this.paymentMaintenanceService.getlistHistory(payload).subscribe({
      next: (response: any) => {
        if (!response.success) {
          return;
        }

        this.listHistory$ = response.historial;
        this.vc.createEmbeddedView(this.modalHistory);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  saveEdit(): void {
    this.spinner.show();
    this.vc.clear();

    const payload = {
      idAplicacion: this.itemEditSelected.idAplicacion,
      idRamo: this.itemEditSelected.idRamo,
      idProducto: this.itemEditSelected.idProducto,
      codigoCanal: this.itemEditSelected.codigoCanal,
      pasarelaNiubiz: this.formEditControl['cardNiubiz'].value,
      pagoEfectivo: this.formEditControl['cashPayment'].value,
      pasarelaKushki: this.formEditControl['cardKushki'].value,
      cashKushki: this.formEditControl['cashKushki'].value,
      smartLinkKushki: this.formEditControl['transferKushki'].value,
      yapeNiubiz: this.formEditControl['yapeNiubiz'].value,
      idUsuario: this.currentUser?.id,
    };

    this.paymentMaintenanceService.updateEnabledPayment(payload).subscribe({
      next: (response: any) => {

        if (!response.success) {
          this.vc.createEmbeddedView(this.modalRejected);
          return;
        }

        this.vc.createEmbeddedView(this.modalSuccess);
        this.getlistPaymentEnabled();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  hideModal(): void {
    this.vc.clear();
  }

  hideModalConfirm(): void {
    this.hideModal();
    this.vc.createEmbeddedView(this.modalEdit);
  }

  downloadList(): void {
    this.spinner.show();

    const payload: IPaymentEnabledRequest = {
      idAplicacion: this.formFilterControl['application'].value,
      idRamo: this.formFilterControl['branch'].value,
      idProducto: this.formFilterControl['product'].value,
      codigoCanal: this.formFilterControl['channel'].value,
      indice: this.page,
      cantidadRegistros: this.listPaymentEnabled$[0]?.cantidadRegistros,
    };

    this.paymentMaintenanceService.getlistPaymentEnabled(payload).subscribe({
      next: (response: any) => {
        if (!response.success) {
          return;
        }

        this.exportExcel(response.listado);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  exportExcel(response: any): void {
    const payload: IExportExcel = {
      fileName: 'Mantenimiento_formas_de_pago',
      data: response.map((value: any) => ({
        'APLICACIÓN ': value.aplicacion,
        'RAMO ': value.ramo,
        'PRODUCTO ': value.producto,
        'CANAL ': value.canal,
        'PASARELA NIUBIZ ': +value.pasarelaNiubiz == 1 ? 'ACTIVO' : 'INACTIVO',
        'PAGOEFECTIVO ': +value.pagoEfectivo == 1 ? 'ACTIVO' : 'INACTIVO',
        'PASARELA KUSHKI ': +value.pasarelaKushki == 1 ? 'ACTIVO' : 'INACTIVO',
        'CASH KUSHKI ': +value.cashKushki == 1 ? 'ACTIVO' : 'INACTIVO',
        'SMARTLINK KUSHKI ':
          +value.smartlinkKuhski == 1 ? 'ACTIVO' : 'INACTIVO',
        'YAPE NIUBIZ ': +value.yapeNiubiz == 1 ? 'ACTIVO' : 'INACTIVO',
      })),
    };
    this.utilsService.exportExcel(payload);
  }
}
