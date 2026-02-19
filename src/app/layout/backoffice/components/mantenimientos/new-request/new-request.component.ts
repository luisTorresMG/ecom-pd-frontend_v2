import { Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { RecaptchaComponent } from 'ng-recaptcha';
import moment from 'moment';
import { UtilsService } from '@shared/services/utils/utils.service';
import { NewRequestService } from '../shared/services/new-request.service';
import {
  Branch,
  ChannelInfo,
  ChannelType,
  FileInfo,
  Item,
  Product,
  RequestInfo,
  SaveCreditLineRequest,
  SaveProductRequest,
  SaveRequest,
  UpdateAssociatedChannelRequest
} from '../shared/interfaces/new-request.interface';
import {
  IDepartamentoModel,
  IDistritoModel,
  IProvinciaModel,
  ParametersResponse
} from '@shared/models/ubigeo/parameters.model';
import {
  RequestInfoResponse,
  SearchChannelInfo,
  SearchChannelResponse,
  StockInfo
} from '../shared/models/new-request.model';
import { String } from './constants/constants';
import { RegularExpressions } from '@shared/regexp/regexp';
import { AppConfig } from '@root/app.config';
import { DocumentInfoResponseModel } from '@shared/models/document-information/document-information.model';
import { IDocumentInfoClientRequest } from '@shared/interfaces/document-information.interface';

interface Response {
  success: boolean;
  message: string;
  showImage: boolean;
}

enum RequestType {
  REGISTER_CHANNEL = '0',
  EDIT_CHANNEL = '1',
  REGISTER_POINT_SALE = '2',
  EDIT_POINT_SALE = '3'
}

enum DocumentType {
  RUC = '2',
  DNI = '1',
  CE = '3'
}

enum DistributionType {
  CHANNEL = '1',
  POINT_SALE = '0'
}

enum ChannelTypeWithAssociatedChannel {
  COMERCIALIZADOR = 10,
  BANCASEGUROS = 11,
  SUBCANAL = 13
}

type DocumentTypeKey = 'RUC' | 'DNI' | 'CE';
type DistributionTypeKey = 'CHANNEL' | 'POINT_SALE';
type RequestTypeKey = 'REGISTER_CHANNEL' | 'EDIT_CHANNEL' | 'REGISTER_POINT_SALE' | 'EDIT_POINT_SALE';
type ChannelTypeWithAssociatedChannelKey = 'COMERCIALIZADOR' | 'BANCASEGUROS' | 'SUBCANAL';

const RUC_TYPES: number[] = [10, 15, 20];
const SOAT_BRANCH_ID: number = 66;
const SOAT_PRODUCT_ID: number = 1;

@Component({
  selector: 'app-new-request',
  templateUrl: './new-request.component.html',
  styleUrls: ['./new-request.component.scss']
})
export class NewRequestComponent implements OnInit {
  readonly REQUEST_TYPE: Record<RequestTypeKey, string> = {
    REGISTER_CHANNEL: RequestType.REGISTER_CHANNEL,
    EDIT_CHANNEL: RequestType.EDIT_CHANNEL,
    REGISTER_POINT_SALE: RequestType.REGISTER_POINT_SALE,
    EDIT_POINT_SALE: RequestType.EDIT_POINT_SALE
  };
  readonly DOCUMENT_TYPE: Record<DocumentTypeKey, string> = {
    RUC: DocumentType.RUC,
    DNI: DocumentType.DNI,
    CE: DocumentType.CE
  };
  readonly DISTRIBUTION_TYPE: Record<DistributionTypeKey, string> = {
    CHANNEL: DistributionType.CHANNEL,
    POINT_SALE: DistributionType.POINT_SALE
  };
  readonly CHANNEL_TYPE_WITH_ASSOCIATED_CHANNEL: Record<ChannelTypeWithAssociatedChannelKey, number> = {
    COMERCIALIZADOR: ChannelTypeWithAssociatedChannel.COMERCIALIZADOR,
    BANCASEGUROS: ChannelTypeWithAssociatedChannel.BANCASEGUROS,
    SUBCANAL: ChannelTypeWithAssociatedChannel.SUBCANAL
  };

  readonly MAX_LENGTH_ALLOWED: Record<string, number> = {
    EMAIL: 60,
    LEGAL_NAME: 60,
    DETAIL: 60
  }

  readonly SEARCH_TYPES: Record<string, string> = {
    DOCUMENT: '1',
    LEGALNAME: '2',
  }

  private readonly PHONE_NUMBER_VALIDATORS: ValidatorFn[] = [
    Validators.pattern(RegularExpressions.numbers),
    Validators.minLength(9),
    Validators.maxLength(9)
  ];
  private readonly RUC_VALIDATORS: ValidatorFn[] = [
    Validators.pattern(RegularExpressions.numbers),
    Validators.minLength(11),
    Validators.maxLength(11)
  ];
  readonly startValidityConfig: Partial<BsDatepickerConfig>;
  readonly endValidityConfig: Partial<BsDatepickerConfig>;
 
  requestTypeControl!: FormControl;
  basicDataForm!: FormGroup;
  supplementaryDataForm!: FormGroup;
  attachedDataListForm!: FormArray;
  
  attachedFileList: FileInfo[] = [];
  creditLineDataListForm!: FormArray;

  branchListForm!: FormArray;
  formSubChannel!: FormGroup;
  clientCodeSubChannelControl!: FormControl;
  
 
  branches$: Branch[] = [];

  fileTypeList$: Item[] = [];
  certificateTypeList$: Item[] = [];
  channelTypeList$: ChannelType[] = [];
  salesChannelList$: Item[] = [];
  stockProviderList$: Item[] = [];
  departmentList$: IDepartamentoModel[] = [];
  provinceList$: IProvinciaModel[] = [];
  districtList$: IDistritoModel[] = [];
  listDataSubChannel$: any[] = [];
  subChannelSelected: any = {};

  response: Response;

  searchChannelForm!: FormGroup;
  
  searchChannelList$: SearchChannelInfo[] = [];
  searchChannelTotalItems: number = 0;
  searchChannelCurrentPage: number = 1;
  currentPageListSubchannel: number = 1;
  channelInfo: SearchChannelInfo;
  requestInfo: Partial<RequestInfo> = {};
  siteKey = AppConfig.CAPTCHA_KEY;

  @ViewChild('modalConfirmSave', { static: true, read: TemplateRef })
  modalConfirmSave: TemplateRef<ElementRef>;

  @ViewChild('modalResponse', { static: true, read: TemplateRef })
  modalResponse: TemplateRef<ElementRef>;

  @ViewChild('modalSearchChannel', { static: true, read: TemplateRef })
  modalSearchChannel: TemplateRef<ElementRef>;

  @ViewChild('modalSubChannel', { static: true, read: TemplateRef })
  modalSubChannel: TemplateRef<ElementRef>;

  @ViewChild('recaptchaRef', { static: true }) recaptcha: RecaptchaComponent;

  /**
   * @param spinner: NgxSpinnerService Show the loading spinner
   * @param router: Router for page navigation
   * @param vcr: Represents a container where one or more views can be attached to a component.
   * @param builder: FormBuilder Create a form group
   * @param utilsService: UtilsService Call the methods in the UtilsService class
   * @param newRequestService: NewRequestService Call the methods in the new-request
   */
  constructor(
    private readonly spinner: NgxSpinnerService,
    private readonly router: Router,
    private readonly vcr: ViewContainerRef,
    private readonly builder: FormBuilder,
    private readonly utilsService: UtilsService,
    private readonly newRequestService: NewRequestService
  ) {
     this.startValidityConfig = {
      ...this.utilsService.datepickerConfig,
      minDate: new Date(),
    };

    this.endValidityConfig = {
      ...this.utilsService.datepickerConfig,
      minDate: new Date(),
      maxDate: moment(new Date()).add(10, 'years').toDate(),
    };
    this.requestTypeControl = this.builder.control('', Validators.required);
    this.basicDataForm = this.builder.group({
      documentType: [{ value: this.DOCUMENT_TYPE.RUC, disabled: true }, Validators.required],
      documentNumber: ['', [
        Validators.required,
        ...this.RUC_VALIDATORS
      ]],
      legalName: ['', Validators.required],
      names: [''],
      paternalSurname: [''],
      maternalSurname: [''],
      department: ['', Validators.required],
      province: ['', Validators.required],
      district: ['', Validators.required],
      phoneNumber: ['', [
        Validators.required,
        ...this.PHONE_NUMBER_VALIDATORS
      ]],
      address: ['', [
        Validators.required,
        Validators.maxLength(80)
      ]],
      contact: ['', Validators.required],
      email: ['', [
        Validators.required,
        Validators.pattern(RegularExpressions.email)
      ]],
      channelType: ['', Validators.required],
      associatedChannel: [''],
      detail: ['']
    });
    this.supplementaryDataForm = this.builder.group({
      startValidity: [new Date(), Validators.required],
      endValidity: [moment(new Date()).add(1, 'years').toDate(), Validators.required],
      stockProvider: ['', Validators.required],
      distributionType: [this.DISTRIBUTION_TYPE.POINT_SALE, Validators.required]
    });
    this.attachedDataListForm = this.builder.array([]);
    this.creditLineDataListForm = this.builder.array([]);
    this.branchListForm = this.builder.array([]);

    this.formSubChannel = this.builder.group({
      searchType: [this.SEARCH_TYPES.DOCUMENT],
      documentType: [{ value: '1', disabled: true }],
      documentNumber: ['', [
        Validators.pattern(RegularExpressions.numbers),
        Validators.minLength(11),
        Validators.maxLength(11)]],
      legalName: ['', Validators.maxLength(60)],
    });
    this.clientCodeSubChannelControl = this.builder.control('');
    this.searchChannelForm = this.builder.group({
      documentType: [{ value: this.DOCUMENT_TYPE.RUC, disabled: true }, Validators.required],
      documentNumber: ['', [
        Validators.required,
        ...this.RUC_VALIDATORS
      ]],
      legalName: ['', Validators.maxLength(this.MAX_LENGTH_ALLOWED.LEGAL_NAME)]
    });

  }

  ngOnInit(): void {
    this.requestTypeValueChanges();
    this.basicDataFormValidations();
    this.searchChannelFormValidations();
    this.getParams();
    this.addRowBranch();
    this.formSubChannelValidations();
  }

  /**
   * The currentUser function returns the current user from local storage.
   * @return The current user
   */
  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') ?? '{}');
  }

  /**
   * The basicDataFormControl function returns the basicDataForm.
   * Controls an object, which is a dictionary of all the controls in the form.
   * This function is used
   * to access individual controls in order to set validation rules and error messages for each control.
   * @return The controls of the basicDataForm
   */
  get basicDataFormControl(): { [key: string]: AbstractControl } {
    return this.basicDataForm.controls;
  }

  /**
   * The supplementaryDataFormControl function returns the supplementaryDataForm.
   * Controls an object, which is a collection of all controls in the form.
   * The function is used to access individual controls within the form and to check their validity status.
   * @return The form control for each of the form fields in the supplementaryDataForm
   */
  get supplementaryDataFormControl(): { [key: string]: AbstractControl } {
    return this.supplementaryDataForm.controls;
  }

  /**
   * The searchChannelFormControl function is a getter function that returns the searchChannelFormControl object.
   * @return The form control object for the searchChannelForm
   */
  get searchChannelFormControl(): { [key: string]: AbstractControl } {
    return this.searchChannelForm.controls;
  }

  get formSubChannelControl(): { [key: string]: AbstractControl } {
    return this.formSubChannel.controls;
  }

  /**
   * The isRuc10 function checks if the first two digits of the document number are 10.
   * @return True if the first two digits of the document number are 10
   */
  get isRuc10(): boolean {
    return +this.basicDataFormControl['documentNumber'].value.slice(0, 2) == 10;
  }

  /**
   * The rucIsValid function checks if the first two digits of the RUC number are valid.
   * @return True if the first two digits of the ruc are included in RUC_TYPES
   */
  get rucIsValid(): boolean {
    return RUC_TYPES.includes(+this.basicDataFormControl['documentNumber'].value.slice(0, 2));
  }

  get isSubChannel(): boolean {
    return this.basicDataFormControl['channelType'].value ==
    this.CHANNEL_TYPE_WITH_ASSOCIATED_CHANNEL.SUBCANAL
  }

  get applyAssociatedChannel(): boolean {
    const channelType = +this.basicDataFormControl['channelType'].value;

    return channelType === this.CHANNEL_TYPE_WITH_ASSOCIATED_CHANNEL.BANCASEGUROS ||
      channelType === this.CHANNEL_TYPE_WITH_ASSOCIATED_CHANNEL.COMERCIALIZADOR || 
      channelType === this.CHANNEL_TYPE_WITH_ASSOCIATED_CHANNEL.SUBCANAL
  }

  /**
   * The formIsInValid function is used to determine whether the form is valid or not.
   * @return True or false, depending on the value of this
   */
  get formIsInValid(): boolean {
    switch (this.requestTypeControl.value) {
      case RequestType.REGISTER_CHANNEL:
      case RequestType.EDIT_CHANNEL: {
        let attachmentsAndCreditLinesInvalid: boolean = false;

        if (this.isSoatProductSelected) {
          const rowsLength: boolean = !this.attachedFileList.length || !this.creditLineDataListForm.length;
          attachmentsAndCreditLinesInvalid = this.attachedDataListForm.invalid || this.creditLineDataListForm.invalid || rowsLength;
        }

        // tslint:disable-next-line:max-line-length
        return this.basicDataForm.invalid || this.supplementaryDataForm.invalid || attachmentsAndCreditLinesInvalid || this.branchListForm.invalid || !this.rucIsValid;
      }
      default:
        return true;
    }
  }

  /**
   * The requestTypeValueChanges function is a subscription to the requestTypeControl's valueChanges Observable.
   * When the value of this control changes,
   * it will call setDefaultValuesForAllForms() which sets all form controls to their default values.
   * @return Void
   */
  private requestTypeValueChanges(): void {
    this.requestTypeControl.valueChanges.subscribe((): void => {
      this.setDefaultValuesForAllForms();
    });
  }

  /**
   * The setDefaultValuesForAllForms function sets default values for all forms.
   * @return Void
   */
  private setDefaultValuesForAllForms(): void {
    this.setDefaultValuesForBasicDataForm();
    this.setDefaultValuesForSupplementaryDataForm();
    this.attachedDataListForm.clear();
    this.attachedFileList = [];
    this.creditLineDataListForm.clear();
    this.stockProviderList$ = [];
    this.salesChannelList$ = [];
    this.addRowAttachment();
    this.addRowCreditLine();
  }

  /**
   * The setDefaultValuesForBasicDataForm function sets the default values for the basic data form.
   * @return Void
   */
  private setDefaultValuesForBasicDataForm(): void {
    this.basicDataForm.clearValidators();
    this.basicDataForm.updateValueAndValidity({ emitEvent: false });
    const defaultValues = {
      documentType: this.DOCUMENT_TYPE.RUC,
      documentNumber: '',
      legalName: '',
      names: '',
      paternalSurname: '',
      maternalSurname: '',
      department: '',
      province: '',
      district: '',
      phoneNumber: '',
      address: '',
      contact: '',
      email: '',
      channelType: '',
      detail: ''
    };
    this.basicDataForm.patchValue(defaultValues, { emitEvent: false });
    this.basicDataFormControl['documentNumber'].enable({ emitEvent: false });
    this.basicDataFormControl['legalName'].enable({ emitEvent: false });
    this.basicDataFormControl['channelType'].enable({ emitEvent: false });
    this.basicDataForm.markAsUntouched();
  }

  /**
   * The setDefaultValuesForSupplementaryDataForm function sets the default values for the basic data form.
   * @return Void
   */
  private setDefaultValuesForSupplementaryDataForm(): void {
    this.supplementaryDataForm.clearValidators();
    this.supplementaryDataForm.updateValueAndValidity({ emitEvent: false });
    const defaultValues = {
      startValidity: new Date(),
      endValidity: moment(new Date()).add(1, 'years').toDate(),
      stockProvider: '',
      distributionType: this.DISTRIBUTION_TYPE.POINT_SALE
    };
    this.supplementaryDataForm.patchValue(defaultValues, { emitEvent: false });
    this.supplementaryDataForm.markAsUntouched();
  }

  /**
   * The basicDataFormValidations function is responsible for validating the basic data form.
   * It does so by subscribing to the valueChanges Observable of each input in the form,
   * and then checking if that input has an error.
   * If it does, it sets its value to be one character less than what was previously typed in
   * (the last character being invalid).
   * @return Void
   */
  private basicDataFormValidations(): void {
    this.basicDataFormControl['documentNumber'].valueChanges.subscribe((value: string): void => {
      if (this.basicDataFormControl['documentNumber'].hasError('pattern')) {
        this.basicDataFormControl['documentNumber'].setValue(value.slice(0, value.length - 1));
        return;
      }

      if (value.length < 2) {
        return;
      }

      if (this.isRuc10) {
        this.setRUC10Validators();
        return;
      }

      this.setRUC20Validators();
    });

    this.basicDataFormControl['phoneNumber'].valueChanges.subscribe((value: string): void => {
      if (!value) {
        return;
      }

      if (this.basicDataFormControl['phoneNumber'].hasError('pattern') ||
        +value.slice(0, 1) != 9) {
        this.basicDataFormControl['phoneNumber'].setValue(value.slice(0, value.length - 1));
      }
    });

    this.basicDataFormControl['channelType'].valueChanges.subscribe((value: string): void => {
      this.basicDataFormControl['associatedChannel'].setValue('');
      this.basicDataFormControl['detail'].setValue('');
      this.supplementaryDataFormControl['stockProvider'].setValue('');
      this.subChannelSelected = {};

      this.validateDataSubChannel();

      this.getStockProviderListAndAssociatedChannelList(this.applyAssociatedChannel);
    });

    this.basicDataFormControl['department'].valueChanges.subscribe((value: string): void => {
      if (this.basicDataFormControl['department'].dirty) {
        this.basicDataFormControl['province'].setValue('');
      }

      if (!value) {
        this.provinceList$ = [];
        return;
      }

      this.provinceList$ = this.departmentList$.find((dep: IDepartamentoModel): boolean => dep.id == +value).provincias;
    });

    this.basicDataFormControl['province'].valueChanges.subscribe((value: string): void => {
      if (this.basicDataFormControl['province'].dirty) {
        this.basicDataFormControl['district'].setValue('');
      }

      if (!value) {
        this.districtList$ = [];
        return;
      }

      this.districtList$ = this.provinceList$.find((dep: IProvinciaModel): boolean => dep.idProvincia == +value).distritos;
    });

    this.basicDataFormControl['names'].valueChanges.subscribe((value: string): void => {
      if (this.basicDataFormControl['names'].hasError('pattern')) {
        this.basicDataFormControl['names'].setValue(value.slice(0, value.length - 1));
      }
    });

    this.basicDataFormControl['paternalSurname'].valueChanges.subscribe((value: string): void => {
      if (this.basicDataFormControl['paternalSurname'].hasError('pattern')) {
        this.basicDataFormControl['paternalSurname'].setValue(value.slice(0, value.length - 1));
      }
    });

    this.basicDataFormControl['maternalSurname'].valueChanges.subscribe((value: string): void => {
      if (this.basicDataFormControl['maternalSurname'].hasError('pattern')) {
        this.basicDataFormControl['maternalSurname'].setValue(value.slice(0, value.length - 1));
      }
    });
  }

  /**
   * The searchChannelFormValidations function is used to validate the searchChannelFormControl form.
   * It validates the documentNumber field by checking if it has an error of type pattern, and if so,
   * it sets its value to be equal to itself minus its last character. This prevents users from entering invalid characters into this field.
   * @return Void
   */
  private searchChannelFormValidations(): void {
    this.searchChannelFormControl['documentNumber'].valueChanges.subscribe((value: string) => {
      if (!value) {
        return;
      }

      if (this.searchChannelFormControl['documentNumber'].hasError('pattern')) {
        this.searchChannelFormControl['documentNumber'].setValue(value.slice(0, value.length - 1));
      }
    });
  }

  private formSubChannelValidations(): void {
    this.formSubChannel.valueChanges.subscribe((): void => {
      this.subChannelSelected = {};
      this.listDataSubChannel$ = [];
    });

    this.formSubChannelControl['searchType'].valueChanges.subscribe((value: string): void => {
        this.formSubChannelControl['documentNumber'].setValue('');
        this.formSubChannelControl['legalName'].setValue('');
    })

    this.formSubChannelControl['documentNumber'].valueChanges.subscribe((value: string): void => {
        if (!value) {
          return;
        }
        
        if (
            this.formSubChannelControl['documentNumber'].hasError('pattern') ||
            this.formSubChannelControl['documentNumber'].hasError('maxlength')
          ) {
            this.formSubChannelControl['documentNumber'].setValue(
              value.slice(0, value.length - 1)
            );
          }
        }
      );
  }

  private validateDataSubChannel(): void {
    if (this.isSubChannel) {

      this.basicDataFormControl['documentNumber'].setValue('')
      this.basicDataFormControl['legalName'].setValue('')
      this.basicDataFormControl['documentNumber'].disable({ emitEvent: false }); 
      this.basicDataFormControl['legalName'].disable({ emitEvent: false }); 
      
      this.basicDataFormControl['detail'].setValidators([
            Validators.required
          ]);
      this.basicDataFormControl['detail'].updateValueAndValidity();

      this.basicDataFormControl['associatedChannel'].setValidators([
        Validators.required
      ]);
      this.basicDataFormControl['associatedChannel'].updateValueAndValidity();
      
      this.basicDataFormControl['department'].clearValidators();
      this.basicDataFormControl['department'].updateValueAndValidity();
      this.basicDataFormControl['province'].clearValidators();
      this.basicDataFormControl['province'].updateValueAndValidity();
      this.basicDataFormControl['district'].clearValidators();
      this.basicDataFormControl['district'].updateValueAndValidity();
      this.basicDataFormControl['contact'].clearValidators();
      this.basicDataFormControl['contact'].updateValueAndValidity();
      this.basicDataFormControl['phoneNumber'].clearValidators();
      this.basicDataFormControl['phoneNumber'].updateValueAndValidity();
      this.basicDataFormControl['address'].clearValidators();
      this.basicDataFormControl['address'].updateValueAndValidity();
      this.basicDataFormControl['email'].clearValidators();
      this.basicDataFormControl['email'].updateValueAndValidity();

    } else {
        this.basicDataFormControl['documentNumber'].enable({ emitEvent: false }); 
        this.basicDataFormControl['legalName'].enable({ emitEvent: false }); 

        this.basicDataFormControl['detail'].clearValidators();
        this.basicDataFormControl['detail'].updateValueAndValidity();
        this.basicDataFormControl['department'].setValidators([Validators.required]);
        this.basicDataFormControl['department'].updateValueAndValidity();
        this.basicDataFormControl['province'].setValidators([Validators.required]);
        this.basicDataFormControl['province'].updateValueAndValidity();
        this.basicDataFormControl['district'].setValidators([Validators.required]);
        this.basicDataFormControl['district'].updateValueAndValidity();
        this.basicDataFormControl['contact'].setValidators([Validators.required]);
        this.basicDataFormControl['contact'].updateValueAndValidity();
        this.basicDataFormControl['phoneNumber'].setValidators([
            Validators.required,
            ...this.PHONE_NUMBER_VALIDATORS
          ]);
        this.basicDataFormControl['phoneNumber'].updateValueAndValidity();
        this.basicDataFormControl['address'].setValidators([
            Validators.required,
            Validators.maxLength(80)
          ]);
        this.basicDataFormControl['address'].updateValueAndValidity();
        this.basicDataFormControl['email'].setValidators([
            Validators.required,
            Validators.pattern(RegularExpressions.email)
          ]);
        this.basicDataFormControl['email'].updateValueAndValidity();
        this.basicDataFormControl['associatedChannel'].clearValidators();
        this.basicDataFormControl['associatedChannel'].updateValueAndValidity();

        if(this.applyAssociatedChannel) {
          this.basicDataFormControl['associatedChannel'].setValidators([
            Validators.required
          ]);
          this.basicDataFormControl['associatedChannel'].updateValueAndValidity();
        }
      }
  }

  /**
   * The setRUC20Validators function sets the validators for the basicDataFormControl object's legalName,
   * names, paternalSurname and maternalSurname properties.
   * The legalName property is set to have a required validator and a maxLength of MAX_LENGTH_LEGAL_NAME
   * (which is defined in constants.ts).
   * The names, paternalSurname and maternalSurname properties are cleared of any existing validators.
   * @return void
   */
  private setRUC20Validators(): void {

    if (!this.isSubChannel) {
        this.resetNames();
      }

    this.basicDataFormControl['legalName'].setValidators([
      Validators.required,
      Validators.maxLength(this.MAX_LENGTH_ALLOWED.LEGAL_NAME)
    ]);
    this.basicDataFormControl['names'].clearValidators();
    this.basicDataFormControl['paternalSurname'].clearValidators();
    this.basicDataFormControl['maternalSurname'].clearValidators();

    this.basicDataFormControl['legalName'].updateValueAndValidity();
    this.basicDataFormControl['names'].updateValueAndValidity();
    this.basicDataFormControl['paternalSurname'].updateValueAndValidity();
    this.basicDataFormControl['maternalSurname'].updateValueAndValidity();
  }

  /**
   * The setRUC10Validators function sets the validators for the names, paternalSurname and maternalSurname fields.
   * It also clears the validators for legalName.
   * @return Void
   */
  private setRUC10Validators(): void {
    if (!this.isSubChannel) {
      this.resetNames();
    }

    this.basicDataFormControl['names'].setValidators([
      Validators.required,
      Validators.pattern(RegularExpressions.text)
    ]);
    this.basicDataFormControl['paternalSurname'].setValidators([
      Validators.required,
      Validators.pattern(RegularExpressions.text)
    ]);
    this.basicDataFormControl['maternalSurname'].setValidators([
      Validators.required,
      Validators.pattern(RegularExpressions.text)
    ]);
    this.basicDataFormControl['legalName'].clearValidators();

    this.basicDataFormControl['legalName'].updateValueAndValidity();
    this.basicDataFormControl['names'].updateValueAndValidity();
    this.basicDataFormControl['paternalSurname'].updateValueAndValidity();
    this.basicDataFormControl['maternalSurname'].updateValueAndValidity();
  }

  /**
   * The resetNames function resets the values of the names and surnames fields in
   * the basic data form.
   * @return Void
   */
  private resetNames(): void {
    if (!this.basicDataFormControl['documentNumber'].dirty) {
      return;
    }

    this.basicDataFormControl['legalName'].setValue('');
    this.basicDataFormControl['names'].setValue('');
    this.basicDataFormControl['paternalSurname'].setValue('');
    this.basicDataFormControl['maternalSurname'].setValue('');
  }

  /**
   * The getParams function is used to get the parameters from the backend.
   * @return Void
   */
  private getParams(): void {
    this.spinner.show();
    forkJoin([
      this.newRequestService.getParams('TYPE_ATTACHMENT'),
      this.newRequestService.getParams('TYPECERTIF'),
      this.newRequestService.getChannelTypes(),
      this.utilsService.parameters(),
      this.newRequestService.getProducts()
    ]).subscribe({
      next: (response: [Item[], Item[], ChannelType[], ParametersResponse, Branch[]]): void => {
        this.fileTypeList$ = response[0];
        this.certificateTypeList$ = response[1];
        this.channelTypeList$ = response[2];
        this.departmentList$ = response[3].ubigeos;
        this.branches$ = response[4];
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => this.spinner.hide()
    });
  }

  /**
   * The getStockProviderListAndAssociatedChannelList function is used
   * to get the stock provider list and associated channel list.
   * @param getProviders: boolean Determine whether to call the typeprovider function or not
   * @return A list of stock providers and a list of sales channels
   */
  private getStockProviderListAndAssociatedChannelList(getProviders: boolean): void {
    this.stockProviderList$ = [];
    this.salesChannelList$ = [];

    this.spinner.show();

    forkJoin([
      this.newRequestService.getStockProviders(+this.basicDataFormControl['channelType'].value),
      getProviders ? this.newRequestService.getChannels() : of([])
    ]).subscribe({
      next: (response: [Item[], Item[]]): void => {
        this.stockProviderList$ = response[0];
        this.salesChannelList$ = response[1];
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: (): void => {
        this.spinner.hide();
      }
    });
  }

  /**
   * The addRowBranch function adds a new row to the branchListForm FormArray.
   * @param branch?: Branch Determine if the function is being used to add a new row or edit an existing one
   * @return Void
   */
  addRowBranch(branch?: Branch): void {
    const form: FormGroup = this.builder.group({
      branch: [branch?.branchId ?? '', Validators.required],
      products: this.builder.array([])
    });
    const control: { [key: string]: AbstractControl } = form.controls;
    const array: FormArray = control['products'] as FormArray;

    control['branch'].valueChanges.subscribe((): void => {
      array.clear();
      this.addRowProduct(array);
    });

    this.branchListForm.push(form);

    if (!branch) {
      this.addRowProduct(array);
      return;
    }

    branch.products.forEach((item: Product): void => {
      this.addRowProduct(array, item);
    });
  }

  isVisibleBranchListOption(array: FormArray, control: string, value, index: number): boolean {
    return !(array.getRawValue()).some((b, i: number): boolean => b[control] == value && index != i);
  }

  /**
   * The addRowProduct function adds a new row to the formArray.
   * @param form: FormArray Add the form-product to the array of products in the form
   * @param product?: Product Pass the product to add in the form
   * @return Void
   */
  addRowProduct(form: FormArray, product?: Product): void {
    const formProduct: FormGroup = this.builder.group({
      product: [product?.idProducto ?? '', Validators.required]
    });
    form.push(formProduct);
  }

  /**
   * The removeOfFormArray function removes a FormGroup from the formArray.
   * @param formArray: FormArray Pass the formArray that we want to remove an item from
   * @param index: number Specify the index of the formArray that is being removed
   * @return Void
   */
  removeOfFormArray(formArray: FormArray, index: number): void {
    if (formArray.length == 1) {
      formArray.at(index).patchValue({
        branch: '',
        product: ''
      });
      return;
    }

    formArray.removeAt(index);
  }

  /**
   * The getProductsByBranch function returns an array of products that are associated with a specific branch
   * @param branchId: number Find the branch with the matching id
   * @return An array of products, which is assigned to the products$ property
   */
  getProductsByBranch(branchId: number): Product[] {
    if (!branchId) {
      return [];
    }

    return this.branches$.find((branch: Branch): boolean => branch.branchId == branchId).products ?? [];
  }

  /**
   * The isSoatProductSelected function returns true if the SOAT product is selected, false otherwise.
   * @return A boolean value that indicates whether the SOAT product is selected
   */
  get isSoatProductSelected(): boolean {
    const branches: any[] = this.branchListForm.getRawValue();
    return branches.some((b) => +b.branch == SOAT_BRANCH_ID && b.products.some((p): boolean => +p.product == SOAT_PRODUCT_ID));
  }

  /**
   * The addRowAttachment function adds a new attachment to the attachedDataListForm FormArray.
   * It does this by creating a new FormGroup, and pushing it into the attachedDataListForm array.
   * @return Void
   */
  addRowAttachment(fileInfo?: FileInfo): void {
    if (this.attachedDataListForm.invalid) {
      return;
    }

    const form: FormGroup = this.builder.group({
      fileType: [{ value: fileInfo?.fileType ?? '', disabled: !!fileInfo }, Validators.required],
      file: [null, fileInfo ? null : Validators.required],
      fileName: [fileInfo?.fileName ?? '', Validators.required],
      isReadOnly: [!!fileInfo]
    });
    this.attachedDataListForm.push(form);
    this.attachedFileList.push({
      ...fileInfo,
      url: fileInfo ? this.transformUrlFile(fileInfo) : ''
    });
  }

  /**
   * The transformUrlFile function takes in a FileInfo object and returns a string.
   * The returned string is the url with the fileName, fileExtension, and fileType appended to it.
   * @param { url Pass in the url of the file
   * @param fileName Name the file
   * @param fileType FileInfo Specify the type of file that is being uploaded
   * @return A string that is an url with the filename, fileExtension and filetype added to it
   */
  private transformUrlFile({ url, fileName, fileType }: FileInfo): string {
    const fileExtension: string = url.split('.').pop();
    return `${url}?${fileName}?.${fileExtension}?${fileType}`;
  }

  /**
   * The isVisibleFileTypeOptionAttachmentList function is used
   * to determine whether a file type option should be visible in the dropdown list of options.
   * @param array: FormArray Get the value of the form array
   * @param value Get the value of the file type option
   * @param index: number Identify the current index of the array
   * @return A boolean value
   */
  isVisibleFileTypeOptionAttachmentList(array: FormArray, value, index: number): boolean {
    return !(array.getRawValue()).some((item, i: number) => item.fileType == value && i != index);
  }

  /**
   * The downloadUploadedFile function is used to download a file from the server.
   * @param form: FormGroup of selectedRow
   * @param index: Index of selected row attachedFileList
   * @return Void
   */
  downloadUploadedFile(form: FormGroup, index: number): void {
    this.spinner.show();

    const { url } = this.attachedFileList[index];
    const fileName = form.get('fileName').value;
    const apiUrl: string = `${AppConfig.BACKOFFICE_API}/${url}`;

    this.utilsService.callApiUrl(apiUrl).subscribe({
      next: (response) => {
        const fileInfo = {
          fileName,
          fileBase64: response.archivo
        };
        this.utilsService.downloadFile(fileInfo);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => this.spinner.hide()
    });
  }

  /**
   * The removeAttachedFile function removes the last attached file from the form.
   * @return Void
   */
  removeAttachedFile(): void {
    if (this.attachedDataListForm.length == 1) {
      const form: FormGroup = (this.attachedDataListForm.controls[0] as FormGroup);
      form.patchValue({
        fileType: '',
        file: null,
        fileName: '',
        isReadOnly: false
      });
      form.enable({ emitEvent: false });
      return;
    }

    this.attachedDataListForm.removeAt(this.attachedDataListForm.length - 1);
    this.attachedFileList.pop();
  }

  /**
   * The onChangeFileType function is called when the user changes the file type of file in the attachedFileList.
   * It updates that specific element in attachedFileList with its new value.
   * @param form: FormGroup Access the form controls
   * @param index: number Identify which file is being uploaded
   */
  onChangeFileType(form: FormGroup, index: number): void {
    const control: { [key: string]: AbstractControl } = form.controls;

    this.attachedFileList[index] = {
      ...this.attachedFileList[index],
      fileType: control['fileType'].value
    };
  }

  /**
   * The addCreditLine function adds a new credit line to the form.
   * @return Void, so I don't know why it is returning a value
   */
  addRowCreditLine(stockInfo?: StockInfo): void {
    if (this.creditLineDataListForm.invalid) {
      return;
    }

    const stockValidators = [
      Validators.required,
      Validators.pattern(RegularExpressions.numbers),
      Validators.min(0),
      Validators.max(999999)
    ];

    const hasDigitalCertificateTypeCreditLineList: boolean = (this.creditLineDataListForm.getRawValue())
      .some((item): boolean => item.certificateType == '7');

    const form: FormGroup = this.builder.group({
      certificateType: [stockInfo?.policyType ?? (!hasDigitalCertificateTypeCreditLineList ? '7' : ''), Validators.required],
      maxStock: [stockInfo?.maxStock ?? '', stockValidators],
      minStock: [{ value: stockInfo?.minStock, disabled: !stockInfo?.minStock }, stockValidators],
      currentStock: [{ value: stockInfo?.currentStock, disabled: !stockInfo?.currentStock }, stockValidators]
    });
    const formControl: { [key: string]: AbstractControl } = form.controls;

    formControl['maxStock'].valueChanges.subscribe((value: string): void => {
      formControl['minStock'].setValue('', { emitEvent: false });
      formControl['currentStock'].setValue('', { emitEvent: false });

      if (!value) {
        formControl['minStock'].disable({ emitEvent: false });
        formControl['currentStock'].disable({ emitEvent: false });
        return;
      }

      if (formControl['maxStock'].hasError('max') ||
        formControl['maxStock'].hasError('pattern')) {
        formControl['maxStock'].setValue(value.slice(0, value.length - 1));
        return;
      }

      formControl['minStock'].enable({ emitEvent: false });

      formControl['minStock'].setValidators([
        ...stockValidators,
        Validators.max(+value)
      ]);
      formControl['currentStock'].setValidators([
        ...stockValidators,
        Validators.min(+formControl['minStock'].value),
        Validators.max(+value)
      ]);

      formControl['minStock'].updateValueAndValidity({ emitEvent: false });
      formControl['currentStock'].updateValueAndValidity({ emitEvent: false });
    });
    formControl['minStock'].valueChanges.subscribe((value: string): void => {
      formControl['currentStock'].setValue('', { emitEvent: false });

      if (!value) {
        formControl['currentStock'].disable({ emitEvent: false });
        return;
      }

      if (formControl['minStock'].hasError('max') ||
        formControl['minStock'].hasError('pattern')) {
        formControl['minStock'].setValue(value.slice(0, value.length - 1));
        return;
      }

      formControl['currentStock'].enable({ emitEvent: false });

      formControl['currentStock'].setValidators([
        ...stockValidators,
        Validators.min(+value),
        Validators.max(+formControl['maxStock'].value)
      ]);

      formControl['currentStock'].updateValueAndValidity({ emitEvent: false });
    });
    formControl['currentStock'].valueChanges.subscribe((value: string): void => {
      if (!value) {
        return;
      }

      if (formControl['currentStock'].hasError('max') ||
        formControl['currentStock'].hasError('pattern')) {
        formControl['currentStock'].setValue(value.slice(0, value.length - 1));
      }
    });

    this.creditLineDataListForm.push(form);
  }

  /**
   * The isVisibleCertificateTypeOptionCreditLineList function is used to determine whether the certificateType option
   * should be visible in the dropdown list of options for a given credit line.
   * The function returns true if and only if there
   * are no other credit lines with the same certificateType as this one, and false otherwise.
   * This ensures that each certificate type
   * can only be selected once per-form submission.
   * @param array: FormArray Get the value of the certificateType
   * @param value Get the value of the certificateType field in the form
   * @param index: number Get the index of the current item in the array
   * @return True if the certificateType is not in the array
   */
  isVisibleCertificateTypeOptionCreditLineList(array: FormArray, value, index: number): boolean {
    return !(array.getRawValue()).some((item, i: number) => item.certificateType == value && i != index);
  }

  /**
   * The removeCreditLine function removes the last credit line from the form.
   * @return Void
   */
  removeCreditLine(): void {
    if (this.creditLineDataListForm.length == 1) {
      const form: FormGroup = (this.creditLineDataListForm.controls[0] as FormGroup);
      form.patchValue({
        certificateType: '7',
        maxStock: '',
        minStock: '',
        currentStock: ''
      });
      return;
    }

    this.creditLineDataListForm.removeAt(this.creditLineDataListForm.length - 1);
  }

  /**
   * The onAttachedFile function is called when a user attaches a file to the form.
   * @param e: any Get the file from the input element
   * @param index: number Determine which form in the array of forms is being used
   * @return Void
   */
  onAttachedFile(e: any, index: number): void {
    if (!e?.target?.files?.length) {
      return;
    }

    const file = e?.target?.files[0];

    this.newRequestService.saveFile(file.name, file).subscribe({
      next: (response: string): void => {
        const form: FormGroup = this.attachedDataListForm.at(index) as FormGroup;
        const formControl: { [key: string]: AbstractControl } = form.controls;
        formControl['fileName'].setValue(file.name);

        const fileInfo: FileInfo = {
          url: response,
          fileType: null,
          file
        };
        this.attachedFileList.splice(index, 1, fileInfo);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: (): void => {
        this.spinner.hide();
      }
    });
  }

  /**
   * The selectedProductDescription function returns a string containing the names of all products
   * selected in the productListForm form.
   * @return A string of the selected products
   */
  get selectedProductDescription(): string {
    const branches: any[] = this.branchListForm.getRawValue();
    return branches.map((b) => b.products?.map((p) => {
      const findBranch: Branch = this.branches$.find((br: Branch): boolean => br.branchId == b.branch);
      return (findBranch?.products ?? []).find((pr: Product): boolean => pr.idProducto == p.product)?.producto ?? '';
    })).join(', ');
  }

  /**
   * The showModalConfirmSave function is called when the user clicks on the &quot;Save&quot; button.
   * It opens a modal window that asks for confirmation before saving changes to the database.
   * @return Void
   */
  showModalConfirmSave(): void {
    if (this.formIsInValid || !this.rucIsValid) {
      this.basicDataForm.markAllAsTouched();
      this.supplementaryDataForm.markAllAsTouched();
      this.attachedDataListForm.markAllAsTouched();
      this.creditLineDataListForm.markAllAsTouched();
      return;
    }

    this.vcr.createEmbeddedView(this.modalConfirmSave);
  }

  /**
   * The hideModals function clears the modal component from the view.
   * @return Void
   */
  hideModals(): void {
    this.vcr.clear();

    if (this.response?.success) {
      this.router.navigate(['/backoffice/mantenimientos/gestion-registro']);
    }
  }

  /**
   * The onSubmit function is used to validate the document number and then submit the request.
   * @return Void, but the submit-request function returns an Observable
   */
  onSubmit(): void {
    this.spinner.show();

    const documentNumber: string = this.basicDataFormControl['documentNumber'].value;
    const requestType: string = this.requestTypeControl.value;

    this.newRequestService.validateDocumentNumber(documentNumber, requestType).subscribe({
      next: (response: boolean): void => {
        if (response || (!response && this.isSubChannel)) {
          this.saveRequest();
          return;
        }

        this.spinner.hide();
        this.response = {
          message: String.response.documentNumberExist,
          showImage: true,
          success: false
        };
        this.vcr.createEmbeddedView(this.modalResponse);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();

        this.response = {
          message: String.response.documentNumberExist,
          showImage: true,
          success: false
        };
        this.vcr.createEmbeddedView(this.modalResponse);
      }
    });
  }

  /**
   * The saveRequest function saves the request to the database.
   * @return Void
   */
  saveRequest(): void {
    const payload: SaveRequest = {
      requestType: this.requestTypeControl.value,
      basicData: this.basicDataForm.getRawValue(),
      supplementaryData: this.supplementaryDataForm.getRawValue(),
      userId: this.currentUser['id']
    };
    const attachments: FileInfo[] = this.isSoatProductSelected ? this.attachedFileList.map((info: FileInfo, index: number) => {
      const form: FormGroup = (this.attachedDataListForm.at(index) as FormGroup);
      const fileType = form.get('fileType').value;

      return {
        url: info.url.replace('[TypeFileName]', fileType),
        fileType,
        file: info.file
      };
    }) : [];

    this.newRequestService.save(payload, attachments).subscribe({
      next: async (response: boolean): Promise<void> => {
        this.hideModals();
        if (!response) {
          this.response = {
            message: String.response.save.error,
            showImage: true,
            success: false
          };

          this.vcr.createEmbeddedView(this.modalResponse);
          return;
        }

        if (this.isSoatProductSelected) {
          await this.saveCreditLine();
        }

        await this.updateAssociatedChannel();
        await this.saveProducts();

        this.response = {
          message: String.response.save.success,
          showImage: true,
          success: true
        };

        await this.spinner.hide();

        this.vcr.createEmbeddedView(this.modalResponse);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();

        this.response = {
          message: String.response.save.error,
          showImage: true,
          success: false
        };
        this.vcr.createEmbeddedView(this.modalResponse);
      }
    });
  }

  /**
   * The saveProducts function saves the products selected by the user in a new request.
   * @return A Promise<void>;
   */
  async saveProducts(): Promise<void> {
    const branches: any[] = this.branchListForm.getRawValue();
    const products: ChannelInfo[] = [];

    branches.forEach((b): void => {
      b.products.forEach((p): void => {
        products.push({
          idProducto: p.product,
          idRamo: b.branch,
          codigoCanal: this.channelInfo?.request ?? null,
          codigoUsuario: this.currentUser['id'],
          numeroDocumento: this.basicDataFormControl['documentNumber'].value
        });
      });
    });

    const payload: SaveProductRequest = {
      crearCanal: products
    };
    await this.newRequestService.saveProducts(payload).toPromise().then();
  }

  /**
   * The saveCreditLine function saves the credit line data to the database.
   * @return A promise with void type
   */
  async saveCreditLine(): Promise<void> {
    const creditLineList: any[] = this.creditLineDataListForm.getRawValue();

    const observables: Observable<boolean>[] = creditLineList.map((item) => {
      const req: SaveCreditLineRequest = {
        certificateType: item.certificateType,
        maxStock: item.maxStock,
        minStock: item.minStock,
        currentStock: item.currentStock,
        userId: this.currentUser.id,
        documentNumber: this.basicDataFormControl['documentNumber'].value
      };
      return this.newRequestService.saveCreditLine(req);
    });

    await forkJoin(observables).toPromise().then();
  }

  /**
   * The updateAssociatedChannel function updates the associated channel of a client.
   * @return A void
   */
  async updateAssociatedChannel(): Promise<void> {

    if (!this.applyAssociatedChannel) {
      return;
    }

    const payload: UpdateAssociatedChannelRequest = {
      numeroDocumento: this.basicDataFormControl['documentNumber'].value,
      codigoCanalAsociado: +this.basicDataFormControl['associatedChannel'].value,
      subCanal: this.isSubChannel ? this.basicDataFormControl['detail'].value : '',
      codigoCanalEditado: this.requestTypeControl.value === this.REQUEST_TYPE.EDIT_CHANNEL ? this.channelInfo.request : '',
    };

    await this.newRequestService.updateAssociatedChannel(payload).toPromise().then();
  }

  /**
   * The showModalSearchChannelOrPointSale function is used to show the modal search channel or point sale.
   * @return  Void
   */
  showModalSearchChannelOrPointSale(): void {
    switch (this.requestTypeControl.value) {
      case RequestType.EDIT_POINT_SALE: {
        break;
      }
      default: {
        this.vcr.createEmbeddedView(this.modalSearchChannel);
      }
    }
  }

  showModalSearchChannel(): void {
    this.vcr.createEmbeddedView(this.modalSearchChannel);
  }

  showModalSubChannel(): void {
    this.formSubChannelControl['searchType'].setValue(this.SEARCH_TYPES.DOCUMENT);
    this.formSubChannelControl['documentNumber'].setValue('');
    this.formSubChannelControl['legalName'].setValue('');

    this.vcr.createEmbeddedView(this.modalSubChannel);
  }

  hideModalSubChannel(): void {
    this.vcr.clear();
  }

  /**
   * The searchChannel function is used to search for a channel.
   * @return Void
   */
  searchChannel(): void {
    this.spinner.show();
    const payload = {
      currentPage: this.searchChannelCurrentPage,
      documentNumber: this.searchChannelFormControl['documentNumber'].value,
      legalName: this.searchChannelFormControl['legalName'].value
    };
    this.newRequestService.searchChannel(payload).subscribe({
      next: (response: SearchChannelResponse): void => {
        this.searchChannelTotalItems = response.totalRows;
        this.searchChannelList$ = response.items;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => this.spinner.hide()
    });
  }

  /**
   * The selectChannel function is called when the user clicks on a channel in the search results.
   * It sets this.channelInfo to be equal to the selected channel, which will cause that channel's information
   * to be displayed in the main view of our app.
   * @param channel: SearchChannelInfo Pass the channel object to the selectChannel function
   * @return Void
   */
  selectChannel(channel: SearchChannelInfo): void {
    this.channelInfo = channel;
  }

  /**
   * The cancelSearchChannel function removes the search channel modal from the DOM,
   * resets all of its variables to their default values, and clears out any data in the form.
   * @return Void, so it doesn't return anything
   */
  hideModalSearChannel(isCancel: boolean = true): void {
    this.vcr.remove();

    if (isCancel) {
      this.channelInfo = undefined;
    }

    this.searchChannelTotalItems = 0;
    this.searchChannelCurrentPage = 1;
    this.searchChannelList$ = [];
    this.searchChannelForm.patchValue({
      documentNumber: '',
      legalName: ''
    });
  }

  /**
   * The searchChannelPageChange function is called when the user clicks on a page number in the pagination component.
   * It sets the searchChannelCurrentPage variable to be equal to whatever page number was clicked, and then calls
   * searchChannel() so that it will display results for that new current page.
   * @param currentPage: number Set the current page to the number that is passed in
   * @return Nothing
   */
  searchChannelPageChange(currentPage: number): void {
    this.searchChannelCurrentPage = currentPage;
    this.searchChannel();
  }

  /**
   * The acceptSelectChannel function is used to accept the selected channel and fill in the form with its data.
   * @return Void, so the subscribe function will return void too
   */
  acceptSelectChannel(): void {
    this.spinner.show();

    const channel: string = this.channelInfo.request;
    const productsOfChannelPayload = {
      numeroSolicitud: null,
      codigoCanal: channel
    };
    forkJoin([
      this.newRequestService.requestInfo(channel),
      this.newRequestService.getAttachmentList(channel),
      this.newRequestService.getCreditLineList(channel),
      this.newRequestService.getProductsOfChannel(productsOfChannelPayload)
    ]).subscribe({
      next: (response: [RequestInfoResponse, any[], StockInfo[], Branch[]]): void => {
        this.requestInfo = response[0];
        this.basicDataForm.patchValue(this.requestInfo);
        this.basicDataFormControl['documentNumber'].disable({ emitEvent: false });

        if (this.isSubChannel) {
          this.basicDataFormControl['legalName'].disable({ emitEvent: false });
          
          if(this.requestTypeControl.value === this.REQUEST_TYPE.EDIT_CHANNEL) {
            this.basicDataFormControl['channelType'].disable({ emitEvent: false });
          } 
        } else {
          this.basicDataFormControl['channelType'].enable({ emitEvent: false });
        }

        const { startValidity, endValidity, stockProvider, distributionType } = this.requestInfo;
        this.supplementaryDataForm.patchValue({
          startValidity,
          endValidity,
          stockProvider,
          distributionType
        });

        if (response[1].length) {
          this.attachedDataListForm.clear();
          this.attachedFileList = [];

          response[1].forEach((item: FileInfo): void => {
            this.addRowAttachment(item);
          });
        }

        if (response[2].length) {
          this.creditLineDataListForm.clear();
          response[2].forEach((item: StockInfo): void => {
            this.addRowCreditLine(item);
          });
        }
        
        this.branchListForm.clear();
        this.addRowBranch();

        if (response[3].length) {
          this.branchListForm.clear();
          response[3].forEach((item: Branch): void => {
            this.addRowBranch(item);
          });

          if (this.applyAssociatedChannel) {
            this.basicDataFormControl['associatedChannel'].setValue(response[3][0].associatedChannel ?? '');
            this.basicDataFormControl['detail'].setValue(response[3][0].detailSubChannel ?? '');

            if(this.requestTypeControl.value === this.REQUEST_TYPE.EDIT_CHANNEL) {
              this.basicDataFormControl['associatedChannel'].disable({ emitEvent: false });
            } else {
              this.basicDataFormControl['associatedChannel'].enable({ emitEvent: false });
            }
            
          }
        }

        this.hideModalSearChannel(false);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
        this.hideModalSearChannel(true);
      },
      complete: () => {
        this.spinner.hide();
      }
    });
  }

  getDocumentInfo(token: string): void {
    if (this.formSubChannel.invalid || (!this.formSubChannelControl['documentNumber'].value &&
      this.formSubChannelControl['searchType'].value == this.SEARCH_TYPES.DOCUMENT)) {
      return;
    }

    this.currentPageListSubchannel = 1;

    const payload: IDocumentInfoClientRequest = {
      idRamo: 100,
      idProducto: 1,
      idTipoDocumento: this.formSubChannelControl['documentType'].value,
      numeroDocumento:
        this.formSubChannelControl['documentNumber'].value.toUpperCase(),
      idUsuario: this.currentUser['id'],
      token: token,
    };

    this.spinner.show();
    this.utilsService.documentInfoClientResponse(payload).subscribe({
      next: (response: DocumentInfoResponseModel): void => {

        if (!response.success) {
          this.listDataSubChannel$ = [];
          return;
        }
        const responseTransform = {
          ...response,
          legalName:
            this.formSubChannelControl['documentType'].value == 1
              ? response.legalName
              : `${response.names ?? ''} ${response.apePat ?? ''} ${
                response.apeMat ?? ''
              }`.trim()
        };

        this.listDataSubChannel$ = [responseTransform];

        if (this.listDataSubChannel$.length == 1) {
          this.clientCodeSubChannelControl.setValue(
            this.listDataSubChannel$[0].clientCode
          );
          this.onChangeSelectSubChannel(this.listDataSubChannel$[0]);
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: (): void => {
        this.spinner.hide();
        this.recaptcha.reset();
      }
    });
  }

  searchDocumentByNames(): void {
    this.listDataSubChannel$ = [];
    this.spinner.show();
    const payload = {
      nombres: null,
      apellidoPaterno: null,
      apellidoMaterno: null,
      razonSocial: this.formSubChannelControl['legalName'].value || null,
      idUsuario: +this.currentUser['id']
    };
    this.utilsService.searchDocumentByNames(payload).subscribe({
      next: (response: any[]): void => {

        this.listDataSubChannel$ = response
          .map((obj: any) => ({
            clientCode: obj.CodigoCliente,
            documentType: +obj.IdTipoDocumento,
            documentNumber: obj.NumeroDocumento,
            legalName: obj.RazonSocial,
            names: obj.Nombre,
            apePat: obj.ApellidoPaterno,
            apeMat: obj.ApellidoMaterno
          }))
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: (): void => {
        this.spinner.hide();
      }
    });
  }

  onChangeSelectSubChannel(item: any): void {
    this.subChannelSelected = {
      id: item.clientCode,
      legalName: item.legalName,
      documentNumber: item.documentNumber,
      names: item.names,
      paternalSurname: item.apePat,
      maternalSurname: item.apeMat
    };
  }

  selectSubChannel(): void {
    this.basicDataFormControl['documentNumber'].setValue(this.subChannelSelected.documentNumber);
    this.basicDataFormControl['legalName'].setValue(this.subChannelSelected.legalName);

    if (this.isRuc10) {
      this.basicDataFormControl['names'].setValue(this.subChannelSelected.names);
      this.basicDataFormControl['paternalSurname'].setValue(this.subChannelSelected.paternalSurname);
      this.basicDataFormControl['maternalSurname'].setValue(this.subChannelSelected.maternalSurname);
    }
    this.hideModalSubChannel();
  }

  requestClientInfo() {
    if (this.formSubChannelControl['documentNumber'].valid) {
      this.recaptcha.execute();
    }
  }

  resolved(token: string) {
    if (token) {
      this.getDocumentInfo(token)
      return;
    }
  }
}
