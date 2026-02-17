import { AbstractControl, ValidationErrors } from '@angular/forms';

export const PasswordStrengthValidator = function (control: AbstractControl): ValidationErrors | null {

  const value: string = control.value || '';

  if (!value) {
    return null;
  }

  const upperCaseCharacters = /[A-Z]+/g;
  if (upperCaseCharacters.test(value) === false) {
    return { passwordStrength: `Su clave debe tener al menos una mayúscula` };
  }

  const lowerCaseCharacters = /[a-z]+/g;
  if (lowerCaseCharacters.test(value) === false) {
    return { passwordStrength: `Su clave debe tener al menos una minúscula` };
  }


  const numberCharacters = /[0-9]+/g;
  if (numberCharacters.test(value) === false) {
    return { passwordStrength: `Su clave debe tener al menos un número` };
  }

  const specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  if (specialCharacters.test(value) === false) {
    return { passwordStrength: `Su clave debe tener al menos un caracter especial` };
  }
  return null;
};
