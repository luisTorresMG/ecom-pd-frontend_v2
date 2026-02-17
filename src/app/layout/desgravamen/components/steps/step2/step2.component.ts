import { Component, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

// *SERVICES
import { DesgravamenService } from '../../../shared/services/desgravamen.service';

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.scss']
})
export class Step2Component implements OnInit {

  form: FormGroup;

  @ViewChild('modalInsuredCapital', { static: true, read: TemplateRef }) _modalInsuredCapital: TemplateRef<any>;

  constructor(
    private readonly _builder: FormBuilder,
    private readonly _viewContainerRef: ViewContainerRef,
    private readonly _router: Router,
    private readonly _desgravamenService: DesgravamenService,
    private readonly _spinner: NgxSpinnerService
  ) {
    this.form = this._builder.group({
      entity: [null, Validators.required],
      credit: [null, Validators.required],
      creditType: [null, Validators.required],
      currency: [null, Validators.required],
      capital: [null, Validators.required],
      pendingFees: [null, Validators.required],
      frecuencyPayment: [null, Validators.required],
      initValidity: [{
        value: null,
        disabled: true
      }, Validators.required],
      endValidity: [{
        value: null,
        disabled: true
      }, Validators.required]
    });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.form.patchValue(this._desgravamenService.storage);
    this.form.valueChanges.subscribe(() => {
      this._desgravamenService.storage = this.form.getRawValue();
    });
  }
  get f(): any {
    return this.form.controls;
  }
  submit(): void {
    /* if (this.form.valid) {
      this._spinner.show();
      this._desgravamenService.storage = this.form.getRawValue();
      setTimeout(() => {
        this._spinner.hide();
        this._desgravamenService.step = 3;
        this._router.navigate(['/desgravamen/step3']);
      }, 1500);
    } */
    // FIXME: VALIDAR EL FORMULARIO
    this._spinner.show();
    this._desgravamenService.storage = this.form.getRawValue();
    setTimeout(() => {
      this._spinner.hide();
      this._desgravamenService.step = 3;
      this._router.navigate(['/desgravamen/step3']);
    }, 1500);
  }
  backStep(): void {
    this._desgravamenService.step = 1;
    this._router.navigate(['/desgravamen/step1']);
  }
  // *MODALS
  showModalInsuredCapital(): void {
    this._viewContainerRef.createEmbeddedView(this._modalInsuredCapital);
  }
  closeModal(): void {
    this._viewContainerRef.clear();
  }
}
