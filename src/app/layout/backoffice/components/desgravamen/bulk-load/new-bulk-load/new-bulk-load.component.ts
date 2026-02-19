import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import moment from 'moment';

import { BulkLoadService } from '../../shared/services/bulk-load/bulk-load.service';
import { ConfigurationService } from '../../shared/services/configuration/configuration.service';

import { datePickerConfig } from '@shared/config/config';
import { RegularExpressions } from '@shared/regexp/regexp';

import Swal from 'sweetalert2'; //INI <RQ2024-57 - 03/04/2024> 
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap'; //INI <RQ2024-57 - 03/04/2024> 

@Component({
  selector: 'app-new-bulk-load',
  templateUrl: './new-bulk-load.component.html',
  styleUrls: ['./new-bulk-load.component.sass'],
  providers: [BulkLoadService, ConfigurationService],
})
export class NewBulkLoadComponent implements OnInit {
  /* Using the spread operator to copy the contents of the datePickerConfig object into a new object
  called datepickerConfig. */
  datepickerConfig: any = {
    ...datePickerConfig,
    dateInputFormat: 'MM/YYYY',
    minMode: 'month',
  };
  form!: FormGroup;

 

  tabKeys: { 1: string; 2: string; 3: string } = {
    1: 'policy',
    2: 'ruc',
    3: 'contractor',
  };

  structureInfo$: any = null;
  policies$: Array<any> = [];
  products$: Array<any> = [];
  transactions$: Array<any> = [];
  values: Array<any> = [];

  contractors$: Array<any> = [];

  attachedFile: File = null;

  messageInfo: {
    showImage?: boolean;
    success?: boolean;
    message?: string;
  } = {};

  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  modalMessage: TemplateRef<ElementRef>;

  chk_emit_generatem: any = false; //INI <RQ2024-57 - 03/04/2024> 
  chk_billm: any = false; //INI <RQ2024-57 - 03/04/2024> 
  chk_read: any = true; //INI <RQ2024-57 - 03/04/2024> 
  listProcess: any[] = []; //INI <RQ2024-57 - 03/04/2024> 
  listProcessTem: any[] = []; //INI <RQ2024-57 - 03/04/2024> 
  listProcessFin: any[] = []; //INI <RQ2024-57 - 03/04/2024> 
  listFilteredProcesses$: Array<any> = []; //INI <RQ2024-57 - 03/04/2024> 
  btnAgrFact = 'predefined'; //'predefined'  //INI <RQ2024-57 - 03/04/2024> 
  tblAgrFact = 'predefined'; //'predefined'  //INI <RQ2024-57 - 03/04/2024> 
  listStates$: {
                    id: string,
                    estado: string
                }[] = [];//INI <RQ2024-57 - 03/04/2024> 

