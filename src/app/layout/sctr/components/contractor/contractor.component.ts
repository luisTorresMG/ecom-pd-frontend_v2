import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { Vidaley } from '../../shared/models/vidaley';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { Province } from '../../../../shared/models/province/province';
import { District } from '../../../../shared/models/district/district';
import { Municipality } from '../../../../shared/models/municipality/municipality';
import { Subject } from 'rxjs/Subject';
import { UbigeoService } from '../../../../shared/services/ubigeo/ubigeo.service';
import { finalize } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SessionService } from '../../../soat/shared/services/session.service';
import { GoogleTagManagerService } from '../../shared/services/google-tag-manager.service';

@Component({
  selector: 'app-contractor',
  templateUrl: './contractor.component.html',
  styleUrls: ['./contractor.component.css'],
})
export class ContractorComponent implements OnInit {
  @ViewChild('termsModal')
  content;

  @Input()
  user: Vidaley;

  @Input()
  loading: boolean;

  @Output()
  formSubmitted = new EventEmitter<Vidaley>();

  userForm: FormGroup;
  modalRef: BsModalRef;
  showlockPencil = false;
  setLegalName = false;

  loaders = {
    department: true,
    province: false,
    district: false,
  };

  departments: Province[] = [];
  provinces: District[];
  districts: Municipality[];

  onDepartmentSuccess: Subject<void> = new Subject<void>();
  onProvinceSuccess: Subject<void> = new Subject<void>();
  onDistrictSuccess: Subject<void> = new Subject<void>();

  terms: string[];

