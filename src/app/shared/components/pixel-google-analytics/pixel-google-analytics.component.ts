import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  Input
} from '@angular/core';

@Component({
  selector: 'app-pixel-google-analytics',
  templateUrl: './pixel-google-analytics.component.html',
  styleUrls: ['./pixel-google-analytics.component.css']
})
export class PixelGoogleAnalyticsComponent
  implements OnInit, AfterViewInit, OnDestroy {

  @Input()
  elementID: string;

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    /* const oHead = document.getElementsByTagName('head')[0];
    const oScript = document.createElement('script');
    oScript.setAttribute('type', 'text/javascript');
    oScript.innerHTML =
      `\r\n\t try { gtag("js", new Date()); \r\n\tgtag("config", "UA-124786149-1"); } catch(e) {} \r\n`;
    oHead.appendChild(oScript); */
  }

  ngOnDestroy() { }
}
