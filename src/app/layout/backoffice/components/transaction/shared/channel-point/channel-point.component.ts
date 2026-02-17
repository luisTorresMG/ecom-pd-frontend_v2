import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { ChannelPointService } from '../../../../services/transaccion/shared/channel-point.service';
import * as SDto from '../../../../services/transaccion/shared/DTOs/channel-point.dto';
import { ChannelDto } from './DTOs/channel-point.dto';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { UtilsService } from '@shared/services/utils/utils.service';
@Component({
  selector: 'app-channel-point',
  templateUrl: './channel-point.component.html',
  styleUrls: ['./channel-point.component.css']
})
export class ChannelPointComponent implements OnInit, OnDestroy {
  FORM_CHANNELS: FormGroup;

  @Output() CANAL_VENTA_DATA_OUT = new EventEmitter<number>();
  CANAL_VENTA_DATA: SDto.CanalVentaDto[];
  @Output() PUNTO_VENTA_DATA_OUT = new EventEmitter<number>();
  PUNTO_VENTA_DATA: SDto.PuntoVentaDto;
  NAME_PUNTO_VENTA = null;
  @Input() OPTIONS_CONF = 'SELECCIONE';
  @Input() clearForm: Observable<any>;
  @Input() data: any;
  IS_ADMIN = false;
  ID_USER_CODE: number;
  IS_BROKER = false;

  admins: Array<number>;

  private subscription: Subscription;

  constructor(
    private readonly _ChannelPointService: ChannelPointService,
    private readonly _FormBuilder: FormBuilder,
    private readonly _utilsService: UtilsService
  ) {
    this.CANAL_VENTA_DATA = [];
    this.PUNTO_VENTA_DATA = {
      PRO_SALE_POINT: [{
        NNUMPOINT: 0,
        SDESCRIPT: ''
      }]
    };
    this.FORM_CHANNELS = this._FormBuilder.group({
      canalVenta: [null],
      puntoVenta: [null]
    });
    this.CanalVentaData();
    this.admins = this._utilsService.adminsBackoffice;
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  ngOnInit(): void {
    const DATA_USER = JSON.parse(localStorage.getItem('currentUser'));
    // tslint:disable-next-line:max-line-length
    if (this.admins.includes(+DATA_USER.profileId)) {
      this.IS_ADMIN = true;
    } else {
      this.IS_ADMIN = false;
    }
    this.ID_USER_CODE = Number(DATA_USER.id);
    this.subscription = this.clearForm?.subscribe((res: boolean) => {
      if (res) {
        this.FORM_CHANNELS.reset();
      }
    });
  }
  CanalVentaData(): void {
    const dataUser = {
      nusercode: Number.parseInt(JSON.parse(localStorage.getItem('currentUser')).id),
      nchannel: 0,
      scliename: ''
    };
    this._ChannelPointService.canalVentaData(dataUser).subscribe(
      (res: SDto.CanalVentaDto[]) => {
        this.CANAL_VENTA_DATA = res;
        const CANAL = Number(JSON.parse(localStorage.getItem('currentUser')).canal);

        if (this.IS_ADMIN === false) {
          const data = {
            nchannel: CANAL
          };
          this.CANAL_VENTA_DATA = this.CANAL_VENTA_DATA.filter(x => x.nchannel === CANAL);
          this.FORM_CHANNELS.get('canalVenta').setValue(CANAL);
          this.changeCanalVentaData(data);
        } else {
          if (res.length === 1) {
            this.FORM_CHANNELS.get('canalVenta').setValue(res[0].nchannel);
            this.CANAL_VENTA_DATA_OUT.emit(res[0].nchannel);
            this.changeCanalVentaData(res[0]);
          } else if (this.IS_ADMIN) {
            this.FORM_CHANNELS.get('canalVenta').setValue(null);
            this.CANAL_VENTA_DATA_OUT.emit(0);
            this.changeCanalVentaData(0);
          }
        }
        if (this.data) {
          this.FORM_CHANNELS.get('canalVenta').setValue(+this.data.channelSale);
          const dataChannel = {
            nchannel: +this.data.channelSale
          };
          this.changeCanalVentaData(dataChannel);
        }
      },
      (err: any) => {
        console.log(err);
      }
    );
  }
  changeCanalVentaData(e): void {
    this.PUNTO_VENTA_DATA.PRO_SALE_POINT = [];
    this.changePuntoVenta(0);
    this.NAME_PUNTO_VENTA = null;
    if (e) {
      this._ChannelPointService.puntoVentaData(e.nchannel).subscribe(
        (res: SDto.PuntoVentaDto) => {
          this.CANAL_VENTA_DATA_OUT.emit(e.nchannel);
          this.PUNTO_VENTA_DATA = res;
          if (res.PRO_SALE_POINT.length === 1) {
            this.NAME_PUNTO_VENTA = res.PRO_SALE_POINT[0].NNUMPOINT;
            this.FORM_CHANNELS.get('puntoVenta').setValue(res.PRO_SALE_POINT[0].NNUMPOINT);
            this.PUNTO_VENTA_DATA_OUT.emit(res.PRO_SALE_POINT[0].NNUMPOINT);
          }
          if (this.data) {
            const pointReq = {
              NNUMPOINT: +this.data.pointSale
            };
            this.FORM_CHANNELS.get('puntoVenta').setValue(+this.data.pointSale);
            this.changePuntoVenta(pointReq);
          }
        },
        (err: any) => {
          console.log(err);
        }
      );
    } else {
      this.CANAL_VENTA_DATA_OUT.emit(0);
      this.PUNTO_VENTA_DATA_OUT.emit(0);
    }
  }
  changePuntoVenta(e): void {
    if (e) {
      this.PUNTO_VENTA_DATA_OUT.emit(e.NNUMPOINT);
      this.NAME_PUNTO_VENTA = e.NNUMPOINT;
    } else {
      this.PUNTO_VENTA_DATA_OUT.emit(0);
      this.NAME_PUNTO_VENTA = null;
    }
  }
}
