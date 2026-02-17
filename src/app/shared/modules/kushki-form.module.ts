import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { KushkiFormComponent } from '../components/kushki-form/kushki-form.component';

@NgModule({
  declarations: [KushkiFormComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [KushkiFormComponent],
})
export class KushkiFormModule {}