  constructor(
    private readonly builder: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly vc: ViewContainerRef,
    private readonly router: Router,
    private readonly bulkLoadService: BulkLoadService,
    private readonly configurationService: ConfigurationService,
    private modalService: NgbModal
  ) {

     this.form = this.builder.group({
    type: ['', Validators.required],
    ruc: [
      '',
      [
        Validators.pattern(RegularExpressions.numbers),
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11),
      ],
    ],
    policy: [
      '',
      [Validators.pattern(RegularExpressions.numbers), Validators.required],
    ],
    contractor: ['', Validators.required],
    product: ['', Validators.required],
    salesChannel: ['', Validators.required],
    transaction: ['', Validators.required],
    declarationPeriod: [null, Validators.required],
    read: [{ value: true, disabled: true }, Validators.requiredTrue],
    migration: [false, Validators.required],
    billing: [false, Validators.required],
  });
  }

  ngOnInit(): void {
    this.formValueChanges();
    this.formControl['type'].setValue(1);
    this.getContractors();
  }

  get formControl(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') ?? '{}');
  }

  /**
   * This function retrieves a list of contractors and maps them into an array of objects with an id
   * and label property.
   */
  getContractors(): void {
    this.spinner.show();
    this.bulkLoadService.getContractors().subscribe({
      next: (response: Array<string>) => {
        this.contractors$ = response.map((contractorName) => ({
          id: contractorName,
          label: contractorName,
        }));

        this.spinner.hide();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  resetValues(): void {
    const values = {
      product: '',
      salesChannel: '',
      transaction: '',
    };

    /* Setting the value of the key to an empty string. */
    Object.keys(this.tabKeys).map((value: string) => {
      if (value == this.formControl['type'].value) {
        return;
      }

      values[this.tabKeys[value]] = '';
    });

    this.form.patchValue(values, {
      emitEvent: false,
    });

    this.structureInfo$ = null;
    this.policies$ = [];
    this.products$ = [];
    this.transactions$ = [];
  }

  /**
   * When the value of the type field changes, reset the values of the other fields, enable the form,
   * set the values of the other fields to empty strings, and disable the contractor and salesChannel
   * fields if the type field is 1 or 2, or disable the ruc and salesChannel fields if the type field
   * is 3.
   */
    formValueChanges(): void {
        this.formControl['type'].valueChanges.subscribe((value: string) => {
        this.resetValues();

        this.form.enable({
            emitEvent: false,
        });
        this.formControl['read'].disable({
            emitEvent: false,
        });

        this.formControl['ruc'].setValue('');
        this.formControl['contractor'].setValue('');
        this.formControl['policy'].setValue('');

        switch (+value) {
            case 1:
            case 2:
            this.formControl['contractor'].disable({
                emitEvent: false,
            });
            this.formControl['salesChannel'].disable({
                emitEvent: false,
            });
            break;
            case 3:
            this.formControl['ruc'].disable({
                emitEvent: false,
            });
            this.formControl['salesChannel'].disable({
                emitEvent: false,
            });
            break;
        }
        });

        this.formControl['ruc'].valueChanges.subscribe((value: string) => {
        if (this.formControl['ruc'].hasError('pattern')) {
            this.formControl['ruc'].setValue(value.slice(0, value.length - 1));
        }
        });

        this.formControl['policy'].valueChanges.subscribe((value: string) => {
        if (this.formControl['policy'].hasError('pattern')) {
            this.formControl['policy'].setValue(value.slice(0, value.length - 1));
        }
        });

        this.formControl['contractor'].valueChanges.subscribe((value: string) => {
        if (this.formControl['type'].value != 3) {
            return;
        }

        this.getInformation('contractor');
        });
    }

  /**
   * The function is called when a file is dropped into the dropzone. It checks the file extension and
   * size and if they are valid, it assigns the file to the attachedFile variable.
   * @param {NgxFileDropEntry[]} files - NgxFileDropEntry[]
   */
  dropped(files: NgxFileDropEntry[]) {
    this.messageInfo = {};

    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          const ext = file.name.split('.').pop();
          const extensionIncludes = ['txt', 'csv', 'xlsx'];

          const size = file.size / 1024 / 1024;

          if (!extensionIncludes.includes(ext)) {
            this.messageInfo.message =
              'La extensión del archivo no está permitida.';
            return;
          }

          if (size > 80) {
            this.messageInfo.message =
              'El tamaño máximo del archivo es de 5MB.';
            return;
          }

          this.attachedFile = file;
        });
      }
    }
  }

  deleteUploadedFile(): void {
    this.attachedFile = null;
  }

  /**
   * It gets information from the server based on the value of the formControl['type'] and then sets
   * the values of the other formControls.
   * @param {string} controlName - string =&gt; the name of the form control that will be used to get
   * the value.
   */
    getInformation(controlName: string): void {
        if (this.formControl[controlName].invalid) {
        return;
        }

        this.spinner.show();

        this.resetValues();

        /* A way to dynamically set the key of the payload object. */
        const payload: any = {
        type: this.formControl['type'].value,
        };

        payload.value = this.formControl[this.tabKeys[+this.formControl['type'].value]].value;

        this.bulkLoadService.getInformation(payload).subscribe({
        next: (response: any): void => {
            const responseKeys = {
            1: 'listaDatosPorNumeroPoliza',
            2: 'listaDatosPorRuc',
            3: 'listaDatosPorContratante',
            };

            if (response.success) {
            this.values = response[responseKeys[+this.formControl['type'].value]];

            if (!this.values) {
                return;
            }

            this.structureInfo$ = this.values[0];

            this.formControl['contractor'].setValue(
                this.values[0]?.contratante ||
                this.formControl['contractor'].value ||
                '',
                {
                emitEvent: false,
                }
            );

            this.formControl['ruc'].setValue(
                this.values[0]?.ruc || this.formControl['ruc'].value || ''
            );

            this.formControl['salesChannel'].setValue(
                this.values[0]?.canalVenta || ''
            );

            this.transactions$ = [
                {
                id: 'VENTA',
                label: 'VENTA',
                },
            ];

            this.formControl['transaction'].setValue('VENTA');

            this.products$ = this.values.map((obj) => ({
                id: obj.idProducto,
                label: obj.producto
            }));
            this.policies$ = this.values.map(
                (obj) => obj.numeroPoliza || this.formControl['policy'].value
            );

            this.products$ = Array.from(new Set(this.products$)).map((value) => ({
                id: value.label,
                label: value.label,
                productId: value.id
            }));
            this.policies$ = Array.from(new Set(this.policies$)).map((value) => ({
                id: value,
                label: value,
            }));

            if (this.products$.length == 1) {
                this.formControl['product'].setValue(this.products$[0].label);
            }

            if (this.policies$.length == 1) {
                this.formControl['policy'].setValue(this.policies$[0].id);
            }
            
            if (this.values[0]?.facAuto != 0){
                this.chk_billm = true;
                this.chk_emit_generatem = true;
                this.formControl['migration'].disable({
                    emitEvent: false,
                });
            }else{
                this.chk_billm = false;
            }

            if(this.values[0]?.facAgru != 0){
                this.btnAgrFact = 'opentype';
            }
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
   * The function is called when the user clicks on the submit button. It checks if the form is valid
   * and if the user has attached a file. If the form is invalid or the user hasn't attached a file,
   * the function returns. If the form is valid and the user has attached a file, the function
   * continues.
   *
   * The function then calls the bulkLoadService.saveFilename() function, which returns an observable.
   * The observable is subscribed to and the next() function is called. The next() function checks if
   * the response is successful. If it isn't, the function returns. If it is, the function continues.
   *
   * The function then checks if the response.url is equal to 0. If it is, the function returns. If it
   * isn't, the function continues.
   *
   * The function then calls the saveFile() function, which returns an observable. The observable is
   * subscribed to and the next() function is called.
   * @returns {
   *   "success": true,
   *   "url": "https://aws.protecta...",
   *   "idProceso": "222"
   * }
   */
    onSubmit(): void {
        //debugger
        //INI <RQ2024-57 - 03/04/2024> 
        this.spinner.show();
        //this.spinner.hide();
        if (/*this.form.invalid || */!this.attachedFile) {
        return;
        }

        if (this.chk_emit_generatem == true){ // el check de emisión activo, validará el horario de migración
            let bill = 0;

            if (this.chk_billm == true){ //El check de facturación tambien seleccionado
                bill = 1;
            }
            
            const data: any = {
                NPRODUCT: this.products$.find((p): boolean => p.label == this.formControl['product'].value)?.productId ?? 1,
                NPOLICY: this.formControl['policy'].value,
                NRUC: this.formControl['ruc'].value,
                NBILL: bill
            };

            this.bulkLoadService.validarHorarioMigra(data).subscribe(
                async (res) => {
        
                  this.spinner.hide();
                    if (res.id == 0){//todo correcto desde la bd

                        this.validarSuspendida();

                    }else if (res.id == 1){ //muestra mensajes correcto pero sin horario configurado
                        this.spinner.hide();
                        const result = await Swal.fire({
                            title: res.description,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Aceptar',
                            allowOutsideClick: false,
                            cancelButtonText: 'Cancelar',
                        });
                            if (result.value) {
                                this.spinner.show();
                                this.validarSuspendida(); //el usuario desea continuar pese a no tener horario
                            }else{
                                process.exit(1); //el usuario no desea continuar pero tod esta bien,
                            }
                    }else{//muestra mensajes de error desde la bd
                        this.spinner.hide();
                        const result = await Swal.fire({
                            title: res.description,
                            icon: 'error',
                            showCancelButton: true,
                            confirmButtonText: 'Aceptar',
                            allowOutsideClick: false,
                            cancelButtonText: 'Cancelar',
                        });
                            process.exit(1);
                    }
                },
                      (err) => { console.log("error de respuesta: ");}
            );

        }else{// en caso de no tener el check de emisión y facturación seleccionado
            this.validarEstructura(); 
        }
    }

    validarSuspendida(){    
        if (this.chk_billm == true){// el check de facturación activo
            //valida si se encuentra dentro del periodo de suspención de facturación
            const data: any = {
                NPOLICY: this.formControl['policy'].value
            };
            this.bulkLoadService.getFacSuspendida(data).subscribe(
                async (res) => {
        
                    this.spinner.hide();
                        if (res.id == 1){
                            this.spinner.hide();
                            const result = await Swal.fire({
                                title: res.description,
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonText: 'Aceptar',
                                allowOutsideClick: false,
                                cancelButtonText: 'Cancelar',
                            });

                            if (result.value) {
                                this.spinner.show();
                                this.validarEstructura(); //dentro de periodo pero guardará la carga
                            }else{
                                process.exit(1);
                            }

                        }else if (res.id == 2){ //muestra mensajes de error desde la bd
                            this.spinner.hide();
                            const result = await Swal.fire({
                                title: res.description,
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonText: 'Aceptar',
                                allowOutsideClick: false,
                                cancelButtonText: 'Cancelar',
                            });
                                process.exit(1);
                        }else{
                            this.spinner.show();
                            this.validarEstructura(); //fuera del periodo y procesará la carga
                        }
                },
                (err) => { console.log("error de respuesta: ");}
            );
        }

        if (this.chk_billm == false){
            this.spinner.show();
            this.validarEstructura(); 
        }
    }

    async validarEstructura():Promise<void>{

        let jj = 0; 

        if (this.values[0]?.facAuto == 0 && this.chk_billm == true){
            this.spinner.hide();
            const result = await Swal.fire({
                title: 'Existe una configuración previa inhabilitada para la facturación automática, pero seleccionó la opción de “Facturar” en esta carga, ¿desea continuar?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar',
            });
                if (result.value) {
                jj = 1;                
            }else{
                jj = 0;
                process.exit(1);
            }
            
        }

        // Evalua la configuración previa de facturación automática
        if (this.values[0]?.facAuto != 0 && this.chk_billm == false){
            this.spinner.hide();
            const result = await Swal.fire({
                title: 'Existe una configuración previa habilitada para la facturación automática, pero no seleccionó la opción de “Facturar” en esta carga, ¿desea continuar?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar',
            });

            if (result.value) {
                jj = 1;                
            }else{
                jj = 0;
                process.exit(1);
            }
        }

        if(this.values[0]?.facAuto && this.chk_billm == true){
            jj = 1;   
        }

        if ((jj == 1) || ((jj==0) && (this.chk_emit_generatem == false))){
            this.spinner.show();
            this.procesarCarga();
        }

        if (((jj==0) && (this.chk_emit_generatem == true))){
            this.spinner.show();
            this.procesarCarga();
        }
    }

  procesarCarga(): void {

        // si todo es correcto procede con la carga
        console.log('entrada a onSubmit2: ')
            //concatena los procesos seleccionados
            let proces: string = '';
            
            if (this.listProcessFin.length > 0){
                for(let i = 0; i < this.listProcessFin.length; i++){
                    proces = proces + this.listProcessFin[i].numProceso + ','
                }
            }

        
            this.spinner.show();

            const payload = {
                numeroPoliza: this.formControl['policy'].value,
                contratante: this.formControl['contractor'].value,
                producto: this.formControl['product'].value,
                estructura: this.structureInfo$.idEstructura,
                canalVenta: this.formControl['salesChannel'].value,
                periodoDeclaracion: moment(this.formControl['declarationPeriod'].value).format('MM-YY'),
                transaccion: this.formControl['transaction'].value,
                ruc: this.formControl['ruc'].value,
                nombreArchivo: this.attachedFile.name,
                idProducto: this.products$.find((p): boolean => p.label == this.formControl['product'].value)?.productId ?? 1,
                migracion: this.formControl['migration'].value,
                facturacion: this.formControl['billing'].value,
                idUsuario: this.currentUser['id'],
                procesosAdj: proces
            };
            this.bulkLoadService.saveFilename(payload).subscribe({
            next: (response) => {
                this.spinner.hide();

                if (!response.success) {
                this.messageInfo.success = response.success;
                this.messageInfo = {
                    showImage: true,
                    message: 'Ocurrió un error al guardar la información',
                };
                this.vc.createEmbeddedView(this.modalMessage);
                return;
                }

                const errors = [0, 1];

                /* The above code is checking if the `response.url` is included in the `errors` array. If it
                is, it sets the `messageInfo` object with a `success` property set to `false` and a
                `showImage` property set to `true`. It then uses a switch statement to set the `message`
                property of the `messageInfo` object based on the value of `response.url`. Finally, it
                creates an embedded view using the `modalMessage` template. */
                if (errors.includes(+response.url)) {
                    this.messageInfo = {
                        success: false,
                        showImage: true,
                    };
                    switch (+response.url) {
                        case 0:
                        this.messageInfo.message = 'El nombre del archivo es incorrecto.';
                        break;

                        case 1:
                        this.messageInfo.message = 'La póliza esta pendiente de facturar';
                        break;
                    }

                    this.vc.createEmbeddedView(this.modalMessage);
                    return;
                }

                 this.saveFile(response.idProceso, response.url, this.attachedFile);
                 },
                error: (error: HttpErrorResponse) => {
                     console.error(error);

                    this.spinner.hide();

                    this.messageInfo = {
                        success: false,
                        showImage: true,
                        message:'Tenemos problemas para guardar la información, inténtelo más tarde',
                    };
                this.vc.createEmbeddedView(this.modalMessage);
                },
            });
    }

  /**
   * It takes a processId, url and file as parameters and then calls the saveFile method of the
   * bulkLoadService.
   * @param {string} processId - string, url: string, file: File
   * @param {string} url - string,
   * @param {File} file - File
   */
    private saveFile(processId: string, url: string, file: File): void {

        this.bulkLoadService.saveFile({url: url, file: file,}).subscribe({
            next: (response: HttpResponse<any>) => {
                this.messageInfo.success = response.status == 200;
                this.messageInfo.showImage = true;

                if (response.status == 200) {
                this.messageInfo.message = `El proceso ${processId} se agregó correctamente, revisa tus registros para ver el resultado`;
                    const myFormData: FormData = new FormData();
                    myFormData.append('dataFile', file);
                    myFormData.append('PROCESSID', processId);

                    this.bulkLoadService.volcadoFile(myFormData).subscribe(
                        (res) => {
                            if (res.Id == 0) {
                                this.spinner.hide();
                                console.log(res.Description)
                            } else {
                                this.spinner.hide();
                                this.messageInfo.message = 'Ocurrió un error al realizar el volcado de los datos, por favor contactar con SD';
                            }
                        },
                        (err) => {
                            this.spinner.hide();
                        }
                    );
                return;
                }

                this.messageInfo.message ='Ocurrió un error al guardar la información';
            },
            error: (error: HttpErrorResponse) => {
                console.error(error);

                this.spinner.hide();
                this.messageInfo = {
                success: false,
                showImage: true,
                message:
                    'Tenemos problemas para agregar la trama, inténtelo más tarde',
                };
                this.vc.createEmbeddedView(this.modalMessage);
            },
            complete: () => {
                this.spinner.hide();
                this.vc.createEmbeddedView(this.modalMessage);
            },
        });
    }

    closeModal(): void {
        this.vc.clear();

        if (this.messageInfo.success) {
        this.router.navigate(['/backoffice/desgravamen/carga-masiva/bandeja']);
        return;
        }

        this.messageInfo = {};
    }

    //INI <RQ2024-57 - 03/04/2024> 
    checkEmision(): void {

        if(!this.chk_emit_generatem && this.chk_billm ){
            Swal.fire('Información', 'Es necesario que emisión se encuentre seleccionado'
            , 'info');

        }
    }

    checkFactu(): void {

        if(!this.chk_emit_generatem && this.chk_billm ){

            this.chk_emit_generatem = true;
            this.formControl['migration'].disable({
                emitEvent: false,
              });
        }
    
        if (!this.chk_billm){
            this.formControl['migration'].enable({
                emitEvent: false,
              });
        }
    }

    agruparFactura(content1: any, poliza: any): void {
        this.listProcessFin = [];
        this.listProcess =[];
        this.listProcessTem = [];
        this.tblAgrFact = 'predefined';

        this.modalService.open(content1, {
            size: 'xl',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: false,
        });

        this.spinner.show();

        this.bulkLoadService.listProcesses().subscribe({
        next: (response: Array<any>): void => {

            response.forEach((i) =>{
                if (i.contratante === poliza.contratante && i.fase == 2 && i.tasaExito == 100){

                    this.listProcess.push({
                        numProceso: i.idProceso,
                        transaccion: i.transaccion,
                        contratante: i.contratante,
                        fechaCarga: i.fechaCreacion,
                        fechaEstado: i.estadoFecha
                    });
                }
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

    agregarProcUno(checked: boolean, item : any) : void {

        if(checked === false){
            for(let i = 0; i < this.listProcessTem.length; i++){
                if (this.listProcessTem[i].numProceso === item.numProceso){
                    this.listProcessTem.splice(i,1);
                    break;
                }
            }
        }else {
            this.listProcessTem.push({
                numProceso: item.numProceso,
                transaccion: item.transaccion,
                contratante: item.contratante,
                fechaCarga: item.fechaCarga,
                fechaEstado: item.fechaEstado
            });
        }
        console.log('cantidad de obtenido: ' + this.listProcessTem.length);
    }

    agregarProcesos(): void {

        if (this.listProcessTem.length > 0){

            this.listProcessFin = this.listProcessTem;
            this.listProcessTem = [];
            this.listProcess =[];
            this.modalService.dismissAll('content1');
            this.tblAgrFact = 'opentype';

            this.chk_emit_generatem = true;
            this.chk_billm = true;

            this.formControl['billing'].disable();
            this.formControl['migration'].disable();
        }
    }

    Borrar(proc : any): void {

        Swal.fire({
            title: '¿Desea borrar el proceso seleccionado?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {

                for(let i = 0; i < this.listProcessFin.length; i++){
                    if (this.listProcessFin[i].numProceso === proc){
                        this.listProcessFin.splice(i,1);
                        break;
                    }
                }
            }
        });

        if(this.listProcessFin.length > 1){
            this.chk_emit_generatem = true;
            this.chk_billm = true;
        }else{
            if (this.values[0]?.facAuto != 0){
                this.chk_billm = true;
                this.chk_emit_generatem = true;
                this.formControl['migration'].disable({
                    emitEvent: false,
                });
            }else{
                this.chk_billm = false;
                this.chk_emit_generatem = false;
            }
            this.formControl['billing'].enable();
            this.formControl['migration'].enable();
        }
    }

    cerrar(content1: any)
    {
        Swal.fire({
            title: '¿Desea cerrar la ventana?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {

                this.modalService.dismissAll(content1);
            }
        });
    }
    //FIN <RQ2024-57 - 03/04/2024> 
}
