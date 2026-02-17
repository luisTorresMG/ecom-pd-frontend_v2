import {
  Component,
  OnInit,
  Output,
  ViewContainerRef,
  ViewChild,
  TemplateRef,
  ElementRef,
  EventEmitter,
} from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';

import { fadeAnimation } from '@shared/animations/animations';

import { DesgravamenService } from '../../../shared/services/desgravamen/desgravamen.service';
import { ConfigurationService } from '../../../shared/services/configuration/configuration.service';

@Component({
  selector: 'app-structure-configuration-validate',
  templateUrl: './structure-configuration-validate.component.html',
  styleUrls: [
    './structure-configuration-validate.component.sass',
    '../../../shared/styles/style.sass',
  ],
  animations: [fadeAnimation],
})
export class StructureConfigurationValidateComponent implements OnInit {
  @Output() dataEmitter: EventEmitter<any> = new EventEmitter();
  notificationValidateValues: any = {};

  formFilters: FormGroup = this.builder.group({
    policy: [''],
    contractor: [''],
    salesChannel: [0],
    createdAt: [null],
  });

  tabSelected: 'rules' | 'notifications' = 'rules';
  dropdownList: any = {
    rules: {
      commons: true,
      membership: true,
      payment: true,
      policy: true,
    },
    notifications: {
      notifications: false
    },
  };

  rulesMembership: 'generals' | 'specials' = 'generals';
  rulesPayment: 'generals' | 'specials' = 'generals';

  rules$: Array<any> = [];

  commonsRules$: Array<any> = [];
  generalMembershipApplicationRules$: Array<any> = [];
  specialMembershipApplicationRules$: Array<any> = [];
  generalPaymentStatementRules$: Array<any> = [];
  specialPaymentStatementRules$: Array<any> = [];
  policies: Array<any> = [];

  currentPagePolicies = 1;

  policySelected: any = {};
  specialPolicyRules: Array<any> = [];
  generalPolicyRules: Array<any> = [];

  modalTabSelected: 'membership-application' | 'payment-state' =
    'membership-application';

  // *Variables para el modal de detalle de la poliza - se usa para mostrar las secciones
  modalSummaryMembershipSectionIsSelected = true;
  modalSummaryMembershipTabSelected: 'general' | 'special' = 'general';
  modalSummaryPaymentStateSectionIsSelected = true;
  modalSummaryPaymentStateTabSelected: 'general' | 'special' = 'general';

  @ViewChild('modalAssociate', { static: true, read: TemplateRef })
  modalAssociate: TemplateRef<ElementRef>;

  @ViewChild('modalDisassociate', { static: true, read: TemplateRef })
  modalDisassociate: TemplateRef<ElementRef>;

  @ViewChild('modalPolicies', { static: true, read: TemplateRef })
  modalPolicies: TemplateRef<ElementRef>;

  @ViewChild('modalAdvancedFilters', { static: true, read: TemplateRef })
  modalAdvancedFilters: TemplateRef<ElementRef>;

  @ViewChild('modalRemovePolicy', { static: true, read: TemplateRef })
  modalRemovePolicy: TemplateRef<ElementRef>;

  @ViewChild('modalSummary', { static: true, read: TemplateRef })
  modalSummary: TemplateRef<ElementRef>;

  constructor(
    private readonly vc: ViewContainerRef,
    private readonly builder: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly desgravamenService: DesgravamenService,
    private readonly configurationService: ConfigurationService
  ) {
  }

  ngOnInit(): void {
    this.getRules();

    /* Subscribing to an event that is emitted from another component. */
    this.configurationService.subject.subscribe((event) => {
      if (this.configurationService.subjectEvents.POLICIES == event.key) {
        this.currentPagePolicies = 1;

        /* Mapping the event.payload and adding a rules property to each object. */
        this.policies = event.payload.map((obj) => ({
          ...obj,
          rules:
            this.policies.find((x) => x.numeroPoliza == obj.numeroPoliza)
              ?.rules ??
            this.commonsRules$.concat(
              this.generalMembershipApplicationRules$,
              this.generalPaymentStatementRules$
            ),
        }));

        /* Emitting an event to the parent component. */
        this.emitValues();
      }
    });
  }

  get storage(): any {
    return this.desgravamenService.storage;
  }

