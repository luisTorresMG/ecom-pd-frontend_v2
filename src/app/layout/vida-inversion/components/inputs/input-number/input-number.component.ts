import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-input-number',
  templateUrl: './input-number.component.html',
  styleUrls: ['./input-number.component.scss']
})

export class InputNumberComponent implements OnInit, OnChanges {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() decorator?: string = '';
  @Input() isDecimal?: boolean = true;
  @Input() decimalPrecision: number = 2;
  @Input() value: string = ''; // raw
  @Input() minLength?: number; // todo: implement
  @Input() maxLength?: number;
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<string>();


  displayValue: string = ''; // formatted
  decimalRegEx: RegExp = /[^0-9.]/g;
  negativeRegEx: RegExp = /-/g;

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    this.displayValue = this.value
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && changes['value'].currentValue !== undefined) {
      this.displayValue = changes['value'].currentValue;
    }
  }

  formatInput = (value) => {
    if (this.isDecimal) {
      // Remove invalid characters (allow only digits and one decimal point)
      value = value.replace(this.decimalRegEx, '');

      // Prevent starting with '.'
      if (value.startsWith('.')) {
        value = '0' + value; // Convert `.5` to `0.5`
      }

      // Ensure only one decimal point
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
    } else {
      // Allow digits and dot, but take only the integer part if dot is present
      value = value.replace(this.decimalRegEx, '');

      if (value.includes('.')) {
        value = value.split('.')[0]; // Keep only the integer part before '.'
      }
    }

    return value;
  };

  @HostListener('focus', ['$event'])
  onFocus() {
    this.displayValue = this.value
  }

  @HostListener('input', ['$event'])
  onInput(event: InputEvent) {
    if (this.disabled) return; // Prevent changes if disabled
    const input = event.target as HTMLInputElement;
    let value = this.formatInput(input.value.toString());
    this.value = this.enforceNumericRules(value);
    this.valueChange.emit(this.value);
    input.value = this.value;
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') || '';

    const formattedValue = this.formatInput(text);
    this.value = this.enforceNumericRules(formattedValue);
    this.displayValue = this.value
    this.valueChange.emit(this.value);
  }

  enforceNumericRules = (value: string): string => {
    // Prevent multiple decimals
    if (this.isDecimal && (value.match(/\./g) || []).length > 1) {
      value = value.substring(0, value.lastIndexOf('.'));
    }

    // Prevent multiple negative signs
    if ((value.match(this.negativeRegEx) || []).length > 1 || (value.includes('-') && value.indexOf('-') > 0)) {
      value = value.replace(this.negativeRegEx, '');
    }

    // Enforce decimal precision
    if (this.isDecimal && value.includes('.')) {
      const parts = value.split('.');
      if (parts[1].length > this.decimalPrecision) {
        parts[1] = parts[1].substring(0, this.decimalPrecision);
        value = parts.join('.');
      }
    }

    const valueWithoutDot = value.replace('.', '');

    // Enforce max length (excluding the decimal point)
    if (this.maxLength !== undefined && valueWithoutDot.length > this.maxLength) {
      value = value.substring(0, this.maxLength + (value.includes('.') ? 1 : 0));
    }

    return value;
  }

  @HostListener('blur', ['$event'])
  onBlur(event: FocusEvent) {
    if (this.disabled) return; // Prevent validation if disabled
    const input = event.target as HTMLInputElement;
    let value = input.value.trim();

    value = this.handleBlur(value, this.isDecimal);

    if (this.minLength !== undefined) {
      const valueWithoutDot = value.replace('.', '');

      // If length is shorter than minLength, adjust it
      if (valueWithoutDot.length < this.minLength) {

        const missingZeros = this.minLength - valueWithoutDot.length;

        if (this.isDecimal) {
          // If decimal exists, add missing zeros to the right
          if (value.includes('.')) {
            // const parts = value.split('.');
            // console.log('missingZeros ', missingZeros)
            // console.log('parts ', parts[1])
            // console.log('parts padded ', parts[1].padEnd(1, '0'))
            // parts[1] = parts[1].padEnd(missingZeros, '0'); // Pad decimal part
            // console.log('parts ', parts[1])
            // value = parts.join('.');
            if (isNaN(parseFloat(this.value))) {
              return;
            }

            // Format the number to the specified decimal places
            // console.log(parseFloat(this.value))
            const formattedValue = parseFloat(this.value).toFixed(this.decimalPrecision);
            this.value = formattedValue.toString();
            this.valueChange.emit(this.value);
          } else {
            //todo: use error message instead
          }
        } else {
          //todo: use error message instead
        }
      }
    }

    this.displayValue = this.formatThousands(this.value.toString());

    this.value = value;
    this.valueChange.emit(this.value);
    input.value = value;
  }

  handleBlur = (value, isDecimal) => {
    if (!value) return ""; // Ensure empty input remains empty

    if (isDecimal) {
      // Remove trailing decimal point
      value = value.replace(/\.$/, "");

      // Convert "0." to "0"
      if (value === "0.") value = "0";

      // Remove leading zeros except for "0.x" cases
      value = value.replace(/^0+(\d)/, "$1");
    } else {
      // For integers: remove leading zeros (but keep single zero)
      value = value.replace(/^0+(\d)/, "$1");
    }

    return value;
  };

  formatThousands = (value: string): string => {
    if (!value) return "";
    let integer = '';
    let decimal = '';

    // Split integer and decimal parts
    if (value.includes('.')){
      [integer, decimal] = value.split(".");
    } else integer = value;

    // Add commas to the integer part
    integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return decimal ? `${integer}.${decimal}` : integer;
  };
}
