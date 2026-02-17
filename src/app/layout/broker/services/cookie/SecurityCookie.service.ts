import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppConfig } from "../../../../app.config";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class SecurityCookieService {

    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }

    public getSecurityCookie(): Observable<any> {
        return this.http.post(this.Url + '/Security/GenerateCookieSecurity', null, {
            headers: this.headers,
            // withCredentials: true
        });
    }
}