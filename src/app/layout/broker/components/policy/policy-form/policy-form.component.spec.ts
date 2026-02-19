// import { PolicyemitService } from '../../../services/policy/policyemit.service';
// import { PolizaEmit } from '../../../../../models/polizaEmit/polizaEmit';
// import { PolizaEmitCab } from '../../../../../models/polizaEmit/PolizaEmitCab';
// import { PolizaEmitComer } from '../../../../../models/polizaEmit/PolizaEmitComer';
// import { TipoRenovacion } from '../../../../../models/polizaEmit/TipoRenovacion';
// import { FrecuenciaPago } from '../../../../../models/polizaEmit/FrecuenciaPago';
// import { SavedPolicyEmit } from '../../../../../models/polizaEmit/SavedPolicyEmit';
// import {
//   PolizaEmitDet,
//   PolizaEmitDetAltoRiesgo,
//   PolizaEmitDetMedianoRiesgo,
//   PolizaEmitDetBajoRiesgo,
// } from '../../../../../models/polizaEmit/PolizaEmitDet';
// import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
// import { BsDatepickerConfig } from 'ngx-bootstrap';
// import { ActivatedRoute } from '@angular/router';
// import { utils, write, read, readFile, WorkBook, WorkSheet } from 'xlsx';
// import { NgForm } from '@angular/forms';
// import Swal from 'sweetalert2';

// @Component({
//   selector: 'app-policy-form',
//   templateUrl: './policy-form.component.html',
//   styleUrls: ['./policy-form.component.css'],
// })
// export class PolicyFormComponent implements OnInit {
//   nrocotizacion: any;
//   savedPolicyEmit: SavedPolicyEmit = new SavedPolicyEmit();
//   @Input() public reference: any;
//   @ViewChild('desde') desde: any;
//   @ViewChild('hasta') hasta: any;
//   accept = '*';
//   files: File[] = [];
//   lastFileAt: Date;
//   lastInvalids: any;
//   maxSize: any;
//   primas: any[] = [];
//   disabledFecha = true;
//   loading = false;
//   existoso = false;
//   activacion = false;
//   activacionFin = false;
//   factorIgv: any;
//   totalSTRC: any;
//   totalSalud: any;
//   activacionExcitoso = false;
//   NroSalud: any;
//   NroPension: any;
//   ProductoPension: any;
//   ProductoSalud: any;
//   flagBusqueda = false;
//   fechaEvento: any;
//   flagFechaMenorMayor = true;
//   flagFechaMenorMayorFin = true;
//   //Datos para configurar los datepicker
//   public bsConfig: Partial<BsDatepickerConfig>;

//   public isValidatedInClickButton: boolean = false;
//   public ValFecha: boolean = false;
//   excelSubir: File;
//   errorExecel: boolean = false;
//   excelJson: any[] = [];
//   archivosJson: any[] = [];
//   mensajeValidacion = '';
//   indentificacion = '';
//   flagNroCotizacion = false;
//   flagColumnas = false;
//   primatotalSCTR: any;
//   primatotalSalud: any;

//   validaciones = [];
//   validacionIndentifacion = [];
//   validacionIndentifacionRUC20 = [];
//   validacionIndentifacionRUC10 = [];
//   mensajeValidacionInd = '';
//   objcolumnas = [];
//   objcolumnasRuc20 = [];
//   objcolumnasRuc10 = [];
//   polizaEmit: PolizaEmit = new PolizaEmit();
//   polizaEmitCab: PolizaEmitCab = new PolizaEmitCab();

//   polizaEmitComer: any[] = [];
//   polizaEmitComerDTO: PolizaEmitComer = new PolizaEmitComer();
//   polizaEmitDet: any[] = [];
//   polizaEmitDetDTO: PolizaEmitDet = new PolizaEmitDet();
//   polizaEmitDetAltoRiesgo: PolizaEmitDetAltoRiesgo =
//     new PolizaEmitDetAltoRiesgo();
//   polizaEmitDetMedianoRiesgo: PolizaEmitDetMedianoRiesgo =
//     new PolizaEmitDetMedianoRiesgo();
//   polizaEmitDetBajoRiesgo: PolizaEmitDetBajoRiesgo =
//     new PolizaEmitDetBajoRiesgo();
//   tipoRenovacion: TipoRenovacion[] = [];
//   frecuenciaPago: FrecuenciaPago[] = [];
//   fechaCheck: boolean = true;

//   public mode: String; //emitir, incluir, renovar : emit, include, renew
//   public title: string; //titulo del formulario
//   constructor(
//     private route: ActivatedRoute,
//     private policyemit: PolicyemitService
//   ) {}

//   ngOnInit() {
//     this.polizaEmit.facturacionVencido = 1;
//     this.ObtenerTipoRenovacion();
//     this.polizaEmitComerDTO.TYPE_DOC_COMER = '';
//     this.polizaEmitComerDTO.DES_DOC_COMER = 'Seleccione';
//     this.polizaEmitCab.bsValueIni = new Date('01/01/2019');
//     this.polizaEmitCab.bsValueFin = new Date();
//     this.polizaEmitCab.bsValueIniMin = new Date('01/01/2019');
//     this.polizaEmitCab.bsValueFinMax = new Date();
//     /*this.polizaEmitComer.push({
// 		"COMERCIALIZADOR": "",
// 		"COMISION_BR": "",
// 		"COMISION_PRO": "",
// 		"DELIMITACION": ""
// 	})*/
//     this.polizaEmitComer.push(this.polizaEmitComerDTO);
//     this.polizaEmitDet.push(this.polizaEmitDetDTO);
//     console.log(this.polizaEmitComer);

//     this.polizaEmitCab.TIPO_DOCUMENTO = '';
//     this.polizaEmitCab.tipoRenovacion = '7';
//     this.polizaEmitCab.COD_ACT_ECONOMICA = '';
//     this.polizaEmitCab.COD_TIPO_SEDE = '';
//     this.polizaEmitCab.COD_MONEDA = '';
//     this.polizaEmitCab.COD_DEPARTAMENTO = '';
//     this.polizaEmitCab.COD_PROVINCIA = '';
//     this.polizaEmitCab.COD_DISTRITO = '';
//     this.polizaEmitCab.frecuenciaPago = '';

//     this.mode = this.route.snapshot.paramMap.get('mode');
//     console.log(this.mode);
//     if (this.mode == 'emit') {
//       this.title = 'Emitir Póliza';
//     }
//     /*else if(this.mode=="include"){
//       this.title="Inclusión en Póliza";  
//     }else if(this.mode=="renew"){
//       this.title="Renovar Póliza";  
//     }else if(this.mode=="cancel"){ //si es anular:cancel
//       this.title="Anular Póliza";  
//     }else if(this.mode=="exclude"){ //si es anular:cancel
//       this.title="Excluir en Póliza";  
//     }else if(this.mode=="endosar"){ //si es anular:cancel
//       this.title="Endosar Póliza";  
//     }else if(this.mode=="netear"){ //si es anular:cancel
//       this.title="Neteo de Póliza";  
//     }*/
//   }
//   getDate() {
//     return new Date();
//   }
//   ValidarFecha() {
//     if (this.polizaEmitCab.bsValueIni > this.polizaEmitCab.bsValueFin) {
//       this.ValFecha = true;
//       this.isValidatedInClickButton = true;
//       return;
//     }
//     this.ValFecha = false;
//     this.isValidatedInClickButton = false;
//   }

//   seleccionExcel(archivo: File) {
//     this.excelSubir = null;
//     if (!archivo) {
//       this.excelSubir = null;
//       return;
//     }
//     this.excelSubir = archivo;
//   }

