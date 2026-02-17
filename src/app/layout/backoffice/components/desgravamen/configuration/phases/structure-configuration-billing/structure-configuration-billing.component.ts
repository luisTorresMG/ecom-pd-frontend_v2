import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { fadeAnimation } from '@shared/animations/animations';

@Component({
  selector: 'app-structure-configuration-billing',
  templateUrl: './structure-configuration-billing.component.html',
  styleUrls: [
    './structure-configuration-billing.component.sass',
    '../../../shared/styles/style.sass',
  ],
  animations: [fadeAnimation],
})
export class StructureConfigurationBillingComponent implements OnInit {
  @Output() dataEmitter: EventEmitter<any> = new EventEmitter<any>();

  dropdownSelected: 'notifications' = 'notifications';

  constructor() {
  }

  ngOnInit(): void {
  }

  set selectDropdown(value: string) {
    if (this.dropdownSelected == value) {
      this.dropdownSelected = undefined;
      return;
    }

    this.dropdownSelected = value as any;
  }

  emitValues(event: any): void {
    this.dataEmitter.emit({
      isValidForm: !!event?.isValidForm,
      notifications: event
    });
  }
}
