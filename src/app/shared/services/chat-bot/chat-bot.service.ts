import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
@Injectable({
  providedIn: 'root'
})
export class ChatBotService {

  constructor(
    private readonly _ApiService: ApiService
  ) { }

  notificationContact(data: any): Observable<any> {
    return this._ApiService.post('VidaIndividual/notificacion/contacto', data);
  }
}
