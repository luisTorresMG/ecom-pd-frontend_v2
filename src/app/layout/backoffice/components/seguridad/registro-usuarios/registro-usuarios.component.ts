import {
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  TemplateRef,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  FormArray,
} from '@angular/forms';
import { UserRegisterService } from '../../../services/seguridad/user-register.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SystemTypesModel } from '../../../models/seguridad/system-types.model';
import { ProfilesOfType } from '../../../models/seguridad/profiles/profiles-of-type.model';
import {
  IProfileResponse,
  ProfilesResponse,
} from '../../../models/seguridad/profiles/profiles.model';
import { Subject } from 'rxjs';
import { AppConfig } from '@root/app.config';
import { SecurityService } from '../../../services/seguridad/security.service';
import { SystemProductsModel } from '../../../models/seguridad/system-products.model';
import { animate, style, transition, trigger } from '@angular/animations';
import { ProductsProfileModel } from '../../../models/seguridad/products-profile.model';
import { HttpErrorResponse } from '@angular/common/http';
import * as md5 from 'md5';
import { RolesClientesModel } from '../../../models/seguridad/roles-clientes.model';
import { datePickerConfig } from '@shared/config/config';
import moment from 'moment';
import { data } from 'jquery';
import { UsuariosPro } from '../../../models/seguridad/list-userpro.model';
import { ProductProfileList } from '../../../models/seguridad/profile-product-list-model';
@Component({
  standalone: false,
  selector: 'app-registro-usuarios',
  templateUrl: './registro-usuarios.component.html',
  styleUrls: ['./registro-usuarios.component.scss'],
  animations: [
    trigger('enter', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(-20px)scale(0.98)',
        }),
        animate(
          150,
          style({
            opacity: 1,
            transform: 'translateY(0)scale(1)',
          })
        ),
      ]),
      transition(':leave', [
        animate(
          150,
          style({
            opacity: 0,
            transform: 'translateY(-20px)scale(0.98)',
          })
        ),
      ]),
    ]),
  ],
})
export class RegistroUsuariosComponent implements OnInit, AfterViewInit {
  // *FORMS
  form: FormGroup;
  userForm: FormGroup;

  formModal: FormGroup;
  // fromModal: FormGroup;

  // *VARIABLES
  systemTypes$: SystemTypesModel;
  profilesOfTypes$: ProfilesOfType;
  profiles$: ProfilesResponse;

  listUserPro$: any;

  productsProfileSOAT$: any;
  productsProfileSCTR$: any;

  // Prueba
  productsProfileVIDALEY$: any;
  productsProfileDESGRAVAMEN$: any;
  productsProfileOTROSRAMOS$: any;
  productsProfileACCIDENTESPERSONALES$: any;
  productsProfileCOVIDGRUPAL$: any;
  productsProfileVIDAGRUPO$: any;
  productsProfileVIDADEVOLUCIONPROTECTA$: any;
  productsProfileBACKOFFICE$: any;
  productsProfileQR$: any;
  productsProfileVIDAINDIVIDUALLARGOPLAZO$: any;
  productsProfileVDP$: any;
  productsProfileDESGRAVAMENDEVOLUCION$: any;
  productsProfileOPERACIONES$: any;
  productsProfileDEVOLUCIONES$: any;
  listado$: any;

  rolesClientes$: RolesClientesModel;
  canalVentaList$: any;
  productosPerfiles$: any;

  listProductosPerfiles$: any;

  listProductos$: any[];

  listPerfiles$: any[];

  systemProducts$: SystemProductsModel;

  profileSelected: IProfileResponse;

  bsConfig: any = {
    ...datePickerConfig,
    // maxDate: new Date()
  };

  clearFormEvent: Subject<any>;

  dataLocation: any; // INPUT APP-LOCATION
  dataChannels: any; // INPUT APP-CHANNEL-POINT

  private page: number;

  showListProducts: boolean;

  private timeout: any[];

  private regexp: { onlyLetters: RegExp; onlyNumbers: RegExp } = {
    onlyLetters: /^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/,
    onlyNumbers: /^\d+$/,
  };

  // Retorno del insertar usuario
  idUsuarioCliente360$: any;
  idUserProEdit$: any;
  idCliente360Edit$: any;
  message$: string;
  successAPI$: boolean;
  addSystem360$: boolean;

  // Modal Variables
  productosPerfilesModal$: [];
  systemaModal$: number;
  dataUsuarioModal$: any;
  productsModal$: string[];
  perfilesModal$: string[];
  listProductsModel$: string[];
  idUsuarioCambioContraseña$: any;
  idClienteCambioContraseña$: any;
  idSistemaCambioContraseña$: any;

  // Cambio de contraseña
  estadoUsuairo360CambioContraseña$: any;
  estadoUsuarioPDCambioContraseña$: any;

  // HABILITAR VARIABLES
  idUserHabilitar$: number;
  idClienteHabilitar$: number;
  sistemaHabilitar$: string;
  nCode$ = true;
  nombreRol$: string;
  estadoCliente360$: any;
  estadoUsuarioPD$: any;
  tituloModal$: string;
  isNewClient360$: boolean;
  lengthProductsMax$: number;
  isFillProductsProfile$: boolean;

  limitRangeDocumentNumber: { min: number; max: number };

  listProfileProducts = [];

  // validacion de Usuario
  clientExist: boolean;
  intermedClient: boolean;
  interExtra: boolean;
  perfil: number;
  supervisorDNI: string;
  responseValidate: any;
  saveData: boolean;
  subtext: string;
  showlist: boolean;
  perfilAsesor: number;
  dniEdicion: string;

