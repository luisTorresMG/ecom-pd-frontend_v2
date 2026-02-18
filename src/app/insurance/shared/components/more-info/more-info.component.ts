import { Component, EventEmitter, Input, OnInit, OnDestroy, Output, ViewChild, ViewContainerRef, TemplateRef } from '@angular/core';
import { IMoreInfo } from '../../interfaces/more-info.interface';
import { Router } from '@angular/router';
@Component({
  selector: 'app-more-info',
  templateUrl: './more-info.component.html',
  styleUrls: ['./more-info.component.scss']
})
export class MoreInfoComponent implements OnInit, OnDestroy {

  @Input() info: IMoreInfo;
  @Output() close: EventEmitter<boolean>;

  @ViewChild('services', { static: true, read: TemplateRef }) _services: TemplateRef<any>;

  constructor(
    private readonly _router: Router,
    private readonly _vc: ViewContainerRef
  ) {
    this.close = new EventEmitter();
    const html = document.getElementById('html-document');
    html.style.overflow = 'hidden';
  }

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    const html = document.getElementById('html-document');
    html.style.overflow = 'auto';
  }

  showServices(): void {
    this._vc.createEmbeddedView(this._services);
  }

  closePage(): void {
    const html = document.getElementById('html-document');
    html.style.overflow = 'auto';
    this.close.emit(true);
  }
  goToPage(url: string): void {
    console.log(url);
    this._router.navigate([`${url}/step-1`]);
  }

}
