// import { isNull } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import Swal from 'sweetalert2';
import { VidaInversionService } from '../../services/vida-inversion.service';
import { VidaInversionConstants } from '../../vida-inversion.constants';
import { ParameterSettingsService } from '../../../broker/services/maintenance/parameter-settings.service';

@Component({
  standalone: false,
  selector: 'app-add-declaration',
  templateUrl: './add-declaration.component.html',
  styleUrls: ['./add-declaration.component.scss']
})
export class AddDeclarationComponent implements OnInit {

    profile_id: any;

  @Input() public reference: any;

  @Input() business_relationship : string;

  @Input() check_input_value;
  @ViewChild('insuredRadioInput') insuredRadioInput: ElementRef;

  @Input() check_input_value2;
  @ViewChild('insuredRadioInput2') insuredRadioInput2: ElementRef;

  @Input() check_input_value3;
  @ViewChild('insuredRadioInput3') insuredRadioInput3: ElementRef;

  @Input() check_input_value4;
  @ViewChild('insuredRadioInput4') insuredRadioInput4: ElementRef;

  @Input() check_input_value5;
  @ViewChild('insuredRadioInput5') insuredRadioInput5: ElementRef;

  isLoading: boolean = false;

  CONSTANTS = VidaInversionConstants

  data_quotation_pep = {
    P_NID_COTIZACION: null,
    P_SCLIENT: null,
    P_NSECCION: null,

    P_SINMUEBLES: null,
    P_SVEHICULOS: null,

    P_NPRTCAPSOC: 3,
    P_SPRTCAPSOC_DET: null,

    P_NANTPEN: 3,
    P_NANTJUD: 3,
    P_NANTPOL: 3,
    P_NLAVACT: 3,
    P_NVINAUT: 3,
    P_SDECJUR: null,
}

  constructor(
  private vidaInversionService: VidaInversionService,
  private parameterSettingsService: ParameterSettingsService
  ) { }

  async ngOnInit() {
    this.profile_id = await this.getProfileProduct();
    this.check_input_value = 3;
    this.check_input_value2 = 3;
    this.check_input_value3 = 3;
    this.check_input_value4 = 3;
    this.check_input_value5 = 3;

    this.data_quotation_pep.P_NID_COTIZACION = this.reference.quotation_id;
    this.data_quotation_pep.P_SCLIENT = this.reference.sclient;;
    this.data_quotation_pep.P_NSECCION = 3;
    this.SelDatosPEPVIGP();
    

  }

  changeValue(value, origin) {
    if(origin == 1) this.check_input_value = value;
    if(origin == 2) this.check_input_value2 = value;
    if(origin == 3) this.check_input_value3 = value;
    if(origin == 4) this.check_input_value4 = value;
    if(origin == 5) this.check_input_value5 = value;

  }

  saveDeclaration(){
    
    if (this.data_quotation_pep.P_SDECJUR == null || this.data_quotation_pep.P_SDECJUR == "")
   {
       Swal.fire('Información', "Se debe completar todos los campos para continuar", 'error');
       return;
   }
    
    
   if (this.check_input_value == 3  || this.check_input_value2 == 3 || this.check_input_value3 == 3 || this.check_input_value4 == 3  || this.check_input_value5 == 3 ) {
       Swal.fire('Información', "Se debe completar todos los campos para continuar", 'error');
       return;
    }

    this.data_quotation_pep.P_NID_COTIZACION;
    this.data_quotation_pep.P_SCLIENT; 
    this.data_quotation_pep.P_NSECCION;
    
    this.data_quotation_pep.P_NANTPEN = this.check_input_value;
    this.data_quotation_pep.P_NANTJUD = this.check_input_value2;
    this.data_quotation_pep.P_NANTPOL = this.check_input_value3;
    this.data_quotation_pep.P_NLAVACT = this.check_input_value4;
    this.data_quotation_pep.P_NVINAUT = this.check_input_value5;
    this.data_quotation_pep.P_SDECJUR;

    this.InsUpdDatosPEPVIGP(this.data_quotation_pep);

   //}
  }
    InsUpdDatosPEPVIGP = (data) => {
        this.vidaInversionService.InsUpdDatosPEPVIGP(data).subscribe(
            res => {
                if (res.P_NCODE == 0) {
                    Swal.fire('Información', "Se registró correctamente.", 'success');
                    this.reference.close();
                } else {
                    Swal.fire('Información', res.P_MESSAGE, 'error');
                }
            },
            err => {
                Swal.fire('Información', "Ha ocurrido un error registrando los datos PEP.", 'error');
            }
        )
    }

    SelDatosPEPVIGP = () => {
        this.vidaInversionService.SelDatosPEPVIGP(this.data_quotation_pep).subscribe(
            res => {
                if (res.P_NCODE == 0) {
                    if (res.C_TABLE.length > 0) {
                        this.check_input_value = res.C_TABLE[0].NANTPEN;
                        this.check_input_value2 = res.C_TABLE[0].NANTJUD;
                        this.check_input_value3 = res.C_TABLE[0].NANTPOL;
                        this.check_input_value4 = res.C_TABLE[0].NLAVACT;
                        this.check_input_value5 = res.C_TABLE[0].NVINAUT;
                        this.data_quotation_pep.P_SDECJUR = res.C_TABLE[0].SDECJUR;
                    }
                    this.isLoading = false;
                }
            },
            err => {
                Swal.fire('Información', "Ha ocurrido un error obteniendo los datos PEP.", 'error');
            }
        );
    }

    async getProfileProduct() {
        let profile = 0;

        let _data: any = {};
        _data.nUsercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
        _data.nProduct = this.CONSTANTS.COD_CHA_PRODUCTO;
        await this.parameterSettingsService.getProfileProduct(_data).toPromise()
            .then(
                (res) => {
                    profile = res;
                },
                err => {
                    console.log(err)
                }
            );

        return profile;
    }
}