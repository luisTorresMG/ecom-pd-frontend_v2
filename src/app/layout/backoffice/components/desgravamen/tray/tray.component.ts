import {
  Component,
  OnInit,
  ViewContainerRef,
  TemplateRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import moment from 'moment';

import { DesgravamenService } from '../shared/services/desgravamen/desgravamen.service';
import { TrayService } from '../shared/services/tray/tray.service';

import { datePickerConfig } from '@shared/config/config';
import { ConfigurationService } from '@root/layout/backoffice/components/desgravamen/shared/services/configuration/configuration.service';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  standalone: false,
  selector: 'app-tray',
  templateUrl: './tray.component.html',
  styleUrls: ['./tray.component.sass'],
  providers: [DesgravamenService, TrayService]
})
export class TrayComponent implements OnInit {
  filterDatePickerConfig = {
    ...datePickerConfig,
    maxDate: new Date(),
  };

  controlSearch!: FormControl;
  formFilters!: FormGroup;
  
  

  currentPage = 1;
  structures$: Array<any> = [];
  structuresFiltered: Array<any> = [];

  messageInfo: {
    showImage?: boolean;
    success?: boolean;
    message?: string;
  } = {};

  structureSelected: any = {};

  policies$: Array<any> = [];
  contractors$: Array<any> = [];
  salesChannel$: Array<any> = [];

  @ViewChild('modalAdvancedFilters', { static: true, read: TemplateRef })
  modalAdvancedFilters: TemplateRef<ElementRef>;

  @ViewChild('modalConfirmDelete', { static: true, read: TemplateRef })
  modalConfirmDelete: TemplateRef<ElementRef>;

  @ViewChild('modalConfirmDisable', { static: true, read: TemplateRef })
  modalConfirmDisable: TemplateRef<ElementRef>;

  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  modalMessage: TemplateRef<ElementRef>;

  isLoading: boolean = false;//INI <RQ2024-57 - 03/04/2024>

  constructor(
    config: NgbModalConfig,//INI <RQ2024-57 - 03/04/2024>
    private readonly builder: FormBuilder,
    private readonly vc: ViewContainerRef,
    private readonly router: Router,
    private readonly spinner: NgxSpinnerService,
    private readonly desgravamenService: DesgravamenService,
    private readonly trayService: TrayService,
    private readonly configurationService: ConfigurationService,
    
  ) {
    this.controlSearch = this.builder.control('');
    this.formFilters = this.builder.group({
      policy: [''],
      contractor: [''],
      salesChannel: [''],
      createdAt: [null],
    });
    config.backdrop = 'static';
    config.keyboard = false;
    
  }

  ngOnInit(): void {
    this.getStructures();

    this.controlSearch.valueChanges.subscribe(() => {
      this.filterStructures();
    });
  }

  get formFilterControl(): { [key: string]: AbstractControl } {
    return this.formFilters.controls;
  }

  /**
   * It filters the structures$ observable based on the value of the search input and the values of the
   * formFilterControl object.
   * @param {string} val - string =&gt; the value of the column
   * @param {string} filterSearch - string = '';
   */
  private filterStructures(): void {
    const search = this.controlSearch.value;
    this.currentPage = 1;

    const simplifyString = (val: string, filterSearch: string): boolean => {
      return (
        (val ?? '').toLowerCase().slice(0, filterSearch.length) ==
        filterSearch.toLowerCase()
      );
    };

    /* Filtering the data based on the search criteria. */
    this.structuresFiltered = this.structures$.filter((x: any) => {
      const validate =
        (simplifyString(x.nombreEstructura, search) ||
          simplifyString(x.fechaCreacion, search) ||
          simplifyString(x.estado, search) ||
          simplifyString(x.transaccion, search) ||
          simplifyString(x.ramo, search) ||
          simplifyString(x.tipoArchivo, search)) &&
        (this.formFilterControl['policy'].value
          ? x.listaPolizas.includes(this.formFilterControl['policy'].value)
          : true) &&
        (this.formFilterControl['contractor'].value
          ? x.listaContratante.includes(
            this.formFilterControl['contractor'].value
          )
          : true) &&
        (this.formFilterControl['salesChannel'].value
          ? x.listaCanalesVentas.includes(
            this.formFilterControl['salesChannel'].value
          )
          : true) &&
        (this.formFilterControl['createdAt'].value
          ? moment(x.fechaCreacion).format('DD/MM/YYYY') ==
          moment(this.formFilterControl['createdAt'].value).format(
            'DD/MM/YYYY'
          )
          : true);

      return validate;
    });
  }

