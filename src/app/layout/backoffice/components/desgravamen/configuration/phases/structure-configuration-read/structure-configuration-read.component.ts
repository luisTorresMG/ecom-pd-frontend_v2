import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators, } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { fadeAnimation } from '@shared/animations/animations';

import { DesgravamenService } from '../../../shared/services/desgravamen/desgravamen.service';
import { ConfigurationService } from '../../../shared/services/configuration/configuration.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-structure-configuration-read',
  templateUrl: './structure-configuration-read.component.html',
  styleUrls: [
    './structure-configuration-read.component.sass',
    '../../../shared/styles/style.sass',
  ],
  animations: [fadeAnimation],
})
export class StructureConfigurationReadComponent implements OnInit {
  @Output() dataEmitter: EventEmitter<any> = new EventEmitter();
  notificationReadValues: any = {};
  storage: any;
  transactions!: FormArray;
  notifications!: FormArray;
  form: FormGroup;

  tabSelected: 'transaction' | 'notification' = 'transaction';
  dropdownSelected: 'transaction' | 'notification' = 'transaction';

  parameters$: any = {};

  constructor(
    private readonly builder: FormBuilder,
    private readonly desgravamenService: DesgravamenService,
    private readonly configurationService: ConfigurationService
  ) {
      this.storage = this.desgravamenService.storage;
      this.transactions = this.builder.array([]);
      this.notifications = this.builder.array([]);
      this.form = this.builder.group({
        transactions: this.transactions,
        notifications: this.notifications,
      });
  }

