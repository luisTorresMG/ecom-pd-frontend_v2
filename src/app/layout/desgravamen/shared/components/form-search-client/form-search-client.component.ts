import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { AccPersonalesConstants } from '../../../../../layout/broker/components/quote/acc-personales/core/constants/acc-personales.constants';
import { ClientInformationService } from '../../../../../layout/broker/services/shared/client-information.service';


@Component({
  selector: 'form-search-client',
  templateUrl: './form-search-client.component.html',
  styleUrls: ['./form-search-client.component.css']
})
export class FormSearchClientComponent implements OnInit {
  
  @Input() label: string;
  @Input() disabled: boolean;
  
  @Input() client: any;
  @Output() clientChange: EventEmitter<any> = new EventEmitter();

  @Input() clear: boolean;
  @Output() clearChange: EventEmitter<any> = new EventEmitter();
      
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  CONSTANTS: any = AccPersonalesConstants;
  
  constructor(
    public clientInformationService: ClientInformationService) {}
    
  ngOnInit() {
    this.client = this.client || {};
    this.clientChange.emit(this.client);
  }
  clearInfo(){
    console.log('hola')
    //this.clear = true;
    this.client.numDocumento = '';
  }

}