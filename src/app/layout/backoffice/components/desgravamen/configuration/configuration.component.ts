import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';

import { fadeAnimation } from '@shared/animations/animations';

import { UtilsService } from '@shared/services/utils/utils.service';
import { DesgravamenService } from '../shared/services/desgravamen/desgravamen.service';
import { ConfigurationService } from '../shared/services/configuration/configuration.service';
import { ConfigurationModel, INotification } from '../shared/models/configuration.model';

import swal from 'sweetalert2'; //INI <RQ2024-57 - 03/04/2024>  
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap'; //INI <RQ2024-57 - 03/04/2024> 
import { Console } from 'console';
@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.sass'],
  animations: [fadeAnimation],
})
export class ConfigurationComponent implements OnInit, OnDestroy {
  structureSelected: any = {};

  proSelectComponentConfig = {
    checkboxColor: 'orange',
  };
  form!: FormGroup;

  
  controlFilterPolicies!: FormControl;
  formFilters: FormGroup;

  phasesWithNotifications: string[] = ['read', 'validate', 'migrate', 'billing'];
  phasesIncluded: Array<string> = ['read', 'register', 'validate', 'migrate', 'billing'];
  phaseTypeSelected: 'read' | 'register' | 'validate' | 'migrate' | 'billing' = 'read';

  // *Valores de cada fase
  phaseValues: any = {};

  branches$: Array<any> = [];
  products$: Array<any> = [];
  policies$: Array<any> = [];
  policiesFiltered: Array<any> = [];
  policiesIncluded: Array<any> = [];

  currentPagePolicies = 1;
  currentPagePoliciesIncluded = 1;

  messageInfo: {
    showImage?: boolean;
    success?: boolean;
    message?: string;
  } = {};

  salesChannel$: Array<any> = [];

  @ViewChild('modalPolicies', { static: true, read: TemplateRef })
  modalPolicies: TemplateRef<ElementRef>;

  @ViewChild('content1', { static: true, read: TemplateRef })
  content1: TemplateRef<ElementRef>; //INI <RQ2024-57 - 03/04/2024>  

  @ViewChild('modalAdvancedFilters', { static: true, read: TemplateRef })
  modalAdvancedFilters: TemplateRef<ElementRef>;

  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  modalMessage: TemplateRef<ElementRef>;

  @ViewChild('modalConfirmSave', { static: true, read: TemplateRef })
  modalConfirmSave: TemplateRef<ElementRef>;

  listPoliza: any[] = []; //INI <RQ2024-57 - 03/04/2024>  
  listPolizaEdit: any[] = []; //INI <RQ2024-57 - 03/04/2024>  
    listPolizaEdit2:any[] = []; //INI <RQ2024-57 - 03/04/2024> 
  nconfigs: number = 0;//INI <RQ2024-57 - 03/04/2024>
  disabledAtBtn: boolean = true; //INI <RQ2024-57 - 03/04/2024>
    input1: number = 0;//INI <RQ2024-57 - 03/04/2024>
    input2: number = 0;//INI <RQ2024-57 - 03/04/2024>
    input3: number = 0;//INI <RQ2024-57 - 03/04/2024>
    input4: number = 0;//INI <RQ2024-57 - 03/04/2024>
    sumaTotal: number = 0;//INI <RQ2024-57 - 03/04/2024>
    txtTotal :any;//INI <RQ2024-57 - 03/04/2024>
    
    txtLeer :any;//INI <RQ2024-57 - 03/04/2024>
    txtValida :any;//INI <RQ2024-57 - 03/04/2024>
    txtEmitir :any;//INI <RQ2024-57 - 03/04/2024>
    txtFact :any;//INI <RQ2024-57 - 03/04/2024>
    tiempoDuracion: boolean = false; //INI <RQ2024-57 - 03/04/2024>

  constructor(
    private readonly router: Router,
    private readonly builder: FormBuilder,
    private readonly vc: ViewContainerRef,
    private readonly spinner: NgxSpinnerService,
    private readonly desgravamenService: DesgravamenService,
    private readonly configurationService: ConfigurationService,
    private readonly utilsService: UtilsService,
    private modalService: NgbModal //INI <RQ2024-57 - 03/04/2024> 
  ) {
    this.form = this.builder.group({
    transaction: [
      {
        value: 'VENTA',
        disabled: true,
      },
      Validators.required,
    ],
    branch: [
      {
        value: 'DESGRAVAMEN',
        disabled: true,
      },
      Validators.required,
    ],
    headerData: [
      {
        value: 'Nombre del archivo',
        disabled: true,
      },
      Validators.required,
    ],
    containsCertificateByRol: [
      {
        value: 'SÍ',
        disabled: true,
      },
      Validators.required,
    ],
    containsRowsSortedByRole: ['', Validators.required],
    fileFormat: [
      {
        value: 'xlsx',
        disabled: true,
      },
      Validators.required,
    ],
    dateFormat: ['', Validators.required],
  });

    this.controlFilterPolicies = this.builder.control('');
    this.formFilters = this.builder.group({
    product: [''],
    policy: [''],
    salesChannel: [''],
    currency: [''],
  });
  }

