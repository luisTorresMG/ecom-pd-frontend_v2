import { Component, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { GoogleTagManagerService } from '../../shared/services/google-tag-manager.service';

@Component({
  selector: 'app-sctr',
  templateUrl: './sctr.component.html',
  styleUrls: ['./sctr.component.css'],
})
export class SctrComponent implements OnInit, AfterViewInit {
  hide = false;

  constructor(
    private readonly router: Router,
    private readonly googleService: GoogleTagManagerService,
    private readonly renderer: Renderer2
  ) {
  }

  ngOnInit() {
    const script = this.renderer.createElement('script');

    script.text = `
    (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({
          "gtm.start": new Date().getTime(),
          event: "gtm.js",
        });
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != "dataLayer" ? "&l=" + l : "";
        j.defer = true;
        j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, "script", "dataLayer", "GTM-MJK5TD5");
    `;

    const iframe = this.renderer.createElement('iframe');

    iframe.src = 'https://www.googletagmanager.com/ns.html?id=GTM-MJK5TD5';
    iframe.hidden = true;

    this.renderer.appendChild(document.head, script);
    this.renderer.appendChild(document.body, iframe);

    // sessionStorage.setItem('ecommerce', 'sctr');
    const currentPage = window.location.toString();
    this.getCurrentUrl(currentPage);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.getCurrentUrl(event.url);
      }
    });
  }

  ngAfterViewInit(): void {
    this.googleService.setPageChange();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.googleService.setPageChange();
      }
    });
  }

  getCurrentUrl(url: string) {
    this.hide = url.includes('/sctr/payment/pago-efectivo') || url.includes('/sctr/payment/visa/');
  }

  onActivate() {
    window.scroll(0, 0);
  }
}