  /**
   * If the value is 'rules', then set the dropdownList to the rules object, set the rulesMembership to
   * 'generals', and set the rulesPayment to 'generals'. Otherwise, set the dropdownList to the
   * notifications object.
   * @param {'rules' | 'notifications'} value - 'rules' | 'notifications'
   * @returns Nothing.
   */
  set selectTab(value: 'rules' | 'notifications') {
    this.tabSelected = value;

    if (value == 'rules') {
      this.dropdownList = {
        rules: {
          commons: true,
          membership: true,
          payment: true,
          policy: true,
        },
        notifications: {
          notifications: false
        },
      };
      this.rulesMembership = 'generals';
      this.rulesPayment = 'generals';
      return;
    }

    this.dropdownList = {
      rules: {
        commons: false,
        membership: false,
        payment: false,
        policy: false,
      },
      notifications: {
        notifications: true
      },
    };
  }

  set selectDropdown(value: string) {
    const keys = value.split(':');
    this.dropdownList[keys[0]][keys[1]] = !this.dropdownList[keys[0]][keys[1]];
  }

  notificationValues(event: any): void {
    this.notificationValidateValues = event;
    this.emitValues();
  }

  emitValues(): void {
    this.dataEmitter.emit({
      isValidForm: !!this.policies.length,
      policies: this.policies,
      notifications: this.notificationValidateValues ?? {}
    });
  }

  /* Checking if the storage has a policyCollection property and if it has a length property. If it
  does, it is mapping the policyCollection and adding a rules property to each object. */
  getPoliciesOfStorage(): void {
    const storage = this.desgravamenService.storage;

    if (storage?.policyCollection?.length) {
      const actionIncludes = ['detalle', 'actualizar'];
      const policies = storage?.validate?.policies ?? [];

      this.policies = storage.policyCollection.map((obj) => ({
        ...obj,
        rules: actionIncludes.includes(storage.params?.action)
          ? obj.funciones.map((rule) =>
            this.rules$?.find((x) => +x.id == +rule)
          )
          : policies.find((x) => x.numeroPoliza == obj.numeroPoliza)?.rules ??
          this.commonsRules$.concat(
            this.generalMembershipApplicationRules$,
            this.generalPaymentStatementRules$
          ),
      }));
    }

    this.emitValues();
  }

