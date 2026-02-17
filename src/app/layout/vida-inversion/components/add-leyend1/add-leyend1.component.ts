import { Component, Input, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-leyend1',
  templateUrl: './add-leyend1.component.html',
  styleUrls: ['./add-leyend1.component.scss']
})
export class AddLeyend1Component implements OnInit {


  @Input() public reference: any;

  constructor() { }

  ngOnInit(): void {
  
  }
  closeModals(){

    const customswal = Swal.mixin({
      confirmButtonColor: "553d81",
      focusConfirm: false,
    })
    this.reference.close();
  }

}
