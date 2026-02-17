import { Component, Input } from '@angular/core';
import { UtilService } from '../../../../../layout/broker/components/quote/acc-personales/core/services/util.service';



@Component({
  selector: 'panel-widget',
  templateUrl: './panel-widget.component.html',
  styleUrls: ['./panel-widget.component.css']
})
export class PanelWidgetComponent {
  
  @Input() title: string;
  @Input() classInner: string;
  
  widgetId: string = UtilService.getControlName();
  
}