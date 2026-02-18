import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css'],
})
export class QuestionsComponent implements OnInit {
  @Input() showButton: boolean;

  preguntasFrecuentes: any[];
  preguntaSelected: any;

  @ViewChild('modalQuestion', { static: true, read: ModalDirective })
  modalQuestion: ModalDirective;

  private readonly categoryGoogleAnalytics: string =
    'Ecommerce AP - Cliente - Paso';

  nstep: number;

  constructor(
    private readonly _router: Router,
    private readonly _ga: GoogleAnalyticsService
  ) {
    this.showButton = true;
    this.preguntasFrecuentes = [
      {
        pregunta: 'Definición',
        data: {
          respuesta: [
            // tslint:disable-next-line:max-line-length
            'Este seguro de accidente personales proporciona al Asegurado o a los Beneficiarios una indemnización por los sucesos originados directamente a causa de un accidente.',
          ],
        },
      },
      {
        pregunta: '¿Qué se entiende por accidente?',
        data: {
          respuesta: [
            // tslint:disable-next-line:max-line-length
            'Es toda lesión corporal que pueda ser determinada por los médicos de una manera cierta, sufrida por el Asegurado independientemente de su voluntad, por la acción repentina y violenta o con un agente externo.',
          ],
        },
      },
      {
        pregunta: '¿Cuáles son las coberturas más comunes en este seguro?',
        data: {
          list: [
            {
              respuesta: 'Muerte Accidental',
            },
            {
              respuesta: 'Gastos de Sepelio por Muerte Accidental',
            },
            {
              respuesta: 'Gastos de Curación por Accidente',
            },
            {
              respuesta: 'Invalidez Total y Permanente por Accidente',
            },
          ],
        },
      },
      {
        pregunta: '¿Para quiénes está dirigido este tipo de Seguro?',
        data: {
          list: [
            {
              // tslint:disable-next-line:max-line-length
              respuesta:
                'Familias: Este seguro lo pueden adquirir los padres que deseen contar con un respaldo ante un suceso súbito o inesperado que pueda afectar a él mismo o a su familia (Cónyuge e Hijos).',
            },
            {
              // tslint:disable-next-line:max-line-length
              respuesta:
                'Estudiantes: Puede ser contratado por padres o apoderados de colegios, institutos y universidades brindando una serie de coberturas adicionales para proteger al alumno y pueda continuar sus estudios sin ningún tipo de perjuicios, como es el caso: gastos de curación para el alumno, fallecimiento del padre o tutor responsable del pago de la pensión estudiantil, entre otros.',
            },
            {
              // tslint:disable-next-line:max-line-length
              respuesta:
                'Empresas: Este seguro proporciona a las Empresas protección para aquellas personas con quienes mantengan una relación contractual o comercial frente al riesgo de accidentarse.',
            },
            {
              // tslint:disable-next-line:max-line-length
              respuesta:
                'Viajeros: Brinda cobertura frente a las incidencias que pueda sufrir el Asegurado a lo largo de un viaje, desde la compra del pasaje hasta la pérdida de equipaje y muchas más coberturas, ya sea que como parte de sus labores o algún motivo determinado tenga que salir de su lugar de residencia.',
            },
          ],
        },
      },
      {
        pregunta:
          '¿Qué modalidades de contratación existen en el seguro de Accidentes Personales?',
        data: {
          respuesta: [
            // tslint:disable-next-line:max-line-length
            'Considerando el tipo de Contratante de la Póliza, la cobertura se puede contratar mediante el Seguro Individual o un Seguro Grupal, el cual es adquirido por una persona natural y una persona jurídica, respectivamente.',
          ],
        },
      },
      {
        pregunta: '¿Quiénes podrán ser beneficiarios de la Póliza?',
        data: {
          respuesta: [
            // tslint:disable-next-line:max-line-length
            'Para la cobertura de Muerte Accidental, se considerará como Beneficiarios a los designados por el Asegurado en la Póliza o en caso de no existir tal designación, se entenderán por Beneficiarios a los Herederos Legales del Asegurado, de acuerdo a lo establecido en el artículo 816° del Código Civil. Para el resto de los beneficios, el asegurado.',
            // tslint:disable-next-line:max-line-length
            'Asimismo, puede establecerse como beneficiarios a personas físicas o jurídicas que tuvieran que asumir cualquier responsabilidad con motivo de accidentes sufridos por el asegurado, como el caso de las Instituciones Educativas.',
            // tslint:disable-next-line:max-line-length
            'Se puede contratar otras coberturas adicionales, las cuales tienen sus propios beneficiarios. Por ejemplo, para la cobertura de gastos de curación por accidente el beneficiario es el mismo asegurado.',
          ],
        },
      },
      {
        pregunta: '¿Cuáles son sus exclusiones?',
        data: {
          respuesta: [
            // tslint:disable-next-line:max-line-length
            'Para la cobertura principal que es Muerte Accidental, no se brinda una indemnización en caso, se deba directa o indirectamente, total o parcialmente a:',
          ],
          letterList: [
            {
              respuesta:
                'Suicidio consciente o inconsciente, estando o no el Asegurado en su sano juicio.',
            },
            {
              // tslint:disable-next-line:max-line-length
              respuesta:
                'Guerra o guerra civil, invasión, actos de enemigos extranjeros, hostilidades u operaciones bélicas, declarada o no, rebelión, revolución, insurrección, sublevación, sedición, motín, terrorismo, conmoción civil.',
            },
            {
              // tslint:disable-next-line:max-line-length
              respuesta:
                'Por acto delictivo contra el Asegurado cometido en calidad de autor o cómplice por el Beneficiario o heredero, dejando a salvo el derecho de recibir la Suma Asegurada de los restantes Beneficiarios o herederos, si los hubiere, así como su derecho de acrecer.',
            },
            {
              respuesta:
                'Detonación nuclear, reacción nuclear, radiación nuclear o contaminación radiactiva.',
            },
            {
              // tslint:disable-next-line:max-line-length
              respuesta:
                'Viajes o vuelo en vehículo aéreo de cualquier clase, excepto como pasajero en uno operado por una empresa de transporte aéreo comercial, sobre una ruta establecida oficialmente para el transporte de pasajeros y sujeta a itinerario.',
            },
            {
              // tslint:disable-next-line:max-line-length
              respuesta:
                'Participación del Asegurado como conductor o acompañante en carreras de automóviles, motocicletas, lanchas a motor o avionetas, incluyendo carreras de entrenamiento.',
            },
            {
              // tslint:disable-next-line:max-line-length
              respuesta:
                'Realización de las siguientes actividades riesgosas y/o deportes riesgosos: escalamiento, alpinismo, andinismo, montañismo, paracaidismo, parapente, ala delta, aeronaves ultraligeras, salto desde puentes o puntos elevados al vacío, buceo profesional o de recreo, inmersión o caza submarina, canotaje y práctica de surf.',
            },
            {
              respuesta: 'Consecuencias no accidentales de embarazos o partos.',
            },
            {
              respuesta:
                'Consecuencias de enfermedades de cualquier naturaleza física, mental o nerviosa.',
            },
            {
              // tslint:disable-next-line:max-line-length
              respuesta:
                'Cualquier accidente que se produzca bajo la influencia de alcohol (en grado igual o superior a 0.5 gr./lt. de alcohol en la sangre), salvo que el Asegurado haya sido sujeto pasivo al momento del Siniestro; y/o bajo la influencia de drogas, estupefacientes o en estado de sonambulismo.',
            },
            {
              respuesta:
                'Participación activa en cualquier acto violatorio de la ley, sea como autor, coautor o cómplice.',
            },
          ],
          respuestaFoot: [
            // tslint:disable-next-line:max-line-length
            'En caso de contratar coberturas adicionales, considerar que presentan sus propias exclusiones, las cuales se encuentran definidas en la misma Cláusula Adicional.',
          ],
        },
      },
      {
        pregunta: '¿Cómo reporto un accidente (emergencia)?',
        data: {
          respuesta: [
            // tslint:disable-next-line:max-line-length
            'El contratante, Asegurado o Beneficiario podrá contactarse a los siguientes canales para recibir orientación sobre el Procedimiento de Solicitud de Cobertura en caso de un accidente:',
          ],
          pointList: [
            {
              respuesta:
                'Atención al Cliente: Lima 391-3000 I Provincias 0-801-1-1278',
            },
            {
              respuesta: 'Email: clientes@protectasecurity.pe',
            },
            {
              respuesta: 'Página Web: www.protectasecurity.pe',
            },
            {
              respuesta:
                'Atención Presencial: Av. Domingo Orué 165, 8vo. Piso, Surquillo, Lima – Perú',
            },
          ],
        },
      },
      {
        pregunta:
          '¿Cuáles son los documentos que tengo que presentar para cada caso de siniestro?',
        data: {
          numberList: [
            {
              respuesta:
                'Para el caso de las coberturas por Muerte Accidental y Gastos de Sepelio por Accidente:',
              sub: [
                {
                  letterList: [
                    {
                      respuesta:
                        'Acta y Certificado de defunción del Asegurado.',
                    },
                    {
                      respuesta:
                        'Documento de Identidad o Partida de Nacimiento de los Beneficiarios.',
                    },
                    {
                      respuesta:
                        'Atestado o Parte Policial, según corresponda.',
                    },
                    {
                      respuesta:
                        'Protocolo de Necropsia del Asegurado, según corresponda.',
                    },
                    {
                      respuesta:
                        'Resultado del dosaje etílico y toxicológico del Asegurado, según corresponda.',
                    },
                  ],
                },
              ],
            },
            {
              respuesta:
                'Para el caso de las coberturas por Muerte Accidental y Gastos de Sepelio por Accidente:',
              sub: [
                {
                  title: 'Atenciones por Reembolso:',
                  letterList: [
                    {
                      respuesta:
                        'Acta y Certificado de defunción del Asegurado.',
                    },
                    {
                      respuesta:
                        'Documento de Identidad o Partida de Nacimiento de los Beneficiarios.',
                    },
                    {
                      respuesta:
                        'Atestado o Parte Policial, según corresponda.',
                    },
                    {
                      respuesta:
                        'Protocolo de Necropsia del Asegurado, según corresponda.',
                    },
                    {
                      respuesta:
                        'Resultado del dosaje etílico y toxicológico del Asegurado, según corresponda.',
                    },
                  ],
                },
                {
                  title: 'Atenciones en Centros Médicos Afiliados:',
                  letterList: [
                    {
                      respuesta:
                        'Copia del Documento de Identidad del Asegurado o carné de estudios.',
                    },
                    {
                      // tslint:disable-next-line:max-line-length
                      respuesta:
                        'Orden de Atención emitida al Asegurado por la persona encargada del Tópico, Enfermería o Departamento Médico del Contratante.',
                    },
                  ],
                },
              ],
            },
            {
              respuesta:
                'Para el caso de la cobertura por Invalidez Total y Permanente por Accidente:',
              sub: [
                {
                  letterList: [
                    {
                      respuesta:
                        'Copia del Documento de Identidad del Asegurado.',
                    },
                    {
                      respuesta:
                        'Informe médico indicando el diagnóstico y pronóstico.',
                    },
                    {
                      respuesta:
                        'Atestado o Parte Policial completo según corresponda.',
                    },
                    {
                      respuesta:
                        'Resultado de dosaje etílico del Asegurado, según corresponda.',
                    },
                    {
                      respuesta:
                        'Resultado del examen toxicológico del Asegurado, según corresponda.',
                    },
                  ],
                },
              ],
            },
          ],
          respuestaFoot: [
            // tslint:disable-next-line:max-line-length
            'En caso de contratar coberturas adicionales, considerar que los requisitos documentarios para el aviso de siniestro se encuentran definidas en la misma Cláusula Adicional.',
          ],
        },
      },
      {
        pregunta:
          '¿En cuánto tiempo recibiré una respuesta por parte de Protecta Security?',
        data: {
          respuesta: [
            // tslint:disable-next-line:max-line-length
            'Una vez que el Contratante, Asegurado o Beneficiario(s) hayan cumplido con presentar todos los documentos referidos al Siniestro, la Compañía, cuenta con treinta (30) días calendario para la evaluación del Siniestro y proceder con la aprobación o rechazo del Siniestro.',
            // tslint:disable-next-line:max-line-length
            'En caso de que la Compañía requiera aclaraciones o precisiones adicionales respecto de la documentación e información presentada por el Contratante o Beneficiario(s), deberá solicitarlas dentro de los primeros veinte (20) días calendario como plazo límite otorgado para la evaluación del Siniestro; lo que suspenderá el plazo hasta que se presente la documentación e información correspondiente.',
            // tslint:disable-next-line:max-line-length
            'En caso de que la Compañía no se pronunciase dentro del plazo señalado de 30 días, se entenderá que el Siniestro ha quedado consentido, salvo que ésta solicite una prórroga, de conformidad con lo dispuesto en las normas legales vigentes. Una vez consentido el Siniestro, la Compañía deberá proceder a pagar la indemnización correspondiente dentro de los treinta (30) días siguientes de producido el consentimiento.',
          ],
        },
      },
    ];
    this.nstep = +location.pathname.slice(
      location.pathname.indexOf('-') + 1,
      location.pathname.indexOf('-') + 2
    );
  }

  ngOnInit(): void {}

  openModalRespuestas(data): void {
    this.preguntaSelected = data;
    this.modalQuestion.show();
  }
  hideModal(): void {
    this.preguntaSelected = null;
    this.modalQuestion.hide();
  }
  goToCategories(): void {
    const idSesion = sessionStorage.getItem('0FF2C61A');
    sessionStorage.clear();
    if (!!idSesion) {
      sessionStorage.setItem('0FF2C61A', idSesion);
    }
    this._ga.emitGenericEventAP(`Clic en 'Ir a categorías'`);
    this._router.navigate(['/accidentespersonales']);
  }
  get hideCategories(): boolean {
    return window.location.pathname.indexOf('step-3/compare-plan') !== -1;
  }
}