//   validarExcel() {
//     this.activacionExcitoso = true;
//     if (this.excelSubir == null || this.errorExecel == undefined) {
//       this.errorExecel = true;

//       return;
//     }

//     console.log(this.excelSubir);
//     var extensiones_permitidas = ['.xls', '.xlsx'];
//     var rutayarchivo = this.excelSubir.name;
//     var ultimo_punto = this.excelSubir.name.lastIndexOf('.');
//     var extension = rutayarchivo.slice(ultimo_punto, rutayarchivo.length);
//     if (extensiones_permitidas.indexOf(extension) == -1) {
//       this.errorExecel = true;

//       return;
//     }

//     this.errorExecel = false;
//     this.loading = true;
//     this.existoso = false;
//     let reader = new FileReader();
//     reader.onload = () => {
//       this.excelJson = [];
//       this.validaciones = [];
//       this.validacionIndentifacion = [];
//       this.validacionIndentifacionRUC20 = [];
//       this.validacionIndentifacionRUC10 = [];
//       this.objcolumnas = [];
//       this.objcolumnasRuc20 = [];
//       this.objcolumnasRuc10 = [];

//       let u8 = new Uint8Array(reader.result as ArrayBuffer);
//       let wb: WorkBook = read(u8, {
//         type: 'array',
//         cellDates: true,
//         dateNF: 'dd/mm/yyyy',
//       });

//       let wsname: string = wb.SheetNames[0];
//       let ws: WorkSheet = wb.Sheets[wsname];
//       console.log(ws);

//       // Read data
//       //let xlsData = utils.sheet_to_json(ws,{raw:false});
//       let xlsData = utils.sheet_to_json(ws);
//       this.excelJson = xlsData;

//       let contadorColumna = 1;
//       let flagDNI = false;

//       this.flagColumnas = false;

//       this.excelJson.map((v, k) => {
//         //let hola = JSON. (v);
//         if (this.flagColumnas === false) {
//           if (
//             !(
//               v['Nombres*'] ||
//               v['ApPaterno*'] ||
//               v['ApMaterno'] ||
//               v['TipoTrabajador*'] ||
//               v['PaisNacimiento'] ||
//               v['TipoIdent*'] ||
//               v['NumIdent*'] ||
//               v['Sexo*'] ||
//               v['FecNacimiento*'] ||
//               v['Moneda*'] ||
//               v['Remuneracion*'] ||
//               v['EstadoCivil*'] ||
//               v['Sede*'] ||
//               v['TipoMovimiento*']
//             )
//           ) {
//             this.flagColumnas = true;

//             return;
//           }

//           contadorColumna++;

//           if (!v['Nombres*'] || v['Nombres*'].toString().trim() == '') {
//             this.mensajeValidacion =
//               '*El Nombre es requerido en la colunma ' + contadorColumna;
//             this.validaciones.push({
//               mensajeValidacion: this.mensajeValidacion,
//             });
//           } else {
//             var regex = /(\d+)/g;
//             var nombre = v['Nombres*'].toString();
//             var nombres = nombre.match(regex);
//             if (nombres !== null) {
//               if (!isNaN(Number(nombres[0]))) {
//                 this.mensajeValidacion =
//                   '*Los Nombres no deben de tener numeros en la colunma ' +
//                   contadorColumna;
//                 this.validaciones.push({
//                   mensajeValidacion: this.mensajeValidacion,
//                 });
//               }
//             }

//             let vocales = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];

//             let contadorVocales = 0;
//             let contadorV = 0;
//             for (let i = 0; i < v['Nombres*'].length; i++) {
//               contadorV = 0;
//               let nombre = v['Nombres*'][i];

//               for (let i = 0; i < vocales.length; i++) {
//                 let vocal = vocales[i];

//                 if (nombre === vocal) {
//                   contadorVocales++;
//                 } else {
//                   contadorV++;
//                   if (contadorV === 10) {
//                     contadorVocales = 0;
//                   }
//                 }
//               }
//               if (contadorVocales >= 3) {
//                 break;
//               }
//             }

//             if (contadorVocales >= 3) {
//               this.mensajeValidacion =
//                 '*Los Nombres no deben de tener mas de 3 vocales repetidos en la columna ' +
//                 contadorColumna;
//               this.validaciones.push({
//                 mensajeValidacion: this.mensajeValidacion,
//               });
//             }

//             let consonantes = [
//               'b',
//               'd',
//               'f',
//               'g',
//               'h',
//               'j',
//               'k',
//               'l',
//               'm',
//               'n',
//               'ñ',
//               'p',
//               'q',
//               'r',
//               's',
//               't',
//               'v',
//               'x',
//               'y',
//               'z',
//               'B',
//               'C',
//               'D',
//               'F',
//               'G',
//               'H',
//               'J',
//               'K',
//               'L',
//               'M',
//               'Ñ',
//               'P',
//               'Q',
//               'R',
//               'S',
//               'T',
//               'V',
//               'W',
//               'X',
//               'Y',
//               'Z',
//             ];
//             let contadorConsonantes = 0;
//             let contadorC = 0;

//             for (let i = 0; i < v['Nombres*'].length; i++) {
//               let nombre = v['Nombres*'][i];

//               for (let i = 0; i < consonantes.length; i++) {
//                 let consonante = consonantes[i];

//                 if (nombre === consonante) {
//                   contadorConsonantes++;
//                 } else {
//                   contadorC++;
//                   if (contadorC === 40) {
//                     contadorConsonantes = 0;
//                   }
//                 }
//               }
//               if (contadorConsonantes >= 5) {
//                 break;
//               }
//             }

//             if (contadorConsonantes >= 5) {
//               this.mensajeValidacion =
//                 '*Los Nombres no deben de tener mas de 5 consonantes repetidos en la columna ' +
//                 contadorColumna;
//               this.validaciones.push({
//                 mensajeValidacion: this.mensajeValidacion,
//               });
//             }
//           }
//           if (!v['ApPaterno*'] || v['ApPaterno*'].toString().trim() == '') {
//             this.mensajeValidacion =
//               '*El Apellido Paterno es requerido en la colunma ' +
//               contadorColumna;
//             this.validaciones.push({
//               mensajeValidacion: this.mensajeValidacion,
//             });
//           } else {
//             let vocales = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];

//             let contadorVocales = 0;
//             let contadorV = 0;
//             for (let i = 0; i < v['ApPaterno*'].length; i++) {
//               contadorV = 0;
//               let apellido = v['ApPaterno*'][i];

//               for (let i = 0; i < vocales.length; i++) {
//                 let vocal = vocales[i];

//                 if (apellido === vocal) {
//                   contadorVocales++;
//                 } else {
//                   contadorV++;
//                   if (contadorV === 10) {
//                     contadorVocales = 0;
//                   }
//                 }
//               }
//               if (contadorVocales >= 3) {
//                 break;
//               }
//             }

//             if (contadorVocales >= 3) {
//               this.mensajeValidacion =
//                 '*Los Nombres no debe de tener mas de 3 vocales repetidos en la columna ' +
//                 contadorColumna;
//               this.validaciones.push({
//                 mensajeValidacion: this.mensajeValidacion,
//               });
//             }
//             let consonantes = [
//               'b',
//               'd',
//               'f',
//               'g',
//               'h',
//               'j',
//               'k',
//               'l',
//               'm',
//               'n',
//               'ñ',
//               'p',
//               'q',
//               'r',
//               's',
//               't',
//               'v',
//               'x',
//               'y',
//               'z',
//             ];
//             let contadorConsonantes = 0;
//             let contadorC = 0;

//             for (let i = 0; i < v['ApPaterno*'].length; i++) {
//               let apellido = v['ApPaterno*'][i];

