import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from '../../../../../node_modules/rxjs';

@Injectable()
export class SidebarService {
  private node: Subject<boolean> = new BehaviorSubject<boolean>(false);
  node$ = this.node.asObservable();

  announceSidebar(display: boolean) {
    this.node.next(display);
  }

  close() {
    this.node.next(false);
  }

}