  // *MODALS
  @ViewChild('modalProfile', { static: true, read: TemplateRef })
  _modalProfile: TemplateRef<any>;
  @ViewChild('modalDisableUser', { static: true, read: TemplateRef })
  _modalDisableUser: TemplateRef<any>;
  @ViewChild('modalEnableUser', { static: true, read: TemplateRef })
  _modalEnableUser: TemplateRef<any>;
  @ViewChild('modalDisableCliente', { static: true, read: TemplateRef })
  _modalDisableCliente: TemplateRef<any>;
  @ViewChild('modalEnableCliente', { static: true, read: TemplateRef })
  _modalEnableCliente: TemplateRef<any>;
  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  _modalMessage: TemplateRef<any>;
  @ViewChild('modalExistUser', { static: true, read: TemplateRef })
  _modalExistUser: TemplateRef<any>;
  @ViewChild('modalVerResumen', { static: true, read: TemplateRef })
  _modalVerResumen: TemplateRef<any>;
  @ViewChild('modalChangePassword', { static: true, read: TemplateRef })
  _modalChangePassword: TemplateRef<any>;
  constructor(
    private readonly _builder: FormBuilder,
    private readonly _spinner: NgxSpinnerService,
    private readonly _userRegisterService: UserRegisterService,
    private readonly _securityService: SecurityService,
    private readonly _vc: ViewContainerRef,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    this.timeout = new Array();
    this.systemTypes$ = new SystemTypesModel();
    this.profilesOfTypes$ = new ProfilesOfType();
    this.listado$ = [];
    this.profiles$ = new ProfilesResponse();
    this.listUserPro$ = [];
    this.systemProducts$ = new SystemProductsModel();
    this.rolesClientes$ = new RolesClientesModel();
    this.page = 0;
    this.saveData = true;
    this.clientExist = null;
    this.intermedClient = null;
    this.interExtra = null;
    this.supervisorDNI = null;
    this.perfil = null;
    this.perfilAsesor = null;
    this.dniEdicion = null;
    this.subtext = '';
    this.clearFormEvent = new Subject<any>();
    this.form = this._builder.group({
      profileType: [0],
      nombreFiltro: [null, Validators.pattern(this.regexp.onlyLetters)],
      dniFiltro: [null, Validators.pattern(this.regexp.onlyNumbers)],
      estadoFiltro: ['2'],
      canalVenta: [0],
      usuarioFiltro: [null],
    });

    this.formModal = this._builder.group({
      userChange: [null],
      passwordChange: [null, Validators.required],
      // systemTypeChange: [0, Validators.required],
    });

    this.userForm = this._builder.group({
      systemType: [null, Validators.required],
      // PROFILE - PRODUCTOS
      profileProductos: this._builder.array([]),
      perfiles: [null],
      productos: [null],
      // --------------------------------//
      products: this._builder.array([]),
      rolUsuario: [null],
      nCodeValidador: [null],
      fechaInicio: [null],
      fechaFinal: [null],
      // -------------------------------//
      soatProfile: [null],
      sctrProfile: [null],
      vidaLeyProfile: [null],
      desgravamenProfile: [null],
      otrosRamosProfile: [null],
      accidentesPersonalesProfile: [null],
      covidGrupalProfile: [null],
      vidaGrupoProfile: [null],
      vidaDevolucionProtectaProfile: [null],
      backOfficeProfile: [null],
      qrProfile: [null],
      vidaIndividualLargoPlazoProfile: [null],
      vdpProfile: [null],
      desgravamenDevolucionProfile: [null],
      operacionesProfile: [null],
      devolucionesProfile: [null],
      channelSale: [null, Validators.required],
      pointSale: [null],
      documentType: [null, Validators.required],
      documentNumber: [
        null,
        Validators.compose([
          Validators.pattern(this.regexp.onlyNumbers),
          Validators.required,
        ]),
      ],
      sex: ['1', Validators.required],
      name: [
        null,
        Validators.compose([
          Validators.pattern(this.regexp.onlyLetters),
          Validators.required,
        ]),
      ],
      apePat: [
        null,
        Validators.compose([
          Validators.pattern(this.regexp.onlyLetters),
          Validators.required,
        ]),
      ],
      apeMat: [
        null,
        Validators.compose([
          Validators.pattern(this.regexp.onlyLetters),
          Validators.required,
        ]),
      ],
      user: [
        null,
        Validators.compose([Validators.required, Validators.maxLength(20)]),
      ],
      password: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
        ]),
      ],
      department: [null, Validators.required],
      province: [null, Validators.required],
      district: [null, Validators.required],
      phone: [
        null,
        Validators.compose([
          Validators.pattern(this.regexp.onlyNumbers),
          Validators.minLength(9),
          Validators.maxLength(9),
          Validators.required,
        ]),
      ],
      email: [
        null,
        Validators.compose([
          Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN),
          Validators.required,
          Validators.maxLength(60),
        ]),
      ],
      address: [
        null,
        Validators.compose([Validators.required, Validators.maxLength(100)]),
      ],
      other: [null],
    });
  }
  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit(): void {
    this.profilesOfTypes();
    this.valueChangesForFilter();
    // this.systemTypes();
    this.rolesClientes();
    this.canalVentaList();
    this.productosPerfilesList();
    this.filtros();
    this.search(false);

    // ---------------------------------ANTIGUO PLATAFORMA DIGITAL -------------------------//
    this.uf['soatProfile'].valueChanges.subscribe((val: string) => {
      if (!val) {
        this.listProfileProducts = this.listProfileProducts.filter(
          (x) => x.idProducto != 1
        );
        return;
      }
      this.listProfileProducts.push({
        idPerfil: val,
        idProducto: 1,
      });
    });
    this.uf['sctrProfile'].valueChanges.subscribe((val: string) => {
      if (!val) {
        this.listProfileProducts = this.listProfileProducts.filter(
          (x) => x.idProducto != 2
        );
        return;
      }
      this.listProfileProducts.push({
        idPerfil: val,
        idProducto: 2,
      });
    });
    this.uf['vidaLeyProfile'].valueChanges.subscribe((val: string) => {
      if (!val) {
        this.listProfileProducts = this.listProfileProducts.filter(
          (x) => x.idProducto != 3
        );
        return;
      }
      this.listProfileProducts.push({
        idPerfil: val,
        idProducto: 3,
      });
    });
    this.uf['desgravamenProfile'].valueChanges.subscribe((val: string) => {
      if (!val) {
        this.listProfileProducts = this.listProfileProducts.filter(
          (x) => x.idProducto != 4
        );
        return;
      }
      this.listProfileProducts.push({
        idPerfil: val,
        idProducto: 4,
      });
    });
    this.uf['otrosRamosProfile'].valueChanges.subscribe((val: string) => {
      if (!val) {
        this.listProfileProducts = this.listProfileProducts.filter(
          (x) => x.idProducto != 5
        );
        return;
      }
      this.listProfileProducts.push({
        idPerfil: val,
        idProducto: 5,
      });
    });
    this.uf['accidentesPersonalesProfile'].valueChanges.subscribe(
      (val: string) => {
        if (!val) {
          this.listProfileProducts = this.listProfileProducts.filter(
            (x) => x.idProducto != 6
          );
          return;
        }
        this.listProfileProducts.push({
          idPerfil: val,
          idProducto: 6,
        });
      }
    );
    this.uf['covidGrupalProfile'].valueChanges.subscribe((val: string) => {
      if (!val) {
        this.listProfileProducts = this.listProfileProducts.filter(
          (x) => x.idProducto != 7
        );
        return;
      }
      this.listProfileProducts.push({
        idPerfil: val,
        idProducto: 7,
      });
    });
    this.uf['vidaGrupoProfile'].valueChanges.subscribe((val: string) => {
      if (!val) {
        this.listProfileProducts = this.listProfileProducts.filter(
          (x) => x.idProducto != 8
        );
        return;
      }
      this.listProfileProducts.push({
        idPerfil: val,
        idProducto: 8,
      });
    });
    this.uf['vidaDevolucionProtectaProfile'].valueChanges.subscribe(
      (val: string) => {
        if (!val) {
          this.listProfileProducts = this.listProfileProducts.filter(
            (x) => x.idProducto != 9
          );
          return;
        }
        this.listProfileProducts.push({
          idPerfil: val,
          idProducto: 9,
        });
      }
    );
    this.uf['backOfficeProfile'].valueChanges.subscribe((val: string) => {
      if (!val) {
        this.listProfileProducts = this.listProfileProducts.filter(
          (x) => x.idProducto != 10
        );
        return;
      }
      this.listProfileProducts.push({
        idPerfil: val,
        idProducto: 10,
      });
    });
    this.uf['qrProfile'].valueChanges.subscribe((val: string) => {
      if (!val) {
        this.listProfileProducts = this.listProfileProducts.filter(
          (x) => x.idProducto != 11
        );
        return;
      }
      this.listProfileProducts.push({
        idPerfil: val,
        idProducto: 11,
      });
    });
    this.uf['vidaIndividualLargoPlazoProfile'].valueChanges.subscribe(
      (val: string) => {
        if (!val) {
          this.listProfileProducts = this.listProfileProducts.filter(
            (x) => x.idProducto != 12
          );
          return;
        }
        this.listProfileProducts.push({
          idPerfil: val,
          idProducto: 12,
        });
      }
    );
    this.uf['vdpProfile'].valueChanges.subscribe((val: string) => {
      if (!val) {
        this.listProfileProducts = this.listProfileProducts.filter(
          (x) => x.idProducto != 13
        );
        return;
      }
      this.listProfileProducts.push({
        idPerfil: val,
        idProducto: 13,
      });
    });
    this.uf['desgravamenDevolucionProfile'].valueChanges.subscribe(
      (val: string) => {
        if (!val) {
          this.listProfileProducts = this.listProfileProducts.filter(
            (x) => x.idProducto != 14
          );
          return;
        }
        this.listProfileProducts.push({
          idPerfil: val,
          idProducto: 14,
        });
      }
    );
    this.uf['operacionesProfile'].valueChanges.subscribe((val: string) => {
      if (!val) {
        this.listProfileProducts = this.listProfileProducts.filter(
          (x) => x.idProducto != 15
        );
        return;
      }
      this.listProfileProducts.push({
        idPerfil: val,
        idProducto: 15,
      });
    });
    this.uf['devolucionesProfile'].valueChanges.subscribe((val: string) => {
      if (!val) {
        this.listProfileProducts = this.listProfileProducts.filter(
          (x) => x.idProducto != 16
        );
        return;
      }
      this.listProfileProducts.push({
        idPerfil: val,
        idProducto: 16,
      });
    });

    // -------------------------CONTROLADORES DEL MODAL ------------------------------------------------//
    this.uf['documentType'].valueChanges.subscribe((val: string) => {
      this.uf['documentNumber'].setValue(null);
      this.clientExist = null;
      this.intermedClient = null;
      this.perfil = null;
      this.interExtra = null;
      // if (this.uf['systemType'].value == 1) {
      this.valdiateLimitDocumentNumber(+val);
      // }
    });
    this.uf['documentNumber'].valueChanges.subscribe((val: string) => {
      if (val && this.uf['documentNumber'].hasError('pattern')) {
        this.uf['documentNumber'].setValue(val.slice(0, val.length - 1));
      }
    });
    this.uf['phone'].valueChanges.subscribe((val: string) => {
      if (!val) {
        return;
      }
      if (val.slice(0, 1) != '9' || this.uf['phone'].hasError('pattern')) {
        this.uf['phone'].setValue(val.slice(0, val.length - 1));
      }
      console.log(this.uf['phone'].value);
    });
    // Valuar los cambios del Sistema escogido
    this.uf['systemType'].valueChanges.subscribe((val: string) => {
      if (+val == 0) {
        this.uf['user'].disable();
      }
      if (+val == 1) {
        // this.uf['products'].setValidators(Validators.required);
        this.uf['profileProductos'].setValidators(Validators.required);
        this.uf['rolUsuario'].clearValidators();
        // this.uf['rolUsuario'].setValue(null);
        this.uf['products'].clearValidators();
        this.uf['fechaInicio'].clearValidators();
        // this.uf['fechaInicio'].setValue(null);
        this.uf['fechaFinal'].clearValidators();
        this.cliente360Limpiador();
        this.uf['user'].enable();
        // this.uf['fechaFinal'].setValue(null);
      }
      if (+val == 2 || +val == 3) {
        this.uf['rolUsuario'].setValidators(Validators.required);
        this.uf['products'].clearValidators();
        // this.uf['products'].setValue(null);
        this.uf['profileProductos'].clearValidators();
        // this.uf['profileProductos'].setValue(null);
        // Vacia los perfiles creo
        if (this.isNewClient360$) {
          this.profileProductos.clear();
        } else {
        }

        //
        this.uf['fechaInicio'].setValidators(Validators.required);
        this.uf['fechaFinal'].setValidators(Validators.required);
        this.uf['fechaInicio'].disable();
        this.uf['backOfficeProfile'].clearValidators();
        this.uf['user'].enable();
        /*Invalidarestos campos para el forms
                      this.uf['email'].clearValidators();
                      this.uf['department'].clearValidators();
                      this.uf['district'].clearValidators();
                      this.uf['province'].clearValidators();
                      this.uf['sex'].clearValidators();
                      this.uf['documentType'].clearValidators();
                      this.uf['documentNumber'].clearValidators();
                      this.uf['address'].clearValidators();*/
      }
      this.uf['user'].updateValueAndValidity();
      this.uf['products'].updateValueAndValidity();
      this.uf['rolUsuario'].updateValueAndValidity();
      this.uf['fechaInicio'].updateValueAndValidity();
      this.uf['fechaFinal'].updateValueAndValidity();
      this.uf['backOfficeProfile'].updateValueAndValidity();
      this.uf['profileProductos'].updateValueAndValidity();
      /*
                  this.uf['email'].updateValueAndValidity();
                  this.uf['department'].updateValueAndValidity();
                  this.uf['district'].updateValueAndValidity();
                  this.uf['province'].updateValueAndValidity();
                  this.uf['sex'].updateValueAndValidity();
                  this.uf['documentType'].updateValueAndValidity();
                  this.uf['documentNumber'].updateValueAndValidity();
                  this.uf['address'].updateValueAndValidity();*/
    });

    // INformacion de los controles del formulario insertar y modificar
    this.userForm.valueChanges.subscribe(() => {
      console.log(this.userForm.controls);
    });
    this.uf['documentNumber'].valueChanges.subscribe((val: string) => {
      console.log('1');
      if (this.uf['documentNumber'].status == 'VALID') {
        const payOne = {
          nroDocumento: val,
          tipoDocumento: '2',
        };
        this.clientExist = null;
        this.intermedClient = null;
        this.perfil = null;
        //if (this.tituloModal$ == 'Nuevo Usuario') {
        this._spinner.show();
        this.validationUser(payOne);
        // }
      }
    });
    this.uf['profileProductos'].valueChanges.subscribe((val: any) => {
      if (val.length == 1 && this.intermedClient != null) {
        if (val[0].profileId == this.perfil) {
          this.interExtra = true;
        } else {
          this.interExtra = false;
        }
      } else {
        this.intermedClient = null;
      }
      console.log(val);
      if (val.length == 1) {
        if (val[0].productId == 9) {
          switch (val[0].profileId) {
            case '191':
              {
                this.getSuperiorClass(val[0].profileId);
                this.showlist = true;
              }
              break;
            case '194':
              {
                this.getSuperiorClass(val[0].profileId);
                this.showlist = true;
              }
              break;
          }
          if (val[0].profileId != 191 && val[0].profileId != 194) {
            this.showlist = false;
          }
        } else {
          this.showlist = false;
        }
      }
    });
  }

  // (NUEVO) Evaluador de cambios Filtros
  valueChangesForFilter() {
    this.f['dniFiltro'].valueChanges.subscribe((val: string) => {
      if (this.f['dniFiltro'].hasError('pattern')) {
        this.f['dniFiltro'].setValue(val.slice(0, val.length - 1));
      }
    });

    this.f['nombreFiltro'].valueChanges.subscribe((val: string) => {
      if (this.f['nombreFiltro'].hasError('pattern')) {
        this.f['nombreFiltro'].setValue(val.slice(0, val.length - 1));
      }
    });
  }

  // Limite de Documen number
  valdiateLimitDocumentNumber(val: number) {
    switch (+val) {
      case 1:
        this.limitRangeDocumentNumber = {
          min: 8,
          max: 8,
        };
        break;
      case 2:
        this.limitRangeDocumentNumber = {
          min: 9,
          max: 9,
        };
        break;
      default:
        this.limitRangeDocumentNumber = {
          min: 8,
          max: 8,
        };
        break;
    }
    this.uf['documentNumber'].setValidators([
      Validators.pattern(this.regexp.onlyNumbers),
      Validators.required,
      Validators.minLength(this.limitRangeDocumentNumber.min),
      Validators.maxLength(this.limitRangeDocumentNumber.max),
    ]);
    this.uf['documentNumber'].updateValueAndValidity();
  }

  // Id del Usuario registrador
  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  // Funciones que permiten acceder a contorladores
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get uf(): { [key: string]: AbstractControl } {
    return this.userForm.controls;
  }

  // Funcion de los controladores para los filtros
  get ufm(): { [key: string]: AbstractControl } {
    return this.formModal.controls;
  }

  get userProducts(): FormArray {
    return this.uf['products'] as FormArray;
  }

  // (NUEVO)Obtener los perfiles y productos
  get profileProductos(): FormArray {
    return this.uf['profileProductos'] as FormArray;
  }

  // (NUEVO)Obtener los roles del usuario
  cliente360Limpiador(): void {
    this.uf['fechaFinal'].setValue(null);
    this.uf['rolUsuario'].setValue(null);
  }
  // Paginacion
  set currentPage(val) {
    this.page = val;
    this.search(true);
    // this.filtros();
  }

  get currentPage(): number {
    return this.page;
  }

  // Busacador - ANTIGUO
  search(change?: boolean): void {
    this.profiles$ = new ProfilesResponse();
    if (!change) {
      this.page = 0;
    }
    const req = {
      ...this.form.getRawValue(),
      currentPage: this.page,
    };
    this._spinner.show();
    this._userRegisterService.searchProfiles(req).subscribe(
      (res: ProfilesResponse) => {
        this.profiles$ = res;
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  // (NUEVO) Buscador - Filtros
  filtros(change?: boolean): void {
    if (!change) {
      this.page = 0;
    }
    const req = {
      ...this.form.getRawValue(),
    };
    this._spinner.show();

    // console.log('EN EL FRONT ---> ', req);
    this._userRegisterService.ListUsersPro(req).subscribe(
      (res: any) => {
        this.listUserPro$ = res;
        console.log(this.listUserPro$);
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  // Limpiar Buscador - Antiguo
  clearForm(): void {
    this.f['channelSale'].setValue(null);
    this.f['pointSale'].setValue(null);
    this.f['profile'].setValue(null);
    this.f['name'].setValue(null);
    this.f['profileType'].setValue(1);
    this.clearFormEvent.next(true);
    this.search(false);
  }

  // (NUEVO) Limpiar Formulario
  limpiarFormulario(): void {
    this.f['profileType'].setValue(0),
      this.f['nombreFiltro'].setValue(null),
      this.f['dniFiltro'].setValue(null),
      this.f['estadoFiltro'].setValue('2'),
      this.f['usuarioFiltro'].setValue(null);
    this.f['canalVenta'].setValue(0);
    this.clearFormEvent.next(true);
    this.filtros();
  }

  // Tipos de sistema
  systemTypes(): void {
    this.systemTypes$ = new SystemTypesModel();
    this._spinner.show();
    this._securityService.systemTypes().subscribe(
      (res: SystemTypesModel) => {
        this.systemTypes$ = res;
        this._spinner.hide();
      },
      (err: any) => {
        // console.error(err);
        this._spinner.hide();
      }
    );
  }

  // (NUEVO) LISTAR PRODUCTOS Y PERFILES
  productosPerfilesList(): void {
    this._spinner.show();
    this._userRegisterService.productProfiles().subscribe(
      (res: any) => {
        // console.log(res);
        const productos = [];
        this._spinner.hide();
        this.listProductosPerfiles$ = res;

        res.listaProductosPerfiles.forEach((val) => {
          productos.push({
            idProducto: val.idProducto,
            nombreProducto: val.nombreProducto,
          });
        });

        const obj = {};
        this.listProductos$ = productos.filter((x) =>
          obj[x.idProducto] ? false : (obj[x.idProducto] = true)
        );
        // console.log('AQUI SOLO LOS PRODUCTOS -->', this.listProductos$);
        // console.log(this.listProductosPerfiles$);
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  // Sistema --- ANTIGUO
  systemProducts(): void {
    this._spinner.show();
    this.systemProducts$ = new SystemProductsModel();
    const req = {
      profileType: this.uf['systemType'].value,
    };
    this._securityService.systemProducts(req).subscribe(
      (res: SystemProductsModel) => {
        this.systemProducts$ = res;
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  // (NUEVO) Canal de venta
  canalVentaList(): void {
    this._spinner.show();
    const canalesVenta = [];
    this._securityService.canalVentasList().subscribe((res: any) => {
      // console.log('Canales de venta', res);
      res.dataCanalVenta.forEach((x) => {
        canalesVenta.push({
          idCanalVenta: x.idCanalVenta,
          nombreCanal: x.nombreCanal,
        });
      });
      this.canalVentaList$ = canalesVenta;
      // console.log('LISTA DE CANALES ', this.canalVentaList$);
    });
  }

  // (NUEVO) ROLES CLIENTE
  rolesClientes(): void {
    this._spinner.show();
    this.rolesClientes$ = new RolesClientesModel();

    this._securityService.rolesClientes().subscribe(
      (res: RolesClientesModel) => {
        this.rolesClientes$ = res;
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  // Perfiles x Producto
  profilesOfTypes(): void {
    this.profilesOfTypes$ = new ProfilesOfType();
    this._spinner.show();
    this._userRegisterService
      .profilesOfTypes(+this.f['profileType'].value)
      .subscribe(
        (res: ProfilesOfType) => {
          this.profilesOfTypes$ = res;
          this._spinner.hide();
        },
        (err: any) => {
          console.error(err);
          this._spinner.hide();
        }
      );
  }

  // Llenar lista de perfiles por Producto -----------------------------------------------------------------
  async productsProfileSOAT(payload?: any, data?: any): Promise<any> {
    const req = {
      systemType: this.uf['systemType'].value,
      productType: 1,
    };
    this.productsProfileSOAT$ = new ProductsProfileModel();
    return this._securityService.productsProfile(req).subscribe(
      (res: ProductsProfileModel) => {
        this.productsProfileSOAT$ = res;
        this.productsProfileSOAT$.items = this.productsProfileSOAT$.items.sort(
          (a, b) => (a.description as string).localeCompare(b.description)
        );
        if (payload) {
          payload.profile.id.forEach((x) => {
            if (this.productsProfileSOAT$?.items.some((val) => val.id == x)) {
              this.uf['soatProfile'].setValue(x);
            }
          });
        }
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  async productsProfileSCTR(payload?: any, data?: any): Promise<any> {
    const req = {
      systemType: this.uf['systemType'].value,
      productType: 2,
    };
    this.productsProfileSCTR$ = new ProductsProfileModel();

    return this._securityService.productsProfile(req).subscribe(
      (res: ProductsProfileModel) => {
        this.productsProfileSCTR$ = res;
        this.productsProfileSCTR$.items = this.productsProfileSCTR$.items.sort(
          (a, b) => (a.description as string).localeCompare(b.description)
        );
        if (payload) {
          payload.profile.id.forEach((x) => {
            if (this.productsProfileSCTR$?.items.some((val) => val.id == x)) {
              this.uf['sctrProfile'].setValue(x);
            }
          });
        }
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  // PRUEBAS-VIDALEY----------------------------------------------------------------------------------------

  async productsProfileVidaLey(payload?: any, data?: any): Promise<any> {
    const req = {
      systemType: this.uf['systemType'].value,
      productType: 3,
    };
    this.productsProfileVIDALEY$ = new ProductsProfileModel();
    return this._securityService.productsProfile(req).subscribe(
      (res: ProductsProfileModel) => {
        this.productsProfileVIDALEY$ = res;
        this.productsProfileVIDALEY$.items =
          this.productsProfileVIDALEY$.items.sort((a, b) =>
            (a.description as string).localeCompare(b.description)
          );
        if (payload) {
          payload.profile.id.forEach((x) => {
            if (
              this.productsProfileVIDALEY$?.items.some((val) => val.id == x)
            ) {
              this.uf['vidaLeyProfile'].setValue(x);
            }
          });
        }
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  // PRUEBAS-DEGRAVAMEN----------------------------------------------------------------------------------------

  async productsProfileDesgravamen(payload?: any, data?: any): Promise<any> {
    const req = {
      systemType: this.uf['systemType'].value,
      productType: 4,
    };
    this.productsProfileDESGRAVAMEN$ = new ProductsProfileModel();
    return this._securityService.productsProfile(req).subscribe(
      (res: ProductsProfileModel) => {
        this.productsProfileDESGRAVAMEN$ = res;
        this.productsProfileDESGRAVAMEN$.items =
          this.productsProfileDESGRAVAMEN$.items.sort((a, b) =>
            (a.description as string).localeCompare(b.description)
          );
        if (payload) {
          payload.profile.id.forEach((x) => {
            if (
              this.productsProfileDESGRAVAMEN$?.items.some((val) => val.id == x)
            ) {
              this.uf['desgravamenProfile'].setValue(x);
            }
          });
        }
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  // PRUEBAS-OTROS-RAMOS----------------------------------------------------------------------------------------

  async productsProfileOtrosRamos(payload?: any, data?: any): Promise<any> {
    const req = {
      systemType: this.uf['systemType'].value,
      productType: 5,
    };
    this.productsProfileOTROSRAMOS$ = new ProductsProfileModel();
    return this._securityService.productsProfile(req).subscribe(
      (res: ProductsProfileModel) => {
        this.productsProfileOTROSRAMOS$ = res;
        this.productsProfileOTROSRAMOS$.items =
          this.productsProfileOTROSRAMOS$.items.sort((a, b) =>
            (a.description as string).localeCompare(b.description)
          );
        if (payload) {
          payload.profile.id.forEach((x) => {
            if (
              this.productsProfileOTROSRAMOS$?.items.some((val) => val.id == x)
            ) {
              this.uf['otrosRamosProfile'].setValue(x);
            }
          });
        }
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  // PRUEBAS-ACCIDENTES-PERSONALES----------------------------------------------------------------------------------------

  async productsProfileAccidentesPersonales(
    payload?: any,
    data?: any
  ): Promise<any> {
    const req = {
      systemType: this.uf['systemType'].value,
      productType: 6,
    };
    this.productsProfileACCIDENTESPERSONALES$ = new ProductsProfileModel();
    return this._securityService.productsProfile(req).subscribe(
      (res: ProductsProfileModel) => {
        this.productsProfileACCIDENTESPERSONALES$ = res;
        this.productsProfileACCIDENTESPERSONALES$.items =
          this.productsProfileACCIDENTESPERSONALES$.items.sort((a, b) =>
            (a.description as string).localeCompare(b.description)
          );
        if (payload) {
          payload.profile.id.forEach((x) => {
            if (
              this.productsProfileACCIDENTESPERSONALES$?.items.some(
                (val) => val.id == x
              )
            ) {
              this.uf['accidentesPersonalesProfile'].setValue(x);
            }
          });
        }
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  // PRUEBAS-COVID-GRUPAL----------------------------------------------------------------------------------------

  async productsProfileCovidGrupal(payload?: any, data?: any): Promise<any> {
    const req = {
      systemType: this.uf['systemType'].value,
      productType: 7,
    };
    this.productsProfileCOVIDGRUPAL$ = new ProductsProfileModel();
    return this._securityService.productsProfile(req).subscribe(
      (res: ProductsProfileModel) => {
        this.productsProfileCOVIDGRUPAL$ = res;
        this.productsProfileCOVIDGRUPAL$.items =
          this.productsProfileCOVIDGRUPAL$.items.sort((a, b) =>
            (a.description as string).localeCompare(b.description)
          );
        if (payload) {
          payload.profile.id.forEach((x) => {
            if (
              this.productsProfileCOVIDGRUPAL$?.items.some((val) => val.id == x)
            ) {
              this.uf['covidGrupalProfile'].setValue(x);
            }
          });
        }
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  // PRUEBAS-VIDA-GRUPO----------------------------------------------------------------------------------------

  async productsProfileVidaGrupo(payload?: any, data?: any): Promise<any> {
    const req = {
      systemType: this.uf['systemType'].value,
      productType: 8,
    };
    this.productsProfileVIDAGRUPO$ = new ProductsProfileModel();
    return this._securityService.productsProfile(req).subscribe(
      (res: ProductsProfileModel) => {
        this.productsProfileVIDAGRUPO$ = res;
        this.productsProfileVIDAGRUPO$.items =
          this.productsProfileVIDAGRUPO$.items.sort((a, b) =>
            (a.description as string).localeCompare(b.description)
          );
        if (payload) {
          payload.profile.id.forEach((x) => {
            if (
              this.productsProfileVIDAGRUPO$?.items.some((val) => val.id == x)
            ) {
              this.uf['vidaGrupoProfile'].setValue(x);
            }
          });
        }
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  // PRUEBAS-VIDA-DEVOLUCION-PROTECTA----------------------------------------------------------------------------------------

  async productsProfileVidaDevolucionProtecta(
    payload?: any,
    data?: any
  ): Promise<any> {
    const req = {
      systemType: this.uf['systemType'].value,
      productType: 9,
    };
    this.productsProfileVIDADEVOLUCIONPROTECTA$ = new ProductsProfileModel();
    return this._securityService.productsProfile(req).subscribe(
      (res: ProductsProfileModel) => {
        this.productsProfileVIDADEVOLUCIONPROTECTA$ = res;
        this.productsProfileVIDADEVOLUCIONPROTECTA$.items =
          this.productsProfileVIDADEVOLUCIONPROTECTA$.items.sort((a, b) =>
            (a.description as string).localeCompare(b.description)
          );
        if (payload) {
          payload.profile.id.forEach((x) => {
            if (
              this.productsProfileVIDADEVOLUCIONPROTECTA$?.items.some(
                (val) => val.id == x
              )
            ) {
              this.uf['vidaDevolucionProtectaProfile'].setValue(x);
            }
          });
        }
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  // PRUEBAS-BACKOFFICE----------------------------------------------------------------------------------------

  async productsProfileBackOffice(payload?: any, data?: any): Promise<any> {
    const req = {
      systemType: this.uf['systemType'].value,
      productType: 10,
    };
    this.productsProfileBACKOFFICE$ = new ProductsProfileModel();
    return this._securityService.productsProfile(req).subscribe(
      (res: ProductsProfileModel) => {
        this.productsProfileBACKOFFICE$ = res;
        this.productsProfileBACKOFFICE$.items =
          this.productsProfileBACKOFFICE$.items.sort((a, b) =>
            (a.description as string).localeCompare(b.description)
          );
        if (payload) {
          payload.profile.id.forEach((x) => {
            if (
              this.productsProfileBACKOFFICE$?.items.some((val) => val.id == x)
            ) {
              this.uf['backOfficeProfile'].setValue(x);
            }
          });
        }
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  // PRUEBAS-QR----------------------------------------------------------------------------------------

  async productsProfileQr(payload?: any, data?: any): Promise<any> {
    const req = {
      systemType: this.uf['systemType'].value,
      productType: 11,
    };
    this.productsProfileQR$ = new ProductsProfileModel();
    return this._securityService.productsProfile(req).subscribe(
      (res: ProductsProfileModel) => {
        this.productsProfileQR$ = res;
        this.productsProfileQR$.items = this.productsProfileQR$.items.sort(
          (a, b) => (a.description as string).localeCompare(b.description)
        );
        if (payload) {
          payload.profile.id.forEach((x) => {
            if (this.productsProfileQR$?.items.some((val) => val.id == x)) {
              this.uf['qrProfile'].setValue(x);
            }
          });
        }
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  // PRUEBAS-VIDA-INDIVIUAL-LARGO-PLAZO----------------------------------------------------------------------------------------

  async productsProfileVidaIndivualLargoPlazo(
    payload?: any,
    data?: any
  ): Promise<any> {
    const req = {
      systemType: this.uf['systemType'].value,
      productType: 12,
    };
    this.productsProfileVIDAINDIVIDUALLARGOPLAZO$ = new ProductsProfileModel();
    return this._securityService.productsProfile(req).subscribe(
      (res: ProductsProfileModel) => {
        this.productsProfileVIDAINDIVIDUALLARGOPLAZO$ = res;
        this.productsProfileVIDAINDIVIDUALLARGOPLAZO$.items =
          this.productsProfileVIDAINDIVIDUALLARGOPLAZO$.items.sort((a, b) =>
            (a.description as string).localeCompare(b.description)
          );
        if (payload) {
          payload.profile.id.forEach((x) => {
            if (
              this.productsProfileVIDAINDIVIDUALLARGOPLAZO$?.items.some(
                (val) => val.id == x
              )
            ) {
              this.uf['vidaIndividualLargoPlazoProfile'].setValue(x);
            }
          });
        }
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  // PRUEBAS-VDP----------------------------------------------------------------------------------------

  async productsProfileVdp(payload?: any, data?: any): Promise<any> {
    const req = {
      systemType: this.uf['systemType'].value,
      productType: 13,
    };
    this.productsProfileVDP$ = new ProductsProfileModel();
    return this._securityService.productsProfile(req).subscribe(
      (res: ProductsProfileModel) => {
        this.productsProfileVDP$ = res;
        this.productsProfileVDP$.items = this.productsProfileVDP$.items.sort(
          (a, b) => (a.description as string).localeCompare(b.description)
        );
        if (payload) {
          payload.profile.id.forEach((x) => {
            if (this.productsProfileVDP$?.items.some((val) => val.id == x)) {
              this.uf['vdpProfile'].setValue(x);
            }
          });
        }
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  // PRUEBAS-DEGRAVAMEN-DEVOLUCION---------------------------------------------------------------------------------------

  async productsProfileDesgravamenDevolucion(
    payload?: any,
    data?: any
  ): Promise<any> {
    const req = {
      systemType: this.uf['systemType'].value,
      productType: 14,
    };
    this.productsProfileDESGRAVAMENDEVOLUCION$ = new ProductsProfileModel();
    return this._securityService.productsProfile(req).subscribe(
      (res: ProductsProfileModel) => {
        this.productsProfileDESGRAVAMENDEVOLUCION$ = res;
        this.productsProfileDESGRAVAMENDEVOLUCION$.items =
          this.productsProfileDESGRAVAMENDEVOLUCION$.items.sort((a, b) =>
            (a.description as string).localeCompare(b.description)
          );
        if (payload) {
          payload.profile.id.forEach((x) => {
            if (
              this.productsProfileDESGRAVAMENDEVOLUCION$?.items.some(
                (val) => val.id == x
              )
            ) {
              this.uf['vdpProfile'].setValue(x);
            }
          });
        }
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  // PRUEBAS-OPERACIONES----------------------------------------------------------------------------------------

  async productsProfileOperaciones(payload?: any, data?: any): Promise<any> {
    const req = {
      systemType: this.uf['systemType'].value,
      productType: 15,
    };
    this.productsProfileOPERACIONES$ = new ProductsProfileModel();
    return this._securityService.productsProfile(req).subscribe(
      (res: ProductsProfileModel) => {
        this.productsProfileOPERACIONES$ = res;
        this.productsProfileOPERACIONES$.items =
          this.productsProfileOPERACIONES$.items.sort((a, b) =>
            (a.description as string).localeCompare(b.description)
          );
        if (payload) {
          payload.profile.id.forEach((x) => {
            if (
              this.productsProfileOPERACIONES$?.items.some((val) => val.id == x)
            ) {
              this.uf['operacionesProfile'].setValue(x);
            }
          });
        }
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  // PRUEBAS-DEGRAVAMEN----------------------------------------------------------------------------------------

  async productsProfileDevoluciones(payload?: any, data?: any): Promise<any> {
    const req = {
      systemType: this.uf['systemType'].value,
      productType: 16,
    };
    this.productsProfileDEVOLUCIONES$ = new ProductsProfileModel();
    return this._securityService.productsProfile(req).subscribe(
      (res: ProductsProfileModel) => {
        this.productsProfileDEVOLUCIONES$ = res;
        this.productsProfileDEVOLUCIONES$.items =
          this.productsProfileDEVOLUCIONES$.items.sort((a, b) =>
            (a.description as string).localeCompare(b.description)
          );
        if (payload) {
          payload.profile.id.forEach((x) => {
            if (
              this.productsProfileDEVOLUCIONES$?.items.some(
                (val) => val.id == x
              )
            ) {
              this.uf['devolucionesProfile'].setValue(x);
            }
          });
        }
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  // Lista de Canales y Punto de Venta
  changeChannelSale(e: any): void {
    this.f['channelSale'].setValue(e);
  }

  changePointSale(e: any): void {
    this.f['pointSale'].setValue(e);
  }

  // (NUEVO) MODAL EDITAR PARA PRO USERS PRO
  openModalEditarCliente360(data: any): void {
    this.tituloModal$ = 'Editar Usuario';
    this.uf['password'].clearValidators();
    this.uf['password'].updateValueAndValidity();
    this.showlist = false;
    this.isNewClient360$ = false;
    this.userForm.reset();
    this.userForm.enable();
    this.formModal.reset();
    this.formModal.enable();
    this.profileProductos.clear();
    this.dataChannels = null;
    this.dataLocation = null;
    this.nCode$ = true;

    console.log('open modal edit --> ', data);

    const req = {
      idUser: +data.idUsuario360,
    };

    const reqPD = {
      idUser: +data.idUsuarioPD,
    };
    this.idCliente360Edit$ = +data.idUsuario360;
    this.idUserProEdit$ = +data.idUsuarioPD;

    console.log('Cliente --> ', this.idUserProEdit$);
    console.log('Usuario --> ', this.idCliente360Edit$);

    this._userRegisterService.dataEditUser(reqPD).subscribe((res: any) => {
      // this.uf['systemType'].setValue(res.dataUsuario.idSistema);
      this.uf['systemType'].setValue(2);
      // this.uf['systemType'].disable();

      this.uf['channelSale'].setValue(res.dataUsuario.canalVenta);
      this.uf['pointSale'].setValue(res.dataUsuario.puntoVenta);
      this.uf['documentType'].setValue(res.dataUsuario.tipoDocumento, {
        emitEvent: false,
      });
      this.valdiateLimitDocumentNumber(+this.uf['documentType'].value);
      this.uf['documentNumber'].setValue(res.dataUsuario.numeroDocumento);
      this.uf['sex'].setValue(res.dataUsuario.sexo);
      this.uf['name'].setValue(res.dataUsuario.nombres);
      this.uf['apePat'].setValue(res.dataUsuario.apellidoPaterno);
      this.uf['apeMat'].setValue(res.dataUsuario.apellidoMaterno);
      if (
        res.dataUsuarioProductosPerfiles.length == 1 &&
        res.dataUsuarioProductosPerfiles[0].idProducto == 9
      ) {
        this.getSuperiorClass(res.dataUsuarioProductosPerfiles[0].idPerfil);
        this.showlist = true;
      }
      this.uf['user'].setValue(res.dataUsuario.nombreUsuarioSistema);
      this.uf['user'].disable();

      this.uf['department'].setValue(res.dataUsuario.departamento);
      this.uf['province'].setValue(res.dataUsuario.provincia);
      this.uf['district'].setValue(res.dataUsuario.distrito);
      this.uf['phone'].setValue(res.dataUsuario.celular);
      this.uf['email'].setValue(res.dataUsuario.correo);
      this.uf['address'].setValue(res.dataUsuario.direccion);

      this.dataLocation = {
        country: null,
        department: this.uf['department'].value,
        province: this.uf['province'].value,
        district: this.uf['district'].value,
      };

      this.dataChannels = {
        channelSale: this.uf['channelSale'].value,
        pointSale: this.uf['pointSale'].value,
      };

      // -----------------------------------------------------//

      res.dataUsuarioProductosPerfiles.forEach((x) => {
        this.lengthProductsMax$--;
        this.profileProductos.push(
          this._builder.group({
            productId: [+x.idProducto],
            profileId: [+x.idPerfil],
          })
        );
      });

      console.log('array contorls ', this.profileProductos);

      if (this.uf['systemType'].value == 2) {
        this._userRegisterService.dataCliente360(req).subscribe(
          (res: any) => {
            console.log(res);
            res.dataCliente.forEach((x) => {
              this.uf['rolUsuario'].setValue(+x.idRol);
              const fechaFinalObj = moment(x.fechaFinal, 'DD/MM/YYYY');
              const fechaDate = fechaFinalObj.toDate();
              this.uf['fechaFinal'].setValue(fechaDate);
              this.uf['fechaInicio'].setValue(x.fechaInicio);
              this.uf['fechaInicio'].disable();
              console.log('rol usuario: ', this.uf['rolUsuario']);
            });
          },
          (err: any) => {}
        );
      }

      this._spinner.hide();
      this._vc.createEmbeddedView(this._modalProfile);
    });
  }

  // (NUEVO) MODAL EDITAR PARA PRO USERS PRO
  openModalEditarUserPro(data: any): void {
    this.tituloModal$ = 'Editar Usuario';
    this.uf['password'].clearValidators();
    this.uf['password'].updateValueAndValidity();
    this.isNewClient360$ = false;
    this.userForm.reset();
    this.userForm.enable();
    this.formModal.reset();
    this.formModal.enable();
    this.profileProductos.clear();
    this.dataChannels = null;
    this.dataLocation = null;
    this.nCode$ = true;

    // console.log('open modal edit --> ', data);

    const req = {
      idUser: +data.idUsuarioPD,
    };
    // console.log('pdiduser --> ', +data.idUsuarioPD);

    // console.log('requ --> ', req);

    this.idCliente360Edit$ = +data.idUsuario360;
    this.idUserProEdit$ = +data.idUsuarioPD;

    this._userRegisterService.dataEditUser(req).subscribe((res: any) => {
      // this.uf['systemType'].setValue(res.dataUsuario.idSistema);
      this.uf['systemType'].setValue(1);
      // this.uf['systemType'].disable();

      this.uf['channelSale'].setValue(res.dataUsuario.canalVenta);
      this.uf['pointSale'].setValue(res.dataUsuario.puntoVenta);
      this.uf['documentType'].setValue(res.dataUsuario.tipoDocumento, {
        emitEvent: false,
      });
      this.valdiateLimitDocumentNumber(+this.uf['documentType'].value);
      this.uf['documentNumber'].setValue(res.dataUsuario.numeroDocumento);
      this.uf['sex'].setValue(res.dataUsuario.sexo);
      this.uf['name'].setValue(res.dataUsuario.nombres);
      this.uf['apePat'].setValue(res.dataUsuario.apellidoPaterno);
      this.uf['apeMat'].setValue(res.dataUsuario.apellidoMaterno);

      this.uf['user'].setValue(res.dataUsuario.nombreUsuarioSistema);
      this.uf['user'].disable();

      this.uf['department'].setValue(res.dataUsuario.departamento);
      this.uf['province'].setValue(res.dataUsuario.provincia);
      this.uf['district'].setValue(res.dataUsuario.distrito);
      this.uf['phone'].setValue(res.dataUsuario.celular);
      this.uf['email'].setValue(res.dataUsuario.correo);
      this.uf['address'].setValue(res.dataUsuario.direccion);

      this.showlist = false;
      if (
        res.dataUsuarioProductosPerfiles.length == 1 &&
        res.dataUsuarioProductosPerfiles[0].idProducto == 9
      ) {
        this.getSuperiorClass(res.dataUsuarioProductosPerfiles[0].idPerfil);
        this.showlist = true;
      }

      this.dataLocation = {
        country: null,
        department: this.uf['department'].value,
        province: this.uf['province'].value,
        district: this.uf['district'].value,
      };

      this.dataChannels = {
        channelSale: this.uf['channelSale'].value,
        pointSale: this.uf['pointSale'].value,
      };

      // -----------------------------------------------------//

      res.dataUsuarioProductosPerfiles.forEach((x) => {
        this.lengthProductsMax$--;
        this.profileProductos.push(
          this._builder.group({
            productId: [+x.idProducto],
            profileId: [+x.idPerfil],
          })
        );
      });

      // console.log('array contorls ', this.profileProductos);

      if (this.uf['systemType'].value == 2) {
        this._userRegisterService.dataCliente360(req).subscribe(
          (res: any) => {
            console.log(res);
            res.dataCliente.forEach((x) => {
              this.uf['rolUsuario'].setValue(x.idRol);
              const fechaFinalObj = moment(x.fechaFinal, 'DD/MM/YYYY');
              const fechaDate = fechaFinalObj.toDate();
              this.uf['fechaFinal'].setValue(fechaDate);
              this.uf['fechaInicio'].setValue(x.fechaInicio);
              this.uf['fechaInicio'].disable();
              // console.log('rol usuario: ', this.uf['rolUsuario']);
            });
          },
          (err: any) => {}
        );
      }

      this._spinner.hide();
      this._vc.createEmbeddedView(this._modalProfile);
    });
  }

  // (NUEVO) Modal Editar GENERICO
  openModalEditar(data: any): void {
    this.uf['systemType'].setValue(1);
    this.blockUserNameEdit();
    this.tituloModal$ = 'Editar Usuario';
    this.addSystem360$ = false;
    this.idCliente360Edit$ = +data.idUsuario360;
    this.idUserProEdit$ = +data.idUsuarioPD;
    this.uf['password'].clearValidators();
    this.uf['password'].updateValueAndValidity();
    this.isNewClient360$ = false;
    this.userForm.reset();
    this.userForm.enable();
    this.formModal.reset();
    this.formModal.enable();
    this.profileProductos.clear();
    this.dataChannels = null;
    this.dataLocation = null;
    this.nCode$ = true;

    this.uf['channelSale'].setValidators(Validators.required);
    this.uf['pointSale'].setValidators(Validators.required);
    this.uf['channelSale'].updateValueAndValidity();
    this.uf['pointSale'].updateValueAndValidity();
    // console.log('open modal edit --> ', data);

    if (data.sistema === 'PD') {
      this.addSystem360$ = true;
    }

    const req = {
      idUser: +data.idUsuarioPD,
    };
    // console.log('pdiduser --> ', +data.idUsuarioPD);

    // console.log('requ --> ', req);

    this.idUserProEdit$ = +data.idUsuarioPD;
    if (this.f['profileType'].value == 0) {
        if (data.sistema === 'PD') {
            this.uf['systemType'].setValue(1);
            this.uf['systemType'].updateValueAndValidity();
        }
    } else {
      if (data.sistema === 'PD') {
        this.uf['systemType'].setValue(1);
        this.uf['systemType'].disable();
        this.uf['systemType'].updateValueAndValidity();
      }
    }

    if (data.sistema === 'C360') {
      this.uf['systemType'].setValue(2);
      this.uf['systemType'].disable();
      this.uf['systemType'].updateValueAndValidity();
    }

    if (data.estado360 === '2') {
      console.log('BLOQUEO A CLIENTE');
      this.uf['systemType'].setValue(1);
      this.uf['systemType'].disable();
      this.uf['systemType'].updateValueAndValidity();
    }

    if (data.estadoPD === '0') {
      console.log('BLOQUEO A PD');
      this.uf['systemType'].setValue(2);
      this.uf['systemType'].disable();
      this.uf['systemType'].updateValueAndValidity();
    }

    this._userRegisterService.dataEditUser(req).subscribe((res: any) => {
      // this.uf['systemType'].setValue(res.dataUsuario.idSistema);
      // this.uf['systemType'].disable();

      if (data.estadoPD === '1' && data.estado360 === '1') {
        this.uf['systemType'].setValue(res.dataUsuario.idSistema);
        this.uf['systemType'].enable();
        this.uf['systemType'].updateValueAndValidity();
      }

      this.uf['channelSale'].setValue(res.dataUsuario.canalVenta);
      this.uf['pointSale'].setValue(res.dataUsuario.puntoVenta);
      this.uf['documentType'].setValue(res.dataUsuario.tipoDocumento, {
        emitEvent: false,
      });
      this.valdiateLimitDocumentNumber(+this.uf['documentType'].value);
      this.uf['documentNumber'].setValue(res.dataUsuario.numeroDocumento);
      this.dniEdicion = res.dataUsuario.numeroDocumento;
      this.uf['sex'].setValue(res.dataUsuario.sexo);
      this.uf['name'].setValue(res.dataUsuario.nombres);
      this.uf['apePat'].setValue(res.dataUsuario.apellidoPaterno);
      this.uf['apeMat'].setValue(res.dataUsuario.apellidoMaterno);

      this.uf['user'].setValue(res.dataUsuario.nombreUsuarioSistema);
      this.uf['user'].disable();
      this.uf['user'].updateValueAndValidity();

      this.uf['department'].setValue(res.dataUsuario.departamento);
      this.uf['province'].setValue(res.dataUsuario.provincia);
      this.uf['district'].setValue(res.dataUsuario.distrito);
      this.uf['phone'].setValue(res.dataUsuario.celular);
      this.uf['email'].setValue(res.dataUsuario.correo);
      this.uf['address'].setValue(res.dataUsuario.direccion);
      const payOne = {
        nroDocumento: this.uf['documentNumber'].value,
        tipoDocumento: '2',
      };
      this._spinner.show();
      if (
        res.dataUsuarioProductosPerfiles.length == 1 &&
        res.dataUsuarioProductosPerfiles[0].idProducto == 9
      ) {
        this.getSuperiorClass(res.dataUsuarioProductosPerfiles[0].idPerfil);
        this.showlist = true;
      }
      if (
        res.dataUsuarioProductosPerfiles.length == 1 &&
        res.dataUsuarioProductosPerfiles[0].idProducto == 9
      ) {
        this.validationUser(payOne);
        this.findSupervisor();
        /*   this.showlist = false; */
      }
      this.dataLocation = {
        country: null,
        department: this.uf['department'].value,
        province: this.uf['province'].value,
        district: this.uf['district'].value,
      };

      this.dataChannels = {
        channelSale: this.uf['channelSale'].value,
        pointSale: this.uf['pointSale'].value,
      };

      // -----------------------------------------------------//

      res.dataUsuarioProductosPerfiles.forEach((x) => {
        this.lengthProductsMax$--;
        this.profileProductos.push(
          this._builder.group({
            productId: [+x.idProducto],
            profileId: [+x.idPerfil],
          })
        );
      });

      if (this.uf['systemType'].value == 2) {
        this.validateClienteData();
      }
      let perfiles = res.dataUsuarioProductosPerfiles.filter(
        (item) => +item.idProducto == 9
      );
      console.log(perfiles[0]);
      if (perfiles.length > 0) {
        this.perfilAsesor = perfiles[0].idPerfil;
        this.interExtra = this.perfil ? this.perfilAsesor == this.perfil : null;
      }

      this._spinner.hide();
      this._vc.createEmbeddedView(this._modalProfile);
    });
  }

  // Verificar si hay data de cliente 360
  validateClienteData() {
    this.blockUserNameEdit();
    const req = {
      idUser: this.idCliente360Edit$,
    };
    if (this.idCliente360Edit$ == 0) {
      this.uf['rolUsuario'].setValue(null);
      this.uf['fechaInicio'].setValue(new Date());
      this.uf['fechaInicio'].disable();
      this.uf['fechaFinal'].setValue(null);
    } else {
      if (!this.isNewClient360$) {
        // this.uf['user'].disable();
        this._userRegisterService.dataCliente360(req).subscribe(
          (res: any) => {
            // console.log(res);
            res.dataCliente.forEach((x) => {
              this.uf['rolUsuario'].setValue(x.idRol);
              const fechaFinalObj = moment(x.fechaFinal, 'DD/MM/YYYY');
              const fechaDate = fechaFinalObj.toDate();
              this.uf['fechaFinal'].setValue(fechaDate);
              this.uf['fechaInicio'].setValue(x.fechaInicio);
              this.uf['fechaInicio'].disable();
              // console.log('rol usuario: ', this.uf['rolUsuario']);
            });
          },
          (err: any) => {}
        );
      }
    }
  }

  // (MODIFICADO) Abrir el Modal Añadir
  openModalProfile(data?: any): void {
    this.tituloModal$ = 'Nuevo Usuario';
    this.uf['password'].setValidators(Validators.required);
    this.uf['password'].updateValueAndValidity();
    // this.uf['user'].setValidators(Validators.required);
    this.uf['user'].updateValueAndValidity();
    this.isNewClient360$ = true;
    this.lengthProductsMax$ = this.listProductos$.length;
    // console.log('Cuantos productos son --> ', this.lengthProductsMax$);
    this.nCode$ = !!data;
    this.showlist = false;
    this.userForm.reset();
    this.userForm.enable();
    this.formModal.reset();
    this.formModal.enable();
    this.userProducts.clear();
    this.profileProductos.clear();
    this.dataChannels = null;
    this.dataLocation = null;
    this.uf['fechaInicio'].disable();
    if (data) {
      this.openModalEditar(data);
    } else {
      // LLENAR CAMPOS 0 nada
      this.uf['systemType'].setValue(0);
      this.uf['fechaInicio'].setValue(new Date());
      this._spinner.hide();
      this._vc.createEmbeddedView(this._modalProfile);
    }
  }

  // Logica de Productos PLATAFORMA DIGITAL ANTIGUO-----------------------------------------------------------
  get selectedProducts(): string {
    const map = this.userProducts
      ?.getRawValue()
      ?.filter((x) => !!x.active)
      ?.map((val) => val.description);
    return map.join(', ');
  }
  get arraySelectedProducts(): Array<any> {
    const map = this.userProducts
      ?.getRawValue()
      ?.filter((x) => !!x.active)
      ?.map((val) => +val.id);
    return map || [];
  }

  get showProfileSoat(): boolean {
    return this.arraySelectedProducts.includes(1);
  }

  get showProfilesSCTR(): boolean {
    // const values: Array<number> = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const values: Array<number> = [2];
    return values.some((x) => this.arraySelectedProducts.includes(x));
  }

  // PRUEBA------------------------------------------
  get showProfileVidaLey(): boolean {
    return this.arraySelectedProducts.includes(3);
  }

  get showProfileDesgravamen(): boolean {
    return this.arraySelectedProducts.includes(4);
  }

  get showProfileOtrosRamos(): boolean {
    return this.arraySelectedProducts.includes(5);
  }

  get showProfileAccidentePersonales(): boolean {
    return this.arraySelectedProducts.includes(6);
  }

  get showProfileCovidGrupal(): boolean {
    return this.arraySelectedProducts.includes(7);
  }

  get showProfileVidaGrupo(): boolean {
    return this.arraySelectedProducts.includes(8);
  }

  get showProfileVidaDevolucionProtecta(): boolean {
    return this.arraySelectedProducts.includes(9);
  }

  get showProfileBackOffice(): boolean {
    return this.arraySelectedProducts.includes(10);
  }

  get showProfileQr(): boolean {
    return this.arraySelectedProducts.includes(11);
  }

  get showProfileVidaIndividualLargoPlazo(): boolean {
    return this.arraySelectedProducts.includes(12);
  }

  get showProfileVdp(): boolean {
    return this.arraySelectedProducts.includes(13);
  }

  get showProfileDesgravamenDevolucion(): boolean {
    return this.arraySelectedProducts.includes(14);
  }

  get showProfileOperaciones(): boolean {
    return this.arraySelectedProducts.includes(15);
  }

  get showProfileDevoluciones(): boolean {
    return this.arraySelectedProducts.includes(16);
  }

  get showSystemType(): boolean {
    return;
  }

  // Cerrar ultimo modal Superpuesto
  closeLastModal(): void {
    this._vc.remove();
  }
  // Cerrar Modal
  closeModals(): void {
    this.clientExist = null;
    this.intermedClient = null;
    this.perfil = null;
    this.showlist = false;
    this._vc.clear();
    this.profileSelected = null;
  }

  // -------------------------------------------------------------------------------------------------------------
  showHideListProducts(): void {
    this.showListProducts = !this.showListProducts;
    if (this.showListProducts) {
      this.timeout.push(
        setTimeout(() => {
          this.showListProducts = false;
        }, 2000)
      );
    } else {
      this.timeout?.forEach((e) => {
        clearTimeout(e);
        this.timeout = this.timeout.filter((x) => x !== e);
      });
    }
  }

  eventListProduct(): void {
    if (this.showProfileSoat) {
      this.uf['soatProfile'].setValidators(Validators.required);
    } else {
      this.uf['soatProfile'].clearValidators();
      this.uf['soatProfile'].setValue(null);
    }
    if (this.showProfilesSCTR) {
      this.uf['sctrProfile'].setValidators(Validators.required);
    } else {
      this.uf['sctrProfile'].clearValidators();
      this.uf['sctrProfile'].setValue(null);
    }

    // Prueba ------------------------------------------------------------------------

    if (this.showProfileVidaLey) {
      this.uf['vidaLeyProfile'].setValidators(Validators.required);
    } else {
      this.uf['vidaLeyProfile'].clearValidators();
      this.uf['vidaLeyProfile'].setValue(null);
    }
    if (this.showProfileDesgravamen) {
      this.uf['desgravamenProfile'].setValidators(Validators.required);
    } else {
      this.uf['desgravamenProfile'].clearValidators();
      this.uf['desgravamenProfile'].setValue(null);
    }

    if (this.showProfileOtrosRamos) {
      this.uf['otrosRamosProfile'].setValidators(Validators.required);
    } else {
      this.uf['otrosRamosProfile'].clearValidators();
      this.uf['otrosRamosProfile'].setValue(null);
    }
    if (this.showProfileAccidentePersonales) {
      this.uf['accidentesPersonalesProfile'].setValidators(Validators.required);
    } else {
      this.uf['accidentesPersonalesProfile'].clearValidators();
      this.uf['accidentesPersonalesProfile'].setValue(null);
    }
    if (this.showProfileCovidGrupal) {
      this.uf['covidGrupalProfile'].setValidators(Validators.required);
    } else {
      this.uf['covidGrupalProfile'].clearValidators();
      this.uf['covidGrupalProfile'].setValue(null);
    }
    if (this.showProfileVidaGrupo) {
      this.uf['vidaGrupoProfile'].setValidators(Validators.required);
    } else {
      this.uf['vidaGrupoProfile'].clearValidators();
      this.uf['vidaGrupoProfile'].setValue(null);
    }
    if (this.showProfileVidaDevolucionProtecta) {
      this.uf['vidaDevolucionProtectaProfile'].setValidators(
        Validators.required
      );
    } else {
      this.uf['vidaDevolucionProtectaProfile'].clearValidators();
      this.uf['vidaDevolucionProtectaProfile'].setValue(null);
    }
    if (this.showProfileBackOffice) {
      this.uf['backOfficeProfile'].setValidators(Validators.required);
    } else {
      this.uf['backOfficeProfile'].clearValidators();
      this.uf['backOfficeProfile'].setValue(null);
    }
    if (this.showProfileQr) {
      this.uf['qrProfile'].setValidators(Validators.required);
    } else {
      this.uf['qrProfile'].clearValidators();
      this.uf['qrProfile'].setValue(null);
    }
    if (this.showProfileVidaIndividualLargoPlazo) {
      this.uf['vidaIndividualLargoPlazoProfile'].setValidators(
        Validators.required
      );
    } else {
      this.uf['vidaIndividualLargoPlazoProfile'].clearValidators();
      this.uf['vidaIndividualLargoPlazoProfile'].setValue(null);
    }
    if (this.showProfileVdp) {
      this.uf['vdpProfile'].setValidators(Validators.required);
    } else {
      this.uf['vdpProfile'].clearValidators();
      this.uf['vdpProfile'].setValue(null);
    }
    if (this.showProfileDesgravamenDevolucion) {
      this.uf['desgravamenDevolucionProfile'].setValidators(
        Validators.required
      );
    } else {
      this.uf['desgravamenDevolucionProfile'].clearValidators();
      this.uf['desgravamenDevolucionProfile'].setValue(null);
    }
    if (this.showProfileOperaciones) {
      this.uf['operacionesProfile'].setValidators(Validators.required);
    } else {
      this.uf['operacionesProfile'].clearValidators();
      this.uf['operacionesProfile'].setValue(null);
    }
    if (this.showProfileDevoluciones) {
      this.uf['devolucionesProfile'].setValidators(Validators.required);
    } else {
      this.uf['devolucionesProfile'].clearValidators();
      this.uf['devolucionesProfile'].setValue(null);
    }

    this.uf['soatProfile'].updateValueAndValidity();
    this.uf['sctrProfile'].updateValueAndValidity();

    // -------------------------
    this.uf['vidaLeyProfile'].updateValueAndValidity();
    this.uf['desgravamenProfile'].updateValueAndValidity();
    this.uf['otrosRamosProfile'].updateValueAndValidity();
    this.uf['accidentesPersonalesProfile'].updateValueAndValidity();
    this.uf['covidGrupalProfile'].updateValueAndValidity();
    this.uf['vidaGrupoProfile'].updateValueAndValidity();
    this.uf['vidaDevolucionProtectaProfile'].updateValueAndValidity();
    this.uf['backOfficeProfile'].updateValueAndValidity();
    this.uf['qrProfile'].updateValueAndValidity();
    this.uf['vidaIndividualLargoPlazoProfile'].updateValueAndValidity();
    this.uf['vdpProfile'].updateValueAndValidity();
    this.uf['desgravamenDevolucionProfile'].updateValueAndValidity();
    this.uf['operacionesProfile'].updateValueAndValidity();
    this.uf['devolucionesProfile'].updateValueAndValidity();

    this.timeout?.forEach((e) => {
      clearTimeout(e);
      this.timeout = this.timeout.filter((x) => x !== e);
    });
    this.timeout.push(
      setTimeout(() => {
        this.showListProducts = false;
      }, 2000)
    );
  }
  // -------------------------------------------------------------------------------------------------------------
  // Provincia Distrito Municipalidad
  locations(e: any): void {
    this.uf['department'].setValue(e.department);
    this.uf['province'].setValue(e.province);
    this.uf['district'].setValue(e.district);
  }
  // Canal de Venta
  set channelSale(e: any) {
    this.uf['channelSale'].setValue(e);
  }
  // Punto de Venta
  set pointSale(e: any) {
    this.uf['pointSale'].setValue(e);
  }

  // (MODIFICADO) Boton de Insertar Usuario
  submit(): void {
    // Elijo sistema
    const op = this.uf['systemType'].value == 1 ? 1 : this.uf['systemType'].value == 2 ? 2: this.uf['systemType'].value == 3 ? 3 : 0;
    this.profileProductos.getRawValue().forEach((x) => {
      this.listProfileProducts.push({
        idPerfil: x.profileId,
        idProducto: x.productId,
      });
    });
    const payload = {
      ...this.userForm.getRawValue(),
      userId: this.currentUser['id'],
      password: this.uf['password'].value,
      fechaInicio: moment(this.uf['fechaInicio'].value)
        .format('DD/MM/YYYY')
        .toString(),
      fechaFinal: moment(this.uf['fechaFinal'].value)
        .format('DD/MM/YYYY')
        .toString(),
      dataProductoPerfil: this.listProfileProducts,
      idUsuarioProEdit: this.idUserProEdit$,
      idCliente360Edit: this.idCliente360Edit$,
    };

    if (payload.profileProductos.length == 1) {
      if (payload.profileProductos[0].productId == 9 && this.perfil != 0) {
        if (this.dniEdicion == null) {
          if (payload.profileProductos[0].profileId != this.perfil) {
            this.message$ =
              'El tipo de perfil no coincide, revisar con soporte.';
            this._vc.createEmbeddedView(this._modalExistUser);
            return;
          } else {
            console.log(data);
          }

          if (this.intermedClient) {
            this.message$ = 'El DNI ingresado ya se encuentra registrado.';
            this._vc.createEmbeddedView(this._modalExistUser);
            return;
          }
        } else if (this.dniEdicion != this.uf['documentNumber'].value) {
          if (this.intermedClient) {
            this.message$ = 'El DNI ingresado ya se encuentra registrado.';
            this._vc.createEmbeddedView(this._modalExistUser);
            return;
          }
        }
      }
    }
    this._spinner.show();

    switch (op) {
        case 1:
            // INSERTO USER PRO
            // console.log(payload);
            if (this.isNewClient360$) {
            this.insertUser(payload);
            } else {
            // console.log('Editar ---> ', payload);
            this.editUser(payload);
            }

            break;
        case 2:
            // Inser Cliente
            if (this.isNewClient360$) {
            this.insertUser(payload);
            } else {
            this.editUser(payload);
            if (this.addSystem360$) {
                // console.log('DE AQUI DECIDE SI INSERTAR O NO', this.addSystem360$);
                this.insertUser(payload);
            }
            this.editCliente360(payload);
            }
            break;
        
        
        case 3:
            // Inser Cliente
            if (this.isNewClient360$) {
                this.insertUser(payload);
            } else {
                this.editUser(payload);
                
                if (this.addSystem360$) {
                    // console.log('DE AQUI DECIDE SI INSERTAR O NO', this.addSystem360$);
                    this.insertUser(payload);
                }

                this.editCliente360(payload);
            }
            
            break;   
    }
  }

  // (NUEVO) ELECCION del Editar o Insertar
  editOrInsertClient(payload: any): void {
    // INSERTO CLIENTE 360
    if (this.addSystem360$) {
      const payloadClient = {
        ...payload,
        idUsuarioCliente360: this.idUserProEdit$,
      };
      // console.log('AGREGAR POR EL EDITAR -->', payloadClient);
      this.insertCliente360(payloadClient);
      this.filtros(false);
      return;
    }

    if (this.isNewClient360$) {
      const payloadClient = {
        ...payload,
        idUsuarioCliente360: this.idCliente360Edit$,
      };
      // console.log('NUEVO CLIENTE 360 --> Datos', payloadClient);
      this.insertCliente360(payloadClient);
      this.filtros(false);
    } else {
      const payloadClientEdit = {
        ...payload,
        idUsuarioCliente360: this.idCliente360Edit$,
      };
      // console.log('EDIT cliente 360 --> Datos', payloadClientEdit);
      this.editCliente360(payloadClientEdit);
      this.filtros(false);
    }
  }

  private editUser(payload): void {
    this.successAPI$ = false;
    this._userRegisterService.editarUsuarioPro(payload).subscribe(
      (response: any) => {
        this._spinner.hide();
        this.successAPI$ = response.success;
        // console.log('Devuelve el editar usuario Backend --> ', response);
        if (this.successAPI$) {
          this._spinner.hide();
          this.message$ =
            'El usuario se editó correctamente en el sistema Plataforma Digital';
          this._vc.createEmbeddedView(this._modalMessage);
        } else {
          this._spinner.hide();
          this.message$ =
            'Ocurrió un error al editar el usuario, por favor comunicarse con soporte';
          this._vc.createEmbeddedView(this._modalMessage);
        }
        this.filtros();
        console.log(payload);
        const idProfile = payload.profileProductos[0].profileId;
        const asesorUpload = idProfile == 191 ? this.uf['other'].value : '';
        const superUpload = idProfile == 194 ? this.uf['other'].value : '';
        // tslint:disable-next-line:no-shadowed-variable
        const data = {
          nDocAsesor: idProfile == 191 ? this.uf['documentNumber'].value : '',
          nDocSupervisor:
            idProfile == 194 ? this.uf['documentNumber'].value : asesorUpload,
          nDocJefe:
            idProfile == 195 ? this.uf['documentNumber'].value : superUpload,
          nTipo:
            idProfile == 191
              ? 1
              : idProfile == 194
              ? 2
              : idProfile == 195
              ? 3
              : 0,
        };
        if (
          payload.profileProductos.length == 1 &&
          payload.profileProductos[0].productId == 9
        ) {
          this._spinner.show();
          this.submitNewUser(data);
        }
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this._spinner.hide();
        this.message$ =
          'Ocurrió un error al editar el usuario, por favor comunicarse con soporte';
        this._vc.createEmbeddedView(this._modalMessage);
      }
    );
  }
  // (NUEVO) Insertar Usuario PRo
  private insertUser(payload): void {
    this.successAPI$ = false;
    this._userRegisterService.insertUser(payload).subscribe(
      (response: any) => {
        this._spinner.hide();
        // console.log('Esto me trae el response de Insert user --> ', response);
        this.successAPI$ = response.success;
        if (this.successAPI$) {
          this.message$ = this.isNewClient360$
            ? 'El usuario se registró correctamente en el sistema de Plataforma Digital'
            : 'El usuario se editó correctamente';
        } else {
          this.message$ = this.isNewClient360$
            ? 'Ocurrió un error, al momento de registrar el usuario, por favor comunicarse con soporte'
            : 'Ocurrió un error, al momento de editar el usuario, por favor comunicarse con soporte';
        }
        if (this.uf['systemType'].value == 2) {
          if (this.successAPI$) {
            // console.log('De aqui saco el id usuario -->', response);
            this.idCliente360Edit$ = response.idUsuario;
            this.editOrInsertClient(payload);
          }
        } else {
          this._vc.createEmbeddedView(this._modalMessage);
        }
        this.filtros();
        const idProfile = payload.profileProductos[0].profileId;
        const asesorUpload = idProfile == 191 ? this.uf['other'].value : '';
        const superUpload = idProfile == 194 ? this.uf['other'].value : '';
        // tslint:disable-next-line:no-shadowed-variable
        const data = {
          nDocAsesor: idProfile == 191 ? this.uf['documentNumber'].value : '',
          nDocSupervisor:
            idProfile == 194 ? this.uf['documentNumber'].value : asesorUpload,
          nDocJefe:
            idProfile == 195 ? this.uf['documentNumber'].value : superUpload,
          nTipo:
            idProfile == 191
              ? 1
              : idProfile == 194
              ? 2
              : idProfile == 195
              ? 3
              : 0,
        };
        if (
          payload.profileProductos.length == 1 &&
          payload.profileProductos[0].productId == 9
        ) {
          if (this.perfil == 0 && !this.intermedClient) {
            this.submitNewUser(data);
          }
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
        this.message$ =
          'Ocurrió un error, al momento de insertar el usuario, por favor comunicarse con soporte';
        this._vc.createEmbeddedView(this._modalMessage);
      }
    );
  }

  // (NUEVO) Insertar Cliente 360
  private insertCliente360(payload): void {
    this._userRegisterService.insertCliente360(payload).subscribe(
      (response: any) => {
        this._spinner.hide();
        if (response.success) {
          this.message$ =
            'El usuario se registró correctamente en el sistema Cliente 360';
        } else {
          this.message$ = 'Ocurrió un error';
        }
        this._vc.createEmbeddedView(this._modalMessage);
        this.filtros();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
        this.message$ =
          'Ocurrió un error, al momento de insertar el cliente 360, por favor comunicarse con soporte';
        this._vc.createEmbeddedView(this._modalMessage);
      }
    );
  }

  // (NUEVO) Editar Cliente 360
  private editCliente360(payload): void {
    this._userRegisterService.editarCliente360(payload).subscribe(
      (response: any) => {
        this._spinner.hide();
        // console.log(response);
        if (response.success) {
          this.message$ =
            'El usuario se editó correctamente en el sistema de Cliente 360';
        } else {
          this.message$ = 'Ocurrió un error';
        }

        this._vc.createEmbeddedView(this._modalMessage);
        this.filtros();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
        this.message$ =
          'Ocurrió un error, al momento de insertar el cliente 360, por favor comunicarse con soporte';
        this._vc.createEmbeddedView(this._modalMessage);
      }
    );
  }
  // (NUEVO) Funcion de Validar Nombre
  private focusUserName(payload): void {
    this._userRegisterService
      .focusUserName(payload)
      .subscribe((response: any) => {
        this._spinner.show();
        // console.log(response);
        this.nCode$ = response.codigoBD == 0;
        // console.log('ACtivar los sistemas ', this.nCode$);
        if (response.success) {
          this._spinner.hide();
        }

        if (response.codigoBD == 1) {
          this.message$ = 'El nombre de usuario ingresado ya existe.';
          this._vc.createEmbeddedView(this._modalExistUser);
          this._spinner.hide();
          this.uf['user'].setValue(null);
          this.uf['user'].updateValueAndValidity();
        } else {
          this.uf['user'].disable();
          this.uf['user'].updateValueAndValidity();
        }
      });
  }

  showSystemFocus(): boolean {
    return this.nCode$;
  }

  blockUserName() {
    if (this.nCode$) {
        this.uf['user'].disable();
        this.uf['user'].updateValueAndValidity();
    }
  }
  blockUserNameEdit() {
    this.uf['user'].disable();
    this.uf['user'].updateValueAndValidity();
  }
  // (NUEVO) Quitarle los espacios al nombre
  validarUserName() {
    // console.log('Sistema --> ', this.uf['systemType'].value);
    // console.log('Usuario --> ', this.uf['user'].value);
    if (this.uf['systemType'].value == 0) {
      if (
        this.uf['user'].value == null ||
        this.uf['user'].value.trim() === ''
      ) {
        this.message$ = 'Debe ingresar un nombre de usuario.';
        // this._vc.createEmbeddedView(this._modalExistUser);
        this._spinner.hide();
        this.uf['user'].setValue(null);
        this.uf['user'].updateValueAndValidity();
      }
    }
    if (!this.uf['user'].value) {
        return;
    }
    if (
      this.uf['systemType'].value != 0 &&
      this.uf['user'].value == null &&
      this.uf['user'].value.trim() === ''
    ) {
      const payload = {
        user: this.uf['user'].value.split(' ').join(''),
        idSistema: +this.uf['systemType'].value,
      };
      // console.log('Validar user ', payload);
      this.focusUserName(payload);
    } else {
      if (
        this.uf['user'].value == null ||
        this.uf['user'].value.trim() === ''
      ) {
        this.message$ = 'Debe ingresar un nombre de usuario.';
        this._vc.createEmbeddedView(this._modalExistUser);
        this._spinner.hide();
        this.uf['user'].setValue(null);
        this.uf['user'].updateValueAndValidity();
      } else {
        const payload = {
          user: this.uf['user'].value.split(' ').join(''),
          idSistema: +this.uf['systemType'].value,
        };
        // console.log('Validar user ', payload);
        this.focusUserName(payload);
      }
    }
  }

  // (NUEVO) Modal De Deshabilitar Usuario
  showModalDisableUser(data: any): void {
    this.idUserHabilitar$ = +data.idUsuarioPD;
    this.idClienteHabilitar$ = +data.idUsuario360;
    this.sistemaHabilitar$ = data.sistema;
    this._vc.createEmbeddedView(this._modalDisableUser);
  }

  // (NUEVO) Modal de Habilitar USuario
  showModalEnableUser(data: any): void {
    this.idUserHabilitar$ = +data.idUsuarioPD;
    this.idClienteHabilitar$ = +data.idUsuario360;
    this.sistemaHabilitar$ = data.sistema;
    this._vc.createEmbeddedView(this._modalEnableUser);
  }

  // (NUEVO) Modal De Deshabilitar Usuario
  showModalDisableCliente(data: any): void {
    this.idUserHabilitar$ = +data.idUsuarioPD;
    this.idClienteHabilitar$ = +data.idUsuario360;
    this.sistemaHabilitar$ = data.sistema;
    this._vc.createEmbeddedView(this._modalDisableCliente);
  }

  // (NUEVO) Modal de Habilitar USuario
  showModalEnableCliente(data: any): void {
    this.idUserHabilitar$ = +data.idUsuarioPD;
    this.idClienteHabilitar$ = +data.idUsuario360;
    this.sistemaHabilitar$ = data.sistema;
    this._vc.createEmbeddedView(this._modalEnableCliente);
  }

  // (NUEVO) Habilitar USUARIO
  enableUser(): void {
    const req = {
      idSistema: 1,
      idUsuario: this.idUserHabilitar$,
      idUsuarioActualizador: this.currentUser.id,
      estado: '1',
    };
    this._spinner.show();
    // console.log(req);
    this._userRegisterService.disableUser(req).subscribe(
      (response) => {
        this.message$ = 'El usuario se habilito correctamente.';
        this._spinner.hide();
        this.closeModals();
        this.filtros();
        this._vc.createEmbeddedView(this._modalMessage);
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
        this.message$ = 'Ocurrió un problema al intentar habilitar el usuario.';
        this._vc.createEmbeddedView(this._modalMessage);
      }
    );
  }

  // (NUEVO) DESHABILITAR EL USUARIO
  disableUser(): void {
    const req = {
      idSistema: 1,
      idUsuario: this.idUserHabilitar$,
      idUsuarioActualizador: this.currentUser.id,
      estado: '0',
    };
    this._spinner.show();
    // console.log('DEshabilitar ', req);
    this._userRegisterService.disableUser(req).subscribe(
      (response) => {
        this.message$ = 'El usuario se deshabilito correctamente';
        this._spinner.hide();
        this.closeModals();
        this.filtros();
        this._vc.createEmbeddedView(this._modalMessage);
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
        this.message$ =
          'Ocurrió un problema al intentar deshabilitar el usuario.';
        this._vc.createEmbeddedView(this._modalMessage);
      }
    );
  }

  // (NUEVO) Habilitar Cliente

  enableClient360() {
    const req = {
      idSistema: 2,
      idCliente: this.idClienteHabilitar$,
      idUsuarioActualizador: this.currentUser.id,
      estado: '1',
    };
    this._spinner.show();
    // console.log('DEshabilitar ', req);
    this._userRegisterService.disableUser(req).subscribe(
      (res: any) => {
        if (res.success) {
          this.message$ = 'El cliente se habilito correctamente';
          this._spinner.hide();
          this.closeModals();
          this.filtros();
          this._vc.createEmbeddedView(this._modalMessage);
        } else {
          this.message$ =
            'Ocurrió un problema al intentar habilitar el cliente.';
          this._spinner.hide();
          this.closeModals();
          this.filtros();
          this._vc.createEmbeddedView(this._modalMessage);
        }
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this.message$ = 'Ocurrió un problema al intentar habilitar el cliente.';
        this._spinner.hide();
        this.closeModals();
        this.filtros();
        this._vc.createEmbeddedView(this._modalMessage);
      }
    );
  }

  // (NUEVO) Deshabilitar Cliente

  disableClient(data: any) {
    // console.log('deshabilitar', data);
    const req = {
      idSistema: 2,
      idCliente: this.idClienteHabilitar$,
      idUsuarioActualizador: this.currentUser.id,
      estado: '2',
    };
    this._spinner.show();
    // console.log('DEshabilitar ', req);
    this._userRegisterService.disableUser(req).subscribe(
      (res: any) => {
        if (res.success) {
          this.message$ = 'El cliente se deshabilito correctamente';
          this._spinner.hide();
          this.closeModals();
          this.filtros();
          this._vc.createEmbeddedView(this._modalMessage);
        } else {
          this.message$ =
            'Ocurrió un problema al intentar deshabilitar el cliente.';
          this._spinner.hide();
          this.closeModals();
          this.filtros();
          this._vc.createEmbeddedView(this._modalMessage);
        }
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this.message$ =
          'Ocurrió un problema al intentar deshabilitar el cliente.';
        this._spinner.hide();
        this.closeModals();
        this.filtros();
        this._vc.createEmbeddedView(this._modalMessage);
      }
    );
  }
  // (NUEVO) VER DETALLE
  showModalResumen(data: any): void {
    this.nombreRol$ = '';
    this.estadoCliente360$ = null;
    this.estadoUsuarioPD$ = null;
    this.estadoCliente360$ = data.estado360;
    this.estadoUsuarioPD$ = data.estadoPD;
    // console.log('DEA QUI SALE LOS DETALLES', data);
    const reqUserPro = {
      idUser: +data.idUsuarioPD,
    };

    const reqCliente = {
      idUser: +data.idUsuario360,
    };

    if (data.sistema == 'PD') {
      // console.log('Entre si es PRO USERS PRO ');
      this._userRegisterService
        .dataEditUser(reqUserPro)
        .subscribe((res: any) => {
          this.systemaModal$ = res.dataUsuario.idSistema;
          this.productosPerfilesModal$ = res.dataUsuarioProductosPerfiles;
          this.dataUsuarioModal$ = res.dataUsuario;
          // console.log(this.dataUsuarioModal$);
          // console.log('DATA DEL USARIO', res);
        });
      // this._vc.createEmbeddedView(this._modalVerResumen);
      this.systemaModal$ = 1;
    }
    if (data.sistema == 'C360') {
      // console.log('Entre si es C360 ');
      this._userRegisterService
        .dataEditUser(reqUserPro)
        .subscribe((res: any) => {
          // this.systemaModal$ = res.dataUsuario.idSistema;
          this.productosPerfilesModal$ = res.dataUsuarioProductosPerfiles;
          this.dataUsuarioModal$ = res.dataUsuario;
          // console.log(this.dataUsuarioModal$);
          // console.log('DATA DEL USARIO', res);
        });

      this._userRegisterService
        .dataCliente360(reqCliente)
        .subscribe((res: any) => {
          console.log(res);
          res.dataCliente.forEach((x) => {
            this.nombreRol$ = x.nombreRol;
          });
          // console.log(res.dataCliente);
        });
      this.systemaModal$ = 2;
    }
    if (data.sistema == 'PD/C360') {
      // console.log('Entre si es Ambos');
      this._userRegisterService
        .dataEditUser(reqUserPro)
        .subscribe((res: any) => {
          // this.systemaModal$ = res.dataUsuario.idSistema;
          this.productosPerfilesModal$ = res.dataUsuarioProductosPerfiles;
          this.dataUsuarioModal$ = res.dataUsuario;
          // console.log(this.dataUsuarioModal$);
          // console.log('DATA DEL USARIO', res);
        });

      this._userRegisterService
        .dataCliente360(reqCliente)
        .subscribe((res: any) => {
          // console.log(res);
          res.dataCliente.forEach((x) => {
            this.nombreRol$ = x.nombreRol;
          });
          // console.log(res.dataCliente);
        });
      this.systemaModal$ = 0;
      // this._vc.createEmbeddedView(this._modalVerResumen);
    }
    // console.log('sismtea --> ', this.systemaModal$);
    // console.log('DATOS DEL USUSUARIO ', this.dataUsuarioModal$);
    this._vc.createEmbeddedView(this._modalVerResumen);
  }

  VerResumen(): void {
    this._spinner.show;
  }

  // (NUEVO) Lista de Perfiles X producto
  listProfileProductos(idProducto: number): Array<any> {
    let listaPerfilesXProducto =
      this.listProductosPerfiles$.listaProductosPerfiles.filter(
        (x) => x.idProducto == idProducto
      );
    return (listaPerfilesXProducto = listaPerfilesXProducto.sort((a, b) =>
      (a.nombrePerfil as string).localeCompare(b.nombrePerfil)
    ));
  }

  // (NUEVO) Añadir elementos en la tabla
  addProductProfile() {
    const form = this._builder.group({
      productId: [null, Validators.required],
      profileId: [null, Validators.required],
    });
    this.profileProductos.push(form);
    this.lengthProductsMax$--;
  }

  // (NUEVO) Eliminar Elementos en la tabla
  deleteProductProfile(i) {
    this.profileProductos.removeAt(i);
    this.lengthProductsMax$++;
  }

  // (NUEVO) Funcion limitar PRODUCTO - PERFIL
  limitArrayProduct(index): Array<number> {
    return this.profileProductos
      .getRawValue()
      .filter((x, y, z) => z[index] != x)
      .map((x) => +x.productId);
    // .includes(productId);
  }

  // (NUEVO) Maximo Productos a añadir
  maxProductsAdd(): boolean {
    return this.lengthProductsMax$ != 0 ? true : false;
  }

  // (NUEVO) Desactivar boton de añadir
  disableBtnAdd(): boolean {
    this.isFillProductsProfile$ =
      this.profileProductos.length == 0 ? false : true;
    if (!this.isFillProductsProfile$) {
      return false;
    } else {
      return this.uf['profileProductos'].invalid;
    }
  }

  // (NUEVO) EDITAR O AÑADIR
  disablePassword(): boolean {
    return this.isNewClient360$;
  }

  enablePassword(): boolean {
    return !this.isNewClient360$;
  }

  // (NUEVO) Cambiar Contraseña
  showModalchangePasswordModal(data: any, flag: boolean): void {
    this.estadoUsuarioPDCambioContraseña$ = null;
    this.estadoUsuairo360CambioContraseña$ = null;

    this.ufm['passwordChange'].setValue(null);
    // console.log('Valores a sacar -->', data);
    const reqUserPro = {
      idUser: +data.idUsuarioPD,
    };

    const reqCliente = {
      idUser: +data.idUsuario360,
    };

    this._userRegisterService.dataEditUser(reqUserPro).subscribe((res: any) => {
      console.log(res);
      this.ufm['userChange'].setValue(res.dataUsuario.nombreUsuarioSistema);
      this.estadoUsuarioPDCambioContraseña$ = res.estado;
      // console.log('Informacion usuario ', res);
    });

    this._userRegisterService
      .dataCliente360(reqCliente)
      .subscribe((res: any) => {
        // console.log('DATA C360 --> ', res);
        this.estadoUsuairo360CambioContraseña$ = res.estado360;
      });

    if (flag) {
      this.idSistemaCambioContraseña$ = 1;
      // this.ufm['systemTypeChange'].setValue(1);
      // this.ufm['systemTypeChange'].disable();
    } else {
      this.idSistemaCambioContraseña$ = 2;
      // this.ufm['systemTypeChange'].setValue(2);
      // this.ufm['systemTypeChange'].disable();
    }

    if (data.sistema == 'PD/C360') {
      /*
                    this.ufm['systemTypeChange'].setValue(0);
                  this.ufm['systemTypeChange'].enable();
                  this.idSistemaCambioContraseña$ = 0; */

      if (data.estado360 === '2' && data.estadoPD === '1') {
        this.idSistemaCambioContraseña$ = 1;
        // this.ufm['systemTypeChange'].setValue(1);
        // this.ufm['systemTypeChange'].disable();
      }
      if (data.estado360 === '1' && data.estadoPD === '0') {
        this.idSistemaCambioContraseña$ = 2;
        // this.ufm['systemTypeChange'].setValue(2);
        // this.ufm['systemTypeChange'].disable();
      }
    }
    this.idUsuarioCambioContraseña$ = +data.idUsuarioPD;
    this.idClienteCambioContraseña$ = +data.idUsuario360;
    // this.ufm['systemTypeChange'].updateValueAndValidity();
    this._vc.createEmbeddedView(this._modalChangePassword);
  }

  ChangePassword(): void {
    this._spinner.show;
  }

  // (NUEVO)Boton Cambio de contraseña
  submitChangePassword(): void {
    this._spinner.show();
    const payloadUserPro = {
      // idSistema: this.ufm['systemTypeChange'].value,
      nuevaContraseña: this.ufm['passwordChange'].value,
      idUsuario: this.idUsuarioCambioContraseña$,
      idUsuarioActualizador: this.currentUser.id,
    };

    const payloadCliente = {
      // idSistema: this.ufm['systemTypeChange'].value,
      nuevaContraseña: this.ufm['passwordChange'].value,
      idUsuario: this.idClienteCambioContraseña$,
      idUsuarioActualizador: this.currentUser.id,
    };

    // Cambiar contaseña cliente
    this._userRegisterService
      .cambiarContraseñaCliente(payloadCliente)
      .subscribe(
        (response) => {
          if (response.success) {
            this._spinner.hide();
            this.message$ = 'Se cambió la contraseña correctamente';
            this._vc.createEmbeddedView(this._modalMessage);
          } else {
            this._spinner.hide();
            this.message$ =
              'Ocurrió un problema al momento de cambiar la contraseña, por favor comuniquese con soporte';
            this._vc.createEmbeddedView(this._modalMessage);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          this._spinner.hide();
          this.message$ =
            'Ocurrió un problema al momento de cambiar la contraseña, por favor comuniquese con soporte';
          this._vc.createEmbeddedView(this._modalMessage);
        }
      );

    // CAmbiar contraseña PRo
    this._userRegisterService
      .cambiarContraseñaUsuario(payloadUserPro)
      .subscribe(
        (response) => {
          if (response.success) {
            this._spinner.hide();
            this.message$ = 'Se cambió la contraseña correctamente';
            this._vc.createEmbeddedView(this._modalMessage);
          } else {
            this._spinner.hide();
            this.message$ =
              'Ocurrió un problema al momento de cambiar la contraseña, por favor comuniquese con soporte';
            this._vc.createEmbeddedView(this._modalMessage);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          this._spinner.hide();
          this.message$ =
            'Ocurrió un problema al momento de cambiar la contraseña, por favor comuniquese con soporte';
          this._vc.createEmbeddedView(this._modalMessage);
        }
      );
  }
  validationUser(payload: any) {
    this._securityService.validationUser(payload).subscribe(
      (response: any) => {
        this._spinner.hide();
        console.log(response);
        //if (this.tituloModal$ == 'Nuevo Usuario') {
        this.clientExist = response.client;
        this.intermedClient = response.intermed;
        this.perfil = response.perfil;
        //}
        if (this.perfilAsesor != null) {
          this.interExtra = this.perfilAsesor == this.perfil;
        }
        this.supervisorDNI = response.supervisor;
        this.uf['other'].setValue(response.supervisor);
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this._spinner.hide();
        /*  this.message$ =
                       'Ocurrió un problema';
                     this._vc.createEmbeddedView(this._modalMessage); */
      }
    );
  }
  findSupervisor() {
    const register = this.listado$.find(
      (x) => Number(x.documento) == Number(this.uf['other'].value)
    );
    if (!register) {
      this.uf['other'].setValue(null);
    }
  }
  submitNewUser(payload: any) {
    this._securityService.submitNewUser(payload).subscribe(
      (response: any) => {
        this._spinner.hide();
        console.log(response);
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this._spinner.hide();
        /*  this.message$ =
                       'Ocurrió un problema';
                     this._vc.createEmbeddedView(this._modalMessage); */
      }
    );
  }
  getSuperiorClass(id: any) {
    this._securityService.getSuperiorClass(id).subscribe(
      (response: any) => {
        if (response.ejecutivos.length != 0) {
          this.listado$ = response.ejecutivos;
        }
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this._spinner.hide();
        /*  this.message$ =
                       'Ocurrió un problema';
                     this._vc.createEmbeddedView(this._modalMessage); */
      }
    );
  }
}
