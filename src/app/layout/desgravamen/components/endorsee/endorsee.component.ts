import {
  Component,
  OnInit,
  Input /*, ViewChild, ViewContainerRef, ComponentFactoryResolver*/,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import {
  NgbModal /*, ModalDismissReasons, NgbModalRef */,
} from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
//import { SearchContractingComponent } from '../../../broker/modal/search-contracting/search-contracting.component';

//Importación de servicios
import { ClientInformationService } from '../../../broker/services/shared/client-information.service';
import { ContractorLocationIndexService } from '../../../broker/services/maintenance/contractor-location/contractor-location-index/contractor-location-index.service';

//Importación de modelos
import { DocumentType } from '../../../broker//models/shared/client-information/document-type';
import { ClientDataToSearch } from '../../../broker/models/shared/client-information/client-data-to-search';
import { ContractorForTable } from '../../../broker/models/maintenance/contractor-location/contractor-for-table';
//import { Contractor } from '../../../../models/maintenance/contractor-location/contractor';
//import { Contractor } from 'src/app/layout/broker/models/maintenance/contractor-location/contractor';

//Datos Globales
import { CommonMethods } from '../../..//broker/components/common-methods';
import { GlobalValidators } from '../../../broker/components/global-validators';
import { ModuleConfig } from '../../../broker/components/module.config';
import { AccessFilter } from '../../../broker/components/access-filter';
import { EndorseeViewComponent } from '../../shared/components/endorsee-view/endorsee-view.component';

@Component({
  standalone: false,
  selector: 'app-endorsee',
  templateUrl: './endorsee.component.html',
  styleUrls: ['./endorsee.component.css'],
})
export class EndorseeComponent implements OnInit {
  @Input() public reference: any; //Referencia al modal creado desde el padre de este componente 'contractor-location-index' para ser cerrado desde aquí
  @Input() public contractor: any;

  currentClient = new ContractorForTable(); //Datos de cliente actual encontrado en el método firstSearch(), que será usado para el método pageChanged() que procesa la paginación

  public documentTypeList: any = []; //Lista de tipos de documento
  public isLoadingScreenNotVisible: boolean = true;
  public isValidatedInClickButton: boolean = false;

  documentNumberLength: number = 11; //Tamaño de campo de número de documento, este valor es variable
  /*
    Variables de paginación
  */
  currentPage = 1; //página actual
  rotate = true; //
  maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; //total de items encontrados
  public foundResults: any = []; //Lista de registros encontrados durante la búsqueda
  public existResults: boolean;

  // mainFormGroup:any = FormGroup;
  mainFormGroup: FormGroup;
  genericErrorMessage = ModuleConfig.GenericErrorMessage; //Mensaje de error genérico
  /*
  redirectionMessage = ModuleConfig.RedirectionMessage;
  invalidStartDateMessage = ModuleConfig.InvalidStartDateMessage;
  invalidEndDateMessage = ModuleConfig.InvalidEndDateMessage;
  invalidStartDateOrderMessage = ModuleConfig.InvalidStartDateOrderMessage;
  invalidEndDateOrderMessage = ModuleConfig.InvalidEndDateOrderMessage;
  */
  listToShow: any = [];
  listToShow2: any = [];
  listToShowAnul: any = [];
  clientNoEnd: any;
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  epsItem: any = JSON.parse(localStorage.getItem('eps'));
  variable: any = {};
  lblProducto: string = '';
  lblFecha: string = '';
  nbranch = JSON.parse(localStorage.getItem('vilpID'))['nbranch'];
  usuario = JSON.parse(localStorage.getItem('currentUser'))['id'];

  constructor(
    private modalService: NgbModal,
    private clientInformationService: ClientInformationService,
    private contractorLocationIndexService: ContractorLocationIndexService,
    private mainFormBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.mainFormGroup = new FormGroup({
      searchMode: new FormControl(),
      documentType: new FormControl(),
      personType: new FormControl(),
      documentNumber: new FormControl(),
      legalName: new FormControl(),
    });

    this.getDocumentTypeList();
    // Configuracion de las variables
    this.variable = await CommonMethods.configuracionVariables(
      this.codProducto,
      this.epsItem.NCODE
    );

    this.lblProducto = CommonMethods.tituloProducto(
      this.variable.var_nomProducto,
      this.epsItem.SNAME
    );
    this.lblFecha = CommonMethods.tituloPantalla();
    if (
      AccessFilter.hasPermission(
        ModuleConfig.ViewIdList['contractor_location']
      ) == false
    )
      this.router.navigate(['/extranet/home']);
    this.createForm();
    this.initializeForm();
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params.Sender != null && params.Sender == 'add-contractor') {
        this.mainFormGroup.controls.searchMode.patchValue('1');
        this.mainFormGroup.controls.documentType.patchValue(
          params.DocumentType
        );
        this.changeValidators();
        this.mainFormGroup.controls.documentNumber.patchValue(
          params.DocumentNumber
        );

        this.firstSearch();
      } else {
        this.listarTodo();
      }
    });

    // if (this.mainFormGroup.controls.P_NIDDOC_TYPE != undefined &&
    //   this.mainFormGroup.controls.P_SIDDOC != undefined &&
    //   this.mainFormGroup.controls.P_NIDDOC_TYPE != '' &&
    //   this.mainFormGroup.controls.P_SIDDOC != '' &&
    //   this.receiverApp != undefined
    //   && this.receiverApp != '') {
    //   if (this.mainFormGroup.controls.P_NIDDOC_TYPE == 1 && this.mainFormGroup.controls.P_SIDDOC.trim().length > 1) {
    //     if (CommonMethods.validateRuc(this.mainFormGroup.controls.P_SIDDOC)) {
    //       swal.fire('Información', 'El número de RUC no es válido, debe empezar con 10, 15, 17, 20', 'error');
    //       return;
    //     }
    //   }
  }

  /**
   * Evento que se dispara al presionar una tecla en el campo Número de Documento y restringe el ingreso según el tipo de documento
   * @param event datos del evento KeyPress
   */

  documentNumberKeyPress(event: any, documentType: string) {
    if (this.mainFormGroup.controls.documentType.value == '') return;
    CommonMethods.validarNroDocumento(event, documentType);
  }

  openContractorModal(item: any) {
    let detalle = item.cod_detalle;
    let nrodoc = item.documento;
    if (detalle != '0') {
      this.foundResults = [];

      this.existResults = false;

      let data = new ClientDataToSearch();
      data.P_TipOper = 'CON';
      data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
      data.P_NIDDOC_TYPE = '1';
      data.P_SIDDOC = nrodoc.trim();

      this.clientInformationService.getCliente360(data).subscribe(
        async (res) => {
          let self = this;

          this.currentClient.Id = res.EListClient[0].P_SCLIENT;
          this.currentClient.DocumentNumber = res.EListClient[0].P_SIDDOC;

          this.currentClient.LocationDescription = '';
          this.currentClient.LocationStatus = '';
          this.currentClient.LocationType = '';

          if (
            res.EListClient[0].EListAddresClient != null &&
            res.EListClient[0].EListAddresClient.length > 0
          )
            this.currentClient.Address =
              res.EListClient[0].EListAddresClient[0].P_SDESDIREBUSQ;
          else this.currentClient.Address = '';

          if (
            res.EListClient[0].EListPhoneClient != null &&
            res.EListClient[0].EListPhoneClient.length > 0
          )
            this.currentClient.Phone =
              res.EListClient[0].EListPhoneClient[0].P_SPHONE;
          else this.currentClient.Phone = '';

          if (
            res.EListClient[0].EListEmailClient != null &&
            res.EListClient[0].EListEmailClient.length > 0
          )
            this.currentClient.Email =
              res.EListClient[0].EListEmailClient[0].P_SE_MAIL;
          else this.currentClient.Email = '';

          if (res.EListClient[0].P_NIDDOC_TYPE == '1') {
            this.currentClient.DocumentType = res.EListClient[0].P_NIDDOC_TYPE;
            this.currentClient.FullName = res.EListClient[0].P_SLEGALNAME;
          } else {
            if (this.documentTypeList.length > 0) {
              this.documentTypeList.map(function (item) {
                if (item.Id == res.EListClient[0].P_NIDDOC_TYPE)
                  self.currentClient.DocumentType = item.Name;
              });
            }
          }

          var contractor = {
            tipo_documento: this.currentClient.DocumentType,
            documento: this.currentClient.DocumentNumber,
            nombre_legal: this.currentClient.FullName,
            cod_proveedor: item.cod_proveedor,
            cod_tabla: item.cod_tabla,
            cod_detalle: detalle,
            cod_cliente: this.currentClient.Id,
            address: this.currentClient.Address,
            email: this.currentClient.Email,
            phone: this.currentClient.Phone,
            indicador: '1',
            ins_update: 'Modificar',
            descripcionTp: item.descripcionTp,
            descripcionCp: item.descripcionCp,
            cod_voucher: item.cod_voucher,
          };

          const modalRef = this.modalService.open(EndorseeViewComponent, {
            size: 'lg',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: false,
          });
          modalRef.componentInstance.reference = modalRef;
          modalRef.componentInstance.contractor = contractor;

          modalRef.result.then(
            (shouldReload) => {
              if (shouldReload == 'Cerrar') {
                this.currentPage = 1;
                this.processPageChanged();
                this.listar();
              }
            },
            (reason) => {}
          );
        },
        (err) => {
          Swal.fire('Información', err.statusText, 'warning');
        }
      );
    } else {
      const modalRef = this.modalService.open(EndorseeViewComponent, {
        size: 'lg',
        backdropClass: 'light-blue-backdrop',
        backdrop: 'static',
        keyboard: false,
      });
      modalRef.componentInstance.reference = modalRef;
      modalRef.componentInstance.contractor = item;

      modalRef.result.then(
        (shouldReload) => {
          if (shouldReload == 'Cerrar') {
            this.currentPage = 1;
            this.processPageChanged();
            this.listar();
          }
        },
        (reason) => {}
      );
    }

    //modalRef.componentInstance.listaTelefonos = this.inputsContracting.EListPhoneClient;
    //modalRef.componentInstance.item = null;
  }

  disableCommonValidators() {
    this.mainFormGroup.controls.documentNumber.setValidators(null);
    this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
    this.mainFormGroup.controls.legalName.setValidators(null);
    this.mainFormGroup.controls.legalName.updateValueAndValidity();
  }

  cleanValidators() {
    this.isValidatedInClickButton = false;
  }
  cleanInputs() {
    this.mainFormGroup.controls.documentNumber.patchValue(null);
    this.mainFormGroup.controls.legalName.patchValue(null);
  }

  changeValidators() {
    let response = CommonMethods.selTipoDocumento(
      this.mainFormGroup.controls.documentType.value
    );
    //console.log("response.maxlength", response.maxlength)
    this.documentNumberLength = response.maxlength;

    this.disableCommonValidators();
    this.cleanInputs();
    this.isValidatedInClickButton = false;
    if (this.mainFormGroup.controls.searchMode.value == '1') {
      if (this.mainFormGroup.controls.documentType.value == '2') {
        //modo: Por documento, tipodoc:dni
        this.mainFormGroup.controls.documentNumber.setValidators([
          Validators.required,
          Validators.maxLength(8),
          Validators.minLength(8),
          Validators.pattern(GlobalValidators.getDniPattern()),
          GlobalValidators.notAllCharactersAreEqualValidator,
        ]);
        this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
      } else if (this.mainFormGroup.controls.documentType.value == '1') {
        //Ruc
        this.mainFormGroup.controls.documentNumber.setValidators([
          Validators.required,
          Validators.maxLength(11),
          Validators.minLength(11),
          GlobalValidators.rucNumberValidator20,
        ]);
        this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
      } else if (
        this.mainFormGroup.controls.documentType.value == '4' ||
        this.mainFormGroup.controls.documentType.value == '6'
      ) {
        //ce o pasaporte
        this.mainFormGroup.controls.documentNumber.setValidators([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(12),
          Validators.pattern(GlobalValidators.getCePattern()),
        ]);
        this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
      } else {
        //otros tipos de documento
        this.mainFormGroup.controls.documentNumber.setValidators([
          Validators.required,
          Validators.maxLength(15),
        ]);
        this.mainFormGroup.controls.documentNumber.updateValueAndValidity();
      }
    } else {
      if (this.mainFormGroup.controls.personType.value == '1') {
        //console.log('valida', 'nombres');
        this.mainFormGroup.controls['legalName'].setValidators([
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(60),
          Validators.pattern(GlobalValidators.getLegalNamePattern()),
        ]);
        this.mainFormGroup.controls.legalName.updateValueAndValidity();
      } else {
      }
    }
  }

  private createForm() {
    this.mainFormGroup = this.mainFormBuilder.group({
      documentNumber: [
        '',
        [
          Validators.required,
          Validators.maxLength(11),
          Validators.minLength(11),
          GlobalValidators.rucNumberValidator20,
        ],
      ],
      legalName: ['', [Validators.maxLength(60)]],
      searchMode: ['1'],
      documentType: ['1'],
      personType: ['1'],
    });
  }

  private initializeForm() {
    this.mainFormGroup.controls.searchMode.setValue('1');
    this.mainFormGroup.controls.documentType.setValue('1');
    this.mainFormGroup.controls.personType.setValue('1');
  }

  getDocumentTypeList() {
    this.clientInformationService.getDocumentTypeList(0).subscribe(
      (res) => {
        this.documentTypeList = res;
      },
      (err) => {
        Swal.fire(
          'Información',
          'Error inesperado, contáctese con soporte.',
          'warning'
        );
      }
    );
  }

  firstSearch() {
    this.isValidatedInClickButton = true;
    if (this.mainFormGroup.valid) {
      this.currentPage = 1;
      this.processFirstSearch();
    } else {
      if (
        this.mainFormGroup.controls.documentNumber.value == '' &&
        this.mainFormGroup.controls.legalName.value == ''
      ) {
        this.listar();
      } else {
        let errorList = [];
        if (this.mainFormGroup.controls.searchMode.value == '1') {
          if (this.mainFormGroup.controls.documentNumber.valid == false) {
            if (this.mainFormGroup.controls.documentNumber.hasError('required'))
              errorList.push('El número de documento es requerido.');
            else errorList.push('El nro de documento no es válido.');
          }
        } else {
          if (this.mainFormGroup.controls.personType.value == '1') {
            if (this.mainFormGroup.controls.legalName.valid == false) {
              if (this.mainFormGroup.controls.legalName.hasError('required'))
                errorList.push('La razón social es requerida.');
              else errorList.push('La razón social no es válida.');
            } else {
              if (
                this.mainFormGroup.controls.legalName.value == null ||
                this.mainFormGroup.controls.legalName.value.trim() == ''
              ) {
                this.mainFormGroup.controls.legalName.setValue('');
                errorList.push('La razón social es requerido.');
              }
            }
          }
        }

        Swal.fire('Información', this.listToString(errorList), 'error');
      }
    }
  }

  pageChanged(page: number) {
    this.currentPage = page;
    this.listToShow2 = this.foundResults.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  processPageChanged() {
    this.foundResults = [];
    this.isLoadingScreenNotVisible = false;
    this.contractorLocationIndexService
      .getContractorLocationList(
        this.currentClient.Id,
        this.itemsPerPage,
        this.currentPage
      )
      .subscribe(
        (res_2) => {
          if (res_2.P_NCODE == 0) {
            let self = this;
            res_2.GENERICLIST.forEach(function (item) {
              let row = new ContractorForTable();
              row.Id = self.currentClient.Id;
              row.DocumentNumber = self.currentClient.DocumentNumber;
              row.DocumentType = self.currentClient.DocumentType;
              row.FullName = self.currentClient.FullName;
              row.Address = self.currentClient.Address;
              row.Phone = self.currentClient.Phone;
              row.Email = self.currentClient.Email;

              row.LocationType = item.Type;
              row.LocationDescription = item.Description;
              row.LocationStatus = item.State;

              row.LocationAddress = item.Address;
              row.LocationDistrict = item.DistrictName;
              row.LocationProvince = item.ProvinceName;
              row.LocationDepartment = item.DepartmentName;
              row.LocationEconomicActivity = item.EconomicActivity;

              self.foundResults.push(row);
            });
            this.totalItems = this.foundResults.length;
            if (this.totalItems == 0) {
              this.foundResults.push(this.currentClient);
            }
            this.listToShow2 = this.foundResults.slice(
              (this.currentPage - 1) * this.itemsPerPage,
              this.currentPage * this.itemsPerPage
            );
            this.isLoadingScreenNotVisible = true;
          } else {
            Swal.fire(
              'Información',
              this.listToString(this.stringToList(res_2.P_SMESSAGE)),
              'error'
            );
            this.isLoadingScreenNotVisible = true;
          }
        },
        (err_2) => {
          this.isLoadingScreenNotVisible = true;
          Swal.fire('Información', this.genericErrorMessage, 'error');
        }
      );
  }

  async processFirstSearch() {
    //console.log("primer");
    await this.listar();
    await this.listarAnulado();
    this.foundResults = [];
    this.isLoadingScreenNotVisible = false;
    this.existResults = false;

    let data = new ClientDataToSearch();
    data.P_TipOper = 'CON';
    data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];

    if (this.mainFormGroup.controls.searchMode.value == '1') {
      data.P_NIDDOC_TYPE =
        this.mainFormGroup.controls.documentType.value.toString();
      data.P_SIDDOC = this.mainFormGroup.controls.documentNumber.value
        .toString()
        .trim();
    } else {
      if (this.mainFormGroup.controls.legalName.value.trim() != '') {
        data.P_NIDDOC_TYPE = '';
        data.P_SIDDOC = '';
        data.P_SLEGALNAME = this.mainFormGroup.controls.legalName.value
          .toString()
          .toUpperCase()
          .trim();
      } else {
        let msjError = '';
        msjError +=
          this.mainFormGroup.controls.legalName.value.trim() == ''
            ? 'La razón social es requerida. <br>'
            : '';
        this.mainFormGroup.controls.legalName.setValue(
          this.mainFormGroup.controls.legalName.value.trim() == ''
            ? ''
            : this.mainFormGroup.controls.legalName.value
        );
        this.isLoadingScreenNotVisible = true;
        Swal.fire('Información', msjError, 'error');
        return;
      }
    }

    //console.log("la data que envia", data)

    this.clientInformationService.getCliente360(data).subscribe(
      (res) => {
        let self = this;

        if (res.P_NCODE == 0) {
          if (res.EListClient != null && res.EListClient.length > 0) {
            if (res.EListClient[0].P_SCLIENT != null) {
              if (res.EListClient[0].P_SIDDOC != null) {
                this.currentClient.Id = res.EListClient[0].P_SCLIENT;
                this.currentClient.DocumentNumber = res.EListClient[0].P_SIDDOC;

                this.currentClient.LocationDescription = '';
                this.currentClient.LocationStatus = '';
                this.currentClient.LocationType = '';

                if (
                  res.EListClient[0].EListAddresClient != null &&
                  res.EListClient[0].EListAddresClient.length > 0
                )
                  this.currentClient.Address =
                    res.EListClient[0].EListAddresClient[0].P_SDESDIREBUSQ;
                else this.currentClient.Address = '';

                if (
                  res.EListClient[0].EListPhoneClient != null &&
                  res.EListClient[0].EListPhoneClient.length > 0
                )
                  this.currentClient.Phone =
                    res.EListClient[0].EListPhoneClient[0].P_SPHONE;
                else this.currentClient.Phone = '';

                if (
                  res.EListClient[0].EListEmailClient != null &&
                  res.EListClient[0].EListEmailClient.length > 0
                )
                  this.currentClient.Email =
                    res.EListClient[0].EListEmailClient[0].P_SE_MAIL;
                else this.currentClient.Email = '';

                if (res.EListClient[0].P_NIDDOC_TYPE == '1') {
                  this.currentClient.DocumentType =
                    res.EListClient[0].P_NIDDOC_TYPE;
                  this.currentClient.FullName = res.EListClient[0].P_SLEGALNAME;
                } else {
                  if (this.documentTypeList.length > 0) {
                    this.documentTypeList.map(function (item) {
                      if (item.Id == res.EListClient[0].P_NIDDOC_TYPE)
                        self.currentClient.DocumentType = item.Name;
                    });
                  }
                }
                //Agregar

                this.contractorLocationIndexService
                  .getContractorLocationList(
                    res.EListClient[0].P_SCLIENT,
                    this.itemsPerPage,
                    this.currentPage
                  )
                  .subscribe(
                    (res_2) => {
                      if (res_2.P_NCODE == 0) {
                        if (res_2.GENERICLIST != null) {
                          res_2.GENERICLIST.forEach(function (item) {
                            let row: any = [];
                            row.Id = self.currentClient.Id;
                            row.DocumentNumber =
                              self.currentClient.DocumentNumber;
                            row.DocumentType = self.currentClient.DocumentType;
                            row.FullName = self.currentClient.FullName;
                            row.Address = self.currentClient.Address;
                            row.Phone = self.currentClient.Phone;
                            row.Email = self.currentClient.Email;

                            row.LocationDescription = item.Description;
                            row.LocationStatus = item.State;
                            row.LocationType = item.Type;

                            row.LocationAddress = item.Address;
                            row.LocationDistrict = item.DistrictName;
                            row.LocationProvince = item.ProvinceName;
                            row.LocationDepartment = item.DepartmentName;
                            row.LocalActivity = item.Activity;
                            row.LocationEconomicActivity =
                              item.EconomicActivity;

                            self.foundResults.push(row);
                          });
                          this.totalItems = this.foundResults.length;
                          if (this.totalItems == 0) {
                            this.foundResults.push(this.currentClient);
                          }

                          this.listToShow = this.foundResults.slice(
                            (this.currentPage - 1) * this.itemsPerPage,
                            this.currentPage * this.itemsPerPage
                          );
                          this.isLoadingScreenNotVisible = true;

                          var contractor = {
                            //tipo_busqueda  :  this.listToShow[0].searchMode,
                            tipo_documento: this.listToShow[0].DocumentType,
                            documento: this.listToShow[0].DocumentNumber,
                            nombre_legal: this.listToShow[0].FullName,
                            cod_proveedor: this.listToShow[0].Sclient,
                            cod_tabla: this.listToShow[0].Codtabla,
                            cod_detalle: '0',
                            cod_cliente: this.listToShow[0].Id,
                            address: this.listToShow[0].Address,
                            email: this.listToShow[0].Email,
                            phone: this.listToShow[0].Phone,
                            indicador: '1',
                            ins_update: 'Modificar',
                          };

                          if (this.listToShow2.length > 0) {
                            contractor.ins_update = 'Modificar';
                          } else {
                            if (this.listToShowAnul.length == 0) {
                              contractor.ins_update = 'Insertar';
                              Swal.fire({
                                title: 'Información',
                                text: 'El contratante no esta actualmente en la lista de endosatarios. ¿Deseas insertarlo?',
                                icon: 'question',
                                showCancelButton: true,
                                confirmButtonText: 'Aceptar',
                                cancelButtonText: 'Cancelar',
                              }).then((result) => {
                                if (result.value) {
                                  this.openContractorModal(contractor);
                                } else if (
                                  result.dismiss === Swal.DismissReason.cancel
                                ) {
                                }
                              });
                            } else {
                              Swal.fire(
                                'Información',
                                'El endosatario fue previamente anulado, por favor comunicarse con soporte.',
                                'error'
                              );
                              this.isLoadingScreenNotVisible = true;
                            }
                          }

                          //console.log("this.listToShow1 miguel", this.listToShow)
                        } else {
                          this.foundResults.push(this.currentClient);
                          this.listToShow = this.foundResults.slice(
                            (this.currentPage - 1) * this.itemsPerPage,
                            this.currentPage * this.itemsPerPage
                          );
                          this.isLoadingScreenNotVisible = true;
                          //console.log("this.listToShow2", this.listToShow)
                        }
                      } else {
                        Swal.fire(
                          'Información',
                          this.listToString(
                            this.stringToList(res_2.P_SMESSAGE)
                          ),
                          'error'
                        );
                        this.isLoadingScreenNotVisible = true;
                      }
                    },
                    (err_2) => {
                      this.isLoadingScreenNotVisible = true;
                    }
                  );
              } else {
                Swal.fire(
                  'Información',
                  'El endosatario no cuenta con el nro de documento.',
                  'error'
                );
                this.isLoadingScreenNotVisible = true;
              }
            } else {
              this.isLoadingScreenNotVisible = true;
              if (this.mainFormGroup.controls.searchMode.value == '1') {
                Swal.fire({
                  title: 'Información',
                  text: 'El endosatario que estás buscando no está registrado ¿Deseas agregarlo?',
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonText: 'Aceptar',
                  cancelButtonText: 'Cancelar',
                }).then((result) => {
                  if (result.value) {
                    this.router.navigate(['/extranet/add-contracting'], {
                      queryParams: {
                        typeDocument:
                          this.mainFormGroup.controls.documentType.value,
                        document:
                          this.mainFormGroup.controls.documentNumber.value,
                        receiver: 'mantenimiento-endosatario',
                        code: '3',
                      },
                    });
                  } else if (result.dismiss === Swal.DismissReason.cancel) {
                  }
                });
              } else {
                Swal.fire(
                  'Información',
                  'No hay información con los datos ingresados.',
                  'error'
                );
              }
            }
          } else if (res.P_NCODE == 2) {
            this.listToShow = true;
            if (this.mainFormGroup.controls.searchMode.value == '1') {
              if (
                this.mainFormGroup.controls.documentType.value.toString() !=
                  '1' &&
                this.mainFormGroup.controls.documentType.value.toString() != '2'
              ) {
                Swal.fire({
                  title: 'Información',
                  text: 'El endosatario que estás buscando no está registrado ¿Deseas agregarlo?',
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonText: 'Aceptar',
                  cancelButtonText: 'Cancelar',
                }).then((result) => {
                  if (result.value) {
                    const modalRef = this.modalService.open(
                      EndorseeViewComponent,
                      {
                        size: 'lg',
                        backdropClass: 'light-blue-backdrop',
                        backdrop: 'static',
                        keyboard: false,
                      }
                    );
                  } else if (result.dismiss === Swal.DismissReason.cancel) {
                  }
                });
              } else {
                Swal.fire(
                  'Información',
                  'No hay información con los datos ingresados.',
                  'error'
                );
              }
            } else {
              Swal.fire(
                'Información',
                'No hay información con los datos ingresados.',
                'error'
              );
            }
          }
        } else if (res.P_NCODE == 3) {
          this.isLoadingScreenNotVisible = true;
          if (this.mainFormGroup.controls.searchMode.value == '1') {
            if (
              this.mainFormGroup.controls.documentType.value.toString() == '1'
            ) {
              //&& this.mainFormGroup.controls.documentType.value.toString() != "2") {
              Swal.fire({
                title: 'Información',
                text: 'El endosatario que estás buscando no está registrado ¿Deseas agregarlo?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                cancelButtonText: 'Cancelar',
              }).then((result) => {
                if (result.value) {
                  this.router.navigate(['/extranet/add-contracting'], {
                    queryParams: {
                      typeDocument:
                        this.mainFormGroup.controls.documentType.value,
                      document:
                        this.mainFormGroup.controls.documentNumber.value,
                      receiver: 'mantenimiento-endosatario',
                      valorEndorsee: 1,
                      code: '3',
                    },
                  });
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                }
              });
            } else {
              Swal.fire(
                'Información',
                'No hay información con los datos ingresados.',
                'error'
              );
            }
          } else {
            Swal.fire(
              'Información',
              'No hay información con los datos ingresados',
              'error'
            );
          }
        } else if (res.P_NCODE == 1) {
          this.isLoadingScreenNotVisible = true;
          Swal.fire('Información', res.P_SMESSAGE, 'error'); //Error controlado
        } else {
          this.isLoadingScreenNotVisible = true;
          Swal.fire('Información', this.genericErrorMessage, 'error'); //Error controlado
        }
      },
      (err) => {
        this.isLoadingScreenNotVisible = true;
        Swal.fire(
          'Información',
          'Error inesperado, contáctese con soporte.',
          'error'
        );
      }
    );
  }

  mostrarMas() {
    this.currentPage = 1;
    this.listToShow2 = this.foundResults.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  /**
   * Convierte una lista en un texto html para ser mostrado en los pop-up de alerta
   * @param list lista ingresada
   * @returns  string en html
   */
  listToString(list: String[]): string {
    let output = '';
    if (list != null && list.length > 0) {
      list.forEach(function (item) {
        output = output + item + ' <br>';
      });
    }
    return output;
  }

  stringToList(inputString: string): string[] {
    let isFirst: Boolean = true;
    let responseList: string[] = [];
    while (inputString.search('-') != -1) {
      if (isFirst == true) {
        isFirst = false;
        inputString = inputString.substring(inputString.search('-') + 1);
      } else {
        responseList.push(inputString.substring(0, inputString.search('-')));
        inputString = inputString.substring(inputString.search('-') + 1);
      }
    }
    return responseList;
  }

  async listarTodo() {
    let data2: any = {};
    data2.tipo_busqueda = '3';
    data2.estado = '1';
    data2.ramo = this.nbranch;
    data2.tipo_documento = '1';

    await this.clientInformationService.getProviderList(data2).subscribe(
      (rest) => {
        this.foundResults = rest.providerList;
        if (this.foundResults != null && this.foundResults.length > 0) {
          this.totalItems = this.foundResults.length;
          this.listToShow2 = this.foundResults.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
          );
        } else {
          this.totalItems = 0;
        }
      },
      (err) => {
        this.foundResults = [];
        this.totalItems = 0;
        Swal.fire('Información', this.genericErrorMessage, 'error');
      }
    );
  }

  async listar() {
    let data2: any = {};
    data2.tipo_busqueda = this.mainFormGroup.controls.searchMode.value;
    data2.estado = '1';
    if (this.mainFormGroup.controls.searchMode.value == 1) {
      data2.documento = this.mainFormGroup.controls.documentNumber.value;
      data2.nombre_legal = '';
    } else {
      data2.documento = this.mainFormGroup.controls.documentNumber.value;
      data2.nombre_legal = this.mainFormGroup.controls.legalName.value.trim();
    }

    if (data2.documento == '' && data2.nombre_legal == '') {
      data2.tipo_busqueda = '3';
    }

    data2.ramo = this.nbranch;
    data2.tipo_documento = '1';

    await this.clientInformationService.getProviderList(data2).subscribe(
      (rest) => {
        this.foundResults = rest.providerList;
        if (this.foundResults != null && this.foundResults.length > 0) {
          this.totalItems = this.foundResults.length;
          this.listToShow2 = this.foundResults.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
          );
        } else {
          this.totalItems = 0;
          this.listToShow2 = [];
        }
      },
      (err) => {
        this.foundResults = [];
        this.totalItems = 0;
        Swal.fire('Información', this.genericErrorMessage, 'error');
      }
    );
    //console.log("El resultado que trae 3", this.listToShow2)
  }

  async listarAnulado() {
    let data3: any = {};
    data3.tipo_busqueda = this.mainFormGroup.controls.searchMode.value;
    data3.estado = '2';
    if (this.mainFormGroup.controls.searchMode.value == 1) {
      data3.documento = this.mainFormGroup.controls.documentNumber.value;
      data3.nombre_legal = '';
    } else {
      data3.documento = this.mainFormGroup.controls.documentNumber.value;
      data3.nombre_legal = this.mainFormGroup.controls.legalName.value.trim();
    }

    data3.ramo = this.nbranch;
    data3.tipo_documento = '1';

    await this.clientInformationService.getProviderList(data3).subscribe(
      (rest) => {
        this.foundResults = rest.providerList;
        if (this.foundResults != null && this.foundResults.length > 0) {
          this.totalItems = this.foundResults.length;
          this.listToShowAnul = this.foundResults.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
          );
        } else {
          this.totalItems = 0;
        }
      },
      (err) => {
        this.foundResults = [];
        this.totalItems = 0;
        Swal.fire('Información', this.genericErrorMessage, 'error');
      }
    );
    //console.log("El resultado que trae 3", this.listToShow2)
  }

  async EliminarEndorsee(item) {
    Swal.fire({
      icon: 'question',
      title: 'Eliminar',
      text: '¿Estás seguro de eliminar el endosatario?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
    }).then(async (result) => {
      if (!result.dismiss) {
        let data: any = {};
        //console.log("item", item)
        data.cod_cliente = item.cod_proveedor;
        data.ramo = this.nbranch;
        data.cod_usuario = this.usuario;
        data.estado = 2;

        //console.log("Eliminar", data)

        await this.clientInformationService.deltProvider(data).subscribe(
          (rest) => {
            //console.log("Endosatario Inhabilitado", rest)
            this.listar();
          },
          (err) => {
            Swal.fire('Información', err.statusText, 'warning');
          }
        );

        Swal.fire('¡Eliminado!', 'Endosatario ha sido eliminado.', 'success');
      }
    });
  }
}
