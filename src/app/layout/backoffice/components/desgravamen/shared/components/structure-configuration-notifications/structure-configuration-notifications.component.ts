import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter, Input,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Form, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { ConfigurationService } from '../../services/configuration/configuration.service';
import { DesgravamenService } from '../../services/desgravamen/desgravamen.service';

@Component({
  selector: 'app-structure-configuration-notifications',
  templateUrl: './structure-configuration-notifications.component.html',
  styleUrls: ['./structure-configuration-notifications.component.sass', '../../styles/style.sass'],
  providers: [DesgravamenService]
})
export class StructureConfigurationNotificationsComponent implements AfterViewInit {
  @Output() values: EventEmitter<any> = new EventEmitter();
  @Input() phaseType: 'read' | 'validate' | 'migration' | 'billing';

  structureDetail: any = {}; 

  policieCollection: any[] = [];

  listEmails: any[] = [];
  listEmailsFiltered: any[] = [];
  emailsSelected: string[] = [];
  salesChannels: string[] = [];
  policies: string[] = [];
  contractors: string[] = [];
  transactions: string[] = ['Ventas'];
  issues: string[] = [
    'Validación estructura',
    'Validación de reglas',
    'Emisión de certificados y recibos',
    'Facturación de recibos'
  ];

  policyForm!: FormArray;
  controlMailDestinationType!: FormControl;
  controlMailDestinationTypeValue!: FormControl;
  
  modalTypeEmailSelected: 'to' | 'cc' | 'cco';
  formIndexSelected: number;

  @ViewChild('modalEmails', { static: true, read: TemplateRef })
  modalEmails: TemplateRef<ElementRef>;

  constructor(
    private readonly builder: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly vcr: ViewContainerRef,
    private readonly configurationService: ConfigurationService,
    private readonly desgravamenService: DesgravamenService
  ) {
    this.structureDetail = this.desgravamenService.storage?.params ?? {};
    this.policyForm = this.builder.array([]);
    this.controlMailDestinationType = this.builder.control({
      value: 'internal',
      disabled: this.structureDetail.action == 'detalle'
    }, Validators.required);
    this.controlMailDestinationTypeValue = this.builder.control('', Validators.required);
    
  }

  ngAfterViewInit(): void {
    const policyCollection: any[] = this.desgravamenService?.storage?.policyCollection ?? [];
    if (policyCollection.length) {
      this.setArrayValues(policyCollection);
    }

    this.configurationService.subject.subscribe((obj) => {
      if (obj.key == this.configurationService.subjectEvents.POLICIES || obj.key == this.configurationService.subjectEvents.REMOVE_POLICY) {
        this.setArrayValues(obj.payload);
      }
    });

    this.getEmails();

    this.controlMailDestinationType.valueChanges.subscribe((value: string): void => {
      this.controlMailDestinationTypeValue.setValue('');
      this.emailsSelected = [];
      if (value == 'everyone') {
        this.emailsSelected = [];
        this.listEmailsFiltered = this.listEmails;
      }
    });

    this.controlMailDestinationTypeValue.valueChanges.subscribe((value: string): void => {
      if (this.controlMailDestinationType.value == 'internal') {
        this.listEmailsFiltered = this.listEmails.filter((obj: any) => obj.correo.includes(value) && obj.tipo == 2);
        return;
      }
      this.listEmailsFiltered = this.listEmails.filter((obj: any) => obj.correo.includes(value));
    });

    this.policyForm.valueChanges.subscribe((): void => {
      this.emitValues();
    });
  }

  emitValues(): void {
    // const notificationRow: any[] = this.policyForm.getRawValue();
    // const isValidNotification: boolean = notificationRow.every((notification): boolean => notification['to'].length >= 1);
    const data = {
      isValidForm: this.policyForm.valid, // && isValidNotification,
      data: this.policyForm.getRawValue()
    };
    this.values.emit(data);
  }

  setArrayValues(policyCollection: any[]): void {
    this.policieCollection = policyCollection ?? [];

    this.salesChannels = Array.from((new Set(this.policieCollection.map((p: any) => p.canal))));
    this.policies = Array.from((new Set(this.policieCollection.map((p: any) => p.numeroPoliza))));
    this.contractors = Array.from((new Set(this.policieCollection.map((p: any) => p.contratante))));
  }