//               for (let i = 0; i < consonantes.length; i++) {
//                 let consonante = consonantes[i];

//                 if (apellido === consonante) {
//                   contadorConsonantes++;
//                 } else {
//                   contadorC++;
//                   if (contadorC === 40) {
//                     contadorConsonantes = 0;
//                   }
//                 }
//               }
//               if (contadorConsonantes >= 5) {
//                 break;
//               }
//             }

//             if (contadorConsonantes >= 5) {
//               this.mensajeValidacion =
//                 '*El Apellido no debe de tener mas de 5 consonantes repetidos en la columna ' +
//                 contadorColumna;
//               this.validaciones.push({
//                 mensajeValidacion: this.mensajeValidacion,
//               });
//             }

//             var regex = /(\d+)/g;
//             var apellido = v['ApPaterno*'].toString();
//             var apellidos = apellido.match(regex);
//             if (apellidos !== null) {
//               if (!isNaN(Number(apellidos[0]))) {
//                 this.mensajeValidacion =
//                   '*El Apellido Paterno no debe de tener numeros en la colunma ' +
//                   contadorColumna;
//                 this.validaciones.push({
//                   mensajeValidacion: this.mensajeValidacion,
//                 });
//               }
//             }
//           }

//           if (v['ApMaterno']) {
//             let vocales = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];

//             let contadorVocales = 0;
//             let contadorV = 0;
//             for (let i = 0; i < v['ApMaterno'].length; i++) {
//               contadorV = 0;
//               let apellido = v['ApMaterno'][i];

//               for (let i = 0; i < vocales.length; i++) {
//                 let vocal = vocales[i];

//                 if (apellido === vocal) {
//                   contadorVocales++;
//                 } else {
//                   contadorV++;
//                   if (contadorV === 10) {
//                     contadorVocales = 0;
//                   }
//                 }
//               }
//               if (contadorVocales >= 3) {
//                 break;
//               }
//             }

//             if (contadorVocales >= 3) {
//               this.mensajeValidacion =
//                 '*El Apellido Materno no debe de tener mas de 3 vocales repetidos en la columna ' +
//                 contadorColumna;
//               this.validaciones.push({
//                 mensajeValidacion: this.mensajeValidacion,
//               });
//             }
//             let consonantes = [
//               'b',
//               'd',
//               'f',
//               'g',
//               'h',
//               'j',
//               'k',
//               'l',
//               'm',
//               'n',
//               'ñ',
//               'p',
//               'q',
//               'r',
//               's',
//               't',
//               'v',
//               'x',
//               'y',
//               'z',
//             ];
//             let contadorConsonantes = 0;
//             let contadorC = 0;

//             for (let i = 0; i < v['ApMaterno'].length; i++) {
//               let apellido = v['ApMaterno'][i];

//               for (let i = 0; i < consonantes.length; i++) {
//                 let consonante = consonantes[i];

//                 if (apellido === consonante) {
//                   contadorConsonantes++;
//                 } else {
//                   contadorC++;
//                   if (contadorC === 40) {
//                     contadorConsonantes = 0;
//                   }
//                 }
//               }
//               if (contadorConsonantes >= 5) {
//                 break;
//               }
//             }

//             if (contadorConsonantes >= 5) {
//               this.mensajeValidacion =
//                 '*El Apellido Materno no deben de tener mas de 5 consonantes repetidos en la columna ' +
//                 contadorColumna;
//               this.validaciones.push({
//                 mensajeValidacion: this.mensajeValidacion,
//               });
//             }

//             var regex = /(\d+)/g;
//             var apellido = v['ApMaterno'].toString();
//             var apellidos = apellido.match(regex);
//             if (apellidos !== null) {
//               if (!isNaN(Number(apellidos[0]))) {
//                 this.mensajeValidacion =
//                   '*El Apellido Paterno no deben de tener numeros en la colunma ' +
//                   contadorColumna;
//                 this.validaciones.push({
//                   mensajeValidacion: this.mensajeValidacion,
//                 });
//               }
//             }
//           }

//           if (
//             !v['TipoTrabajador*'] ||
//             v['TipoTrabajador*'].toString().trim() == ''
//           ) {
//             this.mensajeValidacion =
//               '*El Tipo de Trabajador es requerido en la colunma ' +
//               contadorColumna;
//             this.validaciones.push({
//               mensajeValidacion: this.mensajeValidacion,
//             });
//           }

//           if (!v['TipoIdent*'] || v['TipoIdent*'].toString().trim() == '') {
//             this.mensajeValidacion =
//               '*El Tipo de Indentificacion es requerido en la colunma ' +
//               contadorColumna;
//             this.validaciones.push({
//               mensajeValidacion: this.mensajeValidacion,
//             });
//           }
//           if (v['correo']) {
//             let emailRegex =
//               /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;
//             let correos = v['correo'].toString();
//             if (!emailRegex.test(correos)) {
//               this.mensajeValidacion =
//                 '*El correo no es valido en la colunma ' + contadorColumna;
//               this.validaciones.push({
//                 mensajeValidacion: this.mensajeValidacion,
//               });
//             }
//           }

//           if (!v['NumIdent*'] || v['NumIdent*'].toString().trim() == '') {
//             this.mensajeValidacion =
//               '*El Numero de Indentificacion es requerido en la colunma ' +
//               contadorColumna;
//             this.validaciones.push({
//               mensajeValidacion: this.mensajeValidacion,
//             });
//           } else {
//             if (v['TipoIdent*']) {
//               if (v['TipoIdent*'] === 'DNI') {
//                 if (
//                   v['NumIdent*'].length !== 8 &&
//                   v['NumIdent*'].toString().length !== 8
//                 ) {
//                   this.mensajeValidacion =
//                     '*El DNI debe de tener 8 caracteres en la colunma ' +
//                     contadorColumna;
//                   this.validaciones.push({
//                     mensajeValidacion: this.mensajeValidacion,
//                   });
//                 }
//                 if (v['NumIdent*'].toString().indexOf(' ') !== -1) {
//                   this.mensajeValidacion =
//                     '*El DNI no debe de contener espacios en la columna ' +
//                     contadorColumna;
//                   this.validaciones.push({
//                     mensajeValidacion: this.mensajeValidacion,
//                   });
//                 }

//                 var flagnumi = v['NumIdent*'].toString();
//                 flagnumi = isNaN(flagnumi);
//                 if (flagnumi) {
//                   this.mensajeValidacion =
//                     '*El DNI debe ser Numerico en la colunma ' +
//                     contadorColumna;
//                   this.validaciones.push({
//                     mensajeValidacion: this.mensajeValidacion,
//                   });
//                 }

//                 var contador = 0;
//                 var con1;
//                 var con2;
//                 let con1v;
//                 let con2v;
//                 for (let i = 0; i < v['NumIdent*'].length; i++) {
//                   con1 = v['NumIdent*'][i];
//                   con2 = v['NumIdent*'][0];
//                   if (con2 === con1) {
//                     contador++;
//                   }
//                 }
//                 if (contador === 8) {
//                   this.mensajeValidacion =
//                     '*El DNI no debe de tener los caracteres iguales en la colunma ' +
//                     contadorColumna;
//                   this.validaciones.push({
//                     mensajeValidacion: this.mensajeValidacion,
//                   });
//                 }
//                 if (v['NumIdent*'] === '12345678') {
//                   this.mensajeValidacion =
//                     '*El DNI no puede tener 12345678 en la colunma ' +
//                     contadorColumna;
//                   this.validaciones.push({
//                     mensajeValidacion: this.mensajeValidacion,
//                   });
//                 }
//                 let flagDNI = false;

//                 let columnasDNI;

//                 let DNIActual = v['NumIdent*'].toString();
//                 let flagVal = false;

