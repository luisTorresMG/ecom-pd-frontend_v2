import { Component, OnInit, Input } from '@angular/core';
import { RentasService } from '../../../../backoffice/services/rentas/rentas.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-registro-benficiaro-modal',
  templateUrl: './registro-benficiaro-modal.component.html',
  styleUrls: ['./registro-benficiaro-modal.component.css'],
})
export class RegistroBeneficiarioModalComponent implements OnInit {
  @Input() check_input_value;
  @Input() public data: any;
  @Input() public reference: any;
  @Input() public formModalReference: any; //Referencia al modal creado desde el padre de este componente para ser cerrado desde aquí
  @Input() public dataUsuarioEquival: any;

  isLoading: boolean = false;
  pdfFile: File | null = null;
  errorMessage: string | null = null;
  inputs: any = [];
  tipoDocumentos: any = [];
  opcionesTipoDocumentos: any = [];

  tipoTelefono: any = [];
  opcionesTipoTelefono: any = [];
  tipoDistrito: any = [];
  opcionesTipoDistrito: any = [];
  tipoProvincia: any = [];
  opcionesTipoProvincia: any = [];
  tipoDepartamento: any = [];
  opcionesDepartamento: any = [];
  tipoVia: any = [];
  opcionesTipoVia: any = [];
  tipoNacionalidad: any = [];
  opcionesTipoNacionalidad: any = [];
  tipoEstadoCivil: any = [];
  opcionesEstadoCivil: any = [];
  tipoSexo: any = [];
  opcionesSexo: any = [];
  TIPO_DOCUMENTO
  constructor(private rentasService: RentasService, public activeModal: NgbActiveModal,) {}

  ngOnInit(): void {
    this.inputs.NUMERO_DOCUMENTO = this.data.P_SCLIENDOCU
    this.TIPO_DOCUMENTO = this.data.P_NTYPEDOCU
    this.isLoading = true;
    this.getListTipoDocumentosB()
    console.log(this.TIPO_DOCUMENTO)


    this.getListSexo()
    this.getLisEstadoCivil()
    this.getListNacionalidad()
    this.getListTipoVia()
    this.getListDepartamento()
    this.getListTipoTelefono()
    console.log(this.data.P_NTYPEDOCU)
   
    
  }

  cambioDepartamento(DEPARTAMENTO) {
    this.getListProvincia(DEPARTAMENTO.codigo);
  }

