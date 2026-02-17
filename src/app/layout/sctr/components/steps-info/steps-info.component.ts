import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { GoogleTagManagerService } from '../../shared/services/google-tag-manager.service';

@Component({
  selector: 'app-steps-info-sctr',
  templateUrl: './steps-info.component.html',
  styleUrls: ['./steps-info.component.css'],
})
export class StepsInfoSctrComponent implements OnInit {
  @ViewChild('faqModal')
  content;

  modalRef: BsModalRef;

  currentPage = 1;
  hideComponent = false;
  hideRightComponent = false;

  faq = 0;

  faqText = [
    '¿Qué es un Seguro de SCTR?',
    '¿Cuáles son las coberturas del Seguro de SCTR?',
    '¿Este seguro tiene Exclusiones? ¿Cuáles son?',
    '¿Qué es un accidente laboral?',
    '¿Qué es una enfermedad ocupacional?',
    '¿El Coronavirus Covid-19 puede ser calificado como una enfermedad ocupacional?',
    '¿A quiénes se les considera como Asegurados Obligatorios?',
    '¿Qué actividades económicas se contemplan como de Riesgo?',
    '¿Qué necesito para adquirir un seguro SCTR?',
    '¿Qué conceptos se deben considerar para la declaración de los sueldos de la planilla de los trabajadores en el SCTR Pensión?',
    '¿Cuánto cuesta mi seguro de SCTR?',
    // tslint:disable-next-line:max-line-length
    '¿Es posible asegurar a empleados que no se encuentran en planilla de la empresa y/o a consultores extranjeros en el caso que realicen trabajos de riesgo o sean exigidos por entidades a las que se prestará servicios?',
    'Tengo RUC 10 ¿Puedo adquirir un SCTR?',
    'Soy independiente, solo tengo DNI o Carnet de Extranjería ¿Puedo contratar un SCTR?',
    'Ya tengo un SCTR pero quiero renovarlo ¿Qué necesito?',
    '¿Puedo incluir trabajadores a una póliza ya emitida, tiene costo adicional?',
    'Si cuento ya con un bróker o asesor de póliza ¿Puedo contratar un SCTR directo con Protecta Security?',
    '¿Cuánto tiempo tengo para reclamar los Beneficios?',
    '¿Desde qué fecha inicia el pago de la pensión de Sobrevivencia?',
    '¿Qué necesito si deseo solicitar la indemnización por invalidez total permanente?',
    '¿Cómo puedo descargar las facturas de mis clientes?',
    '¿Cómo puedo emitir los Estados de Cuenta de mis clientes?',
    '¿Cómo puedo cobrar mis comisiones por las pólizas SCTR?',
  ];

  constructor(
    private readonly router: Router,
    private readonly modalService: BsModalService,
    private readonly googleService: GoogleTagManagerService
  ) { }

  ngOnInit() {
    this.getCurrentPage(this.router.url.split('?')[0]);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.getCurrentPage(event.url);
      }
    });
  }

  hide(r = false) {
    if (r) {
      this.hideRightComponent = !this.hideRightComponent;
    } else {
      this.hideComponent = !this.hideComponent;
    }
  }

  openModal(faq: number) {
    this.faq = faq + 1;
    this.googleService.setFAQEvent(this.faqText[faq]);
    this.modalRef = this.modalService.show(this.content);
  }

  getCurrentPage(url) {
    switch (url) {
      case '/sctr/step-1':
        this.currentPage = 1;
        break;
      case '/sctr/step-2':
        this.currentPage = 2;
        break;
      case '/sctr/step-3':
        this.currentPage = 3;
        break;
      case '/sctr/step-4':
        this.currentPage = 4;
        break;
      case '/sctr/step-5':
        this.currentPage = 5;
        break;
      default:
        this.currentPage = 5;
        break;
    }
  }
}
