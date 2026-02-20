import { Component, OnInit, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-item-personal',
  templateUrl: './item-personal.component.html',
  styleUrls: ['./item-personal.component.css']
})
export class ItemPersonalComponent implements OnInit {
  @Input()
  label: string;
  @Input()
  value: any;

  constructor() { }

  ngOnInit() { }
}
