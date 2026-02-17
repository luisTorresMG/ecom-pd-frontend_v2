import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-step-navigation',
  templateUrl: './step-navigation.component.html',
  styleUrls: ['./step-navigation.component.css'],
})
export class StepNavigationComponent implements OnInit {
  currentPage = 1;
  constructor(private readonly router: Router) {}

  ngOnInit() {
    this.getCurrentPage(this.router.url.split('?')[0]);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.getCurrentPage(event.url);
      }
    });
  }

  getCurrentPage(url) {
    switch (url) {
      case '/sctr/step-1':
        this.currentPage = 1;
        break;
      case '/sctr/step-2':
        this.currentPage = 2;
        break;
      case '/sctr/step-3':
        this.currentPage = 3;
        break;
      case '/sctr/step-4':
        this.currentPage = 4;
        break;
      case '/sctr/step-5':
        this.currentPage = 5;
        break;
      default:
        this.currentPage = 5;
        break;
    }
  }
}
