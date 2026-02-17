import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DpsService } from '../../shared/services/dps.service';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({
          opacity: 0,
        }),
        animate(
          250,
          style({
            opacity: 1,
          })
        ),
      ]),
    ]),
  ],
})
export class MainComponent implements OnInit {
  title: string;

  token: string;
  tokenIsValid = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly dpsService: DpsService,
    private readonly spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.title = '<span>DPS</span>';
    this.validateToken();
  }
  validateToken() {
    this.spinner.show();
    this.dpsService.validateToken(this.route.snapshot.params.token).subscribe(
      (response) => {
        this.token = this.route.snapshot.params.token;
        if (response.success) {
          sessionStorage.setItem('dps-proccess-id', response.id.toString());
          this.dpsService.storage = response;
          this.tokenIsValid = true;
        } else {
          this.tokenIsValid = false;
          sessionStorage.clear();
        }
        this.spinner.hide();
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
