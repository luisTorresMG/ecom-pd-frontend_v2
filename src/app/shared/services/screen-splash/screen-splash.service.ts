import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScreenSplashService {
  showSubject: Subject<boolean> = new Subject<boolean>();
  messageSubject: Subject<string> = new Subject<string>();

  private timeoutId: any;

  constructor() {}

  show(message: string = 'Espere un momento...'): void {
    this.showSubject.next(true);
    this.messageSubject.next(message);

    const dom = document.getElementById('html-document');
    if (dom) {
      dom.style.overflow = 'hidden';
    }

    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      message = 'Espere un momento por favor...';

      this.messageSubject.next(message);
    }, 3500);
  }

  hide(): void {
    this.showSubject.next(false);

    const dom = document.getElementById('html-document');
    if (dom) {
      dom.style.overflow = 'auto';
    }

    clearTimeout(this.timeoutId);
  }
}
