import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppConfig } from '@root/app.config';
declare var $: any;
@Component({
  selector: 'app-biometric',
  templateUrl: './biometric.component.html',
  styleUrls: ['./biometric.component.css']
})
export class BiometricComponent implements OnInit {
  form: FormGroup;
  state: any;

  @Output() estado: EventEmitter<boolean>;

  constructor(
    private readonly _FormBuilder: FormBuilder,
    private readonly _appConfig: AppConfig
  ) {
    this.form = this._FormBuilder.group({
      dni: [null],
      estado: [null, Validators.required]
    });
    this.estado = new EventEmitter();
  }
  ngOnInit(): void {
    this.form.get('estado').valueChanges.subscribe(val => {
      console.log('changeval: ' + val);
    });
    this.f.estado.setValue(0);
    this.changeState();
  }
  get f(): any {
    return this.form.controls;
  }
  changeState(): void {
    const val: any = (<HTMLInputElement>document.getElementById('estado'))?.value;
    if (Number(val) === 1) {
      this.emitState(true);
    } else {
      this.emitState(false);
      setTimeout(() => {
        this.changeState();
      }, 5000);
    }
  }
  emitState(e): void {
    this.estado.emit(e);
  }
}
