import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { UtilsService } from '@shared/services/utils/utils.service';
// tslint:disable-next-line:max-line-length
import { IDepartamentoModel, IDistritoModel, INacionalidadModel, IProvinciaModel, ParametersResponse } from '../../models/ubigeo/parameters.model';
// tslint:disable-next-line:interface-over-type-literal
type TLocations = {
  country: number,
  department: number,
  province: number,
  district
};
@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent implements OnInit {

  @Input() showCountries: boolean;
  @Input() set enableForm(val: boolean) {
    if (val) {
      this.form.enable();
    } else {
      this.form.disable();
    }
  }
  @Input() data: any;
  @Output() locations: EventEmitter<TLocations>;

  form: FormGroup;

  countries$: Array<INacionalidadModel>;
  departments$: Array<IDepartamentoModel>;
  provinces$: Array<IProvinciaModel>;
  districts$: Array<IDistritoModel>;

  constructor(
    private readonly _utilsService: UtilsService,
    private readonly _builder: FormBuilder
  ) {
    this.countries$ = [];
    this.departments$ = [];
    this.provinces$ = [];
    this.districts$ = [];

    this.locations = new EventEmitter<TLocations>();
    this.form = this._builder.group({
      country: [null],
      department: [null],
      province: [null],
      district: [null]
    });
  }

  ngOnInit(): void {
    this._utilsService.parameters().subscribe(
      (res: ParametersResponse) => {
        this.countries$ = res.nacionalidades;
        this.departments$ = res.ubigeos;
        if (this.data) {
          this.form.patchValue(this.data, {
            emitEvent: false
          });
          this.changeDepartment = this.data.department;
          this.changeProvince = this.data.province;
        }
        this.formChanges();
      },
      (err: any) => {
        console.error(err);
      }
    );

  }
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }
  formChanges(): void {
    this.f['department'].valueChanges.subscribe((val: string) => {
      this.f['province'].setValue(null);
      this.f['district'].setValue(null);
      this.changeDepartment = val;
    });
    this.f['province'].valueChanges.subscribe((val: string) => {
      this.f['district'].setValue(null);
      this.changeProvince = val;
    });
    this.form.valueChanges.subscribe((data: any) => {
      this.locations.emit(data);
    });
  }
  private set changeDepartment(val: any) {
    if (val) {
      this.provinces$ = [];
      this.provinces$ = this.departments$?.find(x => +x.id == +val)?.provincias;
    }
  }
  private set changeProvince(val) {
    if (val) {
      this.districts$ = [];
      this.districts$ = this.provinces$?.find(x => +x.idProvincia == +val)?.distritos;
    }
  }
}
