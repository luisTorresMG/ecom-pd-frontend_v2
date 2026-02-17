import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';

import { UtilsService } from '@shared/services/utils/utils.service';
import { PlotConfigurationService } from '../../shared/services/plot-configuration.service';

import { fadeAnimation } from '@shared/animations/animations';

@Component({
  selector: 'app-configuration-plot',
  templateUrl: './configuration-plot.component.html',
  styleUrls: ['./configuration-plot.component.sass'],
  animations: [fadeAnimation],
})
export class ConfigurationPlotComponent implements OnInit {
  formPlot: FormGroup = this.builder.group({
    structure: this.builder.group({
      description: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(100)]),
      ],
      branch: ['', Validators.required],
      product: ['', Validators.required],
      fileType: [{ value: 1, disabled: true }, Validators.required],
      startRow: [
        1,
        Validators.compose([Validators.required, Validators.min(1)]),
      ],
      startColumn: [
        1,
        Validators.compose([Validators.required, Validators.min(1)]),
      ],
      reniecApply: [0, Validators.required],
      hasHeader: [1, Validators.required],
      tabIndex: [0, Validators.required],
      dateFormat: ['yyyyMMdd', Validators.required],
      separator: [',', Validators.required],
    }),
    arguments: this.builder.array([]),
    fields: this.builder.array([]),
    outputFields: this.builder.array([]),
  });

  formFormula: FormGroup = this.builder.group({
    formula: [null],
  });

  formulaInfo: { form: FormGroup; controlName: string } = null;

  // *Variable para el tab seleccionado (Argumentos | Lectura | Salida)
  fieldDetailTypeSelected: 'args' | 'read' | 'output' = 'args'; // ARGUMENTOS - LECTURA - SALIDA

  // *Declaración de variables de parametros de Trama, lista de Ramos y Productos
  parameters$: any = null;
  branches$: Array<any> = [];
  products$: Array<any> = [];

  // *Declaración de variable para mostrar mensajes de error
  messageInfo = '';

  // *Declaración de variable para mostrar mensajes de respuesta de los API´s
  responseInfo: any = null;

  // *Textarea de formula
  @ViewChild('inputFormula', { static: false, read: ElementRef })
  inputFormula: ElementRef;

  // *Modal definir fórmula
  @ViewChild('modalFormula', { static: true, read: TemplateRef })
  modalFormula: TemplateRef<ElementRef>;

  // *Modal de confirmación de guardar estructura
  @ViewChild('modalConfirmSave', { static: true, read: TemplateRef })
  modalConfirmSave: TemplateRef<ElementRef>;

  // *Modal de mensaje
  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  modalMessage: TemplateRef<ElementRef>;

  constructor(
    private readonly builder: FormBuilder,
    private readonly vc: ViewContainerRef,
    private readonly spinner: NgxSpinnerService,
    private readonly router: Router,
    private readonly utilsService: UtilsService,
    private readonly plotConfigurationService: PlotConfigurationService
  ) {}

  ngOnInit(): void {
    this.addRowField();
    this.addRowOutputField();
    this.addRowArgument();
    this.getParameters();
    this.getBranches();
    this.formValueChanges();
    this.valueChangesFormula();
    this.getDetail();
  }

  /**
   * Obtener detalle de estructura si existen los parametros en la sessionStorage
   * Deshabilitar el formulario si el usuario no está en modo de escritura.
   */
  // *Obtener detalle de estructura
  private getDetail(): void {
    const params = this.utilsService.decryptStorage('_detalle_estructura-ps');

    if (!Object.values(params).length) {
      // *Eliminar query params de URL
      this.router.navigate([]);
      return;
    }

    this.spinner.show();
    this.plotConfigurationService.getDetail(params.structureId).subscribe({
      next: (response: any) => {
        this.formPlotControl['structure'].patchValue(response.structure, {
          emitEvent: false,
        });
        this.getProducts();

        this.formArguments.clear();
        response.arguments.map((item) => {
          this.addRowArgument(item);
        });

        this.formFields.clear();
        response.read.map((item) => {
          this.addRowField(item);
        });

        this.formOutputFields.clear();
        response.output.map((item) => {
          this.addRowOutputField(item);
        });

        this.formPlot.markAllAsTouched();

        if (params.ref == 'write') {
          return;
        }

        this.formPlot.disable({
          emitEvent: false,
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  /**
   * Obtiene los parámetros del servicio y
   * los asigna a la variable de parámetros$.
   */
  // *Obtener lista de parametros
  private getParameters(): void {
    this.plotConfigurationService.getParameters().subscribe({
      next: (response: any) => {
        response.funciones = (response?.funciones ?? []).filter(
          (x) => x.idFuncion != 26
        );
        this.parameters$ = response;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
      complete: () => {},
    });
  }

  // *Obtener lista de Ramos
  private getBranches(): void {
    this.utilsService.getBranches().subscribe({
      next: (response: any) => {
        this.branches$ = response;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  // *Obtener lista de productos por Ramo
  private getProducts(): void {
    this.products$ = [];

    if (!this.formStructureControl['branch'].value) {
      return;
    }

    this.spinner.show();

    const payload = {
      branchId: +this.formStructureControl['branch'].value,
      userType: this.currentUser['tipo'],
    };
    this.utilsService.getProducts(payload).subscribe({
      next: (response: any) => {
        this.products$ = response;
        this.spinner.hide();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  /**
   * Devuelve el usuario actual.
   * @returns El objeto currentUser de localStorage.
   */
  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  get sessionDetailStorage(): any {
    return this.utilsService.decryptStorage('_detalle_estructura-ps');
  }

  /**
   * Devuelve un objeto cuyas claves son los nombres de los controles de formulario
   * y los valores son los Objetos AbstractControl.
   * @returns formPlotControl devuelve los controles formPlot.
   */
  // *Estructura, Argumentos, Lectura, Salida
  get formPlotControl(): { [key: string]: AbstractControl } {
    return this.formPlot.controls;
  }

  // *Controles de formulario de structura
  get formStructureControl(): { [key: string]: AbstractControl } {
    return (this.formPlotControl['structure'] as FormGroup).controls;
  }

  // *Form Array de argumentos
  get formArguments(): FormArray {
    return this.formPlotControl['arguments'] as FormArray;
  }

  // *Validar formulario de argumentos
  get validFormArguments(): boolean {
    return this.formArguments.controls.every((m: FormGroup) => {
      const values = m.getRawValue();
      return Object.values({
        a: values.name,
        b: values.dataType,
      }).every((e: any) => e);
    });
  }

  /* Creando un getter para formArray. */
  // *Form Array de campos (Lectura)
  get formFields(): FormArray {
    return this.formPlotControl['fields'] as FormArray;
  }

  // *Form Array de campos (Salida)
  get formOutputFields(): FormArray {
    return this.formPlotControl['outputFields'] as FormArray;
  }

  // *Lista de array de campos con nombre de campo (Lectura)
  get readingFieldList(): Array<any> {
    return this.formFields.getRawValue().filter((x) => x.inputData);
  }

  // *Lista de array de campos con nombre de campo (Salida)
  get outputFieldList(): Array<any> {
    return this.formOutputFields.getRawValue().filter((x) => x.outputData);
  }

  // *Form formula controles
  get formFormulaControl(): { [key: string]: AbstractControl } {
    return this.formFormula.controls;
  }

  /**
   * Si el valor de formStructureControl['reniecApply'] es 1,
   * habilite targetField y configure el valor a nulo.
   * Si el valor de formStructureControl['reniecApply'] no es 1,
   * deshabilite targetField y establezca el valor en nulo.
   */
  private formValueChanges(): void {
    this.formStructureControl['branch'].valueChanges.subscribe(
      (value: string) => {
        if (value) {
          this.getProducts();
        }
      }
    );

    this.formStructureControl['reniecApply'].valueChanges.subscribe(
      (value: string) => {
        if (+value == 1) {
          this.formFields.controls.forEach((form: FormGroup) => {
            const control = form.controls;

            control['targetField'].setValue(null);
            control['targetField'].enable();
            control['targetField'].updateValueAndValidity();
          });
          return;
        }

        this.formFields.controls.forEach((form: FormGroup) => {
          const control = form.controls;

          control['targetField'].setValue(null);
          control['targetField'].disable();
          control['targetField'].updateValueAndValidity();
        });
      }
    );
  }

  /**
   * This function returns a FormGroup object that contains a FormControl object for each of the three
   * form fields in the form.
   * @returns A FormGroup with 3 FormControls.
   */
  // *Retorna FormGroup de parametros de una función (Lectura)
  private formParameters(data: any = {}): FormGroup {
    const form = this.builder.group({
      parameter: [
        { value: data.parameter ?? null, disabled: !Object.keys(data).length },
      ],
      parameterType: [
        {
          value: data.parameterType ?? null,
          disabled: !Object.keys(data).length,
        },
      ],
      detail: [
        { value: data.detail ?? null, disabled: !Object.keys(data).length },
      ],
    });
    const control = form.controls;
    control['parameterType'].valueChanges.subscribe(() => {
      control['detail'].setValue(null);
    });
    return form;
  }

  // *Retorna FormGroup de parametros de una función (Salida)
  private formOutputParameters(data: any = {}): FormGroup {
    const form = this.builder.group({
      functionParameter: [
        {
          value: data.functionParameter ?? null,
          disabled: !Object.keys(data).length,
        },
      ],
      valueTypeParameter: [
        {
          value: data.valueTypeParameter ?? null,
          disabled: !Object.keys(data).length,
        },
      ],
      parameterValue: [
        {
          value: data.parameterValue ?? null,
          disabled: !Object.keys(data).length,
        },
      ],
    });
    const control = form.controls;
    control['valueTypeParameter'].valueChanges.subscribe(() => {
      control['parameterValue'].setValue(null);
    });
    return form;
  }

  // *Crear un grupo de formularios con una matriz de formularios.
  private formFunction(data: any = {}): FormGroup {
    const formParameters = this.formParameters();

    const form: FormGroup = this.builder.group({
      type: [data.type ?? null],
      parameters: this.builder.array([formParameters]),
    });
    const formControl = form.controls;

    if (data.parameters?.length) {
      const parameters = formControl['parameters'] as FormArray;
      parameters.clear();
      data.parameters.map((x) => {
        parameters.push(this.formParameters(x));
      });
    }

    formControl['type'].valueChanges.subscribe(() => {
      (formControl['parameters'] as FormArray).clear();
      this.addRowFunctionParameter(form);
    });

    return form;
  }

  // *Retorna FormGroup de funciones de un campo (Salida)
  private formOutputFunction(data: any = {}): FormGroup {
    const form: FormGroup = this.builder.group({
      functionType: [data.functionType ?? null],
      parameters: this.builder.array([this.formOutputParameters()]),
    });

    const formControl = form.controls;

    if (data.parameters?.length) {
      const parameters = formControl['parameters'] as FormArray;
      parameters.clear();
      data.parameters.map((x) => {
        parameters.push(this.formOutputParameters(x));
      });
    }

    formControl['functionType'].valueChanges.subscribe(() => {
      const parameters = formControl['parameters'] as FormArray;
      parameters.clear();
      this.addRowOutputFunctionParameter(form);
      parameters.controls.forEach((formGroup: FormGroup) => {
        const parameterControl = formGroup.controls;
      });
    });

    return form;
  }

  /**
   * Si el valor es verdadero, configure los validadores como requeridos y habilite los controles.
   * Si el valor es falso,
   * entonces elimina las validaciones y deshabilita los controles
   * @param {any} formArrayParameters - FormArray
   * @param {string} value - string - the value of the checkbox
   */
  //#region
  private validateFunctionParameters(
    formArrayParameters: any,
    value: string
  ): void {
    formArrayParameters.controls.forEach((form) => {
      const control = form.controls;
      if (value) {
        control['parameter'].setValidators(Validators.required);
        control['parameterType'].setValidators(Validators.required);
        control['detail'].setValidators(Validators.required);

        control['parameter'].enable();
        control['parameterType'].enable();
        control['detail'].enable();
      } else {
        control['parameter'].clearValidators();
        control['parameterType'].clearValidators();
        control['detail'].clearValidators();

        control['parameter'].disable();
        control['parameterType'].disable();
        control['detail'].disable();
      }

      control['parameter'].updateValueAndValidity();
      control['parameterType'].updateValueAndValidity();
      control['detail'].updateValueAndValidity();
    });
  }

  private validateOutputFunctionParameters(
    formArrayParameters: any,
    value: string
  ): void {
    formArrayParameters.controls.forEach((form) => {
      const control = form.controls;
      if (value) {
        control['functionParameter'].setValidators(Validators.required);
        control['parameterValue'].setValidators(Validators.required);
        control['valueTypeParameter'].setValidators(Validators.required);

        control['functionParameter'].enable();
        control['parameterValue'].enable();
        control['valueTypeParameter'].enable();
      } else {
        control['functionParameter'].clearValidators();
        control['parameterValue'].clearValidators();
        control['valueTypeParameter'].clearValidators();

        control['functionParameter'].disable();
        control['parameterValue'].disable();
        control['valueTypeParameter'].disable();
      }

      control['functionParameter'].updateValueAndValidity();
      control['parameterValue'].updateValueAndValidity();
      control['valueTypeParameter'].updateValueAndValidity();
    });
  }
  //#endregion

  /**
   * Si el formulario es válido, agregue una nueva fila al formulario.
   * @returns Se devuelve formArguments.
   */
  // *Agregar nuevo fila de argumentos
  addRowArgument(data: any = {}): void {
    const values: Array<any> = this.formArguments.getRawValue();

    if (values.length >= 1 && this.formArguments.invalid) {
      return;
    }

    const form: FormGroup = this.builder.group({
      argumentId: [data.argumentId ?? null],
      name: [data.name ?? ''],
      dataType: [data.dataType ?? null],
      defaultValue: [data.defaultValue ?? ''],
    });
    const control = form.controls;

    form.valueChanges.subscribe((vals: any) => {
      const formValues = Object.values(vals);

      if (formValues.some((x) => x)) {
        control['name'].setValidators(Validators.required);
        control['dataType'].setValidators(Validators.required);
      } else {
        control['name'].clearValidators();
        control['dataType'].clearValidators();
      }

      control['name'].updateValueAndValidity({
        emitEvent: false,
      });
      control['dataType'].updateValueAndValidity({
        emitEvent: false,
      });
    });

    this.formArguments.push(form);
  }

  /**
   * Devuelve una matriz de números, donde cada número es el valor de la propiedad dataType de cada
   * objeto en la matriz de objetos que es el valor de la propiedad
   * formArguments de la actual instancia de la clase
   * @returns Una matriz de números.
   */
  // *Array de tipos de datos seleccionados en el formulario de argumentos
  get dataTypesArguments(): Array<number> {
    const values = this.formArguments.getRawValue();
    const res = values.map((x) => +x.dataType);
    return res;
  }

  /**
   * Devuelve una matriz de objetos que tienen
   * un nombre y una propiedad de tipo de datos.
   * @returns Una matriz de objetos.
   */
  // *Obtener lista de argumentos validos de la lista de formularios de argumentos
  get argumentsList(): Array<any> {
    const array = this.formArguments.controls.filter(
      (x) => x.valid || x.disabled
    );
    const values = array
      .map((x: FormGroup) => x.getRawValue())
      .filter((x) => x.name && x.dataType);

    return values;
  }

  // *Remover argumento, si solo hay un argumento se resetea el formulario
  removeRowArgument(index: number): void {
    if (this.formArguments.length == 1) {
      (this.formArguments.controls[index] as FormGroup).reset();
      return;
    }
    this.formArguments.removeAt(index);
  }

  // *Agregar nuevo campo de lectura
  addRowField(data: any = {}): void {
    const values: Array<any> = this.formFields.getRawValue();
    if (values.length >= 1 && this.formFields.invalid) {
      return;
    }

    this.formFunction().reset();

    const form: FormGroup = this.builder.group({
      fieldId: [data.fieldId ?? null],
      id: [new Date().getTime()],
      inputData: [data.inputData ?? '', Validators.required],
      dataType: [data.dataType ?? null, Validators.required],
      required: [data.required ?? false, Validators.required],
      targetField: [
        {
          value: data.targetField ?? null,
          disabled: this.formStructureControl['reniecApply'].value == 0,
        },
      ],
      uniqueValue: [data.uniqueValue ?? false, Validators.required],
      functions: this.builder.array([this.formFunction()]),
    });

    const control = form.controls;

    if (data.functions?.length) {
      const functions = control['functions'] as FormArray;
      functions.clear();
      data.functions.map((x) => {
        functions.push(this.formFunction(x));
      });
    }

    control['inputData'].valueChanges.subscribe(() => {
      const functions = control['functions'] as FormArray;
      functions.controls.forEach((funct: FormGroup) => {
        const functControl = funct.controls;
        const parameters = functControl['parameters'] as FormArray;

        parameters.controls.forEach((param: FormGroup) => {
          const paramControl = param.controls;

          if (paramControl['parameterType'].value == 0) {
            paramControl['detail'].setValue(null);
          }
        });
      });
    });

    // *Cuando se cambia el tipo de dato se eliminan todas las funciones del campo
    control['dataType'].valueChanges.subscribe(() => {
      (form.get('functions') as FormArray).clear();
      this.addRowFunction(form);
    });

    this.formFields.push(form);
  }

  // *Agregar nuevo campo de salida
  addRowOutputField(data: any = {}): void {
    const values: Array<any> = this.formOutputFields.getRawValue();
    if (values.length >= 1 && this.formOutputFields.invalid) {
      return;
    }

    this.formOutputFunction().reset();
    const form: FormGroup = this.builder.group({
      fieldId: [data.fieldId ?? null],
      outputData: [data.outputData ?? '', Validators.required],
      dataTypeField: [data.dataTypeField ?? null, Validators.required],
      valueTypeField: [data.valueTypeField ?? false, Validators.required],
      fieldValue: [data.fieldValue ?? null],
      functions: this.builder.array([this.formOutputFunction()]),
    });

    const control = form.controls;

    if (data.functions?.length) {
      const functions = control['functions'] as FormArray;
      functions.clear();
      data.functions.map((x) => {
        functions.push(this.formOutputFunction(x));
      });
    }

    // *Cuando se cambia el nombre del campo y el tipo de valor del campo es campoEntrada se resetea el valor del campo
    control['outputData'].valueChanges.subscribe(() => {
      if (control['valueTypeField'].value == 0) {
        control['fieldValue'].setValue(null);
      }
      const functions = control['functions'] as FormArray;
      functions.controls.forEach((funct: FormGroup) => {
        const functControl = funct.controls;
        const parameters = functControl['parameters'] as FormArray;

        parameters.controls.forEach((param: FormGroup) => {
          const paramControl = param.controls;

          if (paramControl['valueTypeParameter'].value == 0) {
            paramControl['parameterValue'].setValue(null);
          }
        });
      });
    });

    // *Cuando se cambia el tipo de dato se eliminan todas las funciones del campo
    control['dataTypeField'].valueChanges.subscribe(() => {
      (form.get('functions') as FormArray).clear();
      this.addRowOutputFunction(form);
    });

    // *Resetea el valor del campo cuando se cambia el tipo de valor del campo
    control['valueTypeField'].valueChanges.subscribe((value: string) => {
      control['fieldValue'].setValue(null);

      if (value) {
        control['fieldValue'].setValidators(Validators.required);
      } else {
        control['fieldValue'].clearValidators();
      }

      control['fieldValue'].updateValueAndValidity();
    });

    this.formOutputFields.push(form);
  }

  /**
   * Si la matriz formFields tiene solo un elemento, borre la matriz y agregue un nuevo elemento. De lo contrario,
   * eliminar el elemento en el índice especificado.
   * @param {number} index - number - el índice de la fila a eliminar
   * @returns The formFields.removeAt(index) está devolviendo el artículo retirado.
   */
  //#region
  // *Remover fila de campo (Lectura)
  removeRowField(index: number): void {
    if (this.formFields.length == 1) {
      this.formFields.clear();
      this.addRowField();
      return;
    }

    this.formFields.removeAt(index);
  }

  // *Remover fila de campo (Salida)
  removeRowOutputField(index: number): void {
    if (this.formOutputFields.length == 1) {
      this.formOutputFields.clear();
      this.addRowOutputField();
      return;
    }

    this.formOutputFields.removeAt(index);
  }
  //#endregion

  /* Agregar una nueva fila al formArray */
  // *Agregar nueva función al campo (Lectura)
  //#region
  addRowFunction(form: FormGroup): void {
    const formArray = form.get('functions') as FormArray;

    this.formFunction().reset();
    formArray.push(this.formFunction());
  }

  // *Agregar nueva función al campo (Salida)
  addRowOutputFunction(form: FormGroup): void {
    const formArray = form.get('functions') as FormArray;

    this.formOutputFunction().reset();
    formArray.push(this.formOutputFunction());
  }
  //#endregion

  /**
   * Si la longitud de la matriz de funciones es 0, devuelve verdadero; de lo contrario,
   * devuelve la longitud de la matriz de funciones es igual a la longitud de la matriz de grupos de formas.
   * @param {number} value - number =&gt; la identificación del tipo de datos
   * @param array - Array<FormGroup>
   * @returns un valor booleano
   */
  // *Deshabilitar botón agregar nueva función (Lectura/Salida)
  disableAddFunction(value: number, array: Array<FormGroup>): boolean {
    const functionsLength = this.parameters$?.funciones.filter(
      (x) => x.idTipoDato == value && x.idTipoFuncion == 1
    ).length;
    const res = functionsLength == 0 ? true : functionsLength == array.length;
    return res;
  }

  // *Eliminar función (Lectura)
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

  // *Eliminar función (Salida)
  removeRowOutputFunction(form: FormGroup, index: number): void {
    const formArray = form.get('functions') as FormArray;

    if (formArray.length > 1) {
      formArray.removeAt(index);
      return;
    }

    const formFunction = formArray.at(index) as FormGroup;

    formFunction.reset();
    const array = formFunction.get('parameters') as FormArray;
    array.clear();
    this.addRowOutputFunctionParameter(formFunction);
  }

  // *Agregar nuevo parametro de función (Lectura)
  addRowFunctionParameter(form: FormGroup): void {
    const formArray = form.get('parameters') as FormArray;

    const formGroup = this.formParameters();
    formGroup.reset();
    formArray.push(this.formParameters());
    this.validateFunctionParameters(formArray, form.get('type').value);
  }

  // *Agregar nuevo parametro de función (Salida)
  addRowOutputFunctionParameter(form: FormGroup): void {
    const formArray = form.get('parameters') as FormArray;

    const formGroup = this.formOutputParameters();
    formGroup.reset();
    formArray.push(formGroup);
    this.validateOutputFunctionParameters(
      formArray,
      form.get('functionType').value
    );
  }

  /**
   * Devuelve verdadero si la longitud de la matriz de objetos que tienen la misma idFuncion que el valor
   * pasado es igual a la longitud de la matriz pasada.
   * @param {number} value - number = id de la función
   * @param array - Array<FormGroup> = [];
   * @returns La longitud de la matriz.
   */
  // *Deshabilitar agregar nuevo parametro de función (Lectura/Salida)
  disableAddFunctionParameter(value: number, array: Array<FormGroup>): boolean {
    return (
      this.parameters$?.parametros.filter((x) => x.idFuncion == value).length ==
      array.length
    );
  }

  /**
   * Toma un FormArray, obtiene los valores sin procesar del FormArray, asigna los valores al tipo de parámetro
   * propiedad de FormArray y devuelve los valores asignados como una matriz de números.
   * @param {FormArray} formParameter - FormArray
   * @returns Una matriz de números.
   */
  includesValueTypesOfParameter(formParameter: FormArray): Array<number> {
    const values = formParameter.getRawValue();
    const res = values.map((x) => +x.parameterType);
    return res;
  }

  /* Eliminando la fila de formArray. */
  // *Eliminar parametro de función (Lectura)
  removeRowFunctionParameter(form: FormGroup, index: number): void {
    const formArray = form.get('parameters') as FormArray;

    if (formArray.length > 1) {
      formArray.removeAt(index);
      return;
    }

    const formFunction = formArray.at(index) as FormGroup;
    formFunction.reset();
  }

  // *Eliminar parametro de función (Salida)
  removeRowOutputFunctionParameter(form: FormGroup, index: number): void {
    const formArray = form.get('parameters') as FormArray;

    if (formArray.length > 1) {
      formArray.removeAt(index);
      return;
    }

    const formFunction = formArray.at(index) as FormGroup;
    formFunction.reset();
  }

  // *Cambios de valor del input de formula
  valueChangesFormula(): void {
    this.formFormulaControl['formula'].valueChanges.subscribe(
      (value: string) => {
        console.log(value);
        console.dir(this.inputFormula);
      }
    );
  }

  addSuggestForForumula(suggest: string): void {
    suggest = suggest.replace('[]', `['']`);

    const newSuggest =
      (this.formFormulaControl['formula'].value || '') + suggest;
    this.formFormulaControl['formula'].setValue(newSuggest);
  }

  // *Abrir modal fórmula
  openModalFormula(form: FormGroup, controlName: string): void {
    this.vc.clear();
    this.formulaInfo = {
      form: form,
      controlName: controlName,
    };
    this.vc.createEmbeddedView(this.modalFormula);
  }

  saveFormula(): void {}

  /**
   *  La función valida el formulario y devuelve un mensaje si el formulario no es válido.
   * @returns La cadena de información del mensaje.
   */
  // *Validar el formulario
  private get invalidForm(): string {
    const formStructure = this.formPlotControl['structure'] as FormGroup;
    const formFields = this.formPlotControl['fields'] as FormArray;
    const formOutputFields = this.formPlotControl['outputFields'] as FormArray;

    this.messageInfo = '';

    if (formStructure.invalid) {
      return (this.messageInfo =
        'Los campos de la estructura están incompletos');
    }

    if (formFields.invalid && formFields.length > 0) {
      return (this.messageInfo =
        'Los campos de la estructura de lectura están incompletos');
    }

    if (formOutputFields.invalid && formOutputFields.length > 0) {
      return (this.messageInfo =
        'Los campos de la estructura de salida están incompletos');
    }

    return this.messageInfo;
  }

  /**
   * Si el formulario no es válido, devuélvalo. De lo contrario, cierre todos los modales y abra el modo de confirmación de guardado.
   * @returns El valor devuelto es el resultado de la última expresión de la función.
   */
  // *Abrir modal de confirmación para guardar la estructura
  openModalConfirmSave(): void {
    if (this.invalidForm || this.sessionDetailStorage?.ref == 'read') {
      return;
    }

    this.closeModals();
    this.vc.createEmbeddedView(this.modalConfirmSave);
  }

  /**
   * @returns {
   *   "idEstructura": "1",
   *   "success": true,
   *   "message": "Se generó correctamente la estructura N°: 1"
   * }
   */
  // *Generar estructura
  onSubmit(): void {
    if (this.invalidForm) {
      return;
    }

    const fieldsArrayMap = new Array();
    const outputFieldsArrayMap = new Array();

    const plotValues = this.formPlot.getRawValue();
    delete plotValues.fields;

    const argumentsList = this.argumentsList;

    const fields = this.formFields.controls
      .filter((x) => x.valid)
      .map((x: FormGroup) => x.getRawValue());
    fields.map((field, index: number) => ({
      fields: field.functions.map((func) => ({
        funcs: func.parameters.map((param) => {
          const payload = {
            ...field,
            ...func,
            ...param,
            numeroOrden: index + 1,
          };
          delete payload.functions;
          delete payload.parameters;
          delete payload.arguments;
          fieldsArrayMap.push(payload);
        }),
      })),
    }));

    const outputFields = this.formOutputFields.controls
      .filter((x) => x.valid)
      .map((x: FormGroup) => x.getRawValue());
    outputFields.map((field, index: number) => ({
      fields: field.functions.map((func) => ({
        funcs: func.parameters.map((param) => {
          const payload = {
            ...field,
            ...func,
            ...param,
            numeroOrden: index + 1,
          };
          delete payload.functions;
          delete payload.parameters;
          delete payload.arguments;
          outputFieldsArrayMap.push(payload);
        }),
      })),
    }));

    const request = {
      ...plotValues,
      arguments: argumentsList,
      fields: fieldsArrayMap,
      outputFields: outputFieldsArrayMap,
      codigoUsuario: +this.currentUser['id'],
    };

    let service = this.plotConfigurationService.save(request);

    if (
      this.sessionDetailStorage?.structureId &&
      this.sessionDetailStorage?.ref == 'write'
    ) {
      request.structureId = this.sessionDetailStorage.structureId;
      service = this.plotConfigurationService.update(request);
    }

    this.closeModals();
    this.spinner.show();

    service.subscribe({
      next: (response) => {
        this.responseInfo = response;

        if (!response.success) {
          this.responseInfo.message = `Ocurrió un problema al intentar generar la estructura, inténtelo más tarde.`;
          if (
            this.sessionDetailStorage?.structureId &&
            this.sessionDetailStorage?.ref == 'write'
          ) {
            // tslint:disable-next-line:max-line-length
            this.responseInfo.message = `Ocurrió un problema al intentar actualizar la estructura N°: ${this.sessionDetailStorage.structureId}`;
          }
          return;
        }

        if (
          this.sessionDetailStorage?.structureId &&
          this.sessionDetailStorage?.ref == 'write'
        ) {
          this.responseInfo.message = `Se actualizó correctamente la estructura N°: ${this.sessionDetailStorage.structureId}`;
          return;
        }

        this.responseInfo.message = `Se generó correctamente la estructura N°: ${response.idEstructura}`;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
        this.responseInfo = {
          showSuccessImage: true,
          success: false,
          message:
            'Tenemos problemas para guardar la información, por favor inténtelo más tarde.',
        };
        if (
          this.sessionDetailStorage?.structureId &&
          this.sessionDetailStorage?.ref == 'write'
        ) {
          this.responseInfo.message =
            'Tenemos problemas para actualizar la información, por favor inténtelo más tarde.';
        }
        this.vc.createEmbeddedView(this.modalMessage);
      },
      complete: () => {
        this.spinner.hide();
        this.vc.createEmbeddedView(this.modalMessage);
      },
    });
  }

  /**
   * Borra la referencia del contenedor de vistas y
   * destruye todas las vistas que contiene.
   */
  // *Cerrar todos los modales y limpiar datos
  closeModals(): void {
    if (this.responseInfo?.success) {
      this.router.navigate(['/backoffice/tramas/bandeja']);
      return;
    }
    this.responseInfo = null;
    this.messageInfo = null;
    this.vc.clear();
  }

  goToPage(url: string): void {
    this.router.navigate([`/backoffice/tramas/${url}`]);
  }

  // *Validaciones de listado de items para <select></select>
  hideItem(
    form: FormGroup,
    controlName: string,
    exludeIndex: number,
    key: string,
    value: string
  ): boolean {
    const array: Array<any> = form.getRawValue()[controlName];
    console.log(array);
    const filtered = array
      .filter((x) => x[key] !== array[exludeIndex][key])
      ?.map((x) => `${x}`);
    return filtered.includes(value);
  }
}
