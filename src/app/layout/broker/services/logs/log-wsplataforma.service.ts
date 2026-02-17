import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../../app.config';

@Injectable({
  providedIn: 'root'
})
export class LogWSPlataformaService {
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private Url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) { }

  public save(text1: string, text2: string, order: number): Observable<any>{
    let body: any = {};
    body.text1 = text1;
    body.text2 = text2;
    body.order = order;
    
    body = JSON.stringify(body);
    return this.http.post<string>(this.Url + "/PolicyManager/LogFrontend", body, { headers: this.headers })
  }
}
