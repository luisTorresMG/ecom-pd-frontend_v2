import { Injectable } from '@angular/core';
import {HttpInterceptor, HttpRequest,HttpHandler,HttpEvent,HttpResponse} from '@angular/common/http';

import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import { CryptoService } from '../services/crypto.service';
import { ENCRYPTED_ENDPOINTS } from '../config/encrypted-endpoints';
import { environment } from '../../environments/environment';

// Interceptor para encriptar y desencriptar peticiones HTTP
@Injectable()
export class EncryptionInterceptor implements HttpInterceptor {

    constructor(private crypto: CryptoService){}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const shouldEncrypt = ENCRYPTED_ENDPOINTS.some(path => req.url.includes(path));
    let modifiedReq = req;

    if (environment.useEncryption && shouldEncrypt && req.body) {
        if (req.body instanceof FormData) {
            const formData = req.body as FormData;

            // Suponemos que el objeto está en un campo llamado 'objeto'
            // const objetoOriginal = formData.get('objeto') as string;

            // if (objetoOriginal) {
                // const objetoEncrypted = this.crypto.encrypt(JSON.parse(objetoOriginal));
                const newFormData = new FormData();

                // Copiar todos los campos originales excepto 'objeto'
                formData.forEach((value, key) => {
                    const objEncrypted = this.crypto.encrypt(JSON.parse((value as string)));
                    // if (key !== 'objeto') {
                        newFormData.append(key, objEncrypted);
                    // }
                });

                // Agregar el objeto encriptado
                // newFormData.append('objeto', objetoEncrypted);

                modifiedReq = req.clone({
                    body: newFormData
                });
            // }
        } else {
            // Body JSON normal
            const encrypted = this.crypto.encrypt(req.body);
            modifiedReq = req.clone({
                body: { data: encrypted }
            });
        }
    }

    return next.handle(modifiedReq).pipe(
        map(event => {
            if (shouldEncrypt && event instanceof HttpResponse && event.body?.data && environment.useEncryption) {
                try {
                    const decrypted = this.crypto.decrypt(event.body.data);
                    return event.clone({ body: decrypted });
                } catch {
                    return event;
                }
            }
            return event;
        })
    );
    }
}
