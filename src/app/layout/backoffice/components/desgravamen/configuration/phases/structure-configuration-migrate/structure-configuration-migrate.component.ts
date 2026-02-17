import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {fadeAnimation} from 'app/shared/animations/animations';

@Component({
  selector: 'app-structure-configuration-migrate',
  templateUrl: './structure-configuration-migrate.component.html',
  styleUrls: [
    './structure-configuration-migrate.component.sass',
    '../../../shared/styles/style.sass',
  ],
  animations: [fadeAnimation],
})
export class StructureConfigurationMigrateComponent implements OnInit {
  @Output() dataEmitter: EventEmitter<any> = new EventEmitter();

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
