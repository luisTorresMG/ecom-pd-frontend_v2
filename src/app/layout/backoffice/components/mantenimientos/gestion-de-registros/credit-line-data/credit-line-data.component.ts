import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { GestionDeRegistrosService } from '../../../../services/mantenimientos/gestion-de-registros.service';
import { CertificadoResponse } from '../../../../models/mantenimientos/gestion-de-registros/gestion-de-registros.model';

@Component({
  selector: 'app-credit-line-data',
  templateUrl: './credit-line-data.component.html',
  styleUrls: ['./credit-line-data.component.scss'],
})
export class CreditLineDataComponent implements OnInit {
  form: FormGroup;
  file: FormGroup;
  dataCertificado: any;
  dataCertificadoCopy: any;

  @Output() efiles: EventEmitter<
    Array<{
      papelType: string;
      stockMax: number;
      stockMin: number;
      stockAct: number;
    }>
  >;

  @Input() set data(request: any) {
    if (request?.length) {
      this.files.clear();
    }

    request?.items?.forEach((e) => {
      this.file = this._fb.group({
        papelType: [e.policyType, Validators.required],
        stockMax: [
          e.maxStock,
          [Validators.required, Validators.pattern(/^[\d]*$/)],
        ],
        stockMin: [
          e.minStock,
          [Validators.required, Validators.pattern(/^[\d]*$/)],
        ],
        stockAct: [
          e.currentStock,
          [Validators.required, Validators.pattern(/^[\d]*$/)],
        ],
      });
      this.files.insert(0, this.file);
    });
    this.efiles.emit(this.files.getRawValue() || []);

    if (this.isReadOnly) {
      this.files.disable({ emitEvent: false });
      return;
    }

    this.files.enable({ emitEvent: false });
  }

  @Input() showAction: boolean;
  @Input() showInput: boolean;

  @Input() set readOnly(isReadOnly: boolean) {
    this.isReadOnly = isReadOnly;

    if (this.isReadOnly) {
      this.files.disable({ emitEvent: false });
      return;
    }

    this.files.enable({ emitEvent: false });
  }

  isReadOnly: boolean = false;

  constructor(
    private readonly _GestionDeRegistrosService: GestionDeRegistrosService,
    private readonly _fb: FormBuilder
  ) {
    this.efiles = new EventEmitter<any>();
    this.file = this._fb.group({
      papelType: [7, Validators.required],
      stockMax: [null, [Validators.required, Validators.pattern(/^[\d]*$/)]],
      stockMin: [null, [Validators.required, Validators.pattern(/^[\d]*$/)]],
      stockAct: [null, [Validators.required, Validators.pattern(/^[\d]*$/)]],
    });
    this.form = this._fb.group({
      files: this._fb.array([]),
    });
    /* if (!this.files.length) {
      this.files.push(this.file);
    } */
    /*  this.files.push(this.file); */
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get e(): any {
    return this.file.controls;
  }

  get files() {
    return this.f['files'] as FormArray;
  }

  ngOnInit(): void {
    this.certificado();
    this.files.valueChanges.subscribe(() => {
      this.e['stockMax'].setValidators([
        Validators.pattern(/^[\d]*$/),
        Validators.required,
        Validators.min(+this.e['stockMin'].value || 0),
        Validators.max(999999),
      ]);
      this.e['stockMin'].setValidators([
        Validators.pattern(/^[\d]*$/),
        Validators.required,
        Validators.min(0),
        Validators.max(+this.e['stockMax'].value || 999999),
      ]);
      this.e['stockAct'].setValidators([
        Validators.pattern(/^[\d]*$/),
        Validators.required,
        Validators.min(+this.e['stockMin'].value || 0),
        Validators.max(+this.e['stockMax'].value || 999999),
      ]);
      Object.keys(this.e).forEach((e) => {
        this.e[e].updateValueAndValidity({
          emitEvent: false,
        });
      });

      // FIXME: NO ESTÁ VALIDANDO NINGÚN CHANGE
      this.e['stockMax'].valueChanges.subscribe((val: string) => {
        if (val) {
          if (this.e['stockMax'].hasError('pattern')) {
            this.e['stockMax'].setValue(val.substring(0, val.length - 1));
          }
          if (
            this.e['stockMax'].hasError('min') ||
            this.e['stockMax'].hasError('max')
          ) {
            this.e['stockMax'].setValue(val?.substring(0, val?.length - 1));
          }
        }
      });
      this.e['stockMin'].valueChanges.subscribe((val: string) => {
        if (val) {
          if (this.e['stockMin'].hasError('pattern')) {
            this.e['stockMin'].setValue(val.substring(0, val.length - 1));
          }
          if (
            this.e['stockMin'].hasError('min') ||
            this.e['stockMin'].hasError('max')
          ) {
            this.e['stockMin'].setValue(val?.substring(0, val?.length - 1));
          }
        }
      });
      this.e['stockAct'].valueChanges.subscribe((val: string) => {
        if (val) {
          if (this.e['stockAct'].hasError('pattern')) {
            this.e['stockAct'].setValue(val.substring(0, val.length - 1));
          }
          if (this.e['stockAct'].hasError('max')) {
            this.e['stockAct'].setValue(val?.substring(0, val?.length - 1));
          }
        }
      });
      /* this.e['papelType'].valueChanges.subscribe((val: string) => {
        this.files.getRawValue().forEach(e => {
          this.dataCertificado = this.dataCertificadoCopy?.PRO_MASTER.filter(x => +x.SITEM !== +e.papelType);
        });
      }); */
      if (this.files.valid) {
        this.efiles.emit(this.files.getRawValue());
      }
    });
  }

  // CERTIFICADO

  certificado() {
    const data: any = {
      S_TYPE: 'TYPECERTIF',
      _: 1637349040336,
    };
    this._GestionDeRegistrosService.certificado(data).subscribe(
      (response: CertificadoResponse) => {
        this.dataCertificado = this.dataCertificadoCopy = response;
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  disableItemCertificate(val): boolean {
    const values = this.files.getRawValue().map((x) => +x.papelType);
    return values.includes(+val);
  }

  addRow(): void {
    if (this.files.valid) {
      this.file = this._fb.group({
        papelType: [7, Validators.required],
        stockMax: [null, [Validators.required, Validators.pattern(/^[\d]*$/)]],
        stockMin: [null, [Validators.required, Validators.pattern(/^[\d]*$/)]],
        stockAct: [null, [Validators.required, Validators.pattern(/^[\d]*$/)]],
      });
      this.files.push(this.file);
    }
  }

  deleteRow(): void {
    if (this.files.length > 0) {
      this.files.removeAt(this.files.length - 1);
    }
  }
}
