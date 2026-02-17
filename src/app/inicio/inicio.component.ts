import { Component, OnInit } from '@angular/core';
import { SessionStorageService } from '../shared/services/storage/storage-service';
import { Router } from '@angular/router';
import { AppConfig } from '../app.config';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css', './inicio.component.mobile.css']
})
export class InicioComponent implements OnInit {
  constructor(
    private sessionStorageService: SessionStorageService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private appConfig: AppConfig
  ) {
  }

  ngOnInit() {
    localStorage.setItem('showNewMenu', 'true');
  }

  trackClient() {
    // this.spinner.show();
    this.trackAnalitycs('Compra tu SOAT y participa de los sorteos');
    localStorage.setItem('showNewMenu', 'false');
    this.appConfig.pixelEvent(
      'virtualEvent',
      'SOAT Digital - Cliente - Paso 0',
      'Botón - Home',
      '(not available)'
    );
    this.router.navigate(['soat']);
  }

  trackBroker() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser && currentUser.forwardAccount) {
      this.router.navigate(['/extranet/welcome']);
      return;
    }

    this.trackAnalitycs('Soy un Corredor de Negocios');
    localStorage.setItem('showNewMenu', 'false');
    this.router.navigate(['extranet']);
  }

  trackAllye() {
    this.spinner.show();
    this.trackAnalitycs('Soy un Canal Aliado');
    localStorage.setItem('showNewMenu', 'false');
    this.router.navigate(['extranet']);
  }

  trackAnalitycs(description) {
    this.appConfig.pixelEvent(
      'virtualEvent',
      'SOAT Digital - Home',
      'Clic en botón',
      description
    );
  }
}