//                 for (let i = 0; i < this.validacionIndentifacion.length; i++) {
//                   let valDNI =
//                     this.validacionIndentifacion[i].Indentificacion ===
//                     undefined
//                       ? ''
//                       : this.validacionIndentifacion[i].Indentificacion;

//                   if (valDNI.toString() === DNIActual.toString()) {
//                     flagVal = true;
//                   }
//                 }

//                 let contadorIntend = 1;

//                 if (flagVal === false) {
//                   this.excelJson.map((m, k) => {
//                     contadorIntend++;
//                     let DNIR = m['NumIdent*'].toString();
//                     if (
//                       v['TipoIdent*'] === 'DNI' &&
//                       m['TipoIdent*'] === 'DNI'
//                     ) {
//                       if (DNIActual === DNIR) {
//                         if (contadorIntend !== contadorColumna) {
//                           flagDNI = true;

//                           this.objcolumnas.push({
//                             columnas:
//                               contadorIntend + ' - (' + m['NumIdent*'] + ')',
//                           });
//                         }
//                       }
//                     }
//                   });
//                 }

//                 if (flagDNI) {
//                   this.validacionIndentifacion.push({
//                     Indentificacion: v['NumIdent*'],
//                   });

//                   this.objcolumnas.push({
//                     columnas: contadorColumna + ' - (' + v['NumIdent*'] + ')',
//                   });
//                 }
//               }
//               if (v['TipoIdent*'] === 'RUC') {
//                 var Ruc = v['NumIdent*'];
//                 var Ruc = Ruc.toString();
//                 if (Ruc.substr(0, 2) !== '20' && Ruc.substr(0, 2) !== '10') {
//                   this.mensajeValidacion =
//                     '*Ingrese un RUC valido en la columna ' + contadorColumna;
//                   this.validaciones.push({
//                     mensajeValidacion: this.mensajeValidacion,
//                   });
//                   return;
//                 }
//                 if (Ruc.substr(0, 2) === '20') {
//                   if (Ruc.length !== 11) {
//                     this.mensajeValidacion =
//                       '*El Ruc Persona Juridica debe de tener 11 caracteres en la colunma ' +
//                       contadorColumna;
//                     this.validaciones.push({
//                       mensajeValidacion: this.mensajeValidacion,
//                     });
//                   }

//                   let flagRUC = false;

//                   let columnasRUC;

//                   let RUCActual = v['NumIdent*'].toString();
//                   let flagVal = false;

//                   for (
//                     let i = 0;
//                     i < this.validacionIndentifacionRUC20.length;
//                     i++
//                   ) {
//                     let valRUC =
//                       this.validacionIndentifacionRUC20[i].Indentificacion ===
//                       undefined
//                         ? ''
//                         : this.validacionIndentifacionRUC20[i].Indentificacion;

//                     if (valRUC.toString() === RUCActual.toString()) {
//                       flagVal = true;
//                     }
//                   }

//                   let contadorIntend = 1;

//                   if (flagVal === false) {
//                     this.excelJson.map((m, k) => {
//                       contadorIntend++;
//                       let RUCR = m['NumIdent*'].toString();

//                       if (
//                         v['TipoIdent*'] === 'RUC' &&
//                         m['TipoIdent*'] === 'RUC'
//                       ) {
//                         if (RUCActual === RUCR) {
//                           if (contadorIntend !== contadorColumna) {
//                             flagRUC = true;

//                             this.objcolumnasRuc20.push({
//                               columnas:
//                                 contadorIntend + ' - (' + m['NumIdent*'] + ')',
//                             });
//                           }
//                         }
//                       }
//                     });
//                   }

//                   if (flagRUC) {
//                     this.validacionIndentifacionRUC20.push({
//                       Indentificacion: v['NumIdent*'],
//                     });

//                     this.objcolumnasRuc20.push({
//                       columnas: contadorColumna + ' - (' + v['NumIdent*'] + ')',
//                     });
//                   }
//                 }
//                 if (Ruc.substr(0, 2) === '10') {
//                   if (Ruc.length !== 11) {
//                     this.mensajeValidacion =
//                       '*El Ruc Persona Natural debe de tener 11 caracteres en la colunma ' +
//                       contadorColumna;
//                     this.validaciones.push({
//                       mensajeValidacion: this.mensajeValidacion,
//                     });
//                   }

//                   let flagRUC = false;

//                   let columnasRUC;

//                   let RUCActual = v['NumIdent*'].toString();
//                   let flagVal = false;

//                   for (
//                     let i = 0;
//                     i < this.validacionIndentifacionRUC10.length;
//                     i++
//                   ) {
//                     let valRUC =
//                       this.validacionIndentifacionRUC10[i].Indentificacion ===
//                       undefined
//                         ? ''
//                         : this.validacionIndentifacionRUC10[i].Indentificacion;

//                     if (valRUC.toString() === RUCActual.toString()) {
//                       flagVal = true;
//                     }
//                   }

//                   let contadorIntend = 1;

//                   if (flagVal === false) {
//                     this.excelJson.map((m, k) => {
//                       contadorIntend++;
//                       let RUCR = m['NumIdent*'].toString();

//                       if (
//                         v['TipoIdent*'] === 'RUC' &&
//                         m['TipoIdent*'] === 'RUC'
//                       ) {
//                         if (RUCActual === RUCR) {
//                           if (contadorIntend !== contadorColumna) {
//                             flagRUC = true;

//                             this.objcolumnasRuc10.push({
//                               columnas:
//                                 contadorIntend + ' - (' + m['NumIdent*'] + ')',
//                             });
//                           }
//                         }
//                       }
//                     });
//                   }

//                   if (flagRUC) {
//                     this.validacionIndentifacionRUC10.push({
//                       Indentificacion: v['NumIdent*'],
//                     });

//                     this.objcolumnasRuc10.push({
//                       columnas: contadorColumna + ' - (' + v['NumIdent*'] + ')',
//                     });
//                   }
//                 }
//               }

//               if (v['TipoIdent*'] === 'PS' || v['TipoIdent*'] === 'CE') {
//                 let psce = v['NumIdent*'];
//                 if (psce.length > 12) {
//                   this.mensajeValidacion =
//                     '*El Pasaporte(PS) o Carnet de Extranjeria(CE) no puede tener mas de 12 caracteres en la colunma ' +
//                     contadorColumna;
//                   this.validaciones.push({
//                     mensajeValidacion: this.mensajeValidacion,
//                   });
//                 }
//               }
//             }
//           }

//           if (!v['Sexo*'] || v['Sexo*'].trim() == '') {
//             this.mensajeValidacion =
//               '*El Sexo es requerido en la colunma ' + contadorColumna;
//             this.validaciones.push({
//               mensajeValidacion: this.mensajeValidacion,
//             });
//           }

//           console.log(v['FecNacimiento*']);

//           if (!v['FecNacimiento*']) {
//             this.mensajeValidacion =
//               '*La Fecha de nacimiento es requerido en la colunma ' +
//               contadorColumna;
//             this.validaciones.push({
//               mensajeValidacion: this.mensajeValidacion,
//             });
//           } else {
//             var FechaNacimiento = v['FecNacimiento*'];

