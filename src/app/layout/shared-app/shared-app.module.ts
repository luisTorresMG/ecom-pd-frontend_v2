import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisaButtonDirective } from './directives/visa-button.directive';

@NgModule({
  declarations: [VisaButtonDirective],
  imports: [CommonModule],
  exports: [VisaButtonDirective]
})
export class SharedAppModule {}
