import { Component, OnInit, Injectable, Type } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import swal from 'sweetalert2';

import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AtpReportService } from '../../../services/atp-reports/atp-report.service';
import { PlanesAsistenciasService } from '../../../services/maintenance/planes-asistencias/planes-asistencias.service';
import { LoadMassiveService } from '../../../services/LoadMassive/load-massive.service';
import { MantenimientoPlanAsistModalConfigComponent} from './modal-config/modal-config.component'
import { FormControl, FormGroup, Validator } from '@angular/forms';//INI <RQ2024-57 - 03/04/2024>  
import { FormBuilder, Validators, } from '@angular/forms';//INI <RQ2024-57 - 03/04/2024>  
import moment from 'moment';//INI <RQ2024-57 - 03/04/2024> 
import { GlobalValidators } from '../../global-validators';
import { CommonMethods } from '../../common-methods';
// import { THIS_EXPR, isNull } from '@angular/compiler/src/output/output_ast';
import { NgxSpinnerService } from 'ngx-spinner';
import { formatDate } from '@angular/common';
import { parseDate } from 'ngx-bootstrap/chronos';

@Component({
    selector: 'app-mantenimiento-planes-asistencias',
    templateUrl: './mantenimiento-planes-asistencias.component.html',
    styleUrls: ['./mantenimiento-planes-asistencias.component.css']
})
export class MantenimientoPlanAsistComponent implements OnInit {
    planesAsistenciasResults: any[] = [];
    planesAsistenciasResultsHeader: any[] = [];


    hayNMODULO:boolean;
    hayDINIVIG:boolean;
    hayDFINVIG:boolean;
    haySESTADO:boolean;
    
    hayNINIVIG:boolean;
    hayNFINVIG:boolean;
    hayNTASACLIENTE:boolean;
    hayNTASACOMPANIA:boolean;
    hayNMINCREDITO:boolean;
    hayNMAXCREDITO:boolean;
    hayNPORCENTAJECANAL:boolean;
    hayNPORCENTAJEBROKER:boolean;
    hayNMONTOCANAL:boolean;
    hayNMONTOBROKER:boolean;
    hayNAGE_MIN:boolean;
    hayNAGE_MAX:boolean;
    hayNANIOINI:boolean;
    hayNSUMAASEG:boolean;
    hayNEDADMIN:boolean;
    hayNEDADMAX:boolean;
    hayNROL:boolean;


    planesAsistenciasPolizaResults: any[] = [];
    listToShow: any = [];
    //CheckBox
    UnselectedItemMessage: any = '';
    StartDateSelected: any = '';
    NBranchSelected: any = '';
    EndDateSelected: any = '';
    branchTypeList: any[] = [];
    busquedaTypeList: any[] = [];//INI <RQ2024-57 - 03/04/2024>
    idRamo: number;
    idBusqueda: number; //INI <RQ2024-57 - 03/04/2024>
    idProducto: any = '';
    branch: any = '';
    listProduct: any = [];
    listProduct2: any = []; //INI <RQ2024-57 - 03/04/2024>
    listPlan: any = [];
    listRamo: any = [];
    listTipoPlan: any[] = [];
    NPOLIZA: number;

    SelectedBranchId:any = '';
    SelectedProductoId:any = '';
    SelectedTipBusquedaId:any = ''; //INI <RQ2024-57 - 03/04/2024>
    mSelectedBranchId:any = '';//INI <RQ2024-57 - 03/04/2024>
    mSelectedProductoId:any = '';//INI <RQ2024-57 - 03/04/2024>
    SelectedPlanId:any = '';

    isError: boolean = false;
    bhabilitar: boolean;
    //Pantalla de carga
    isLoading: boolean = false;
    //Fechas
    bsConfig: Partial<BsDatepickerConfig>;
    bsValueIni: Date = new Date();
    bsValueFin: Date = new Date();
    bsValueFinMax: Date = new Date();
    // data: ReportAtpSearch = new ReportAtpSearch();

    bloqueadoPlan: boolean = true; //INI <RQ2024-57 - 03/04/2024>
    mbhabilitar: boolean = false; //INI <RQ2024-57 - 03/04/2024>
    NporCli: any = ''; //INI <RQ2024-57 - 03/04/2024>
    NporCam: any = ''; //INI <RQ2024-57 - 03/04/2024>
    sServicio: any = ''; //INI <RQ2024-57 - 03/04/2024>
    mlistRoles: any[] = [];//INI <RQ2024-57 - 03/04/2024>
    mlistDiv: any[] = [];//INI <RQ2024-57 - 03/04/2024>
    mlistServicio: any[] = [];//INI <RQ2024-57 - 03/04/2024>
    mlistValores: any = [];//INI <RQ2024-57 - 03/04/2024>
    NRol: any = '';//INI <RQ2024-57 - 03/04/2024>
    Norden: any = '';//INI <RQ2024-57 - 03/04/2024>
    NfacDiv: any = '';//INI <RQ2024-57 - 03/04/2024>
    mselectedServicioId: any = '';//INI <RQ2024-57 - 03/04/2024>
    NcreMax: any = '';//INI <RQ2024-57 - 03/04/2024>
    ModuloId: any = '';//INI <RQ2024-57 - 03/04/2024>
    NcreMin: any = '';//INI <RQ2024-57 - 03/04/2024>
    nconfigs: number = 0;//INI <RQ2024-57 - 03/04/2024>
    DINIVIG: any = '';//INI <RQ2024-57 - 03/04/2024>
    DFINVIG: any = '';//INI <RQ2024-57 - 03/04/2024>
    DINIVIGE: any = '';//INI <RQ2024-57 - 03/04/2024>
    DFINVIGE: any = '';//INI <RQ2024-57 - 03/04/2024>
    diaActual = moment(new Date()).toDate();//INI <RQ2024-57 - 03/04/2024>
    disRamo: boolean = true;
    disProducto: boolean = true;
    disPoliza: boolean = true;
    disModulo: boolean = true;
    disRol: boolean = true;
    disDINIVIGE: boolean = true;
    disPorCli: boolean = false;
    disPorCam: boolean = false;
    disCreMin: boolean = false;
    disCreMax: boolean = false;
    disFacDiv: boolean = false;
    disGuardar: boolean = false;
    disEditar: boolean = false;
    disVer: boolean = false;

