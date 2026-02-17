import { animate, style, transition, trigger } from '@angular/animations';
// tslint:disable-next-line:max-line-length
import { Component, OnInit, OnChanges, ViewChild, ViewContainerRef, TemplateRef, ChangeDetectorRef, ChangeDetectionStrategy, AfterViewChecked, AfterViewInit, ElementRef, SimpleChanges } from '@angular/core';
@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({
          opacity: 0
        }),
        animate(250, style({
          opacity: 1
        }))
      ])
    ]),
    trigger('translate-right', [
      transition('void => *', [
        style({
          transform: 'translateX(100%)'
        }),
        animate(250, style({
          transform: 'translateX(0)'
        }))
      ])
    ]),
    trigger('translate-left', [
      transition('void => *', [
        style({
          transform: 'translateX(-100%)'
        }),
        animate(250, style({
          transform: 'translateX(0)'
        }))
      ])
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WelcomeComponent implements OnInit, OnChanges, AfterViewInit {

  imagesProducts: Array<{ path: string, desc: string }>;
  imageFocus: any;
  indexCarousel: number;

  @ViewChild('modalProducts', { static: true, read: TemplateRef }) _modalProducts: TemplateRef<any>;

  @ViewChild('vModalProducts') _vModalProducts: any;

  constructor(
    private readonly _vc: ViewContainerRef,
    private readonly _cd: ChangeDetectorRef
  ) {
    this.imagesProducts = [];
    this.indexCarousel = 0;
  }

  ngOnInit(): void {
    if (this.currentUser?.listProducts) {
      this.imagesProducts = this.currentUser?.listProducts?.map((val) => ({
        path: val?.imagen,
        desc: val?.descripcion
      }));
      this.imageFocus = this.imagesProducts[0];
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      document.getElementById('fcmp').focus();
    }
  }
  ngAfterViewInit(): void {
    this._cd.detectChanges();
    // *MODAL PRODUCTS
    if (!!this.imagesProducts?.length) {
      this.showModalProducts();
    }
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  get names(): string {
    return this.currentUser.firstName?.toLowerCase();
  }

  showModalProducts(): void {
    this.closeModal();
    this._vc.createEmbeddedView(this._modalProducts).markForCheck();
  }

  closeModal(): void {
    this._vc.clear();
  }

  nextImage(): void {
    const index = this.imagesProducts.findIndex(x => x.path === this.imageFocus.path);
    this.imageFocus = this.imagesProducts[index + 1];
    this.indexCarousel = index + 1;
  }
  previousImage(): void {
    const index = this.imagesProducts.findIndex(x => x.path === this.imageFocus.path);
    this.imageFocus = this.imagesProducts[index - 1];
    this.indexCarousel = index - 1;
  }
}
