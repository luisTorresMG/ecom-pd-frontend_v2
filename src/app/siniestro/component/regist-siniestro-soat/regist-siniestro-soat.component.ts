import { Component, OnInit, Input, OnDestroy, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from "ngx-spinner";
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
//import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
//import { NgxCaptchaModule } from 'ngx-captcha';
import {NgxCaptchaModule} from 'ngx-captcha';
//import {DOMRegitersoliitud} from 'src/app/siniestro/component/interfaces/formregister.interface';
import {siniestroservice} from '../services/siniestro.service';
import { exit } from 'process';
//import { FileReader } from 'rxjs';
import * as moment from 'moment';
import { fromEvent } from 'rxjs';
//import { event } from 'jquery';
import { Router } from '@angular/router';

@Component({
  selector: 'app-regist-siniestro-soat',
  templateUrl: './regist-siniestro-soat.component.html',
  styleUrls: ['./regist-siniestro-soat.component.sass','./regist-siniestro-soat.component.css']
})
export class RegistSiniestroSoatComponent implements OnInit, AfterViewInit {


  @Input() Factual: any;
  resultado: string;
  public form: FormGroup;
  public disableagraviado: boolean = false;
  checkboxMarcado: boolean = false;
 /* @Input()*/
  fechahoy: string;



  selectDeshabilitado: boolean = true;
  uploadSuccess: boolean;
  fechaFormateada: string;
  //sitekey: string = "6Lcd-gAmAAAAAI_HuFKZX8lG2oXacMIozX3xRT3R"; //codigo captcha local
  //sitekey: string = "6Lfn13QmAAAAAOWGyLtu78ZrvpSq4-n_xZjw-Kaz"; //codigo Captcha ya configuradoal servidor de protecta
  //sitekey: string = "6Ld8P10mAAAAAND7mB3S6-Bx8N9dfdIFlWCRfxMa"; //new dominio: plataformadigital.stg.protectasecurity.pe
  sitekey: string = "6Lc4sn8UAAAAAD1V604HezdXnlLTz2n4-dhKLjpm"; // Nuevo Dominio Dev Mente
  uploadedFiles:{ name: string, type: string, size: string, base64: string }[] = [];
  emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}(?:\.[A-Z]{2})?$/i;
  totalfile : number= 0;
  //selectmetodopago: number=16173;
  adjunto: File[] = [];
  fechaseleccionadahoy: string;
  fechaSeleccionada: Date;
  ocultarInput = false;
  ListarTipoDocumentSol:any = [];
  LisrtarActivarCobertura: any = [];
  ListarActivarCoverturaR: any = [];
  ListarTipoDocumentAgraviado: any = [];
  ListarEntidadBancaria: any = [];
  ListarMetodoPago: any = [];
  private clickSubscription: any;
  private isScreenBlocked = false;
  user: string ="abc12.15";
  pass: string = "abs12.15"

  token: any = [];
  isLoading: boolean = false;
  isButtonClicked: boolean = false;
  txtvalidanrodoc: string ="Campo obligatorio";
  txtvalidanrodocagrav: string = "Campo obligatorio";
  txtvalidanombres: string = "Campo obligatorio";
  txtvalidanombresagra: string = "Campo obligatorio";
  txtvalidaRsocial: string = "Campo obligatorio";
  txtvalidaapellidoagra: string = "Campo obligatorio";
  txtvalueEB: string;
  txtvalidaapellidsol: string = "Campo obligatorio";
  txtvalidaColor: string='#dc3545';
  txtvalidaColorRS: string='#dc3545';
  txtvalidacolorapellidos: string = '#dc3545';
  colornombreagrav: string ='#dc3545';
  colorapellidagrav: string = '#dc3545';
  txtplaca: string = "Campo obligatorio";
  coberturaSeleccionada: boolean = false;

  nrodocusolglobal: boolean = true;

    constructor(
    public fb:FormBuilder,
    private spinner: NgxSpinnerModule,
    private modalService: NgbModal,
   // private http:HttpClient,
    private siniestroservice: siniestroservice,
    private router: Router,

     ) {

     // this.sitekey='6Lcd-gAmAAAAAI_HuFKZX8lG2oXacMIozX3xRT3R';
      }



  get tipodocumentosol(){
    return this.formregister.get('tipodocumentosol') as FormControl;
  }
  get documentosol(){

    return this.formregister.get('documentosol') as FormControl;

  }
  /*get documentosol() {
    const txtvalidatortipodoc = this.formregister.get('documentosol').value;
    return txtvalidatortipodoc.length > 8 ? 'Hay más de 8 caracteres' : '';
  } */

  get nombressolicitante(){
    return this.formregister.get('nombressolicitante') as FormControl;
  }
  get apellidosssolicitante(){
    return this.formregister.get('apellidosssolicitante') as FormControl;
  }
  get emailsolicitante(){
    return this.formregister.get('emailsolicitante') as FormControl;
  }
  get rucsolicitante(){
    return this.formregister.get('rucsolicitante') as FormControl;
  }
  get nrotelefonosolicitante(){
    return this.formregister.get('nrotelefonosolicitante') as FormControl;
  }
  get direccionsolicitante(){
    return this.formregister.get('direccionsolicitante') as FormControl;
  }
  get checksol(){
    return this.formregister.get('checksol') as FormControl;
  }
  get tipodocumentoagraviado(){
    return this.formregister.get('tipodocumentoagraviado') as FormControl;
  }
  get documentoagraviado(){
    return this.formregister.get('documentoagraviado') as FormControl;
  }
  get nombresagraviado(){
    return this.formregister.get('nombresagraviado') as FormControl;
  }
 /* get rucagraviado(){
    return this.formregister.get('rucagraviado') as FormControl;
  } */
  get apellidosagraviado(){
    return this.formregister.get('apellidosagraviado') as FormControl;
  }
  get nroplacavehiculoagraviado(){
    return this.formregister.get('nroplacavehiculoagraviado') as FormControl;
  }
  get fechasiniestroagraviado(){
    return this.formregister.get('fechasiniestroagraviado') as FormControl;
  }

  get slectmetodopago(){
    return this.formregister.get('slectmetodopago') as FormControl;
  }
  get slecentidadbancaria(){
    return this.formregister.get('slecentidadbancaria') as FormControl;
  }
  get nameentidad(){
    return this.formregister.get('nameentidad') as FormControl;
  }
  get nrocuenta(){
    return this.formregister.get('nrocuenta') as FormControl;
  }
  get direccionagraviado(){
    return this.formregister.get('direccionagraviado') as FormControl;
  }
  get activarcobertura(){
    return this.formregister.get('activarcobertura') as FormControl;
  }
  get activarcoberturaR(){
    return this.formregister.get('activarcoberturaR') as FormControl;
  }
  get codigointerbancario(){
    return this.formregister.get('codigointerbancario') as FormControl;
  }
  get uploadfiledocument(){
    return this.formregister.get('uploadfiledocument') as FormControl;
  }
  get recaptcha(){
    return this.formregister.get('recaptcha') as FormControl;
  }

   fecha = new Date();

  formregister = this.fb.group({
    tipodocumentosol : ["13652", Validators.required],
    documentosol: ['',[Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern(/^[0-9]+$/)]],
    "nombressolicitante" : ['',[Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    "apellidosssolicitante" : ['',[Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    "emailsolicitante" :  ['', [Validators.email, Validators.pattern(this.emailRegex), Validators.maxLength(50)]],
    "rucsolicitante" : [''],
    "nrotelefonosolicitante": ['',[Validators.minLength(7), Validators.maxLength(9)]],
    "direccionsolicitante" : ['', Validators.required],
    "checksol" :[false],
    "tipodocumentoagraviado" : ["15473", Validators.required],
    "documentoagraviado" : ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern(/^[0-9]+$/)]],
    "nombresagraviado" : ['',[Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
   /* "rucagraviado" : ['',[Validators.required, Validators.minLength(20), Validators.maxLength(20)]],*/
    "apellidosagraviado" : ['',[Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    "direccionagraviado" : ['', Validators.required],
    "nroplacavehiculoagraviado" : ['',[Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    "fechasiniestroagraviado" : [moment(this.fecha).format('YYYY-MM-DD')],
    "activarcobertura" : ["16000"],
    "activarcoberturaR" : ["16289"],
    "slectmetodopago" : ["16173"],
    "slecentidadbancaria" : ["100"],
    "nameentidad": [''],
    "nrocuenta": [''],
    "codigointerbancario" : [''],
    "uploadfiledocument": ['', Validators.required],
    "recaptcha": ['',Validators.required],


  });
  maxFecha(): string {
    const fechaActual = new Date().toISOString().split('T')[0];
   //console.log("maxfecha", fechaActual);
    return fechaActual;

  }


  pruebafecha(){
    console.log("fecha-seleccionada", this.fechaSeleccionada, this.fechaFormateada, "fechaAgraviado", this.fechasiniestroagraviado.value);
  }

  ngOnInit(){

  this.checkboxMarcado = false;
  this.selectDeshabilitado = true;
  this.rucsolicitante.setValue('');
  this.rucsolicitante.clearAsyncValidators();
  this.rucsolicitante.updateValueAndValidity();

  //console.log("FechaselectAhorita", this.fechasiniestroagraviado.value, "Fechapor defecto", this.fecha);
  this.validatetoken();


 /* this.clickSubscription = fromEvent(document, 'click').subscribe((event: MouseEvent) => {
    if (this.isScreenBlocked && !event.target['classList'].contains('swal2-confirm')) {
      event.stopPropagation();
      event.preventDefault();
    }
  }); */
  }
  ngAfterViewInit(): void {
    this.isLoading = true;

    // Simular una operación asíncrona que tarda un tiempo en cargar
    setTimeout(() => {
      this.isLoading = false;
    }, 3000); // Tiempo de espera de 2 segundos (ajusta esto según tus necesidades)
  }

  /*handleChange() {
    this.documentosol.value;
    console.log("valor-documetosol", this.documentosol.value);
    const tipodocumentoSolValue =this.tipodocumentosol.value;
    console.log("Valor-Tipodocsol", tipodocumentoSolValue);
    if (this.tipodocumentosol.value == 13652 && this.documentosol.value.length > 8) {
      this.txtvalidanrodoc = 'No debe ser mayor a 8';
    } else if (this.documentosol.value.length === 0) {
      this.txtvalidanrodoc = 'Campo obligatorio';
    }else if(this.tipodocumentosol.value == 13652 && this.documentosol.value.length === 8){
      this.txtvalidanrodoc = 'Correcto';
    }
    else {
      this.txtvalidanrodoc = 'debe tener 8 dígitos';
    }

  } */

  handleChange() {
    const documentoSolValue = this.documentosol.value;
    const tipodocumentoSolValue = this.tipodocumentosol.value;
    console.log("ValueTipo",this.tipodocumentosol.value);
    console.log("ValueDoc",this.documentosol.value);
    if (this.tipodocumentosol.value == 13652 && this.documentosol.value.length > 8) {
      this.txtvalidanrodoc = 'No debe ser mayor a 8 caracteres';
    } else if (this.tipodocumentosol.value == 13653 && this.documentosol.value.length > 20) {
      this.txtvalidanrodoc = 'No debe ser mayor a 20 caracteres';
    } else if(this.tipodocumentosol.value == 13654 && this.documentosol.value.length > 11){
      this.txtvalidanrodoc = 'No debe ser mayor a 11 caracteres';
    } else if(this.tipodocumentosol.value == 15467 && this.documentosol.value.length > 20){
      this.txtvalidanrodoc = 'No debe ser mayor a 20 caracteres';
    }
     else if (this.documentosol.value.length == 0) {
      this.txtvalidanrodoc = 'Campo obligatorio';
    } else if ((this.tipodocumentosol.value == 13652 && this.documentosol.value.length == 8) || (this.tipodocumentosol.value == 13653 && this.documentosol.value.length == 20) || (this.tipodocumentosol.value == 13654 && this.documentosol.value.length == 11) || (this.tipodocumentosol.value == 15467 && this.documentosol.value.length == 20)) {
      this.txtvalidanrodoc = 'Correcto';
    } else {
      //this.txtvalidanrodoc = '';
      if(this.tipodocumentosol.value == 13652){
        this.txtvalidanrodoc = 'Debe tener 8 caracteres';
      }
      if(this.tipodocumentosol.value == 13653){
        this.txtvalidanrodoc = 'Debe tener 20 caracteres';
      }
      if(this.tipodocumentosol.value == 13654){
        this.txtvalidanrodoc = 'Debe tener 11 caracteres';
      }
      if(this.tipodocumentosol.value == 15467){
        this.txtvalidanrodoc = 'Debe tener 20 caracteres';
      }
    }
  }


  handleChange2(){
    if (this.tipodocumentoagraviado.value == 15473 && this.documentoagraviado.value.length > 8) {
      this.txtvalidanrodocagrav = 'No debe ser mayor a 8';
    } else if (this.documentoagraviado.value.length === 0) {
      this.txtvalidanrodocagrav = 'Campo obligatorio';
    } else if(this.tipodocumentoagraviado.value == 15473 && this.documentoagraviado.value.length > 20){
      this.txtvalidanrodocagrav = 'No debe ser mayor a 20';
    } else if(this.tipodocumentoagraviado.value == 16201 && this.documentoagraviado.value.length > 20){
      this.txtvalidanrodocagrav = 'No debe ser mayor a 20';
    }
    else if((this.tipodocumentoagraviado.value == 15473 && this.documentoagraviado.value.length == 8) ||(this.tipodocumentoagraviado.value == 16201 && this.documentoagraviado.value.length == 20) ||(this.tipodocumentoagraviado.value == 16202 && this.documentoagraviado.value.length == 20)){
      this.txtvalidanrodocagrav = 'Correcto';
    }
    else {

      if(this.tipodocumentoagraviado.value == 15473){ // dni agraviado
        this.txtvalidanrodocagrav = 'Debe tener 8 dígitos';
      }
      if(this.tipodocumentoagraviado.value == 16201){ // carnet de extranjeria
        this.txtvalidanrodocagrav = 'Debe tener 20 caracteres';
      }
      if(this.tipodocumentoagraviado.value == 16202){  //pasaporte
        this.txtvalidanrodocagrav = 'Debe tener 20 caracteres';
      }
    }

  }
  ngO
 /* handleChange() {
    const documentoSolValue = this.documentosol.value;
    console.log('valor-docmentisolo', documentoSolValue);
    const tipodocumentoSolValue = this.tipodocumentosol.value;
    console.log('valor-tipodocumentosol', tipodocumentoSolValue);
    if (!documentoSolValue || documentoSolValue.length === 0) {
      this.txtvalidanrodoc = 'Campo obligatorio';
    } else if (tipodocumentoSolValue === 13652) {
      if (documentoSolValue.length > 8) {
        this.txtvalidanrodoc = 'No debe ser mayor a 8 caracteres';
      } else if (documentoSolValue.length < 8) {
        this.txtvalidanrodoc = 'Debe ser igual o mayor a 8 caracteres';
      } else {
        this.txtvalidanrodoc = 'Correcto';
      }
    } else {
      this.txtvalidanrodoc = 'Campo obligatorio'; // Si no se cumple ninguna condición, puedes asignar un valor vacío o lo que consideres adecuado.
    }
  }*/






  handleChangePlaca() {
    const placa = this.nroplacavehiculoagraviado.value;

    const regex = /^[a-zA-Z0-9]*$/; // Expresión regular para permitir solo letras, números y espacios

    if (placa.length > 6) {
      this.txtplaca = 'No debe ser mayor a 6 caracteres';
    } else if (placa.length === 0) {
      this.txtplaca = 'Campo obligatorio';
    } else if (!regex.test(placa) || /[^\w\s]/.test(placa)) {
      this.txtplaca = 'No se permiten caracteres especiales';
    } else {
      this.txtplaca = 'Debe tener 6 dígitos';
    }
  }

  bloquearCaracteresEspeciales(event: any) {
    const allowedCharacters = /^[a-zA-Z0-9]*$/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!allowedCharacters.test(inputChar)) {
      event.preventDefault();
    }
  }
  bloquearCaracteresEspecialesbanco(event: any) {
    const allowedCharacters = /^[0-9\-]*$/; // Expresión regular para permitir números, guiones y otros caracteres especiales
    const inputChar = String.fromCharCode(event.charCode);

    if (!allowedCharacters.test(inputChar)) {
      event.preventDefault(); // Bloquear el carácter si no está permitido
    }
  }



  handleChangecobertura() {
    if (this.activarcobertura.value !== '16000') {
      this.coberturaSeleccionada = true;
    } else {
      this.coberturaSeleccionada = false;
    }
  }

nDestroy(){
    this.clickSubscription.unsubscribe();
  }

  validatetoken(){
    var data: any ={
      username: this.user,
      password: this.pass,
    };
 this.siniestroservice.getToken(data).subscribe((res: any) =>{
      this.token = res.token;
      //console.log("token", this.token);

      this.servisllamarlista();
    },(error) =>{console.log("errortoken", error)}
    );
  }

  servisllamarlista(){
//listar Activar cobertura
this.siniestroservice.getListar(2, this.token).subscribe((response) =>{
  this.LisrtarActivarCobertura = response;
  console.log("Datos", this.LisrtarActivarCobertura);
}, (error) =>{console.log("Error", error);}
);
//listar tipo de documentos sol VAlidar la columna SNCODE_Sol
this.siniestroservice.getListar(1, this.token).subscribe((response) =>{
  this.ListarTipoDocumentSol = response;
  console.log("DocumentoSol", this.ListarTipoDocumentSol);
}, (error) =>{console.log("Error", error);}
);
//listar tipo de documentos Agravaiado Validar la columna SNCODE_AGRAV.
this.siniestroservice.getListar(1, this.token).subscribe((response) =>{
  this.ListarTipoDocumentAgraviado = response;
  console.log("DocumentoAgrav", this.ListarTipoDocumentAgraviado);
}, (error) =>{console.log("Error", error);}
);

//listar Activar docverturaR.
this.siniestroservice.getListar(6, this.token).subscribe((response) =>{
  this.ListarActivarCoverturaR = response;
  console.log("ActivarDoberuraR", this.ListarActivarCoverturaR);
}, (error) =>{console.log("Error", error);}
);

 //listar Metodo de pago.
 this.siniestroservice.getListar(3, this.token).subscribe((response) =>{
  this.ListarMetodoPago = response;
  console.log("ListarMedotoPago", this.ListarMetodoPago);
}, (error) =>{console.log("Error", error);}
);

 //listar Entidad Bancaria.
 this.siniestroservice.getListar(4, this.token).subscribe((response) =>{
  this.ListarEntidadBancaria = response;
  console.log("Entidad Bancaria", this.ListarEntidadBancaria);
}, (error) =>{console.log("Error", error);}
);

  }

  noPermitirPegar(event: ClipboardEvent) {
    event.preventDefault();
  }

  soloLetras(event: KeyboardEvent) {
    const tecla = event.key.toLowerCase();
    const letras = " áéíóúabcdefghijklmnñopqrstuvwxyz"; // incluimos el espacio en blanco
    const especiales = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete'];
    const tecla_especial = especiales.includes(tecla);

    if (!letras.includes(tecla) && tecla !== '%' && !tecla_especial) {
      event.preventDefault();
    }
  }
  soloLetrasrsocial(event: KeyboardEvent) {
    const tecla = event.key;
    const numerosLetrasYPuntoEspacio = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ. ";
    const especiales = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete'];
    const tecla_especial = especiales.includes(tecla);

    if (!numerosLetrasYPuntoEspacio.includes(tecla) && !tecla_especial) {
        event.preventDefault();
    }
}

   validarTexto(valor: string) {  //05072023 15:17hrs
    this.txtvalidaColor = '#dc3545';
    const letras = " áéíóúabcdefghijklmnñopqrstuvwxyz"; // incluimos el espacio en blanco
    const tienePorcentaje = valor.includes('%');

    /*if (tienePorcentaje || valor.split('').some((caracter) => !letras.includes(caracter))) {
      this.txtvalidanombres = 'Texto no válido';
      console.log('Texto no válido', this.txtvalidanombres);
      this.txtvalidaColor = '#dc3545'; // Asignar el color rojo para el mensaje de "Texto no válido"
    } else */ if (valor.length > 2) {
      this.txtvalidanombres = 'Correcto';
      console.log('Correcto', this.txtvalidanombres);
      this.txtvalidaColor = '#050B70'; // Asignar el color verde para el mensaje de "Correcto"
    } else if(valor.length === 0){this.txtvalidanombres = 'Campo obligatorio'; this.txtvalidaColor = '#dc3545';}
    else {
      this.txtvalidanombres = 'Campo obligatorio';
      console.log('Campo obligatorio', this.txtvalidanombres);
      this.txtvalidaColor = '#dc3545'; // Asignar el color negro para el mensaje de "Campo obligatorio"
    }

    if (tienePorcentaje) {
      this.nombressolicitante.setValue(valor.replace('%', ''));
    }
  }
  onKeyDown(event: KeyboardEvent) {
    const char = event.key;
    const upperChar = char.toUpperCase();
    const isLetter = /[a-zA-Z]/.test(char);
    if (isLetter) {
      event.preventDefault();
      document.execCommand('insertText', false, upperChar);
    }
  }
 /* validarTextoRsocial(valor: string) {
    this.txtvalidaColorRS = '#dc3545';
    const letras = " áéíóúabcdefghijklmnñopqrstuvwxyz"; // incluimos el espacio en blanco
    const tienePorcentaje = valor.includes('%');

    if (tienePorcentaje || valor.split('').some((caracter) => !letras.includes(caracter))) {
      this.txtvalidaRsocial = 'Texto no válido';
      console.log('Texto no válido', this.txtvalidaRsocial);
      this.txtvalidaColorRS = '#dc3545'; // Asignar el color rojo para el mensaje de "Texto no válido"
    } else if (valor.length > 5) {
      this.txtvalidaRsocial = 'Correcto';
      console.log('Correcto', this.txtvalidaRsocial);
      this.txtvalidaColorRS = '#050B70'; // Asignar el color verde para el mensaje de "Correcto"
    } else if(valor.length === 0){this.txtvalidaRsocial = 'Campo obligatorio'; this.txtvalidaColorRS = '#dc3545';}
    else {
      this.txtvalidaRsocial = 'Campo obligatorio';
      console.log('Campo obligatorio', this.txtvalidaRsocial);
      this.txtvalidaColorRS = '#dc3545'; // Asignar el color negro para el mensaje de "Campo obligatorio"
    }

    if (tienePorcentaje) {
      this.nombressolicitante.setValue(valor.replace('%', ''));
    }
  }*/

  validarTextoRsocial(valor: string) {
    this.txtvalidaColorRS = '#dc3545';
    const caracteresPermitidos = /^[a-z0-9áéíóúñ\s.]+$/; // Expresión regular para caracteres permitidos
    const tienePorcentaje = valor.includes('%');
    const tieneShift = valor.split('').some((caracter) => caracter === caracter.toUpperCase());

     if (valor.length > 2) {
        this.txtvalidaRsocial = 'Correcto';
        console.log('Correcto', this.txtvalidaRsocial);
        this.txtvalidaColorRS = '#050B70'; // Asignar el color verde para el mensaje de "Correcto"
    } else if (valor.length === 0) {
        this.txtvalidaRsocial = 'Campo obligatorio';
        this.txtvalidaColorRS = '#dc3545';
    } else {
        this.txtvalidaRsocial = 'Campo obligatorio';
        console.log('Campo obligatorio', this.txtvalidaRsocial);
        this.txtvalidaColorRS = '#dc3545'; // Asignar el color negro para el mensaje de "Campo obligatorio"
    }

    if (tienePorcentaje) {
        this.rucsolicitante.setValue(valor.replace('%', ''));
    }
}
validarText2(valor: string) {
    const letras = " áéíóúabcdefghijklmnñopqrstuvwxyz"; // incluimos el espacio en blanco
    const tienePorcentaje = valor.includes('%');

   /* if (tienePorcentaje || valor.split('').some((caracter) => !letras.includes(caracter))) {
      this.txtvalidaapellidsol = 'Texto no válido';
      console.log('Texto no válido', this.txtvalidaapellidsol);
      this.txtvalidacolorapellidos = 'red';
    } else */ if (valor.length > 2) {
      this.txtvalidaapellidsol = 'Correcto'; // Vaciar el mensaje de validación si se cumplen las condiciones
      this.txtvalidacolorapellidos = '#050B70';
    } else if(valor.length === 0){this.txtvalidaapellidsol = 'Campo obligatorio'; this.txtvalidacolorapellidos = 'red'}
    else {
      this.txtvalidaapellidsol = 'Campo obligatorio';
    }

    if (tienePorcentaje) {
      this.apellidosssolicitante.setValue(valor.replace('%', ''));
    }
  }

validarTextoagra(valor: string) {
    this.colornombreagrav = 'red';
    const letras = " áéíóúabcdefghijklmnñopqrstuvwxyz"; // incluimos el espacio en blanco
    const tienePorcentaje = valor.includes('%');

   /* if (tienePorcentaje || valor.split('').some((caracter) => !letras.includes(caracter))) {
      this.txtvalidanombresagra = 'Texto no válido';
      console.log('Texto no válido', this.txtvalidanombresagra);
      this.colornombreagrav = 'red'; // Asignar el color rojo para el mensaje de "Texto no válido"
    } else */ if (valor.length > 2) {
      this.txtvalidanombresagra = 'Correcto';
      console.log('Correcto', this.txtvalidanombresagra);
      this.colornombreagrav = '#050B70'; // Asignar el color verde para el mensaje de "Correcto"
    } else if(valor.length === 0){this.txtvalidanombresagra = 'Campo obligatorio'; this.txtvalidaColor = 'red';}
    else {
      this.txtvalidanombresagra = 'Campo obligatorio';
      console.log('Campo obligatorio', this.txtvalidanombresagra);
      this.colornombreagrav = 'red'; // Asignar el color negro para el mensaje de "Campo obligatorio"
    }

    if (tienePorcentaje) {
      this.nombresagraviado.setValue(valor.replace('%', ''));
    }
  }
validarTextagraapel(valor: string) {
    const letras = " áéíóúabcdefghijklmnñopqrstuvwxyz"; // incluimos el espacio en blanco
    const tienePorcentaje = valor.includes('%');

    /*if (tienePorcentaje || valor.split('').some((caracter) => !letras.includes(caracter))) {
      this.txtvalidaapellidoagra = 'Texto no válido';
      console.log('Texto no válido', this.txtvalidaapellidoagra);
      this.colorapellidagrav = 'red';
    } else */ if (valor.length > 2) {
      this.txtvalidaapellidoagra = 'Correcto'; // Vaciar el mensaje de validación si se cumplen las condiciones
      this.colorapellidagrav = '#050B70';
    } else if(valor.length === 0){this.txtvalidaapellidoagra = 'Campo obligatorio'; this.colorapellidagrav = 'red'}
    else {
      this.txtvalidaapellidoagra = 'Campo obligatorio';
    }

    if (tienePorcentaje) {
      this.apellidosagraviado.setValue(valor.replace('%', ''));
    }
  }

  validarnombreEB(valor: string) {
    const letras = " áéíóúabcdefghijklmnñopqrstuvwxyz"; // incluimos el espacio en blanco
    const tienePorcentaje = valor.includes('%');

    /*if (tienePorcentaje || valor.split('').some((caracter) => !letras.includes(caracter))) {
      this.txtvalidaapellidoagra = 'Texto no válido';
      console.log('Texto no válido', this.txtvalidaapellidoagra);
      this.colorapellidagrav = 'red';
    } else */ if (valor.length > 2) {
      this.txtvalueEB = ''; // Vaciar el mensaje de validación si se cumplen las condiciones
      this.colorapellidagrav = '#050B70';
    } else if(valor.length === 0){this.txtvalueEB = ''; this.colorapellidagrav = 'red'}
    else {
      this.txtvalueEB = '';
    }

    if (tienePorcentaje) {
      this.nameentidad.setValue(valor.replace('%', ''));
    }
  }

validaNumericos(event: any){
    if(this.tipodocumentosol.value == 15467 || this.tipodocumentosol.value == 13653 ||  this.tipodocumentoagraviado.value == 16202 ||  this.tipodocumentoagraviado.value == 16201){
      if(
        (event.charCode >= 48 && event.charCode <= 57) || // Dígitos numéricos
       (event.charCode >= 65 && event.charCode <= 90) || // Letras mayúsculas
       (event.charCode >= 97 && event.charCode <= 122) // Letras minúsculas
       ){
        return true;
      }
      return false;
    }else{
      if(event.charCode >= 48 && event.charCode <= 57){
        return true;
       }
       return false;
    }
  }

validaNrotelefono(event: any){
    if(event.charCode >= 48 && event.charCode <= 57){
      return true;
     }
     return false;
  }

  /*validaNroGion(event: any): boolean {
    if ((event.charCode >= 48 && event.charCode <= 57) || event.charCode === 45) {
      return true;
    }
    return false;
  }*/
validaNroGion(event: any): boolean {
    const inputChar = String.fromCharCode(event.charCode);
    if (/^[0-9\-]*$/.test(inputChar) && inputChar !== " ") {
      return true; // Permitir números y guiones, bloquear espacios en blanco
    }
    return false; // Bloquear cualquier otro carácter especial
  }



  //resetear formulario agraviado
resetagraviado(){
    this.disableagraviado = false;
    this.tipodocumentoagraviado.setValue(15473);
    this.documentoagraviado.setValue('');
    this.nombresagraviado.setValue('');
    this.apellidosagraviado.setValue('');
    this.direccionagraviado.setValue('');
    this.checksol.setValue(false);
  }

  //reteseo formulario solicitante
resetsolicitante(){
    this.documentosol.setValue('');
    this.nombressolicitante.setValue('');
    this.apellidosssolicitante.setValue('');
    this.direccionsolicitante.setValue('');
    this.emailsolicitante.setValue('');
    this.nrotelefonosolicitante.setValue('');
  }

  valueemail: string = '';

  inputChange(event: any) {
    const correo = event.target.value;
    this.valueemail = this.validarCorreoElectronico(correo)
      ? 'Formato correcto'
      : 'Formato incorrecto';
  }
  
  validarCorreoElectronico(correo: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (regex.test(correo)) {
      const dominiosPermitidos = ['.com', '.pe', '.org', '.brz', '.net'];
      const dominio = correo.split('@')[1];
      const dominioValido = dominiosPermitidos.some(d => dominio.endsWith(d));
      return dominioValido;
    }
    
    return false;
  }
  

changeTipoDocumento(e: any){
  console.log('selecttipodocumento', this.tipodocumentosol.value);
    this.documentosol.setValue('');
    this.documentosol.updateValueAndValidity();

  if(this.tipodocumentosol.value == 13652){ //dni
    this.activarcobertura.setValue(16000);
    this.documentosol.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern(/^[0-9]+$/)]);
    this.nombressolicitante.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(50)]);
    this.apellidosssolicitante.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(50)]);
    this.rucsolicitante.clearValidators();
    this.rucsolicitante.setValue('');
    this.rucsolicitante.updateValueAndValidity();
    this.nombressolicitante.updateValueAndValidity();
    this.apellidosssolicitante.updateValueAndValidity();
    this.activarcoberturaR.clearAsyncValidators();
    this.activarcoberturaR.updateValueAndValidity();
    this.activarcoberturaR.setValue('');
    this.coberturaSeleccionada = true;


  }
  if(this.tipodocumentosol.value == 13653){ //ce
    this.nombressolicitante.setValue('');
    this.nombressolicitante.updateValueAndValidity();
    this.documentosol.setValidators([Validators.required, Validators.minLength(20), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9]+$/)]);
    this.activarcoberturaR.clearAsyncValidators();
    this.activarcoberturaR.updateValueAndValidity();
    this.activarcoberturaR.setValue('');
    this.activarcobertura.setValue(16000);
    this.coberturaSeleccionada = true;
  }
  if(this.tipodocumentosol.value == 13654){ //ruc
   this.totalfile = 12;
   this.activarcoberturaR.setValue(16290);
   this.documentosol.setValidators([Validators.required, Validators.minLength(11), Validators.maxLength(11)]);
   this.rucsolicitante.setValidators([Validators.required, Validators.minLength(5),Validators.maxLength(70)]); //cantidad de caracteeres
   this.nombressolicitante.updateValueAndValidity();
   this.nombressolicitante.clearValidators(); // limpiar validaciones
   this.nombressolicitante.setValue(''); // deja vacio los cambios
   this.rucsolicitante.updateValueAndValidity(); //actualizar
   this.apellidosssolicitante.updateValueAndValidity();
   this.apellidosssolicitante.clearValidators();
   this.apellidosssolicitante.setValue('');
   this.checksol.setValue(false);
   this.activarcobertura.clearAsyncValidators();
   this.activarcobertura.updateValueAndValidity();
   this.activarcobertura.setValue('');
   this.coberturaSeleccionada = false;
  }
  if(this.tipodocumentosol.value == 15467){ //pasaporte
    this.activarcobertura.setValue(16000); //el setValue permite setar un control
    this.documentosol.setValidators([Validators.required, Validators.minLength(20), Validators.maxLength(20)]);
    this.nombressolicitante.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(50)]);
    this.apellidosssolicitante.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(50)]);
    this.activarcoberturaR.clearAsyncValidators();
    this.activarcoberturaR.updateValueAndValidity();
    this.activarcoberturaR.setValue('');
    this.rucsolicitante.clearValidators();
    this.rucsolicitante.setValue('');
    this.rucsolicitante.updateValueAndValidity();
    this.coberturaSeleccionada = true;

  }
  this.resetsolicitante();
  this.resetagraviado();



 }