//             var today = new Date();
//             var birthDate = new Date(FechaNacimiento);
//             var age = today.getFullYear() - birthDate.getFullYear();
//             var m = today.getMonth() - birthDate.getMonth();
//             if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//               age--;
//             }
//             console.log(age);
//             if (age < 16) {
//               this.mensajeValidacion =
//                 '*La Fecha de nacimiento la edad debe ser mayor o igual a 16 años en la columna ' +
//                 contadorColumna;
//               this.validaciones.push({
//                 mensajeValidacion: this.mensajeValidacion,
//               });
//             }
//           }
//           if (!v['Moneda*']) {
//             this.mensajeValidacion =
//               '*La Moneda es requerido en la colunma ' + contadorColumna;
//             this.validaciones.push({
//               mensajeValidacion: this.mensajeValidacion,
//             });
//           } else {
//             let monedas = v['Moneda*'];
//             if (monedas.indexOf(' ') !== -1) {
//               this.mensajeValidacion =
//                 '*La Moneda no debe de contener espacios en la columna ' +
//                 contadorColumna;
//               this.validaciones.push({
//                 mensajeValidacion: this.mensajeValidacion,
//               });
//             }
//           }

//           if (!v['Remuneracion*']) {
//             this.mensajeValidacion =
//               '*La Remuneracion requerido en la colunma ' + contadorColumna;
//             this.validaciones.push({
//               mensajeValidacion: this.mensajeValidacion,
//             });
//           } else {
//             let flagnumi = v['Remuneracion*'].toString();
//             let renu = flagnumi.replace('.', '');

//             let valdiarR = isNaN(renu);
//             if (valdiarR) {
//               this.mensajeValidacion =
//                 '*La Remuneracion debe ser Numerico en la colunma ' +
//                 contadorColumna;
//               this.validaciones.push({
//                 mensajeValidacion: this.mensajeValidacion,
//               });
//             }
//             if (v['Remuneracion*'].toString().indexOf(' ') !== -1) {
//               this.mensajeValidacion =
//                 '*La Remuneracion no debe de contener espacios en la columna ' +
//                 contadorColumna;
//               this.validaciones.push({
//                 mensajeValidacion: this.mensajeValidacion,
//               });
//             }
//           }

//           if (!v['EstadoCivil*'] || v['EstadoCivil*'].toString().trim() == '') {
//             this.mensajeValidacion =
//               '*El Estado Civil es requerido en la colunma ' + contadorColumna;
//             this.validaciones.push({
//               mensajeValidacion: this.mensajeValidacion,
//             });
//           }

//           if (!v['Sede*'] || v['Sede*'].toString().trim() == '') {
//             this.mensajeValidacion =
//               '*La Sede es requerido en la colunma ' + contadorColumna;
//             this.validaciones.push({
//               mensajeValidacion: this.mensajeValidacion,
//             });
//           } else {
//             if (v['Sede*'].toString().indexOf(' ') !== -1) {
//               this.mensajeValidacion =
//                 '*La Sede no debe de contener espacios en la columna ' +
//                 contadorColumna;
//               this.validaciones.push({
//                 mensajeValidacion: this.mensajeValidacion,
//               });
//             }
//             var regex = /(\d+)/g;
//             var sedes = v['Sede*'].toString();
//             var Sede = sedes.match(regex);
//             if (Sede !== null) {
//               if (!isNaN(Number(Sede[0]))) {
//                 this.mensajeValidacion =
//                   '*La Sede no deben de tener numeros en la colunma ' +
//                   contadorColumna;
//                 this.validaciones.push({
//                   mensajeValidacion: this.mensajeValidacion,
//                 });
//               }
//             }
//           }
//         }

//         this.loading = false;
//         console.log(
//           this.validaciones,
//           this.errorExecel,
//           this.flagColumnas,
//           this.objcolumnas,
//           this.objcolumnasRuc20,
//           this.objcolumnasRuc10
//         );
//       });
//     };

//     reader.readAsArrayBuffer(this.excelSubir);
//   }

//   limpiar() {
//     this.activacionExcitoso = false;
//     this.validaciones = [];
//     this.validacionIndentifacion = [];
//     this.validacionIndentifacionRUC20 = [];
//     this.validacionIndentifacionRUC10 = [];
//     this.objcolumnas = [];
//     this.objcolumnasRuc20 = [];
//     this.objcolumnasRuc10 = [];
//   }
//   buscar() {
//     this.NroPension = '';
//     this.NroSalud = '';
//     this.flagBusqueda = false;
//     this.policyemit
//       .getPolicyEmitCab(this.nrocotizacion)
//       .subscribe((res: any) => {
//         console.log(res);
//         if (res !== null) {
//           res.bsValueIni = this.polizaEmitCab.bsValueIni;
//           res.bsValueFin = this.polizaEmitCab.bsValueFin;
//           res.tipoRenovacion = this.polizaEmitCab.tipoRenovacion;
//           res.frecuenciaPago = this.polizaEmitCab.frecuenciaPago;

//           this.polizaEmitCab = res;
//           this.flagBusqueda = true;
//           if (this.polizaEmitCab.DELIMITACION === '0') {
//             this.polizaEmitCab.DELIMITACION = false;
//           } else {
//             this.polizaEmitCab.DELIMITACION = true;
//           }
//           console.log(this.polizaEmitCab);
//         } else {
//           this.polizaEmitCab = new PolizaEmitCab();
//           this.polizaEmitCab.bsValueIni = new Date('01/01/2019');
//           this.polizaEmitCab.bsValueFin = new Date();
//           this.polizaEmitCab.bsValueIniMin = new Date('01/01/2019');
//           this.polizaEmitCab.bsValueFinMax = new Date();
//           this.polizaEmitCab.TIPO_DOCUMENTO = '';
//           this.polizaEmitCab.tipoRenovacion = '';
//           this.polizaEmitCab.COD_ACT_ECONOMICA = '';
//           this.polizaEmitCab.COD_TIPO_SEDE = '';
//           this.polizaEmitCab.COD_MONEDA = '';
//           this.polizaEmitCab.COD_DEPARTAMENTO = '';
//           this.polizaEmitCab.COD_PROVINCIA = '';
//           this.polizaEmitCab.COD_DISTRITO = '';
//           this.polizaEmitCab.frecuenciaPago = '';
//         }
//       });

//     this.policyemit
//       .getPolicyEmitComer(this.nrocotizacion)

//       .subscribe((res: any) => {
//         console.log(res);
//         if (res !== null && res.length > 0) {
//           this.polizaEmitComer = res;
//           this.flagBusqueda = true;
//           console.log(this.polizaEmitComer);
//         } else {
//           this.polizaEmitComerDTO.TYPE_DOC_COMER = '';
//           this.polizaEmitComerDTO.DES_DOC_COMER = 'Seleccione';
//           this.polizaEmitComer = [];
//           this.polizaEmitComer.push(this.polizaEmitComerDTO);
//         }
//       });

//     this.policyemit
//       .getPolicyEmitDet(this.nrocotizacion)
//       .subscribe((res: any) => {
//         if (res !== null && res.length > 0) {
//           this.flagBusqueda = true;
//           console.log(res);
//           this.polizaEmitDet = res;
//           for (let i = 0; i < this.polizaEmitDet.length; i++) {
//             this.factorIgv = this.polizaEmitDet[i].FACTOR_IGV;
//             if (this.polizaEmitDet[i].TIP_RIESGO === '3') {
//               this.polizaEmitDetAltoRiesgo.NUM_TRABAJADORESAlto =
//                 this.polizaEmitDet[i].NUM_TRABAJADORES;
//               this.polizaEmitDetAltoRiesgo.MONTO_PLANILLAAlto =
//                 this.polizaEmitDet[i].MONTO_PLANILLA;
//               if (this.polizaEmitDet[i].ID_PRODUCTO == '120') {
//                 this.polizaEmitDetAltoRiesgo.TASAAltoStrc =
//                   this.polizaEmitDet[i].TASA;
//                 this.polizaEmitDetAltoRiesgo.PrimaAltoStrc =
//                   this.polizaEmitDet[i].PRIMA;
//               } else if (this.polizaEmitDet[i].ID_PRODUCTO == '121') {
//                 this.polizaEmitDetAltoRiesgo.TASAAltoSalud =
//                   this.polizaEmitDet[i].TASA;
//                 this.polizaEmitDetAltoRiesgo.PrimaAltoSalud =
//                   this.polizaEmitDet[i].PRIMA;
//               }
//             }

