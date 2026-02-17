import { Component, OnInit, NgZone } from '@angular/core';
@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css'],
})
export class BannerComponent implements OnInit {
  step = 1;

  constructor(private readonly ngZone: NgZone) { }

  ngOnInit() {
    this.ngZone.run(() => {
      setInterval(() => {
        if (this.step < 6) {
          this.step++;
        } else {
          this.step = 1;
        }
      }, 5000);
    });
  }
}
