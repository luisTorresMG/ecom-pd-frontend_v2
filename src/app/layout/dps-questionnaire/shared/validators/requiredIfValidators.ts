import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

type Predicate = () => boolean;

export function conditionalRequired(
  predicate: Predicate,
  control: AbstractControl
): ValidatorFn {
  return (): ValidationErrors | null => {
    if (predicate() && !control.value) {
      return { required: true };
    }

    control.setErrors(null);
    return null;
  };
}
