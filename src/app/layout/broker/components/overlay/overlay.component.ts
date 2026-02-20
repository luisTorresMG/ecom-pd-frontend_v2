import { Component, OnInit, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.css']
})
export class OverlayComponent implements OnInit {
  @Input() visible = false;

  constructor() {}

  ngOnInit() {}
}
