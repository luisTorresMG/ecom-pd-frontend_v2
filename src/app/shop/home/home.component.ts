import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../app.config';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly _appConfig: AppConfig
  ) { }

  ngOnInit() {
    /*const is_reload = sessionStorage.getItem('is_reload');
    if (is_reload !== 'false') {
      location.reload();
    }
    sessionStorage.setItem('is_reload', 'false');*/
  }

  onProductClick(productType: string) {
    this._appConfig.pixelEvent(
      'virtualEvent',
      'Selección de Producto',
      productType,
      '(not available)'
    );
    sessionStorage.setItem('ecommerce', productType);
    this.router.navigate([`/${productType}`]);
  }
}
