import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  title: string = 'Seguro contra Accidentes Personales';

  constructor() {}

  ngOnInit() {}
}
