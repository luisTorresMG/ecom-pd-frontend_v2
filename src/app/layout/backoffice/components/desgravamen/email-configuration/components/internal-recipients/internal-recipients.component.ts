import { Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';

import { EmailConfigurationService } from '../../shared/services/email-configuration/email-configuration.service';
import {
  ICreateRecipientResponse, IDeleteRecipientRequest, IDeleteRecipientResponse,
  IGetRecipientsResponse,
  IRecipient, IUpdateRecipientResponse
} from '../../shared/interfaces/email-configuration.interface';
import { RegularExpressions } from '@shared/regexp/regexp';

interface IResponse {
  success: boolean;
  message: string;
  showImage: boolean;
  reloadList?: boolean;
}

@Component({
  selector: 'app-internal-recipients',
  templateUrl: './internal-recipients.component.html',
  styleUrls: ['./internal-recipients.component.sass']
})
export class InternalRecipientsComponent implements OnInit {

  recipientForm: FormGroup = this.builder.group({
    names: ['', [
      Validators.required,
      Validators.pattern(RegularExpressions.text)
    ]],
    email: ['', [
      Validators.pattern(RegularExpressions.email),
      Validators.required
    ]],
    cellPhone: ['', [
      Validators.pattern(RegularExpressions.numbers),
      Validators.required,
      Validators.minLength(9),
      Validators.maxLength(9)
    ]]
  });
  searchFilterControl: FormControl = this.builder.control('');

  recipients$: IRecipient[] = [];
  recipientFiltering$: IRecipient[] = [];
  selectedRecipient: IRecipient;

  recipientFormMode: 'create' | 'update';

  response$: IResponse;
  currentPage: number = 1;

  @ViewChild('modalRecipient', { static: true, read: TemplateRef })
  modalRecipient: TemplateRef<ElementRef>;
  @ViewChild('modalConfirmDeleteRecipient', { static: true, read: TemplateRef })
  modalConfirmDeleteRecipient: TemplateRef<ElementRef>;
  @ViewChild('modalResponse', { static: true, read: TemplateRef })
  modalResponse: TemplateRef<ElementRef>;

  constructor(
    private readonly builder: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly vcr: ViewContainerRef,
    private readonly emailConfigurationService: EmailConfigurationService,
  ) {
  }

  ngOnInit(): void {
    this.getAllRecipients();
    this.formValueChanges();
  }

  get recipientFormControl(): { [key: string]: AbstractControl } {
    return this.recipientForm.controls;
  }

  private formValueChanges(): void {
    this.searchFilterControl.valueChanges.subscribe((value: string) => {
      this.currentPage = 1;
      this.recipientFiltering$ = this.recipients$
        .filter((obj: IRecipient) => obj.correo.toLowerCase().includes(value.toLowerCase()) ||
          obj.nombres.toLowerCase().includes(value.toLowerCase()) ||
          obj.telefono.toLowerCase().includes(value.toLowerCase()));
    });

    this.recipientFormControl['cellPhone'].valueChanges.subscribe((value: string): void => {
      if (!value) {
        return;
      }

      if (this.recipientFormControl['cellPhone'].hasError('pattern') || +value.slice(0, 1) != 9) {
        this.recipientFormControl['cellPhone'].setValue(value.slice(0, value.length - 1));
      }
    });

    this.recipientFormControl['names'].valueChanges.subscribe((value: string): void => {
      if (!value) {
        return;
      }

      if (this.recipientFormControl['names'].hasError('pattern')) {
        this.recipientFormControl['names'].setValue(value.slice(0, value.length - 1));
      }
    });
  }

  getAllRecipients(): void {
    this.spinner.show();
    this.currentPage = 1;

    this.emailConfigurationService.getRecipients().subscribe({
      next: (response: IGetRecipientsResponse): void => {
        this.recipientFiltering$ = this.recipients$ = response.listaCorreos?.filter((x: IRecipient): boolean => +x.tipo == 2) ?? [];
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: (): void => {
        this.spinner.hide();
      }
    });
  }

  showModalRecipient(action: 'create' | 'update', recipient?: IRecipient): void {
    this.recipientForm.enable({
      emitEvent: false
    });

    this.recipientFormMode = action;

    let formValues = {
      names: '',
      email: '',
      cellPhone: ''
    };

    if (action == 'update') {
      formValues = {
        names: recipient.nombres,
        email: recipient.correo,
        cellPhone: recipient.telefono
      };

      this.recipientFormControl['email'].disable({
        emitEvent: false
      });
    }

    this.recipientForm.patchValue(formValues);

    this.vcr.createEmbeddedView(this.modalRecipient);
  }

  onSubmitRecipient(): void {
    if (this.recipientForm.invalid) {
      return;
    }

    this.vcr.clear();

    if (this.recipientFormMode == 'create') {
      this.createRecipient();
      return;
    }

    this.updateRecipient();
  }

  private get createRecipientPayload(): any {
    return {
      nombres: this.recipientFormControl['names'].value as string,
      correo: this.recipientFormControl['email'].value as string,
      telefono: this.recipientFormControl['cellPhone'].value as string,
      canalVenta: null,
      contratante: null,
      tipo: '2' as '1' | '2'
    };
  }

  private createRecipient(): void {
    this.spinner.show();

    this.emailConfigurationService.createRecipient(this.createRecipientPayload).subscribe({
      next: (response: ICreateRecipientResponse): void => {
        console.dir(response);

        this.response$ = {
          success: response.success,
          message: response.success ? 'Se guardó correctamente la información' : 'Ocurrió un problema al guardar la información',
          showImage: true,
          reloadList: response.success
        };
        this.vcr.createEmbeddedView(this.modalResponse);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();

        this.response$ = {
          success: false,
          message: 'Tenemos problemas para guardar la información',
          showImage: true
        };
        this.vcr.createEmbeddedView(this.modalResponse);
      },
      complete: (): void => {
        this.spinner.hide();
      }
    });
  }

  private updateRecipient(): void {
    this.spinner.show();

    this.emailConfigurationService.updateRecipient(this.createRecipientPayload).subscribe({
      next: (response: IUpdateRecipientResponse): void => {
        console.dir(response);

        this.response$ = {
          success: response.success,
          message: response.success ? 'Se actualizó correctamente la información' : 'Ocurrió un problema al actualizar la información',
          showImage: true,
          reloadList: response.success
        };
        this.vcr.createEmbeddedView(this.modalResponse);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();

        this.response$ = {
          success: false,
          message: 'Tenemos problemas para actualizar la información',
          showImage: true
        };
        this.vcr.createEmbeddedView(this.modalResponse);
      },
      complete: (): void => {
        this.spinner.hide();
      }
    });
  }

  deleteRecipient(): void {
    this.vcr.clear();
    this.spinner.show();

    const payload: IDeleteRecipientRequest = {
      correo: this.selectedRecipient.correo
    };

    this.emailConfigurationService.deleteRecipient(payload).subscribe({
      next: (response: IDeleteRecipientResponse): void => {
        console.dir(response);

        this.response$ = {
          success: response.success,
          message: response.success ? 'El correo se eliminó correctamente' : 'Ocurrió un problema al eliminar el correo',
          showImage: true,
          reloadList: response.success
        };
        this.vcr.createEmbeddedView(this.modalResponse);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();

        this.response$ = {
          success: false,
          message: 'Tenemos problemas para eliminar el correo',
          showImage: true
        };
        this.vcr.createEmbeddedView(this.modalResponse);
      },
      complete: (): void => {
        this.spinner.hide();
      }
    });
  }

  showModalConfirmDeleteRecipient(selectedRecipient: IRecipient): void {
    this.selectedRecipient = selectedRecipient;
    this.vcr.createEmbeddedView(this.modalConfirmDeleteRecipient);
  }

  closeModal(): void {
    this.vcr.clear();

    if (this.response$?.reloadList) {
      this.getAllRecipients();
    }

    this.response$ = undefined;
  }
}
