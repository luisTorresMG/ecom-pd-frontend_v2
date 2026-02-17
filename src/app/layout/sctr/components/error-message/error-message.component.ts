import { Component, OnInit, Input } from '@angular/core';
import { VidaleyService } from '../../shared/services/vidaley.service';
import { GoogleTagManagerService } from '../../shared/services/google-tag-manager.service';

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.css'],
})
export class ErrorMessageComponent implements OnInit {
  @Input()
  moreInfo = false;

  @Input()
  step = 3;

  showReturn = false;

  constructor(
    private readonly vidaleyService: VidaleyService,
    private readonly googleService: GoogleTagManagerService
  ) {}

  ngOnInit() {
    window.scroll(0, 0);
    this.googleService.setContactAction();

    if (this.moreInfo) {
      const vidaleyUser = JSON.parse(sessionStorage.getItem('sctr')) || {};

      this.vidaleyService
        .sendRequest({ idProcess: vidaleyUser.idProcess, step: this.step })
        .subscribe(() => {
          // this.showReturn = true;
        });
    }

    sessionStorage.removeItem('sctr');
  }
}
