import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import * as moment from 'moment';
import { Vidaley } from '../../shared/models/vidaley';
import { VidaleyService } from '../../shared/services/vidaley.service';
import { FormBuilder, Validators } from '@angular/forms';
import { GoogleTagManagerService } from '../../shared/services/google-tag-manager.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css'],
})
export class SummaryComponent implements OnInit {
  @ViewChild('btnfileInput', { static: true }) btnfileInput: ElementRef;

  @Input()
  summary = false;

  @Input()
  user: Vidaley;

  @Input()
  step = 4;

  @Output()
  formSubmitted = new EventEmitter<{
    file?: File;
    insuranceType?: number;
    form?: any;
  }>();

  @Output()
  moreInfo = new EventEmitter<void>();

  loading = false;
  insuranceType = 0;

  dates = {
    startDate: null,
    endDate: null,
  };

  file: File;
  fileName = '';

  validateForm = this.fb.group({
    file: [null, [Validators.required]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly googleService: GoogleTagManagerService
  ) { }

  ngOnInit() {
    this.dates.startDate = moment(this.user.startValidity).format('DD/MM/YYYY');
    this.dates.endDate = moment(this.user.endValidity).format('DD/MM/YYYY');
    this.user.totalWorkers = Number(this.user.totalWorkers);
  }

  get vForm() {
    return this.validateForm.controls;
  }

  setAction() {
    this.googleService.setUploadAction('Descargar');
  }

  onFileUpload(payload: FileList) {
    if (payload) {
      this.file = payload.item(0);
      this.fileName = this.file.name;
      this.googleService.setUploadAction('Adjuntar');
    }
  }

  validate() {
    this.validateF();
    this.googleService.setValidationIntent();
    if (this.validateForm.valid) {
      this.formSubmitted.emit({
        file: this.file,
        insuranceType: this.insuranceType,
      });

      this.file = null;
      this.fileName = '';
      this.validateForm.reset();
    }
  }

  showError(controlName: string): boolean {
    return (
      this.vForm[controlName].invalid &&
      (this.vForm[controlName].dirty || this.vForm[controlName].touched)
    );
  }

  validateF() {
    this.validateForm.markAllAsTouched();
  }

  showMoreInfo() {
    this.googleService.setSummaryAction('Cambio en la cotización');
    this.moreInfo.next();
  }

  insuranceChange(event) {
    this.insuranceType = event;
  }

  onEmployeeSubmit(event) {
    this.formSubmitted.emit({ form: event, insuranceType: 2 });
  }
}