/*select value de agraviado */
changeTipoDocumentoagrav(e: any){
  console.log('selecttipodocumentoagraviado', this.tipodocumentoagraviado.value);
  this.documentoagraviado.setValue('');
  this.documentoagraviado.updateValueAndValidity();
  if(this.tipodocumentoagraviado.value == 15473){ //DNI
    this.documentoagraviado.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern(/^[0-9]+$/)]);
  }
  if(this.tipodocumentoagraviado.value == 16201){ //carnet de extranjeria
    this.documentoagraviado.setValidators([Validators.required, Validators.minLength(11), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9]+$/)]);
  }
  //RUC - no aplica
 /* if(this.tipodocumentoagraviado.value == 15474){
    this.documentoagraviado.setValidators([Validators.required, Validators.minLength(11), Validators.maxLength(11)]);
  } */
  if(this.tipodocumentoagraviado.value == 16202){ //pasaporte
    this.documentoagraviado.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(20)]);
  }
 }

changechecksol(e: any): void{

   if(this.checksol.value){
      if(this.tipodocumentosol.value == 13652){
        this.tipodocumentoagraviado.setValue(15473);
       }
       if(this.tipodocumentosol.value == 13653){
        this.tipodocumentoagraviado.setValue(16201);
       }
       if(this.tipodocumentosol.value == 13654){
        this.tipodocumentoagraviado.setValue(15474);
       }
       if(this.tipodocumentosol.value == 15467){
        this.tipodocumentoagraviado.setValue(16202);
       }
       this.changeTipoDocumentoagrav(null);
      // this.selectDeshabilitado = true;


       /*captura el value de tipodocumentosol */
      this.documentoagraviado.setValue(this.documentosol.value);
      this.documentosol.setValue(this.documentoagraviado.value);
      this.nombresagraviado.setValue(this.nombressolicitante.value);
     // this.rucagraviado.setValue(this.rucsolicitante);
      this.apellidosagraviado.setValue(this.apellidosssolicitante.value);
      this.direccionagraviado.setValue(this.direccionsolicitante.value);
      this.disableagraviado = true;
   }else{
      this.disableagraviado = false;
     // this.disableagraviado = false;
   }

 }

