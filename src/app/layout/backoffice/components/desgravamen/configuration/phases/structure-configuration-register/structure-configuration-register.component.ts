import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { NgxSpinnerService } from 'ngx-spinner';

import { DesgravamenService } from '../../../shared/services/desgravamen/desgravamen.service';
import { ConfigurationService } from '../../../shared/services/configuration/configuration.service';

import { fadeAnimation } from '@shared/animations/animations';

@Component({
  selector: 'app-structure-configuration-register',
  templateUrl: './structure-configuration-register.component.html',
  styleUrls: [
    './structure-configuration-register.component.sass',
    '../../../shared/styles/style.sass',
  ],
  animations: [fadeAnimation],
})
export class StructureConfigurationRegisterComponent implements OnInit {
  @Output() dataEmitter: EventEmitter<any> = new EventEmitter();

  clients!: FormArray;
  certificates!: FormArray;
  roles!: FormArray;
  policies!: FormArray;
  credits!: FormArray;
  readFields: Array<any> = [];
  form!: FormGroup;
  entityNames: Array<string> = [
    'clients',
    'certificates',
    'roles',
    'policies',
    'credits',
  ];
  entitiesWithValue = [];
  equivalenceForm!: FormArray;
  entitySelected: any = {};

  tabSelected: 'entities' = 'entities';
  dropdownSelected:
    | 'entity:client'
    | 'entity:certificate'
    | 'entity:rol'
    | 'entity:policy'
    | 'entity:credit';

  storage: any;

  @ViewChild('modalEquivalence', { static: true, read: TemplateRef })
  modalEquivalence: TemplateRef<ElementRef>;

  constructor(
    private readonly builder: FormBuilder,
    private readonly vc: ViewContainerRef,
    private readonly spinner: NgxSpinnerService,
    private readonly desgravamenService: DesgravamenService,
    private readonly configurationService: ConfigurationService
  ) {
      this.clients = this.builder.array([]);
      this.certificates = this.builder.array([]);
      this.roles = this.builder.array([]);
      this.policies = this.builder.array([]);
      this.credits = this.builder.array([]);

      this.form = this.builder.group({
        entities: this.builder.group({
          clients: this.clients,
          certificates: this.certificates,
          roles: this.roles,
          policies: this.policies,
          credits: this.credits,
        })
      });

      this.equivalenceForm = this.builder.array([]);
      this.storage = this.desgravamenService.storage;
  }

  ngOnInit(): void {
    // this.form.valueChanges.subscribe(() => this.emitValues());

    this.getEntities();

    /* Getting the readFields from the storage and subscribing to the subject to get the readFields
    from the service. */
    const readFields =
      this.desgravamenService.storage?.read?.transactions ?? [];
    this.readFields = (readFields.filter((x) => x.inputData) ?? []).map(
      (x) => x.inputData
    );

    this.configurationService.subject.subscribe((value) => {
      if (
        this.configurationService.subjectEvents.CHANGES.READ_FIELDS != value.key
      ) {
        return;
      }

      this.readFields = value.payload;

      // /* Getting all the formGroups from the formArrays and putting them in a new formArray. */
      // const entities = this.builder.array(
      //   [].concat(
      //     this.clients.controls.map((formg) => formg),
      //     this.certificates.controls.map((formg) => formg),
      //     this.roles.controls.map((formg) => formg),
      //     this.policies.controls.map((formg) => formg),
      //     this.credits.controls.map((formg) => formg)
      //   )
      // );

      // let hasChange = false;

      // /* Checking if the value of the form is in the readFields array. If it is not, it is setting
      // the value to an empty string. */
      // entities.controls.forEach((form: FormGroup) => {
      //   const control = form.controls;

      //   if (
      //     !control['value'].value ||
      //     this.readFields.includes(control['value'].value)
      //   ) {
      //     return;
      //   }

      //   hasChange = true;
      //   control['value'].setValue('');
      // });

      const entitiesControls = [
        ...(this.clients.controls as FormGroup[]),
        ...(this.certificates.controls as FormGroup[]),
        ...(this.roles.controls as FormGroup[]),
        ...(this.policies.controls as FormGroup[]),
        ...(this.credits.controls as FormGroup[]),
      ];
      let hasChange = false;
      entitiesControls.forEach((form) => {
        const valueCtrl = form.get('value'); // mejor que form.controls['value']
        if (!valueCtrl) return;
        const val = valueCtrl.value as string;
        if (!val || this.readFields.includes(val)) return;
        hasChange = true;
        valueCtrl.setValue('');
      });

      this.setEntitiesWithValue();
      if (!hasChange) {
        return;
      }

      // *Emitir evento para volver a guardar los datos del formulario
      this.emitValues();
    });
  }

  emitValues(): void {
    const values = this.form.getRawValue();

    /* Getting the values of the form and returning an array of arrays. */
    const entities = Object.keys(values.entities).map((key) =>
      (values.entities[key] as Array<any>).map((obj) => obj)
    );

    const entitiesFlat: Array<any> = [].concat.apply([], entities);

    /* Checking if the equivalences are valid. */
    const equivalencesIsValid = entitiesFlat
      .filter((x) => x.required)
      .every((x) => x.equivalences.every((y) => y.value));

    const valuesIsValid = entitiesFlat
      .filter((x) => x.required)
      .every((x) => x.value);

    this.dataEmitter.emit({
      ...values,
      entities: entitiesFlat,
      isValidForm: valuesIsValid && equivalencesIsValid
    });
  }

