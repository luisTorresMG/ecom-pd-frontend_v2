import { Component, OnInit, Input, ɵConsole } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PolicyService } from '../../../services/policy/policy.service';
import { PolicyDocumentsComponent } from '../policy-documents/policy-documents.component';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import Swal from 'sweetalert2';
//Compartido
import { AccessFilter } from './../../access-filter';
import { AnulMovComponent } from '../../../modal/anul-mov/anul-mov.component';
import { CommonMethods } from '../../common-methods';
import { ParameterSettingsService } from '../../../services/maintenance/parameter-settings.service';

@Component({
  standalone: false,
  selector: 'app-policy-movement-details',
  templateUrl: './policy-movement-details.component.html',
  styleUrls: ['./policy-movement-details.component.css']
})
export class PolicyMovementDetailsComponent implements OnInit {
  @Input() public reference: any;
  @Input() public itemTransaccionList: any;
  @Input() public cotizacionID: any;

  inputsPolicy: any = [];
  policyMovementList: any = [];
  flagAnular: boolean = false;

  listToShow: any[] = [];
  currentPage = 1; //página actual
  rotate = true; //
  maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; //total de items encontrados

  adjuntosList: any = [];
  generadosList: any = [];
  canCancelMovements: boolean;
  template: any = {};
  //epsItem = JSON.parse(sessionStorage.getItem("eps"))
  epsItem = JSON.parse(localStorage.getItem('eps'));
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];

  nErrorAnul: number;
  sMessageAnul: string;
  codProfileID: any;
  nbranch: any;
  opcionVer: any;
  isLoading: Boolean = false; // true:mostrar | false:ocultar pantalla de carga
  perfil: any;
  pageToSend: number = 1;

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private policyemit: PolicyemitService,
    private parameterSettingsService: ParameterSettingsService
  ) {}

  async ngOnInit() {
    // Configuracion del Template
    this.template = await CommonMethods.configuracionTemplate(this.codProducto, this.epsItem.NCODE)

    this.itemTransaccionList.forEach((item) => {
      if (item.NRO_COTIZACION == this.cotizacionID) {
        this.inputsPolicy.P_PRODUCTO = item.NOMBRE_PRODUCT;
        this.inputsPolicy.P_POLIZA = item.POLIZA;
        this.inputsPolicy.P_CONTRATANTE = item.NOMBRE_CONTRATANTE;
        this.inputsPolicy.P_SEDE = item.SEDE;
      }
    });

    this.getPolicyMovement(this.cotizacionID);

    //Ini RQ2025-4
    this.renderSede(this.inputsPolicy.P_SEDE);
    //Fin RQ2025-4

    this.codProfileID = JSON.parse(localStorage.getItem('currentUser'))['profileId'];
    this.perfil = await this.getProfileProduct();
  }
  getPolicyMovement(cotizacionID: any) {
    this.isLoading = true;
    let data: any = {};
    data.P_NID_COTIZACION = cotizacionID;
    data.P_NLIMITPERPAGE = this.itemsPerPage;
    data.P_NPAGENUM = this.pageToSend;
    this.policyemit.getPolicyMovementsTransList(data).subscribe(
      (res) => {
        this.isLoading = false;

        this.policyMovementList = res.C_TABLE;
        this.policyMovementList.forEach((item: any) => {
            item.flagVista = 0;
        });

        let num = 0;
        this.nbranch = (res.C_TABLE && res.C_TABLE.length > 0) ? res.C_TABLE[0].NBRANCH : 0;
        this.opcionVer = (res.C_TABLE && res.C_TABLE.length > 0) ? (res.C_TABLE[0].NCOT_MIXTA == 1 ? 1 : (res.C_TABLE[0].NPRODUCT == 2 ? 1 : 0)) : 0;

        this.totalItems = res.P_NTOTALROWS || this.policyMovementList.length;
        this.listToShow = this.policyMovementList;

        this.canCancelMovements = AccessFilter.hasPermission('20');

        this.policyMovementList.forEach((item) => {
          if (item.COD_TRANSAC == 7) {
            this.flagAnular = true;
          }

          if (item.MOV_ANULADO == 0) {
            num++;
          }

            if (!!item.SOBSERVACIONES && item.SOBSERVACIONES.includes('/')) {
                let array = item.SOBSERVACIONES.split('/');
                if (array.length > 1) {
                    item.FLAG_OBSERVACIONES = 1;
                } else {
                    item.FLAG_OBSERVACIONES = 0;
                }
            }else{
                item.FLAG_OBSERVACIONES = 0;
            }
        });

        if (num == 0) {
          this.flagAnular = true;
        }
      },
      (err) => {
        this.isLoading = false;
      }
    );
  }

    pageChanged(currentPage: number) {
    this.pageToSend = currentPage;
    this.currentPage = currentPage;
    this.getPolicyMovement(this.cotizacionID); // ✅ traer nueva página
  }


  facturarMov(item: any, typeMovement: any) {
    let facturacion: any = {};
    facturacion.P_NID_COTIZACION = this.cotizacionID; // nro cotizacion
    facturacion.P_NMOVEMENT = item.NRO; // nro cotizacion

    this.policyemit.valBilling(facturacion).subscribe(
      (res) => {
        if (res.P_NCODE == 0) {
          this.transMov(item, typeMovement, res.P_SMESSAGE);
        } else {
          Swal.fire({
            title: 'Información',
            text: res.P_SMESSAGE,
            icon: 'info',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );

  }

  transMov(item: any, typeMovement: any, message?: any) {
    let question = '';
    let btnMov = '';
    let response = '';
    question = message;
    btnMov = 'Facturar';
    response = 'Se ha facturado correctamente el movimiento';

    let myFormData: FormData = new FormData();
    let renovacion: any = {};
    renovacion.P_NID_COTIZACION = this.cotizacionID; // nro cotizacion
    renovacion.P_DEFFECDATE = null; //Fecha Inicio
    renovacion.P_DEXPIRDAT = null; // Fecha Fin
    renovacion.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id']; // Fecha hasta
    renovacion.P_NTYPE_TRANSAC = typeMovement; // tipo de movimiento
    renovacion.P_NID_PROC = ''; // codigo de proceso (Validar trama)
    renovacion.P_FACT_MES_VENCIDO = null; // Facturacion Vencida
    renovacion.P_SFLAG_FAC_ANT = null; // Facturacion Anticipada
    renovacion.P_SCOLTIMRE = null; // Tipo de renovacion
    renovacion.P_NPAYFREQ = null; // Frecuencia Pago
    renovacion.P_NMOV_ANUL = item.NRO; // Movimiento de anulacion
    renovacion.P_NNULLCODE = 0; // Motivo anulacion
    renovacion.P_SCOMMENT = ''; // Frecuencia Pago

    myFormData.append('transaccionProtecta', JSON.stringify(renovacion));

    Swal.fire({
      title: 'Información',
      text: question,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: btnMov,
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) {
        this.policyemit.transactionPolicy(myFormData).subscribe(
          (res) => {
            if (res.P_COD_ERR == 0) {
              this.getPolicyMovement(this.cotizacionID);
              Swal.fire({
                title: 'Información',
                text: response,
                icon: 'success',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
              }).then((result) => {
                if (result.value) {
                    if(this.codProducto == 2){
                      this.router.navigate(['/extranet/sctr/consulta-polizas']);
                    }else{
                      this.router.navigate(['/extranet/policy-transactions']);
                    }
                  }
              });
            } else {
              Swal.fire({
                title: 'Información',
                text: res.P_MESSAGE,
                icon: 'error',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
              });
            }
          },
          (err) => {
            console.log(err);
          }
        );
      }
    });
  }

  async anularMov(item: any, typeMovement: any) {
    if (item.COD_TRANSAC == "3" && this.codProducto == 2) { // Validacion solo para exclusion
        Swal.fire("Error", "Movimiento de exclusión no se puede reversar.", "error");
    } else {
        this.nErrorAnul = 0;
            this.sMessageAnul = "";

            if(this.codProducto == 2){
                await this.policyemit.getValReglasAnulSCTR(this.cotizacionID, item.NRO).toPromise().then(
                    res => {
                        this.nErrorAnul = res.NCODE;
                        this.sMessageAnul = res.SMESSAGE;
                });
            }

            console.log('anularMov');
            console.log(this.nErrorAnul);
            console.log(this.sMessageAnul);

            if(this.nErrorAnul == -1){
                Swal.fire("Error", this.sMessageAnul, "error");
            }else{
                let modalRef: NgbModalRef;
                modalRef = this.modalService.open(AnulMovComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                modalRef.componentInstance.reference = modalRef;
                modalRef.componentInstance.itemAnul = item;
                modalRef.componentInstance.typeMovement = typeMovement;
                modalRef.componentInstance.cotizacionID = this.cotizacionID;

                console.log('modalRef.componentInstance.itemAnul');
                console.log(modalRef.componentInstance.itemAnul);
                console.log(modalRef.componentInstance.typeMovement);
                console.log(modalRef.componentInstance.cotizacionID);

                modalRef.result.then((renovacion) => {
                    if (renovacion != undefined) {
                        this.reference.close(this.cotizacionID)
                        //this.getPolicyMovement(this.cotizacionID);
                        if (this.codProducto == 2) {
                            this.router.navigate(['/extranet/sctr/consulta-polizas']);
                        } else {
                            this.router.navigate(['/extranet/policy-transactions']);
                        }
                    }
                }, (reason) => {
                });
            }
    }
  }

    async verDocumentos(item: any) {
        let modalRef: NgbModalRef;
        modalRef = this.modalService.open(PolicyDocumentsComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.adjuntosList = item.RUTAS;
        modalRef.componentInstance.comentario = item.COMENTARIO;
        modalRef.componentInstance.motAnulacion = item.MOT_ANULACION;
        modalRef.componentInstance.codTransac = item.COD_TRANSAC;
        modalRef.componentInstance.nbranch = item.NBRANCH;

        let documentos: any[] = [];

        if (item.SRUTA && item.SRUTA.length > 0) {
            const promises = item.SRUTA.map((ruta: string) => this.getDocuments(ruta));
            const results = await Promise.all(promises);
            documentos = Array.prototype.concat.apply([], results);
        } else {
            documentos = item.SRUTAS_GEN || [];
        }

        modalRef.componentInstance.generadosList = documentos;
    }

    async getDocuments(sruta) {
        let response: String[] = null;
        await this.policyemit.getDocumentsList(sruta).toPromise().then(
        async (res) => {
            response = res;
        },
        (err) => {
            console.log(err);
        }
        );

        return response;
  }

  //Ini RQ2025-4
  renderSede(value: any) {
    const selectElement = document.querySelector('.render-sede') as HTMLInputElement;

    if (selectElement) {
      const getTextWidth = (text: string, font: string): number => {
        const tempElement = document.createElement('span');
        document.body.appendChild(tempElement);

        tempElement.style.font = font;
        tempElement.style.whiteSpace = 'nowrap'; 
        tempElement.style.visibility = 'hidden'; 
        tempElement.style.position = 'absolute'; 

        tempElement.textContent = text;

        const textWidth = tempElement.offsetWidth;

        document.body.removeChild(tempElement);

        return textWidth;
      };

      // Función para verificar si el texto desborda
      const isTextOverflowing = (): boolean => {
        const elementValue = value;

        const elementStyles = window.getComputedStyle(selectElement);
        const font = `${elementStyles.fontSize} ${elementStyles.fontFamily}`;

        const textWidth = getTextWidth(elementValue, font);

        const elementWidth = selectElement.clientWidth;

        return textWidth > elementWidth;
      };

      // Función para ajustar el contenedor padre
      const adjustParentContainer = () => {
        if (isTextOverflowing()) {
          const parentDiv = selectElement.parentNode as HTMLElement;

          if (parentDiv) {
            selectElement.setAttribute("style", "font-size: 12.8px !important;");
            parentDiv.classList.remove('col-sm-6');
            parentDiv.classList.add('col-sm-12');
          }
        } else {
          const parentDiv = selectElement.parentNode as HTMLElement;

          if (parentDiv) {
            selectElement.removeAttribute("style");
            parentDiv.classList.remove('col-sm-12');
            parentDiv.classList.add('col-sm-6');
          }
        }
      };

      adjustParentContainer();
    }
  }
  //Fin RQ2025-4

    relanzarDocumento(item: any) {
        Swal.fire({
            title: 'Relanzar Documento',
            text: '¿Deseas realanzar los documentos de esta transacción?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Relanzar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.isLoading = true; // Mostrar pantalla de carga
                const data: any = {
                    npolicy: item.NPOLICY,
                    nbranch: item.NBRANCH,
                    nproduct: item.NPRODUCT,
                    nidheaderproc: item.NIDHEADERPROC_SCTR,
                    srutalist: item.SRUTA,
                    suser: JSON.parse(localStorage.getItem('currentUser'))['id']
                };

                this.policyemit.relanzarDocumento(data).subscribe(
                    (res) => {
                        this.isLoading = false;
                        if (res.P_NCODE == 0) {
                            item.NENV_PRINT = 3;

                            Swal.fire({
                            title: "Información",
                            text: "Los documentos de esta transacción han empezado a relanzarse",
                            icon: "success",
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                            })

                        } else {
                            Swal.fire({
                            title: "Información",
                            text: res.P_SMESSAGE,
                            icon: "error",
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                            })
                        }
                    },
                    (err) => {
                        this.isLoading = false;
                        console.log(err);
                    }
                );
            }
        });
    }

    async verEstadosEPS(item: any) {
        let modalRef: NgbModalRef;
        let detalle = await this.obtListEPS(item, 3);

        modalRef = this.modalService.open(PolicyDocumentsComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.opcionVer = this.opcionVer;
        modalRef.componentInstance.nidheaderproc = item.NIDHEADERPROC_SCTR;
        modalRef.componentInstance.detalleEPSList = detalle.TableData  || [];
    }

    async obtListEPS(item: any, tipo: any) {
        let response: any;

        const data: any = {
            nidheaderproc: item.NIDHEADERPROC_SCTR,
            tipo: tipo,
            suser: JSON.parse(localStorage.getItem('currentUser'))['id']
        };

        await this.policyemit.getDetalleEPS(data).toPromise().then(
            (res) => {
                response = res;
            },
            (err) => {
                console.error(err);
            }
        );

        return response;
    }

    async getProfileProduct() {
        let profile = 0;

        let _data: any = {};
        _data.nUsercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
        _data.nProduct = this.codProducto;
        await this.parameterSettingsService.getProfileProduct(_data).toPromise()
            .then(
                (res) => {
                    profile = res;
                    this.perfil = profile;
                },
                err => {
                    console.log(err)
                }
            );

        return profile;
    }

    validateButtonTrx(type: any) {

        let flag = false;

        if (['136', '177', '157', '212', '151', '155', '304', '156', '166', '305'].includes(this.perfil) && type == 0) {
            flag = true;
        }

        return flag;
    }

    async relanzarDataEPS(item: any) {
        let codMensaje = await this.obtListEPS(item, 7);
        let Mensaje = codMensaje.P_NCODE == 3 ? '¿Deseas enviar este movimiento al servicio de la EPS?' : 'Este movimiento ya fue enviado a la EPS anteriormente. ¿Deseas reenviarlo?';

        Swal.fire({
            title: 'Relanzar Movimiento EPS',
            text: Mensaje,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Relanzar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.isLoading = true;
                const data: any = {
                    npolicy: item.NPOLICY,
                    nbranch: item.NBRANCH,
                    nproduct: item.NPRODUCT,
                    nidheaderproc: item.NIDHEADERPROC_SCTR,
                    srutalist: item.SRUTA,
                    suser: JSON.parse(localStorage.getItem('currentUser'))['id']
                };

                this.policyemit.relanzarDataEPS(data).subscribe(
                    (res) => {
                        this.isLoading = false;
                        if (res.P_NCODE == 0) {
                            item.flagVista = 3;

                            Swal.fire({
                            title: "Información",
                            text: 'El movimiento se ha enviado a la EPS correctamente',
                            icon: "success",
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                            })

                        } else {
                            Swal.fire({
                            title: "Información",
                            text: res.P_SMESSAGE,
                            icon: "error",
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                            })
                        }
                    },
                    (err) => {
                        this.isLoading = false;
                        Swal.fire({
                        title: "Información",
                        text: 'Se ha encontrado un error al enviar el movimiento a la EPS, por favor intente nuevamente.',
                        icon: "error",
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                        });
                        console.log(err);
                    }
                );
            }
        });
    }

    descargaRecibos(item, title, titleColumn) {
        let arrayCsv = [];
        if (item != '') {
            let array = item.split('/');
            for (let item of array) {

            let itemArray = {
                NRO_RECIBO: item.trim(),
            };

            let itemArrayObs = {
                OBSERVACIONES: item.trim(),
            };

            if (titleColumn == 'NRO_RECIBO') {
                arrayCsv.push(itemArray);
            } else {
                arrayCsv.push(itemArrayObs);
            }
            }
            this.downloadFile(arrayCsv, title);
        } else {
            Swal.fire('Información', 'No hay recibos para descargar', 'error');
            return;
        }
    }

    // descargar archivo csv
    downloadFile(JSONData, ReportTitle, ShowLabel = true) {
        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
        var CSV = '';

        if (ShowLabel) {
        var row = '';

        for (var index in arrData[0]) {
            row += index + ';';
        }
        row = row.slice(0, -1);
        CSV += row + '\r\n';
        }
        for (var i = 0; i < arrData.length; i++) {
        var row = '';
        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '";';
        }
        row.slice(0, row.length - 1);
        CSV += row + '\r\n';
        }
        if (CSV == '') {
        alert('Invalid data');
        return;
        }
        var fileName = 'REPORTE_';
        fileName += ReportTitle.replace(/ /g, '_');
        var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
        var link = document.createElement('a');
        link.href = uri;
        link.download = fileName + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}