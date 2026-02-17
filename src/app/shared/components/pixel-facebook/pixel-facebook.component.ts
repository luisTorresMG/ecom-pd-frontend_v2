import { Component, OnInit, Input, OnDestroy, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-pixel-facebook',
  templateUrl: './pixel-facebook.component.html',
  styleUrls: ['./pixel-facebook.component.css']
})
export class PixelFacebookComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input()
  pageView = 'PageView';

  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() { }

  ngAfterViewInit() {
    // const oHead = document.getElementsByTagName('head')[0];
    // const oScript = document.createElement('script');

    // oScript.setAttribute('type', 'text/javascript');
    // oScript.innerHTML =
    //   `
    //   !function(f,b,e,v,n,t,s)
    //   {
    //     // console.log('PIXEL FACEBOOK: ${this.pageView}', new Date().toLocaleString());
    //     if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    //   n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    //   if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    //   n.queue=[];t=b.createElement(e);t.async=!0;
    //   t.src=v;s=b.getElementsByTagName(e)[0];
    //   s.parentNode.insertBefore(t,s)}(window,document,'script',
    //   'https://connect.facebook.net/en_US/fbevents.js');
    //   fbq('init', '324119621477079');
    //   fbq('track', '${this.pageView}');
    //   `;

    // const oNoscript = document.createElement('noscript');
    // const oImage = document.createElement('img');

    // oImage.setAttribute('style', 'margin:0;padding:0;border:0;');

    // oImage.setAttribute('src', `https://www.facebook.com/tr?id=324119621477079&ev=${this.pageView}&noscript=1`);
    // oImage.setAttribute('height', '1');
    // oImage.setAttribute('width', '1');
    // oImage.setAttribute('alt', '');

    // oNoscript.appendChild(oImage);
    // oHead.appendChild(oScript);
    // oHead.appendChild(oNoscript);
  }

}
