import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { GestionDeRegistrosService } from '../../../../services/mantenimientos/gestion-de-registros.service';
import { IArchivoResponse } from '../../../../models/mantenimientos/gestion-de-registros/gestion-de-registros.model';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { AppConfig } from '../../../../../../app.config';
import { UtilsService } from '../../../../../../shared/services/utils/utils.service';
import {
  HttpErrorResponse,
  HttpParams,
  HttpResponse,
  HttpResponseBase,
} from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { RentasService } from '../../../../services/rentas/rentas.service';
import { base64ToArrayBuffer } from '../../../../../../shared/helpers/utils';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss'],
})
export class AttachmentsComponent implements OnInit {
  form: FormGroup;
  forme: FormGroup;
  dataArchivo: any;
  urlApi: string;
  filename: string;
  nombreArchivoSubido: string;
  guardarExcel: File;
  descarga: string;
  nombreArchivo: string;
  urlForDownload3: string;

  @Output() efiles: EventEmitter<
    Array<{
      fileType: string;
      file: File;
    }>
  >;

  @Output() efilesE: EventEmitter<
    Array<{
      fileType: string;
      nombreA: string;
    }>
  >;

  @Input() set data(request: any) {
    if (request?.length) {
      this.files.clear();
    }
    request?.forEach((e) => {
      this.nombreArchivo = e.SFILENAME;
      this.descarga = e.SROUTE;
      const file = this._fb.group({
        fileType: [{ value: e.STYPEFILE, disabled: true }, Validators.required],
        nombre: [{ value: e.SFILENAME, disabled: true }, Validators.required],
        disable: [true],
        file: [null],
        urlArchivo: [{ value: e.SROUTE, disabled: true }, Validators.required],
      });
      this.files.insert(0, file);
    });

    if (this.isReadOnly) {
      this.files.disable({ emitEvent: false });
      return;
    }

    this.files.enable({ emitEvent: false });
  }

  @Input() showAction: boolean;

  @Input() set initWithRow(val: boolean) {
    if (val) {
      this.files.push(
        this._fb.group({
          fileType: [null, Validators.required],
          file: [null, Validators.required],
          nombre: [null, Validators.required],
          disable: [false],
          urlArchivo: [null]
        })
      );

      if (this.isReadOnly) {
        this.files.disable({ emitEvent: false });
        return;
      }

      this.files.enable({ emitEvent: false });
    }
  }

  @Input() set readOnly(isReadOnly: boolean) {
    this.isReadOnly = isReadOnly;

    if (this.isReadOnly) {
      this.files.disable({ emitEvent: false });
      return;
    }

    this.files.enable({ emitEvent: false });
  }

  isReadOnly: boolean = true;

  constructor(
    private readonly _GestionDeRegistrosService: GestionDeRegistrosService,
    private readonly _RentasService: RentasService,
    private readonly _fb: FormBuilder,
    private readonly _utilsService: UtilsService,
    private spinner: NgxSpinnerService
  ) {
    this.urlApi = AppConfig.BACKOFFICE_API;
    this.efiles = new EventEmitter<any>();
    this.filename = null;

    this.form = this._fb.group({
      files: this._fb.array([]),
    });
    /*
     this._fb.group({
          fileType: [null, Validators.required],
          file: [null, Validators.required],
          nombre: [null, Validators.required],
          disable: [false],
        }),
    */
    this.nombreArchivoSubido = 'Ningún archivo seleccionado';
  }

  ngOnInit(): void {
    this.archivo();
    this.files.valueChanges.subscribe((val: any) => {
      console.log(val);
      if (this.files.valid) {
        this.efiles.emit(val);
      }
    });
  }

  fileChange(e: any, i: number) {
    if (!!e.target.files.length) {
      /* if (
        e.target.files[0]?.name.indexOf('.xls') !== -1 ||
        e.target.files[0]?.name.indexOf('.xlsx') !== -1
      ) {
        this.nombreArchivoSubido = e.target.files[0].name;
        this.guardarExcel = e.target.files[0];
      } else {
        this.nombreArchivoSubido = 'Archivo inválido';
        this.guardarExcel = null;
      } */
      this.nombreArchivoSubido = e.target.files[0].name;
      this.guardarExcel = e.target.files[0];
      this.files.controls[i].get('nombre').setValue(e.target.files[0].name);
      const req = {
        name: this.files.controls[i].get('nombre').value,
        file: e.target.files[0],
      };
      this._GestionDeRegistrosService.uploadFiles(req).subscribe(
        (response: HttpResponse<string>) => {
          console.log(response);
          this.files.controls[i].get('urlArchivo').setValue(response.body);
        },
        (error: HttpErrorResponse) => {
          console.error(error);
        }
      );
    }
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get fe(): { [key: string]: AbstractControl } {
    return this.forme.controls;
  }

  get files() {
    return this.f['files'] as FormArray;
  }

  get filesE() {
    return this.fe['filesE'] as FormArray;
  }

  // ARCHIVO

  archivo() {
    const data: any = {
      S_TYPE: 'TYPE_ATTACHMENT',
      _: 1637349040336,
    };
    this._GestionDeRegistrosService.archivo(data).subscribe(
      (response: IArchivoResponse) => {
        this.dataArchivo = response;
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  addRow(): void {
    if (this.files.valid) {
      const file = this._fb.group({
        fileType: [null, Validators.required],
        file: [null, Validators.required],
        disable: [false],
        nombre: [null, Validators.required],
        urlArchivo: [null]
      });
      this.files.push(file);
    }
  }

  deleteRow(): void {
    if (this.files.length > 0) {
      this.files.removeAt(this.files.length - 1);
    }
  }

  /*
  array[index].get(urlArchivo).value
  */
  descargarAdj(i) {
    this.descarga = this.files.getRawValue()[i].urlArchivo;
    const urlForDownload3 = this.urlApi + `/${this.descarga}`;
    this._utilsService.callApiUrl(urlForDownload3).subscribe(
      (res: any) => {
        const req = {
          nombre: this.nombreArchivo,
          archivo: res.archivo,
        };
        this._utilsService.downloadArchivo(req);
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  downloadArchivo(response) {
    if (response) {
      const arrBuffer = base64ToArrayBuffer(response.archivo);
      const data: Blob = new Blob([arrBuffer], {
        type: 'application/pdf',
      });
      FileSaver.saveAs(data, this.nombreArchivo);
    }
  }
}
