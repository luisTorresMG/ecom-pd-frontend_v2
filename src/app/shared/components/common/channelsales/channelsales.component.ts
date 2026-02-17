import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ChannelSalesService } from '../../../services/channelsales/channelsales.service';
import { ChannelSales } from '../../../models/channelsales/channelsales';

@Component({
  selector: 'app-channelsales',
  templateUrl: './channelsales.component.html',
  styleUrls: ['./channelsales.component.css']
})
export class ChannelsalesComponent implements OnInit {
  @Output() evResultChannelSales = new EventEmitter<number>();
  ResultChannelSales = 0;
  mensaje: string;
  ListChannelSaless: any[];
  channelSales: ChannelSales;
  constructor(private usoService: ChannelSalesService) { }

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const nusercode = currentUser && currentUser.id;
    this.channelSales = new ChannelSales(nusercode, '0', '');
    this.usoService.getPostChannelSales(this.channelSales)
      .subscribe(
        data => {
          this.ListChannelSaless = <any[]>data;
        },
        error => {
          console.log(error);
        }
      );
  }

  throwChannelSales(resultChannelSales: number) {
    this.evResultChannelSales.emit(resultChannelSales);
  }

  onSelectChannelSales(channelSalesId) {
    this.ResultChannelSales = channelSalesId;
    this.throwChannelSales(channelSalesId);
  }

}