  /**
   * "If the rules array is not empty, then assign the rules array to the rules$ variable, and then
   * assign the filtered rules array to the commonsRules$ variable, and then assign the filtered rules
   * array to the specialMembershipApplicationRules$ variable, and then assign the filtered rules array
   * to the generalMembershipApplicationRules$ variable, and then assign the filtered rules array to
   * the specialPaymentStatementRules$ variable, and then assign the filtered rules array to the
   * generalPaymentStatementRules$ variable, and then call the getPoliciesOfStorage() function, and
   * then return."
   * </code>
   * @returns The rules are being returned.
   */
  getRules(): void {
    if (this.storage?.rules?.length) {
      this.rules$ = this.storage.rules;

      this.commonsRules$ = this.rules$.filter((x) => x.tipoRegla == 'Comun');

      this.specialMembershipApplicationRules$ = this.rules$.filter(
        (x) => x.tipoRegla == 'Especial' && x.tipoTransaccion == 'Afiliacion'
      );
      this.generalMembershipApplicationRules$ = this.rules$.filter(
        (x) => x.tipoRegla == 'General' && x.tipoTransaccion == 'Afiliacion'
      );

      this.specialPaymentStatementRules$ = this.rules$.filter(
        (x) => x.tipoRegla == 'Especial' && x.tipoTransaccion == 'De pago'
      );
      this.generalPaymentStatementRules$ = this.rules$.filter(
        (x) => x.tipoRegla == 'General' && x.tipoTransaccion == 'De pago'
      );

      this.getPoliciesOfStorage();
      return;
    }

    this.spinner.show();
    this.configurationService.getRules().subscribe({
      next: (response: Array<any>) => {
        if (!response.length) {
          return;
        }

        this.commonsRules$ = response.filter((x) => x.tipoRegla == 'Comun');

        this.rules$ = response;

        this.specialMembershipApplicationRules$ = response.filter(
          (x) => x.tipoRegla == 'Especial' && x.tipoTransaccion == 'Afiliacion'
        );
        this.generalMembershipApplicationRules$ = response.filter(
          (x) => x.tipoRegla == 'General' && x.tipoTransaccion == 'Afiliacion'
        );

        this.specialPaymentStatementRules$ = response.filter(
          (x) => x.tipoRegla == 'Especial' && x.tipoTransaccion == 'De pago'
        );
        this.generalPaymentStatementRules$ = response.filter(
          (x) => x.tipoRegla == 'General' && x.tipoTransaccion == 'De pago'
        );

        this.desgravamenService.storage = {
          rules: this.rules$,
        };
        this.getPoliciesOfStorage();
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

  resetFormFilters(): void {
    const values = {
      policy: '',
      contractor: '',
      salesChannel: 0,
      createdAt: null,
    };
    this.formFilters.patchValue(values, {
      emitEvent: false,
    });
    this.vc.clear();
    this.vc.createEmbeddedView(this.modalPolicies);
  }

  submitFilters(): void {
    this.vc.clear();
    this.vc.createEmbeddedView(this.modalPolicies);
  }

  /**
   * It takes an object and a string as parameters, and then it filters the object's rules property
   * into two arrays, and then it creates an embedded view of the string parameter.
   * </code>
   * @param {any} obj - any =&gt; is the object that contains the rules
   * @param {string} modal - string = 'policyRulesModal';
   */
  showPolicyRulesModal(obj: any, modal: string): void {
    this.modalTabSelected = 'membership-application';
    this.policySelected = obj;
    this.specialPolicyRules = obj.rules.filter(
      (x) => x.tipoRegla == 'Especial'
    );
    this.generalPolicyRules = obj.rules.filter((x) => x.tipoRegla == 'General');
    this.vc.createEmbeddedView(this[modal]);
  }

  showModalPolicySummary(obj: any): void {
    this.policySelected = obj;
    this.modalSummaryMembershipSectionIsSelected = true;
    this.modalSummaryPaymentStateSectionIsSelected = true;
    this.vc.createEmbeddedView(this.modalSummary);
  }

  showModalDeleteRulePolicy(obj: any): void {
    this.policySelected = obj;
    this.vc.createEmbeddedView(this.modalRemovePolicy);
  }

  showModalAdvancedFilters(): void {
    this.vc.clear();
    this.vc.createEmbeddedView(this.modalAdvancedFilters);
  }

  closeModalPolicies(): void {
    this.vc.clear();
  }

  /**
   * It removes a policy from the list of policies and then sends a message to the service to remove
   * the policy from the list of policies in the service.
   */
  removePolicy() {
    const policy = this.policySelected;

    this.policies = this.policies.filter(
      (x) => x.numeroPoliza != policy.numeroPoliza
    );
    this.configurationService.subject.next({
      key: this.configurationService.subjectEvents.REMOVE_POLICY,
      payload: policy.numeroPoliza,
    });
    this.closeModal();
    this.emitValues();
  }

  rulePolicyHasIncluded(id: number, variable: string): boolean {
    return this[variable].some((x) => x.id == id);
  }

  /**
   * It takes an object and a string as parameters and pushes the object into an array that is a
   * property of the class.
   * @param {any} obj - any - this is the object that you want to add to the array
   * @param {string} variable - the name of the variable that you want to push the object to.
   */
  addRulePolicy(obj: any, variable: string): void {
    this[variable].push(obj);
  }

  /**
   * It removes a rule from the array of rules.
   * @param {number} id - number - the id of the rule policy to be removed
   * @param {string} variable - the name of the variable that holds the array of objects
   */
  removeRulePolicy(id: number, variable: string): void {
    this[variable] = this[variable].filter((x) => x.id != id);
    this.emitValues();
  }

  /**
   * It takes the selected policy, finds it in the policies array, and then adds the rules to it.
   */
  saveRulePolicy(): void {
    const find = this.policies.find(
      (x) => x.numeroPoliza == this.policySelected.numeroPoliza
    );
    find.rules = this.commonsRules$.concat(
      this.generalPolicyRules,
      this.specialPolicyRules
    );
    this.closeModal();
    this.emitValues();
  }

  closeModal(): void {
    this.vc.clear();
    this.policySelected = {};
    this.generalPolicyRules = [];
    this.specialPolicyRules = [];
  }
}
