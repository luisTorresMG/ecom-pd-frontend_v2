import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  NG_VALUE_ACCESSOR,
  AbstractControl,
  ControlValueAccessor,
} from '@angular/forms';
import { fadeAnimation } from '../../animations/animations';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'pro-select',
  templateUrl: './pro-select.component.html',
  styleUrls: ['./pro-select.component.sass'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProSelectComponent),
      multi: true,
    },
  ],
  animations: [fadeAnimation],
})
export class ProSelectComponent
  implements OnInit, OnChanges, ControlValueAccessor {
  @Input() value: string;
  @Input() label: string;
  @Input() class = '';
  @Input() placeholder = '';
  @Input() inside = false;
  @Input() clearable = true;
  @Input() multi = false;
  @Input() config: {
    checkboxColor?: 'default' | 'orange';
  } = {
    checkboxColor: 'default',
  };

  /* A setter for the items property. */
  @Input() set items(values: Array<any>) {
    this.allItems = this.filteredItems = values || [];
    if (values?.some((x) => x[this.value] == 0)) {
      const defaultValue = values.find((x) => x[this.value] == 0);
      this.writeValue(defaultValue);
    }
  }

  private initValue = null;

  form!: FormGroup;
 

  onChange: Function;
  showList = false;

  private allItems: Array<any> = [];
  filteredItems: Array<any> = [];

  @ViewChild('inputSelect', { static: true, read: ElementRef })
  private inputSelect: ElementRef;

  constructor(private readonly builder: FormBuilder) {
    this.form = this.builder.group({
    label: [''],
    itemSelectedLabel: [''],
  });
    this.onChange = (_: any) => {
    };
  }

  /**
   * When the value of the input changes, filter the list of items to only show items that start with
   * the value of the input.
   */
  ngOnInit(): void {
    this.formControl['label'].valueChanges.subscribe((value: string) => {
      if (this.multi) {
        return;
      }

      if (!value) {
        this.filteredItems = this.allItems || [];
        return;
      }

      this.openList();
      this.filteredItems =
        this.allItems.filter(
          (x) =>
            (x[this.label] as string)?.toLowerCase().slice(0, value.length) ==
            value.toLowerCase()
        ) || [];
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.items?.currentValue ?? []).length) {
      this.writeValue(this.initValue);
    }
  }

  get formControl(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  focusInput(): void {
    this.inputSelect.nativeElement.select();
  }

  checkOption(checked: boolean, item: any) {
    item.checked = checked;

    this.formControl['label'].setValue(this.joinSelectedOptions || '');

    const filter = this.filteredItems.filter((x) => x.checked);
    this.onChange(filter.map((x) => x[this.label]).join('(d)'));
  }

  get joinSelectedOptions(): string {
    return this.filteredItems
               .filter((x) => x.checked)
               .map((x) => x[this.label])
               .join(', ');
  }

  optionHasIncluded(value: any): boolean {
    return this.filteredItems.some((x) => x[this.value] == value && x.checked);
  }

  setValues(item: any): void {
    this.formControl['label'].setValue(item[this.label] || '');
    this.formControl['itemSelectedLabel'].setValue(
      this.formControl['label'].value
    );

    this.closeList();
  }

  writeValue(item: any) {
    const transformValue = `${item ?? ''}`;

    if (!transformValue && !this.multi) {
      this.clearInput();
      return;
    }

    if (typeof item != 'object') {
      this.initValue = item;

      if (this.multi) {
        if (!this.filteredItems.length) {
          return;
        }

        const splitValues: Array<any> = (this.initValue ?? '').split('(d)');

        this.filteredItems = this.filteredItems.map((obj) => ({
          ...obj,
          checked: splitValues.includes(obj[this.label]),
        }));

        this.formControl['label'].setValue(this.joinSelectedOptions || '');
        this.formControl['itemSelectedLabel'].setValue('');
        return;
      }

      const find = this.allItems.find((x) => x[this.value] == item);

      if (find) {
        if (this.formControl['itemSelectedLabel'].value == find[this.label]) {
          this.closeList();
          return;
        }
        this.onChange(item);
        this.setValues(find);
      }
      return;
    }

    if (!item) {
      return;
    }

    if (this.formControl['itemSelectedLabel'].value == item[this.label]) {
      this.closeList();
      return;
    }

    this.onChange(item[this.value]);
    this.setValues(item);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState(disabled: boolean) {
    if (disabled) {
      this.formControl['label'].disable();
      return;
    }

    this.formControl['label'].enable();
  }

  /**
   * If the list of items contains an item with a value of 0, then set the value of the dropdown to
   * that item.
   * @returns The default value of the dropdown.
   */
  clearInput() {
    this.onChange('');
    this.closeList();

    this.formControl['itemSelectedLabel'].setValue('');
    this.formControl['label'].setValue('');

    if (this.allItems?.some((x) => x[this.value] == 0)) {
      const defaultValue = this.allItems.find((x) => x[this.value] == 0);
      this.writeValue(defaultValue);
      return;
    }
  }

  openList(): void {
    if (this.formControl['label'].disabled) {
      return;
    }

    this.showList = true;
  }

  /**
   * If the user has selected an item from the list, then the function will close the list and set the
   * value of the input to the selected item.
   * If the user has not selected an item from the list, then the function will close the list and set
   * the value of the input to the default value.
   * @returns The value of the selected item.
   */
  closeList(): void {
    this.showList = false;

    if (this.multi) {
      this.formControl['label'].setValue(this.joinSelectedOptions || '');
      return;
    }

    this.filteredItems = this.allItems;

    if (this.allItems.some((x) => x[this.label] == this.formControl['label'])) {
      return;
    }

    this.formControl['label'].setValue(
      this.formControl['itemSelectedLabel'].value,
      {
        emitEvent: false,
      }
    );
  }
}
