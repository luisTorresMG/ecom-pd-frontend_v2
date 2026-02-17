import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelWidgetComponent } from './panel-widget.component';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    PanelWidgetComponent,
  ],
  exports: [
    PanelWidgetComponent,
  ]
})
export class PanelWidgetModule {}