import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css', './footer.component.mobile.css']
})
export class FooterComponent implements OnInit {

  anio: number = new Date().getFullYear();
  version: string = environment.version;

  constructor() { }

  ngOnInit() {
  }

}