  ngOnInit(): void {
    this.getParameters();

    this.emitValues();

    this.form.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.emitValues();
    });
  }

  notificationValues(event: any): void {
    this.notificationReadValues = event;
    this.emitValues();
  }

  private emitValues(): void {
    this.dataEmitter.emit({
      ...this.form.getRawValue(),
      isValidForm: this.form.valid,
      notifications: this.notificationReadValues
    });
  }

  private getFormGroupOfTransaction(
    attribute: string,
    value: string
  ): FormGroup {
    return this.transactions.controls.find(
      (fg: FormGroup) => fg.get(attribute).value == value
    ) as FormGroup;
  }

  private initValues(): void {
    const keyAttributeValue: string =
      this.configurationService.subjectEvents.CHANGES.ENTITY_ATTRIBUTE_VALUE;

    this.configurationService.subject.subscribe((obj) => {
      if (keyAttributeValue == obj.key) {
        const payload = obj.payload;

        if (!payload.currentValue) {
          this.handleEntityChangeNoCurrentValue(payload);
          return;
        }

        this.handleEntityChangeWithCurrentValue(payload);
      }
    });

    this.setDetailOfStorageForAction();
  }

  private handleEntityChangeNoCurrentValue(payload): void {
    const findTransaction: FormGroup = this.getFormGroupOfTransaction(
      'entityName',
      payload.attribute
    );

    if (!findTransaction) {
      return;
    }

    findTransaction.get('entityName').setValue(null);

    const findFunctions: FormArray = findTransaction.get(
      'functions'
    ) as FormArray;

    // tslint:disable-next-line:no-shadowed-variable
    let ids = [];
    findFunctions.controls.map((formFunction, index) => {
      if (!formFunction.get('isFunctionOfEntity').value) {
        return;
      }

      ids.push(index);
    });

    /* Sorting the array in descending order. */
    ids = ids.sort((a, b) => b - a);

    ids.map((id) => {
      findFunctions.removeAt(id);
    });

    /* Checking if the findFunctions.controls.length is 0, if it is, it will add a row to the table. */
    if (findFunctions.controls.length == 0) {
      this.addRowFunction(findTransaction);
    }
  }

  private handleEntityChangeWithCurrentValue(payload): void {
    const formField: FormGroup = this.getFormGroupOfTransaction(
      'inputData',
      payload.currentValue
    );

    /* Setting the value of the form field to null and enabling it. */
    const formFieldEntityCurrentValue: FormGroup =
      this.getFormGroupOfTransaction('entityName', payload.attribute);

    if (formFieldEntityCurrentValue) {
      formFieldEntityCurrentValue.get('dataType').setValue(null);
      formFieldEntityCurrentValue.get('entityName').setValue(null);
      formFieldEntityCurrentValue.get('dataType').enable({
        emitEvent: false,
      });
      (formFieldEntityCurrentValue.get('functions') as FormArray).clear();
      this.addRowFunction(formFieldEntityCurrentValue);
    }

    if (!formField || !payload.functions?.length) {
      return;
    }

    const control = formField.controls;

    const dataType =
      this.parameters$?.tipoDato.find(
        (x) => x.tipoDato == payload.functions[0].tipoDato
      )?.idTipoDato ?? null;

    if (!dataType) {
      return;
    }

    const isDiferentDataType = dataType != control['dataType'].value;

    control['entityName'].setValue(payload.attribute);
    control['dataType'].setValue(dataType, {
      emitEvent: isDiferentDataType,
    });
    control['dataType'].disable({
      emitEvent: false,
    });

    const formFunctions = control['functions'] as FormArray;

    if (isDiferentDataType) {
      formFunctions.clear();
    }

    const idFunctions: Array<number> = formFunctions
      .getRawValue()
      .map((x) => +x.type);

    interface IPayloadTranformed {
      isFunctionOfEntity: boolean;
      type: number;
      parameters: Array<{
        isParameterOfEntity: boolean;
        parameter: any;
        parameterType: any;
        detail: string;
      }>;
    }

    /* Transforming the payload.functions array into a new array of objects. */

    const payloadFunctionsTransformed: Array<IPayloadTranformed> =
      payload.functions.map((f) => ({
        isFunctionOfEntity: true,
        type: f.idFuncion,
        parameters: f.argumentos.map((domains) => ({
          isParameterOfEntity: true,
          parameter: null,
          parameterType: null,
          detail: domains,
        })),
      }));

    payloadFunctionsTransformed.map((payloadFunction) => {
      /* Checking if the idFunctions array includes the type of the payloadFunction. If it does not, it
      resets the formFunction and pushes the payloadFunction to the formFunctions array. */
      if (!idFunctions.includes(+payloadFunction.type)) {
        this.formFunction().reset();
        formFunctions.push(this.formFunction(payloadFunction));
      }

      /* Disabling the form controls and setting the values of the form controls. */
      if (idFunctions.includes(+payloadFunction.type)) {
        const funct: FormGroup = formFunctions.controls.find(
          (fg) => fg.get('type').value == payloadFunction.type
        ) as FormGroup;
        funct.get('isFunctionOfEntity').setValue(true, {
          emitEvent: false,
        });
        funct.get('type').disable({
          emitEvent: false,
        });

        const params = funct.get('parameters') as FormArray;
        params.controls.forEach((fg: FormGroup) => {
          fg.get('isParameterOfEntity').setValue(true, {
            emitEvent: true,
          });
          fg.disable({
            emitEvent: false,
          });

          fg.get('detail').enable({
            emitEvent: false,
          });
        });
      }

      const functionControl = formFunctions.controls
        .map((formGroup: FormGroup) => formGroup.controls)
        .find(
          (formControl: { [key: string]: AbstractControl }) =>
            formControl['type'].value ?? payloadFunction.type
        );

      functionControl['isFunctionOfEntity'].setValue(true, {
        emitEvent: false,
      });
      functionControl['type'].disable({
        emitEvent: false,
      });

      const parameters = functionControl['parameters'] as FormArray;
      parameters.controls
        .map((formGroup: FormGroup) => formGroup.controls)
        .map((formControl: { [key: string]: AbstractControl }) => {
          formControl['parameter'].disable({
            emitEvent: false,
          });
          formControl['parameterType'].disable({
            emitEvent: false,
          });
        });
    });

    /* Creating an array of indexes of the controls that do not have a type. */
    let ids = [];
    formFunctions.controls.map((formGroup, index) => {
      if (formGroup.get('type').value) {
        return;
      }

      ids.push(index);
    });

    /* Sorting the array in descending order and then removing the elements from the array. */
    ids = ids.sort((a, b) => b - a);

    ids.map((id) => {
      formFunctions.removeAt(id);
    });
  }

  private setDetailOfStorageForAction(): void {
    const params = this.storage?.params ?? {};

    /* Checking if the action is included in the array. */
    const actionIncludes: Array<string> = ['actualizar', 'detalle', 'clonar'];
    const isIncludeAction: boolean = actionIncludes.includes(params.action);

    if (isIncludeAction) {
      const structure = params.structure;

      interface IAttribute {
        argumento: Array<string>;
        campo: string;
        dominio: Array<string>;
        funcion: Array<number>;
        id: string;
        idTipoDato: number;
        obligatorio: string;
        origen: Array<string>;
        valorUnico: string;
      }

      const fields: Array<IAttribute> = structure.listaAtributos ?? [];

      /* Mapping an array of objects and transforming them into another array of objects. */
      fields.map((field: IAttribute) => {
        const fieldTransformed = {
          fieldId: field.id,
          inputData: field.campo,
          dataType: `${field.idTipoDato}`,
          required: field.obligatorio == 'true',
          uniqueValue: field.valorUnico == 'true',
          functions: field.funcion.map((func: number, fi: number) => ({
            type: `${func}`,
            parameters: field.argumento[fi]?.split(',')?.map((p, pi) => ({
              parameter: p || null,
              parameterType: field.origen[fi]?.split(',')[pi] || null,
              detail: field.dominio[fi]?.split(',')[pi] || null,
            })),
          })),
        };

        this.addRowTransaction(fieldTransformed);
      });
      return;
    }

    /* Checking if the storage object is not null and if the read property is not null. If both are not
    null, it will assign the read property to the readStorage variable. */
    const readStorage = this.storage?.read ?? {};
    const isNotEmptyReadFields = readStorage.transactions?.length;

    if (isNotEmptyReadFields) {
      readStorage.transactions.map((field) => {
        this.addRowTransaction(field);
      });
      return;
    }

    this.addRowTransaction();
  }

  set selectTab(value: 'transaction' | 'notification') {
    this.tabSelected = value;
    this.dropdownSelected = value;
  }

  set selectDropdown(value: 'transaction' | 'notification') {
    this.dropdownSelected = this.dropdownSelected == value ? null : value;
  }

  /**
   * It returns an array of all the transactions that have an inputData value that is not equal to the
   * inputData value of the form.
   * @param {FormGroup} form - FormGroup - the form that contains the field
   * @returns An array of objects that have an inputData property that is not equal to the value of the
   * inputData property of the form.
   */
  readingFieldList(form: FormGroup): Array<any> {
    const controls = form.controls;
    return this.transactions
      .getRawValue()
      .filter((x) => x.inputData && x.inputData != controls['inputData'].value);
  }

  private getParameters(): void {
    if (this.desgravamenService.storage?.parametros) {
      this.parameters$ = this.desgravamenService.storage?.parametros;
      this.initValues();
      return;
    }

    this.configurationService.getParameters().subscribe({
      next: (response: any) => {
        if (!response.success) {
          return;
        }

        this.parameters$ = response;
        this.parameters$.tipoValorParametro =
          response.tipoValorParametro.filter((x) => x.idTipoValor != 2);

        this.desgravamenService.storage = {
          parametros: this.parameters$,
        };

        this.initValues();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  // *Transacciones
  //#region
  /**
   * If the value is true, enable the controls, otherwise disable the controls.
   * @param {any} formArrayParameters - FormArray
   * @param {string} value - string - the value of the checkbox
   */
  private validateFunctionParameters(
    formArrayParameters: any,
    value: string
  ): void {
    formArrayParameters.controls.forEach((form) => {
      const control = form.controls;
      if (value) {
        control['parameter'].enable();
        control['parameterType'].enable();
        control['detail'].enable();
      } else {
        control['parameter'].disable();
        control['parameterType'].disable();
        control['detail'].disable();
      }
    });
  }

  /**
   * "If the index is the last index of the array, or if the array only has one element, and the
   * isFunctionOfEntity checkbox is not checked, then return true."
   * </code>
   * @param control - { [key: string]: AbstractControl }
   * @param {number} index - number - the index of the current row
   * @returns a boolean value.
   */
  showButtonAddRowFunctionParamter(
    control: { [key: string]: AbstractControl },
    index: number
  ): boolean {
    const parameters = control['parameters'] as FormArray;
    return (
      (index++ === parameters.length || parameters.length === 1) &&
      !control['isFunctionOfEntity'].value
    );
  }

  /**
   * "If the formArray has a length of 0, then the formGroup is required, otherwise it is not
   * required."
   * @param {FormGroup} form - FormGroup
   */
  addRowFunctionParameter(form: FormGroup): void {
    const formArray = form.get('parameters') as FormArray;
    const formGroup = this.formParameters();

    formGroup.reset();
    formArray.push(this.formParameters());

    this.validateFunctionParameters(formArray, form.get('type').value);
  }

  private formParameters(data: any = {}): FormGroup {
    const form = this.builder.group({
      isParameterOfEntity: [data.isParameterOfEntity ?? false],
      parameter: [
        {
          value: data.parameter ?? null,
          disabled: !Object.keys(data).length || data?.isParameterOfEntity,
        },
      ],
      parameterType: [
        {
          value: data.parameterType ?? null,
          disabled: !Object.keys(data).length || data?.isParameterOfEntity,
        },
      ],
      detail: [
        {
          value: data.detail ?? null,
          disabled: !Object.keys(data).length,
        },
      ],
    });

    if (this.storage?.params?.action == 'detalle') {
      form.disable();
    }

    return form;
  }

  private formFunction(data: any = {}): FormGroup {
    const formParameters = this.formParameters();

    const form: FormGroup = this.builder.group({
      isFunctionOfEntity: [data.isFunctionOfEntity ?? false],
      type: [
        {
          value: data.type ?? null,
          disabled: !!data.isFunctionOfEntity,
        },
      ],
      parameters: this.builder.array([formParameters]),
    });

    if (this.storage?.params?.action == 'detalle') {
      form.disable();
    }

    const formControl = form.controls;

    if (data.parameters?.length) {
      const parameters = formControl['parameters'] as FormArray;
      parameters.clear();
      data.parameters.map((parameter) => {
        parameters.push(this.formParameters(parameter));
      });
    }

    formControl['type'].valueChanges.subscribe(() => {
      (formControl['parameters'] as FormArray).clear();
      this.addRowFunctionParameter(form);
    });

    return form;
  }

  private emitChanges(): void {
    this.configurationService.subject.next({
      key: this.configurationService.subjectEvents.CHANGES.READ_FIELDS,
      payload: (
        this.transactions.getRawValue().filter((x) => x.inputData) ?? []
      ).map((x) => x.inputData),
    });
  }

  addRowTransaction(data: any = {}): void {
    if (this.transactions.invalid) {
      return;
    }

    const values: Array<any> = this.transactions.getRawValue();
    if (values.length >= 1 && this.transactions.invalid) {
      return;
    }

    this.formFunction().reset();

    const form: FormGroup = this.builder.group({
      fieldId: [data.fieldId ?? null],
      id: [new Date().getTime()],
      entityName: [data.entityName ?? null],
      inputData: [data.inputData ?? '', Validators.required],
      dataType: [
        {
          value: data.dataType ?? null,
          disabled: !!data.entityName,
        },
        Validators.required,
      ],
      required: [data.required ?? false, Validators.required],
      uniqueValue: [
        {
          value: data.uniqueValue ?? false,
          disabled: true,
        },
        Validators.required,
      ],
      functions: this.builder.array([this.formFunction(data.functions)]),
    });

    if (this.storage?.params?.action == 'detalle') {
      form.disable();
    }

    const control = form.controls;

    if (data.functions?.length) {
      const functions = control['functions'] as FormArray;
      functions.clear();
      data.functions.map((func) => {
        functions.push(this.formFunction(func));
      });
    }

    /* Subscribing to the valueChanges of the inputData control. */
    control['inputData'].valueChanges.pipe(debounceTime(500)).subscribe(() => {
      const functions = control['functions'] as FormArray;
      functions.controls.map((funct: FormGroup) => {
        const functControl = funct.controls;
        const parameters = functControl['parameters'] as FormArray;

        parameters.controls.map((param: FormGroup) => {
          const paramControl = param.controls;

          if (paramControl['parameterType'].value == 0) {
            paramControl['detail'].setValue(null);
          }
        });
      });

      control['dataType'].enable({
        emitEvent: false,
      });

      this.emitChanges();
    });

    // *Cuando se cambia el tipo de dato se eliminan todas las funciones del campo
    control['dataType'].valueChanges.subscribe(() => {
      (form.get('functions') as FormArray).clear();
      this.addRowFunction(form);
    });

    this.transactions.push(form);

    if (data.inputData) {
      this.emitChanges();
    }
  }

  /**
   * It adds a new form group to the form array.
   * @param {FormGroup} form - FormGroup - the form that contains the formArray
   */
  addRowFunction(form: FormGroup): void {
    const formArray = form.get('functions') as FormArray;

    this.formFunction().reset();
    formArray.push(this.formFunction());
  }

  /**
   * If the formArray has more than one element, remove the element at the given index. If the
   * formArray has only one element, reset the element at the given index
   * @param {FormGroup} form - FormGroup - the form group that contains the form array of functions
   * @param {number} index - number - the index of the function to remove
   * @returns the formArray.
   */
  removeRowFunction(form: FormGroup, index: number): void {
    const formArray = form.get('functions') as FormArray;

    if (formArray.length > 1) {
      formArray.removeAt(index);
      return;
    }

    const formFunction = formArray.at(index) as FormGroup;

    formFunction.reset();
    const array = formFunction.get('parameters') as FormArray;
    array.clear();
    this.addRowFunctionParameter(formFunction);
  }

  /**
   * If the formArray has more than one element, remove the element at the given index. Otherwise,
   * reset the element at the given index
   * @param {FormGroup} form - FormGroup - the form group that contains the form array
   * @param {number} index - number - the index of the row to remove
   * @returns the formArray.
   */
  removeRowFunctionParameter(form: FormGroup, index: number): void {
    const formArray = form.get('parameters') as FormArray;

    if (formArray.length > 1) {
      formArray.removeAt(index);
      return;
    }

    const formFunction = formArray.at(index) as FormGroup;
    formFunction.reset();
  }

  /**
   * If the length of the array is 1, then clear the array and add a new row. Otherwise, remove the row
   * at the given index.
   * @param {number} index - number - the index of the row to be removed
   * @returns The return type is void.
   */
  removeRowField(index: number): void {
    if (this.transactions.length == 1) {
      this.transactions.clear();
      this.addRowTransaction();
      this.emitChanges();
      return;
    }

    this.transactions.removeAt(index);

    /* Emitting changes to the parent component. */
    this.emitChanges();
  }

  /**
   * If the index of the current function is the last function in the array, or if there is only one
   * function in the array, then show the button.
   * @param index - the index of the function in the array of functions
   * @param {number} functionsLength - the length of the functions array
   * @returns a boolean value.
   */
  showButtonAddFunction(index, functionsLength: number): boolean {
    return index === functionsLength || functionsLength === 1;
  }

  /* Checking if the length of the array of objects that have the same idFuncion as the value passed in
  is equal to the length of the array passed in. */
  disableAddFunction(value: number, array: Array<FormGroup>): boolean {
    const functionsLength = this.parameters$.funciones?.filter(
      (x) => x.idTipoDato == value && x.idTipoFuncion == 1
    ).length;
    return functionsLength == 0 ? true : functionsLength == array.length;
  }

  /**
   * It returns true if the length of the array of objects that have the same idFuncion as the value
   * passed in is equal to the length of the array passed in.
   * @param {number} value - number, array: Array&lt;FormGroup&gt;
   * @param array - Array&lt;FormGroup&gt;
   * @returns The length of the array.
   */
  disableAddFunctionParameter(value: number, array: Array<FormGroup>): boolean {
    return (
      this.parameters$?.parametros?.filter((x) => x.idFuncion == value)
        .length == array.length
    );
  }

  /**
   * It takes a FormArray, gets the raw values of the FormArray, maps the values to the parameterType
   * property of the FormArray, and returns the mapped values as an array of numbers.
   * @param {FormArray} formParameter - FormArray
   * @returns An array of numbers.
   */
  includesValueTypesOfParameter(formParameter: FormArray): Array<number> {
    const values = formParameter.getRawValue();
    const res = values.map((x) => +x.parameterType);
    return res;
  }

  /**
   * "return true if idTipoFuncion is 1 and form.get('dataType').value is equal to idTipoDato and
   * this.isVisibleOption(form, 'functions', indexf, 'type', idFuncion) is true and idFuncion is not
   * equal to 26"
   * @param  - idTipoFuncion = 1
   * @param {FormGroup} form - FormGroup
   * @param {number} indexf - number - the index of the function in the array of functions
   * @returns A boolean value.
   */
  isFunctionType1AndMatchingDataType(
    { idTipoFuncion, idFuncion, idTipoDato },
    form: FormGroup,
    indexf: number
  ): boolean {
    return (
      +idTipoFuncion === 1 &&
      +form.get('dataType').value === +idTipoDato &&
      this.isVisibleOption(form, 'functions', indexf, 'type', +idFuncion) &&
      +idFuncion !== 26
    );
  }

  /**
   * "If the idFuncion is 26 and the idTipoDato is 2 and the inputData is NMUNICIPALITY and the
   * function is visible, then return true."
   * @param  - { idFuncion, idTipoDato }
   * @param {FormGroup} form - FormGroup
   * @param {number} indexf - number - the index of the function in the array
   * @returns A boolean value.
   */
  isFunctionType26AndMatchingInputData(
    { idFuncion },
    form: FormGroup,
    indexf: number
  ): boolean {
    return (
      +idFuncion === 26 &&
      +form.get('dataType').value == 2 &&
      ((form.get('inputData').value ?? '') as string).toUpperCase() ===
        'NMUNICIPALITY' &&
      this.isVisibleOption(form, 'functions', indexf, 'type', +idFuncion)
    );
  }

  /**
   * It takes a form, a control name, an index to exclude, a key to compare, and a value to compare
   * against. It then returns true if the value is not found in the array of values for the control.
   * @param {FormGroup} form - FormGroup - the form group that contains the control
   * @param {string} controlName - the name of the control in the form
   * @param {number} exludeIndex - The index of the current item in the array.
   * @param {string} key - the key of the object in the array that you want to check against
   * @param {number} value - number - the value of the select option
   * @returns a boolean value.
   */
  isVisibleOption(
    form: FormGroup,
    controlName: string,
    exludeIndex: number,
    key: string,
    value: number
  ): boolean {
    let array: Array<any> = form.getRawValue()[controlName];
    array = array.map((x) => +x[key]);
    const filtered = array.filter((x) => x !== array[exludeIndex]);
    return !filtered.includes(+value);
  }
  //#endregion
}
