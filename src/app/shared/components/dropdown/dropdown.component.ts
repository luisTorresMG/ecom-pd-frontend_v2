import { Component, OnInit, Input } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'pro-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.sass'],
})
export class DropdownComponent implements OnInit {
  @Input() placement = 'bottom';

  showDropdownList = false;

  constructor() {}

  ngOnInit(): void {}
}
