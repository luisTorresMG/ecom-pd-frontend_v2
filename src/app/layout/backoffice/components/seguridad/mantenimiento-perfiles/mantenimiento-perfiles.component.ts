import {
  Component,
  OnInit,
  ViewContainerRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  FormArray,
} from '@angular/forms';

import { NgxSpinnerService } from 'ngx-spinner';
import { SystemProductsModel } from '../../../models/seguridad/system-products.model';
import { SystemTypesModel } from '../../../models/seguridad/system-types.model';
import {
  IProfile,
  ProfilesModel,
} from '../../../models/seguridad/profiles/profiles.model';

import { ProfileMaintenanceService } from '../../../services/seguridad/profile-maintenance.service';
import { UtilsService } from '@shared/services/utils/utils.service';
import { HttpParams } from '@angular/common/http';
import { ResourcesModel } from '../../../models/seguridad/profiles/resources.model';
import { SecurityService } from '../../../services/seguridad/security.service';
import { animate, style, transition, trigger } from '@angular/animations';
@Component({
  standalone: false,
  selector: 'app-mantenimiento-perfiles',
  templateUrl: './mantenimiento-perfiles.component.html',
  styleUrls: ['./mantenimiento-perfiles.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({
          opacity: 0,
        }),
        animate(
          250,
          style({
            opacity: 1,
          })
        ),
      ]),
      transition(':leave', [
        style({
          opacity: 0,
        }),
      ]),
    ]),
  ],
})
export class MantenimientoPerfilesComponent implements OnInit {
  // TODO: FORMS
  // #region
  form: FormGroup; // FORM FILTERS
  formProfile: FormGroup;
  // #endregion

  // TODO: VARIABLES
  // #region
  pagination: {
    currentPage: number;
    itemsPerPage: number;
  };

  systemTypes$: SystemTypesModel; // LISTA DE TIPO DE PERFILES
  productTypes$: SystemProductsModel; // LISTA DE TIPO DE PRODUCTOS

  profiles$: ProfilesModel; // LISTA DE PERFILES
  profileSelected: IProfile; // PERFIL SELECCIONADO

  resources$: ResourcesModel;

  typeModalProfile: number; // 1: NEW - 2:EDIT

  childSelected: number; // SUB LIST OF LIST PROFILE SELECTED
  child2Selected: number; // SUB LIST OF SUB LIST OF PROFILE SELECTED

  message: string; // MESSAHE OF MODAL MESSAGE
  // #endregion

