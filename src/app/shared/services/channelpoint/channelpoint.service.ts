import { Injectable } from '@angular/core';
import { ConfigService } from '../general/config.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ChannelPoint } from '../../models/channelpoint/channelpoint';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class ChannelPointService {

  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  list: any = [];
  _baseUrl = '';

  constructor(private http: HttpClient,
    private configService: ConfigService
  ) {
    this._baseUrl = configService.getWebApiURL();
  }

  getPostChannelPoint(channelPoint: ChannelPoint) {
    const body = JSON.stringify(channelPoint);
    return this.http.post(this._baseUrl + '/ChannelPoint/', body, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        },
      );
  }
}
