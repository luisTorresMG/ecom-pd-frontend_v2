import * as CryptoJS from "crypto-js";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class CryptoService {
    private nKey = CryptoJS.enc.Utf8.parse(environment.aesKey);
    private nIv = CryptoJS.enc.Utf8.parse(environment.aesIV);

    encrypt(obj: any): string {
        const json = JSON.stringify(obj);
        const encrypted = CryptoJS.AES.encrypt(json, this.nKey, {
            iv: this.nIv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return encrypted.toString();
    }

    decrypt(encryptedBase64: string): any {
        const decrypted = CryptoJS.AES.decrypt(encryptedBase64, this.nKey, {
            iv: this.nIv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
        return JSON.parse(plaintext);
    }
}