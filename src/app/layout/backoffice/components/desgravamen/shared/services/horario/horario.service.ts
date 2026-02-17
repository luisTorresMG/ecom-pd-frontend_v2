import { Injectable } from '@angular/core';

import { AppConfig } from '@root/app.config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient,  HttpParams, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
    deps: [HttpClient]
  })
  export class HorarioService {

    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private url = AppConfig.WSPD_APIAWS;

    constructor(private readonly http: HttpClient) { }

    public getHorasList(): Observable<any> {
       const _params = {};
        return this.http.get(this.url + "/AwsDesgravamen/getHorasList", 
        {
          params: _params,
        });

    }

    public GetBranchList(): Observable<any> {
        const _params = {};
        return this.http.get(this.url + "/AwsDesgravamen/GetBranchList", 
        {
          params: _params,
        });
    }

    public GetDiaList(): Observable<any> {
        const _params = {};
        return this.http.get(this.url + "/AwsDesgravamen/GetDiaList", 
        {
          params: _params,
        });
    }
    public GetHoraList(): Observable<any> {
        const _params = {};
        return this.http.get(this.url + "/AwsDesgravamen/GetHoraList", 
        {
          params: _params,
        });
    }

    public getMinutoList(): Observable<any> {
        const _params = {};
        return this.http.get(this.url + "/AwsDesgravamen/getMinutoList", 
        {
          params: _params,
        });
    }

    public GetProductsList(data): Observable<any> {
        console.log('data: '+data);
        let params = new HttpParams().set("nBranch",data);
        return this.http.get(this.url + "/AwsDesgravamen/GetProductsList", {headers:this.headers,params:params});
      }

    public nuevoHorario(payload: any): Observable<any> {
        payload = {...payload, noBase64: true,};
        const url: string = `${this.url}/AwsDesgravamen/nuevoHorario`;

        return this.http.post(url , payload).pipe(map((response: any) => response.data));
    }  

    public actualizarHorario(payload: any): Observable<any> {
        payload = {...payload, noBase64: true,};
        const url: string = `${this.url}/AwsDesgravamen/actualizarHorario`;

        return this.http.post(url , payload).pipe(map((response: any) => response.data));
    }

    public borrarHorario(payload: any): Observable<any> {

        payload = {...payload, noBase64: true,};
        const url: string = `${this.url}/AwsDesgravamen/borrarHorario`;
        
        return this.http.post(url , payload).pipe(map((response: any) => response.data));
    }  
  }