import { environment } from './../../../../environments/environment';
import { Component, OnInit, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { AppConfig } from '../../../app.config';

@Component({
  selector: 'app-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.css']
})
export class FrameComponent implements OnInit, AfterViewInit, OnDestroy {
  url = environment.pagoefectivoservice;
  @Input() token: string;
  @Input() alto: string;
  @Input() ancho: string;

  constructor() { }

  ngAfterViewInit() {
    this.crearIframe();
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  private crearIframe() {
    const div = document.body.getElementsByClassName('frame-result');
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', `${this.url}?token=${this.token}`);
    iframe.setAttribute('width', `${this.ancho}`);
    iframe.setAttribute('height', `${this.alto}`);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('border', '0');
    div[0].appendChild(iframe);
  }
}
