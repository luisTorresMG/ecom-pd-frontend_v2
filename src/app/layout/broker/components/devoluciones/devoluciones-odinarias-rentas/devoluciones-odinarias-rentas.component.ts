import { Component, HostListener, OnInit } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ListadoModalComponent } from '../../modals/listado-modal/listado-modal.component';
import { ClientModalComponent } from '../../modals/client-modal/client-modal.component';
import { EjecutivoModalComponent } from '../../modals/ejecutivo-modal/ejecutivo-modal.component';
import { Router } from '@angular/router';
import { RentasService } from '../../../../backoffice/services/rentas/rentas.service';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { Subscription } from 'rxjs';
import { ComentarioModalComponent } from '../../modals/comentario-modal/comentario-modal.component';
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal.component';
import { AccPersonalesConstants } from '../../quote/acc-personales/core/constants/acc-personales.constants';

@Component({
  selector: 'app-devoluciones-odinarias-rentas',
  templateUrl: './devoluciones-odinarias-rentas.component.html',
  styleUrls: ['./devoluciones-odinarias-rentas.component.css'],
  providers: [NgbModalConfig, NgbModal],
})
export class DevolucionesOdinariasRentasComponent implements OnInit {
  tickets: any = [];
  filters: any = [];
  products: any = [];
  opcionesProductos: any = [];
  motivos: any = [];
  opcionesMotivos: any = [];
  submotivos: any = [];
  opcionesSubMotivos: any = [];
  estados: any = [];
  opcionesEstados: any = [];
  CONSTANTS: any = AccPersonalesConstants;

  inputs: any = [];
  colorParts: string[] = [];
  popupData: number;

  showMenu: { [key: string]: boolean } = {};
  productCanal: number;
  listActions: any = [];
  listActionsticked: any = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalTickets: number = 0;
  displayedTickets: any;
  itemsPerPage: number = 10;
  showPagination: boolean = false;
  NUSERCODE: any;
  NUSEDNI: any;
  client: any = [];
  time: any = [];
  pruenbatext: string = '';
  totalPage: number = 0;
  startRecord: number = 0;
  endRecord: number = 0;
  columnOrder: any = [];

  displayedTicketsCheck: any[];
  dateinit: any = [];
  selectedTickets: any[] = [];
  selectedTicketsCount: number = 0;
  showMenuColumn: boolean = false;
  columnVisibility: { [key: string]: boolean } = {
    SCODE: false,
    SCODE_JIRA: true,
    SRAMO: false,
    SPRODUCT: true,
    POLIZA: true,
    MOTIVO_DES: false,
    SUBMOTIVO_DES: true,
    CONTRATANTE: true,
    ASEGURADO: false,
    FECHA_RECEPCION: true,
    FECHA_REGISTRO: false,
    USUARIO_REGISTRO: true,
    SLA_B: true,
    ESTADO: true,
    MONEDA: true,
    IMP_DEVOLUCION: true,
    SALERT: true,
  };
  today: any;
  isLoading: boolean = false;
  NIDPROFILE: number;
  SUSERNAME: string;
  numero: number;
  nDias: number;
  suscription: Subscription;
  suscription_upd: Subscription;
  sortField: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';
  branch: number;
  product: number;
  emailUser: string;
  items: any = [];
  asignarflase = 'FALSE';
  opcionesUsuarioResponsable: any[];
  constructor(
    private modalService: NgbModal,
    private router: Router,
    private rentasService: RentasService
  ) {}
  async ngOnInit() {
    this.opcionesSubMotivos = [
      {
        codigo: 0,
        valor: '- SELECCIONE -',
      },
    ];
    // this.getEmailUser();
    this.inputs.P_DATEEND = new Date();

    this.rentasService.getFilterDay().subscribe({
      next: (response) => {
        this.nDias = response.NDAYS;
      },
      error: (error) => {
        console.error(error);
      },
    });

    this.NUSERCODE = JSON.parse(localStorage.getItem('currentUser')).id;
    this.NUSEDNI = JSON.parse(localStorage.getItem('currentUser')).dni;

    const date = new Date();
    this.today = this.formatDate(date);
    try {
      await this.getProductCanal();
      await this.NidProfile();
      this.getListActions();
    } catch (error) {
      console.error(error);
    }
    this.filters = {
      P_DATEINI: '01/01/2001',
      P_DATEEND: '01/01/2001',
      P_NBRANCH: 0,
      P_NPRODUCT: 0,
      P_NPOLICY: 0,
      P_NMOTIVO: 0,
      P_SSUBMOTIVO: 0,
      P_SCODE_JIRA: '',
      P_SCUSPP: '',
      P_NSTATE: 0,
      P_SCLIENT: '',
      P_NUSERCODE_RE: 0,
    };

    this.getProducts();
    this.getMotivos();
    this.getUserResponsible();
    //   this.getSubMotivos(7)
    this.getEstados();
    this.columnOrder = [
      'Ticket',
      'Ticket Jira',
      'Ramo',
      'Producto',
      'Póliza',
      'Motivo',
      'Submotivo',
      'Contratante',
      'Asegurado',
      'F. de recepción',
      'F. de registro',
      'Usuario R.',
      'SLA',
      'Estado',
      'Moneda',
      'Imp. Devolución',
      'Alerta',
    ];
    this.inputs.P_DATEEND = new Date();
    this.getColorActions();

    this.rentasService
      .EquivalenciaUsuario({ dni: this.NUSEDNI, token: '' })
      .subscribe({
        next: (response) => {
          if(response.numbermsg != 0){
            this.ErrorModal(80)
          }else{
            localStorage.setItem('COD_USUARIO_RE', response.data[0].COD_USUARIO);
          }
        },
        error: (error) => {
          console.error(error);
        },
      });

    this.suscription = this.rentasService.refresh$.subscribe(() => {
      this.getTickets(this.filters);
    });

    this.suscription_upd = this.rentasService.refresh_upd$.subscribe(() => {
        this.getTickets_upd(this.filters);
      });

    if (localStorage.getItem('P_NSTATE') !== null) {
      this.loadFilters();
    } else {
      this.initial();
    }
  }

  hintTicket:string
  hintPagination:string

  async ErrorModal(numberError:number) {
    const message = await this.getMessage(numberError);
    const mensaje = this.separateString(message);

    let modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'md',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.listActions = this.listActions;
    modalRef.componentInstance.error = true;
    modalRef.componentInstance.mensaje = mensaje;
  }
  async paginationHint() {
    const mensaje = await this.getMessage(61);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
    const mensaje2 = await this.getMessage(62);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);