  legalUser = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly locationService: UbigeoService,
    private readonly modalService: BsModalService,
    private readonly sessionService: SessionService,
    private readonly googleService: GoogleTagManagerService
  ) { }

  ngOnInit() {
    const departmentId = this.user.department || this.user.userInfo.p_NPROVINCE;
    const provinceId = this.user.province || this.user.userInfo.p_NLOCAT;
    const districtId = this.user.district || this.user.userInfo.p_NMUNICIPALITY;
    this.terms = this.sessionService.getTerms();
    // Validators.pattern(/^[a-zA-Z0-9.ñÑ& ]*$/)
    this.userForm = this.fb.group({

      address: [
        this.user.address || this.user.userInfo.p_SADDRESS,
        [Validators.required],
      ],
      department: [departmentId, [Validators.required]],
      province: [provinceId, [Validators.required]],
      district: [districtId, [Validators.required]],
      phoneNumber: [
        this.user.phoneNumber,
        [Validators.required, Validators.pattern(/^9\d{8}$/)],
      ],
      terms: [this.user.terms, [Validators.requiredTrue]],
    });

    if (!this.validateRucType(this.user.ruc)) {
      this.legalUser = true;
      this.userForm.addControl(
        'businessName',
        new FormControl(this.user.businessName || this.user.userInfo.p_SLEGALNAME,
          [Validators.required, Validators.pattern(/^[a-zA-Z0-9.ñÑ&-, ]*$/)])
      );
    } else {
      const name = this.user.name || this.user.userInfo.p_SCLIENT_NAME;
      const lastName =
        this.user.lastName || this.user.userInfo.p_SCLIENT_APPPAT;
      const surname = this.user.surname || this.user.userInfo.p_SCLIENT_APPMAT;

      // [a-zA-Z ]*$
      this.userForm.addControl(
        'lastName',
        new FormControl(lastName, [Validators.required, Validators.pattern(/^[a-zA-Z ]*$/)])
      );

      this.userForm.addControl(
        'surname',
        new FormControl(surname, [Validators.required, Validators.pattern(/^[a-zA-Z ]*$/)])
      );

      this.userForm.addControl(
        'name',
        new FormControl(name, [Validators.required, Validators.pattern(/^[a-zA-Z ]*$/)])
      );
    }

    // this.userForm.get('businessName').reado ();
    this.setLegalName = true;
    this.showlockPencil = false;
    if (!this.user.lock) {
      this.showlockPencil = true;
      this.setLegalName = false;
      // this.userForm.get('businessName').enable();
    }

    this.getDepartments();
    this.setUserLocation(departmentId, provinceId, districtId);
  }

  setUserLocation(departmentId, provinceId, districtId) {
    this.onDepartmentSuccess.subscribe(() => this.setDepartment(departmentId));

    this.onProvinceSuccess.subscribe(() => {
      const inArray = this.isInArray(provinceId, 'nlocal', this.provinces);

      if (inArray) {
        this.uForm['province'].setValue(Number(provinceId));
        this.onProvinceSelected(provinceId);
      }
    });

    this.onDistrictSuccess.subscribe(() => {
      const inArray = this.isInArray(
        districtId,
        'nmunicipality',
        this.districts
      );

      if (inArray) {
        this.uForm['district'].setValue(Number(districtId));
      }
    });
  }

  setDepartment(departmentId) {
    const inArray = this.isInArray(departmentId, 'nprovince', this.departments);

    if (inArray) {
      this.uForm['department'].setValue(Number(departmentId));
      this.onDepartmentSelected(departmentId);
    }
  }

  get uForm() {
    return this.userForm.controls;
  }

  showError(controlName: string): boolean {
    return (
      this.uForm[controlName].invalid &&
      (this.uForm[controlName].dirty || this.uForm[controlName].touched)
    );
  }

  onDepartmentSelected(nprovince) {
    const filter = <District>{ nprovince, sdescript: '' };
    this.resetForm();

    this.loaders.province = true;
    this.getProvinces(filter);
  }

  onProvinceSelected(nlocal) {
    const filter = <Municipality>{
      nlocal,
      sdescript: '',
    };

    this.loaders.district = true;
    this.uForm['district'].setValue(null);
    this.getDistricts(filter);
  }

  onDistrictSelected(index) {
    const district = this.districts.filter((d) => d.nmunicipality === index);
  }

  getDepartments() {
    this.locationService
      .getPostProvince({ nprovince: '0', sdescript: '' })
      .pipe(finalize(() => (this.loaders.department = false)))
      .subscribe(
        (response: Province[]) => {
          this.departments = response;
          this.onDepartmentSuccess.next();
        },
        () => {
          this.googleService.setGenericErrorEvent(
            'Vida Ley - Paso 2',
            'Listado de departamentos'
          );
        }
      );
  }

  getProvinces(filter: District) {
    this.locationService
      .getPostDistrict(filter)
      .pipe(finalize(() => (this.loaders.province = false)))
      .subscribe(
        (response: District[]) => {
          this.provinces = response;
          this.onProvinceSuccess.next();
        },
        () => {
          this.googleService.setGenericErrorEvent(
            'Vida Ley - Paso 2',
            'Listado de provincias'
          );
        }
      );
  }

  getDistricts(filter: Municipality) {
    this.locationService
      .getPostMunicipality(filter)
      .pipe(finalize(() => (this.loaders.district = false)))
      .subscribe(
        (response: Municipality[]) => {
          this.districts = response;
          this.onDistrictSuccess.next();
        },
        () => {
          this.googleService.setGenericErrorEvent(
            'Vida Ley - Paso 2',
            'Listado de distritos'
          );
        }
      );
  }

  resetForm() {
    this.uForm['province'].setValue(null);
    this.uForm['district'].setValue(null);
  }

  validate() {
    this.userForm.markAllAsTouched();
  }

  onSubmit() {
    this.validate();

    if (this.userForm.valid) {
      const formValues = this.userForm.value;
      this.formSubmitted.emit(formValues);
    }
  }

  showModal() {
    this.modalRef = this.modalService.show(this.content);
  }

  closeTermsModal() {
    this.modalRef.hide();
  }

  isInArray(id: string, key: string, arr: Array<any>) {
    return arr.findIndex((item) => `${item[key]}` === `${id}`) > -1;
  }

  validateRucType(ruc) {
    return /^(10|15|17)(\d{9})$/.test(ruc);
  }
  documentNoExists():boolean{
    return !this.user.userInfo.p_SDOCUMENT;
  }
}