//change metodo de pago
changemetodopago(e: any){
 console.log("Medotodde pago", this.slectmetodopago.value);
 if(this.slectmetodopago.value == 16173){
    this.slecentidadbancaria.setValue(100);
    this.nameentidad.clearAsyncValidators();
    this.nameentidad.updateValueAndValidity();
    this.nameentidad.setValue('');
    this.nrocuenta.clearAsyncValidators();
    this.nrocuenta.updateValueAndValidity();
    this.nrocuenta.setValue('');
    this.codigointerbancario.clearAsyncValidators();
    this.codigointerbancario.updateValueAndValidity();
    this.codigointerbancario.setValue('');
    //this.ocultarInput =true;
 }


 if(this.slectmetodopago.value == 16174){
  this.slecentidadbancaria.setValue(100);
 }
}
//change entidad bancaria
changeentidadbancaria(e: any){
  if(this.slecentidadbancaria.value == "BCP" || this.slecentidadbancaria.value == "BBVA" ||this.slecentidadbancaria.value == "INTERBANK" || this.slecentidadbancaria.value == "SCOTIABANK"){
    this.nrocuenta.setValidators([Validators.required]);
     this.codigointerbancario.setValidators([Validators.required]);
  }
  if(this.slecentidadbancaria.value == "OTRO"){
     this.nameentidad.setValidators([Validators.required]);
     this.nrocuenta.setValidators([Validators.required]);
     this.codigointerbancario.setValidators([Validators.required]);
  }
}
 /* contador: number= 0;
  onFileSelected(event: any) { //05072023_17:41hrs
    let valcoberIncatemp = this.activarcobertura.value;
    console.log("value-Incapacidad-Temporal", valcoberIncatemp);
    if(valcoberIncatemp == 16286){
      this.totalfile = 11;
    }
    const files: FileList = event.target.files;
    this.contador == 1;
    console.log("Datos de archivos", files);

    if (this.activarcobertura.value == 16000) {
      console.log("Datos de archivossss", files);
      Swal.fire('Información', 'Debe seleccionar una Cobertura', 'error');
    } else {
      for (let i = 0; i < files.length; i++) {
        if (this.totalfile <= this.uploadedFiles.length) {
          console.log("contadoraaa", this.contador);
          Swal.fire('Información', 'No puede adjuntar más de 7 documentos', 'error');
          return;
        }

        const file = files[i];
        if (file.size <= 15 * 1024 * 1024) {
          if (
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || // Word
            file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || // Excel
            file.type === "application/vnd.ms-excel" || // Excel
            file.type === "text/plain" // Bloc de notas
          ) {
            Swal.fire('Información', 'No se permiten adjuntar este tipo de archivo', 'error');
            continue;
          }

          this.convertToBase64(file).then((base64: string) => {
            const sizeInMB = (file.size / (1024 * 1024)).toFixed(2).toString();
            this.uploadedFiles.push({
              name: file.name,
              type: file.type,
              size: sizeInMB.toString(),
              base64: base64,
            });
            console.log("base64", this.uploadedFiles);
          });

          this.contador++;
          console.log("Datos de archivos-new", files);
        } else {
          Swal.fire('Información', 'El archivo es demasiado grande que lo permitido', 'error');
        }
      }
    }
  }*/
