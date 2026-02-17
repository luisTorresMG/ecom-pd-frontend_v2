import { Component, OnInit, OnDestroy, Input, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-pixel-digilant',
  templateUrl: './pixel-digilant.component.html',
  styleUrls: ['./pixel-digilant.component.css']
})
export class PixelDigilantComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input()
  pageName: string;

  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() { }

  ngAfterViewInit() {
  }
}
