import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '@root/layout/broker/services';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-vidaindividual-latest',
  templateUrl: './vidaindividual-latest.component.html',
  styleUrls: ['./vidaindividual-latest.component.scss'],
})
export class VidaindividualLatestComponent
  implements OnInit, AfterViewInit, OnDestroy {
  title: string;
  subscription: Subscription;

  @ViewChild('modalUnauthorized', { static: true, read: TemplateRef })
  modalUnauthorized: TemplateRef<ElementRef>;

  constructor(
    private readonly _AuthenticationService: AuthenticationService,
    private readonly _router: Router,
    private readonly _meta: Meta,
    private readonly _title: Title,
  ) {
    this.title = '<span>Vida Devolución Protecta<sup>+</sup></span>';
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this._title.setTitle(
      'Seguro Vida Devolución Protecta +| Protecta Security'
    );
    this._meta.addTags([
      {
        name: 'description',
        // tslint:disable-next-line:max-line-length
        description:
          'Seguro de Vida Devolución Protecta +, protege a tus seres queridos y vive seguro. Conoce todos los beneficios ¡Cotiza ahora!',
      },
    ]);
  }

  ngOnDestroy(): void {
    this._title.setTitle('PROTECTA :: Plataforma Digital');
    this.subscription.unsubscribe();
  }
}