contador: number = 0;
onFileSelected(event: any) {
  let valcoberIncatemp = this.activarcobertura.value;
  console.log("value-Incapacidad-Temporal", valcoberIncatemp);

  const files: FileList = event.target.files;
  this.contador = 1;
  console.log("Datos de archivos", files);

  if (this.activarcobertura.value == 16000) {
    console.log("Datos de archivossss", files);
    Swal.fire('Información', 'Debe seleccionar una Cobertura', 'error');
  } else {
    if(files.length > (this.totalfile - this.uploadedFiles.length)){
      Swal.fire('Información', 'Solo puede selecionar hasta ' + this.totalfile + ' archivos', 'error');
      return false;
    }
    for (let i = 0; i < files.length; i++) {
      if (this.totalfile <= this.uploadedFiles.length) {
        console.log("contadoraaa", this.contador);
        Swal.fire('Información', 'No puede adjuntar más de 11 documentos', 'error');
        return;
      }
      const file = files[i];
      if (file.size <= 15 * 1024 * 1024) {
        if (
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || // Word
          file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || // Excel
          file.type === "application/vnd.ms-excel" || // Excel
          file.type === "text/plain" // Bloc de notas
        ) {
          Swal.fire('Información', 'No se permiten adjuntar este tipo de archivo', 'error');
          continue;
        }

        this.convertToBase64(file).then((base64: string) => {
          const sizeInMB = (file.size / (1024 * 1024)).toFixed(2).toString();
          this.uploadedFiles.push({
            name: file.name,
            type: file.type,
            size: sizeInMB.toString(),
            base64: base64,
          });
          console.log("base64", this.uploadedFiles);
        });

        this.contador++;
        console.log("Datos de archivos-new", files);
      } else {
        Swal.fire('Información', 'El archivo es demasiado grande que lo permitido', 'error');
      }
    }
  }
}


