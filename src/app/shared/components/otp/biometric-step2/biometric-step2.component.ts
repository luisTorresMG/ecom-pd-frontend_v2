import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'protecta-biometric-step2',
  templateUrl: './biometric-step2.component.html',
  styleUrls: ['./biometric-step2.component.sass'],
})
export class BiometricStep2Component implements OnInit {
  form: FormGroup;
  state: any;

  @Output() estado: EventEmitter<boolean>;

  constructor(private readonly builder: FormBuilder) {
    this.form = this.builder.group({
      dni: [null],
      estado: [null, Validators.required],
    });
    this.estado = new EventEmitter();
  }
  ngOnInit(): void {
    this.form.get('estado').valueChanges.subscribe((val) => {
      console.log('changeval: ' + val);
    });
    this.formControl.estado.setValue(0);
    this.changeState();
  }

  get formControl(): any {
    return this.form.controls;
  }

  changeState(): void {
    const val: any = (<HTMLInputElement>document.getElementById('estado'))
      ?.value;
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
