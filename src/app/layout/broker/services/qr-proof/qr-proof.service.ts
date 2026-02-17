import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../../app.config';

@Injectable({
  providedIn: 'root'
})
export class QrProofService {
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private Url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) { }

  public getProof(data: any): Observable<any>{
    const body = JSON.stringify(data);
    return this.http.post<string>(this.Url + "/PolicyManager/getProof", body, { headers: this.headers })
  }
  
}