  ngOnInit(): void {
    this.getBranches();
    this.initValues();
    this.valueChangesForm();

    if (this.desgravamenService.storage?.policyCollection?.length) {
      this.policiesIncluded = this.desgravamenService.storage.policyCollection;
            
            this.policiesIncluded.forEach((e,i) =>{
                if (e.facAgru == 1){
                    e.FacAgruText = 'SI'
                }else{
                    e.FacAgruText = 'NO'
                }
                
            });

            this.policiesIncluded.forEach((e,i) =>{
                if (e.facAuto == 1){
                    e.FacAutoText = 'SI'
                }else{
                    e.FacAutoText = 'NO'
                }
                
            });
    }

    this.phaseValues = this.desgravamenService.storage ?? {};
    this.configurationService.subject.subscribe((event) => {
      if (this.configurationService.subjectEvents.REMOVE_POLICY == event.key) {
        this.policiesIncluded = this.policiesIncluded.filter(
          (x) => x.numeroPoliza != event.payload
        );
      }
    });
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem(this.desgravamenService.SESSION_STORAGE_KEY);
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  get formControl(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get formFilterControl(): { [key: string]: AbstractControl } {
    return this.formFilters.controls;
  }

  /**
   * "If the action is not clonar, then it checks if the listaPolizas is null or undefined and if it
   * is, it is assigning an empty array to policiesIncluded."
   *
   * I'm not sure if I'm understanding this correctly, but I think that the above function is saying
   * that if the action is not clonar, then it checks if the listaPolizas is null or undefined and if
   * it is, it is assigning an empty array to policiesIncluded.
   *
   * I'm not sure if I'm understanding this correctly, but I think that the above function is saying
   * that if the action is not clonar, then it checks if the listaPolizas is null or undefined and if
   * it is, it is assigning an empty array to policiesIncluded.
   *
   * I'm not sure if I'm understanding this correctly, but I think that the above function is saying
   * that if the
   * @returns nothing.
   */
  private initValues(): void {
    const params = this.desgravamenService.storage?.params ?? {};

    const actionIncludes = ['actualizar', 'detalle', 'clonar'];
    if (actionIncludes.includes(params.action)) {
      this.structureSelected = params;

      const values = {
        transaction: this.structureSelected.structure.transaccion,
        branch: this.structureSelected.structure.ramo,
        headerData: this.structureSelected.structure.aplicaCabecera,
        containsCertificateByRol: this.structureSelected.structure.certificadoPorRol,
        containsRowsSortedByRole:  this.structureSelected.structure.filaOrdenadaPorRol,
        fileFormat: this.structureSelected.structure.tipoArchivo,
        dateFormat: this.structureSelected.structure.formatoFecha,
      };

      this.form.patchValue(values);

      if (this.structureSelected.action == 'detalle') {
        this.form.disable();
      }

      if (params.action != 'clonar') {
        /* Checking if the structureSelected.structure.listaPolizas is null or undefined and if it is,
        it is assigning an empty array to policiesIncluded. */
        this.policiesIncluded =
          this.structureSelected.structure.listaPolizas ?? [];

        /* Using the Subject class to emit an event. */
        this.configurationService.subject.next({
          key: this.configurationService.subjectEvents.POLICIES,
          payload: this.policiesIncluded,
        });

        this.setPhaseValues(this.policiesIncluded, 'policyCollection');
      }
      return;
    }

    const generals = this.desgravamenService.storage?.generals;

    if (generals) {
      this.form.patchValue(generals);
    }
  }

  private valueChangesForm(): void {
    /* Subscribing to the form value changes and storing the form values in the service. */
    this.form.valueChanges.subscribe(() => {
      this.desgravamenService.storage = {
        generals: this.form.getRawValue(),
      };
    });

    /* Subscribing to the valueChanges observable of the controlFilterPolicies FormControl. */
    this.controlFilterPolicies.valueChanges.subscribe(() => {
      this.filterPolicies();
    });
  }

  /**
   * I'm trying to reset the formFilters form, and then re-render the modalPolicies template.
   */
  resetFormFilters(): void {
    const values = {
      product: '',
      policy: '',
      salesChannel: '',
      currency: '',
    };

    this.formFilters.patchValue(values);

    this.vc.remove();
    this.filterPolicies();
  }

  submitFilters(): void {
    this.vc.remove();
    this.filterPolicies();
  }

  showModalPolicies(): void {
            //this.listPoliza = [];//INI <RQ2024-57 - 03/04/2024>

        this.listPolizaEdit2=[];
        this.listPolizaEdit=[];
        this.policiesFiltered=[];
        this.listPoliza =[];
        this.txtTotal='';
        this.txtLeer='';
        this.txtValida='';
        this.txtEmitir='';
        this.txtFact='';

    if (this.policies$.length) {
      this.currentPagePolicies = 1;
      this.filterPolicies();
      this.vc.createEmbeddedView(this.modalPolicies);
      return;
    }

    this.getPolicies();
  }

  showModalAdvancedFilters(): void {
    this.vc.createEmbeddedView(this.modalAdvancedFilters);
  }

  /**
   * This function is called when the user clicks the 'close' button on the modal. It takes the
   * policies that were filtered by the user and adds a new property to each object called 'checked'
   * which is a boolean that is true if the policy number is included in the policiesIncluded array.
   */
  closeModalPoliciesAvailable(): void {
    this.policiesFiltered = this.policies$.map((obj) => ({
      ...obj,
      checked: this.policyHasIncluded(obj.numeroPoliza),
    }));
    this.currentPagePoliciesIncluded = 1;
    this.vc.clear();
  }

  /**
   * It takes two parameters, one is an object and the other is a string.
   * It then assigns the object to a property of another object, and then assigns that object to a
   * property of a service
   * @param {any} values - any, key: string
   * @param {string} key - string =&gt; the key of the object
   */
  setPhaseValues(values: any, key: string): void {
    this.phaseValues[key] = values;
    this.desgravamenService.storage = this.phaseValues;
  }

  getBranches(): void {
    this.utilsService.getBranches().subscribe({
      next: (response: Array<any>) => {
        this.branches$ = response;
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
   * It gets the policies from the server and then it maps them to a new array of objects with a new
   * property called checked.
   */
  getPolicies(): void {
    this.spinner.show();

    /* Checking if the action is clonar, if it is, it returns null, if not, it returns the structureId. */
    const structureId: string =
      this.structureSelected.action == 'clonar'
        ? null
        : this.structureSelected.structure?.structureId ?? null;

    this.configurationService.getPolicies(structureId).subscribe({
      next: (response: any) => {
        /* Taking the response.listadoPolizas and mapping it to a new array. */
        const policies =
          (response.listadoPolizas ?? []).map((obj) => ({
            ...obj,
            checked: this.policyHasIncluded(obj.numeroPoliza),
          })) ?? [];

               // this.policies$ = this.policiesFiltered = policies;

               const exclusionSet = new Set(this.policiesIncluded.map(policy => policy.numeroPoliza));

                this.policiesFiltered = (response.listadoPolizas ?? [])
                .filter(pol => !exclusionSet.has(pol.numeroPoliza))
                .map((obj) => ({
                    ...obj,
                    checked: false,
                })) ?? [];

                this.policies$ = this.policiesFiltered

        this.salesChannel$ = policies.map((obj) => obj.canal);

        this.salesChannel$ = Array.from(new Set(this.salesChannel$))
          .filter((x) => x)
          .map((value) => ({
            id: value,
            label: value,
          }));

        this.policies$.forEach((obj) => {
          if (this.products$.some((x) => x.label == obj.producto)) {
            return;
          }

          this.products$.push({
            id: obj.producto,
            label: obj.producto,
            checked: false,
          });
        });

        if (this.policies$.length) {
          this.currentPagePolicies = 1;
          this.vc.createEmbeddedView(this.modalPolicies);
        }
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
   * It filters the policies based on the filters selected by the user.
   */
  filterPolicies(): void {
    this.currentPagePolicies = 1;

    const filters = {
      ...this.formFilters.getRawValue(),
      search: this.controlFilterPolicies.value,
    };

    /**
     * It returns true if the first n characters of the value string are equal to the filterSearch
     * string, where n is the length of the filterSearch string.
     * @param {string} value - string - the value of the cell
     * @param {string} filterSearch - The search string that the user has entered.
     * @returns A boolean value.
     */
    const compareString = (value: string, filterSearch: string): boolean => {
      return (
         (value ?? '').toLowerCase().slice(0, filterSearch.length) ==  filterSearch.toLowerCase()
      );
    };

    const splitProducts = filters.product.split('(d)');

    /* Filtering an array of objects based on the values of the object properties. */
    const filter = this.policies$
      .filter(
        (x: any) =>
          (compareString(x.numeroPoliza, filters.search) ||
            compareString(x.producto, filters.search) ||
            compareString(x.contratante, filters.search) ||
            compareString(x.canal, filters.search) ||
            compareString(x.fechaInicio, filters.search) ||
            compareString(x.fechaFin, filters.search) ||
            compareString(x.moneda, filters.search)) &&
          (filters.product ? splitProducts.includes(x.producto) : true) &&
          (filters.policy ? x.numeroPoliza == filters.policy : true) &&
          (filters.currency ? x.moneda == filters.currency : true) &&
          (filters.salesChannel ? x.canal == filters.salesChannel : true)
      )
      .map((obj) => ({
        ...obj,
        checked: this.policyHasIncluded(obj.numeroPoliza),
      }));

    this.policiesFiltered = filter;
  }

  /**
   * This function takes a boolean value and maps over the policiesFiltered array, returning a new
   * array with the checked property set to the boolean value passed in.
   * @param {boolean} checked - boolean - this is the value of the checkbox that is checked or
   * unchecked
   */
  checkAllPolicies(checked: boolean): void {
    this.policies$ = this.policies$.map((obj) => ({
      ...obj,
      checked: checked,
    }));

    this.policiesFiltered = this.policiesFiltered.map((obj: any) => ({
      ...obj,
      checked: checked,
    }));
  }

  checkPolicy(checked: boolean, policy: any): void {

        if (this.listPoliza.length == 0){
            this.listPoliza.push(
                {
                    numeroPoliza: policy.numeroPoliza,
                    producto: policy.producto,
                    idProducto: policy.idProducto,
                    ruc: policy.ruc,
                    contratante: policy.contratante,
                    canal: policy.canal,
                    fechaInicio: policy.fechaInicio,
                    fechaFin: policy.fechaFin,
                    moneda: policy.moneda,
                    checkedFacAgru: 0,
                    checkedFacAuto: 0
                }
            );
            this.tiempoDuracion = true; 
            console.log(this.listPoliza)
        }else{
            if(checked == false){
                for(let i = 0; i <= this.listPoliza.length; i++){
                    if (this.listPoliza[i].numeroPoliza === policy.numeroPoliza){
                        this.listPoliza.splice(i,1);
                        break;
                    }
                }
                this.tiempoDuracion = false; 
            }else{

                this.messageInfo = {
                showImage: true,
                success: false,
                message:'Solo puede seleccionar una sola póliza',
                };
                this.vc.createEmbeddedView(this.modalMessage);
                policy.checked = 0;                
                return;
            }
        }
    }

    /*checkAgrupada(checked: boolean, policy: any): void {
    policy.checked = checked;
    }*/

  /**
   * If the length of the array is 0, return false. Otherwise, return true if every element in the
   * array is checked.
   * @returns a boolean value.
   */
  get isCheckAllPolicies(): boolean {
    if (!this.policiesFiltered.length) {
      return false;
    }

    return this.policiesFiltered.every((x) => x.checked);
  }

  /**
   * Returns true if the policy number passed in is included in the policiesIncluded array.
   * @param {number} policy - number
   * @returns A boolean value.
   */
  private policyHasIncluded(policy: number): boolean {
    return this.policiesIncluded.some((x) => x.numeroPoliza == policy);
  }

  /**
   * It removes a policy from the list of policies included in the quote
   * @param {any} obj - any, index
   * @param index - the index of the item in the array
   */
  removePolicy(obj: any, index): void {
    obj.checked = false;

    this.policiesIncluded = this.policiesIncluded.filter((_, i) => i != index);

    this.configurationService.subject.next({
      key: this.configurationService.subjectEvents.POLICIES,
      payload: this.policiesIncluded,
    });
    this.setPhaseValues(this.policiesIncluded, 'policyCollection');
  }

  /**
   * This function shows a modal with a message and a button to confirm the action.
   */
  showConfirmSubmitModal(): void {
    this.messageInfo = {
      showImage: false,
      success: false,
    };

    this.messageInfo.message =
      this.structureSelected.action == 'actualizar'
        ? `Al confirmar los cambios, podrás visualizarlo en tu bandeja principal.`
        : this.structureSelected.action == 'clonar'
          ? 'Al confirmar la clonación de la estructura, podrás visualizarlo en tu bandeja principal.'
          : `Al confirmar la creación de la nueva estructura, podrás visualizarlo en tu bandeja principal.`;

    this.vc.createEmbeddedView(this.modalConfirmSave);
  }

  /**
   * The function is called when the user clicks on the submit button.
   * The function checks if the form is valid. If it is not valid, it returns.
   * The function shows a spinner.
   * The function creates a payload object.
   * The function creates a new ConfigurationModel object.
   * The function checks if the structureSelected.action is equal to "actualizar". If it is, it calls
   * the changesFormForUpdate function.
   * The function calls the configurationService.update function.
   * The function returns.
   * The function calls the configurationService.save function.
   * The function hides the spinner.
   * The function returns.
   */
  onSubmit(): void {
        /*if (!this.isValidForm) {
      return;
        }*/

    this.spinner.show();

    const payload = {
      ...this.phaseValues,
      generals: this.form.getRawValue(),
    };

    const newPayload: ConfigurationModel = new ConfigurationModel(payload);

    if (this.structureSelected?.action == 'actualizar') {
      const payloadForUpdate = this.changesFormForUpdate(newPayload);
      this.configurationService.update(payloadForUpdate).subscribe({
        next: (response: any) => {
          this.messageInfo = {
            showImage: true,
            success: response.success,
          };

          this.messageInfo.message = response.success
            ? 'Se guardaron los cambios de la estructura, correctamente'
            : 'Ocurrió un problema al intentar actualizar la información';

          this.vc.clear();
          this.vc.createEmbeddedView(this.modalMessage);
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.spinner.hide();

          this.messageInfo = {
            showImage: true,
            success: false,
            message:
              'Tenemos problemas para actualizar la información, inténtelo más tarde',
          };

          this.vc.clear();
          this.vc.createEmbeddedView(this.modalMessage);
        },
        complete: () => {
          this.spinner.hide();
        },
      });
      return;
    }

    this.configurationService.save(newPayload).subscribe({
      next: (response: any) => {
        this.messageInfo = {
          showImage: true,
          success: response.success,
        };

        if (response.idEstructura) {
              this.messageInfo.message = this.structureSelected.action == 'clonar'
              ? `Se clonó la estructura correctamente - ${response.idEstructura}`
              : `Se creó correctamente la estructura ${response.idEstructura}`;
        } else {
          this.messageInfo.message = `Ocurrió un error al intentar guardar la información`;
        }

        this.vc.clear();
        this.vc.createEmbeddedView(this.modalMessage);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();

        this.messageInfo = {
          showImage: true,
          success: false,
          message:
            'Tenemos problemas para guardar la información, inténtelo más tarde',
        };

        this.vc.clear();
        this.vc.createEmbeddedView(this.modalMessage);
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  /**
   * If every phase in the phasesIncluded array is included in the mapPhaseKeys array, and the form is
   * valid, then return true.
   * @returns {
   *     isValidForm: true,
   *     phase: 'phase1',
   *   }
   */
  get isValidForm(): boolean {
    const phaseKeys: string[] = Object.keys(this.phaseValues);

        const forms: Array<any> = phaseKeys.map((key: string) => ({
        isValidForm: this.phaseValues[key]?.isValidForm,
        phase: key,
        notifications: this.phaseValues[key]?.notifications ?? {}
                                                })).filter((x): boolean => x.isValidForm != undefined);

    const mapPhaseKeys: any[] = forms.map((x) => x.phase);


        return forms.every((x): boolean => x.isValidForm && 
        this.phasesIncluded.every((y: string) => mapPhaseKeys.includes(y)) &&
                                           (this.phasesWithNotifications.includes(x.phase) ? !!x.notifications?.isValidForm : true)//linea de cambio //!!x.notifications?.isValidForm
    ) && this.form.valid;
        //return true;
  }

  closeModal(): void {
    this.vc.clear();
    if (this.messageInfo.success) {
      this.router.navigate(['/backoffice/desgravamen/estructuras/bandeja']);
      return;
    }

       // this.messageInfo = {};
    }

    closeModal2(): void {
        this.vc.remove();
        
  }

  /**
   * "This function navigates to the backoffice/sia/estructuras/bandeja route."
   */
  backPage(): void {
    this.router.navigate(['/backoffice/desgravamen/estructuras/bandeja']);
  }

  /**
   * It takes an object, and returns an object
   * @param payload - {
   * @returns {
     //   "idEstructura": "STR-001",
   *   "listaObjetos": [
   *     {
   *       "operacion": "UPDATE",
   *       "variable": "detail",
   *       "transaccion": "TRANS-001",
   *       "ramo": "RAMO-001",
   *       "aplicaCabec
   */
  private changesFormForUpdate(payload: ConfigurationModel): any {
    const storage = this.desgravamenService.storage;

    /**
     * "If the storage.generals object is not null, and if the storage.generals object's properties are
     * equal to the structureSelected object's properties, then return an empty object, otherwise
     * return an object with the properties of the storage.generals object."
     *
     * I'm not sure if this is the best way to write this function, but it works.
     *
     * I hope this helps someone else.
     * @returns An object with the following properties:
     * operacion: 'UPDATE',
     * variable: 'detail',
     * transaccion: storage.generals.transaction,
     * ramo: storage.generals.branch,
     * aplicaCabecera: storage.generals.headerData,
     * certificadoPorRol: storage.generals.containsCertificate
     */
    const generalChanges = (): any => {
      if (!storage.generals) {
        return {};
      }

      const general = storage.generals;

      if (
        general.transaction == this.structureSelected.transaccion &&
        general.branch == this.structureSelected.ramo &&
        general.headerData == this.structureSelected.aplicaCabecera &&
        general.containsCertificateByRol == this.structureSelected.certificadoPorRol &&
        general.containsRowsSortedByRole == this.structureSelected.filaOrdenadaPorRol &&
        general.fileFormat == this.structureSelected.tipoArchivo &&
        general.dateFormat == this.structureSelected.formatoFecha
      ) {
        return {};
      }

      return {
        operacion: 'UPDATE',
        variable: 'detail',
        transaccion: storage.generals.transaction,
        ramo: storage.generals.branch,
        aplicaCabecera: storage.generals.headerData,
        certificadoPorRol: storage.generals.containsCertificateByRol,
        filaOrdenadaPorRol: storage.generals.containsRowsSortedByRole,
        tipoArchivo: storage.generals.fileFormat,
        formatoFecha: storage.generals.dateFormat,
        nombreEstructura: this.structureSelected.structure?.nombreEstructura,
      };
    };

    const policyChanges = (): Array<any> => {
      let con : number = 0; 
      const changes = [];
      const policies: Array<any> = this.structureSelected.structure?.listaPolizas ?? [];
      const policiesUpdated: Array<any> = storage.validate?.policies ?? [];

      policies.map((obj) => {
        /* Checking if the policy number is in the array. */
        if (!policiesUpdated.some((x) => x.numeroPoliza == obj.numeroPoliza)) {
          changes.push({
            operacion: 'DELETE',
            variable: 'policy',
            poliza: obj,
            nombreEstructura:
              this.structureSelected.structure?.nombreEstructura,
          });
          return;
        }

        const find = policiesUpdated.find(
          (x) => x.numeroPoliza == obj.numeroPoliza
        );

        let functions: Array<any> = find.rules ?? [];
        functions = functions.map((x) => +x.id);

        let hasChange = false;

        functions.map((f) => {
          if (hasChange) {
            return;
          }

          hasChange = !obj.funciones.includes(f);
        });

        if (!hasChange && obj.funciones.length == functions.length) {
                    //return;
                }else{
                    con++;
                }

                if(find.facAgru != obj.facAgru){
                    con++;
                }

                if(find.facAuto != obj.facAuto){
                    con++;
        }


                if(con >= 1){
        changes.push({
          operacion: 'UPDATE',
          variable: 'policy',
          poliza: {
            ...find,
            funciones: find.rules?.map((x) => +x.id) ?? [],
          },
          nombreEstructura: this.structureSelected.structure?.nombreEstructura,
        });
                }else{
                    return;
                }

                
      });

      /* Mapping through the policiesUpdated array and checking if the numeroPoliza is not in the
      policies array. If it is not, it pushes the object to the changes array. */
      policiesUpdated.map((obj) => {
        if (!policies.some((x) => x.numeroPoliza == obj.numeroPoliza)) {
          changes.push({
            operacion: 'INSERT',
            variable: 'policy',
            poliza: {
              ...obj,
              funciones: obj.rules.map((x) => +x.id),
            },
            nombreEstructura:
              this.structureSelected.structure?.nombreEstructura,
          });
        }
      });
      return changes;
    };

    const registerChanges = (): Array<any> => {
      const changes = [];
      const entities: Array<any> =
        this.structureSelected.structure?.cliente?.concat(
          this.structureSelected.structure?.certificado ?? [],
          this.structureSelected.structure?.rol ?? [],
          this.structureSelected.structure?.credito ?? [],
          this.structureSelected.structure?.poliza ?? []
        ) ?? [];

      if (!entities.length) {
        return changes;
      }

      const entityChanges: Array<any> = storage.register?.entities ?? [];

      const entityKeys = {
        clients: 'entityClient',
        certificates: 'entityCertificate',
        roles: 'entityRole',
        credits: 'entityCredit',
        policies: 'entityPolicy',
      };

      const entityName = {
        clients: 'clienteEntidad',
        certificates: 'certificadoEntidad',
        roles: 'rolEntidad',
        credits: 'creditoEntidad',
        policies: 'polizaEntidad',
      };

      entities.map((obj) => {
        const find = entityChanges.find(
            (x) => `${x.attribute}${x.entityId.split('#')[0]}` ==
            `${obj.campo}${obj.id.split('#')[0]}`
        );

        if (!find) {
          return;
        }

        /* Checking if the value of the field is different from the value of the findField.value. */
        let hasChange = false;
        obj.valorCampo.map((field: any) => {
          const findField = find.equivalences.find(
            (x) => field.campo == x.field
          );

          if (!findField || hasChange) {
            return;
          }

          hasChange = findField.value != field.valor;
        });

        if (obj.valor != find.value) {
          hasChange = true;
        }

        if (hasChange) {
          changes.push({
            operacion: 'UPDATE',
            variable: entityKeys[find.id],
            [entityName[find.id]]: {
              idEntidad: find.entityId,
              campo: find.attribute,
              descripcion: find.description,
              origen: find.origin,
              valor: find.value,
              valorCampo: find.equivalences.map((e) => ({
                campo: e.field,
                valor: e.value,
              })),
            },
                            nombreEstructura: this.structureSelected.structure?.nombreEstructura,
          });
        }
      });
      return changes;
    };

    const readChanges = (): Array<any> => {
      const changes = [];

            const attributes: Array<any> = this.structureSelected.structure.listaAtributos ?? [];
      const attributeChanges: Array<any> = payload.listaAtributos;

      attributes.map((obj, index) => {
        /* Checking if the attributeChanges array has the same campo as the obj.campo. If it does not,
        it will push the object to the changes array. */
        if (!attributeChanges.some((x) => x.campo == obj.campo)) {
          changes.push({
            operacion: 'DELETE',
            variable: 'attributes',
            atributo: {
              ...obj,
              obligatorio: obj.obligatorio == 'true',
              valorUnico: obj.valorUnico == 'true',
              id: `ATTR-${(index + 1).toString().padStart(3, '0')}`,
            },
            nombreEstructura:
              this.structureSelected.structure?.nombreEstructura,
          });
          return;
        }

        const findField = attributeChanges.find((x) => x.campo == obj.campo);

        /* Comparing the values of the object and the array. */
        const validations = [
          (obj.obligatorio == 'true') != findField.obligatorio,
          (obj.valorUnico == 'true') != findField.valorUnico,
          obj.idTipoDato != findField.idTipoDato,
        ];

        /* Checking if the array has any true values. If it does, it will push the changes to the
        array. */
        if (validations.some((x) => x)) {
          changes.push({
            operacion: 'UPDATE',
            variable: 'attributes',
            atributo: {
              ...findField,
              id: `ATTR-${(index + 1).toString().padStart(3, '0')}`,
            },
            nombreEstructura:
              this.structureSelected.structure?.nombreEstructura,
          });
          return;
        }

        let hasChange = false;

        /* Checking if the array has changed. */
        findField.funcion.map((x) => {
          if (hasChange) {
            return;
          }
          hasChange = !obj.funcion.some((y) => +y == +x);
        });

        /* Checking if the length of the array is different. */
        if (hasChange || obj.funcion.length != findField.funcion.length) {
          changes.push({
            operacion: 'UPDATE',
            variable: 'attributes',
            atributo: {
              ...findField,
              id: `ATTR-${(index + 1).toString().padStart(3, '0')}`,
            },
                        nombreEstructura: this.structureSelected.structure?.nombreEstructura,
          });
          return;
        }

        hasChange = false;

        /* Checking if the array has changed. */
        findField.origen.map((x) => {
          if (hasChange) {
            return;
          }
          hasChange = !obj.origen.some((y) => y == x);
        });

        if (hasChange || obj.origen.length != findField.origen.length) {
          changes.push({
            operacion: 'UPDATE',
            variable: 'attributes',
            atributo: {
              ...findField,
              id: `ATTR-${(index + 1).toString().padStart(3, '0')}`,
            },
                        nombreEstructura: this.structureSelected.structure?.nombreEstructura,
          });
          return;
        }

        hasChange = false;

        /* Checking if the array has changed. */
        findField.dominio.map((x) => {
          if (hasChange) {
            return;
          }
          hasChange = !obj.dominio.some((y) => y == x);
        });

        /* Checking if the value of the field has changed or not. */
        if (hasChange || obj.dominio.length != findField.dominio.length) {
          changes.push({
            operacion: 'UPDATE',
            variable: 'attributes',
            atributo: {
              ...findField,
              id: `ATTR-${(index + 1).toString().padStart(3, '0')}`,
            },
            nombreEstructura:
              this.structureSelected.structure?.nombreEstructura,
          });
          return;
        }

        hasChange = false;

        /* Checking if the array has changed. */
        findField.argumento.map((x) => {
          if (hasChange) {
            return;
          }
          hasChange = !obj.argumento.some((y) => y == x);
        });

        /* Checking if the object has changed or if the length of the argumento array is different from
        the length of the argumento array in the findField object. */
        if (hasChange || obj.argumento.length != findField.argumento.length) {
          changes.push({
            operacion: 'UPDATE',
            variable: 'attributes',
            atributo: {
              ...findField,
              id: `ATTR-${(index + 1).toString().padStart(3, '0')}`,
            },
                        nombreEstructura: this.structureSelected.structure?.nombreEstructura,
          });
          return;
        }

        hasChange = false;
      });

      /* Mapping through the attributeChanges array and checking if the attributes array has the same
      campo value. If it doesn't, it pushes the object to the changes array. */
      attributeChanges.map((obj, index) => {
        if (!attributes.some((x) => x.campo == obj.campo)) {
          changes.push({
            operacion: 'INSERT',
            variable: 'attributes',
            atributo: {
              ...obj,
              id: `ATTR-${(index + 1).toString().padStart(3, '0')}`,
            },
                    nombreEstructura: this.structureSelected.structure?.nombreEstructura,
          });
          return;
        }
      });

      return changes;
    };

    interface INotificationChange {
      operacion: 'INSERT' | 'UPDATE' | 'DELETE';
      variable: 'notification';
      notificacion: INotification;
      nombreEstructura: string;
    }

    // Verificacion de cambios en las notificaciones de la estructura
    const notificationChanges = (): any[] => {
      let changes: INotificationChange[] = [];

      // Listo de notificaciones del resumen de la estructura seleccionada
      const notificationsOfDetailProcess: INotification[] = this.structureSelected?.structure?.notificacion ?? [];

      // Se verifica si alguna poliza de la lista de notificaciones de resumen se ha eliminado
      notificationsOfDetailProcess.forEach((e: INotification): void => {
        if (!payload.notificacion.find((n: INotification) => n.fase == e.fase && n.numeroPoliza == e.numeroPoliza)) {
          changes.push({
            operacion: 'DELETE',
            variable: 'notification',
            nombreEstructura: this.structureSelected.structure?.nombreEstructura as string,
            notificacion: e as INotification
          });
        }
      });

      // Verificar si se hicieron cambios en alguna notificacion o se insertó uno nuevo
      // tslint:disable-next-line:max-line-length
      const notificationMapChanges: INotificationChange[] = payload.notificacion.map((obj: INotification): undefined | INotificationChange => {
        const findNotification: INotification = notificationsOfDetailProcess
          .find((notification: INotification) => notification.numeroPoliza == obj.numeroPoliza &&
            notification.fase == obj.fase);

        if (!findNotification) {
          return {
            operacion: 'INSERT',
            variable: 'notification',
            nombreEstructura: this.structureSelected.structure?.nombreEstructura as string,
            notificacion: obj as INotification
          };
        }

        const listEmailsPreviousChanges = {
          to: findNotification.listaCorreos ?? [],
          cc: findNotification.listaCC ?? [],
          cco: findNotification.listaCCO ?? []
        };

        const listEmailsCurrentChange = {
          to: obj.listaCorreos ?? [],
          cc: obj.listaCC ?? [],
          cco: obj.listaCCO ?? []
        };

        const verifyEveryListEmailsPreviousChange: boolean =
          listEmailsPreviousChanges.to.every((epc: string) => listEmailsCurrentChange.to.includes(epc)) &&
          listEmailsPreviousChanges.cc.every((epc: string) => listEmailsCurrentChange.cc.includes(epc)) &&
          listEmailsPreviousChanges.cco.every((epc: string) => listEmailsCurrentChange.cco.includes(epc));

        const verifyEveryListEmailsCurrentChange: boolean =
          listEmailsCurrentChange.to.every((epc: string) => listEmailsPreviousChanges.to.includes(epc)) &&
          listEmailsCurrentChange.cc.every((epc: string) => listEmailsPreviousChanges.cc.includes(epc)) &&
          listEmailsCurrentChange.cco.every((epc: string) => listEmailsPreviousChanges.cco.includes(epc));

        if (findNotification.contratante == obj.contratante &&
          findNotification.canalVenta == obj.canalVenta &&
          findNotification.transaccion == obj.transaccion &&
          findNotification.asunto == obj.asunto &&
          verifyEveryListEmailsPreviousChange && verifyEveryListEmailsCurrentChange) {
          return;
        }

        if (findNotification.contratante != obj.contratante ||
          findNotification.canalVenta != obj.canalVenta ||
          findNotification.transaccion != obj.transaccion ||
          findNotification.asunto != obj.asunto ||
          !verifyEveryListEmailsPreviousChange ||
          !verifyEveryListEmailsCurrentChange
        ) {
          return {
            operacion: 'UPDATE',
            variable: 'notification',
            nombreEstructura: this.structureSelected.structure?.nombreEstructura as string,
            notificacion: obj as INotification
          };
        }
      });

      changes = changes.concat(notificationMapChanges);
      return changes;
    };

    /* Creating a new object with the properties idEstructura and listaObjetos. */
    const newPayload = {
      idEstructura: this.structureSelected.structure?.structureId,
      listaObjetos: Array.from(
        policyChanges().concat(
          generalChanges(),
          registerChanges(),
          readChanges(),
          notificationChanges()
        )
      ),
    };

    const allChanges = [];

    /* Filtering out empty objects from the array. */
    newPayload.listaObjetos.map((obj) => {
      /* Checking if the object is empty or not. */
      if (!Object.values(obj || {})?.length) {
        return;
      }

      allChanges.push(obj);
    });

    newPayload.listaObjetos = allChanges;

    return newPayload;
  }

     /**
   * This function takes the policies that are checked, and then maps them to a new object that has the
   * same properties as the original object, but with the checked property set to false.
   */
    addPolicies(): void {
        /* this.policiesIncluded = this.policies$
        .filter((x) => x.checked)
        .map((obj) => ({
            ...obj,
            checked: false,
        }));*/

        let prod:number =0;
        let pol:number =0;

        let pattern = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;

        
        console.log(this.txtLeer);
        if (this.txtLeer =='' || this.txtValida ==''|| this.txtEmitir==''|| this.txtFact==''){
            this.messageInfo = {
                showImage: true,
                success: false,
                message:
                    'Es obligatorio registrar todos los tiempos',
                };
                this.vc.createEmbeddedView(this.modalMessage);
            return;
        }

        if (this.sumaTotal >= 720){ //720
            this.messageInfo = {
                showImage: true,
                success: false,
                message:
                    'El tiempo registrado no puede ser mayor a 12:00:00',
                };
                this.vc.createEmbeddedView(this.modalMessage);
            return;
        }

        if (!pattern.test(this.txtLeer)||!pattern.test(this.txtValida)||!pattern.test(this.txtEmitir)||!pattern.test(this.txtFact)){ //720
            this.messageInfo = {
                showImage: true,
                success: false,
                message:
                    'El tiempo registrado no concuerda con el formato, por favor revisar',
                };
                this.vc.createEmbeddedView(this.modalMessage);
            return;
        }
        this.spinner.show();

        this.listPoliza.forEach((e,i) =>{
            this.policiesIncluded.push({
                NLEER: this.txtLeer,
                NVALIDAR: this.txtValida,
                NEMITIR: this.txtEmitir,
                NFACTURAR: this.txtFact,
                NTOTAL: this.txtTotal,
                numeroPoliza: e.numeroPoliza,
                idProducto: e.idProducto,
                producto: e.producto,
                ruc: e.ruc,
                contratante: e.contratante,
                canal: e.canal,
                fechaInicio: e.fechaInicio,
                fechaFin: e.fechaFin,
                moneda: e.moneda,
                FacAgruText: e.facAgru === 1 ? 'SI':'NO',
                FacAutoText: e.facAuto === 1 ? 'SI':'NO',
                facAgru: e.facAgru === 1 ? 1 : 0,
                facAuto: e.facAuto === 1 ? 1 : 0
            });
        });

        this.listPoliza.forEach((e,i) =>{
            pol= parseInt(e.numeroPoliza,10),
            prod= parseInt(e.idProducto,10)

        });

        var body: any = {
            NLEER: this.input1,
            NVALIDAR:this.input2,
            NEMITIR: this.input3,
            NFACTURAR: this.input4,
            NTOTAL: this.sumaTotal,
            NPRODUCT:prod,
            NPOLICY:pol
        };

        console.log("envio al bag de newHorPol");
        console.log(body);

        this.configurationService.newHorPol(body).subscribe(
            (res) => {
                this.spinner.hide();
                console.log('recepcion de data: '+res.id)
                if (res.id == 0) {
                    this.messageInfo = {
                        showImage: true,
                        success: false,
                        message: res.description,
                    };
                    
                        this.modalService.dismissAll('content1');
                } else {
                    this.messageInfo = {
                        showImage: true,
                        success: false,
                        message: res.description,
                    };
                    this.modalService.dismissAll('content1');
                }
            },
            (err) => { }
        );

        this.configurationService.subject.next({
            key: this.configurationService.subjectEvents.POLICIES,
            payload: this.policiesIncluded,
        });

        this.setPhaseValues(this.policiesIncluded, 'policyCollection');
        this.closeModalPoliciesAvailable();
        this.listPoliza = [];


    }


//INI <RQ2024-57 - 03/04/2024> 
    editarPolicy(obj: any, index, content1): void {

        let NTOTAL:number =0;
        let NLEER:number =0;
        let NVALIDAR: number =0;
        let NEMITIR: number =0;
        let NFACTURAR: number =0;


        this.listPolizaEdit = [];
        this.listPolizaEdit2 = [];

        this.listPolizaEdit.push(
            {
                numeroPoliza: obj.numeroPoliza,
                producto: obj.producto,
                contratante: obj.contratante,
                checkedFacAgru: parseInt(obj.facAgru, 10),
                checkedFacAuto: parseInt(obj.facAuto, 10)
            }
        );

        const data: any = {
            NPRODUCT:parseInt(obj.idProducto,10),
            NPOLICY:parseInt(obj.numeroPoliza,10),
        };

        this.configurationService.verHorPol(data).subscribe(
            (res) => {
                console.log(res);
                if (res.id == 0) {
                    for(let i =0; i<res.detHora.length; i++){
                       switch (res.detHora[i].nprocess) {
                            case 1:
                                NLEER = res.detHora[i].ntime;
                                break;
                            case 2:
                                NVALIDAR = res.detHora[i].ntime;
                                break;
                            case 3:
                                NEMITIR = res.detHora[i].ntime;
                                break;
                            case 4:
                                NFACTURAR = res.detHora[i].ntime;
                                break;
                            default:
                                NTOTAL = res.detHora[i].ntime;
                                break;
                        }
                    }

                    this.listPolizaEdit2.push(
                        {
                            NTOTAL:this.formatMinutesToHHMMSS(NTOTAL),
                            NLEER: this.formatMinutesToHHMMSS(NLEER),
                            NVALIDAR: this.formatMinutesToHHMMSS(NVALIDAR),
                            NEMITIR: this.formatMinutesToHHMMSS(NEMITIR),
                            NFACTURAR: this.formatMinutesToHHMMSS(NFACTURAR)
                        }
                    );
                   
                } else {
                    this.messageInfo = {
                        showImage: true,
                        success: false,
                        message: res.Description,
                    };
                    this.modalService.dismissAll('content1');
                }
            },
            (err) => { }
        );

       
        this.vc.createEmbeddedView(this.content1);
    }

    cerrar(){
        this.vc.clear();
    }

    checkAgru(checked: boolean, policy: any): void {

        if (checked === true){
            this.listPolizaEdit[0].checkedFacAgru = 1;
            this.listPolizaEdit[0].FacAgruText = 'SI'
            this.listPolizaEdit[0].facAgru = 1
        }else{
            this.listPolizaEdit[0].checkedFacAgru = 0;
            this.listPolizaEdit[0].FacAgruText = 'NO'
            this.listPolizaEdit[0].facAgru = 0
        }
    }

    checkAuto(checked: boolean, policy: any): void {

        if (checked === true){
            this.listPolizaEdit[0].checkedFacAuto = 1;
            this.listPolizaEdit[0].FacAutoText = 'SI'
            this.listPolizaEdit[0].facAuto = 1
        }else{
            this.listPolizaEdit[0].checkedFacAuto = 0;
            this.listPolizaEdit[0].FacAutoText = 'NO'
            this.listPolizaEdit[0].facAuto = 0
        }
    }

    check2Agru(checked: boolean, policy: any): void {
       
        this.listPoliza.forEach((e,i) => {
            if (e.numeroPoliza === policy.numeroPoliza){
                if (checked === true){
                    this.listPoliza[i].checkedFacAgru = 1;
                    this.listPoliza[i].FacAgruText = 'SI'
                    this.listPoliza[i].facAgru = 1
                }else{
                    this.listPoliza[i].checkedFacAgru = 0;
                    this.listPoliza[i].FacAgruText = 'NO'
                    this.listPoliza[i].facAgru = 0
                }
            }
        });
    }

    check2Auto(checked: boolean, policy: any): void {

        this.listPoliza.forEach((e,i) => {
            if (e.numeroPoliza === policy.numeroPoliza){
                if (checked === true){
                    this.listPoliza[i].checkedFacAuto = 1;
                    this.listPoliza[i].FacAutoText = 'SI'
                    this.listPoliza[i].facAuto = 1
                }else{
                    this.listPoliza[i].checkedFacAuto = 0;
                    this.listPoliza[i].FacAutoText = 'NO'
                    this.listPoliza[i].facAuto =0
                }
            }
        });
    }

    actualizarProcesos(item: any){
        this.policiesIncluded.forEach((e,i) =>{
            if (e.numeroPoliza === this.listPolizaEdit[0].numeroPoliza){

                if (this.listPolizaEdit[0].checkedFacAgru === 1){
                    e.FacAgruText = 'SI'
                    e.facAgru = 1
                }else{
                    e.FacAgruText = 'NO'
                    e.facAgru = 0
                }

                if (this.listPolizaEdit[0].checkedFacAuto === 1){
                    e.FacAutoText = 'SI'
                    e.facAuto = 1
                }else{
                    e.FacAutoText = 'NO'
                    e.facAuto = 0
                }
                    
            }
        });

        this.configurationService.subject.next({
            key: this.configurationService.subjectEvents.POLICIES,
            payload: this.policiesIncluded,
          });

        this.setPhaseValues(this.policiesIncluded, 'policyCollection');

        this.vc.clear();
    }

    validarHora(hora:any, campo : any ){
        
        let pattern = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
        let time = 0;
        
        if(!pattern.test(hora)){
            this.messageInfo = {
                showImage: true,
                success: false,
                message:
                    'El formato de tiempo no es valido, por favor revisar',
                };
                this.vc.createEmbeddedView(this.modalMessage);
            return;   
        }
        const { hours, minutes, seconds } = this.decomposeTime(hora);

        time = ((hours * 60) + minutes + (seconds/60));

        this.sumarNumeros(time, campo)

    }

    decomposeTime(time: string): { hours: number, minutes: number, seconds: number } {
        const timeParts = time.split(':');
    
        if (timeParts.length !== 3) {
            throw new Error("Formato de tiempo incorrecto. Debe ser HH:MM:SS");
        }
    
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        const seconds = parseInt(timeParts[2], 10);
    
        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
            throw new Error("El tiempo contiene valores no numéricos.");
        }
    
        return { hours, minutes, seconds };
    }

    textValidate(event: any, typeText:string, longitud: number,inputId: string):any {
        const inputElement = event.target as HTMLInputElement;
        const startPosition = inputElement.selectionStart;
        const endPosition = inputElement.selectionEnd;
        
        //console.log('Start position:', startPosition);
        //console.log('End position:', endPosition);
    
        event.preventDefault();
        let valorNuevo;
        let valorActual=event.target.value;
        const position = event.target.selectionStart;
        const inputChar = String.fromCharCode(event.charCode);
        
        //debugger
        if(typeText=='1' || typeText=='2' || typeText=='3' || typeText=='4' || typeText=='5' || typeText=='6' || typeText=='7'){
            
          let pattern = new RegExp('[0-9]');
          pattern = new RegExp('[0-9]');
          /*switch (typeText) {
              case '1': { // Numericos
                  pattern = new RegExp('[0-9]');
                  break; 
              }
              case '2': { // Alfanumericos sin espacios
                  pattern = new RegExp('[0-9A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü]');
                  break; 
              }
              case '3': { // Alfanumericos con espacios
                  pattern = new RegExp('[0-9A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü ]');
                  break; 
              }
              case '4': { // LegalName
                  pattern = new RegExp('[a-zA-ZñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü0-9-,:()&$#\'. ]');
                  break; 
              }
              case '5': { // Solo texto
                  pattern = new RegExp('[A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü ]');
                  break; 
              }
              case '6': { // Email
                  pattern = new RegExp('[0-9A-Za-z._@-]');
                  break; 
              }
              case '7': { // Comprobante rebill
                  pattern = new RegExp('[0-9bfBF-]');
                  break; 
              }
          }*/
    
          if (!pattern.test(inputChar)) {
            event.target.value=valorActual;
            //console.log("valorActualfff:"+valorActual);return valorActual;
          }
          //event.target.value=this.textValidate(event, typeText);
        }else{
          if(typeText=='8'){
            let pattern = new RegExp('[0-9.]');
            if (!pattern.test(inputChar)) {
              event.target.value=valorActual;
             //console.log("valorActual a:"+valorActual);return valorActual;
            }
            if(inputChar=='.' && valorActual.split('.').length>1){
              event.target.value=valorActual;
              //console.log("valorActual b:"+valorActual);return valorActual;
            }
          }
        }
        if(valorActual=='0' && inputChar!='0' && (typeText=='1' || typeText=='8')){
          valorNuevo=inputChar;
        }else{
          if(position!=0){
            if(startPosition!=endPosition){
              if(startPosition!=0){
                valorNuevo=valorActual.substring(0, startPosition ) + inputChar + valorActual.substring(endPosition , valorActual.length);
              }else{
               // console.log("valorActual.substring(endPosition, valorActual.length):"+valorActual.substring(endPosition, valorActual.length));
                //console.log("valorActual.length:"+valorActual.length);
                //console.log("inputChar:"+inputChar);
                
                valorNuevo=''+inputChar + valorActual.substring(endPosition, valorActual.length);
              }
            }else{
              if(inputChar=='0' && position==0){
                return valorActual;
              }else{
                if(longitud<=valorActual.length){
                  if(typeText!='8'){
                    console.log("valorActual c:"+valorActual);return valorActual;
                  }
                }
                valorNuevo=valorActual.substring(0, position ) + inputChar + valorActual.substring(position , valorActual.length);
              }
            }
          }else{
            if(valorActual.length==endPosition){
              valorNuevo=inputChar;
            }
            else{
              valorNuevo=inputChar + valorActual.substring(endPosition , valorActual.length);
            }
          }
          if((valorNuevo.split('.').length>2 || valorNuevo.split('.')[0].length>longitud) && typeText=='8'){
            //console.log("valorActual d:"+valorActual);return valorActual;
          }
          if(typeText=='8'){
            if(!RegExp('^([0-9]{0,'+longitud+'})?(.{1}[0-9]{0,6})?$').test(valorNuevo)){
              //console.log("valorActual d:"+valorActual);return valorActual;
            }
            if(longitud==3 && valorNuevo.split('.')[0].length==longitud && valorNuevo!=100){
              //console.log("valorActual e:"+valorActual);return valorActual;
            }
          }
          
          //console.log("valorActual:"+valorActual);
          //console.log("length:"+valorActual.length);
          //console.log("position:"+position);
         // console.log("inputChar:"+inputChar);
          //console.log("valorNuevo:"+valorNuevo);
          // 1|Numericos
          // 2|Alfanumericos sin espacios
          // 3|Alfanumericos con espacios
          // 4|LegalName
          // 5|Solo texto
          // 6|Email
          // 7|Comprobante rebill
          // 8|Monto Dinero|longitud 3 porcentaje
        }
        console.log("valorNuevo:"+valorNuevo);
        this.sumarNumeros(valorNuevo,inputId);
        return valorNuevo;
    }

    onPaste(event: any, typeText:string, longitud: number,inputId: string):any {
        const inputElement = event.target as HTMLInputElement;
        const startPosition = inputElement.selectionStart;
        const endPosition = inputElement.selectionEnd;
            
        console.log('Start position:', startPosition);
        console.log('End position:', endPosition);
        let regextext='[0-9]'
        event.preventDefault();
        let pastetext = (event.clipboardData).getData("text");
        let valorNuevo;
        let valorActual=event.target.value;
        const position = event.target.selectionStart;
        const inputChar = String.fromCharCode(event.charCode);

        if(typeText=='1'){
            regextext='^([0-9]{0,'+longitud+'})?$';
        /*}else if(typeText=='2'){
            regextext='^([0-9A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü]{0,'+longitud+'})?$';
        }else if(typeText=='3'){
            regextext='^([0-9A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü ]{0,'+longitud+'})?$';
        }else if(typeText=='4'){
            regextext='^([a-zA-ZñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü0-9-,:()&$#\'. ]{0,'+longitud+'})?$';
        }else if(typeText=='5'){
            regextext='^([A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü ]{0,'+longitud+'})?$';
        }else if(typeText=='6'){
            regextext='^([0-9A-Za-z._@-]{0,'+longitud+'})?$';
        }else if(typeText=='7'){
            regextext='^([0-9bfBF-]{0,'+longitud+'})?$';
        }else if(typeText=='8'){
            regextext='^([0-9]{0,'+longitud+'})?(.{1}[0-9]{0,6})?$';*/
        }

        if(position!=0){
            if(startPosition!=endPosition){
                if(startPosition!=0){
                    valorNuevo=valorActual.substring(0, startPosition ) + pastetext + valorActual.substring(endPosition , valorActual.length);
                }else{
                    console.log("valorActual.substring(endPosition, valorActual.length):"+valorActual.substring(endPosition, valorActual.length));
                    console.log("valorActual.length:"+valorActual.length);
                    console.log("pastetext:"+pastetext);
                
                    valorNuevo=''+pastetext + valorActual.substring(endPosition, valorActual.length);
                }
            }else{
                if(pastetext=='0' && position==0){
                    return valorActual;
                }else{
                    if(longitud<valorActual.length){
                        //event.target.value=valorActual;
                        console.log("valorActual:"+valorActual);return valorActual;
                    }
                    valorNuevo=valorActual.substring(0, position ) + pastetext + valorActual.substring(position , valorActual.length);
                }
            }
        }else{
            if(valorActual.length==endPosition){
                valorNuevo=pastetext;
            }
            else{
                valorNuevo=pastetext + valorActual.substring(endPosition , valorActual.length);
            }
        }

            let patron=RegExp(regextext);
            console.log(patron);

        if(!patron.test(valorNuevo)){
            console.log("valorActual a:"+valorActual);return valorActual;
        }

        /*if(valorNuevo.split('.').length>2 && typeText=='8'){
          console.log("valorActual b:"+valorActual);return valorActual;
        }*/

        /*if(longitud==3 && valorNuevo.split('.')[0].length==longitud && valorNuevo!=100 && typeText=='8'){
          console.log("valorActual c:"+valorActual);return valorActual;
        }*/

        if(valorNuevo.length>longitud){
          console.log("valorActual d:"+valorActual);return valorActual;
        }
        
        console.log("valorActual:"+valorActual);
        console.log("length:"+valorActual.length);
        console.log("position:"+position);
        console.log("inputChar:"+inputChar);
        console.log("valorNuevo:"+valorNuevo);
        // 1|Numericos
        // 2|Alfanumericos sin espacios
        // 3|Alfanumericos con espacios
        // 4|LegalName
        // 5|Solo texto
        // 6|Email
        // 7|Comprobante rebill
        // 8|Monto Dinero|longitud 3 porcentaje
      /*}*/
        this.sumarNumeros(valorNuevo,inputId);
        return valorNuevo;
    }

    sumarNumeros(event:any, inputId: string){

        console.log('sumaTotal: ' +this.sumaTotal);

        let total = 0;

        switch (inputId) {
            case 'txtLeer':
                this.input1 = event;
            break;
            case 'txtValida':
                this.input2 = event;
            break;
            case 'txtEmitir':
                this.input3 = event;
            break;
            case 'txtFact':
                this.input4 = event;
            break;
            default:
            break;
        }
        this.sumaTotal = total = this.input1 + this.input2 + this.input3 + this.input4;

        this.txtTotal = this.formatMinutesToHHMMSS(total);
        console.log('sumaTotal: ' +this.sumaTotal);
    }

    formatMinutesToHHMMSS(totalMinutes: number): string {
        // Convertir los minutos totales a segundos
        const totalSeconds = Math.floor(totalMinutes * 60);
        
        // Calcular las horas
        const hours = Math.floor(totalSeconds / 3600);
        
        // Calcular los minutos restantes
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        
        // Calcular los segundos restantes
        const seconds = totalSeconds % 60;
        
        // Formatear a HH:mm:ss
        const formattedTime = 
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        return formattedTime;
    }
 //FIN <RQ2024-57 - 03/04/2024> 
}
