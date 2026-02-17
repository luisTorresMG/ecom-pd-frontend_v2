export const RegularExpressions: {
  text: RegExp;
  numbers: RegExp;
  decimal: RegExp;
  email: RegExp;
  alpha: RegExp;
  alphaNumeric: RegExp;
} = {
  text: /^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/,
  numbers: /^\d+$/,
  decimal: /^([0-9]+\.?[0-9]*|\.[0-9]+)$/,
  email: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,6})$/,
  alpha: /^[a-zA-Z0-9]+$/,
  alphaNumeric: /^[a-zA-Z0-9]+$/,
};
