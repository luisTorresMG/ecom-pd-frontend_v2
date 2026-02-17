import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-email-suggestions',
  templateUrl: './email-suggestions.component.html',
  styleUrls: ['./email-suggestions.component.scss'],
  animations: [
    trigger('entrada', [
      transition(':enter', [
        style({
          opacity: 0.5,
          transform: 'translateY(-15px)'
        }),
        animate(150, style({
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ]),
      transition(':leave', [
        animate(50, style({
          opacity: 0.5,
          transform: 'translateY(-15px)'
        }))
      ])
    ])
  ]
})
export class EmailSuggestionsComponent implements OnInit {

  form: FormGroup;

  emails: Array<string>;
  emailsCopy: Array<string>;

  @Input() set email(val: string) {
    this.f['email'].setValue(val);
  }
  @Output() suggestion: EventEmitter<string>;

  constructor(
    private readonly _fb: FormBuilder
  ) {
    this.suggestion = new EventEmitter();
    this.emails = [
      '@gmail.com',
      '@hotmail.com',
      '@outlook.com',
      '@yahoo.com',
      '@yahoo.es'
    ];
    this.emailsCopy = [];

    this.form = this._fb.group({
      email: [null]
    });
    this.f['email'].valueChanges.subscribe((val) => {
      this.emailsCopy = [];
      if (this.findEmail !== -1) {
        let split = val?.split('@', 2)[1] || '';
        if (!!this.emails.find(x => x === `@${split?.trim()}`)) {
          this.emailsCopy = [];
          split = null;
        } else {
          this.emailsCopy = this.emails.filter(x => x.indexOf(split) !== -1);
        }
      }
    });
  }

  ngOnInit(): void {
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get findEmail(): number {
    return this.f['email'].value?.indexOf('@');
  }

  selectSuggestion(val: string) {
    const email = this.f['email'].value?.split('@', 2)[0];
    this.f['email'].setValue(`${email}${val}`?.trim());
    this.emitSuggestion();
  }

  emitSuggestion(): void {
    this.suggestion.emit(this.f['email'].value);
  }
}