deleteFile(file: any) {
  const index = this.uploadedFiles.indexOf(file);
  if (index !== -1) {
    this.uploadedFiles.splice(index, 1);
    Swal.fire('Información','Archivo Eliminado correctamente', 'success');
    
  }
  this.uploadfiledocument.clearAsyncValidators();
  this.uploadfiledocument.setValue('');
}

convertToBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}
//actuvar cobertura cuando es RUC
changeactivarcoberturaR(e: any){
  if( this.activarcoberturaR.value == 16290){this.totalfile = 12; }
  if(this.tipodocumentosol.value == 13654){this.totalfile = 12; }
  this.uploadedFiles = [];
}
//actuvar cobertura
changeactivarcobertura(e: any){
  if(this.activarcobertura.value == 16000){
    this.totalfile = 0;
  }
  if(this.activarcobertura.value == 16286){
    this.totalfile = 11; //se aesta aumentando 4 archivos
  }
  if(this.activarcobertura.value == "16287"){
    this.totalfile = 11; //se aesta aumentando 4 archivos
  }
  if(this.activarcobertura.value == 16290){
    this.totalfile = 15;
  }
  if(this.activarcobertura.value == 16288){
    this.totalfile = 15;
  }
  if(this.activarcobertura.value == 16289){
    this.totalfile = 12;
  }
  if(this.activarcobertura.value == "16290-1"){
    this.totalfile = 12;
  }


 /*  if(this.activarcoberturaR.value == 16023){
    this.totalfile = 8;
  } */
  this.uploadedFiles = [];

 console.log("covertura", this.activarcobertura.value)
 }

 capturaRespuestaCaptcha(response: string): void {
  // Aquí puedes realizar acciones con la respuesta del Captcha, como enviarla al servidor o validarla
  console.log('Respuesta del Captcha:', response);
}

