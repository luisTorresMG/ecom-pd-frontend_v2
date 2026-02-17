import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-redirect-url',
  templateUrl: './redirect-url.component.html',
  styleUrls: ['./redirect-url.component.sass'],
})
export class RedirectUrlComponent implements OnInit {
  constructor(private readonly activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    const params = new URLSearchParams();
    const qparams = this.activatedRoute.snapshot.queryParams;

    if (Object.keys(qparams).length) {
      Object.keys(qparams).forEach((key: string): void => {
        params.set(key, qparams[key]);
      });
    }

    const queryString = params.toString();

    this.activatedRoute.data.subscribe((payload: any) => {
      if (payload.href) {
        window.location.href = payload.href + (queryString ? '?' + queryString : '');
      }
    });
  }
}
