import {
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  TemplateRef,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MarcaModel } from '../../../models/mantenimientos/marca-modelo/marca.model';
import { ModelsAutoModel } from '../../../models/mantenimientos/marca-modelo/modelos.model';
import { VersionAutoModel } from '../../../models/mantenimientos/marca-modelo/version.model';
import { MarcaModeloService } from '../../../services/mantenimientos/marca-modelo.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConfig } from '../../../../../app.config';
import { UtilsService } from '@shared/services/utils/utils.service';
import { IExportExcel } from '../../../../../shared/interfaces/export-excel.interface';
import moment from 'moment';

@Component({
  selector: 'app-marca-modelo',
  templateUrl: './marca-modelo.component.html',
  styleUrls: ['./marca-modelo.component.scss'],
})
export class MarcaModeloComponent implements OnInit {
  urlApi: string;

  formFilters: FormGroup;
  formMark: FormGroup;
  formModel: FormGroup;
  formVersion: FormGroup;

  idMarca: any;
  idModelo: any;

  messageModalConfirmDisable: string;

  typeSelected: number;
  dataSelected: any;

  marks$: Array<MarcaModel> = [];
  marksFiltered: Array<MarcaModel> = [];
  models$: Array<ModelsAutoModel> = [];
  versions$: Array<VersionAutoModel> = [];
  classes$ = [];

  isSelectCreateMark: boolean = false;
  isSelectCreateModel: boolean = false;
  isSelectCreateVersion: boolean = false;

  smarks$: Array<MarcaModel> = [];
  smodels$: Array<ModelsAutoModel> = [];
  smodelsFiltered: Array<ModelsAutoModel> = [];
  sversions$: Array<VersionAutoModel> = [];
  sversionsFiltered: Array<VersionAutoModel> = [];

  markSelected: { id: number; description: string };
  modelSelected: { id: number; description: string };

  existMark: boolean = false;
  existModel: boolean = false;
  existVersion: boolean = false;

  pmark: number;
  pmodel: number;
  pversion: number;

  message$: string;
  messageIsValid: boolean = false;

  @ViewChild('modalMarca', { static: true, read: TemplateRef })
  _modalMarca: TemplateRef<any>;
  @ViewChild('modalModelo', { static: true, read: TemplateRef })
  _modalModelo: TemplateRef<any>;
  @ViewChild('modalVersion', { static: true, read: TemplateRef })
  _modalVersion: TemplateRef<any>;
  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  _modalMessage: TemplateRef<any>;
  @ViewChild('modalConfirmeCreateMark', { static: true, read: TemplateRef })
  _modalConfirmeCreateMark: TemplateRef<any>;
  @ViewChild('modalConfirmCreateModel', { static: true, read: TemplateRef })
  _modalConfirmCreateModel: TemplateRef<any>;
  @ViewChild('modalConfirmCreateVersion', { static: true, read: TemplateRef })
  _modalConfirmCreateVersion: TemplateRef<any>;
  @ViewChild('modalConfirmDisable', { static: true, read: TemplateRef })
  _modalConfirmDisable: TemplateRef<any>;

  constructor(
    private readonly _builder: FormBuilder,
    private readonly _vc: ViewContainerRef,
    private readonly _marcaModeloService: MarcaModeloService,
    private readonly _spinner: NgxSpinnerService,
    private readonly _utilsService: UtilsService,
    private readonly cd: ChangeDetectorRef
  ) {
    this.urlApi = AppConfig.BACKOFFICE_API;
    this.pmark = 0;
    this.pmodel = 0;
    this.pversion = 0;

    this.formFilters = this._builder.group({
      marca: [null],
      modelo: [null],
      version: [null],
    });

    this.formMark = this._builder.group({
      description: [null, [Validators.required, Validators.maxLength(30)]],
    });

    this.formModel = this._builder.group({
      mark: [{ value: null, disabled: true }, Validators.required],
      description: [null, [Validators.required, Validators.maxLength(30)]],
      clase: [null],
    });

    this.formVersion = this._builder.group({
      clase: [null, Validators.required],
      mark: [{ value: null, disabled: true }, Validators.required],
      model: [{ value: null, disabled: true }, Validators.required],
      description: [null, [Validators.required, Validators.maxLength(30)]],
    });
  }

