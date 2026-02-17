import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-plan-detail',
  templateUrl: './plan-detail.component.html',
  styleUrls: ['./plan-detail.component.scss']
})
export class PlanDetailComponent implements OnInit, OnDestroy {

  @Output() close: EventEmitter<boolean>;

  coverages: Array<any>;
  services: Array<any>;
  benefits: Array<any>;

  typeSelected: number;
  indexListSelected: number;

  constructor() {
    this.typeSelected = 1;
    this.indexListSelected = null;
    this.benefits = this.services = this.coverages = [
      {
        title: 'Muerte accidental',
        description: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Asperiores ullam nobis enim itaque perferendis,
        doloribus excepturi quaerat molestias iste veritatis, optio doloremque ipsa minima modi suscipit.Laboriosam
        quos consectetur ullam!`
      },
      {
        title: 'ITP por accidente',
        description: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Asperiores ullam nobis enim itaque perferendis,
        doloribus excepturi quaerat molestias iste veritatis, optio doloremque ipsa minima modi suscipit.Laboriosam
        quos consectetur ullam!`
      },
      {
        title: 'IPP por accidente',
        description: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Asperiores ullam nobis enim itaque perferendis,
        doloribus excepturi quaerat molestias iste veritatis, optio doloremque ipsa minima modi suscipit.Laboriosam
        quos consectetur ullam!`
      },
      {
        title: 'Desamparo súbito familiar',
        description: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Asperiores ullam nobis enim itaque perferendis,
        doloribus excepturi quaerat molestias iste veritatis, optio doloremque ipsa minima modi suscipit.Laboriosam
        quos consectetur ullam!`
      },
      {
        title: 'Desamparo súbito familiar (Padres del Asegurado)',
        description: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Asperiores ullam nobis enim itaque perferendis,
        doloribus excepturi quaerat molestias iste veritatis, optio doloremque ipsa minima modi suscipit.Laboriosam
        quos consectetur ullam!`
      },
      {
        title: 'Gasto de sepelio por muerte natural',
        description: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Asperiores ullam nobis enim itaque perferendis,
        doloribus excepturi quaerat molestias iste veritatis, optio doloremque ipsa minima modi suscipit.Laboriosam
        quos consectetur ullam!`
      },
      {
        title: 'Desamparo súbito familiar (Hijos de Padres del Asegurado)',
        description: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Asperiores ullam nobis enim itaque perferendis,
        doloribus excepturi quaerat molestias iste veritatis, optio doloremque ipsa minima modi suscipit.Laboriosam
        quos consectetur ullam!`
      },
      {
        title: 'Exoneración de pago de prima',
        description: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Asperiores ullam nobis enim itaque perferendis,
        doloribus excepturi quaerat molestias iste veritatis, optio doloremque ipsa minima modi suscipit.Laboriosam
        quos consectetur ullam!`
      },
      {
        title: 'Muerte accidental en transporte público',
        description: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Asperiores ullam nobis enim itaque perferendis,
        doloribus excepturi quaerat molestias iste veritatis, optio doloremque ipsa minima modi suscipit.Laboriosam
        quos consectetur ullam!`
      },
      {
        title: 'Pago de servicios básicos por muerte accidental',
        description: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Asperiores ullam nobis enim itaque perferendis,
        doloribus excepturi quaerat molestias iste veritatis, optio doloremque ipsa minima modi suscipit.Laboriosam
        quos consectetur ullam!`
      },
    ];
    this.close = new EventEmitter();
  }

  ngOnInit(): void {
    const html = document.getElementById('html-document');
    html.style.overflow = 'hidden';
  }
  ngOnDestroy(): void {
    const html = document.getElementById('html-document');
    html.style.overflow = 'auto';
  }

  changeTypeSelected(val: number): void {
    this.typeSelected = val;
  }
  changeindexListSelected(val: number): void {
    if (this.indexListSelected === val) {
      this.indexListSelected = null;
    } else {
      this.indexListSelected = val;
    }
  }

  closePlanDetail(): void {
    this.close.emit(true);
  }

}
