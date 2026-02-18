import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { IAcordion } from '../../interfaces/acordion.interface';

@Component({
  selector: 'app-acordion-ap',
  templateUrl: './acordion-ap.component.html',
  styleUrls: ['./acordion-ap.component.sass'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({
          opacity: 0,
        }),
        animate(
          200,
          style({
            opacity: 1,
          })
        ),
      ]),
    ]),
  ],
})
export class AcordionApComponent implements OnInit {
  @Input() data: Array<IAcordion> | null = null;
  @Output() event: any = new EventEmitter();

  itemSelected: number | null = null;

  dataQuest: Array<any> = [
    {
      name: 'Edad mínima de ingreso',
      individual: 18,
      familiar: 18,
      estudiantil: 3,
      empresas: 18,
    },
    {
      name: 'Edad máxima de ingreso',
      individual: 65,
      familiar: 65,
      estudiantil: 30,
      empresas: 65,
    },
    {
      name: 'Edad máxima de permanencia',
      individual: 70,
      familiar: 70,
      estudiantil: 35,
      empresas: 70,
    },
  ];
  constructor() {}

  ngOnInit() {}

  selectItem(data: any, val: number): void {
    if (val == this.itemSelected) {
      this.itemSelected = null;
      return;
    }
    this.itemSelected = val;

    this.event.emit({
      ...data,
      isOpen: this.itemSelected != null,
    });
  }
}
