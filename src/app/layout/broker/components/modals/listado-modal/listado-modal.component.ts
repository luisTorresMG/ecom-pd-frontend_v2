import { Component, OnInit, Input, AfterContentInit } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  standalone: false,
  selector: 'app-listado-modal',
  templateUrl: './listado-modal.component.html',
  styleUrls: ['./listado-modal.component.css'],
})
export class ListadoModalComponent implements OnInit {
  @Input() public formModalReference: any; //Referencia al modal creado desde el padre de este componente para ser cerrado desde aquí
  @Input() public orderInitial: any;
  @Input() public columnVisibility: any;
  @Input() public listActions: any;
  columnVisibilityInitial
  newOrder: any = [];

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
    this.newOrder = this.orderInitial;
    this.columnVisibilityInitial = JSON.parse(JSON.stringify(this.columnVisibility));
  }

  drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData('text');
    var draggedElement = document.getElementById(data);
    var targetElement = ev.target;

    if (
      targetElement.tagName === 'BUTTON' &&
      draggedElement instanceof HTMLButtonElement &&
      targetElement instanceof HTMLButtonElement
    ) {
      if (draggedElement !== targetElement) {
        var draggedMarker = document.createElement('div');
        var targetMarker = document.createElement('div');

        targetElement.parentNode.insertBefore(draggedMarker, targetElement);
        draggedElement.parentNode.insertBefore(targetMarker, draggedElement);

        draggedMarker.parentNode.insertBefore(draggedElement, draggedMarker);
        targetMarker.parentNode.insertBefore(targetElement, targetMarker);

        draggedMarker.parentNode.removeChild(draggedMarker);
        targetMarker.parentNode.removeChild(targetMarker);

        var buttons = Array.from(document.querySelectorAll('.column-button'));
        this.newOrder = buttons.map((button) => button.textContent);
      }
    }
  }

  allowDrop(ev) {
    ev.preventDefault();
  }

  drag(ev) {
    ev.dataTransfer.setData('text', ev.target.id);
  }

  select() {
    const data = { 
        newOrder: this.newOrder.map(order => order.trim()), 
        visibility: this.columnVisibility 
    };
    console.log(data);
    this.activeModal.close(data);
}
dismiss() {
    console.log(this.columnVisibilityInitial)
    console.log(this.columnVisibility)
    const data = { 
        columnVisibilityInitial: this.columnVisibilityInitial 
    };
    this.activeModal.dismiss(data);
  }


  toggleColumn(columnName: string): void {
    this.columnVisibility[columnName] = !this.columnVisibility[columnName];
  }
}
