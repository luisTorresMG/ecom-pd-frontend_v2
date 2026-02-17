import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import {
  NgbModal,
  ModalDismissReasons,
  NgbModalRef,
  NgbActiveModal,
} from '@ng-bootstrap/ng-bootstrap';
import { ContractorForTable } from '../../../../broker/models/maintenance/contractor-location/contractor-for-table';
import { ContractorLocation } from '../../../../broker/models/maintenance/contractor-location/contractor-location';
import { ContractorLocationIndexService } from '../../../../broker/services/maintenance/contractor-location/contractor-location-index/contractor-location-index.service';
import Swal from 'sweetalert2';
import { EndorseeComponent } from '../../../components/endorsee/endorsee.component';

// import { Contractor } from '../../../broker/models/maintenance/contractor-location/contractor';

// Importación de servicios
import { ClientInformationService } from '../../../../broker/services/shared/client-information.service';
//import { ClientInformationService } from '../../../broker/services/shared/client-information.service';
// import { ContractorLocationIndexService } from '../../../broker/services/maintenance/contractor-location/contractor-location-index/contractor-location-index.service';
// import { ContractorForTable } from '../../../broker/models/maintenance/contractor-location/contractor-for-table';
// import { CommonMethods } from '../../../broker/components/common-methods';
// import { GlobalValidators } from '../../../../broker/components/global-validators';
// import { ModuleConfig } from '../../../../broker/components/module.config';

@Component({
  selector: 'app-endorsee-view',
  templateUrl: './endorsee-view.component.html',
  styleUrls: ['./endorsee-view.component.css'],
})
export class EndorseeViewComponent implements OnInit {
  @Input() public reference: any; //Referencia al modal creado desde el padre de este componente 'contractor-location-index' para ser cerrado desde aquí
  @Input() public contractor: any;

  //Variables
  DocumentType;
  DocumentNumber;
  FullName;
  idGrupo;
  GrupoList: any = [];
  Sclient;
  usuario = JSON.parse(localStorage.getItem('currentUser'))['id'];
  Codtabla;
  Codvoucher;
  CodDetalle;
  Id;
  Address;
  Email;
  Phone;
  indicador;
  nbranch = JSON.parse(localStorage.getItem('vilpID'))['nbranch'];
  varibleValidacion;
  estado;
  searchMode;
  listProv: any = [];
  listProv2: any = [];
  insUpd;
  i: string;

  msgDes: string;

  constructor(
    private modalService: NgbModal,
    private clientInformationService: ClientInformationService
  ) {}

  async ngOnInit() {
    await this.ListarCombo();
    this.Data();
    this.i = this.contractor.ins_update;
    //console.log('ONINIT', this.i);
    if (this.i == 'Insertar') {
      this.msgDes = '¿Estás seguro de salir sin crear endosatario?';
    } else {
      this.msgDes = '¿Estás seguro de salir sin guardar cambios?';
    }
  }

  Data() {
    //console.log("la data del modal",this.contractor)

    //this.searchMode     = this.contractor.tipo_busqueda
    this.Id = this.contractor.cod_cliente;
    this.DocumentType = this.contractor.tipo_documento == '1' ? 'RUC' : '';
    this.DocumentNumber = this.contractor.documento;
    this.FullName = this.contractor.nombre_legal;
    this.Sclient = this.contractor.cod_proveedor;
    this.Codtabla = this.contractor.cod_tabla;
    this.Codvoucher = this.contractor.cod_voucher;
    this.idGrupo = this.contractor.cod_detalle;
    this.Address = this.contractor.address;
    this.Email = this.contractor.email;
    this.Phone = this.contractor.phone;
    this.estado = 1;
    this.insUpd = this.contractor.ins_update;

    //console.log('DATA', this.insUpd);
    // if (this.contractor.indicador != undefined && this.contractor.indicador != null ){
    //     this.indicador  = this.contractor.indicador
    // }
    // else {
    //     this.indicador  = ""
    // }
  }

  async Volver() {
    Swal.fire({
      icon: 'question',
      title: 'Información',
      text: this.msgDes,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
    }).then(async (result) => {
      if (!result.dismiss) {
        this.Data();
        this.reference.close('Cerrar');
      }
    });
    //this.reference.close("Cerrar");
  }

  async ListarCombo() {
    await this.clientInformationService
      .getTypeProviderList(3)
      .subscribe((rest) => {
        this.GrupoList = rest;
        if (this.GrupoList === undefined && this.GrupoList === null) {
          this.GrupoList = rest;
          Swal.fire(
            '¡Informacion!',
            'Tipo de proveedor es requerido.',
            'success'
          );
        }
      });
  }

  async validarEspacio() {
    let msg = '';

    if (this.idGrupo === '-1') {
      msg += 'Debe ingresar tipo de proveedor <br />';
    }

    if (msg !== '') {
      Swal.fire('Información', msg, 'error');
      return;
    }
  }

  async listUpInsdProvider() {
    let msg = '';

    if (this.idGrupo == 0) {
      msg += 'Debe ingresar el tipo de proveedor <br />';
    }

    if (msg !== '') {
      Swal.fire('Información', msg, 'error');
      return;
    }
    let data: any = {};

    data.tipo_busqueda = 1;
    data.tipo_documento = 1;
    data.documento = this.DocumentNumber;
    data.nombre_legal = this.FullName;
    data.ramo = this.nbranch;

    //console.log('listaprov', this.listProv.length);
    //await this.clientInformationService.getProviderList(data).subscribe(
    //   async rest =>{
    /*
          let valor = rest
          console.log("El valor ", valor)
          console.log("El rest ", rest.provider_lis) 
          this.listProv   = rest.providerList;
        */
    //this.listProv = ["1","2"];
    if (this.Sclient != undefined && this.Sclient != '0' && this.Sclient != 0) {
      data.cod_cliente = this.Sclient;
      (data.cod_tabla = this.Codtabla),
        (data.cod_detalle = this.idGrupo),
        (data.cod_comprobante = this.Codvoucher),
        (data.cod_usuario = this.usuario);

      await this.clientInformationService
        .updProvider(data)
        .subscribe((rest) => {
          this.GrupoList = rest;
          //console.log('actualice', this.listProv);

          Swal.fire({
            icon: 'success',
            title: 'Información',
            text: 'Endosatario actualizado',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          }).then(async (result) => {
            if (!result.dismiss) {
              this.reference.close('Cerrar');
            }
          });
        });
    } else {
      (data.cod_cliente = this.Id),
        (data.ramo = this.nbranch),
        (data.cod_tabla = 3),
        (data.cod_detalle = this.idGrupo),
        (data.cod_usuario = this.usuario),
        (data.estado = 1);

      await this.clientInformationService
        .insProvider(data)
        .subscribe((rest) => {
          //console.log('inserte', this.listProv);

          Swal.fire({
            icon: 'success',
            title: 'Información',
            text: 'Endosatario registrado',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          }).then(async (result) => {
            if (!result.dismiss) {
              this.reference.close('Cerrar');
            }
          });
        });
    }
    // });
  }
}