  // TODO: VIEW CHILDS
  // #region
  @ViewChild('modalProfile', { static: true, read: TemplateRef })
  _modalProfile: TemplateRef<any>;
  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  _modalMessage: TemplateRef<any>;
  // #endregion

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _vc: ViewContainerRef,
    private readonly _spinner: NgxSpinnerService,
    private readonly _profileMaintenanceService: ProfileMaintenanceService,
    private readonly _utilsService: UtilsService,
    private readonly _securityService: SecurityService
  ) {
    this.pagination = {
      currentPage: 0,
      itemsPerPage: 10,
    };

    this.systemTypes$ = new SystemTypesModel();
    this.productTypes$ = new SystemProductsModel();
    this.profiles$ = new ProfilesModel();

    
    this.form = this._fb.group({
      profileType: [1],
      productType: [null],
      name: [null],
      description: [null],
    });

    this.formProfile = this._fb.group({
      name: [null, Validators.required],
      profileType: [1, Validators.required],
      productType: [1, Validators.required],
      description: [null],
      resources: this._fb.array([]),
    });
  }

  ngOnInit(): void {
    this.formProfile.valueChanges.subscribe(() => {
      //console.log(this.formProfile.controls);
    });
    this.search();
    this.systemTypes();

    this.f['profileType'].valueChanges.subscribe((val: string) => {
      this.f['productType'].setValue(null);
      if (+val === 1) {
        this.systemProducts();
      }
    });

    this.fp['profileType'].valueChanges.subscribe((val: string) => {
      this.fp['productType'].setValue(null);
      if (+val === 1) {
        this.systemProducts();
      }
      
      if (+val === 2) {
        this.fp['productType'].setValidators(Validators.required);
        this.resources();
      } else {
        this.fp['productType'].clearValidators();
      }
    });

    this.fp['productType'].valueChanges.subscribe((val: string) => {
      if (val) {
        this.childSelected = null;
        this.child2Selected = null;
        this.resources();
      }
    });
  }

  // TODO: GETTERS & SETTERS
  // #region
  // GET CONTROLS OF FORM FILTERS
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }
  // GET CONTROLS OF FORM PROFILE
  get fp(): { [key: string]: AbstractControl } {
    return this.formProfile.controls;
  }
  get fpResources() {
    return this.fp['resources'] as FormArray;
  }
  // CURRENT PAGE
  get currentPage(): number {
    return this.pagination.currentPage;
  }
  set currentPage(val: number) {
    this.pagination.currentPage = val;
    this.search();
  }

  // CURRENT USER STORAGE
  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }
  // #endregion

  // TODO: APIS
  // #region
  // SEARCH FILTERS
  
  search(): void {
    const req = {
      ...this.form.getRawValue(),
      currentPage: this.pagination.currentPage,
      itemsPerPage: this.pagination.itemsPerPage,
    };
    this._spinner.show();

    this._profileMaintenanceService.getProfiles(req).subscribe(
      (res: ProfilesModel) => {
        this.profiles$ = res;
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }
  // GET PROFILE TYPES
  systemTypes(): void {
    this._securityService.systemTypes().subscribe(
      (res: SystemTypesModel) => {
        res.items = res.items.filter((x) => x.id !== 2);
        this.systemTypes$ = res;
        if (this.systemTypes$.items.length == 1) {
          this.f['profileType'].setValue(this.systemTypes$.items[0].id);
        }
      },
      (err: any) => {
        console.error(err);
      }
    );
  }
  // GET PRODUCT TYPES
  systemProducts(): void {
    this.productTypes$ = new SystemProductsModel();
    this._spinner.show();
    const req = {
      profileType:
        +this.f['profileType'].value || +this.fp['profileType'].value,
    };
    this._securityService.systemProducts(req).subscribe(
      (res: SystemProductsModel) => {
        this.productTypes$ = res;
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
      }
    );
  }
  async resources(data?: any): Promise<any> {
    const req = {
      profileType: data?.idSystem || this.fp['profileType'].value,
      productType: data?.idProduct || this.fp['productType'].value,
    };
    this.fpResources.clear();
    this.resources$ = new ResourcesModel();
    this._spinner.show();
    return this._profileMaintenanceService.getResourcesAll(req).subscribe(
      (res: ResourcesModel) => {
        this.resources$ = res;
        res.items.forEach((e: any, i: number) => {
          this.fpResources.push(
            this._fb.group({
              id: [e.id],
              idFather: [e.idFather],
              active: [false],
              name: [e.name],
              description: [e.description],
              childrens: this._fb.array(
                e?.childrens?.items?.map(
                  (e2: any) =>
                    this._fb.group({
                      id: [e2.id],
                      idFather: [e2.idFather],
                      active: [false],
                      name: [e2.name],
                      description: [e2.description],
                      childrens: this._fb.array(
                        e2?.childrens?.items?.map((e3: any) =>
                          this._fb.group({
                            id: [e3.id],
                            idFather: [e3.idFather],
                            active: [false],
                            name: [e3.name],
                            description: [e3.description],
                          })
                        ) || []
                      ),
                    }) || []
                )
              ),
            })
          );
        });
        if (this.typeModalProfile == 2) {
          this.resourcesActive(this.profileSelected).then(() => {
            this._spinner.hide();
          });
        } else {
          this._spinner.hide();
        }
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }
  async resourcesActive(data): Promise<any> {
    const req = {
      idProfile: data.profile.id,
      profileType: data.idSystem,
      productType: data.idProduct,
    };

    return this._profileMaintenanceService.getResourcesActive(req).subscribe(
      (res: ResourcesModel) => {
        const actives: Array<number> = res.items?.map((val) => +val.id) || [];
        this.fpResources?.controls?.forEach((e: any) => {
          if (actives.includes(+e.get('id').value)) {
            e.get('active').setValue(true);
          }
          e?.get('childrens')?.controls?.forEach((e2: any) => {
            if (actives.includes(+e2.get('id').value)) {
              e2.get('active').setValue(true);
            }
            e2?.get('childrens').controls?.forEach((e3: any) => {
              if (actives.includes(+e3.get('id').value)) {
                e3.get('active').setValue(true);
              }
            });
          });
        });
      },
      (err: any) => {
        console.error(err);
      }
    );
  }
  get resourcesProfile(): any {
    let req = new Array();

    let checkeds1 = false;
    let uncheckeds1 = false;

    let checkeds2 = false;
    let uncheckeds2 = false;

    const values: any = this.formProfile.getRawValue();
    values.resources?.forEach((e1) => {
      if (e1.active) {
        req.push(e1.id);
        checkeds1 = true;
      } else {
        uncheckeds1 = true;
      }
      e1?.childrens?.forEach((e2) => {
        checkeds2 = false;
        uncheckeds2 = false;
        e2?.childrens?.forEach((e3) => {
          if (e3.active) {
            checkeds2 = true;
            req.push(e3.id);
          } else {
            uncheckeds2 = true;
          }
        });
        if (
          (checkeds2 && !uncheckeds2) ||
          (e2.active && !e2?.childrens?.length)
        ) {
          req.push(e2.id);
        }
      });
      if (
        (checkeds1 && !uncheckeds1) ||
        (e1.active && !e1?.childrens?.length)
      ) {
        req.push(e1.id);
      }
    });
    req = Array.from(new Set(req));
    console.log('lista de los que se registran', req);
    return req;
  }

  validateProfile(): void {
    const request = {
      ...this.formProfile.getRawValue(),
      idSystem: this.fp['profileType'].value,
      idProfile: this.profileSelected?.profile?.id || '',
      idUserUpdate: this.currentUser.id,
      items: this.resourcesProfile,
      type: this.typeModalProfile,
      description:
        this.fp['description'].value === null
          ? ''
          : this.fp['description'].value,
    };
    this._spinner.show();

    this._profileMaintenanceService.profileValidate(request).subscribe(
      (res: any) => {
        this._spinner.hide();
        if (!+res.code) {
          this.submitProfile(request);
          this.search();
        } else {
          this.showModalMessage(
            'Ocurrió un error al validar la información registrada'
          );
        }
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
        this.showModalMessage(
          'Ocurrió un error al validar la información registrada'
        );
      }
    );
  }
  async submitProfile(data: any): Promise<any> {
    this._spinner.show();
    // tslint:disable-next-line:max-line-length
    const successMessage =
      this.typeModalProfile == 2
        ? 'Se registró correctamente los cambios'
        : 'Se registró correctamente la información';
    // tslint:disable-next-line:max-line-length
    const errorMessage =
      this.typeModalProfile == 2
        ? 'Ocurrió un error al actualizar los cambios'
        : 'Ocurrió un error al guardar la información registrada';
    this._profileMaintenanceService.saveProfile(data).subscribe(
      (res: any) => {
        this._spinner.hide();
        this.search();
        if (!+res.code) {
          this._vc.clear();
          this.showModalMessage(successMessage);
        } else {
          this.showModalMessage(errorMessage);
        }
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
        this.showModalMessage(errorMessage);
      }
    );
  }
  // #endregion

  // TODO: FUNCTIONS
  // #region
  // RESET FORM FILTERS
  resetFormFilters(): void {
    this.form.reset();
    if (this.systemTypes$.items.length == 1) {
      this.f['profileType'].setValue(this.systemTypes$.items[0].id);
    }
    this.search();
  }
  // EXPORT EXCEL PROFILES
  exportProfiles(): void {
    const params: any = new HttpParams()
      .set('SNAME', this.f['name'].value || '')
      .set('SDESCRIPTION', this.f['description'].value || '')
      .set('P_NIDSYSTEM', this.f['profileType'].value || 0)
      .set('P_NIDPRODUCT', this.f['productType'].value || 0);
    let url = `http://190.216.170.173/backofficeqa/Security/Reports/reportProfilesGet?`;
    params.updates.forEach((e) => {
      url += `${e.param}=${e.value}&`;
    });
    url = url.substring(0, url.length - 1);
    this._spinner.show();
    this._utilsService.callApiUrl(url).subscribe(
      (res: { success: boolean; archivo: string }) => {
        this._utilsService.downloadArchivo({
          archivo: res.archivo,
          nombre: `perfiles_${new Date().getTime()}.xls`,
        });
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }
  selectChild(val: any): void {
    if (this.childSelected === val) {
      this.childSelected = null;
      this.child2Selected = null;
    } else {
      this.childSelected = val;
    }
  }
  selectChild2(val: any): void {
    console.log('PASA_--- Child 2');
    if (this.child2Selected === val) {
      this.child2Selected = null;
    } else {
      this.child2Selected = val;
    }
  }

  selectAllChild(data: any, checked: boolean): void {
    if (!!data.controls['childrens'].controls?.length) {
      if (checked) {
        data.controls['childrens'].controls.forEach((x) => {
          x.get('active').setValue(true);
          this.selectAllChild2(x, true);
        });
      } else {
        data.controls['childrens'].controls.forEach((x) => {
          x.get('active').setValue(false);
          this.selectAllChild2(x, false);
        });
      }
    }
  }
  selectAllChild2(data: any, checked: boolean): void {
    if (!!data.controls['childrens'].controls?.length) {
      if (checked) {
        data.controls['childrens'].controls.forEach((e) => {
          e.get('active').setValue(true);
        });
      } else {
        data.controls['childrens'].controls.forEach((e) => {
          e.get('active').setValue(false);
        });
      }
    }
  }
  selectedChilds(data: any): boolean {
    let checkeds = false;
    let uncheckeds = false;
    if (!!data.length) {
      data.forEach((e) => {
        if (!!e.get('active').value) {
          checkeds = true;
        } else {
          uncheckeds = true;
        }
        if (!!e.get('childrens')?.controls?.length) {
          e.get('childrens')?.controls?.forEach((e2) => {
            if (!!e2.get('active').value) {
              checkeds = true;
            } else {
              uncheckeds = true;
            }
          });
        }
      });
    }
    if (checkeds && uncheckeds) {
      return true;
    }
    return false;
  }
  selectedChild(control: any) {
    let checkeds = false;
    let uncheckeds = false;

    if (control.get('childrens')?.controls?.length) {
      control.get('childrens')?.controls.forEach((e) => {
        if (!!e.get('active').value) {
          checkeds = true;
        } else {
          uncheckeds = true;
        }
      });
      if (checkeds && !uncheckeds) {
        control.get('active').setValue(true);
      } else {
        control.get('active').setValue(false);
      }
    }
  }
  // #endregion

  // TODO: MODALS
  // #region
  closeAllModals(): void {
    this.resetFormFilters();
    this._vc.clear();
    this.formProfile.reset();
    this.resources$ = new ResourcesModel();
    this.childSelected = null;
    this.child2Selected = null;
  }
  closeLastModal(): void {
    this._vc.remove();
  }
  // MODAL NEW PROFILE
  showModalProfile(val: number, data?: any): void {
    this.typeModalProfile = val;
    this.profileSelected = data;
    this.form.reset();
    if (this.systemTypes$.items.length == 1) {
      this.f['profileType'].setValue(this.systemTypes$.items[0].id);
    }
    if (data) {
      this.fp['name'].setValue(data.name);
      this.fp['profileType'].setValue(data.idSystem);
      this.fp['productType'].setValue(data.idProduct);
      this.fp['description'].setValue(data.description);
      this._vc.createEmbeddedView(this._modalProfile);
    } else {
      if (this.systemTypes$.items.length == 1) {
        this.fp['profileType'].setValue(this.systemTypes$.items[0].id);
      }
      this.fp['productType'].setValue(1);
      this.resources().then(() => {
        this._vc.createEmbeddedView(this._modalProfile);
      });
    }
  }
  showModalMessage(message: string): void {
    this.message = message;
    this._vc.createEmbeddedView(this._modalMessage);
  }
  // #endregion
}
