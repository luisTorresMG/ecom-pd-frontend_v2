import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.css']
})
export class PolicyComponent implements OnInit {

  @Output() closeaction = new EventEmitter();
  constructor(

  ) { }

  ngOnInit(): void {

  }

  onClose() {
    this.closeaction.emit();
  }
}
