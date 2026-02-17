import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class GlobalEventsManager {
  public showNavBar: EventEmitter<any> = new EventEmitter();
  public hideNavBar: EventEmitter<any> = new EventEmitter();
}
