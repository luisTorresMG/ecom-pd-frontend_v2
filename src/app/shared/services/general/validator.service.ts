import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Injectable()
export class ValidatorService {

  constructor() { }
  controlsValidator(controlExp: RegExp, isDate: boolean): ValidatorFn {

    return (control: AbstractControl): { [key: string]: any } => {
      let valueEval = control.value;
      if (isDate) {
        const splitted = control.value.split('-');
        valueEval = splitted[2] + '/' + splitted[1] + '/' + splitted[0];
      }
      const controlCons = controlExp.test(valueEval);
      return !controlCons ? { 'policyNumber': { value: valueEval } } : null;
    };
  }

}
