import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DpsService } from '../../shared/services/dps.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
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
export class HomeComponent implements OnInit {
  form = this.fb.group({
    privacy: [false],
    terms: [false, Validators.requiredTrue],
  });

  token: string;

  tokenIsValid = false;

  @ViewChild('modalTerms', { static: true, read: TemplateRef })
  modalTerms: TemplateRef<ElementRef>;

  constructor(
    private readonly vcr: ViewContainerRef,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly dpsService: DpsService
  ) {
  }

  ngOnInit(): void {
    this.route.parent.params.subscribe((params) => {
      this.token = params.token;
    });

    let validToken: any = sessionStorage.getItem('validateToken');
    if (validToken) {
      validToken = JSON.parse(validToken);
      this.tokenIsValid = validToken?.tokenIsValid;
      console.log(validToken);
      if (!this.tokenIsValid) {
        sessionStorage.clear();
      }
    }
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    sessionStorage.setItem(
      'terms-dps',
      JSON.stringify(this.form.getRawValue())
    );
    this.router.navigate([`dps/${this.token}/preguntas`]);
  }

  validateToken() {
    this.route.parent.params.subscribe((params) => {
      this.dpsService.validateToken(params.token).subscribe(
        (response) => {
          this.token = params.token;
          if (response.success) {
            sessionStorage.setItem('dps-proccess-id', response.id.toString());
            this.tokenIsValid = true;
          } else {
            this.tokenIsValid = false;
            sessionStorage.clear();
          }
        },
        (err) => {
          console.log(err);
        }
      );
    });
  }

  showModalTerms(): void {
    this.vcr.createEmbeddedView(this.modalTerms);
  }

  closeModalTerms(): void {
    this.vcr.clear();
  }
}
