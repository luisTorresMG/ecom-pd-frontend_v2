import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../../app.config';
import { Step2Request, Step2Response } from '../../models/step2.model';
import { SlipRequest } from '../../models/slip.model';
import { ParametersResponse } from '../../models/parameters.model';
import { map } from 'rxjs/operators';
@Injectable({
    providedIn: 'root',
})
export class Step2Service {
    API_URI: string;
    constructor(private readonly _http: HttpClient) {
        this.API_URI = AppConfig.PD_API;
    }
    tipoPlan(): Observable<any> {
        const URL = `${this.API_URI}/`;
        const GET$ = this._http.get(URL);
        const DATA$: Observable<any> = new Observable((obs) => {
            GET$.subscribe(
                (res: any) => {
                    obs.next(res);
                    obs.complete();
                },
                (err: any) => {
                    obs.error(err);
                }
            );
        });
        return DATA$;
    }
    addBeneficiario(data: any): Observable<any> {
        const URL = `${this.API_URI}/`;
        const POST$ = this._http.post(URL, data);
        const DATA$: Observable<any> = new Observable((obs) => {
            POST$.subscribe(
                (res: any) => {
                    obs.next(res);
                    obs.complete();
                },
                (err: any) => {
                    obs.error(err);
                }
            );
        });
        return DATA$;
    }
    step2Complete(data: Step2Request): Observable<Step2Response> {
        const URL = `${this.API_URI}/VidaIndividual/cotizacion`;
        const POST$ = this._http.post(URL, data);
        const DATA$: Observable<Step2Response> = new Observable((obs) => {
            POST$.subscribe(
                (res: Step2Response) => {
                    obs.next(res);
                    obs.complete();
                },
                (err: any) => {
                    obs.error(err);
                }
            );
        });
        return DATA$;
    }
    getLocation(data: any, type: string): Observable<any> {
        const URL = `${this.API_URI}/${type}`;
        const dataToBase64: any = {
            data: btoa(JSON.stringify(data)),
        };
        const POST$ = this._http.post(URL, dataToBase64);
        const DATA$: Observable<any> = new Observable((obs) => {
            POST$.subscribe(
                (res: any) => {
                    obs.next(res);
                    obs.complete();
                },
                (err: any) => {
                    obs.error(err);
                }
            );
        });
        return DATA$;
    }
    getCountries() {
        const url = `${this.API_URI}/AccidentesPersonales/Paises`;
        const call = this._http.get(url);
        return call.pipe(map((res) => res));
    }
    getParameters(): Observable<ParametersResponse> {
        const URL = `${this.API_URI}/VidaIndividual/parametros`;
        const GET$ = this._http.get(URL);
        const DATA$: Observable<ParametersResponse> = new Observable((obs) => {
            GET$.subscribe(
                (res: ParametersResponse) => {
                    obs.next(res);
                    obs.complete();
                },
                (err: any) => {
                    obs.error(err);
                }
            );
        });
        return DATA$;
    }
    sendSlip(data: any, type: number): Observable<any> {
        let url = ``;
        switch (type) {
            case 1: {
                url = `${this.API_URI}/VidaIndividual/slip`;
                break;
            }
            case 2: {
                url = `${this.API_URI}/VidaIndividual/slip/pdf`;
                break;
            }
            case 3: {
                url = `${this.API_URI}/VidaIndividual/slip/registro`;
                break;
            }
        }
        const call = this._http.post(url, data, { observe: 'response' });
        const data$ = new Observable((obs) => {
            call.subscribe(
                (res: any) => {
                    obs.next(res);
                    obs.complete();
                },
                (err: any) => {
                    obs.error(err);
                }
            );
        });
        return data$;
    }
}