  cambioProvincia(PROVINCIA) {
    this.getListDistrito(PROVINCIA.codigo);
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  GestionarCliente(){
    console.log(this.inputs)
    console.log(this.formatDate(new Date()))
    console.log(this.inputs.FECHA_NACIMENTO)
    console.log(this.data)
    console.log(this.tipoDocumentos)
    const documentoEncontrado = this.tipoDocumentos.find(
        (doc) => doc.NCODE === String(this.data.P_NTYPEDOCU)
      );
      console.log(documentoEncontrado)
    const data = {
        "P_DBIRTHDAT": this.formatDate(this.inputs.FECHA_NACIMENTO),
        "P_TIPOPER": "INS",
        "P_CODAPLICACION": "GESTORCLIENTE",
        "P_NUSERCODE": "1",
        "P_NIDDOC_TYPE": documentoEncontrado.NCODE_VT,
        //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
        //"P_SIDDOC":      this.data.P_SCLIENDOCU,
        "P_SIDDOC":      this.data.P_SCLIENDOCU.trim(),
        //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
        "P_SLASTNAME":      this.inputs.APE_PATERNO,
        "P_SLASTNAME2":      this.inputs.APE_MATERNO,
        "P_SFIRSTNAME":      this.inputs.NOMBRES,
        "P_SSEXCLIEN":      this.inputs.SEXO.codigo,
        "P_NCIVILSTA":      String(this.inputs.ESTADO_CIVIL.codigo),
        "P_NNATIONALITY":      String(this.inputs.TIPO_NACIONALIDAD.codigo),
        "P_SNOM_DIRECCION":      this.inputs.DIRECCION,
        "P_SNUM_DIRECCION":      this.inputs.NUMERO,
        "P_SMANZANA":      this.inputs.MANZANA|| "",
        "P_DESDEPARTAMENTO":      this.inputs.DEPARTAMENTO?.codigo || "",
        "P_DESPROVINCIA":      this.inputs.PROVINCIA?.codigo || "",
        "P_DESDISTRITO":      this.inputs.DISTRITO?.codigo || "",
        "P_NTITLE":      "0",
       "EListEmailClient": [
            {
                    "P_NROW": "1",
                    "P_NRECOWNER": "2",///CHR
                    "P_SRECTYPE": "4",
                    "P_DEFFECDATE": this.formatDate(new Date()),
                    "P_SE_MAIL": this.inputs.CORREO,
                    "P_SKEYADDRESS": "",
                    "P_SINFOR": "",
                    "P_TIPOPER": "INS",
                    "P_NUM_UPDATE": "",
                    "p_NUM_INSERT": ""
                }
        ],
        "EListAddresClient":[///CHR
            {
               "P_SRECTYPE":"2",
               "P_NCOUNTRY":"1",
               "P_NPROVINCE":  this.inputs.DEPARTAMENTO?.codigo || "",
               "P_NLOCAL":this.inputs.PROVINCIA?.codigo || "",
               "P_NMUNICIPALITY": this.inputs.DISTRITO?.codigo || "",
               "P_STI_DIRE": this.inputs.TIPO_VIA?.codigo || "",
               "P_SNOM_DIRECCION":  this.inputs.DIRECCION,
               "P_SNUM_DIRECCION":  this.inputs.NUMERO,
               "P_STI_BLOCKCHALET":"",
               "P_SBLOCKCHALET":"",
               "P_STI_INTERIOR":"",
               "P_SNUM_INTERIOR":"",
               "P_STI_CJHT":"",
               "P_SNOM_CJHT":"",
               "P_SETAPA":"",
               "P_SMANZANA": String(this.inputs.MANZANA|| ""),
               "P_SLOTE":"",
               "P_SREFERENCIA":""
            }
         ],
        "EListPhoneClient": [
            {
                    "P_NROW": "2",
                    "P_NRECOWNER": "2",///CHR
                    "P_TIPOPER": "INS",
                    "P_NKEYPHONES": "",
                   "P_DEFFECDATE": this.formatDate(new Date()),
                    "P_NBESTTIMETOCALL": "",
                    "P_NAREA_CODE": "1",
                    "P_NORDER": "",
                    "P_NEXTENS2": "",
                    "P_NUM_UPDATE": "",
                    "p_NUM_INSERT": "",
                    "P_SPHONE": this.inputs.TELEFONO,
                    "P_NEXTENS1": "",
                    "P_NPHONE_TYPE":  String(this.inputs.TIPO_TELEFONO.codigo),
                    "P_NCOUNTRY_CODE": "",
                    "P_SASSOCADDR": "",
                    "P_SKEYADDRESS": ""
            }
        ],
      }
    this.rentasService.GestionarCliente(data).subscribe({
        next: (response) => {
          console.log(response)
          if(response.P_NCODE == "0"){
            Swal.fire({
                icon: "success",
                title: "Exitoso",
                text: response.P_SMESSAGE,
               });
               this.registroCliente()
          }else{
            Swal.fire({
                icon: "error",
                title: "Error",
                text: response.P_SMESSAGE,
            });
          }
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  ConGestionarCliente(){
    console.log(this.data)
    console.log(this.tipoDocumentos)
    console.log(this.data.P_NTYPEDOCU)
    const documentoEncontrado = this.tipoDocumentos.find(
        (doc) => doc.NCODE === String(this.data.P_NTYPEDOCU)
      );
      console.log(documentoEncontrado)
    const data = {
        "P_TIPOPER": "CON",
        "P_CODAPLICACION": "GESTORCLIENTE",
        "P_NUSERCODE": "1",
        "P_NIDDOC_TYPE": documentoEncontrado.NCODE_VT,
        //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
        //"P_SIDDOC": String(this.data.P_SCLIENDOCU),
        "P_SIDDOC": String(this.data.P_SCLIENDOCU).trim().toUpperCase(),
        //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
      }
    this.rentasService.GestionarCliente(data).subscribe({
        next: (response) => {
          console.log(response)
          this.getListProvincia(response.EListClient[0].EListAddresClient[0].P_NPROVINCE);
          this.getListDistrito(response.EListClient[0].EListAddresClient[0].P_NLOCAL);
          this.inputs.APE_PATERNO = response.EListClient[0].P_SLASTNAME
          this.inputs.APE_MATERNO = response.EListClient[0].P_SLASTNAME2
          this.inputs.NOMBRES = response.EListClient[0].P_SFIRSTNAME
          this.inputs.SEXO = {codigo: response.EListClient[0].P_SSEXCLIEN}
          this.inputs.ESTADO_CIVIL = {codigo:response.EListClient[0].P_NCIVILSTA}
          this.inputs.TIPO_NACIONALIDAD = {codigo:response.EListClient[0].P_NNATIONALITY}
          this.inputs.DIRECCION = response.EListClient[0].EListAddresClient[0].P_SNOM_DIRECCION
          this.inputs.NUMERO = response.EListClient[0].EListAddresClient[0].P_SNUM_DIRECCION
          this.inputs.MANZANA = response.EListClient[0].EListAddresClient[0].P_SMANZANA
          console.log(response.EListClient[0].EListAddresClient[0])
          this.inputs.DEPARTAMENTO = {codigo:response.EListClient[0].EListAddresClient[0].P_NPROVINCE}
          this.inputs.PROVINCIA = {codigo:response.EListClient[0].EListAddresClient[0].P_NLOCAL}
          this.inputs.DISTRITO = {codigo:response.EListClient[0].EListAddresClient[0].P_NMUNICIPALITY}
          this.inputs.TELEFONO = response.EListClient[0].EListPhoneClient[0].P_SPHONE
          this.inputs.TIPO_TELEFONO = {codigo: response.EListClient[0].EListPhoneClient[0].P_NPHONE_TYPE}
          this.inputs.CORREO = response.EListClient[0].EListEmailClient[0].P_SE_MAIL
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  onFileChange = (event: any) => {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (fileExtension === 'pdf') {
        this.pdfFile = file;
        this.errorMessage = null;
      } else {
        this.pdfFile = null;
        this.errorMessage = 'Solo se permiten archivos PDF.';
      }
    }
  };

  onSubmit = () => {
    if (this.pdfFile) {
      let myFormData: FormData = new FormData();

      myFormData.append('objeto', JSON.stringify(this.reference.obj));
      myFormData.append('dataFile', this.pdfFile);
      this.reference.close();
      this.reference.previusStep();
    }
  };

  getListTipoDocumentosB() {
    this.rentasService.getListTipoDocumentosB().subscribe({
      next: (response) => {
        this.tipoDocumentos = response.C_TABLE;

        this.opcionesTipoDocumentos = this.tipoDocumentos.map(
          (tipoDocumento) => {
            return {
              codigo: tipoDocumento.NCODE,
              valor: tipoDocumento.SDESCRIPT,
            };
          }
        );
        console.log(this.tipoDocumentos)
        console.log(this.opcionesTipoDocumentos)
        if(this.data.P_NTYPEDOCU == 1){
            this.ConGestionarCliente()
        }else{
            this.inputs.FECHA_NACIMENTO = new Date()
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  getListSexo() {
    this.rentasService.getListSexo().subscribe({
      next: (response) => {
        this.tipoSexo = response.C_TABLE;

        this.opcionesSexo = this.tipoSexo.map(
          (tipoSexo) => {
            return {
              codigo: tipoSexo.SCODE,
              valor: tipoSexo.SDESCRIPT,
            };
          }
        );
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getLisEstadoCivil() {
    this.rentasService.getLisEstadoCivil().subscribe({
      next: (response) => {
        this.tipoEstadoCivil = response.C_TABLE;

        this.opcionesEstadoCivil = this.tipoEstadoCivil.map(
          (tipoEstadoCivil) => {
            return {
              codigo: tipoEstadoCivil.NCODE,
              valor: tipoEstadoCivil.SDESCRIPT,
            };
          }
        );
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getListNacionalidad() {
    this.rentasService.getListNacionalidad().subscribe({
      next: (response) => {
        this.tipoNacionalidad = response.C_TABLE;

        this.opcionesTipoNacionalidad = this.tipoNacionalidad.map(
          (tipoNacionalidad) => {
            return {
              codigo: tipoNacionalidad.NCODE,
              valor: tipoNacionalidad.SDESCRIPT,
            };
          }
        );
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getListTipoVia() {
    this.rentasService.getListTipoVia().subscribe({
      next: (response) => {
        this.tipoVia = response.C_TABLE;

        this.opcionesTipoVia = this.tipoVia.map(
          (tipoVia) => {
            return {
              codigo: tipoVia.SCODE,
              valor: tipoVia.SDESCRIPT,
            };
          }
        );
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  getListDepartamento() {
    this.rentasService.getListDepartamento().subscribe({
      next: (response) => {
        this.tipoDepartamento = response.C_TABLE;

        this.opcionesDepartamento = this.tipoDepartamento.map(
          (tipoDepartamento) => {
            return {
              codigo: tipoDepartamento.NCODE,
              valor: tipoDepartamento.SDESCRIPT,
            };
          }
        );
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getListProvincia(departamento: number) {
    const data = {
        "P_NPROVINCE": departamento
    }
    this.rentasService.getListProvincia(data).subscribe({
      next: (response) => {
        this.tipoProvincia = response.C_TABLE;

        this.opcionesTipoProvincia = this.tipoProvincia.map(
          (tipoProvincia) => {
            return {
              codigo: tipoProvincia.NCODE,
              valor: tipoProvincia.SDESCRIPT,
            };
          }
        );
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  
  getListDistrito(provincia: number) {
    
    const data = {
        "P_NLOCAL": provincia
    }
    this.rentasService.getListDistrito(data).subscribe({
      next: (response) => {
        this.tipoDistrito = response.C_TABLE;

        this.opcionesTipoDistrito = this.tipoDistrito.map(
          (tipoDistrito) => {
            return {
              codigo: tipoDistrito.NCODE,
              valor: tipoDistrito.SDESCRIPT,
            };
          }
        );
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getListTipoTelefono() {
    this.rentasService.getListTipoTelefono().subscribe({
      next: (response) => {
        this.tipoTelefono = response.C_TABLE;

        this.opcionesTipoTelefono = this.tipoTelefono.map(
          (tipoTelefono) => {
            return {
              codigo: tipoTelefono.NCODE,
              valor: tipoTelefono.SDESCRIPT,
            };
          }
        );
      },
      error: (error) => {
        console.error(error);
      },
    });
  }


  registroCliente(){
    console.log(this.data)
    console.log(this.tipoDocumentos)
    const documentoEncontrado = this.tipoDocumentos.find(
        (doc) => doc.NCODE === String(this.data.P_NTYPEDOCU)
      );
      console.log(documentoEncontrado)
    const data = {
        "P_TIPOPER": "CON",
        "P_CODAPLICACION": "GESTORCLIENTE",
        "P_NUSERCODE": "1",
        "P_NIDDOC_TYPE": documentoEncontrado.NCODE_VT,
        //<INI - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
        //"P_SIDDOC": String(this.data.P_SCLIENDOCU),
        "P_SIDDOC": String(this.data.P_SCLIENDOCU).trim().toUpperCase(),
        //<FIN - 26/06/2025  | NUEVO CAMPO DE FECHA DE SOLICITUD >
      }
   console.log(data)
   ///EListClient revertir los cambios a minuscula cuando se pase a prod
    this.rentasService.GestionarCliente(data).subscribe({
        next: (clientResponse) => {
            console.log(clientResponse)
          const data3 = {
            "P_NTYPCLIENTDOC": documentoEncontrado.NCODE_VT,
            "P_SSEXCLIEN": clientResponse.EListClient[0]?.P_SSEXCLIEN,
            "P_STYPERECEP": "",
            "P_NCIVILSTA": String(clientResponse.EListClient[0]?.P_NCIVILSTA),
            "P_NNATIONALITY": String(clientResponse.EListClient[0]?.P_NNATIONALITY),
            "P_NPROVINCE": clientResponse.EListClient[0]?.EListAddresClient[0]?.P_NPROVINCE,
            "P_NLOCAL": clientResponse.EListClient[0]?.EListAddresClient[0]?.P_NLOCAL,
            "P_NMUNICIPALITY": clientResponse.EListClient[0]?.EListAddresClient[0]?.P_NMUNICIPALITY,
            "P_NTYPCLIENTDOC_RT": documentoEncontrado.NCODE,
        }
        this.rentasService.getEquivalenceInformation(data3).subscribe({
        next: (response) => {
            
            console.log(response)
          const dataRegistro = {
                    "coD_TIPODOC": response.C_TABLE[0]?.COD_TIPODOC || "",
                    "tipodoc": response.C_TABLE[0]?.TIPODOC || "",
                    "nrodocu": clientResponse.EListClient[0]?.P_SIDDOC || "",
                    "nombrecompleto": clientResponse.EListClient[0]?.P_SLEGALNAME || "",
                    //"nombrE1": clientResponse.EListClient[0]?.P_SFIRSTNAME || "",
                    "nombrE1": clientResponse.EListClient[0]?.P_SFIRSTNAME?.split(" ")[0] || "",
                    //"nombrE2": clientResponse.EListClient[0]?.P_SFIRSTNAME || "",
                    "nombrE2": clientResponse.EListClient[0]?.P_SFIRSTNAME?.split(" ").slice(1).join(" ") || "",
                    "appaterno": clientResponse.EListClient[0]?.P_SLASTNAME || "",
                    "apmaterno": clientResponse.EListClient[0]?.P_SLASTNAME2 || "",
                    "nombrelegal": clientResponse.EListClient[0]?.P_SLEGALNAME || "",
                   ///  "fecnac": "20240506",
                    "fecnac": clientResponse.EListClient[0]?.P_DBIRTHDAT.replace(/[-/]/g, ""),
                    "coD_SEXO": response.C_TABLE[0]?.COD_SEXO || "",
                    "sexo": response.C_TABLE[0]?.SEXO || "",
                    "coD_ESTADOCIVIL": response.C_TABLE[0]?.COD_ESTADOCIVIL || "",
                    "estadocivil": response.C_TABLE[0]?.ESTADOCIVIL || "",
                    "coD_NACIONALIDAD": response.C_TABLE[0]?.COD_NACIONALIDAD || "",
                    "nacionalidad": response.C_TABLE[0]?.NACIONALIDAD || "",
                    "direccion": clientResponse.EListClient[0]?.EListAddresClient[0]?.P_SSTREET || "",
                    "coD_DEPARTAMENTO": response.C_TABLE[0].COD_DEPARTAMENTO,//CHR
                    "departamento": response.C_TABLE[0]?.DEPARTAMENTO || "",
                    "coD_PROVINCIA":  response.C_TABLE[0].COD_PROVINCIA,//CHR
                    "provincia": response.C_TABLE[0]?.PROVINCIA || "",
                    "coD_DISTRITO": response.C_TABLE[0].COD_DISTRITO,//CHR
                    "distrito": response.C_TABLE[0]?.DISTRITO || "",
                    "correo": clientResponse.EListClient[0]?.EListEmailClient[0]?.P_SE_MAIL || "",
                    "fono": clientResponse.EListClient[0]?.EListPhoneClient[0]?.P_SPHONE || "",
                     "coD_USUARIOCREA": this.dataUsuarioEquival
                };

                console.log(dataRegistro)


        this.rentasService.registroclientes(dataRegistro).subscribe({
            next: (response) => {
              console.log(response);
                      clientResponse.NCODE = documentoEncontrado.NCODE
                      this.reference.close(clientResponse);
            },
            error: (error) => {
              console.error(error);
            },
          });
        },
        error: (error) => {
          console.error(error);
        },
      });
        },
        error: (error) => console.error(error),
      });
    }


  Validar(){
    if(this.data.P_NTYPEDOCU != 1){
      this.GestionarCliente()
    }else{
        this.registroCliente()
    }
    }
}
