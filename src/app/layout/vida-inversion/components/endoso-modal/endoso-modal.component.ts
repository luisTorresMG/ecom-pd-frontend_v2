import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-endoso-modal',
  templateUrl: './endoso-modal.component.html',
  styleUrls: ['./endoso-modal.component.scss']
})
export class EndosoModalComponent implements OnInit {
  @Input() public reference: any;
  constructor(

  ) { }

  ngOnInit(): void {}
}
