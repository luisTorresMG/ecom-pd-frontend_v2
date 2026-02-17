import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-recept-asesor',
  templateUrl: './recept-asesor.component.html',
  styleUrls: ['./recept-asesor.component.css'],
})
export class ReceptAsesorComponent implements OnInit {
  @Input() path: string;
  @Input() email: string;
  @Input() message: string;
  @Output() buttonAction: EventEmitter<any> = new EventEmitter<any>();

  constructor(private readonly _router: Router) {
    this.email = 'seguros@protectasecurity.pe';
    this.path = '/';
  }

  ngOnInit(): void {}

  backtoInit() {
    sessionStorage.clear();
    this.buttonAction.emit(true);
    this._router.navigate([this.path]);
  }
}