CleanFormgroup(){
  //this.formregister.reset();
  //datos del solicitante

  this.tipodocumentosol.setValue(13652); //DNI solicitante
  if(this.tipodocumentosol.value == 13652){ this.documentosol.setValidators([ Validators.required, Validators.minLength(8), Validators.maxLength(8)])
   // this.activarcobertura.value.setValidators(["16000"]);
  };

  this.documentosol.setValue('');
  this.checksol.setValue(false);
  this.nombressolicitante.setValue('');
  this.nombressolicitante.setValidators([Validators.required]);
  this.apellidosssolicitante.setValue('');
  this.apellidosssolicitante.setValidators([Validators.required]);
  this.emailsolicitante.setValue('');
  this.nrotelefonosolicitante.setValue('');
  this.direccionsolicitante.setValue('');
  this.rucsolicitante.setValue('');
 /* if(this.tipodocumentosol.value == 13652 || this.tipodocumentosol.value == 13653 || this.tipodocumentosol.value == 13654 || this.tipodocumentosol.value == 15467){ this.activarcobertura.value == 16000} else { this.activarcoberturaR.value == 16023} */
 //this.activarcobertura.setValue(16000);
  //datos del agraviado
  this.tipodocumentoagraviado.setValue(15473); //DNI agraviado
  if(this.tipodocumentoagraviado.value == 15473){ this.documentoagraviado.setValidators([ Validators.required, Validators.minLength(8), Validators.maxLength(8)])};
  this.documentoagraviado.setValue('');
  this.nombresagraviado.setValue('');
  this.apellidosagraviado.setValue('');
  this.direccionagraviado.setValue('');
  this.nroplacavehiculoagraviado.setValue('');
  this.fechasiniestroagraviado.setValue([moment(this.fecha).format('YYYY-MM-DD')],);
  this.activarcobertura.setValue(16000);
  this.slectmetodopago.setValue(16173);
  this.slecentidadbancaria.setValue(100);
  this.nrocuenta.setValue('');
  this.codigointerbancario.setValue('');
  this.nameentidad.setValue('');
  this.totalfile = 0;
  this.uploadedFiles = [];
  this.recaptcha.setValue('');
  //this.checksol.setValue(false);
  this.disableagraviado = false;
}