  getEmails(): void {
    if (this.desgravamenService?.storage?.listEmails) {
      this.listEmails = this.listEmailsFiltered = this.desgravamenService.storage.listEmails;

      if (this.policyForm.length == 0) {
        this.addNotification(true);
      }
      return;
    }

    this.configurationService.getEmails().subscribe({
      next: (response: any[]): void => {
        console.log(response);

        if (!response.length) {
          return;
        }

        this.desgravamenService.storage = {
          listEmails: response.map((obj: any) => ({
            correo: obj.correo,
            tipo: obj.tipo
          }))
        };
        this.listEmails = this.listEmailsFiltered = this.desgravamenService.storage.listEmails;

        if (this.policyForm.length == 0) {
          this.addNotification(true);
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
      }
    });
  }

  /**
   * The addNotification function adds a new notification to the policyForm array.
   *
   * @param initComponent: boolean Determine if the function is being called from the ngoninit()
   *
   * @return Void, but the code above returns undefined
   */
  addNotification(initComponent: boolean = false): void {
    if (this.policyForm.invalid) {
      return;
    }

    const action: 'detalle' | 'actualizar' | 'clonar' = this.structureDetail.action ?? undefined;
    const structure = this.structureDetail.structure ?? {};

    const allowedActions: string[] = ['detalle', 'actualizar'];

    enum phaseTypeCodes {
      read = 1,
      validate = 2,
      migration = 3,
      billing = 4
    }

    if (initComponent) {
      if (allowedActions.includes(action)) {
        const notifications: any[] = structure?.notificacion
          ?.filter((notificacion: any): boolean => notificacion.fase == phaseTypeCodes[this.phaseType]) ?? [];

        if (notifications.length == 0) {
          this.addNotification(false);
          this.emitValues();
          this.cdr.detectChanges();
          return;
        }

        notifications.forEach(value => {
          const newForm: FormGroup = this.builder.group({
            salesChannel: [{
              value: value.canalVenta,
              disabled: action == 'detalle'
            }, Validators.required],
            policy: [{
              value: value.numeroPoliza,
              disabled: action == 'detalle'
            }, Validators.required],
            contractor: [{
              value: value.contratante,
              disabled: action == 'detalle'
            }, Validators.required],
            transaction: [{
              value: value.transaccion,
              disabled: action == 'detalle'
            }, Validators.required],
            issue: [{
              value: value.asunto,
              disabled: action == 'detalle'
            }, Validators.required],
            to: [value.listaCorreos],
            cc: [value.listaCC],
            cco: [value.listaCCO],
            disabledActions: [action == 'detalle']
          });
          this.policyForm.push(newForm);
        });

        this.emitValues();
        this.cdr.detectChanges();
        return;
      }
    }

    const form: FormGroup = this.builder.group({
      salesChannel: ['', Validators.required],
      policy: ['', Validators.required],
      contractor: ['', Validators.required],
      transaction: ['', Validators.required],
      issue: [structure.issue ?? '', Validators.required],
      to: [[]],
      cc: [[]],
      cco: [[]],
      disabledActions: [false]
    });

    this.policyForm.push(form);
    this.cdr.detectChanges();
    this.emitValues();
  }

  removeRowNotification(index: number): void {
    this.policyForm.removeAt(index);
    this.emitValues();

    if (this.policyForm.length == 0) {
      this.addNotification();
    }
  }

  /**
   * The showModalEmails function is used to show the modal for selecting emails.
   *
   * @param type: 'to' | 'cc' | 'cco' Know if the modal is going to be used for the 'to' field, 'cc' or 'cco'
   * @param index: number Know which form is being edited
   *
   * @return A void
   */
  showModalEmails(type: 'to' | 'cc' | 'cco', index: number): void {
    this.modalTypeEmailSelected = type;
    this.formIndexSelected = index;
    this.emailsSelected = [];

    const form: FormGroup = this.policyForm.at(this.formIndexSelected) as FormGroup;

    const emails: string[] = form.getRawValue()[this.modalTypeEmailSelected] ?? [];

    emails.forEach((email: string): void => {
      this.selectEmail(email);
    });

    /*const everyInternalSelected: boolean = this.listEmails.filter((obj: any): boolean => obj.tipo == 2)
      .map((obj: any) => obj.correo)
      .every((email: string) => emails.includes(email));*/

    const internalEmails: string[] = this.listEmails
      .filter((obj: any): boolean => obj.tipo == 2)
      .map((email: any) => email.correo as string);
    const everyInternalSelected: boolean = emails.every((email: string) => internalEmails.includes(email));

    this.controlMailDestinationType.setValue(everyInternalSelected ? 'internal' : 'everyone', {
      emitEvent: false
    });
    this.vcr.createEmbeddedView(this.modalEmails);
  }

  closeModals(): void {
    this.vcr.clear();
  }

  /**
   * The selectEmail function is used to add or remove an email from the emailsSelected array.
   *
   * @param email: string Pass in the email that was selected
   * @return Nothing, so it returns void
   */
  selectEmail(email: string): void {
    if (this.emailHasIncluded(email)) {
      this.removeEmail(email);
      return;
    }

    this.emailsSelected.push(email);
  }

  emailHasIncluded(email: string): boolean {
    return this.emailsSelected.includes(email);
  }

  removeEmail(email: string): void {
    this.emailsSelected = this.emailsSelected.filter((x: string): boolean => x != email);
  }

  /**
   * The onSubmit function is called when the user clicks on the submit button.
   * It clears out any previous modal content, and then sets the value of formArray to emailsSelected.
   * Then it calls emitValues() to update all values in policyForm with those from formArray.
   *
   * @return A void, but the modal is closed
   */
  onSubmit(): void {
    this.vcr.clear();

    const form: FormGroup = this.policyForm.at(this.formIndexSelected) as FormGroup;
    const formArray: FormArray = form.get(this.modalTypeEmailSelected) as FormArray;

    formArray.setValue(this.emailsSelected);
    this.emailsSelected = [];
    this.emitValues();
  }
}
