import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { ChannelPointService } from '../../../services/channelpoint/channelpoint.service';
import { ChannelSalesService } from '../../../services/channelsales/channelsales.service';
import { ChannelPoint } from '../../../models/channelpoint/channelpoint';
import { ChannelSales } from '../../../models/channelsales/channelsales';
import { isNullOrUndefined } from 'util';
import { AppConfig } from '../../../../app.config';
@Component({
  selector: 'app-channelpoint',
  templateUrl: './channelpoint.component.html',
  styleUrls: ['./channelpoint.component.css']
})
export class ChannelpointComponent implements OnInit {
  @Output() evResultChannelSales = new EventEmitter<number>();
  ResultChannelSales = 0;
  @Output() evResultChannelPoint = new EventEmitter<number>();
  ResultChannelPoint = 0;
  resultdecv = '';
  @Input() myInput;

  mensaje: string;
  ListChannelSales: any[];
  ListChannelPoint: any[];
  channelPoint = new ChannelPoint('', 0);
  channelSales: ChannelSales;
  nusercode = 0;
  canal = '';
  indpuntoVenta = 0;
  channelSalesIdSelected: any;
  salesPointIdSelected: any;

  constructor(private channelPointService: ChannelPointService, private channelSalesService: ChannelSalesService) { }

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.nusercode = currentUser && currentUser.id;
    this.canal = currentUser && currentUser.canal;
    this.indpuntoVenta = currentUser && currentUser.indpuntoVenta;
    this.channelSales = new ChannelSales(this.nusercode, '0', '');

    const isAdmin = localStorage.getItem(AppConfig.PROFILE_ADMIN_GUID);
    if (isAdmin === '1') {
      const canal = JSON.parse(localStorage.getItem(AppConfig.PROFILE_ADMIN_STORE));
      if (canal === null) {
        this.getPostChannelSales();
      } else {
        this.ListChannelSales = [];
        this.ListChannelSales.push(canal);
        this.channelSalesIdSelected = canal.nchannel;
        this.onSelectChannelSales(this.channelSalesIdSelected);
      }
    } else {
      this.getPostChannelSales();
    }
  }

  getPostChannelSales(): void {
    this.channelSalesService.getPostChannelSales(this.channelSales)
      .subscribe(
        data => {
          this.ListChannelSales = <any[]>data;
          if (this.ListChannelSales.length > 0) {
            this.channelSalesIdSelected = this.ListChannelSales[0].nchannel;
            this.onSelectChannelSales(this.channelSalesIdSelected);
          }

        },
        error => {
          console.log(error);
        }
      );
  }

  onSelectChannelSales(channelSalesId) {
    this.throwChannelSales(channelSalesId);
    if (channelSalesId === '0') {
      this.ListChannelPoint = [];
      this.throwChannelPoint(channelSalesId);
    } else {
      const salePoint = new ChannelPoint(channelSalesId, this.indpuntoVenta);
      this.channelPointService.getPostChannelPoint(salePoint)
        .subscribe(
          data => {
            this.ListChannelPoint = <any[]>data;
            if (this.ListChannelPoint.length > 0) {
              this.salesPointIdSelected = this.ListChannelPoint[0].nnumpoint;
              if (this.ListChannelPoint.length > 1) {
                const all = {
                  nnumpoint: '',
                  sdescript: 'TODOS'
                };
                this.ListChannelPoint = [all].concat(this.ListChannelPoint);
                if (!isNullOrUndefined(this.myInput) && this.myInput) {
                  this.salesPointIdSelected = this.ListChannelPoint[0].nnumpoint;
                }
              }
              this.onSelectChannelPoint(this.salesPointIdSelected);
            }
          },
          error => {
            console.log(error);
          }
        );
    }
  }

  throwChannelSales(resultChannelSales: number) {
    this.evResultChannelSales.emit(resultChannelSales);
  }


  throwChannelPoint(resultChannelPoint: number) {
    this.evResultChannelPoint.emit(resultChannelPoint);
  }

  onSelectChannelPoint(channelPointId) {
    // console.log(channelPointId);
    this.ResultChannelPoint = channelPointId;
    this.throwChannelPoint(channelPointId);
  }

}
