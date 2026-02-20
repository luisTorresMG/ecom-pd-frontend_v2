import {
  Component,
  OnInit
} from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-backoffice',
  templateUrl: './backoffice.component.html',
  styleUrls: ['./backoffice.component.css']
})
export class BackOfficeComponent implements OnInit {
  mostrarSidebar: boolean;

  constructor() { }

  ngOnInit() {
  }

}
