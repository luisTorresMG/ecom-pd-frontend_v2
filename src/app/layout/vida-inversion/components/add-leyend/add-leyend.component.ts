import { Component, Input, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-leyend',
  templateUrl: './add-leyend.component.html',
  styleUrls: ['./add-leyend.component.scss']
})
export class AddLeyendComponent implements OnInit {


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