      this.hintTicket = `${mensajeParts[2]} ${this.startRecord} al ${this.endRecord}, ${this.totalTickets} tickets totales.`;
      this.hintPagination = `${mensajeParts2[2]} ${this.currentPage} de ${ this.totalPage }`;

  }
  //FUNCION PARA DAR FORMATO A UNA FECHA
  formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const paddedDay = day < 10 ? `0${day}` : day;
    const paddedMonth = month < 10 ? `0${month}` : month;

    return `${paddedDay}/${paddedMonth}/${year}`;
  }

  toggleMenu(index: number, event: Event) {
    event.stopPropagation();
    const currentState = this.showMenu[index];

    Object.keys(this.showMenu).forEach((key) => (this.showMenu[key] = false));
    this.showMenu[index] = !currentState;
    this.getListActionsTicket(index.toString());
  }

  changeMotivo(P_NMOTIVO) {
    if (P_NMOTIVO.codigo == 0) {
      this.opcionesSubMotivos = [
        {
          codigo: 0,
          valor: '- SELECCIONE -',
        },
      ];
      return;
    } else {
      //SERVCIO PARA LISTAR LOS SUBMOTIVOS SEGUN EL MOTIVO SELECCIONADO
      this.getSubMotivos(P_NMOTIVO.codigo);
    }
  }

  toggleMenuColumn(event: Event) {
    event.stopPropagation();
    this.showMenuColumn = !this.showMenuColumn;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: any) {
    Object.keys(this.showMenu).forEach((key) => {
      this.showMenu[key] = false;
    });
    this.showMenuColumn = false;
  }

  //FUNCION PARA ABRIR EL MODAL DE EDITAR LISTADO
  editList(event) {
    let modalRef = this.modalService.open(ListadoModalComponent, {
      size: 'lg',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.orderInitial = this.columnOrder;
    modalRef.componentInstance.columnVisibility = this.columnVisibility;
    modalRef.componentInstance.listActions = this.listActions;
    modalRef.result
      .then((data) => {
        this.columnOrder = data.newOrder;
      })
      .catch((dismissData) => {
        this.columnVisibility = dismissData.columnVisibilityInitial;
      });
  }

  //FUNCION PARA ABRIR EL MODAL DE BUSCAR CLIENTE
  searchClient(event) {
    let modalRef = this.modalService.open(ClientModalComponent, {
      size: 'lg',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.listActions = this.listActions;
    modalRef.result
      .then((selectedClient) => {
        if (selectedClient) {
          this.client = selectedClient;
          this.filters = {
            P_DATEINI: this.inputs.P_DATEINI,
            P_DATEEND: this.inputs.P_DATEEND,
            P_NBRANCH: 0,
            P_NPRODUCT: 0,
            P_NPOLICY: 0,
            P_NMOTIVO: 0,
            P_SSUBMOTIVO: 0,
            P_SCODE_JIRA: '',
            P_SCUSPP: '',
            P_NSTATE: this.inputs.P_NSTATE.codigo,
            P_SCLIENT: this.client.SCLIENT,
            P_NUSERCODE_RE: 0,
          };
          this.showPagination = true;
        }
      })
      .catch((error) => {
        console.log('Modal cerrado sin selección');
      });
  }

  //FUNCION PARA ABRIR EL MODAL DE ASIGNAR EJECUTIVO
  assignExecutive(event) {
    let modalRef = this.modalService.open(EjecutivoModalComponent, {
      size: 'md',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.NUSERCODE = this.NUSERCODE;
    modalRef.componentInstance.NIDPROFILE = this.NIDPROFILE;
    modalRef.componentInstance.listActions = this.listActions;
    this.selectedTickets = this.displayedTickets.filter(
      (ticket) => ticket.selected
    );
    modalRef.componentInstance.tickets = this.selectedTickets;
    modalRef.result.then(() => {
      this.selectedTicketsCount = 0;
      this.selectedTickets = null;
    });
  }

  async getTickets(filters: any): Promise<void> {
    const mensaje = await this.getMessage(17);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
    this.currentPage = 1;
    this.isLoading = true;
    //SERVICIO PARA RECUPERAR LOS TICKETS
    return new Promise((resolve, reject) => {
      this.rentasService.getListTickets(filters).subscribe({
        next: (response) => {
          this.tickets = response.GenericResponse;
          this.totalTickets = this.tickets.length;
          if (this.totalTickets <= 0) {
            Swal.fire({
              icon: mensajeParts[0],
              title: mensajeParts[1],
              text: mensajeParts[2],
            });
          }
          this.sortTickets();
          this.paginateTickets();
          this.isLoading = false;
          resolve();
        },
        error: (error) => {
          console.error(error);
          this.isLoading = false;
          reject();
        },
      });
    });
  }

  async getTickets_upd(filters: any): Promise<void> {
    const mensaje = await this.getMessage(17);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
    this.currentPage = 1;
    this.isLoading = true;
    //SERVICIO PARA RECUPERAR LOS TICKETS
    return new Promise((resolve, reject) => {
      this.rentasService.getListTickets(filters).subscribe({
        next: (response) => {
          this.tickets = response.GenericResponse;
          this.totalTickets = this.tickets.length;
          if (this.totalTickets <= 0) {
          }
          this.sortTickets();
          this.paginateTickets();
          this.isLoading = false;
          resolve();
        },
        error: (error) => {
          console.error(error);
          this.isLoading = false;
          reject();
        },
      });
    });
  }
  paginateTickets() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalTickets);
    this.displayedTickets = this.tickets.slice(startIndex, endIndex);
    this.getTotalPages();
    this.paginationHint();
  }

  changePage(pageNumber: number) {
    this.currentPage = pageNumber;
    this.paginateTickets();
  }

  changeItemsPerPage() {
    this.pageSize = this.itemsPerPage;
    this.currentPage = 1; // Reset to the first page
    this.paginateTickets();
  }

  getTotalPages() {
    this.totalPage = Math.ceil(this.totalTickets / this.itemsPerPage);
    this.startRecord = (this.currentPage - 1) * this.itemsPerPage + 1;
    this.endRecord = Math.min(
      this.startRecord + this.itemsPerPage - 1,
      this.totalTickets
    );
  }

  sortTickets() {
    if (this.sortField) {
      this.tickets.sort((a, b) => {
        let fieldA = a[this.sortField];
        let fieldB = b[this.sortField];
        if (
          this.sortField === 'FECHA_REGISTRO' ||
          this.sortField === 'FECHA_RECEPCION'
        ) {
          // Convert dates to timestamps for comparison
          fieldA = new Date(fieldA).getTime();
          fieldB = new Date(fieldB).getTime();
        }
        if (fieldA < fieldB) {
          return this.sortOrder === 'asc' ? -1 : 1;
        } else if (fieldA > fieldB) {
          return this.sortOrder === 'asc' ? 1 : -1;
        } else {
          return 0;
        }
      });
    }
    this.paginateTickets();
  }

  //FUNCION PARA ORDENAR DE MANERA ASCENDENTE O DESCENDENTE LAS COLUMNAS
  setSortField(field: string) {
    if (this.sortField === field) {
      // Toggle sort order if the same field is selected
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc'; // Default to ascending order
    }
    this.sortTickets();
  }

  getProducts() {
    //SERVICIO PARA LISTAR LOS PRODUCTOS
    this.rentasService.getListProducts().subscribe({
      next: (response) => {
        this.products = response.C_TABLE;

        this.opcionesProductos = this.products.map((product) => {
          return {
            codigo: `${product.NBRANCH}-${product.NPRODUCT}`,
            valor: product.SPRODUCT,
          };
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getMotivos() {
    //SERVICIO PARA LISTAR LOS MOTIVOS
    this.rentasService.getListMotivos().subscribe({
      next: (response) => {
        this.motivos = response.C_TABLE;

        this.opcionesMotivos = this.motivos.map((motivo) => {
          return {
            codigo: motivo.NCODE,
            valor: motivo.SDESCRIPT,
          };
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getSubMotivos(P_NMOTIVO) {
    //SERVICIO PARA LISTAR LOS SUBMOTIVOS
    this.rentasService.getListSubMotivos({ P_NMOTIVO: P_NMOTIVO }).subscribe({
      next: (response) => {
        this.submotivos = response.C_TABLE;

        this.opcionesSubMotivos = this.submotivos.map((submotivo) => {
          return {
            codigo: submotivo.NCODE,
            valor: submotivo.SDESCRIPT,
          };
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getEstados() {
    //SERVICIO PARA LISTAR LOS ESTADOS
    this.rentasService.getListEstados().subscribe({
      next: (response) => {
        this.estados = response.C_TABLE;

        this.opcionesEstados = this.estados.map((estado) => {
          return {
            codigo: estado.NCODE,
            valor: estado.SDESCRIPT,
          };
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getUserResponsible() {
    const data = {
      P_NUSERCODE: this.NUSERCODE,
    };
    //SERVICIO PARA LISTAR LOS Usuarios responsables
    this.rentasService.getUserResponsible(data).subscribe({
      next: (response) => {
        this.estados = response.C_TABLE;

        this.opcionesUsuarioResponsable = this.estados.map((estado) => {
          return {
            codigo: estado.NCODE,
            valor: estado.SDESCRIPT,
          };
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  //FUNCION PARA LOS FILTROS INICIALES
  initial() {
    this.isLoading = true;
    this.inputs.P_DATEINI = this.subtractDays(new Date(), this.nDias);
    this.filters = {
      P_DATEINI: this.inputs.P_DATEINI,
      P_DATEEND: this.inputs.P_DATEEND,
      P_NBRANCH: 0,
      P_NPRODUCT: 0,
      P_NPOLICY: 0,
      P_NMOTIVO: 0,
      P_SSUBMOTIVO: 0,
      P_SCODE_JIRA: '',
      P_SCUSPP: '',
      P_NSTATE: 0,
      P_SCLIENT: '',
      P_NUSERCODE_RE: 0,
    };
    this.getTickets(this.filters);
    this.showPagination = true;
  }

  //FUNCION PARA OBTENER LOS FILTROS
  async filter() {
    const mensaje = await this.getMessage(40);

    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);

    this.isLoading = true;
    const codigo = this.inputs.P_NPRODUCT.codigo.split('-');
    const branch = codigo[0];
    const producto = codigo[1];

    if (
      this.client.SCLIENT == null ||
      this.client.SCLIENT == '' ||
      this.client.SCLIENT == undefined
    ) {
      this.filters = {
        P_DATEINI: this.inputs.P_DATEINI,
        P_DATEEND: this.inputs.P_DATEEND,
        P_NBRANCH: branch,
        P_NPRODUCT: producto,
        P_NPOLICY: this.inputs.P_NPOLICY,
        P_NMOTIVO: this.inputs.P_NMOTIVO.codigo,
        P_SSUBMOTIVO: this.inputs.P_SSUBMOTIVO.codigo,
        P_SCODE_JIRA: this.inputs.P_SCODE_JIRA,
        P_SCUSPP: this.inputs.P_SCUSPP,
        P_NSTATE: this.inputs.P_NSTATE.codigo,
        P_SCLIENT: '',
        P_NUSERCODE_RE: this.inputs.P_NUSERCODE_RE.codigo,
      };
    }else{
        this.filters = {
            P_DATEINI: this.inputs.P_DATEINI,
            P_DATEEND: this.inputs.P_DATEEND,
            P_NBRANCH: branch,
            P_NPRODUCT: producto,
            P_NPOLICY: this.inputs.P_NPOLICY,
            P_NMOTIVO: this.inputs.P_NMOTIVO.codigo,
            P_SSUBMOTIVO: this.inputs.P_SSUBMOTIVO.codigo,
            P_SCODE_JIRA: this.inputs.P_SCODE_JIRA,
            P_SCUSPP: this.inputs.P_SCUSPP,
            P_NSTATE: this.inputs.P_NSTATE.codigo,
            P_SCLIENT: this.client.SCLIENT,
            P_NUSERCODE_RE: this.inputs.P_NUSERCODE_RE.codigo,
          };
    }
    if (this.inputs.P_DATEINI > this.inputs.P_DATEEND) {
      Swal.fire({
        icon: mensajeParts[0],
        title: mensajeParts[1],
        text: mensajeParts[2],
      });
      this.isLoading = false;
      return;
    }
    this.getTickets(this.filters);
    this.showPagination = true;
  }

  //FUNCION PARA PONER LOS PARAMETROS POR DEFECTO
  resetFilter() {
    this.inputs.P_DATEEND = new Date();
    this.inputs.P_DATEINI = this.subtractDays(
      this.inputs.P_DATEEND,
      this.nDias
    );
    this.inputs.P_NPRODUCT = 0;
    this.inputs.P_NMOTIVO = 0;
    this.inputs.P_SSUBMOTIVO = 0;
    this.inputs.NRO_TICKET = '';
    this.inputs.P_SCODE_JIRA = '';
    this.inputs.P_SCUSPP = '';
    this.inputs.P_NPOLICY = '';
    this.inputs.SCLIENT = '';
    this.client.SCLIENAME = '';
    this.client.SCLIENT = '';
    this.inputs.P_NSTATE = { codigo: 0 };
    this.inputs.P_NUSERCODE_RE = 0;
  }

  resetTable(){
    this.columnVisibility = {
        SCODE: false,
        SCODE_JIRA: true,
        SRAMO: false,
        SPRODUCT: true,
        POLIZA: true,
        MOTIVO_DES: false,
        SUBMOTIVO_DES: true,
        CONTRATANTE: true,
        ASEGURADO: false,
        FECHA_RECEPCION: true,
        FECHA_REGISTRO: false,
        USUARIO_REGISTRO: true,
        SLA_B: true,
        ESTADO: true,
        MONEDA: true,
        IMP_DEVOLUCION: true,
        SALERT: true,
    };
    this.columnOrder = [
        'Ticket',
        'Ticket Jira',
        'Ramo',
        'Producto',
        'Póliza',
        'Motivo',
        'Submotivo',
        'Contratante',
        'Asegurado',
        'F. de recepción',
        'F. de registro',
        'Usuario R.',
        'SLA',
        'Estado',
        'Moneda',
        'Imp. Devolución',
        'Alerta',
      ];
  }
  async asignar(P_SCODE_JIRA: string) {
    const mensaje = await this.getMessage(33);
    const mensaje2 = await this.getMessage(34);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);

    const data = {
      P_SCODE_JIRA: P_SCODE_JIRA,
      P_NUSERCODE_RE: this.NUSERCODE,
      'LIST_SCODE_JIRA ': [],
    };
    //SERVICIO PARA ASIGNAR UN EJECUTIVO
    this.rentasService.updAsignar(data).subscribe({
      next: (response) => {
        if (response.P_NCODE == 0) {
          Swal.fire({
            icon: mensajeParts[0],
            title: mensajeParts[1],
            text: mensajeParts[2],
          });
        } else {
          Swal.fire({
            icon: mensajeParts2[0],
            title: mensajeParts2[1],
            text: mensajeParts2[2],
          });
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  //FUNCION PARA SELECCIONAR TODOS LOS TICKETS
  handleMasterCheckboxChange(event: any) {
    if (event.target.checked) {
      this.displayedTickets.forEach((ticket) => (ticket.selected = true));
    } else {
      this.displayedTickets.forEach((ticket) => (ticket.selected = false));
    }
    this.selectedTicketsCount = this.displayedTickets.filter(
      (ticket) => ticket.selected
    ).length;
  }

  //FUNCION PARA SELECCIONAR UN TICKET
  handleCheckboxChange(event: any, ticket: any) {
    ticket.selected = event.target.checked;
    this.selectedTicketsCount = this.displayedTickets.filter(
      (ticket) => ticket.selected
    ).length;
  }

  //FUNCION PARA CAMABIAR VISIBILIDAD DE UNA COLUMNA
  toggleColumn(columnName: string): void {
    this.columnVisibility[columnName] = !this.columnVisibility[columnName];
  }

  // Función para verificar si una columna está visible
  showColumn(columnName: string): boolean {
    return this.columnVisibility[columnName];
  }

  //FUNCION QUE CALCULA LA RESTA DE FECHAS
  subtractDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  }

  getProductCanal(): Promise<void> {
    return new Promise((resolve, reject) => {
      //SERVICIO QUE RECUPERA EL PRODUCTO ACTUAL
      this.rentasService.getProductCanal().subscribe({
        next: (response) => {
          this.productCanal = response.NPRODUCT;
          resolve();
        },
        error: (error) => {
          console.error(error);
          reject(error);
        },
      });
    });
  }

  getListActions() {
    //SERVICIO QUE RECUPERA LAS ACCIONES PARA EL PERFIL DEL USUARIO ACTUAL TENIENDO EN CUENTA EL PRODUCTO
    this.rentasService
      .getListActions({
        P_NPRODUCT: this.productCanal,
        P_NIDPROFILE: this.NIDPROFILE,
        P_SCODE: '',
      })
      .subscribe({
        next: (response) => {
          this.listActions = response.C_TABLE[0];
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  NidProfile(): Promise<void> {
    return new Promise((resolve, reject) => {
      //SERVICIO QUE RECUPERA EL ID DEL PERFIL
      this.rentasService
        .getNidProfile({
          P_NPRODUCT: this.productCanal,
          P_NIDUSER: this.NUSERCODE,
        })
        .subscribe({
          next: (response) => {
            this.NIDPROFILE = response.C_TABLE[0].NIDPROFILE;
            resolve();
          },
          error: (error) => {
            console.error(error);
            reject(error);
          },
        });
    });
  }

  //FUNCION QUE RECIBE EL CODIGO DE TICKET PARA LISATR SUS ACCIONES
  getListActionsTicket(P_SCODE: string) {
    const data = {
      P_SCODE: P_SCODE,
      P_NUSERCODE: this.NUSERCODE,
      P_NPRODUCT: this.productCanal,
      P_NIDPROFILE: this.NIDPROFILE,
    };
    //SERVICIO QUE OBTIENE LA LISTA DE ACCIONES DEL TICKET
    this.rentasService.getListActionsTicket(data).subscribe({
      next: (response) => {
        this.items = response.C_TABLE[0];
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  P_NTRANSAC: Number;
  async confirmModal(dataupdate) {
    const message = await this.getMessage(21);
    const mensaje = this.separateString(message);

    let modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'md',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.listActions = this.listActions;
    modalRef.componentInstance.mensaje = mensaje;
    modalRef.result
      .then(() => {
        this.rentasService.updStatusTicket(dataupdate).subscribe({
          next: (response) => {
            const mensajeParts: [SweetAlertIcon, string, string] =
              this.separateString(response.P_SMESSAGE);
            Swal.fire({
              icon: mensajeParts[0],
              title: mensajeParts[1],
              text: mensajeParts[2],
            });
            if (response.P_NCODE == 0) {
              this.P_NTRANSAC = response.P_NTRANSAC;
            }
          },
          error: (error) => {
            console.error(error);
          },
        });
      })
      .catch((error) => {
        console.log('Modal cerrado');
      });
  }

  //FUNCION PARA ABRIR EL MODAL DE COMENTARIO
  async Comment(ticket, popupData, P_SCODE_JIRA, P_SNAME_ACT) {
    const mensaje2 = await this.getMessage(79);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);
    let modalRef = this.modalService.open(ComentarioModalComponent, {
      size: 'md',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.NUSERCODE = this.NUSERCODE;
    modalRef.componentInstance.NIDPROFILE = this.NIDPROFILE;
    modalRef.componentInstance.POPUPDATA = popupData;
    modalRef.componentInstance.listActions = this.listActions;
    modalRef.componentInstance.ticket = ticket;
    modalRef.componentInstance.SNAME_ACT = P_SNAME_ACT;

    try {
      const commentData = await modalRef.result;
      console.log(commentData);
      this.rentasService
     //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
    //.EquivalenciaUsuario({ dni: ticket.SDNI_USUARIO_RESP, token: '' })
    .EquivalenciaUsuario({ dni: ticket.SDNI_USUARIO_RESP ? ticket.SDNI_USUARIO_RESP :  JSON.parse(localStorage.getItem('currentUser')).dni, token: '' })
     //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >   
    .subscribe({
      next: (response) => {
        if(response.numbermsg != 0){
          console.log("error")
          this.ErrorModal(80)
        }else{
          console.log(response.data[0].COD_USUARIO);
      const dataupdate = {
        P_SCODE_JIRA: P_SCODE_JIRA,
        P_NUSERCODE: this.NUSERCODE,
        P_NIDPROFILE: this.NIDPROFILE,
        P_SNAME_ACT: P_SNAME_ACT,
        P_NTYPECOMMENT: commentData.P_NTYPECOMMENT,
        P_SCOMMETS: commentData.P_SCOMMETS,
      };

      const P_DATA_ENDOSO_RESCATE = {
        ramo: '',
        cod_producto: ticket.cod_producto,
        poliza: ticket.POLIZA,
        moneda: ticket.MONEDA,
        monto: ticket.MTO_RESCATE,
        tramite: ticket.SCODE_JIRA,
            usuario:response.data[0].COD_USUARIO
      };

      const P_DATA_ENDOSO_HERENCIA = {
        ramo: '',
        cod_producto: ticket.cod_producto,
        poliza: ticket.POLIZA,
        ticket: ticket.SCODE_JIRA,
        tipo_pago: ticket.DES_PAGO,
        fec_sol: ticket.FECHA_REGISTRO,
        pension_cal: ticket.MTO_RESCATE,
        pens_no_pagadas: ticket.NNOPAY_PENSIONS,
        //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
        ///pens_fut_no_pagadas: ticket.x,
        pens_fut_no_pagadas: ticket.NFUTURENOPAY_PENSIONS,
        //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
        usuario: response.data[0].COD_USUARIO,
        sucesion: 'Sucesion Intestada',
        cod_usuario: response.data[0].COD_USUARIO,
            };

          const P_DATA_ENDOSO_ANTICIPO = {
            ramo: '',
            cod_producto: ticket.cod_producto,
            poliza: ticket.POLIZA,
            moneda: ticket.COD_MONEDA,
            monto: ticket.MTO_RESCATE,
             //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
            //tramite: ticket.SCODE_JIRA,
            ticket: ticket.SCODE_JIRA,
             //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
            usuario: response.data[0].COD_USUARIO,
            //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
             pension: ticket.NNOPAY_PENSIONS,
             fec_sol: ticket.FECHA_SOLICITUD,
             prc_anticipo: ticket.POR_ANTICIPO,
            //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
          };

          const P_DATA_ENDOSO_DEVOLUCION = {
            ramo: '',
            cod_producto: ticket.cod_producto,
            poliza: ticket.POLIZA,
            moneda: ticket.COD_MONEDA,
            monto: ticket.MTO_RESCATE,
            tramite: ticket.SCODE_JIRA,
            usuario: response.data[0].COD_USUARIO,
          };

          const P_DATA_ENDOSO_FALLECIMIENTO = {
            ramo: '',
            cod_producto: ticket.cod_producto,
            poliza: ticket.POLIZA,
            moneda: ticket.COD_MONEDA,
            monto: ticket.MTO_RESCATE,
            tramite: ticket.SCODE_JIRA,
            tipo_pago: ticket.DES_PAGO,
            usuario: response.data[0].COD_USUARIO,
          };

          const P_DATA_ENDOSO_RESOLUCION = {
            ramo: '',
            cod_producto: ticket.cod_producto,
            poliza: ticket.POLIZA,
            moneda: ticket.COD_MONEDA,
            monto: ticket.MTO_RESCATE,
            tramite: ticket.SCODE_JIRA,
            usuario: response.data[0].COD_USUARIO,
      };
      //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
      //if (P_SNAME_ACT == 'APROBAR') {
        if (P_SNAME_ACT == 'APROBAR' || (P_SNAME_ACT == 'DERIVAR' && ticket.NIDTECHNIQUE != 0 )) {
      //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
            this.isLoading = true;
        const data = {
          P_NTICKET: ticket.NTICKET,
          P_SCODE: ticket.SCODE,
          cod_submotivo: ticket.NSUBMOTIV,
          P_SSUBMOTIVO: ticket.SUBMOTIVO_DES,
          P_SPRODUCTO: ticket.SPRODUCT,
           //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
          ///FECHA_RECEPCION: ticket.FECHA_RECEPCION,
          FECHA_RECEPCION: ticket.FECHA_SOLICITUD,
          //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >

          P_DATA_UPDATE: dataupdate,
          P_DATA_ENDOSO_RESCATE: P_DATA_ENDOSO_RESCATE,
          P_DATA_ENDOSO_HERENCIA: P_DATA_ENDOSO_HERENCIA,
              P_DATA_ENDOSO_ANTICIPO: P_DATA_ENDOSO_ANTICIPO,
              P_DATA_ENDOSO_DEVOLUCION: P_DATA_ENDOSO_DEVOLUCION,
              P_DATA_ENDOSO_FALLECIMIENTO: P_DATA_ENDOSO_FALLECIMIENTO,
              P_DATA_ENDOSO_RESOLUCION: P_DATA_ENDOSO_RESOLUCION,
        };

        this.rentasService.aprobarTicket(data).subscribe({
          next: async (response) => {
            //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
             if (response.P_NCODE == 0 && (P_SNAME_ACT == 'DERIVAR' && ticket.NIDTECHNIQUE != 0 )) {
              this.P_NTRANSAC = 0;
                if (commentData.POPUPDATA == 3) {
                    this.insDataEmail(commentData);
                }
            }
            //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
            if (response.P_SMESSAGE.includes('||')) {
              const mensajeParts: [SweetAlertIcon, string, string] =
                this.separateString(response.P_SMESSAGE);
              Swal.fire({
                icon: mensajeParts[0],
                title: mensajeParts[1],
                text: mensajeParts[2],
              });
                  this.isLoading = false;
            } else {
              const mensaje = await this.getMessage(response.P_NCODE);
              const mensajeParts = this.separateString(mensaje);
                  this.isLoading = false;
              Swal.fire({
                icon: mensajeParts[0],
                title: mensajeParts[1],
                text: response.P_SMESSAGE,
              });
            }
          },
          error: (error) => {
            console.error(error);
                this.isLoading = false;
            Swal.fire({
                icon: mensajeParts2[0],
                title: mensajeParts2[1],
                text: mensajeParts2[2],
              });
          },
        });
      } else {
        this.rentasService.updStatusTicket(dataupdate).subscribe({
          next: (response) => {
            const mensajeParts: [SweetAlertIcon, string, string] =
              this.separateString(response.P_SMESSAGE);
            if (response.P_NCODE == 0) {
              this.P_NTRANSAC = response.P_NTRANSAC;
              if (commentData.POPUPDATA == 3) {
                this.insDataEmail(commentData);
              }
            }
                this.isLoading = false;
            Swal.fire({
              icon: mensajeParts[0],
              title: mensajeParts[1],
              text: mensajeParts[2],
            });
          },
          error: (error) => {
            console.error(error);
                this.isLoading = false;

          },
        });
      }
        }
      },
      error: (error) => {
        console.error(error);
        this.isLoading = false;

      },
    });
    } catch (error) {
      console.log('Modal cerrado');
      this.isLoading = false;

    }
  }

  //FUNCION QUE RECIBE EL CODIGO DE JIRA Y EL NOMBRE DE LA ACCION
  async updStatusTicket(
    P_SCODE_JIRA: string,
    P_SNAME_ACT: string,
    ticket: any
  ) {
    if(P_SNAME_ACT == 'ASIGNAR'){
        this.rentasService
        .EquivalenciaUsuario({ dni: this.NUSEDNI, token: '' })
        .subscribe({
          next: (response) => {
            if(response.numbermsg != 0){
              this.ErrorModal(80)
              return;
            }else{
      const data = {
        P_NTICKET: ticket.NTICKET,
        P_SNAME_ACT: P_SNAME_ACT,
        P_NIDPROFILE: this.NIDPROFILE,
      };
      this.rentasService.getValpopup(data).subscribe({
        next: (res: any) => {
          if (res.P_NCODE == 0) {
            this.popupData = res.C_TABLE[0].NPOP_UP;
            const dataupdate = {
              P_SCODE_JIRA: P_SCODE_JIRA,
              P_NUSERCODE: this.NUSERCODE,
              P_NIDPROFILE: this.NIDPROFILE,
              P_SNAME_ACT: P_SNAME_ACT,
              P_NTYPECOMMENT: 0,
              P_SCOMMETS: '',
            };

            if (this.popupData == 1) {
              this.rentasService.valStatusTicket(dataupdate).subscribe({
                next: (response) => {
                  if (response.P_NCODE == 0) {
                    this.confirmModal(dataupdate);
                  } else {
                    const mensajeParts: [SweetAlertIcon, string, string] =
                      this.separateString(response.P_SMESSAGE);
                    Swal.fire({
                      icon: mensajeParts[0],
                      title: mensajeParts[1],
                      text: mensajeParts[2],
                    });
                  }
                },
                error: (error) => {
                  console.error(error);
                },
              });
            } else {
              this.rentasService.valStatusTicket(dataupdate).subscribe({
                next: (response) => {
                  if (response.P_NCODE == 0) {
                    this.Comment(
                      ticket,
                      this.popupData,
                      P_SCODE_JIRA,
                      P_SNAME_ACT
                    );
                  } else {
                    const mensajeParts: [SweetAlertIcon, string, string] =
                      this.separateString(response.P_SMESSAGE);
                    Swal.fire({
                      icon: mensajeParts[0],
                      title: mensajeParts[1],
                      text: mensajeParts[2],
                    });
                  }
                },
                error: (error) => {
                  console.error(error);
                },
              });
            }
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
            }
          },
          error: (error) => {
            console.error(error);
            return;
          },
        });
    //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >    
    //}else if (P_SNAME_ACT == 'APROBAR') {
    }else if (P_SNAME_ACT == 'APROBAR' || (P_SNAME_ACT == 'DERIVAR' && ticket.NIDTECHNIQUE != 0 )) {    
    //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >    
      const data = {
        P_NTICKET: ticket.NTICKET,
        P_SNAME_ACT: P_SNAME_ACT,
        P_NIDPROFILE: this.NIDPROFILE,
      };
      this.rentasService.getValpopup(data).subscribe({
        next: (res: any) => {
          if (res.P_NCODE == 0) {
            this.popupData = res.C_TABLE[0].NPOP_UP;
            const dataupdate = {
              P_SCODE_JIRA: P_SCODE_JIRA,
              P_NUSERCODE: this.NUSERCODE,
              P_NIDPROFILE: this.NIDPROFILE,
              P_SNAME_ACT: P_SNAME_ACT,
              P_NTYPECOMMENT: 0,
              P_SCOMMETS: '',
            };

            if (this.popupData == 1) {
              this.rentasService.valStatusTicket(dataupdate).subscribe({
                next: (response) => {
                  if (response.P_NCODE == 0) {
                    this.confirmModal(dataupdate);
                  } else {
                    const mensajeParts: [SweetAlertIcon, string, string] =
                      this.separateString(response.P_SMESSAGE);
                    Swal.fire({
                      icon: mensajeParts[0],
                      title: mensajeParts[1],
                      text: mensajeParts[2],
                    });
                  }
                },
                error: (error) => {
                  console.error(error);
                },
              });
            } else {
              this.rentasService.valStatusTicket(dataupdate).subscribe({
                next: (response) => {
                  if (response.P_NCODE == 0) {
                    this.Comment(
                      ticket,
                      this.popupData,
                      P_SCODE_JIRA,
                      P_SNAME_ACT
                    );
                  } else {
                    const mensajeParts: [SweetAlertIcon, string, string] =
                      this.separateString(response.P_SMESSAGE);
                    Swal.fire({
                      icon: mensajeParts[0],
                      title: mensajeParts[1],
                      text: mensajeParts[2],
                    });
                  }
                },
                error: (error) => {
                  console.error(error);
                },
              });
            }
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
    }else{
      const data = {
        P_NTICKET: ticket.NTICKET,
        P_SNAME_ACT: P_SNAME_ACT,
        P_NIDPROFILE: this.NIDPROFILE,
      };
      this.rentasService.getValpopup(data).subscribe({
        next: (res: any) => {
          if (res.P_NCODE == 0) {
            this.popupData = res.C_TABLE[0].NPOP_UP;
            const dataupdate = {
              P_SCODE_JIRA: P_SCODE_JIRA,
              P_NUSERCODE: this.NUSERCODE,
              P_NIDPROFILE: this.NIDPROFILE,
              P_SNAME_ACT: P_SNAME_ACT,
              P_NTYPECOMMENT: 0,
              P_SCOMMETS: '',
            };

            if (this.popupData == 1) {
              this.rentasService.valStatusTicket(dataupdate).subscribe({
                next: (response) => {
                  if (response.P_NCODE == 0) {
                    this.confirmModal(dataupdate);
                  } else {
                    const mensajeParts: [SweetAlertIcon, string, string] =
                      this.separateString(response.P_SMESSAGE);
                    Swal.fire({
                      icon: mensajeParts[0],
                      title: mensajeParts[1],
                      text: mensajeParts[2],
                    });
                  }
                },
                error: (error) => {
                  console.error(error);
                },
              });
            } else {
              this.rentasService.valStatusTicket(dataupdate).subscribe({
                next: (response) => {
                  if (response.P_NCODE == 0) {
                    this.Comment(
                      ticket,
                      this.popupData,
                      P_SCODE_JIRA,
                      P_SNAME_ACT
                    );
                  } else {
                    const mensajeParts: [SweetAlertIcon, string, string] =
                      this.separateString(response.P_SMESSAGE);
                    Swal.fire({
                      icon: mensajeParts[0],
                      title: mensajeParts[1],
                      text: mensajeParts[2],
                    });
                  }
                },
                error: (error) => {
                  console.error(error);
                },
              });
            }
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
    }
  }

  insDataEmail(dataEmail) {
    const data = {
      P_NTICKET: dataEmail.P_NTICKET,
      P_SEMAIL_MESSAGE: dataEmail.P_SEMAIL_MESSAGE,
      P_SEMAIL_SUBJECT: dataEmail.P_SEMAIL_SUBJECT,
      P_SRECIPIENT_EMAIL: dataEmail.P_SRECIPIENT_EMAIL,
      P_NBRANCH: dataEmail.P_NBRANCH,
      P_NPRODUCT: dataEmail.P_NPRODUCT,
      P_NMOTIV: dataEmail.P_NMOTIV,
      P_NSUBMOTIV: dataEmail.P_NSUBMOTIV,
      P_NPOLICY: dataEmail.P_NPOLICY,
      P_NUSERCODE: this.NUSERCODE,
      P_NCOMMUNICATION_TYPE: dataEmail.P_NCOMMUNICATION_TYPE,
      P_STYPE_DEST: dataEmail.P_STYPE_DEST,
      P_SNAME_ACT: dataEmail.P_SNAME_ACT,
      P_NIDPROFILE: dataEmail.P_NIDPROFILE,
      P_SSENDER: JSON.parse(localStorage.getItem('currentUser')).email,
      P_NTRANSAC: this.P_NTRANSAC,
    };
    this.rentasService.insDataEmail(data).subscribe({
      next: (response) => {},
      error: (error) => {
        console.error(error);
      },
    });
  }

  //   getEmailUser() {
  //     this.rentasService.getEmailUser({ P_NUSERCODE: this.NUSERCODE }).subscribe({
  //       next: (response) => {
  //         this.emailUser = response.C_TABLE[0]?.SEMAIL;
  //       },
  //       error: (error) => {
  //         console.error(error);
  //       },
  //     });
  //   }

  //FUNCION QUE SE LLAMA AL PRECIONAR EL BOTON CALCULAR
  async calcular(ticket: any) {
    this.isLoading = true;
    //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
     //REALIZA LA VALIDACION DE FECHA DE SOLICITUD
     const dataValFS = {
             P_NTICKET: ticket.NTICKET,
             P_NUSERCODE: this.NUSERCODE
           };
     this.rentasService.valDateRequest(dataValFS).subscribe({
     next: (response) => {
         if (response.P_NCODE !== 0) {
         this.isLoading = false;
         const mensajeParts: [SweetAlertIcon, string, string] = this.separateString(response.P_SMESSAGE);
         Swal.fire({
             icon: mensajeParts[0],
             title: mensajeParts[1],
             text: mensajeParts[2],
         });
       return;
     }else {
     //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >

    const dataVal = {
      P_NTICKET: ticket.NTICKET,
    };
    this.rentasService.valAmountTicket(dataVal).subscribe({
      next: (response) => {
        if (response.P_NCODE == 0) {
          const data = {
            ramo: '',
            cod_producto: ticket.cod_producto,
            poliza: ticket.POLIZA,
            cod_submotivo: ticket.NSUBMOTIV,
            num_documento: '',
            cod_tipodocumento: '',

            //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
            //FECHA_RECEPCION: ticket.FECHA_RECEPCION,
            FECHA_RECEPCION: ticket.FECHA_SOLICITUD,
            prc_anticipo: ticket.POR_ANTICIPO
            //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
          };
          //SERVICIO QUE RETORNA EL IMPORTE Y LA MONEDA
          this.rentasService.getCalculationAmount(data).subscribe({
            next: (response) => {
              if (response.numbermsg == 0) {
                if (response.data[0].NOPAGADAS !== null && response.data[0].NOPAGADASFUTURAS !== null ||response.data[0].VALRENTASPENDIENTES !== null && response.data[0].VALRENTASFUTURAS !== null) {
                  this.rentasService
                    .updTicketPensions({
                      P_NTICKET: ticket.NTICKET,
                      //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
                      //P_NNOPAY_PENSIONS: response.data[0].NOPAGADAS || response.data[0].VALRENTASPENDIENTES,
                      P_NNOPAY_PENSIONS: response.data[0].NOPAGADAS || response.data[0].VALRENTASPENDIENTES || response.data[0].MTO_PENSION,
                      //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
                      P_FUTURENOPAY_PENSIONS: response.data[0].NOPAGADASFUTURAS || response.data[0].VALRENTASFUTURAS

                    })
                    .subscribe({
                      next: (response) => {
                        console.error(response);
                      },
                      error: (error) => {
                        console.error(error);
                        this.isLoading = false;
                      },
                    });
                }

                if(response.data[0].MTO_RESCATE !== ticket.MTO_RESCATE || response.data[0].COD_MONEDA !== ticket.COD_MONEDA){
                    this.rentasService.delTicketCotizaDet({P_NTICKET: ticket.NTICKET,P_NUSERCODE: this.NUSERCODE}).subscribe({
                        next: (response) => {
                          },
                          error: (error) => {
                            console.error(error);
                            this.isLoading = false;
                          },
                    })
                  }


                const data2 = {
                  P_NTICKET: ticket.NTICKET,
                  P_IMPORTE:
                    //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
                    //response.data[0].MTO_RESCATE || response.data[0].TOTAL || response.data[0].MTO_DEVOLUCION || response.data[0].MTO_TOTAL,
                    response.data[0].MTO_RESCATE || response.data[0].TOTAL || response.data[0].MTO_DEVOLUCION || response.data[0].MTO_TOTAL||response.data[0].MTO_ANTICIPO,
                   //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
                  P_MONEDA:
                    response.data[0].COD_MONEDA || response.data[0].MONEDA,
                };
                //SERVICIO QUE ACTUALIZA EL IMPORTE Y LA MONEDA DEL TICKET
                this.rentasService.updAmountTicket(data2).subscribe({
                  next: (response) => {
                    const mensajeParts: [SweetAlertIcon, string, string] =
                      this.separateString(response.P_SMESSAGE);
                    Swal.fire({
                      icon: mensajeParts[0],
                      title: mensajeParts[1],
                      text: mensajeParts[2],
                    });
                    this.isLoading = false;
                  },
                  error: (error) => {
                    console.error(error);
                    this.isLoading = false;
                  },
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Ups',
                  text: response.msg,
                });
                const data2 = {
                    P_NTICKET: ticket.NTICKET,
                    P_IMPORTE:
                      0,
                    P_MONEDA:
                      ""
                  };
                this.rentasService.updAmountTicket(data2).subscribe({
                    next: (response) => {
                      const mensajeParts: [SweetAlertIcon, string, string] =
                        this.separateString(response.P_SMESSAGE);
                      this.isLoading = false;
                    },
                    error: (error) => {
                      console.error(error);
                      this.isLoading = false;
                    },
                  });
                this.isLoading = false;
              }
            },
            error: (error) => {
              console.error(error);
              this.isLoading = false;
            },
          });
        } else {
          const mensajeParts: [SweetAlertIcon, string, string] =
            this.separateString(response.P_SMESSAGE);
          Swal.fire({
            icon: mensajeParts[0],
            title: mensajeParts[1],
            text: mensajeParts[2],
          });
          this.isLoading = false;
        }
      },
   error: (error) => {
        console.error(error);
        this.isLoading = false;
      },
    });
      //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
    }
  },
  error: (error) => {
    console.error(error);
    this.isLoading = false;
  },
});
    //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
  }

  saveFilters() {
    localStorage.setItem('P_DATEINI', JSON.stringify(this.inputs.P_DATEINI));
    localStorage.setItem('P_DATEEND', JSON.stringify(this.inputs.P_DATEEND));
    localStorage.setItem(
      'P_NPRODUCT',
      JSON.stringify(this.inputs.P_NPRODUCT?.codigo)
    );
    localStorage.setItem('P_NPOLICY', JSON.stringify(this.inputs.P_NPOLICY));
    localStorage.setItem(
      'P_NMOTIVO',
      JSON.stringify(this.inputs.P_NMOTIVO?.codigo)
    );
    localStorage.setItem(
      'P_SSUBMOTIVO',
      JSON.stringify(this.inputs.P_SSUBMOTIVO?.codigo)
    );
    localStorage.setItem(
      'P_SCODE_JIRA',
      JSON.stringify(this.inputs.P_SCODE_JIRA)
    );
    localStorage.setItem('P_SCUSPP', JSON.stringify(this.inputs.P_SCUSPP));
    localStorage.setItem(
      'P_NSTATE',
      JSON.stringify(this.inputs.P_NSTATE?.codigo)
    );
    localStorage.setItem('SCLIENAME', JSON.stringify(this.client.SCLIENAME));
    localStorage.setItem('P_SCLIENT', JSON.stringify(this.client.SCLIENT));
    localStorage.setItem(
      'P_NUSERCODE_RE',
      JSON.stringify(this.inputs.P_NUSERCODE_RE.codigo)
    );
  }

  // Método para cargar los filtros desde localStorage
  loadFilters() {
    this.isLoading = true;

    const localStorageKeys = [
      'P_DATEINI',
      'P_DATEEND',
      'P_NPRODUCT',
      'P_NPOLICY',
      'P_NMOTIVO',
      'P_SSUBMOTIVO',
      'P_SCODE_JIRA',
      'P_SCUSPP',
      'P_NSTATE',
      'SCLIENAME',
      'P_SCLIENT',
      'P_NUSERCODE_RE',
    ];

    // Obtener y eliminar los valores del localStorage
    const localStorageValues = {};
    localStorageKeys.forEach((key) => {
      localStorageValues[key] = localStorage.getItem(key);
      localStorage.removeItem(key);
    });

    // Asignación de valores a propiedades, verificando si son undefined
    this.inputs.P_DATEINI =
      localStorageValues['P_DATEINI'] == 'undefined'
        ? undefined
        : new Date(JSON.parse(localStorageValues['P_DATEINI']));
    this.inputs.P_DATEEND =
      localStorageValues['P_DATEEND'] == 'undefined'
        ? undefined
        : new Date(JSON.parse(localStorageValues['P_DATEEND']));
    this.inputs.P_NPOLICY =
      localStorageValues['P_NPOLICY'] != 'undefined'
        ? JSON.parse(localStorageValues['P_NPOLICY'] || 'null')
        : undefined;
    this.inputs.P_SCODE_JIRA =
      localStorageValues['P_SCODE_JIRA'] != 'undefined'
        ? JSON.parse(localStorageValues['P_SCODE_JIRA'] || '""')
        : '';
    this.inputs.P_SCUSPP =
      localStorageValues['P_SCUSPP'] != 'undefined'
        ? JSON.parse(localStorageValues['P_SCUSPP'] || '""')
        : '';

    this.client.SCLIENAME =
      localStorageValues['SCLIENAME'] != 'undefined'
        ? JSON.parse(localStorageValues['SCLIENAME'] || '""')
        : '';
    this.client.SCLIENT =
      localStorageValues['P_SCLIENT'] != 'undefined'
        ? JSON.parse(localStorageValues['P_SCLIENT'] || '""')
        : '';
    this.inputs.P_NSTATE.codigo = JSON.parse(localStorageValues['P_NSTATE']);
    if (
      localStorageValues['P_NMOTIVO'] !== '""' &&
      localStorageValues['P_NMOTIVO'] !== undefined
    ) {
      this.inputs.P_NMOTIVO = {
        codigo: JSON.parse(localStorageValues['P_NMOTIVO']),
      };
      this.getSubMotivos(JSON.parse(localStorageValues['P_NMOTIVO']));
    }
    if (localStorageValues['P_SSUBMOTIVO'] !== '""') {
      this.inputs.P_SSUBMOTIVO = this.inputs.P_SSUBMOTIVO || {};
      this.inputs.P_SSUBMOTIVO.codigo =
        localStorageValues['P_SSUBMOTIVO'] == ''
          ? 0
          : JSON.parse(localStorageValues['P_SSUBMOTIVO']);
    }
    if (
      localStorageValues['P_NPRODUCT'] !== '""' &&
      localStorageValues['P_NPRODUCT'] !== undefined
    ) {
      this.inputs.P_NPRODUCT = {
        codigo: JSON.parse(localStorageValues['P_NPRODUCT']),
      };
      const codigo = this.inputs.P_NPRODUCT?.codigo.split('-');
      this.branch = codigo[0];
      this.product = codigo[1];
    }

    if (
      localStorageValues['P_NUSERCODE_RE'] !== '""' &&
      localStorageValues['P_NUSERCODE_RE'] !== undefined
    ) {
      this.inputs.P_NUSERCODE_RE = {
        codigo: JSON.parse(localStorageValues['P_NUSERCODE_RE']),
      };
    }

    // Construcción de los filtros
    if (this.client.SCLIENT) {
      this.filters = {
        P_DATEINI: this.inputs.P_DATEINI,
        P_DATEEND: this.inputs.P_DATEEND,
        P_NBRANCH: 0,
        P_NPRODUCT: 0,
        P_NPOLICY: 0,
        P_NMOTIVO: 0,
        P_SSUBMOTIVO: 0,
        P_SCODE_JIRA: '',
        P_SCUSPP: '',
        P_NSTATE: this.inputs.P_NSTATE.codigo,
        P_SCLIENT: this.client.SCLIENT,
        P_NUSERCODE_RE: 0,
      };
    } else {
      this.filters = {
        P_DATEINI: this.inputs.P_DATEINI,
        P_DATEEND: this.inputs.P_DATEEND,
        P_NBRANCH: this.branch,
        P_NPRODUCT: this.product,
        P_NPOLICY: this.inputs.P_NPOLICY,
        P_NMOTIVO: this.inputs.P_NMOTIVO?.codigo,
        P_SSUBMOTIVO: this.inputs.P_SSUBMOTIVO?.codigo,
        P_SCODE_JIRA: this.inputs.P_SCODE_JIRA,
        P_SCUSPP: this.inputs.P_SCUSPP,
        P_NSTATE: this.inputs.P_NSTATE.codigo,
        P_SCLIENT: this.client.SCLIENT,
        P_NUSERCODE_RE: this.inputs.P_NUSERCODE_RE?.codigo,

      };
    }

    // Obtener tickets y mostrar paginación
    this.getTickets(this.filters);
    this.showPagination = true;
  }

  parseDate(dateString: string): Date | undefined {
    if (dateString && dateString !== 'undefined') {
      return new Date(JSON.parse(dateString));
    }
    return undefined;
  }

  ngOnDestroy() {
    this.saveFilters();
  }

  openDetails(SCODE: any) {
    this.saveFilters();
    this.router.navigate([
      `/extranet/devoluciones-odinarias-rentas-detalle/${SCODE}`,
    ]);
  }

  async getMessage(nerror: number): Promise<string> {
    const data = {
      P_NERRORNUM: nerror,
    };
    try {
      const res = await this.rentasService.getMessage(data).toPromise();
      return res.C_TABLE[0].SMESSAGE;
    } catch (error) {
      console.error(error);
      return 'Error al obtener el mensaje';
    }
  }

  separateString(input: string): [SweetAlertIcon, string, string] {
    const delimiter = '||';
    const parts = input.split(delimiter);

    if (parts.length !== 3) {
      throw new Error(
        'El código de mensaje no se ha encontrado. Por favor, contacte con el área de TI.'
      );
    }

    const validIcons: SweetAlertIcon[] = [
      'success',
      'error',
      'warning',
      'info',
      'question',
    ];
    if (!validIcons.includes(parts[0] as SweetAlertIcon)) {
      throw new Error(
        'Icono no válido. Por favor, contacte con el área de TI.'
      );
    }
    return [parts[0] as SweetAlertIcon, parts[1], parts[2]];
  }

  getNotificationIcon(SALERT): string {
    return SALERT ? SALERT.split('||')[0] : '';
  }
  getNotificationText(SALERT): string {
    return SALERT ? SALERT.split('||')[1] : '';
  }

  ColorActions: any = [];
  getColorActions() {
    const data = {
      P_NUSERCODE: this.NUSERCODE,
      P_NPRODUCT: this.productCanal,
      P_NIDPROFILE: this.NIDPROFILE,
    };
    this.rentasService.getColorActions(data).subscribe({
      next: (response) => {
        this.ColorActions = response.C_TABLE[0];
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}