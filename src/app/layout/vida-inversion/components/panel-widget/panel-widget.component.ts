import { Component, Input } from '@angular/core';
import { UtilService } from '@root/layout/broker/components/quote/acc-personales/core/services/util.service';

@Component({
  selector: 'panel-widget',
  templateUrl: './panel-widget.component.html',
  styleUrls: ['./panel-widget.component.css']
})
export class PanelWidgetComponent {

  constructor() { }

  @Input() text_title: string;
  @Input() classInner: string;

  widgetId: string = UtilService.getControlName();
  
}
