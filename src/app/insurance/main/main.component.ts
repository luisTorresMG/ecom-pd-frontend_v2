import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  Renderer2,
} from '@angular/core';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { NavigationStart, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit, OnDestroy, AfterViewInit {
  subscription: Subscription;
  private vwoLink?: HTMLLinkElement;
  private vwoScript?: HTMLScriptElement;

  constructor(
    private readonly ga: GoogleAnalyticsService,
    private readonly router: Router,
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly render: Renderer2
  ) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        const path = e.url.split('/')[3] || 'step-0';
        const url = path.charAt(0).toUpperCase() + path.slice(1);
        const step = url.split('-');
        const pageView = {
          path: e.url,
          title: `Accidentes Personales - ${step[0] || ''} ${step[1] || ''}`,
        };
        this.ga.pageView(pageView);
      }
    });

    const canonicalLink: HTMLLinkElement = this.render.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    canonicalLink.setAttribute(
      'href',
      'https://plataformadigital.protectasecurity.pe/ecommerce/accidentespersonales'
    );

    const head = document.querySelector('head');
    this.render.appendChild(head, canonicalLink);

    const script = this.render.createElement('script');
    script.type = 'application/ld+json'
    script.text = `{
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Seguro contra Accidentes Personales",
      "image": "https://plataformadigital.protectasecurity.pe/ecommerce/assets/accidentes-personales/resources/banner-ap.webp",
      "description": "Compra tu Segura de Accidentes Personales Online con Protecta Security. Descubre qué es, precio, coberturas. ¡Cotizalo en 3 minutos!",
      "brand": {
        "@type": "Brand",
        "name": "Protecta Secutiry"
      },
      "offers": {
        "@type": "Offer",
        "url": "https://plataformadigital.protectasecurity.pe/ecommerce/accidentespersonales",
        "priceCurrency": "PEN",
        "price": "",
        "priceValidUntil": "2024-07-31",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5",
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": "17"
      }
    }`

    const script2 = this.render.createElement('script');
    script2.type = 'application/ld+json'
    script2.text = `{
      "@context": "https://schema.org/",
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": "Protecta Security",
        "item": "https://www.protectasecurity.pe/"
      },{
        "@type": "ListItem",
        "position": 2,
        "name": "Seguros Personales",
        "item": "https://www.protectasecurity.pe/personas/seguros-personales/"
      },{
        "@type": "ListItem",
        "position": 3,
        "name": "Seguro contra accidentes",
        "item": "https://plataformadigital.protectasecurity.pe/ecommerce/accidentespersonales"
      }]
    }`

    const script3 = this.render.createElement('script');
    script3.type = 'application/ld+json'
    script3.text = `{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [{
        "@type": "Question",
        "name": "¿Qué es el Seguro contra accidentes personales?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El Seguro de Accidentes Personales es aquel que cubre la muerte accidental del asegurado a consecuencia de un accidente ocurrido durante la vigencia del seguro. Además, ofrece la posibilidad de contratar coberturas adicionales como gastos de curación por accidente, invalidez total y permanente por accidente, entre otras."
        }
      },{
        "@type": "Question",
        "name": "¿Qué se entiende por accidente?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Es toda lesión corporal que pueda ser determinada por los médicos de una manera cierta, sufrida por el Asegurado independientemente de su voluntad, por la acción repentina y violenta o con un agente externo."
        }
      },{
        "@type": "Question",
        "name": "¿Qué coberturas tiene el seguro de accidentes personales?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "1. Muerte Accidental
    2. Gastos de Sepelio por Muerte Accidental
    3. Gastos de Curación por Accidente
    4. Invalidez Total y Permanente por Accidente
    5. Otras coberturas adicionales"
        }
      },{
        "@type": "Question",
        "name": "¿Para quién está dirigido este tipo de Seguro?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "1. Personas Naturales: Ofrece respaldo económico a los beneficiarios del contratante ante algún accidente que pudiera ocurrirle
    2. Familias: Este seguro ofrece un respaldo ante un suceso súbito o inesperado que pueda afectar al contratante o a su familia (Cónyuge e Hijos).
    3. Estudiantes: Puede ser contratado por personas que quieran contratar una póliza exclusiva para asegurar a un menor de edad o joven en edad estudiantil. El contratante sí debe ser mayor de edad.
    4. Empresas: Este seguro proporciona a las Empresas protección para aquellas personas con quienes mantengan una relación contractual o comercial frente al riesgo de accidentarse."
        }
      },{
        "@type": "Question",
        "name": "¿Qué modalidades de contratación existen en el seguro de Accidentes Personales?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Considerando el tipo de Contratante de la Póliza, la cobertura se puede contratar mediante el Seguro Individual o un Seguro Grupal, el cual es adquirido por una persona natural o una persona jurídica, respectivamente. En el caso del seguro Familiar, la póliza podrá tener hasta 05 asegurados como parte de la familia."
        }
      },{
        "@type": "Question",
        "name": "¿Qué debo hacer en caso de un accidente (emergencia)?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Contáctate de inmediato en cualquier día y hora con nuestra Central de Atención al Cliente llamando al (01) 391 3000 en Lima o al 0801-1-1278 en Provincias, opción 1 – 2. Te brindaremos la asesoría que necesitas en ese momento."
        }
      },{
        "@type": "Question",
        "name": "¿Qué necesito hacer o presentar si necesito hospitalización?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "En caso de sufrir un accidente, solo deberá acercarse con su documento de identidad a la clínica u hospital e informar que tienen Seguro por Accidentes con Protecta Security, ellos validaran la cobertura."
        }
      }]
    }`

    this.render.appendChild(document.head, script);
    this.render.appendChild(document.head, script2);
    this.render.appendChild(document.head, script3);
  }

  ngAfterViewInit(): void {
    const apElement = document.getElementById('accidentespersonales-mask');
    apElement?.remove();

    this.title.setTitle('Seguro contra accidentes personales | Precio y Coberturas');
    this.meta.updateTag({
      name: 'description',
      content: 'Compra tu Seguro de Accidentes Personales Online con Protecta Security. Descubre qué es, precio, coberturas. ¡Cotizalo en 3 minutos!',
    });
    this.meta.addTags([
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:url',
        content: 'https://www.facebook.com/ProtectaSecurity',
      },
      {
        property: 'og:title',
        content: 'Seguros Accidentes Personales | Comprar Online + Precio',
      },
      {
        property: 'og:description',
        content:
          'Compra tu Seguro de Accidentes Personales Online con Protecta Security. Descubre qué es, precio, coberturas y más ¡Comprar ahora!',
      },
      {
        property: 'og:image',
        content: 'http://localhost:4200/assets/logos/logo-latest.png',
      },
      {
        property: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        property: 'twitter:url',
        content:
          'https://plataformadigital.protectasecurity.pe/ecommerce/accidentespersonales',
      },
      {
        property: 'twitter:title',
        content: 'Seguros Accidentes Personales | Comprar Online + Precio',
      },
      {
        property: 'twitter:description',
        content:
          'Compra tu Seguro de Accidentes Personales Online con Protecta Security. Descubre qué es, precio, coberturas y más ¡Comprar ahora!',
      },
      {
        property: 'twitter:image',
        content: 'http://localhost:4200/assets/logos/logo-latest.png',
      },
    ]);
    this.addVwoScript();
  }

  ngOnDestroy(): void {
    this.title.setTitle('PROTECTA :: Plataforma Digital');
    this.subscription.unsubscribe();
    this.removeVwoScript();
  }

  get showChatBot(): boolean {
    const paths: string[] = [
      '/ecommerce/accidentespersonales',
      '/accidentespersonales',
    ];
    return !paths.includes(location.pathname);
  }

  private addVwoScript(): void {
    if (!this.vwoLink) {
      this.vwoLink = this.render.createElement('link');
      this.vwoLink.rel = 'preconnect';
      this.vwoLink.href = 'https://dev.visualwebsiteoptimizer.com';
      this.render.appendChild(document.head, this.vwoLink);
    }

    if (!this.vwoScript) {
      this.vwoScript = this.render.createElement('script');
      this.vwoScript.type = 'text/javascript';
      this.vwoScript.id = 'vwoCode';
      this.vwoScript.text = `
        window._vwo_code || (function() {
          var account_id=917408,
          version=2.1,
          settings_tolerance=2000,
          hide_element='body',
          hide_element_style = 'opacity:0 !important;filter:alpha(opacity=0) !important;background:none !important;transition:none !important;',
          f=false,w=window,d=document,v=d.querySelector('#vwoCode'),cK='_vwo_'+account_id+'_settings',cc={};
          try{var c=JSON.parse(localStorage.getItem('_vwo_'+account_id+'_config'));cc=c&&typeof c==='object'?c:{}}catch(e){}
          var stT=cc.stT==='session'?w.sessionStorage:w.localStorage;
          code={nonce:v&&v.nonce,library_tolerance:function(){return typeof library_tolerance!=='undefined'?library_tolerance:undefined},settings_tolerance:function(){return cc.sT||settings_tolerance},hide_element_style:function(){return'{'+(cc.hES||hide_element_style)+'}'},hide_element:function(){if(performance.getEntriesByName('first-contentful-paint')[0]){return''}return typeof cc.hE==='string'?cc.hE:hide_element},getVersion:function(){return version},finish:function(e){if(!f){f=true;var t=d.getElementById('_vis_opt_path_hides');if(t)t.parentNode.removeChild(t);if(e)(new Image).src='https://dev.visualwebsiteoptimizer.com/ee.gif?a='+account_id+e}},finished:function(){return f},addScript:function(e){var t=d.createElement('script');t.type='text/javascript';if(e.src){t.src=e.src}else{t.text=e.text}v&&t.setAttribute('nonce',v.nonce);d.getElementsByTagName('head')[0].appendChild(t)},load:function(e,t){var n=this.getSettings(),i=d.createElement('script'),r=this;t=t||{};if(n){i.textContent=n;d.getElementsByTagName('head')[0].appendChild(i);if(!w.VWO||VWO.caE){stT.removeItem(cK);r.load(e)}}else{var o=new XMLHttpRequest;o.open('GET',e,true);o.withCredentials=!t.dSC;o.responseType=t.responseType||'text';o.onload=function(){if(t.onloadCb){return t.onloadCb(o,e)}if(o.status===200||o.status===304){_vwo_code.addScript({text:o.responseText})}else{_vwo_code.finish('&e=loading_failure:'+e)}};o.onerror=function(){if(t.onerrorCb){return t.onerrorCb(e)}_vwo_code.finish('&e=loading_failure:'+e)};o.send()}},getSettings:function(){try{var e=stT.getItem(cK);if(!e){return}e=JSON.parse(e);if(Date.now()>e.e){stT.removeItem(cK);return}return e.s}catch(e){return}},init:function(){if(d.URL.indexOf('__vwo_disable__')>-1)return;var e=this.settings_tolerance();w._vwo_settings_timer=setTimeout(function(){_vwo_code.finish();stT.removeItem(cK)},e);var t;if(this.hide_element()!=='body'){t=d.createElement('style');var n=this.hide_element(),i=n?n+this.hide_element_style():'',r=d.getElementsByTagName('head')[0];t.setAttribute('id','_vis_opt_path_hides');v&&t.setAttribute('nonce',v.nonce);t.setAttribute('type','text/css');if(t.styleSheet)t.styleSheet.cssText=i;else t.appendChild(d.createTextNode(i));r.appendChild(t)}else{t=d.getElementsByTagName('head')[0];var i=d.createElement('div');i.style.cssText='z-index: 2147483647 !important;position: fixed !important;left: 0 !important;top: 0 !important;width: 100% !important;height: 100% !important;background: white !important;display: block !important;';i.setAttribute('id','_vis_opt_path_hides');i.classList.add('_vis_hide_layer');t.parentNode.insertBefore(i,t.nextSibling)}var o=window._vis_opt_url||d.URL,s='https://dev.visualwebsiteoptimizer.com/j.php?a='+account_id+'&u='+encodeURIComponent(o)+'&vn='+version;if(w.location.search.indexOf('_vwo_xhr')!==-1){this.addScript({src:s})}else{this.load(s+'&x=true')}}};w._vwo_code=code;code.init();})();
      `;
      this.render.appendChild(document.head, this.vwoScript);
    }
  }

  private removeVwoScript(): void {
    if (this.vwoLink) {
      this.render.removeChild(document.head, this.vwoLink);
      this.vwoLink = undefined;
    }
    if (this.vwoScript) {
      this.render.removeChild(document.head, this.vwoScript);
      this.vwoScript = undefined;
    }
  }
}
