import { AbstractControl } from '@angular/forms';
function getIndexBy(array: Array<{}>, { name, value }): number {
  for (let i = 0; i < array.length; i++) {
    if (array[i][name] === value) {
      return i;
    }
  }
  return -1;
}

function base64ToArrayBuffer(data) {
  const binaryString = window.atob(data);
  const binaryLen = binaryString.length;
  const bytes = new Uint8Array(binaryLen);
  for (let i = 0; i < binaryLen; i++) {
    const ascii = binaryString.charCodeAt(i);
    bytes[i] = ascii;
  }
  return bytes;
}

function sortArray(array, property, direction) {
  array.sort(function compare(a, b) {
    let comparison = 0;
    if (a[property] > b[property]) {
      comparison = 1 * direction;
    } else if (a[property] < b[property]) {
      comparison = -1 * direction;
    }
    return comparison;
  });
  return array;
}

function arrayMove(arr, fromIndex, toIndex) {
  const element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

function sortArrayByProperty(prop, arr) {
  prop = prop.split('.');
  const len = prop.length;

  arr.sort(function (a, b) {
    let i = 0;
    let key;

    while (i < len) {
      key = prop[i];

      if (!a.hasOwnProperty(key)) {
        return 1;
      }
      if (!b.hasOwnProperty(key)) {
        return -1;
      }

      a = a[key];
      b = b[key];
      i++;
    }
    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return 0;
    }
  });
  return arr;
}

function convertDateToStringOracle(fec: Date): string {
  const tsTofec = new Date(fec);
  let hdia = tsTofec.getUTCDate().toString();
  let hmes = (tsTofec.getUTCMonth() + 1).toString();
  let hanio = tsTofec.getUTCFullYear().toString();
  if (hmes.length <= 1) {
    hmes = '0' + hmes;
  }
  if (hdia.length <= 1) {
    hdia = '0' + hdia;
  }
  if (isNaN(Number(hdia))) {
    const currDate = new Date();
    hdia = currDate.getDate().toString();
    hmes = (currDate.getMonth() + 1).toString();
    hanio = currDate.getFullYear().toString();
  }

  return hdia + '-' + hmes + '-' + hanio;
}

function validateMinDate(control: AbstractControl) {
  if (control.value !== undefined && control.value !== '' && control.value !== null) {
    const Modalidad = JSON.parse(sessionStorage.getItem('Modalidad'));
    const tCertificado = Modalidad && Modalidad['tipoCertificado'];
    if (tCertificado === 1) {
      return true;
    }
    const arrFecha = control.value.toString().split('-');
    const inputDay = +arrFecha[2];
    const inputMonth = +arrFecha[1];
    const inputYear = +arrFecha[0];
    const currDate = new Date();
    const currDay = currDate.getDate();
    const currMonth = currDate.getMonth() + 1;
    const currYear = currDate.getFullYear();

    if (inputYear < currYear) {
      return { minDate: true };
    } else if (inputMonth < currMonth && inputYear === currYear) {
      return { minDate: true };
    } else if (
      inputDay < currDay &&
      (inputMonth === currMonth && inputYear >= currYear)
    ) {
      return { minDate: true };
    }
    return null;
  }
  return { minDate: true };
}

function padLeft(text: string, padChar: string, size: number): string {
  return (String(padChar).repeat(size) + text).substr(size * -1, size);
}

function setSerialNumber(type: number, serialNumber: string): string {
  const serialNumberOrigin = serialNumber.split('-');
  const sSerial = serialNumberOrigin[0];
  const sNumber = Number(serialNumberOrigin[1]).toString();

  let newserialnumber = '';
  switch (Number(type)) {
    case 5:
      newserialnumber =
        'F' + padLeft(Number(sSerial).toString(), '0', 3);
      break;
    case 6:
      newserialnumber =
        'B' + padLeft(Number(sSerial).toString(), '0', 3);
      break;
    case 7:
      newserialnumber =
        'FC' + padLeft(Number(sSerial).toString(), '0', 2);
      break;
    default:
      newserialnumber =
        'BC' + padLeft(Number(sSerial).toString(), '0', 2);
      break;
  }
  return newserialnumber + '-' + sNumber;
}

function getDecimalPlaces(num) {
  if (!num.toString().includes('.')) return 0;
  return num.toString().split('.')[1].length;
}

function subtractWithPrecision(val1, val2, decimalPlaces = 2) {
  const substraction = val1 - val2;
  let val2Places = getDecimalPlaces(val2);
  if (val2Places < decimalPlaces) {
    decimalPlaces = val2Places;
  }

  return substraction.toFixed(decimalPlaces);
}
export {
  getIndexBy,
  arrayMove,
  sortArrayByProperty,
  sortArray,
  validateMinDate,
  convertDateToStringOracle,
  setSerialNumber,
  padLeft,
  base64ToArrayBuffer,
  subtractWithPrecision
};
