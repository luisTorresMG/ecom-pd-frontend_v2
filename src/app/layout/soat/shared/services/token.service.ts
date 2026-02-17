import { Injectable } from '@angular/core';
import { VehiculoService } from '../../../client/shared/services/vehiculo.service';
import { of } from 'rxjs/internal/observable/of';
import { Observable } from 'rxjs/Observable';

const HOUR = 10 * 1000;

interface Token {
  token: string;
  expDate: number;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  expTime = 60;

  constructor(private readonly carService: VehiculoService) { }

  getToken(): Observable<Token> {
    return this.generateToken();
  }

  generateToken() {
    return this.carService
      .LeerArchivo()
      .map(response => this.setToken(response));
  }

  private setToken(payload): Token {
    if (!payload.sequence) {
      throw new Error('cannot set token');
    }
    const expDate = new Date().getTime() + HOUR;
    const token = { token: payload.sequence, expDate };

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    localStorage.setItem('currentUser', JSON.stringify({
      ...currentUser,
      ...token
    }));

    sessionStorage.setItem(
      'terms',
      JSON.stringify([
        payload.texto1,
        payload.texto2,
        payload.texto3,
        payload.texto4,
        payload.texto5
      ])
    );

    return token;
  }
}
