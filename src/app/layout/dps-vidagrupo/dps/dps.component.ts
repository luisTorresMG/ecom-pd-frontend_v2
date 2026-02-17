import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { RegularExpressions } from '@shared/regexp/regexp';
import { fadeAnimation } from '@shared/animations/animations';

@Component({
  selector: 'app-dps',
  templateUrl: './dps.component.html',
  styleUrls: ['./dps.component.sass'],
  animations: [fadeAnimation]
})
export class DpsComponent implements OnInit {
  @Output() dps: EventEmitter<any> = new EventEmitter<any>();

  @Input() set dpsData(dpsData: any) {
    this.form.patchValue(dpsData);
  }

  form: FormGroup = this.builder.group({
    q1: ['', [
      Validators.pattern(RegularExpressions.decimal),
      Validators.required,
      Validators.min(1),
      Validators.max(3)
    ]],
    q2: ['', [
      Validators.pattern(RegularExpressions.decimal),
      Validators.required,
      Validators.min(1),
      Validators.max(999)
    ]],
    q3: this.builder.group({
      answer: ['', Validators.required],
      detail: ['']
    }),
    q4: this.builder.group({
      answer: ['', Validators.required],
      detail: ['']
    }),
    q5: this.builder.group({
      q51: this.builder.group({
        answer: ['', Validators.required],
        detail: ['']
      }),
      q52: this.builder.group({
        answer: ['', Validators.required],
        detail: ['']
      }),
      q53: this.builder.group({
        answer: ['', Validators.required],
        detail: ['']
      }),
    }),
    q6: this.builder.group({
      answer: ['', Validators.required],
      detail: ['']
    }),
    q7: this.builder.group({
      q71: this.builder.group({
        answer: ['', Validators.required],
        detail: ['']
      }),
      q72: this.builder.group({
        answer: ['', Validators.required],
        detail: ['']
      })
    }),
    q8: this.builder.group({
      answer: ['', Validators.required],
      detail: ['']
    }),
    declareValidInfo: [false, Validators.requiredTrue]
  });

  constructor(private readonly builder: FormBuilder) {
  }

  ngOnInit(): void {
    this.formValueChanges();
  }

  get formControl(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  getFormControlOfFormGroup(formGorupName: string): { [key: string]: AbstractControl } {
    return (this.formControl[formGorupName] as FormGroup).controls;
  }

  getFormControlOfDoubleFormGrup(formGorupNameParent: string, FormGroupNameChild: string): { [key: string]: AbstractControl } {
    return (this.getFormControlOfFormGroup(formGorupNameParent)[FormGroupNameChild] as FormGroup).controls;
  }

  private formValueChanges(): void {
    const q3: { [key: string]: AbstractControl } = (this.formControl['q3'] as FormGroup).controls;
    const q4: { [key: string]: AbstractControl } = (this.formControl['q4'] as FormGroup).controls;
    const q51: { [key: string]: AbstractControl } = ((this.formControl['q5'] as FormGroup).controls['q51'] as FormGroup).controls;
    const q52: { [key: string]: AbstractControl } = ((this.formControl['q5'] as FormGroup).controls['q52'] as FormGroup).controls;
    const q53: { [key: string]: AbstractControl } = ((this.formControl['q5'] as FormGroup).controls['q53'] as FormGroup).controls;
    const q6: { [key: string]: AbstractControl } = (this.formControl['q6'] as FormGroup).controls;
    const q71: { [key: string]: AbstractControl } = ((this.formControl['q7'] as FormGroup).controls['q71'] as FormGroup).controls;
    const q72: { [key: string]: AbstractControl } = ((this.formControl['q7'] as FormGroup).controls['q72'] as FormGroup).controls;
    const q8: { [key: string]: AbstractControl } = (this.formControl['q8'] as FormGroup).controls;

    const controls: any[] = [q3, q4, q51, q52, q53, q6, q71, q72, q8];

    controls.forEach((control: { [key: string]: AbstractControl }): void => {
      control['answer'].valueChanges.subscribe((value: string): void => {
        control['detail'].setValue('');

        if (+value == 0) {
          control['detail'].clearValidators();
        }

        if (+value == 1) {
          control['detail'].setValidators(Validators.required);
        }

        control['detail'].updateValueAndValidity();
      });
    });

    this.formControl['q1'].valueChanges.subscribe((value: string): void => {
      if (this.formControl['q1'].hasError('pattern') ||
        this.formControl['q1'].hasError('min') ||
        this.formControl['q1'].hasError('max')) {
        this.formControl['q1'].setValue(value.slice(0, value.length - 1));
      }

      const decimals: string = value.split('.')[1] ?? '';
      if (decimals.length > 2) {
        this.formControl['q1'].setValue(value.slice(0, value.length - 1));
      }
    });

    this.formControl['q2'].valueChanges.subscribe((value: string): void => {
      if (this.formControl['q2'].hasError('pattern') ||
        this.formControl['q2'].hasError('min') ||
        this.formControl['q2'].hasError('max')) {
        this.formControl['q2'].setValue(value.slice(0, value.length - 1));
      }

      const decimals: string = value.split('.')[1] ?? '';
      if (decimals.length > 2) {
        this.formControl['q1'].setValue(value.slice(0, value.length - 1));
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.dps.emit({
      ...this.form.getRawValue(),
      isValidForm: this.form.valid
    });
  }
}