  /**
   * I'm getting a list of objects from an API, then I'm mapping the objects to get the values of the
   * properties I need, then I'm removing duplicates from the arrays, then I'm adding a default value
   * to the arrays, and finally I'm resetting the form.
   * @param [resetPage=false] - boolean
   */
  private getStructures(resetPage = false): void {
    if (resetPage) {
      this.currentPage = 1;
    }

    this.spinner.show();

    this.trayService.getAll().subscribe({
      next: (response: any) => {
        this.structures$ = this.structuresFiltered = response;

        response.map((obj: any) => {
          obj.listaPolizas.map((policy: any) => {
            this.policies$.push(policy);
          });

          obj.listaContratante.map((contractor: any) => {
            this.contractors$.push(contractor);
          });

          obj.listaCanalesVentas.map((salesChannel: any) => {
            this.salesChannel$.push(salesChannel);
          });
        });

        this.policies$ = Array.from(new Set(this.policies$)).map((x) => ({
          id: x,
          label: x,
        }));

        this.contractors$ = Array.from(new Set(this.contractors$)).map((x) => ({
          id: x,
          label: x,
        }));

        this.salesChannel$ = Array.from(new Set(this.salesChannel$)).map(
          (x) => ({
            id: x,
            label: x,
          })
        );

        const defaultOptionValue = {
          id: '',
          label: 'Seleccione',
        };

        this.policies$.unshift(defaultOptionValue);
        this.contractors$.unshift(defaultOptionValue);
        this.salesChannel$.unshift(defaultOptionValue);

        this.controlSearch.setValue('');
        this.resetFormFilters();
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
   * It resets the formFilters form to its default values, then calls the filterStructures() function,
   * which filters the data based on the formFilters form values, then closes the modal.
   */
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
    this.filterStructures();
    this.closeModal();
  }

  showModalAdvancedFilters(): void {
    this.vc.createEmbeddedView(this.modalAdvancedFilters);
  }

  submitFilters(): void {
    this.filterStructures();
    this.closeModal();
  }

  closeModal(): void {
    this.vc.clear();

    if (this.messageInfo.success) {
      this.getStructures(true);
    }

    this.messageInfo = {};
  }

  showModalAction(structure: any, modal: string): void {
    this.structureSelected = structure;
    this.vc.createEmbeddedView(this[modal]);
  }

  /**
   * "This function is used to show the detail of a structure, it receives the structureId and the
   * action to be performed, it calls the getDetail function of the trayService, which returns the
   * structure detail, then it stores the structure detail in the storage of the desgravamenService,
   * and finally it navigates to the configuration page of the structure."
   * </code>
   * @param {string} structureId - string
   * @param {string} action - string = 'detalle' | 'actualizar' | 'clonar';
   */
    showDetail(structureId: string, action: string): void {
        this.spinner.show();
        this.trayService.getDetail(structureId).subscribe({
            next: (response: any): void => {
                this.spinner.hide();

                if (response.success) {
                    this.desgravamenService.storage = {
                        params: {
                            structure: {
                                ...response,
                                structureId: structureId,
                            },
                            action: action,
                        },
                    };
                    this.getEmails(action, structureId);
                    return;
                }

                this.messageInfo = {
                    success: false,
                    showImage: true,
                    message:
                        'Ocurrió un error al intentar mostrar el detalle de la estructura',
                };
                this.vc.createEmbeddedView(this.modalMessage);
            },
            error: (error: HttpErrorResponse) => {
                console.error(error);
                this.spinner.hide();

                this.messageInfo = {
                success: false,
                showImage: true,
                message:
                    'Tenemos problemas para mostrar el detalle de la estructura, inténtelo más tarde',
                };
                this.vc.createEmbeddedView(this.modalMessage);
            },
        });
    }

  getEmails(action, structureId): void {
    this.spinner.show();
    this.configurationService.getEmails().subscribe({
      next: (response: any[]): void => {
        this.spinner.hide();

        if (response.length == 0) {
          this.messageInfo = {
            success: false,
            showImage: true,
            message:
              'Ocurrió un error al intentar mostrar el detalle de la estructura',
          };
          this.vc.createEmbeddedView(this.modalMessage);
          return;
        }

        this.desgravamenService.storage = {
          listEmails: response.map((obj: any) => ({
            correo: obj.correo,
            tipo: obj.tipo
          }))
        };

        this.router.navigate([
          `/backoffice/desgravamen/estructuras/configuracion/${action}/${structureId}`,
        ]);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
        this.messageInfo = {
          success: false,
          showImage: true,
          message:
            'Ocurrió un error al intentar mostrar el detalle de la estructura',
        };
        this.vc.createEmbeddedView(this.modalMessage);
      }
    });
  }

  /**
   * It disables a structure, and if it's successful, it shows a message, otherwise, it shows another
   * message.
   */
  disableStructure(): void {
    this.spinner.show();
    this.messageInfo.showImage = true;
    this.trayService
      .disable({
        idEstructura: this.structureSelected.idEstructura,
        activo: false,
      })
      .subscribe({
        next: (response: any) => {
          this.messageInfo.success = response.success;

          this.messageInfo.message = response.success
            ? 'Se desactivó la estructura, correctamente'
            : 'Ocurrió un problema al intentar desactivar la estructura';

          this.vc.clear();
          this.vc.createEmbeddedView(this.modalMessage);
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);

          this.messageInfo.success = false;
          this.messageInfo.message =
            'Tenemos problemas para desactivar la estructura, inténtelo más tarde';
          this.spinner.hide();

          this.vc.clear();
          this.vc.createEmbeddedView(this.modalMessage);
        },
        complete: () => {
          this.spinner.hide();
        },
      });
  }

  /**
   * I'm trying to delete a structure, and if it's successful, I want to show a modal with a message,
   * if it's not successful, I want to show a modal with a different message.
   */
  deleteStructure(): void {
    this.spinner.show();
    this.messageInfo.showImage = true;

    this.trayService.delete(this.structureSelected.idEstructura).subscribe({
      next: (response: any) => {
        this.messageInfo.success = response.success;

        this.messageInfo.message = response.success
          ? 'Se eliminó la estructura, correctamente'
          : 'Ocurrió un problema al intentar eliminar la estructura';

        this.vc.clear();
        this.vc.createEmbeddedView(this.modalMessage);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);

        this.messageInfo.success = false;
        this.messageInfo.message =
          'Tenemos problemas para eliminar la estructura, inténtelo más tarde';
        this.spinner.hide();

        this.vc.clear();
        this.vc.createEmbeddedView(this.modalMessage);
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  configurationPage(): void {
    this.router.navigate(['/backoffice/desgravamen/estructuras/configuracion']);
  }

//INI <RQ2024-57 - 03/04/2024>  

    configurationHorario(){ 
        this.router.navigate(['/backoffice/desgravamen/estructuras/horario']);
        
    }

   
    

//FIN <RQ2024-57 - 03/04/2024>  
}
