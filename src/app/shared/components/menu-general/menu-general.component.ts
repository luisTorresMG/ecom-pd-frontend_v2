import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-menu-general',
  templateUrl: './menu-general.component.html',
  styleUrls: ['./menu-general.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuGeneralComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
