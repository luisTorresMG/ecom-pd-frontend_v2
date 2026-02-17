import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ISessionAction } from '../../interfaces/session-action.interface';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  constructor() {}

  subject: Subject<any> = new Subject();

  emitSubject(payload: ISessionAction): any {
    this.subject.next(payload);
  }
}
