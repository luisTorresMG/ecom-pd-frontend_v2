import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class VersionCheckService {
  constructor(private http: HttpClient) {
  }

  public initVersionCheck(url, frequency = 1000 * 60 * 30): void {
    setInterval(() => {
      this.checkVersion(url);
    }, frequency);
    this.checkVersion(url);
  }

  private checkVersion(url: string): void {
    this.http.get(`${url}?t=${new Date().getTime()}`).subscribe(
      (response: { version: string; hash: string }): void => {
        const hashChanged: boolean = this.hashHasChanged(response.hash);

        if (hashChanged) {
          localStorage.setItem('pd:hash', response.hash);
          window.location.reload();
        }
      },
      (error: HttpErrorResponse): void => {
        console.error(error, 'Could not get version');
      }
    );
  }

  private hashHasChanged(newHash: string): boolean {
    const currentHash: string = localStorage.getItem('pd:hash') ?? '';
    return currentHash !== newHash;
  }
}
