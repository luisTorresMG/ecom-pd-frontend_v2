import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ClickOutsideDirective } from '../../directives/click-outside/click-outside.directive';
import {ProSelectComponent} from './pro-select.component';

@NgModule({
  declarations: [ProSelectComponent, ClickOutsideDirective],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [ProSelectComponent, ClickOutsideDirective]
})
export class ProSelectModule { }