  ngOnInit(): void {
    this.marks();
    this.getClasses();
    this.ff['marca'].valueChanges.subscribe((val) => {
      this.ff['modelo'].setValue(null);
      this.ff['version'].setValue(null);
      this.markSelected = null;
      this.models$ = [];
      this.versions$ = [];
      if (!!val) {
        this.models();
      }
    });
    this.ff['modelo'].valueChanges.subscribe((val) => {
      this.ff['version'].setValue(null);
      this.modelSelected = null;
      this.versions$ = [];
      if (!!val) {
        this.versions();
      }
    });

    this.fma['description'].valueChanges.subscribe((val) => {
      if (val) {
        this.isSelectCreateMark = false;

        this.existMark = this.marks$.some(
          (item) =>
            item.marca?.toLowerCase() ==
            this.fma['description'].value?.toLowerCase()
        );
      }
    });
    this.fmo['description'].valueChanges.subscribe((val) => {
      if (val) {
        this.isSelectCreateModel = false;

        this.existModel = this.smodels$.some(
          (val) =>
            val.modelo?.toLowerCase() ==
            this.fmo['description'].value?.toLowerCase()
        );
      }
    });

    this.fve['clase'].valueChanges.subscribe((val) => {
      if (val) {
        this.fve['description'].setValue(null);
      }
    });
    this.fve['description'].valueChanges.subscribe((val) => {
      if (val) {
        this.isSelectCreateVersion = false;

        this.existVersion = this.sversionsFiltered.some(
          (val) =>
            val.version?.toLowerCase() ==
            this.fve['description'].value?.toLowerCase()
        );
      }
    });
  }

