import { Component, Input } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'pro-screen-splash',
  templateUrl: './screen-splash.component.html',
  styleUrls: ['./screen-splash.component.sass'],
})
export class ScreenSplashComponent {
  @Input() message: string;
}
