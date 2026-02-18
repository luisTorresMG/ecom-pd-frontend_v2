import { environment } from '../environments/environment';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { VersionCheckService } from '@shared/services/check-service/version-check.service';
import { ScreenSplashService } from '@screen-splash';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    habilitarChat = false;
    showScreenSplash = false;
    messageScreenSplash = '';

    constructor(
        private readonly router: Router,
        private versionCheckService: VersionCheckService,
        private readonly screenSplash: ScreenSplashService
    ) { }

    ngOnInit(): void {
        (window as any)['global'] = window;
        this.versionCheckService.initVersionCheck(
            environment.versioncheckurl,
            1500000
        );

        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.enableChat();
            }
        });

        this.screenSplash.showSubject.subscribe(
            (show: boolean) => (this.showScreenSplash = show)
        );

        this.screenSplash.messageSubject.subscribe(
            (message: string) => (this.messageScreenSplash = message)
        );
    }

    enableChat() {
        this.habilitarChat = true;
        const url = window.location.pathname;

        if (url.indexOf('/extranet') > -1 || url.indexOf('/siniestrosoat') > -1) {
            this.habilitarChat = false;
        }

        const scriptId = 'genesys-bootstrap';

        if (document.getElementById(scriptId)) {
            this.habilitarChat = false;
        }
        sessionStorage.setItem('enableSubscription', 'true');
        sessionStorage.setItem('enableSubscriptionVL', 'false');
   }
}
