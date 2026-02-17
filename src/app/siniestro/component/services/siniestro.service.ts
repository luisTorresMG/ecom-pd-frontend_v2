import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { map } from 'rxjs/operators';

const httpOption = {
    headers: new HttpHeaders({
      "Content-Type": "application/json; charset=utf-8",
      "skip": "true",
    }),
  };


  @Injectable({
    providedIn: "root",
  })

export class siniestroservice {

    //urltoken: string = "https://asbancqa.protectasecurity.pe/BackSiniestroSoat/api/SolSin/GetTokenSin";
     urltoken: string = "https://plataformadigital.protectasecurity.pe/BackSiniestrosoat/api/SolSin/GetTokenSin";  //servidor devmente produc
   // urltoken: string = "https://plataformadigital.protectasecurity.pe/BackSiniestrosoat/api/SolSin/GetTokenSin";
    //urltoken: string = "https://localhost:55764/api/SolSin/GetTokenSin";
    //urlocal: string = "https://asbancqa.protectasecurity.pe/BackSiniestroSoat/api/SiniestroSoat/getlistar";
    //urlocal: string = "https://plataformadigital.protectasecurity.pe/BackSiniestrosoat/api/SiniestroSoat/getlistar"; //servidor devemente
    urlocal: string = "https://plataformadigital.protectasecurity.pe/BackSiniestrosoat/api/SiniestroSoat/getlistar"; //=> produc
    //urlocal: string = "https://localhost:55764/api/SiniestroSoat/getlistar";
    //url: string = "https://plataformadigital.stg.protectasecurity.pe/ApiSiniestros/api/SolSin/RegJira";
    // url: string = "https://plataformadigital.protectasecurity.pe/ApiLeads/api/SolSin/RegJira"; //guardar a jira trabajo
     //url: string = "https://plataformadigital.protectasecurity.pe/ApiTicket/api/SolSin/RegJira"  // ApiProd
    // url: string = "https://plataformadigital.protectasecurity.pe/ApiLeads/api/SolSin/RegJira"; //servidor
     url: string = "https://plataformadigital.protectasecurity.pe/ApiTicket/api/SolSin/RegJira"; //servidor devmente
    urlprueba: string = "https://plataformadigital.protectasecurity.pe/ApiLeads/"
    // urlocal: string = "https://localhost:55764/api/SiniestroSoat/getlistar";

    constructor(private _http: HttpClient) { }

    getToken(data: any): Observable<Response> {
      return this._http.post<Response>(this.urltoken,data, httpOption)
     .pipe(map((res) => {return res;}));
 }


    getListar(recursive: number, token: string): Observable<Response> {
    var  httpOptiontoken = {
        headers: new HttpHeaders({
          "Content-Type": "application/json; charset=utf-8",
          "skip": "true",
          "Authorization": "Bearer " + token,
        }),
      };
      return this._http.get<Response>(this.urlocal + "?recursive=" + recursive, httpOptiontoken)
        .pipe(
          map((res) => {
            return res;
          })
        );
    }

    potreister(data: any, token: string):Observable<Response>{
      var  httpOptiontoken = {
        headers: new HttpHeaders({
          "Content-Type": "application/json; charset=utf-8",
          "skip": "true",
          "Authorization": "Bearer " + token,
        }),
      };
      console.log(data);
      return this._http.post<Response>(this.url, data, httpOptiontoken).pipe(map((res) =>
        {console.log(res); return res}));
    }







}