    filterForm = new FormGroup({//INI <RQ2024-57 - 03/04/2024>
        startDate: new FormControl(''),
        endDate: new FormControl('')
    });

    inputsTasa: any = {};
    
    
    

    public maxSize = 5; // cantidad de paginas que se mostrarán en el html del paginado
    public totalItems = 0; //total de items encontrados
    public foundResults: any = [];  //Lista de registros encontrados durante la búsqueda
    genericErrorMessage = 'Ha ocurrido un error inesperado. Por favor contáctese con soporte.'; //Mensaje de error genérico
    notfoundMessage: string = 'No se encontraron registros';

    //Formato de la fecha
    constructor(
        private AtpReportService: AtpReportService,
        private MassiveService: LoadMassiveService,
        private PlanesAsistenciasService: PlanesAsistenciasService,
        private modalService: NgbModal,
        private formBuilder: FormBuilder,//INI <RQ2024-57 - 03/04/2024>
        private readonly spinner: NgxSpinnerService //INI <RQ2024-57 - 03/04/2024>
    ) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: "DD/MM/YYYY",
                locale: "es",
                showWeekNumbers: false
            }
        );
    }

    //Funciones que se ejecutarán tras la compilación
    ngOnInit() {
        //this.bsValueIni = new Date(this.bsValueIni.getFullYear(), this.bsValueIni.getMonth(), 1);
        this.getBranchList();
        this.getTipBusquedaList();//INI <RQ2024-57 - 03/04/2024>
        this.inputsTasa.SelectedPlanId = '';
    }


    getProductsListByBranch(idRamo: any) {
        this.PlanesAsistenciasService.GetProductsList(idRamo).subscribe(
          (res) => {
            this.listProduct = res;
          },
                (err) => { }
        );
      }
      getBranchList() {
        this.PlanesAsistenciasService.GetBranchList().subscribe(
          (res) => {
            this.branchTypeList = res;
          },
                (err) => { }
        );
      }

      //INI <RQ2024-57 - 03/04/2024>
      getTipBusquedaList() {
        this.PlanesAsistenciasService.GetTipBusquedaList().subscribe(
          (res) => {
            this.busquedaTypeList = res;
            this.SelectedTipBusquedaId = this.busquedaTypeList[0].Id;
          },
                (err) => { }
        );
      }

      ChangeTipBusqueda() {console.log(this.idBusqueda);console.log(this.SelectedTipBusquedaId);
        this.idBusqueda=this.SelectedTipBusquedaId;
        console.log('idBusqueda: ' + this.idBusqueda)
        if (this.idBusqueda == 1) {//desde la bd se envia 0:todos, 1 planes, 2 tasa
            this.bloqueadoPlan = false;
        }else{
            this.bloqueadoPlan = true;
            this.SelectedPlanId = '';
        }

      }
      //FIN <RQ2024-57 - 03/04/2024>
    
      ChangeRamo() {console.log(this.idRamo);console.log(this.SelectedBranchId);
        this.idRamo=this.SelectedBranchId;
        if (this.idRamo !== null) {
          this.getProductsListByBranch(this.idRamo);
        }
      }
      ChangeProducto() {console.log(this.idRamo);console.log(this.SelectedProductoId);
        this.idProducto=this.SelectedProductoId;
        if (this.idProducto !== '') {
          this.getProductsListByBranch(this.idProducto);
        }
      }
      ProcessHabilitar(item:any){
        console.log('ProcessHabilitar');
        if(this.bhabilitar!=null){
            swal.fire({
                title: "Información",
                text: "Se "+(this.bhabilitar?"habilitará":"inhabilitará")+" el cálculo para la configuración plan - asistencia  "+this.NPOLIZA,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.value) {
                    this.isLoading = true;
                    let data: any = {};
                    if(this.bhabilitar!=null && this.bhabilitar!=undefined){
                        if(this.bhabilitar){
                            this.PlanesAsistenciasService.Habilitar(item.NPOLICY,item.NORDEN).subscribe(
                              (res) => {
                                    if(res[0].Id==0){
                                      this.bhabilitar=false;
                                    }
                                },
                                (err) => {
                                }
                            );
                        }
                        else{
                            this.PlanesAsistenciasService.Inhabilitar(item.NPOLICY,item.NORDEN).subscribe(
                              (res) => {
                                    if(res[0].Id==0){
                                      this.bhabilitar=true;
                                    }
                                },
                                (err) => {
                                }
                            );
                        }
                        this.isLoading = false;
                    }
                }
            });
        }
      }
      openModal(tipo:number,ntipo:number,ngrupo:number,item:any) {
        let modalRef: NgbModalRef;
        modalRef = this.modalService.open(MantenimientoPlanAsistModalConfigComponent, { size: 'lg', windowClass: 'modalCustom', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.NPOLIZA= this.NPOLIZA!==undefined && this.NPOLIZA!=0?this.NPOLIZA:null;
        modalRef.componentInstance.NRAMO= this.SelectedBranchId!==undefined && this.SelectedBranchId!=0?this.SelectedBranchId:null;
        modalRef.componentInstance.NPRODUCT= this.SelectedProductoId!==undefined && this.SelectedProductoId!=0?this.SelectedProductoId:null;
        if(tipo==2){
          modalRef.componentInstance.NPLAN=ntipo;//nplan
          modalRef.componentInstance.NPOLIZA= this.NPOLIZA!==undefined && this.NPOLIZA!=0 ?this.NPOLIZA : item.NPOLIZA ;
          modalRef.componentInstance.NRAMO= this.SelectedBranchId!==undefined && this.SelectedBranchId!=0 ? this.SelectedBranchId : item.NBRANCH ;
          modalRef.componentInstance.NPRODUCT= this.SelectedProductoId!==undefined && this.SelectedProductoId!=0 ?this.SelectedProductoId :item.NPRODUCT;
        }else if(tipo!=0){
            modalRef.componentInstance.NTIPO= ntipo;
            modalRef.componentInstance.NGRUPO= ngrupo;
            modalRef.componentInstance.GCONFIG=item;
            modalRef.componentInstance.NRAMO= item.NBRANCH;
            modalRef.componentInstance.NPRODUCT= item.NPRODUCT;
        }
        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.nTipoVentana= tipo;
        //modalRef.componentInstance.itemTransaccionList = this.policyList;
        //modalRef.componentInstance.cotizacionID = cotizacionID;
      }
      ProcessRegistrar(){
        this.openModal(0,0,0,null);
      }
      Ver(item:any,content0){
        if (item.NTYPEPLAN == 0){
            console.log('editar con tasa: '+item.NTYPEPLAN+' ramo:'+item.SBRANCH+' producto: '+item.NPRODUCT+' orden: '+ item.NORDEN)
            
            let data: any = {
                nBranch: parseInt(item.NBRANCH),
                nProduct: parseInt(item.NPRODUCT),
                nPolicy: item.NPOLICY,
                nModulo: item.NMODULO,
                nRol: item.NROL,
                nOrden: item.NORDEN
            };

            this.PlanesAsistenciasService.getEdiTasaPol(data).subscribe(
                (res) => {
                    if (res.Id == 0) {
                        
                        this.modalService.open(content0, {
                            size: 'xl',
                            backdropClass: 'light-blue-backdrop',
                            backdrop: 'static',
                            keyboard: false,
                        });
                        console.log('respuesta de la bd: ')
                        console.log(res)

                        this.getBranchList();
                        this.getProductsListByBranch(item.NBRANCH);
                        this.mSelectedBranchId = item.NBRANCH;
                        this.ChangeRamo2();

                       // this.GetCoverAdicional(this.SelectedBranchId, this.SelectedProductoId);
                        this.getRolesListTasa();
                        this.getDivisorList();
                        
                        this.mSelectedProductoId = item.NPRODUCT;
                        this.NPOLIZA = item.NPOLICY;
                        this.ModuloId = res.NMODULO;
                        this.NporCli = res.NTASACLIENTE;
                        this.NporCam = res.NTASACOMPANIA;
                        this.DINIVIGE = this.formatDate(res.DINIVIG);
                        this.DFINVIGE = this.formatDate(res.DFINVIG);
                        this.NcreMin = res.NMINCREDITO;
                        this.NcreMax = res.NMAXCREDITO;
                        this.NRol = res.NROL;
                        this.Norden = res.NORDEN;
                        this.NfacDiv = res.NTYPE_DIVISOR;

                        this.filterForm.get('startDate').disable();
                        this.filterForm.get('endDate').disable();

                        this.disPorCli = true;
                        this.disPorCam = true;
                        this.disCreMin = true;
                        this.disCreMax = true;
                        this.disFacDiv = true;
                        this.disGuardar = false;
                        this.disEditar = false;
                        this.disVer = true;

                    } else {
                        swal.fire('Información', res.Description, 'warning');
                    }
                },
                (err) => { }
            );
        }else { 
            this.openModal(2,item.NTYPEPLAN,0,item);
            this.listToShow = []; 
        }
      }
      Editar(modulo:number,item:any,content0){//INI <RQ2024-57 - 03/04/2024>
        if (item.NTYPEPLAN == 0){
            console.log('editar con tasa: '+item.NTYPEPLAN+' ramo:'+item.SBRANCH+' producto: '+item.NPRODUCT+' orden: '+ item.NORDEN)
            
            let data: any = {
                nBranch: parseInt(item.NBRANCH),
                nProduct: parseInt(item.NPRODUCT),
                nPolicy: item.NPOLICY,
                nModulo: item.NMODULO,
                nRol: item.NROL,
                nOrden: item.NORDEN
            };

            this.PlanesAsistenciasService.getEdiTasaPol(data).subscribe(
                (res) => {
                    if (res.Id == 0) {
                        
                        this.modalService.open(content0, {
                            size: 'xl',
                            backdropClass: 'light-blue-backdrop',
                            backdrop: 'static',
                            keyboard: false,
                        });
                        console.log('respuesta de la bd: ')
                        console.log(res)

                        this.getBranchList();
                        this.getProductsListByBranch(item.NBRANCH);
                        this.mSelectedBranchId = item.NBRANCH;
                        this.ChangeRamo2();

                       // this.GetCoverAdicional(this.SelectedBranchId, this.SelectedProductoId);
                        this.getRolesListTasa();
                        this.getDivisorList();
                        
                        this.mSelectedProductoId = item.NPRODUCT;
                        this.NPOLIZA = item.NPOLICY;
                        this.ModuloId = res.NMODULO;
                        this.NporCli = res.NTASACLIENTE;
                        this.NporCam = res.NTASACOMPANIA;
                        this.DINIVIGE = this.formatDate(res.DINIVIG);
                        this.DFINVIGE = this.formatDate(res.DFINVIG);
                        this.NcreMin = res.NMINCREDITO;
                        this.NcreMax = res.NMAXCREDITO;
                        this.NRol = res.NROL;
                        this.Norden = res.NORDEN;
                        this.NfacDiv = res.NTYPE_DIVISOR;

                        this.filterForm.get('startDate').disable();
                        this.filterForm.get('endDate').enable();

                        this.disPorCli = false;
                        this.disPorCam = false;
                        this.disCreMin = false;
                        this.disCreMax = false;
                        this.disFacDiv = false;
                        this.disGuardar = true;
                        this.disEditar = true;
                        this.disVer = false;
                    } else {
                        swal.fire('Información', res.Description, 'warning');
      }
                },
                (err) => { }
            );
        }else { 
            this.openModal(1,modulo,0,item);
            this.listToShow = []; 
        }
        
      }

      formatDate(dateString: string): string {
        if (dateString == "") {
            return "";
        }

        if (dateString == "0001-01-01T00:00:00") {
            return "";
        }

         if (dateString == "01/01/0001 12:00:00 a. m.") {
            return "";
        }

        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1; // Los meses son base 0 en JavaScript
        const year = date.getFullYear();
      
        // Aseguramos que el día y el mes tengan dos dígitos
        const dayStr = day < 10 ? '0' + day : day.toString();
        const monthStr = month < 10 ? '0' + month : month.toString();
      
        return `${dayStr}/${monthStr}/${year}`;
      }
      
    //Función de busqueda
      ProcessBuscar(){
        console.log('ProcessBuscar');
        if(!(this.SelectedBranchId===null || this.SelectedBranchId===undefined || this.SelectedProductoId===null || this.SelectedProductoId===undefined || this.NPOLIZA===null || this.NPOLIZA===undefined || this.NPOLIZA==0))
        {
            this.listToShow = [];        
        this.isLoading = true;
        let data: any = {
                            nBranch:this.SelectedBranchId, 
                            nProduct:this.SelectedProductoId, 
                            nPolicy:this.NPOLIZA, 
                            ntipBusqueda:this.SelectedTipBusquedaId, //INI <RQ2024-57 - 03/04/2024>
                            nPlan:this.SelectedPlanId=='-'?null:this.SelectedPlanId
                        };

        console.log(data);
        this.PlanesAsistenciasService.GetPlanesAsistenciasXPoliza(data).subscribe(
            (res) => 
                {
                this.foundResults = res;

                console.log(this.foundResults);
                if (this.foundResults != null && this.foundResults.length > 0) {
                    this.planesAsistenciasResults = res;
                    this.totalItems = this.planesAsistenciasResults.length;
                    console.log(this.planesAsistenciasResults);

                    this.listToShow = this.planesAsistenciasResults;
                    this.bhabilitar=this.haySESTADO;
                }else{
                  this.bhabilitar=null;
                  this.planesAsistenciasResults=[];
                  let datab: any = {
                                      nBranch:this.SelectedBranchId, 
                                      nProduct:this.SelectedProductoId, 
                                      nPolicy:this.NPOLIZA
                                  };
                  this.PlanesAsistenciasService.ValidaPoliza(datab).subscribe(
                    res => {
                      this.planesAsistenciasPolizaResults=res;
                      console.log(this.planesAsistenciasPolizaResults);
                      if(this.planesAsistenciasPolizaResults.length==0){
                        swal.fire('Error', 'Póliza no existe', 'error');
                      }else{
                         swal.fire('Error', 'La póliza ingresada no esta asociada al tipo de busqueda ingresada', 'error');
                      }
                      this.isLoading = false;

                    },
                    error => {
                        this.foundResults = [];
                        this.totalItems = 0;
                        this.isLoading = false;
                        swal.fire('Información', this.genericErrorMessage, 'error');
                    }
                  )
                }
                this.isLoading = false;
            },
            (err) => {
                console.log("failed");
                this.bhabilitar=null;
                this.planesAsistenciasResults=[];
                
                this.foundResults = [];
                this.totalItems = 0;
                this.isLoading = false;
                swal.fire('Información', this.genericErrorMessage, 'error');
            }
        );
      }else{
        swal.fire('Información', "Llenar correctamente los filtros", 'error');
      }
    }

    onPaste(event: any, typeText:string, longitud: number):any {
      const inputElement = event.target as HTMLInputElement;
      const startPosition = inputElement.selectionStart;
      const endPosition = inputElement.selectionEnd;
          
      console.log('Start position:', startPosition);
      console.log('End position:', endPosition);
      let regextext='[0-9]'
      event.preventDefault();
      let pastetext = (event.clipboardData).getData("text");
      let valorNuevo;
      let valorActual=event.target.value;
      const position = event.target.selectionStart;
      const inputChar = String.fromCharCode(event.charCode);
      if(typeText=='1')
        regextext='^([0-9]{0,'+longitud+'})?$';
      else if(typeText=='2')
        regextext='^([0-9A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü]{0,'+longitud+'})?$';
      else if(typeText=='3')
        regextext='^([0-9A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü ]{0,'+longitud+'})?$';
        else if(typeText=='4')
        regextext='^([a-zA-ZñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü0-9-,:()&$#\'. ]{0,'+longitud+'})?$';
        else if(typeText=='5')
        regextext='^([A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü ]{0,'+longitud+'})?$';
        else if(typeText=='6')
        regextext='^([0-9A-Za-z._@-]{0,'+longitud+'})?$';
        else if(typeText=='7')
        regextext='^([0-9bfBF-]{0,'+longitud+'})?$';
        else if(typeText=='8')
        regextext='^([0-9]{0,'+longitud+'})?(.{1}[0-9]{0,6})?$';
      
        if(position!=0){
          if(startPosition!=endPosition){
            if(startPosition!=0){
              valorNuevo=valorActual.substring(0, startPosition ) + pastetext + valorActual.substring(endPosition , valorActual.length);
            }else{
              console.log("valorActual.substring(endPosition, valorActual.length):"+valorActual.substring(endPosition, valorActual.length));
              console.log("valorActual.length:"+valorActual.length);
              console.log("pastetext:"+pastetext);
              
              valorNuevo=''+pastetext + valorActual.substring(endPosition, valorActual.length);
            }
          }else{
            if(pastetext=='0' && position==0){
              return valorActual;
            }else{
              if(longitud<valorActual.length){
                //event.target.value=valorActual;
                console.log("valorActual:"+valorActual);return valorActual;
              }
              valorNuevo=valorActual.substring(0, position ) + pastetext + valorActual.substring(position , valorActual.length);
            }
          }
        }else{
          if(valorActual.length==endPosition){
            valorNuevo=pastetext;
          }
          else{
            valorNuevo=pastetext + valorActual.substring(endPosition , valorActual.length);
          }
        }
        let patron=RegExp(regextext);
        console.log(patron);
        if(!patron.test(valorNuevo)){
          console.log("valorActual a:"+valorActual);return valorActual;
        }
        if(valorNuevo.split('.').length>2 && typeText=='8'){
          console.log("valorActual b:"+valorActual);return valorActual;
        }
        if(longitud==3 && valorNuevo.split('.')[0].length==longitud && valorNuevo!=100 && typeText=='8'){
          console.log("valorActual c:"+valorActual);return valorActual;
        }
        if(valorNuevo.length>longitud){
          console.log("valorActual d:"+valorActual);return valorActual;
        }
        
        console.log("valorActual:"+valorActual);
        console.log("length:"+valorActual.length);
        console.log("position:"+position);
        console.log("inputChar:"+inputChar);
        console.log("valorNuevo:"+valorNuevo);
        // 1|Numericos
        // 2|Alfanumericos sin espacios
        // 3|Alfanumericos con espacios
        // 4|LegalName
        // 5|Solo texto
        // 6|Email
        // 7|Comprobante rebill
        // 8|Monto Dinero|longitud 3 porcentaje
      /*}*/
      return valorNuevo;
    }

    textValidate(event: any, typeText:string, longitud: number):any {
      const inputElement = event.target as HTMLInputElement;
      const startPosition = inputElement.selectionStart;
      const endPosition = inputElement.selectionEnd;
      
      console.log('Start position:', startPosition);
      console.log('End position:', endPosition);
  
      event.preventDefault();
      let valorNuevo;
      let valorActual=event.target.value;
      const position = event.target.selectionStart;
      const inputChar = String.fromCharCode(event.charCode);
  
      if(typeText=='1' || typeText=='2' || typeText=='3' || typeText=='4' || typeText=='5' || typeText=='6' || typeText=='7'){
          
        let pattern = new RegExp('[0-9]');
        switch (typeText) {
            case '1': { // Numericos
                pattern = new RegExp('[0-9]');
                break; 
            }
            case '2': { // Alfanumericos sin espacios
                pattern = new RegExp('[0-9A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü]');
                break; 
            }
            case '3': { // Alfanumericos con espacios
                pattern = new RegExp('[0-9A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü ]');
                break; 
            }
            case '4': { // LegalName
                pattern = new RegExp('[a-zA-ZñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü0-9-,:()&$#\'. ]');
                break; 
            }
            case '5': { // Solo texto
                pattern = new RegExp('[A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü ]');
                break; 
            }
            case '6': { // Email
                pattern = new RegExp('[0-9A-Za-z._@-]');
                break; 
            }
            case '7': { // Comprobante rebill
                pattern = new RegExp('[0-9bfBF-]');
                break; 
            }
        }
  
        if (!pattern.test(inputChar)) {
          //event.target.value=valorActual;
          console.log("valorActual:"+valorActual);return valorActual;
        }
        //event.target.value=this.textValidate(event, typeText);
      }else{
        if(typeText=='8'){
          let pattern = new RegExp('[0-9.]');
          if (!pattern.test(inputChar)) {
            //event.target.value=valorActual;
            console.log("valorActual a:"+valorActual);return valorActual;
          }
          if(inputChar=='.' && valorActual.split('.').length>1){
            //event.target.value=valorActual;
            console.log("valorActual b:"+valorActual);return valorActual;
          }
        }
      }
      if(valorActual=='0' && inputChar!='0' && (typeText=='1' || typeText=='8')){
        valorNuevo=inputChar;
      }else{
        if(position!=0){
          if(startPosition!=endPosition){
            if(startPosition!=0){
              valorNuevo=valorActual.substring(0, startPosition ) + inputChar + valorActual.substring(endPosition , valorActual.length);
            }else{
              console.log("valorActual.substring(endPosition, valorActual.length):"+valorActual.substring(endPosition, valorActual.length));
              console.log("valorActual.length:"+valorActual.length);
              console.log("inputChar:"+inputChar);
              
              valorNuevo=''+inputChar + valorActual.substring(endPosition, valorActual.length);
            }
          }else{
            if(inputChar=='0' && position==0){
              return valorActual;
            }else{
              if(longitud<=valorActual.length){
                if(typeText!='8'){
                  console.log("valorActual c:"+valorActual);return valorActual;
                }
              }
              valorNuevo=valorActual.substring(0, position ) + inputChar + valorActual.substring(position , valorActual.length);
            }
          }
        }else{
          if(valorActual.length==endPosition){
            valorNuevo=inputChar;
          }
          else{
            valorNuevo=inputChar + valorActual.substring(endPosition , valorActual.length);
          }
        }
        if((valorNuevo.split('.').length>2 || valorNuevo.split('.')[0].length>longitud) && typeText=='8'){
          console.log("valorActual d:"+valorActual);return valorActual;
        }
        if(typeText=='8'){
          if(!RegExp('^([0-9]{0,'+longitud+'})?(.{1}[0-9]{0,6})?$').test(valorNuevo)){
            console.log("valorActual d:"+valorActual);return valorActual;
          }
          if(longitud==3 && valorNuevo.split('.')[0].length==longitud && valorNuevo!=100){
            console.log("valorActual e:"+valorActual);return valorActual;
          }
        }
        
        console.log("valorActual:"+valorActual);
        console.log("length:"+valorActual.length);
        console.log("position:"+position);
        console.log("inputChar:"+inputChar);
        console.log("valorNuevo:"+valorNuevo);
        // 1|Numericos
        // 2|Alfanumericos sin espacios
        // 3|Alfanumericos con espacios
        // 4|LegalName
        // 5|Solo texto
        // 6|Email
        // 7|Comprobante rebill
        // 8|Monto Dinero|longitud 3 porcentaje
      }
      console.log("valorNuevo:"+valorNuevo);
      return valorNuevo;
    }

    validateDecimal(int:any, decimal:any, event: any/*, val: any*/) {

      console.log(event.data);
      console.log(event.target.value);
      //const int:any='1,4';
      
      let pattern;
      let patternb;

      let valores:any=event.data.split('.');
      console.log('|valores::'+valores);

      if ((valores != null && valores != "")) {
            //switch (textType) {
            //case 1: { // Numericos
                pattern =new RegExp('[0-9.]');
          //const expresion = new RegExp('^[0-9]{' + int + '}(\.[0-9]{' + decimal + '})?$');
          /*if (!pattern.test(String.fromCharCode(event.data.charCode))) {
            event.preventDefault();
          
        }else{console.log("preventDefault4");*/
            
          //let pattern;
          //let patternb;
          let patternc;
          if(valores.length>2){
            console.log("preventDefault1");
            event.preventDefault();
            //return val;
          }
          else{
            for(let i=0;i<valores.length;i++){
                console.log(valores[i]);
                if(valores[i]!=""){
                    let maxmin=i==0?int.split(','):decimal.split(',');
                    console.log('|'+valores[i].length+'|'+maxmin[0]+'|'+maxmin[1]);
                    if(valores[i].length>=Number.parseInt(maxmin[0]) && valores[i].length<=Number.parseInt(maxmin[1])){
                        let patron=new RegExp('[0-9]{'+valores[i].length+'}');
                        if (!patron.test(valores[i])) {
                          console.log("preventDefault2");
                          event.preventDefault();
                          //return val;
                        }else{
                          console.log("OK");
                          //this.nopreventDefault();
                          //return event;
                        }
                    }
                    else{
                      console.log("preventDefault3");
                      event.preventDefault();
                      //return val;
                    }
                }
            }
          }           
        //}
      }else{
        console.log("preventDefault5");
        event.preventDefault();
      }
    }

//INI <RQ2024-57 - 03/04/2024>  
    ProcessRegistrarTasa(content0){ 
        //this.limpiar0();
        this.modalService.open(content0, {
            size: 'xl',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: false,
        });
        this.mSelectedBranchId = 0;
        this.GetCoverAdicional(this.SelectedBranchId, this.SelectedProductoId);
        this.getRolesListTasa();
        this.getDivisorList();
        this.ChangeRamo2();
        this.mSelectedProductoId = 0;
        this.NRol = 0;

        this.diaActual = new Date(this.diaActual.getFullYear(), this.diaActual.getMonth(), this.diaActual.getDate());

        // this.filterForm = this.formBuilder.group({
        //     startDate: [this.diaActual, [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
        //     endDate:'',
        //     //endDate: [this.diaActual, [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
        //     VALIDADOR: ['']
        // });        

    }
    
    ChangeRamo2() {
        console.log('ramo: '+this.mSelectedBranchId);
        this.idRamo=this.mSelectedBranchId;
        if (this.idRamo !== null) {
            this.PlanesAsistenciasService.GetProductsList(this.idRamo).subscribe(
                (res) => {
                  this.listProduct2 = res;
                },
                      (err) => { }
              );
        }
    }

    getRolesListTasa() {
        this.PlanesAsistenciasService.getRolesListTasa().subscribe(
            (res) => {
                this.mlistRoles = res;
                //this.NRol = this.mlistRoles[0].Id;
            },
            (err) => { }
        );
    }

    getDivisorList() {
        this.PlanesAsistenciasService.GetDivisorList().subscribe(
            (res) => {
                this.mlistDiv = res;
                //this.NfacDiv = this.mlistDiv[0].Id;
            },
            (err) => { }
        );
    }

    limpiar0() {
        this.branchTypeList = [];
        this.listProduct2 = [];
        this.mlistRoles = [];
        this.mlistDiv = [];
        this.getBranchList();

        this.mSelectedBranchId = 0;
        this.mSelectedProductoId = 0;
        this.NPOLIZA = null;
        this.NporCli = '';
        this.NporCam = '';
        this.NcreMin = '';
        this.NcreMax = '';
        this.ModuloId = '';
        this.DINIVIG = '';
        this.DFINVIG = '';
    }

    cerrar0(content0)
    {
        swal.fire({
            title: '¿Desea cerrar la ventana?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.limpiar0();
                this.modalService.dismissAll(content0);
            }
        });
    }

    GetCoverAdicional(ramo: number, producto: number) {
        if (ramo !== undefined && ramo != 0) {
            this.mSelectedBranchId = ramo;

            if (producto !== undefined && producto != 0) {
                this.mSelectedProductoId = producto;
            }
        }
    }

    Borrar(INDICE: number) {

        console.log("INDICE: " + INDICE);
        let servicio: number = 1;
        try {
            servicio = INDICE;//parseInt(this.mselectedServicioId[INDICE-1].NSERVICE);
        } catch {
            servicio = 1;
        }
        console.log("servicio: " + servicio);
        swal.fire({
            title: 'Información',
            text: '¿Desea quitar el registro agregado?',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            showCloseButton: true,
            showCancelButton: true,
            allowOutsideClick: false

        }).then((result) => {

            if (result.value) {
                INDICE = INDICE - 1;
                this.mlistValores.splice(INDICE, 1);
                this.nconfigs = this.mlistValores.length;
                for (let i = 0; i < this.nconfigs; i++) {
                    this.mlistValores[i].INDICE = i + 1;
                    if (parseInt(this.mlistValores[i].NSERVICE) == this.mlistValores[this.nconfigs - 1].NSERVICE) {
                        this.mlistValores[i].NBORRAR = true;
                    }
                }
                if (this.nconfigs == 0) {
                   // this.haymlistValores = false;
                }
            }
        });
    }

    Guardar() {

        if (this.mSelectedBranchId == 0){
            swal.fire('Información', 'Falta seleccionar el ramo', 'error');
            return;
        }

        if (this.mSelectedProductoId == 0){
            swal.fire('Información', 'Falta seleccionar el producto', 'error');
            return;
        }

        if(this.NPOLIZA == null || this.NporCli == ''|| this.NporCam == ''|| this.NcreMin == '' || this.NcreMax == ''|| this.ModuloId == ''){
            swal.fire('Información', 'Falta completar datos', 'error');
            return;
        }
        if(this.DINIVIG ==""){
            swal.fire('Información', 'La fecha de inicio de vigencia es obligatorio', 'error');
            return;
        }    
        if(this.DFINVIG !=""){
            if (this.DINIVIG >= this.DFINVIG ){
                swal.fire('Información', 'La fecha de inicio de vigencia no puede ser mayor o igual a la fecha de fin de vigencia', 'error');
                process.exit(1); // Salida con error
            }
            
        }


        swal.fire({
            title: 'Información',
            text: 'Desea guardar la información registrada',
            icon: 'question',
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            showCloseButton: true,
            showCancelButton: true,
            allowOutsideClick: false

        }).then((result) => {
            if (result.value) {
                this.spinner.show();
                let data: any = {
                    NBRANCH: parseInt(this.mSelectedBranchId),
                    NPRODUCT: parseInt(this.mSelectedProductoId),
                    NPOLICY: this.NPOLIZA,
                    NMODULO: this.ModuloId,
                    NROL: this.NRol,
                    DINIVIG: this.DINIVIG,
                    DFINVIG: this.DFINVIG,
                    NMINCREDITO: this.NcreMin,
                    NMAXCREDITO: this.NcreMax,
                    NTASACLIENTE: this.NporCli,
                    NTASACOMPANIA: this.NporCam,
                    NDIVISOR: this.NfacDiv,
                    NUSERCODE:JSON.parse(localStorage.getItem("currentUser")).id
                };


                console.log('envio de data: ')
                console.log(data)
                this.PlanesAsistenciasService.setListaTasa(data).subscribe(
                    (res) => {
                        if (res.Id == 0) {
                            this.spinner.hide();
                            swal.fire('Información', res.Description , 'success');
                                this.modalService.dismissAll('content0');
                                this.limpiar0();
                                this.listToShow = [];
                        } else {
                            this.spinner.hide();
                            swal.fire('Información', res.Description , 'warning');
                        }
                    },
                    (err) => { }
                );
            }
        });
    }

    GuardarEditado() {

        if (this.mSelectedBranchId == 0){
            swal.fire('Información', 'Falta seleccionar el ramo', 'error');
            return;
        }

        if (this.mSelectedProductoId == 0){
            swal.fire('Información', 'Falta seleccionar el producto', 'error');
            return;
    }

        if(this.NPOLIZA == null || this.NporCli == ''|| this.NporCam == ''|| this.NcreMin == '' || this.NcreMax == ''|| this.ModuloId == ''){
            swal.fire('Información', 'Falta completar datos', 'error');
            return;
        }
        
        if(this.DINIVIGE ==""){
            swal.fire('Información', 'La fecha de inicio de vigencia es obligatorio', 'error');
            return;
        }

        if(this.DFINVIGE !=""){
            if (this.parseDate(this.DINIVIGE) >= this.parseDate(this.DFINVIGE) ){
                swal.fire('Información', 'La fecha de inicio de vigencia no puede ser mayor o igual a la fecha de fin de vigencia', 'error');
                process.exit(1); // Salida con error
            }
            
        }


        swal.fire({
            title: 'Información',
            text: 'Desea guardar la información',
            icon: 'question',
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            showCloseButton: true,
            showCancelButton: true,
            allowOutsideClick: false

        }).then((result) => {
            if (result.value) {
                this.spinner.show();
                let data: any = {
                    NBRANCH: parseInt(this.mSelectedBranchId),
                    NPRODUCT: parseInt(this.mSelectedProductoId),
                    NPOLICY: this.NPOLIZA,
                    NMODULO: this.ModuloId,
                    NROL: this.NRol,
                    DINIVIG: this.parseDate(this.DINIVIGE),
                    DFINVIG: this.parseDate(this.DFINVIGE),
                    NMINCREDITO: this.NcreMin,
                    NMAXCREDITO: this.NcreMax,
                    NTASACLIENTE: this.NporCli,
                    NTASACOMPANIA: this.NporCam,
                    NDIVISOR: this.NfacDiv,
                    NUSERCODE:JSON.parse(localStorage.getItem("currentUser")).id,
                    NORDEN: this.Norden
                };


                console.log('envio de data: ')
                console.log(data)
                this.PlanesAsistenciasService.actualizarTasa(data).subscribe(
                    (res) => {
                        if (res.Id == 0) {
                            this.spinner.hide();
                            swal.fire('Información', res.Description , 'success');
                                this.modalService.dismissAll('content0');
                                this.limpiar0();
                                this.listToShow = [];
                                this.Norden = 0;
                        } else {
                            this.spinner.hide();
                            swal.fire('Información', res.Description , 'warning');
                        }
                    },
                    (err) => { }
                );
            }
        });
    }

    parseDate(dateString: any): Date | null {
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        
        if(!regex.test(dateString)) {
            return dateString;
        }

        const parts = dateString.split('/');
        if (parts.length !== 3) {
          return null;
        }
      
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Los meses en JavaScript empiezan en 0
        const year = parseInt(parts[2], 10);
      
        if (isNaN(day) || isNaN(month) || isNaN(year)) {
          return null;
        }
      
        return new Date(year, month, day);
      }

//FIN <RQ2024-57 - 03/04/2024>   

}
