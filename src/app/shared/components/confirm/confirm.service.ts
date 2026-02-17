import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from './confirm.component';

@Injectable()
export class ConfirmService {

  constructor(private modalService: NgbModal) { }

  public confirm(titulo: string,
    mensaje: string,
    accion: string,
    textoBtnAceptar?: string,
    textoBtnCancelar?: string,
    dialogSize: 'sm' | 'lg' = 'sm'): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmComponent, { size: dialogSize });

    modalRef.componentInstance.titulo = titulo;
    modalRef.componentInstance.mensaje = mensaje;
    modalRef.componentInstance.accion = accion;
    modalRef.componentInstance.textoBtnAceptar = textoBtnAceptar;
    modalRef.componentInstance.textoBtnCancelar = textoBtnCancelar;

    return modalRef.result;
  }
}