//             if (this.polizaEmitDet[i].TIP_RIESGO === '2') {
//               this.polizaEmitDetMedianoRiesgo.NUM_TRABAJADORESMediano =
//                 this.polizaEmitDet[i].NUM_TRABAJADORES;
//               this.polizaEmitDetMedianoRiesgo.MONTO_PLANILLAMediano =
//                 this.polizaEmitDet[i].MONTO_PLANILLA;
//               if (this.polizaEmitDet[i].ID_PRODUCTO == '120') {
//                 this.polizaEmitDetMedianoRiesgo.TASAMedianoStrc =
//                   this.polizaEmitDet[i].TASA;
//                 this.polizaEmitDetMedianoRiesgo.PrimaMedianoStrc =
//                   this.polizaEmitDet[i].PRIMA;
//               } else if (this.polizaEmitDet[i].ID_PRODUCTO == '121') {
//                 this.polizaEmitDetMedianoRiesgo.TASAMedianoSalud =
//                   this.polizaEmitDet[i].TASA;
//                 this.polizaEmitDetMedianoRiesgo.PrimaMedianoSalud =
//                   this.polizaEmitDet[i].PRIMA;
//               }
//             }
//             if (this.polizaEmitDet[i].TIP_RIESGO === '1') {
//               this.polizaEmitDetBajoRiesgo.NUM_TRABAJADORESBajo =
//                 this.polizaEmitDet[i].NUM_TRABAJADORES;
//               this.polizaEmitDetBajoRiesgo.MONTO_PLANILLABajo =
//                 this.polizaEmitDet[i].MONTO_PLANILLA;
//               if (this.polizaEmitDet[i].ID_PRODUCTO == '120') {
//                 this.polizaEmitDetBajoRiesgo.TASABajoStrc =
//                   this.polizaEmitDet[i].TASA;
//                 this.polizaEmitDetBajoRiesgo.PrimaBajoStrc =
//                   this.polizaEmitDet[i].PRIMA;
//               } else if (this.polizaEmitDet[i].ID_PRODUCTO == '121') {
//                 this.polizaEmitDetBajoRiesgo.TASABajoSalud =
//                   this.polizaEmitDet[i].TASA;
//                 this.polizaEmitDetBajoRiesgo.PrimaBajoSalud =
//                   this.polizaEmitDet[i].PRIMA;
//               }
//             }
//           }

//           let prima1SCTR: number = Number.parseFloat(
//             this.polizaEmitDetAltoRiesgo.PrimaAltoStrc === undefined ||
//               this.polizaEmitDetAltoRiesgo.PrimaAltoStrc === ''
//               ? 0
//               : this.polizaEmitDetAltoRiesgo.PrimaAltoStrc
//           );

//           let prima2SCTR: number = Number.parseFloat(
//             this.polizaEmitDetMedianoRiesgo.PrimaMedianoStrc === undefined ||
//               this.polizaEmitDetMedianoRiesgo.PrimaMedianoStrc === ''
//               ? 0
//               : this.polizaEmitDetMedianoRiesgo.PrimaMedianoStrc
//           );

//           let prima3SCTR: number = Number.parseFloat(
//             this.polizaEmitDetBajoRiesgo.PrimaBajoStrc === undefined ||
//               this.polizaEmitDetBajoRiesgo.PrimaBajoStrc === ''
//               ? 0
//               : this.polizaEmitDetBajoRiesgo.PrimaBajoStrc
//           );

//           this.primatotalSCTR = (prima1SCTR + prima2SCTR + prima3SCTR)
//             .toFixed(6)
//             .toString();

//           let prima1Salud: number = Number.parseFloat(
//             this.polizaEmitDetAltoRiesgo.PrimaAltoSalud === undefined ||
//               this.polizaEmitDetAltoRiesgo.PrimaAltoSalud === ''
//               ? 0
//               : this.polizaEmitDetAltoRiesgo.PrimaAltoSalud
//           );

//           let prima2Salud: number = Number.parseFloat(
//             this.polizaEmitDetMedianoRiesgo.PrimaMedianoSalud === undefined ||
//               this.polizaEmitDetMedianoRiesgo.PrimaMedianoSalud === ''
//               ? 0
//               : this.polizaEmitDetMedianoRiesgo.PrimaMedianoSalud
//           );

//           let prima3Salud: number = Number.parseFloat(
//             this.polizaEmitDetBajoRiesgo.PrimaBajoSalud === undefined ||
//               this.polizaEmitDetBajoRiesgo.PrimaBajoSalud === ''
//               ? 0
//               : this.polizaEmitDetBajoRiesgo.PrimaBajoSalud
//           );

//           this.primatotalSalud = (prima1Salud + prima2Salud + prima3Salud)
//             .toFixed(6)
//             .toString();

//           this.totalSTRC =
//             (this.primatotalSCTR * this.factorIgv) / 100 +
//             Number.parseFloat(this.primatotalSCTR);
//           this.totalSalud =
//             (this.primatotalSalud * this.factorIgv) / 100 +
//             Number.parseFloat(this.primatotalSalud);

//           console.log(this.polizaEmitDetAltoRiesgo);
//           console.log(this.polizaEmitDetMedianoRiesgo);
//         } else {
//           this.polizaEmitDet = [];
//           this.polizaEmitDet.push(this.polizaEmitDetDTO);

//           this.polizaEmitDetAltoRiesgo = new PolizaEmitDetAltoRiesgo();
//           this.polizaEmitDetMedianoRiesgo = new PolizaEmitDetMedianoRiesgo();
//           this.polizaEmitDetBajoRiesgo = new PolizaEmitDetBajoRiesgo();
//           this.primatotalSCTR = '';
//           this.primatotalSalud = '';
//           this.totalSTRC = '';
//           this.totalSalud = '';
//           this.factorIgv = '';
//         }
//       });
//   }

//   ObtenerTipoRenovacion() {
//     this.policyemit.getTipoRenovacion().subscribe((res: any) => {
//       this.tipoRenovacion = res;
//       this.policyemit
//         .getFrecuenciaPago(this.polizaEmitCab.tipoRenovacion)
//         .subscribe((res: any) => {
//           this.polizaEmitCab.frecuenciaPago = '';
//           this.frecuenciaPago = res;
//           console.log(this.frecuenciaPago);
//         });
//     });
//   }

//   downloadExcel() {
//     parent.location.href =
//       'http://localhost:30897/Api/ContractorLocationManager/DownloadExcel';
//   }

//   eventoCotizacion() {
//     this.flagNroCotizacion = false;

//     if (isNaN(this.nrocotizacion)) {
//       this.flagNroCotizacion = true;
//       this.flagBusqueda = false;
//     }
//   }

//   ingresar(forma: NgForm) {
//     console.log(forma);
//     this.primas = [];
//     alert(this.polizaEmitCab.bsValueFin);

