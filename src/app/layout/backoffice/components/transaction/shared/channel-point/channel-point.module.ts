import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChannelPointComponent } from './channel-point.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
@NgModule({
  declarations: [ChannelPointComponent],
  imports: [
    CommonModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [ChannelPointComponent]
})
export class ChannelPointModule { }