codigoResponse: string;
public isSpinnerVisible: boolean = true;

registrar(){
  this.isButtonClicked = true;
  console.log("registrar");
  //this.uploadSuccess= true;
  var activacobertura = this.activarcobertura.value;
  var actuvarcoberturaR = this.activarcoberturaR.value;
  console.log("CoberturaRR", actuvarcoberturaR);
  var valortramitesin = '';
  //var activacobertura = this.activarcobertura.value;
  if(activacobertura == null)
  {
    this.activarcoberturaR.value ==16290;
    console.log("coberturaruc", this.activarcoberturaR.value);
    
  }else{
    var matches = activacobertura.match(/\d+/);
  var valoractivarcobertura = matches ? matches[0] : '';
  }
  console.log("valor-cobertura", activacobertura);
  console.log("valor-cobertura22", valoractivarcobertura);

  

if (activacobertura == null) {
  this.activarcoberturaR.value == 16290;
  
} else {
  var matches = activacobertura.match(/\d+/);
  valortramitesin = matches ? matches[0] : '';

  // Agregar valor a tramite sin
  if (valortramitesin == '16286' || valortramitesin == '16287') {
    valortramitesin = '16022';
  } else if (valortramitesin == '16289' || valortramitesin == '16290' || valortramitesin == '' || valortramitesin == null) {
    valortramitesin = '16023';
  } else if (valortramitesin == '16288') {
    valortramitesin = '16024';
  }
}

console.log("valor-tramiteSIN", valortramitesin);





 // this.isSpinnerVisible = true;
  var summary: string ="."
  var lsitaradjuntos: any =[];
  for( let file of this.uploadedFiles){
    lsitaradjuntos.push(
      {
        name: (file.name).toUpperCase(),
        size: file.size,
        path: "",
       // tipo: file.type,
        "content": file.base64,
        mime: file.type,
       // "scodejira": "",
       // "scode": ""
      }
    );
  }

  var _data: any  = {
    token: this.token,
    tipoDocAseg: this.tipodocumentoagraviado.value,
    nroDocAseg: this.documentoagraviado.value,
    nombreAseg: (this.nombresagraviado.value + ' ' +this.apellidosagraviado.value).toUpperCase(),
    correoAseg: "",
    dirAseg:(this.direccionagraviado.value).toUpperCase(),
    tipoDocContac: this.tipodocumentosol.value,
    celContac: this.nrotelefonosolicitante.value,
    nroDocContac:this.documentosol.value,
    nombreContacto:(this.nombressolicitante.value +' '+this.apellidosssolicitante.value).toUpperCase(),
    dirContac: (this.direccionsolicitante.value).toUpperCase(),
    correoContac: (this.emailsolicitante.value).toUpperCase(),
    placa: (this.nroplacavehiculoagraviado.value).toUpperCase(),
    fechaSiniestro: this.fechasiniestroagraviado.value,
    fechaRecepcion: this.fecha,
    cobertura: this.tipodocumentosol.value == 13654 ? this.activarcoberturaR.value : valoractivarcobertura,// si el tipo del ruc es 13654 que guarde el valor de activarcoberturaR, sino que guarde el valor de activarcobertura
    tramitesin: valortramitesin,
    banco: (this.slecentidadbancaria.value == 100 ? '' : (this.slecentidadbancaria.value === "OTRO" ? this.nameentidad.value : this.slecentidadbancaria.value)).toUpperCase(),
    tipoPago: this.slectmetodopago.value,
    cuentaDestino: this.nrocuenta.value,
    cuentaCCI:this.codigointerbancario.value,
    adjunto: lsitaradjuntos,
   };
   this.isLoading = false;
    console.log("Datos a guardar", _data);
    this.siniestroservice.potreister(_data, this.token).subscribe((response: any ) =>{
      console.log("Respuesta de Servicio",response);
      console.log("datosin-", valoractivarcobertura);
      this.codigoResponse = response.codigo;
      if(response.codigo == null || response.codigo == ''){
        this.isButtonClicked = false;
        Swal.fire(
          'Error',
          'No se obtuvo respuesta del servicio, inténtelo nuevamente.',
          'error'
        ).then((result) =>{
          if(result.value){
            location.reload();
          }
          this.isScreenBlocked = false;
        });
      }else{
        this.isLoading = false;
      this.isButtonClicked = false;
      Swal.fire(
        'Se genero el Nro de solicitud:' + ' '+ this.codigoResponse,
        'Guarde el código para hacerle seguimiento',
        'success',

    ).then((result) =>{

      if(result.value){
        location.reload();
      }
      this.isScreenBlocked = false;

    },(error: any) =>{
      console.error("Error al llamar al servicio", error);

      // Desactivar el spinner en caso de error
      this.isSpinnerVisible = false;

      // Mostrar un swal.fire de error
      Swal.fire(
        'Error',
        'Ocurrió un error al enviar los datos. Por favor, inténtelo nuevamente.',
        'error'
      );
    })

      }
      ;
    });

    this.isLoading = false;

    return false;
 }
}