  getClasses(): void {
    this._spinner.show();
    this._marcaModeloService.getClasses().subscribe(
      (res: any) => {
        this.classes$ = res.listaClases;
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  filterMark(data: string): void {
    if (!data) {
      this.marksFiltered = [];
      return;
    }

    this.marksFiltered = this.marks$
      .filter((item) => item.marca.toLowerCase().includes(data.toLowerCase()))
      .slice(0, 3);
  }

  filterModel(data: string): void {
    if (!data) {
      this.smodelsFiltered = [];
      return;
    }

    this.smodelsFiltered = this.smodels$
      .filter((item) => item.modelo.toLowerCase().includes(data.toLowerCase()))
      .slice(0, 3);
  }

  filterVersion(data: string): void {
    if (!data) {
      this.sversionsFiltered = [];
      return;
    }

    this.sversionsFiltered = this.sversions$
      .filter(
        (item) =>
          item.version.toLowerCase().includes(data.toLowerCase()) &&
          +item.idClase === +this.fve['clase'].value
      )
      .slice(0, 3);
  }

  search(): void {
    this.markSelected = null;
    this.modelSelected = null;
    this.pmark = 0;
    this.pmodel = 0;
    this.pversion = 0;
    this.searchMarks();
    this.searchModels();
    this.searchVersions();
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  // *GET MARCAS
  marks(): void {
    this._spinner.show();

    this._marcaModeloService.getMarks().subscribe(
      (res: any) => {
        if (!res.success) {
          return;
        }

        this.marks$ = res.listaMarcas;
        this.searchMarks();
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  searchMarks(): void {
    this.smarks$ = [];
    this.smodels$ = [];
    this.sversions$ = [];

    const markValue = this.ff['marca'].value;

    if (markValue) {
      this.smarks$ = this.marks$.filter((mark) => mark.idMarca == markValue);
    } else {
      this.smarks$ = this.marks$;
    }
  }

  // *GET MODELS
  models(): void {
    this._spinner.show();
    const idMarca = +this.ff['marca'].value || this.markSelected.id;

    this._marcaModeloService.getModels(idMarca).subscribe(
      (res: any) => {
        this.models$ = res.listaModelos;

        if (this.ff['modelo'].value) {
          this.smodels$ = this.models$.filter(
            (model) => +model.idModelo == +this.ff['modelo'].value
          );
        } else {
          this.markSelected?.id ? (this.smodels$ = this.models$) : null;
        }

        if (this.models$.length == 1) {
          this.ff['modelo'].setValue(this.models$[0]?.idModelo);
        }

        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  searchModels(data?: any): void {
    this.modelSelected = null;
    this.idMarca = data?.idMarca;

    this.markSelected = {
      id: data?.idMarca || this.ff['marca'].value,
      description:
        data?.marca ||
        this.marks$?.find(
          (x) => x.idMarca.toString() === this.ff['marca'].value?.toString()
        )?.marca,
    };

    if (this.markSelected.id) {
      this.models();
    } else {
      this.smodels$ = [];
    }
    this.sversions$ = [];
  }

  // *GET VERSIONS
  versions(): void {
    this._spinner.show();
    const idModelo = +this.ff['modelo'].value || this.modelSelected.id;

    this._marcaModeloService.getVersions(idModelo).subscribe(
      (res: any) => {
        this.versions$ = res.listaVersiones;

        if (this.ff['version'].value) {
          this.sversions$ = this.versions$.filter(
            (version) => +version.idVersion == +this.ff['version'].value
          );
        } else {
          this.modelSelected?.id ? (this.sversions$ = this.versions$) : null;
        }

        if (this.versions$.length == 1 && this.ff['modelo'].value) {
          this.ff['version'].setValue(this.versions$[0]?.idVersion);
        }

        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  searchVersions(data?: any): void {
    this.idModelo = data?.idModelo;
    this.modelSelected = {
      id: data?.idModelo || this.ff['modelo'].value,
      description:
        data?.modelo ||
        this.models$?.find(
          (model) => model.idModelo === this.ff['modelo'].value
        )?.modelo,
    };

    if (this.modelSelected.id) {
      this.versions();
    } else {
      this.sversions$ = [];
    }
  }

  showModalConfirmDisable(type: number, data: any) {
    this.typeSelected = type;
    this.dataSelected = data;
    switch (type) {
      case 1:
        this.messageModalConfirmDisable =
          '¿Desea Deshabilitar la marca seleccionado?';
        break;
      case 2:
        this.messageModalConfirmDisable =
          '¿Desea Deshabilitar el modelo seleccionado?';
        break;
      case 3:
        this.messageModalConfirmDisable =
          '¿Desea Deshabilitar la versión seleccionada?';
        break;
    }
    this._vc.createEmbeddedView(this._modalConfirmDisable);
  }

  disableAction() {
    switch (+this.typeSelected) {
      case 1:
        this.disableMark();
        break;
      case 2:
        this.disableModel();
        break;
      case 3:
        this.disableVersion();
        break;
    }
  }

  disableMark(): void {
    const req = {
      idMarca: this.dataSelected.idMarca,
      idUsuario: this.currentUser.id,
    };
    this._spinner.show();
    this._marcaModeloService.disableMark(req).subscribe(
      (res: any) => {
        if (!res.success) {
          this.messageIsValid = false;
          this.message$ = res.message;
        } else {
          this.messageIsValid = true;
          this.message$ = 'Se actualizó la marca exitosamente';
          this.resetFormFilters();
          this.marks();
        }

        this._vc.clear();
        this._vc.createEmbeddedView(this._modalMessage);
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }
  disableModel(): void {
    const req = {
      idMarca: this.dataSelected.idMarca,
      idModelo: this.dataSelected.idModelo,
      idUsuario: this.currentUser.id,
    };
    this._spinner.show();
    this._marcaModeloService.disableModel(req).subscribe(
      (res: any) => {
        if (!res.success) {
          this.messageIsValid = false;
          this.message$ = res.message;
        } else {
          this.messageIsValid = true;
          this.message$ = 'Se actualizó el modelo exitosamente';
          this.resetFormFilters();
        }

        this._vc.clear();
        this._vc.createEmbeddedView(this._modalMessage);
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }
  disableVersion(): void {
    const req = {
      idVersion: this.dataSelected.idVersion,
      idUsuario: this.currentUser.id,
    };
    this._spinner.show();
    this._marcaModeloService.disableVersion(req).subscribe(
      (res: any) => {
        if (!res.success) {
          this.messageIsValid = false;
          this.message$ = res.message;
        } else {
          this.messageIsValid = true;
          this.message$ = 'Se actualizó la versión exitosamente';
          this.resetFormFilters();
        }

        this._vc.clear();
        this._vc.createEmbeddedView(this._modalMessage);
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  get ff(): { [key: string]: AbstractControl } {
    return this.formFilters.controls;
  }

  get fma(): { [key: string]: AbstractControl } {
    return this.formMark.controls;
  }

  get fmo(): { [key: string]: AbstractControl } {
    return this.formModel.controls;
  }

  get fve(): { [key: string]: AbstractControl } {
    return this.formVersion.controls;
  }

  get validateFormMark(): boolean {
    const exist = this.marks$.some(
      (val) =>
        val.marca?.toLowerCase() == this.fma['description'].value?.toLowerCase()
    );
    return !this.formMark.invalid && !exist && this.isSelectCreateMark;
  }

  get validateFormModel(): boolean {
    const exist = this.smodels$.some(
      (val) =>
        val.modelo?.toLowerCase() ==
        this.fmo['description'].value?.toLowerCase()
    );
    return !this.formModel.invalid && !exist && this.isSelectCreateModel;
  }

  get validateFormVersion(): boolean {
    const exist = this.sversionsFiltered.some(
      (val) =>
        val.version?.toLowerCase() ==
        this.fve['description'].value?.toLowerCase()
    );
    return !this.formVersion.invalid && !exist && this.isSelectCreateVersion;
  }

  resetFormFilters(): void {
    this.formFilters.reset();
    this.search();
  }

  openModalMarca(): void {
    this.closeModal();
    this._vc.createEmbeddedView(this._modalMarca);
  }
  openModalModelo(): void {
    this.closeModal();
    this.fmo['mark'].setValue(this.markSelected?.id);
    this._vc.createEmbeddedView(this._modalModelo);
  }

  openModalVersion(): void {
    this.closeModal();
    this.fve['mark'].setValue(this.markSelected?.id);
    this.fve['model'].setValue(this.modelSelected?.id);
    this._vc.createEmbeddedView(this._modalVersion);
  }

  closeModal(): void {
    this._vc.clear();

    this.formMark.reset();
    this.formModel.reset();
    this.formVersion.reset();

    this.typeSelected = null;
    this.dataSelected = null;
    this.messageModalConfirmDisable = null;
  }

  modalConfirmCreateMark(): void {
    this._vc.createEmbeddedView(this._modalConfirmeCreateMark);
  }
  createMark(): void {
    const req = {
      marca: this.fma['description'].value,
      idUsuario: this.currentUser.id,
    };
    this._spinner.show();
    this._marcaModeloService.createMark(req).subscribe(
      (res: any) => {
        if (!res.success) {
          this.messageIsValid = false;
          this.message$ = res.message;
        } else {
          this.messageIsValid = true;
          this.message$ = 'Se creó una nueva marca con éxito';
          this.formMark.reset();
          this.marks();
        }

        this._vc.clear();
        this._vc.createEmbeddedView(this._modalMessage);
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
        this.message$ = 'Ocurrió un error al intentar crear la marca';
        this._vc.clear();
        this._vc.createEmbeddedView(this._modalMessage);
        this.formMark.reset();
      }
    );
  }

  showModalConfirmCreateModel(): void {
    if (this.formModel.valid) {
      this._vc.createEmbeddedView(this._modalConfirmCreateModel);
    }
  }
  createModel(): void {
    const req = {
      idMarca: this.idMarca || this.ff['marca'].value,
      modelo: this.fmo['description'].value,
      idUsuario: this.currentUser.id,
    };
    this._spinner.show();
    this._marcaModeloService.createModel(req).subscribe(
      (res: any) => {
        if (!res.success) {
          this.messageIsValid = false;
          this.message$ = res.message;
        } else {
          this.messageIsValid = true;
          this.message$ = 'Se creó un nuevo modelo con éxito';
          this.searchModels(this.markSelected.id);
          this.formModel.reset();
        }

        this._vc.clear();
        this._vc.createEmbeddedView(this._modalMessage);
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this.message$ = 'Ocurrió un problema al intentar crear modelo';
        this._vc.clear();
        this.formModel.reset();
        this.models();
        this._vc.createEmbeddedView(this._modalMessage);
        this._spinner.hide();
      }
    );
  }
  showModalConfirmCreateVersion(): void {
    if (this.formVersion.valid) {
      this._vc.createEmbeddedView(this._modalConfirmCreateVersion);
    }
  }
  createVersion(): void {
    const req = {
      idMarca: this.markSelected.id || this.ff['marca'].value,
      idModelo: this.modelSelected.id || this.ff['modelo'].value,
      idClase: this.fve['clase'].value,
      version: this.fve['description'].value,
      idUsuario: this.currentUser.id,
    };

    this._spinner.show();
    this._marcaModeloService.createVersion(req).subscribe(
      (res: any) => {
        if (!res.success) {
          this.messageIsValid = false;
          this.message$ = res.message;
        } else {
          this.messageIsValid = true;
          this.message$ = 'Se creó una nueva versión con éxito';
          this.formVersion.reset();
          this.versions();
        }

        this._vc.clear();
        this._vc.createEmbeddedView(this._modalMessage);
        this._spinner.hide();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
        this.message$ = 'Ocurrió un error al intentar crear la versión';
        this._vc.clear();
        this._vc.createEmbeddedView(this._modalMessage);
      }
    );
  }

  removeLastModal(): void {
    this._vc.remove();
  }

  downloadFilterMarks(): void {
    const payload: IExportExcel = {
      fileName: 'Lista_Manenimiento_Marca',
      data: this.smarks$.map((value: any) => ({
        'CÓDIGO ': +value.idMarca,
        'DESCRIPCIÓN ': value.marca,
        'FECHA CREACIÓN ': moment(
          value.fechaCreacion,
          'DD/MM/YYYY HH:mm:ss'
        ).toDate(),
        'FECHA MODIFICACIÓN ': moment(
          value.fechaModificacion,
          'DD/MM/YYYY HH:mm:ss'
        ).toDate(),
        'ESTADO ': value.estado,
      })),
    };
    this._utilsService.exportExcel(payload);
  }

  downloadAllMarks(): void {
    this._marcaModeloService.downloadMarks().subscribe(
      (res: any) => {
        this._spinner.hide();

        if (!res.success) {
          return;
        }

        const payload: IExportExcel = {
          fileName: 'Lista_Manenimiento_Marca',
          data: res.listaMarcas.map((value: any) => ({
            'CÓDIGO ': +value.idMarca,
            'DESCRIPCIÓN ': value.marca,
            'FECHA CREACIÓN ': moment(
              value.fechaCreacion,
              'DD/MM/YYYY HH:mm:ss'
            ).toDate(),
            'FECHA MODIFICACIÓN ': moment(
              value.fechaModificacion,
              'DD/MM/YYYY HH:mm:ss'
            ).toDate(),
            'ESTADO ': value.estado,
          })),
        };
        this._utilsService.exportExcel(payload);
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  downloadFilterModels(): void {
    const payload: IExportExcel = {
      fileName: 'Lista_Manenimiento_Modelo',
      data: this.smodels$.map((value: any) => ({
        'CÓDIGO ': +value.idModelo,
        'DESCRIPCIÓN ': value.modelo,
        'FECHA CREACIÓN ': moment(
          value.fechaCreacion,
          'DD/MM/YYYY HH:mm:ss'
        ).toDate(),
        'FECHA MODIFICACIÓN ': moment(
          value.fechaModificacion,
          'DD/MM/YYYY HH:mm:ss'
        ).toDate(),
        'ESTADO ': value.estado,
      })),
    };
    this._utilsService.exportExcel(payload);
  }

  downloadAllModels(): void {
    this._marcaModeloService.downloadModels(+this.markSelected.id).subscribe(
      (res: any) => {
        this._spinner.hide();
        console.log(res);
        if (!res.success) {
          return;
        }

        const payload: IExportExcel = {
          fileName: 'Lista_Manenimiento_Modelo',
          data: res.listaModelos.map((value: any) => ({
            'CÓDIGO ': +value.idModelo,
            'DESCRIPCIÓN ': value.modelo,
            'FECHA CREACIÓN ': moment(
              value.fechaCreacion,
              'DD/MM/YYYY HH:mm:ss'
            ).toDate(),
            'FECHA MODIFICACIÓN ': moment(
              value.fechaModificacion,
              'DD/MM/YYYY HH:mm:ss'
            ).toDate(),
            'ESTADO ': value.estado,
          })),
        };
        this._utilsService.exportExcel(payload);
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  downloadFilterVersions(): void {
    const payload: IExportExcel = {
      fileName: 'Lista_Manenimiento_Version',
      data: this.sversions$.map((value: any) => ({
        'CÓDIGO ': +value.idVersion,
        'DESCRIPCIÓN ': value.version,
        'CLASE ': value.clase,
        'FECHA CREACIÓN ': moment(
          value.fechaCreacion,
          'DD/MM/YYYY HH:mm:ss'
        ).toDate(),
        'FECHA MODIFICACIÓN ': moment(
          value.fechaModificacion,
          'DD/MM/YYYY HH:mm:ss'
        ).toDate(),
        'ESTADO ': value.estado,
      })),
    };
    this._utilsService.exportExcel(payload);
  }

  downloadAllVersions(): void {
    this._marcaModeloService.downloadVersions(+this.modelSelected.id).subscribe(
      (res: any) => {
        this._spinner.hide();

        if (!res.success) {
          return;
        }

        const payload: IExportExcel = {
          fileName: 'Lista_Manenimiento_Version',
          data: res.listaVersiones.map((value: any) => ({
            'CÓDIGO ': +value.idVersion,
            'DESCRIPCIÓN ': value.version,
            'CLASE ': value.clase,
            'FECHA CREACIÓN ': moment(
              value.fechaCreacion,
              'DD/MM/YYYY HH:mm:ss'
            ).toDate(),
            'FECHA MODIFICACIÓN ': moment(
              value.fechaModificacion,
              'DD/MM/YYYY HH:mm:ss'
            ).toDate(),
            'ESTADO ': value.estado,
          })),
        };
        this._utilsService.exportExcel(payload);
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }

  createdValue(data: string): void {
    switch (data) {
      case 'marca':
        this.isSelectCreateMark = true;
        break;
      case 'model':
        this.isSelectCreateModel = true;
        break;
      case 'version':
        this.isSelectCreateVersion = true;
        break;
      default:
        break;
    }
  }
}
