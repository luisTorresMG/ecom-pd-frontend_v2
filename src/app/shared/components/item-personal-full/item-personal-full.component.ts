import { Component, OnInit, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-item-personal-full',
  templateUrl: './item-personal-full.component.html',
  styleUrls: ['./item-personal-full.component.css']
})
export class ItemPersonalFullComponent implements OnInit {
  @Input()
  label: string;
  @Input()
  value: any;

  constructor() { }

  ngOnInit() { }
}