//     if (
//       this.flagBusqueda === false ||
//       !this.flagFechaMenorMayor ||
//       !this.flagFechaMenorMayorFin ||
//       this.polizaEmitCab.bsValueFin.toString() === 'Invalid date' ||
//       this.polizaEmitCab.bsValueIni.toString() === 'Invalid date'
//     ) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: 'Error al insertar',
//       });
//       return;
//     }
//     let flagPension = 1;
//     if (
//       this.polizaEmitDetAltoRiesgo.PrimaAltoStrc === '' ||
//       this.polizaEmitDetMedianoRiesgo.PrimaMedianoStrc === '' ||
//       this.polizaEmitDetBajoRiesgo.PrimaBajoStrc === ''
//     ) {
//       flagPension = 0;
//     }
//     let flagSalud = 1;
//     if (
//       this.polizaEmitDetAltoRiesgo.PrimaAltoSalud === '' ||
//       this.polizaEmitDetMedianoRiesgo.PrimaMedianoSalud === '' ||
//       this.polizaEmitDetBajoRiesgo.PrimaBajoSalud === ''
//     ) {
//       flagSalud = 0;
//     }
//     this.policyemit.nroPolizas(flagSalud, flagPension).subscribe((res: any) => {
//       this.NroPension = res.P_POL_PENSION;
//       this.NroSalud = res.P_POL_SALUD;
//       this.ProductoSalud = res.P_PROD_SALUD;
//       this.ProductoPension = res.P_PROD_PENSION;
//       if (this.NroPension !== '' && this.NroSalud !== '') {
//         if (this.NroPension !== 0 && this.NroSalud !== 0) {
//           this.primas.push(
//             {
//               PrimaMinima: this.polizaEmitCab.MIN_SALUD,
//               PrimaPropuesta: this.polizaEmitCab.MIN_SALUD_PR,
//               NroPoliza: this.NroSalud,
//               PrimaNeta: this.primatotalSalud,
//               IGV: this.factorIgv,
//               Producto: this.ProductoSalud,
//               TotalBruto: this.totalSalud,
//             },
//             {
//               PrimaMinima: this.polizaEmitCab.MIN_PENSION,
//               PrimaPropuesta: this.polizaEmitCab.MIN_PENSION_PR,
//               NroPoliza: this.NroPension,
//               PrimaNeta: this.primatotalSCTR,
//               IGV: this.factorIgv,
//               Producto: this.ProductoPension,
//               TotalBruto: this.totalSTRC,
//             }
//           );
//         } else if (this.NroPension === 0 && this.NroSalud !== 0) {
//           this.primas.push({
//             PrimaMinima: this.polizaEmitCab.MIN_SALUD,
//             PrimaPropuesta: this.polizaEmitCab.MIN_SALUD_PR,
//             NroPoliza: this.NroSalud,
//             PrimaNeta: this.primatotalSalud,
//             IGV: this.factorIgv,
//             TotalBruto: this.totalSalud,
//           });
//         } else if (this.NroPension !== 0 && this.NroSalud === 0) {
//           this.primas.push({
//             PrimaMinima: this.polizaEmitCab.MIN_PENSION,
//             PrimaPropuesta: this.polizaEmitCab.MIN_PENSION_PR,
//             NroPoliza: this.NroPension,
//             PrimaNeta: this.primatotalSCTR,
//             IGV: this.factorIgv,
//             TotalBruto: this.totalSTRC,
//           });
//         }

//         let flagTodoOk = false;
//         for (let i = 0; i < this.primas.length; i++) {
//           this.savedPolicyEmit.P_NID_COTIZACION = this.nrocotizacion;
//           this.savedPolicyEmit.P_NPRODUCT = this.primas[i].Producto;
//           this.savedPolicyEmit.P_NPOLICY = this.primas[i].NroPoliza;
//           this.savedPolicyEmit.P_SCOLTIMRE = this.polizaEmitCab.tipoRenovacion;
//           this.savedPolicyEmit.P_DSTARTDATE = this.polizaEmitCab.bsValueIni;
//           this.savedPolicyEmit.P_DEXPIRDAT = this.polizaEmitCab.bsValueFin;
//           this.savedPolicyEmit.P_NPAYFREQ = this.polizaEmitCab.frecuenciaPago;
//           this.savedPolicyEmit.P_FACT_MES_VENCIDO =
//             this.polizaEmit.facturacionVencido;
//           this.savedPolicyEmit.P_NPREM_MIN = this.primas[i].PrimaMinima;
//           this.savedPolicyEmit.P_NPREM_MINIUM_PROP =
//             this.primas[i].PrimaPropuesta;
//           this.savedPolicyEmit.P_NPREM_NETA = this.primas[i].PrimaNeta;
//           this.savedPolicyEmit.P_IGV = this.primas[i].IGV;
//           this.savedPolicyEmit.P_NPREM_BRU = this.primas[i].TotalBruto;
//           console.log(this.savedPolicyEmit);

//           this.policyemit.savePolicyEmit(this.savedPolicyEmit).subscribe(
//             (res: any) => {
//               console.log(res);
//               if (
//                 res.P_CODIGO_FIN === 1 &&
//                 res.P_MESSAGE === 'INSERCIÓN EXITOSA'
//               ) {
//                 flagTodoOk = true;
//                 if (flagTodoOk) {
//                   Swal.fire({
//                     icon: 'success',
//                     title: 'Exito',
//                     text: res.P_MESSAGE,
//                   });
//                 } else {
//                   Swal.fire({
//                     icon: 'error',
//                     title: 'Error',
//                     text: 'Error al insertar',
//                   });
//                 }
//               }
//             },
//             (err) => {
//               Swal.fire({
//                 icon: 'error',
//                 title: 'Error',
//                 text: ' "Error de Sistemas. Comunicarse con Soporte!"',
//               });
//             }
//           );
//         }

//         /* */
//       }
//     });
//   }

//   validarArchivos() {
//     this.archivosJson = [];
//     var tamañoArchivo = 0;
//     var flagExtension = false;
//     for (let i = 0; i < this.files.length; i++) {
//       let size = (this.files[i].size / 1024 / 1024).toFixed(3);
//       let sizeNumber = Number.parseFloat(size);
//       tamañoArchivo = tamañoArchivo + sizeNumber;
//       var extensiones_permitidas = [
//         '.jpeg',
//         '.jpg',
//         '.png',
//         '.bmp',
//         '.pdf',
//         '.txt',
//         '.doc',
//         '.xls',
//         '.xlsx',
//         '.docx',
//         '.xlsm',
//         '.xltx',
//         '.xltm',
//         '.xlsb',
//         '.xlam',
//         '.docm',
//         '.dotx',
//         '.dotm',
//         '.pptx',
//         '.pptm',
//         '.potx',
//         '.potm',
//         '.ppam',
//         '.ppsx',
//         '.ppsm',
//         '.sldx',
//         '.sldm',
//         '.thmx',
//         '.zip',
//         '.rar',
//       ];
//       var rutayarchivo = this.files[i].name;
//       var ultimo_punto = this.files[i].name.lastIndexOf('.');
//       var extension = rutayarchivo.slice(ultimo_punto, rutayarchivo.length);
//       if (flagExtension === false) {
//         if (extensiones_permitidas.indexOf(extension) == -1) {
//           flagExtension = true;
//         }
//       }
//     }
//     if (flagExtension) {
//       this.archivosJson.push({
//         error: 'Solo se aceptan imagenes y documentos',
//       });

//       return;
//     }
//     if (tamañoArchivo > 10) {
//       this.archivosJson.push({
//         error: 'Los archivos en total no deben de tener mas de 10 mb',
//       });

//       return;
//     }
//   }

