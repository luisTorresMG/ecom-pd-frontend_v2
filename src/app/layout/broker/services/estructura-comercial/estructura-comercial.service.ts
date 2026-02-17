import { Injectable } from "@angular/core";
import { AppConfig } from "../../../../app.config";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

interface IEstructuraComercialParams {
    SBRANCH: string;
    SPRODUCT: string;
    SDESCRIPTION: string;
    SSTATE: string;
    SUSR_SESSION: string;
}

@Injectable({
    providedIn: "root",
})
export class EstructuraComercialService {
    private readonly urlApi = AppConfig.URL_API_SCTR;

    private headers = new HttpHeaders({'Content-Type': 'application/json'});

    constructor(private http: HttpClient) { }

    public EstructuraComercialList(payload: IEstructuraComercialParams): Observable<any> {
        try {
            const body = JSON.stringify(payload);
            const url = `${this.urlApi}/EstructuraComercial/list`;
            return this.http.post(url, body, {headers: this.headers});
        } catch (error) {
            console.log("error estructura comercial list service: ", error);
            throw error;
        }
    }

    public EstructuraComercialBranches(): Observable<any> {
        try {
            const url = `${this.urlApi}/EstructuraComercial/branches`;
            return this.http.get(url, {headers: this.headers});
        } catch (error) {
            console.log("error estructura comercial branches service: ", error);
            throw error;
        }
    }

    public EstructuraComercialProductsByBranchId(branchId: number): Observable<any> {
        try {
            const url = `${this.urlApi}/EstructuraComercial/products/${branchId}`;
            return this.http.get(url, {headers: this.headers});
        } catch (error) {
            console.log("error estructura comercial products by branch id service: ", error);
            throw error;
        }
    }

    public EstructureComercialIntertype(): Observable<any> {
        try {
            const url = `${this.urlApi}/EstructuraComercial/intertype`;
            return this.http.get(url, {headers: this.headers});
        } catch (error) {
            console.log("error estructura comercial intertypes service: ", error);
            throw error;
        }
    }

    public EstructuraComercialById(id: number): Observable<any> {
        try {
            const url = `${this.urlApi}/EstructuraComercial/${id}`;
            return this.http.get(url, {headers: this.headers});
        } catch (error) {
            console.log("error estructura comercial by id service: ", error);
            throw error;
        }
    }

    public EtructuraComercialCreate(payload: any): Observable<any> {
        try {
            const body = JSON.stringify(payload);
            const url = `${this.urlApi}/EstructuraComercial/create`;
            return this.http.post(url, body, {headers: this.headers});
        } catch (error) {
            console.log("error estructura comercial create service: ", error);
            throw error;
        }
    }

    public EstructuraComercialUpdate(payload: any): Observable<any> {
        try {
            const body = JSON.stringify(payload);
            const url = `${this.urlApi}/EstructuraComercial/update`;
            return this.http.put(url, body, {headers: this.headers});
        } catch (error) {
            console.log("error estructura comercial update service: ", error);
            throw error;
        }
    }

    public EstructuraComercialUpdateDetail(payload: any): Observable<any> {
        try {
            const body = JSON.stringify(payload);
            const url = `${this.urlApi}/EstructuraComercial/updateDetail`;
            return this.http.put(url, body, {headers: this.headers});
        } catch (error) {
            console.log("error estructura comercial update detail service: ", error);
            throw error;
        }   
    }

    public EstructuraComercialDeleteDetail(cabId: number, id: number): Observable<any> {
        try {
            const url = `${this.urlApi}/EstructuraComercial/delete-detail/${cabId}/${id}`;
            return this.http.delete(url, {headers: this.headers});
        } catch (error) {
            console.log("error estructura comercial delete detail service: ", error);
            throw error;
        }
    }

    public EstructuraComercialProfiles(productId: number): Observable<any> {
        try {
            const url = `${this.urlApi}/EstructuraComercial/profiles/${productId}`;
            return this.http.get(url, {headers: this.headers});
        } catch (error) {
            console.log("error estructura comercial profile service: ", error);
            throw error;
        }
    }
}