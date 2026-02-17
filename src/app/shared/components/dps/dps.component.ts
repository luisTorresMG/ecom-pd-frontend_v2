import {
  Component,
  ElementRef,
  OnInit,
  Output,
  ViewChild,
  EventEmitter,
  Input,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-dps',
  templateUrl: './dps.component.html',
  styleUrls: ['./dps.component.scss'],
})
export class DpsComponent implements OnInit {
  form: FormGroup;
  cantidadConsumoCigarrillos: Array<number>;

  @Input() data: any;
  @Output() dataChange: EventEmitter<any>;

  @ViewChild('formDps', {static: true, read: ElementRef}) _form: ElementRef;

  constructor(private readonly _builder: FormBuilder) {
    this.dataChange = new EventEmitter<any>();
    this.cantidadConsumoCigarrillos = new Array();
    for (let i = 1; i <= 25; i++) {
      this.cantidadConsumoCigarrillos.push(i);
    }

    this.form = this._builder.group({
      talla: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-2][.][0-9]*$/),
          Validators.minLength(3),
          Validators.maxLength(4),
        ]),
      ],
      peso: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(2),
          Validators.maxLength(3),
        ]),
      ],
      fuma: [null, Validators.required],
      cantidadCigarros: [null],
      presionArterial: [null, Validators.required],
      presionArterialResult: [null],
      cancer: [null, Validators.required],
      infarto: [null, Validators.required],
      gastro: [null, Validators.required],
      viaja: [null, Validators.required],
      deporte: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.validateChangesForm();
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  validateChangesForm(): void {
    this.f['fuma'].valueChanges.subscribe(() => {
      this.f['cantidadCigarros'].markAsUntouched();
      if (this.showResFuma) {
        this.f['cantidadCigarros'].setValue(1);
        this.f['cantidadCigarros'].setValidators(Validators.required);
        this.f['cantidadCigarros'].updateValueAndValidity();
      } else {
        this.f['cantidadCigarros'].setValue(null);
        this.f['cantidadCigarros'].clearValidators();
        this.f['cantidadCigarros'].updateValueAndValidity();
      }
    });
    this.f['presionArterial'].valueChanges.subscribe(() => {
      this.f['presionArterialResult'].markAsUntouched();
      if (this.showPresionArterialResult) {
        this.f['presionArterialResult'].setValidators(Validators.required);
        this.f['presionArterialResult'].updateValueAndValidity();
      } else {
        this.f['presionArterialResult'].setValue(null);
        this.f['presionArterialResult'].clearValidators();
        this.f['presionArterialResult'].updateValueAndValidity();
      }
    });

    this.form.valueChanges.subscribe(() => {
      this.submit();
    });
  }

  get showResFuma(): boolean {
    return this.f['fuma'].value === 'Si';
  }

  get showPresionArterialResult(): boolean {
    return this.f['presionArterial'].value === 'Si';
  }

  get f(): any {
    return this.form.controls;
  }

  get validarPerson(): boolean {
    const imc =
      Number(this.f['peso'].value) /
      (Number(this.f['talla'].value) * Number(this.f['talla'].value)) >
      33
        ? false
        : true;
    const peso = Number(this.f['peso'].value);
    const countCigarros =
      !this.f['fuma'].value ? false :
        Number(this.f['cantidadCigarros'].value) > 20 ? false : true;
    const tallaCm = Number(this.f['talla'].value) * 100;
    const validPeso = peso < tallaCm - 120 ? false : true;
    // tslint:disable-next-line:max-line-length
    const pArterial = this.f['presionArterial'].value == 'Si' ? this.f['presionArterialResult'].value ? this.f['presionArterialResult'].value !== 'Alto' : false : this.f['presionArterial'].valid;
    const cancer = this.f['cancer'].value == 'No';
    const infarto = this.f['infarto'].value == 'No';
    const gastro = this.f['gastro'].value == 'No';
    const viaja = this.f['viaja'].value == 'No';
    const deporte = this.f['deporte'].value == 'No';

    // tslint:disable-next-line:max-line-length
    return (
      imc &&
      countCigarros &&
      validPeso &&
      pArterial &&
      cancer &&
      infarto &&
      gastro &&
      viaja &&
      deporte
    );
  }

  get validationDps(): any {
    const imc =
      Number(this.f['peso'].value) /
      (Number(this.f['talla'].value) * Number(this.f['talla'].value)) >
      33
        ? false
        : true;
    const peso = Number(this.f['peso'].value);
    const countCigarros =
      !this.f['fuma'].value ? false :
        Number(this.f['cantidadCigarros'].value) > 20 ? false : true;
    const tallaCm = Number(this.f['talla'].value) * 100;
    const validPeso = peso < tallaCm - 120 ? false : true;
    // tslint:disable-next-line:max-line-length
    const pArterial = this.f['presionArterial'].value == 'Si' ? this.f['presionArterialResult'].value ? this.f['presionArterialResult'].value !== 'Alto' : false : this.f['presionArterial'].valid;
    const cancer = this.f['cancer'].value == 'No';
    const infarto = this.f['infarto'].value == 'No';
    const gastro = this.f['gastro'].value == 'No';
    const viaja = this.f['viaja'].value == 'No';
    const deporte = this.f['deporte'].value == 'No';

    return {
      esValidoImc: imc,
      esValidoCantidadCigarros: countCigarros,
      esValidoPeso: validPeso,
      esValidoPresionArterial: pArterial,
      esValidoCancer: cancer,
      esValidoInfarto: infarto,
      esValidoGastro: gastro,
      esValidoViaje: viaja,
      esValidoDeporte: deporte
    };
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      if (this.validarPerson) {
        this.dataChange.emit({
          isValid: true,
          isValidForm: this.form.valid,
          ...this.form.getRawValue(),
          dpsValidations: this.validationDps,
        });
      } else {
        this.dataChange.emit({
          isValid: false,
          isValidForm: this.form.valid,
          ...this.form.getRawValue(),
          dpsValidations: this.validationDps,
        });
      }
    } else {
      this.dataChange.emit({
        isValid: false,
        isValidForm: false,
        ...this.form.getRawValue(),
        dpsValidations: this.validationDps,
      });
    }
  }
}