  getEntities(): void {
    /* Checking if the storage object has an entityList property. If it does, it will map over the
    entities and call the setValuesFormEntities method. */
    if (((this.storage?.register ?? {}).entities ?? []).length) {
      const entities: Array<any> = this.storage.register.entities;

      entities.map((obj) => {
        this.setValuesFormEntities(obj);
      });

      this.emitValues();
      this.setEntitiesWithValue();
      return;
    }

    this.spinner.show();
    this.configurationService.getEntities().subscribe({
      next: (response: any) => {
        /**
         * It takes a string, splits it on the # character, takes the first part of the string,
         * converts it to lowercase, and then returns the value of the key in the values object that
         * matches the lowercase string
         * @param {string} value - The value of the field that you want to transform.
         * @returns The value of the key in the values object.
         */
        const transformIdEntity = (value: string) => {
          const newValue = value.split('#')[0].toLowerCase();

          const values = {
            client: 'clients',
            certificate: 'certificates',
            role: 'roles',
            policy: 'policies',
            credit: 'credits',
          };

          return values[newValue];
        };

        const detail = this.storage?.params?.structure ?? {};
        const detailEntities = [].concat(
          detail.cliente ?? [],
          detail.certificado ?? [],
          detail.rol ?? [],
          detail.credito ?? [],
          detail.poliza ?? []
        );

        const actions = ['detalle', 'actualizar', 'clonar'];

        /* Mapping the response to a new object. */
        let entities = response.listaEntidades ?? [];
        entities = entities.map((obj) => ({
          id: transformIdEntity(obj.id),
          entityId: obj.id,
          attribute: obj.campo,
          description: obj.descripcion,
          origin: 'Trama',
          value: detailEntities.find((x) => x.campo == obj.campo)?.valor ?? '',
          required: obj.obligatorio,
          show: obj.mostrar,
          /* A ternary operator. */
          equivalences: actions.includes(this.storage?.params?.action)
            ? (
            detailEntities.find((x) => x.campo == obj.campo)?.valorCampo ??
            []
          ).map((x) => ({
            field: x.campo,
            value: x.valor,
          })) || []
            : obj.valorCampo?.map((obj2) => ({
            field: obj2,
            value: '',
          })) || [],
          staticFunctions: obj.funcionesEstaticas ?? [],
        }));

        this.desgravamenService.storage = {
          entityList: entities,
        };

        entities.map((obj) => {
          this.setValuesFormEntities(obj);
        });

        this.emitValues();
        this.setEntitiesWithValue();
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

  setEntitiesWithValue(): void {
    let entities = [];

    this.entityNames.map((value: string) => {
      entities = entities.concat.apply(entities, this[value].getRawValue());
    });

    entities = entities.filter((x) => x.show && x.value);
    this.entitiesWithValue = entities;
  }

  readFieldInUse(exclude: string, name: string): boolean {
    const entities = this.entitiesWithValue
      .filter((x) => x.entityId != exclude)
      .map((x) => x.value);

    return entities.includes(name);
  }

  set selectDropdown(value: any) {
    this.dropdownSelected = this.dropdownSelected == value ? null : value;
  }

  showModalEquivalence(form: FormGroup, type: string, index: number): void {
    const values = form.getRawValue();

    this.entitySelected = {
      type: type,
      index: index,
    };

    this.equivalenceForm.clear();
    values.equivalences.map((obj: any) => {
      const formEquiv = this.builder.group({
        field: [obj.field, Validators.required],
        value: [obj.value || '', values.required ? Validators.required : null],
      });

      if (this.storage?.params?.action == 'detalle') {
        formEquiv.disable();
      }

      this.equivalenceForm.push(formEquiv);
    });

    this.vc.createEmbeddedView(this.modalEquivalence);
  }

  saveEquivalence(): void {
    const formType = this.entitySelected.type.split(':')[1];
    const form: FormGroup = this.form.get('entities') as FormGroup;
    const formArray = form.get(formType) as FormArray;
    const formSelected = formArray.at(this.entitySelected.index) as FormGroup;
    const controls = formSelected.controls;
    (controls['equivalences'] as FormArray).setValue(
      this.equivalenceForm.getRawValue()
    );

    this.emitValues();
    this.hideModalEquivalence();
  }

  hideModalEquivalence(): void {
    this.vc.clear();
    this.equivalenceForm.clear();
    this.entitySelected = {};
  }

  // *Entidades
  //#region
  setValuesFormEntities(data: any = {}): void {
    if (!data.id) {
      return;
    }

    const form: FormGroup = this.builder.group({
      id: [data.id],
      entityId: [data.entityId],
      attribute: [data.attribute, Validators.required],
      description: [data.description, Validators.required],
      origin: [{ value: data.origin, disabled: true }, Validators.required],
      value: ['', data.required ? Validators.required : null],
      show: [data.show ?? true],
      required: [data.required],
      equivalences: this.builder.array(data.equivalences ?? []),
      staticFunctions: this.builder.array(data.staticFunctions ?? []),
    });

    const control = form.controls;
    control['value'].valueChanges.subscribe((value: string) => {
      const payload = {
        key: this.configurationService.subjectEvents.CHANGES
          .ENTITY_ATTRIBUTE_VALUE,
        payload: {
          attribute: control['entityId'].value,
          currentValue: value,
          functions: (control['staticFunctions'] as FormArray).getRawValue(),
        },
      };

      this.configurationService.subject.next(payload);

      this.emitValues();
      this.setEntitiesWithValue();
    });

    if (data.value) {
      control['value'].setValue(data.value);
    }

    if (this.storage?.params?.action == 'detalle') {
      form.disable();
    }

    this[data.id].push(form);
  }

  //#endregion
}