//   activaciones() {
//     this.activacion = true;
//     this.polizaEmitCab.bsValueIniMin = new Date('01/01/2019');
//     this.polizaEmitCab.bsValueFinMax = new Date();
//   }
//   activacionesFin() {
//     this.activacionFin = true;
//     this.polizaEmitCab.bsValueIniMin = new Date('01/01/2019');
//     this.polizaEmitCab.bsValueFinMax = new Date();
//   }
//   validarFechaFin(event: any) {
//     console.log(this.polizaEmitCab.bsValueFin);
//     this.flagFechaMenorMayorFin = true;
//     var fechaInicioMenor = new Date('01/01/2019');
//     var fechaInicioMayor = new Date();
//     /*var fechafin = this.hasta.nativeElement.value.split("/");
// 		var fechafines = (fechafin[1])+"/"+fechafin[0]+"/"+fechafin[2];*/
//     let fechad = new Date(this.polizaEmitCab.bsValueFin);
//     if (this.activacionFin && this.flagFechaMenorMayorFin) {
//       if (
//         this.polizaEmitCab.tipoRenovacion === '7' ||
//         this.polizaEmitCab.tipoRenovacion === '6'
//       ) {
//         if (fechad < fechaInicioMenor) {
//           this.flagFechaMenorMayorFin = false;
//         }
//         if (event > fechaInicioMenor) {
//           this.flagFechaMenorMayorFin = true;
//         }
//         if (fechad > fechaInicioMayor) {
//           this.flagFechaMenorMayorFin = false;
//         }
//         if (event < fechaInicioMayor) {
//           this.flagFechaMenorMayorFin = true;
//         }
//       }
//     }
//   }
//   validarTipoRenovacion(event: any) {
//     this.flagFechaMenorMayor = true;
//     var fechaInicioMenor = new Date('01/01/2019');
//     var fechaInicioMayor = new Date();
//     var fechafin = this.desde.nativeElement.value.split('/');
//     var fechafines = fechafin[1] + '/' + fechafin[0] + '/' + fechafin[2];
//     let fechad = new Date(fechafines);
//     if (this.polizaEmitCab.tipoRenovacion === '7') {
//       this.disabledFecha = false;
//     }
//     if (this.activacion && this.flagFechaMenorMayor) {
//       if (fechad < fechaInicioMenor) {
//         this.flagFechaMenorMayor = false;
//       }
//       if (event > fechaInicioMenor) {
//         this.flagFechaMenorMayor = true;
//       }
//       if (fechad > fechaInicioMayor) {
//         this.flagFechaMenorMayor = false;
//       }
//       if (event < fechaInicioMayor) {
//         this.flagFechaMenorMayor = true;
//       }
//       if (this.flagFechaMenorMayor) {
//         console.log(event);
//         this.fechaEvento = event;

//         let fechad = new Date(event);

//         if (this.polizaEmitCab.tipoRenovacion === '5') {
//           fechad.setMonth(fechad.getMonth() + 1);
//           fechad.setDate(fechad.getDate() - 1);
//           this.polizaEmitCab.bsValueFin = new Date(fechad);
//           this.flagFechaMenorMayorFin = true;
//         }
//         if (this.polizaEmitCab.tipoRenovacion === '4') {
//           fechad.setMonth(fechad.getMonth() + 2);
//           fechad.setDate(fechad.getDate() - 1);
//           this.polizaEmitCab.bsValueFin = new Date(fechad);
//           this.flagFechaMenorMayorFin = true;
//         }
//         if (this.polizaEmitCab.tipoRenovacion === '3') {
//           fechad.setMonth(fechad.getMonth() + 2);
//           fechad.setDate(fechad.getDate() - 1);
//           this.polizaEmitCab.bsValueFin = new Date(fechad);
//           this.flagFechaMenorMayorFin = true;
//         }

//         if (this.polizaEmitCab.tipoRenovacion === '2') {
//           fechad.setMonth(fechad.getMonth() + 6);
//           fechad.setDate(fechad.getDate() - 1);
//           this.polizaEmitCab.bsValueFin = new Date(fechad);
//           this.flagFechaMenorMayorFin = true;
//         }

//         if (this.polizaEmitCab.tipoRenovacion === '1') {
//           fechad.setFullYear(fechad.getFullYear() + 1);
//           fechad.setDate(fechad.getDate() - 1);
//           this.polizaEmitCab.bsValueFin = new Date(fechad);
//           this.flagFechaMenorMayorFin = true;
//         }
//       }
//     }
//   }

//   /* */

//   habilitarFechas() {
//     if (
//       this.polizaEmitCab.bsValueFin.toString() === 'Invalid date' ||
//       this.polizaEmitCab.bsValueIni.toString() === 'Invalid date'
//     )
//       return;
//     this.activacion = false;
//     this.disabledFecha = true;

//     this.policyemit
//       .getFrecuenciaPago(this.polizaEmitCab.tipoRenovacion)
//       .subscribe((res: any) => {
//         this.polizaEmitCab.frecuenciaPago = '';
//         this.frecuenciaPago = res;
//         console.log(this.frecuenciaPago);
//       });
//     if (this.polizaEmitCab.tipoRenovacion === '6') {
//       this.disabledFecha = false;

//       this.polizaEmitCab.bsValueIniMin = new Date('01/01/2019');
//       this.polizaEmitCab.bsValueFinMax = new Date();
//       this.polizaEmitCab.bsValueIni = new Date('01/01/2019');
//       this.polizaEmitCab.bsValueFin = new Date();

//       this.disabledFecha = false;
//     }
//     if (this.polizaEmitCab.tipoRenovacion === '7') {
//       this.polizaEmitCab.bsValueIniMin = new Date('01/01/2019');
//       this.polizaEmitCab.bsValueFinMax = new Date();
//       this.polizaEmitCab.bsValueIni = new Date('01/01/2019');
//       this.polizaEmitCab.bsValueFin = new Date();
//       this.disabledFecha = false;
//     }
//     if (this.flagFechaMenorMayor || this.flagFechaMenorMayorFin) {
//       var fechafin = this.desde.nativeElement.value.split('/');
//       var fechafines = fechafin[1] + '/' + fechafin[0] + '/' + fechafin[2];
//       let fechad = new Date(fechafines);

//       if (this.polizaEmitCab.tipoRenovacion === '5') {
//         fechad.setMonth(fechad.getMonth() + 1);
//         fechad.setDate(fechad.getDate() - 1);
//         this.polizaEmitCab.bsValueFin = new Date(fechad);
//         this.flagFechaMenorMayorFin = true;
//       }
//       if (this.polizaEmitCab.tipoRenovacion === '4') {
//         fechad.setMonth(fechad.getMonth() + 2);
//         fechad.setDate(fechad.getDate() - 1);
//         this.polizaEmitCab.bsValueFin = new Date(fechad);
//         this.flagFechaMenorMayorFin = true;
//       }
//       if (this.polizaEmitCab.tipoRenovacion === '3') {
//         fechad.setMonth(fechad.getMonth() + 2);
//         fechad.setDate(fechad.getDate() - 1);
//         this.polizaEmitCab.bsValueFin = new Date(fechad);
//         this.flagFechaMenorMayorFin = true;
//       }

//       if (this.polizaEmitCab.tipoRenovacion === '2') {
//         fechad.setMonth(fechad.getMonth() + 6);
//         fechad.setDate(fechad.getDate() - 1);
//         this.polizaEmitCab.bsValueFin = new Date(fechad);
//         this.flagFechaMenorMayorFin = true;
//       }

//       if (this.polizaEmitCab.tipoRenovacion === '1') {
//         fechad.setFullYear(fechad.getFullYear() + 1);
//         fechad.setDate(fechad.getDate() - 1);
//         this.polizaEmitCab.bsValueFin = new Date(fechad);
//         this.flagFechaMenorMayorFin = true;
//       }
//     }
//   }

//   // private prepairForm(){ //Bloquear, ocultar los elemetos del form según el modo
//   //   if( this.polizaEmitCab.mode=="emit"){

//   //   }else if(this.mode=="include"){

//   //   }else if(this.mode="renew"){

//   //   }else{ //si el parametro no fue pasado correctamente

//   //   }
//   // }
// }
