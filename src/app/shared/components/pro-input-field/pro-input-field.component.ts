import { Component, OnInit, forwardRef, Input } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormGroup,
  FormBuilder,
  FormControl,
} from '@angular/forms';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'pro-input-field',
  templateUrl: './pro-input-field.component.html',
  styleUrls: ['./pro-input-field.component.sass'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProInputFieldComponent),
      multi: true,
    },
  ],
})
export class ProInputFieldComponent implements OnInit, ControlValueAccessor {
  @Input() placeholder = '';
  @Input() inputPlaceholder = '';
  @Input() type: 'text' | 'date' | 'select' = 'text';
  @Input() faIcon = '';
  @Input() inside = false;
  @Input() dateOptions = {};

  randomValue = Math.floor(Math.random() * 899 + 100);

  controlValue = new FormControl('');

  form: FormGroup = this.builder.group({
    value: this.controlValue,
  });

  onChange: Function;
  onTouched: Function;

  constructor(private readonly builder: FormBuilder) {
    this.onChange = (_: any) => {};
    this.onTouched = (_: any) => {};
  }

  ngOnInit(): void {
    this.controlValue.valueChanges.subscribe((value: string) => {
      this.writeValue(value);
    });
  }

  writeValue(value: any): void {
    this.onChange(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.controlValue.disable();
      return;
    }

    this.controlValue.enable();
  }
}
