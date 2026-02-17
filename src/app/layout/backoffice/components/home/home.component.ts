import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }
  NAME_USER: string;
  ngOnInit(): void {
    this.NAME_USER = JSON.parse(localStorage.getItem('currentUser')).firstName;
  }
}
